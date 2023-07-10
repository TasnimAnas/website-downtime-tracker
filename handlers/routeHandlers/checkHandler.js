/*
 * Title:
 * Description:
 * Author: Tasnim Anas
 * Date:
 *
 */
// dependencies

const { createRandomString, JSONparse } = require('../../helpers/utilities');
const { checkIdLength } = require('../../helpers/environments');
const { maxChecks } = require('../../helpers/environments');
const data = require('../../lib/data');
const { _token } = require('./tokenHandler');

// app object
const routeHandler = {};
// configuration
routeHandler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'put', 'post', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) >= 0) {
        routeHandler._check[`${requestProperties.method}`](requestProperties, callback);
    } else {
        callback(400, { msg: 'Method not supported' });
    }
};
routeHandler._check = {};
routeHandler._check.post = (requestProperties, callback) => {
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
        ['http', 'https'].indexOf(requestProperties.body.protocol) >= 0
            ? requestProperties.body.protocol.trim()
            : false;
    const url =
        typeof requestProperties.body.url === 'string' &&
        requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url.trim()
            : false;
    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
        requestProperties.body.successCodes instanceof Array &&
        requestProperties.body.successCodes.length > 0
            ? requestProperties.body.successCodes
            : false;
    const methods =
        typeof requestProperties.body.methods === 'string' &&
        ['GET', 'PUT', 'DELETE', 'POST'].indexOf(requestProperties.body.methods) >= 0
            ? requestProperties.body.methods
            : false;
    const timeOutSec =
        typeof requestProperties.body.timeOutSec === 'number' &&
        requestProperties.body.timeOutSec > 0
            ? requestProperties.body.timeOutSec
            : false;
    if (protocol && url && successCodes && methods && timeOutSec) {
        const tokenId =
            typeof requestProperties.headerObject.token === 'string' &&
            requestProperties.headerObject.token.trim().length > 0
                ? requestProperties.headerObject.token.trim()
                : false;
        if (tokenId) {
            data.readFile('tokens', tokenId, (err, tokenData) => {
                if (!err && tokenData) {
                    const tokenObject = JSONparse(tokenData);
                    _token.verify(tokenObject.id, tokenObject.phone, (tokenStatus) => {
                        if (tokenStatus) {
                            const user = tokenObject.phone;
                            data.readFile('users', user, (err2, userData) => {
                                if (!err2 && userData) {
                                    const userObject = JSONparse(userData);
                                    const userChecks =
                                        typeof userObject.checks === 'object' &&
                                        userObject.checks instanceof Array
                                            ? userObject.checks
                                            : [];
                                    if (userChecks.length < maxChecks) {
                                        const checkId = createRandomString(checkIdLength);
                                        const checkObject = {
                                            checkId,
                                            user,
                                            protocol,
                                            url,
                                            successCodes,
                                            methods,
                                            timeOutSec,
                                        };
                                        userChecks.push(checkId);
                                        userObject.checks = userChecks;
                                        data.update('users', user, userObject, (err4) => {
                                            if (!err4) {
                                                data.create(
                                                    'checks',
                                                    checkId,
                                                    checkObject,
                                                    (err5) => {
                                                        if (!err5) {
                                                            callback(200, {
                                                                message: 'Check created',
                                                            });
                                                        } else {
                                                            callback(500, {
                                                                error: "Can't create check",
                                                            });
                                                        }
                                                    }
                                                );
                                            } else {
                                                callback(500, { error: "Can't create check" });
                                            }
                                        });
                                    } else {
                                        callback(400, {
                                            error: `User already have ${maxChecks} checks`,
                                        });
                                    }
                                } else {
                                    callback(500, { error: "Can't find user" });
                                }
                            });
                        } else {
                            callback(403, { error: 'Authentication failed' });
                        }
                    });
                } else {
                    callback(500, { error: 'Problem with the token' });
                }
            });
        } else {
            callback(400, { error: 'Token missing' });
        }
    } else {
        callback(400, { error: 'Provide all data' });
    }
};
routeHandler._check.get = (requestProperties, callback) => {
    const checkId =
        typeof requestProperties.queryObject.checkId === 'string' &&
        requestProperties.queryObject.checkId.length > 0
            ? requestProperties.queryObject.checkId
            : false;
    if (checkId) {
        const tokenId =
            typeof requestProperties.headerObject.token === 'string' &&
            requestProperties.headerObject.token.trim().length > 0
                ? requestProperties.headerObject.token.trim()
                : false;
        if (tokenId) {
            data.readFile('checks', checkId, (err, checkData) => {
                if (!err && checkData) {
                    const checkObject = JSONparse(checkData);
                    _token.verify(tokenId, checkObject.user, (tokenStatus) => {
                        if (tokenStatus) {
                            callback(200, checkObject);
                        } else {
                            callback(403, { error: 'Authentication error' });
                        }
                    });
                } else {
                    callback(400, { error: 'token not found' });
                }
            });
        } else {
            callback(400, { error: 'token not found' });
        }
    } else {
        callback(400, { error: 'invalid check id' });
    }
};
routeHandler._check.put = (requestProperties, callback) => {
    const checkId =
        typeof requestProperties.body.checkId === 'string' &&
        requestProperties.body.checkId.length > 0
            ? requestProperties.body.checkId
            : false;
    if (checkId) {
        const protocol =
            typeof requestProperties.body.protocol === 'string' &&
            ['http', 'https'].indexOf(requestProperties.body.protocol) >= 0
                ? requestProperties.body.protocol.trim()
                : false;
        const successCodes =
            typeof requestProperties.body.successCodes === 'object' &&
            requestProperties.body.successCodes instanceof Array &&
            requestProperties.body.successCodes.length > 0
                ? requestProperties.body.successCodes
                : false;
        const methods =
            typeof requestProperties.body.methods === 'string' &&
            ['GET', 'PUT', 'DELETE', 'POST'].indexOf(requestProperties.body.methods) >= 0
                ? requestProperties.body.methods
                : false;
        const timeOutSec =
            typeof requestProperties.body.timeOutSec === 'number' &&
            requestProperties.body.timeOutSec > 0
                ? requestProperties.body.timeOutSec
                : false;
        if (protocol || successCodes || methods || timeOutSec) {
            const tokenId =
                typeof requestProperties.headerObject.token === 'string' &&
                requestProperties.headerObject.token.trim().length > 0
                    ? requestProperties.headerObject.token.trim()
                    : false;
            if (tokenId) {
                data.readFile('tokens', tokenId, (err, tokenData) => {
                    if (!err && tokenData) {
                        const tokenObject = JSONparse(tokenData);
                        _token.verify(tokenObject.id, tokenObject.phone, (tokenStatus) => {
                            if (tokenStatus) {
                                data.readFile('checks', checkId, (err1, checkData) => {
                                    if (!err1 && checkData) {
                                        const checkObject = JSONparse(checkData);
                                        if (protocol) checkObject.protocol = protocol;
                                        if (successCodes) checkObject.successCodes = successCodes;
                                        if (methods) checkObject.methods = methods;
                                        if (timeOutSec) checkObject.timeOutSec = timeOutSec;
                                        data.update('checks', checkId, checkObject, (err2) => {
                                            if (!err2) {
                                                callback(200, { message: 'check updated' });
                                            } else {
                                                callback(500, {
                                                    error: 'Error updating the check',
                                                });
                                            }
                                        });
                                    } else {
                                        callback(500, { error: 'Check id does not exist' });
                                    }
                                });
                            } else {
                                callback(403, { error: 'Authentication failed' });
                            }
                        });
                    } else {
                        callback(500, { error: 'Problem with the token' });
                    }
                });
            } else {
                callback(400, { error: 'Token missing' });
            }
        } else {
            callback(400, { error: 'Provide any data to update' });
        }
    } else {
        callback(400, { error: 'Provide checkId' });
    }
};
routeHandler._check.delete = (requestProperties, callback) => {
    const checkId =
        typeof requestProperties.body.checkId === 'string' &&
        requestProperties.body.checkId.length > 0
            ? requestProperties.body.checkId
            : false;
    if (checkId) {
        const tokenId =
            typeof requestProperties.headerObject.token === 'string' &&
            requestProperties.headerObject.token.trim().length > 0
                ? requestProperties.headerObject.token.trim()
                : false;
        if (tokenId) {
            data.readFile('checks', checkId, (err, checkData) => {
                if (!err && checkData) {
                    const checkObject = JSONparse(checkData);
                    _token.verify(tokenId, checkObject.user, (tokenStatus) => {
                        if (tokenStatus) {
                            data.readFile('users', checkObject.user, (err2, userData) => {
                                if (!err2 && userData) {
                                    const userObject = JSONparse(userData);
                                    const userChecks =
                                        typeof userObject.checks === 'object' &&
                                        userObject.checks instanceof Array
                                            ? userObject.checks
                                            : [];
                                    const checkIndex = userChecks.indexOf(checkId);
                                    if (checkIndex >= 0) {
                                        userChecks.splice(checkIndex, 1);
                                        userObject.checks = userChecks;
                                        data.update(
                                            'users',
                                            checkObject.user,
                                            userObject,
                                            (err3) => {
                                                if (!err3) {
                                                    data.delete('checks', checkId, (err1) => {
                                                        if (!err1) {
                                                            callback(200, {
                                                                message: 'Check Deleted',
                                                            });
                                                        } else {
                                                            callback(500, {
                                                                error: 'Error deleting the check',
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    callback(500, {
                                                        error: 'Error deleting the check from user data',
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        callback(400, {
                                            error: 'Check is not of current user',
                                        });
                                    }
                                } else {
                                    callback(500, {
                                        error: 'Error getting user data',
                                    });
                                }
                            });
                        } else {
                            callback(403, { error: 'Authentication error' });
                        }
                    });
                } else {
                    callback(400, { error: 'check not found' });
                }
            });
        } else {
            callback(400, { error: 'token not found' });
        }
    } else {
        callback(400, { error: 'invalid check id' });
    }
};

// export module
module.exports = routeHandler;
