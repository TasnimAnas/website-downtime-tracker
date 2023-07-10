const routeHandler = {};
routeHandler.notFoundHandle = (requestProperties, callback) => {
    callback(404, {
        message: 'This is 404 Not found page',
    });
};

module.exports = routeHandler;
