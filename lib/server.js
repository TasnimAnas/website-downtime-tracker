/*
 * Title: Uptime Monitoring Application
 * Description:
 * Author: Tasnim Anas
 * Date: 30/09/2022
 *
 */

// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handelReqRes');
const environment = require('../helpers/environments');

// app object
const serverObject = {};

// Create server
serverObject.createServer = () => {
    const server = http.createServer(serverObject.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`Server started at port ${environment.port}`);
    });
};

// Handle Req Res
serverObject.handleReqRes = handleReqRes;
// Start the server
serverObject.init = () => {
    serverObject.createServer();
};

module.exports = serverObject;
