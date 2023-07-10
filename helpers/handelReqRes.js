const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../handlers/routeHandlers/routes');
const { notFoundHandle } = require('../handlers/routeHandlers/notFoundHandler');
const { JSONparse } = require('./utilities');

const reqResHandler = {};

reqResHandler.handleReqRes = (req, res) => {
    const parsedPath = url.parse(req.url, true);
    const path = parsedPath.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    const method = req.method.toLowerCase();
    const queryObject = parsedPath.query;
    const headerObject = req.headers;
    const decoder = new StringDecoder('utf-8');
    const requestProperties = {
        parsedPath,
        path,
        trimmedPath,
        method,
        queryObject,
        headerObject,
    };
    const choosenRoute = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandle;
    let realData = '';
    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });
    req.on('end', () => {
        realData += decoder.end();
        requestProperties.body = JSONparse(realData);
        choosenRoute(requestProperties, (statusCode, payLoad) => {
            statusCode = typeof statusCode === 'number' ? statusCode : 500;
            payLoad = typeof payLoad === 'object' ? payLoad : {};
            const payLoadString = JSON.stringify(payLoad);
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payLoadString);
        });
    });
};

module.exports = reqResHandler;
