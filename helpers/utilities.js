/*
 * Title:
 * Description:
 * Author: Tasnim Anas
 * Date:
 *
 */
// dependencies
const crypto = require('crypto');
const env = require('./environments');
// app object
const utilities = {};
// configuration
utilities.JSONparse = (jsonString) => {
    let json;
    try {
        json = JSON.parse(jsonString);
    } catch {
        json = {};
    }
    return json;
};
utilities.hash = (normalString) => {
    if (typeof normalString === 'string' && normalString.length > 0) {
        const hash = crypto.createHmac('sha256', env.secretKey).update(normalString).digest('hex');
        return hash;
    }
    return false;
};

utilities.createRandomString = (length) => {
    const strLength = typeof length === 'number' && length > 0 ? length : false;
    const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let finalString = '';
    for (let i = 0; i < strLength; i += 1) {
        finalString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
    }
    return finalString;
};

module.exports = utilities;
