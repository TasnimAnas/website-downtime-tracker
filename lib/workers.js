/*
 * Title: Uptime Monitoring Application
 * Description:
 * Author: Tasnim Anas
 * Date: 30/09/2022
 *
 */

// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const { JSONparse } = require('../helpers/utilities');
const data = require('./data');
const { sendSMS } = require('../helpers/notifications');
// app object
const workerObject = {};

workerObject.alertUser = (checkData) => {
    const msg = `Alert:\nHello,\nYour check for ${checkData.url} is updated as ${checkData.status}.\n\n- Tasnim Anas`;
    sendSMS(`+91${checkData.user}`, msg, (err2) => {
        if (!err2) {
            console.log(`${checkData.url}: User alerted (${checkData.status})`);
        } else {
            console.log('Error: Problem with sending message');
        }
    });
};
workerObject.updateCheckStatus = (checkData, checkOutCome) => {
    const status =
        !checkOutCome.error &&
        typeof checkOutCome.statusCode === 'number' &&
        checkData.successCodes.indexOf(checkOutCome.statusCode) >= 0
            ? 'up'
            : 'down';
    const needAlert = !!(checkData.status !== status && checkData.lastChecked);
    const newCheck = checkData;
    newCheck.status = status;
    newCheck.lastChecked = Date.now();
    data.update('checks', checkData.checkId, newCheck, (err) => {
        if (!err) {
            if (needAlert) {
                workerObject.alertUser(newCheck);
            } else {
                console.log(`${checkData.url}: Alert not needed as status is same (${status})`);
            }
        } else {
            console.log('Error saving one of the check');
        }
    });
};

workerObject.performCheck = (checkData) => {
    const parsedUrl = url.parse(`${checkData.protocol}://www.${checkData.url}`, true);
    const reqObject = {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.host,
        path: parsedUrl.path,
        method: checkData.methods.toUpperCase(),
        timeout: checkData.timeOutSec * 1000,
    };
    const protocolToUse = checkData.protocol === 'http' ? http : https;
    const checkOutCome = {
        error: false,
        value: false,
        statusCode: false,
    };
    let outcomeSend = false;
    const req = protocolToUse.request(reqObject, (res) => {
        checkOutCome.statusCode = res.statusCode;
        if (!outcomeSend) {
            workerObject.updateCheckStatus(checkData, checkOutCome);
            outcomeSend = true;
        }
    });
    req.on('error', (e) => {
        if (!outcomeSend) {
            checkOutCome.error = true;
            checkOutCome.value = e;
            workerObject.updateCheckStatus(checkData, checkOutCome);
            outcomeSend = true;
        }
    });
    req.on('timeout', (e) => {
        if (!outcomeSend) {
            checkOutCome.error = true;
            checkOutCome.value = `timeout: ${e}`;
            workerObject.updateCheckStatus(checkData, checkOutCome);
            outcomeSend = true;
        }
    });
    req.end();
};

workerObject.validateCheck = (checkObject) => {
    if (checkObject && checkObject.checkId) {
        const checkData = checkObject;
        checkData.status =
            typeof checkData.status === 'string' && ['up', 'down'].indexOf(checkData.status) >= 0
                ? checkData.status
                : 'down';
        checkData.lastChecked =
            typeof checkData.lastChecked === 'number' ? checkData.lastChecked : false;
        workerObject.performCheck(checkData);
    } else {
        console.log('Error: Check object error');
    }
};

workerObject.gatherAllChecks = () => {
    data.listAllFile('checks', (err, list) => {
        if (!err && data && list.length > 0) {
            list.forEach((check) => {
                data.readFile('checks', check, (err2, checkData) => {
                    if (!err2 && checkData) {
                        const checkObject = JSONparse(checkData);
                        workerObject.validateCheck(checkObject);
                    } else {
                        console.log('Error: Reading a check');
                    }
                });
            });
        } else {
            console.log('Error getting check list');
        }
    });
};

workerObject.loop = () => {
    setInterval(() => {
        workerObject.gatherAllChecks();
        console.log();
    }, 1000 * 30);
};

workerObject.init = () => {
    workerObject.gatherAllChecks();
    workerObject.loop();
};
module.exports = workerObject;
