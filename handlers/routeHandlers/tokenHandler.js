/*
 * Title:
 * Description:
 * Author: Tasnim Anas
 * Date:
 *
 */
// dependencies
const { JSONparse, createRandomString } = require('../../helpers/utilities');
const { hash } = require('../../helpers/utilities');
const data = require('../../lib/data');
const { tokenLength } = require('../../helpers/environments');
// app object
const routeHandler = {};

// configuration
routeHandler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        routeHandler._token[`${requestProperties.method}`](requestProperties, callback);
    } else {
        callback(500, {
            error: 'Method not supported',
        });
    }
};

routeHandler._token = {};
routeHandler._token.post = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length >= 10
            ? requestProperties.body.phone.trim()
            : false;
    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.length >= 8
            ? requestProperties.body.password
            : false;
    if (phone && password) {
        data.readFile('users', phone, (err, u) => {
            if (!err && u) {
                const user = JSONparse(u);
                if (hash(password) === user.password) {
                    const tokenId = createRandomString(tokenLength);
                    const expires = 7 * 24 * 60 * 60 * 1000 + Date.now();
                    const tokenObject = {
                        phone,
                        id: tokenId,
                        expires,
                    };
                    data.create('tokens', tokenId, tokenObject, (err1) => {
                        if (!err1) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, { error: 'server error' });
                        }
                    });
                } else {
                    callback(400, { error: 'Wrong password' });
                }
            } else {
                callback(400, { error: 'User not found' });
            }
        });
    } else {
        callback(400, { error: 'Enter phone and password' });
    }
};
routeHandler._token.get = (requestProperties, callback) => {
    const tokenId =
        typeof requestProperties.queryObject.token === 'string' &&
        requestProperties.queryObject.token.length === tokenLength
            ? requestProperties.queryObject.token
            : false;
    if (tokenId) {
        data.readFile('tokens', tokenId, (err, token) => {
            if (!err && token) {
                callback(200, JSONparse(token));
            } else {
                callback(500, { error: 'unknown token' });
            }
        });
    } else {
        callback(400, { error: 'Invalid token' });
    }
};
routeHandler._token.put = (requestProperties, callback) => {
    const token =
        typeof requestProperties.body.token === 'string' &&
        requestProperties.body.token.trim().length === tokenLength
            ? requestProperties.body.token.trim()
            : false;
    const extend =
        typeof requestProperties.body.extend === 'boolean' ? requestProperties.body.extend : false;
    if (token && extend) {
        data.readFile('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                const tokenObject = JSONparse(tokenData);
                if (tokenObject.expires > Date.now()) {
                    tokenObject.expires = 7 * 24 * 60 * 60 * 1000 + Date.now();
                    data.update('tokens', token, tokenObject, (err1) => {
                        if (!err1) {
                            callback(200, { message: 'Token updated' });
                        } else {
                            callback(500, { error: 'Server error' });
                        }
                    });
                } else {
                    callback(400, { error: 'Token already expired' });
                }
            } else {
                callback(400, { error: 'Unknown token' });
            }
        });
    } else {
        callback(400, { error: 'Problem in request' });
    }
};
routeHandler._token.delete = (requestProperties, callback) => {
    const tokenId =
        typeof requestProperties.queryObject.token === 'string' &&
        requestProperties.queryObject.token.length === tokenLength
            ? requestProperties.queryObject.token
            : false;
    if (tokenId) {
        data.delete('tokens', tokenId, (err) => {
            if (!err) {
                callback(200, { message: 'Token deleted' });
            } else {
                callback(500, { error: 'Token not found' });
            }
        });
    } else {
        callback(400, { error: 'Unknown token' });
    }
};

routeHandler._token.verify = (id, phone, callback) => {
    const tokenId = typeof id === 'string' && id.length === tokenLength ? id : false;
    data.readFile('tokens', tokenId, (err, tokenData) => {
        if (!err && tokenData) {
            const tokenObject = JSONparse(tokenData);
            if (tokenObject.phone === phone && tokenObject.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// export module
module.exports = routeHandler;
