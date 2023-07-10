const routeHandler = {};
routeHandler.sampleHandle = (requestProperties, callback) => {
    callback(200, {
        message: 'This is Sample page',
    });
};

module.exports = routeHandler;
