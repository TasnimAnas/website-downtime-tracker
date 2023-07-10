/*
 * Title:
 * Description:
 * Author: Tasnim Anas
 * Date:
 *
 */
// dependencies
const { twilioData } = require('./environments');
const client = require('twilio')(twilioData.accountSID, twilioData.authToken);
// app object

const notification = {};
// configuration
notification.sendSMS = (phone, msg, callback) => {
    const userPhone = typeof phone === 'string' && phone.trim().length > 0 ? phone.trim() : false;
    const message =
        typeof msg === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600
            ? msg.trim()
            : false;
    if (userPhone && message) {
        client.messages
            .create({ body: message, from: twilioData.sender, to: userPhone })
            .then((msg1) => callback(false));
    } else {
        callback('Given parameter is/are invalid');
    }
};

// module export
module.exports = notification;
