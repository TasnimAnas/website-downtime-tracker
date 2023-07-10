/*
 * Title: Uptime Monitoring Application
 * Description:
 * Author: Tasnim Anas
 * Date: 30/09/2022
 *
 */

// dependencies
const server = require('./lib/server');
const worker = require('./lib/workers');

const init = () => {
    server.init();
    worker.init();
};

init();
