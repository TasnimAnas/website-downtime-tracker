const { sampleHandle } = require('./sampleHandle');
const { userHandler } = require('./userHandler');
const { tokenHandler } = require('./tokenHandler');
const { checkHandler } = require('./checkHandler');

const routes = {
    sample: sampleHandle,
    user: userHandler,
    token: tokenHandler,
    check: checkHandler,
};

module.exports = routes;
