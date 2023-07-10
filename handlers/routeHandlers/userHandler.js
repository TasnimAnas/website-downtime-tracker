/*
 * Title:
 * Description:
 * Author: Tasnim Anas
 * Date:
 *
 */
// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { JSONparse } = require('../../helpers/utilities');
const { _token } = require('./tokenHandler');
const { tokenLength } = require('../../helpers/environments');
// app object
const routeHandler = {};

// configuration

routeHandler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        routeHandler._user[`${requestProperties.method}`](requestProperties, callback);
    } else {
        callback(405);
    }
};

routeHandler._user = {};
routeHandler._user.get = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.queryObject.phone === 'string' &&
        requestProperties.queryObject.phone.trim().length === 10
            ? requestProperties.queryObject.phone
            : false;
    if (phone) {
        const token =
            typeof requestProperties.headerObject.token === 'string' &&
            requestProperties.headerObject.token.trim().length === tokenLength
                ? requestProperties.headerObject.token.trim()
                : false;
        _token.verify(token, phone, (tokenStatus) => {
            if (tokenStatus) {
                data.readFile('users', phone, (err, ret) => {
                    if (ret && !err) {
                        const sendingUser = JSONparse(ret);
                        delete sendingUser.password;
                        callback(200, sendingUser);
                    } else {
                        callback(404, {
                            error: 'User not found',
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication failed',
                });
            }
        });
    } else {
        callback(404, {
            error: 'User not found',
        });
    }
};
routeHandler._user.post = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;
    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;
    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 10
            ? requestProperties.body.phone
            : false;
    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.length >= 8
            ? requestProperties.body.password
            : false;
    const tosAgreement =
        typeof requestProperties.body.tosAgreement === 'boolean'
            ? requestProperties.body.tosAgreement
            : false;
    if (firstName && lastName && phone && password && tosAgreement) {
        data.readFile('users', phone, (err, user) => {
            if (err && !user) {
                const userData = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                data.create('users', phone, userData, (err2) => {
                    if (err2) {
                        callback(500, { message: 'User creation failed' });
                    } else {
                        callback(200, { message: 'User created' });
                    }
                });
            } else {
                callback(200, {
                    message: 'user already exist',
                });
            }
        });
    } else {
        callback(400, {
            error: 'Wrong input',
        });
    }
};
routeHandler._user.put = (requestProperties, callback) => {
    const firstName =
        typeof requestProperties.body.firstName === 'string' &&
        requestProperties.body.firstName.trim().length > 0
            ? requestProperties.body.firstName
            : false;
    const lastName =
        typeof requestProperties.body.lastName === 'string' &&
        requestProperties.body.lastName.trim().length > 0
            ? requestProperties.body.lastName
            : false;
    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 10
            ? requestProperties.body.phone
            : false;
    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.length >= 8
            ? requestProperties.body.password
            : false;
    const newPassword =
        typeof requestProperties.body.newPassword === 'string' &&
        requestProperties.body.newPassword.length >= 8
            ? requestProperties.body.newPassword
            : false;
    if (phone) {
        if (!password) {
            callback(400, { error: 'Enter current password' });
        }
        const token =
            typeof requestProperties.headerObject.token === 'string' &&
            requestProperties.headerObject.token.trim().length === tokenLength
                ? requestProperties.headerObject.token.trim()
                : false;
        _token.verify(token, phone, (tokenStatus) => {
            if (tokenStatus) {
                if (firstName || lastName || newPassword) {
                    data.readFile('users', phone, (err, u) => {
                        if (!err && u) {
                            const user = JSONparse(u);
                            if (user.password === hash(password)) {
                                if (firstName) user.firstName = firstName;
                                if (lastName) user.lastName = lastName;
                                if (newPassword) user.password = hash(newPassword);
                                data.update('users', phone, user, (err2) => {
                                    if (err2) {
                                        callback(500, { error: 'Error updating data' });
                                    } else {
                                        callback(200, { message: 'Data updated' });
                                    }
                                });
                            } else {
                                callback(400, { error: 'Wrong password' });
                            }
                        } else {
                            callback(500, { error: 'server error' });
                        }
                    });
                } else {
                    callback(400, { error: 'Invalid data' });
                }
            } else {
                callback(403, {
                    error: 'Authentication failed',
                });
            }
        });
    } else {
        callback(400, { error: 'User not found' });
    }
};
routeHandler._user.delete = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 10
            ? requestProperties.body.phone
            : false;
    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.length >= 8
            ? requestProperties.body.password
            : false;
    if (phone) {
        if (!password) {
            callback(400, { error: 'Enter password' });
        } else {
            const token =
                typeof requestProperties.headerObject.token === 'string' &&
                requestProperties.headerObject.token.trim().length === tokenLength
                    ? requestProperties.headerObject.token.trim()
                    : false;
            _token.verify(token, phone, (tokenStatus) => {
                if (tokenStatus) {
                    data.readFile('users', phone, (err, u) => {
                        if (!err && u) {
                            const user = JSONparse(u);
                            if (user.password === hash(password)) {
                                data.delete('users', phone, (err2) => {
                                    if (err2) {
                                        callback(500, { error: 'Error deleting user' });
                                    } else {
                                        callback(200, { message: 'User deleted' });
                                    }
                                });
                            } else {
                                callback(400, { error: 'Wrong password' });
                            }
                        } else {
                            callback(500, { error: 'server error' });
                        }
                    });
                } else {
                    callback(403, {
                        error: 'Authentication failed',
                    });
                }
            });
        }
    } else {
        callback(400, { error: 'User not found' });
    }
};

// module export
module.exports = routeHandler;
