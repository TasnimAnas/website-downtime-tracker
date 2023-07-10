/*
 * Title:
 * Description:
 * Author: Tasnim Anas
 * Date:
 *
 */
// dependencies

// app object
const environment = {};
// configuration
environment.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'iuditcgexbj',
    tokenLength: 36,
    checkIdLength: 15,
    maxChecks: 6,
    twilioData: {
        authToken: '4d3f135fdda2f323da8421974b99489e',
        accountSID: 'AC952c6abcf53f4d8746c7f6d25d99ac6e',
        sender: '+16672260381',
    },
};
environment.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'rcbcnw',
    tokenLength: 36,
    checkIdLength: 15,
    maxChecks: 6,
    twilioData: {
        authToken: '4d3f135fdda2f323da8421974b99489e',
        accountSID: 'AC952c6abcf53f4d8746c7f6d25d99ac6e',
        sender: '+16672260381',
    },
};

const currentEnvironment =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';
const envToExport =
    typeof environment[currentEnvironment] === 'object'
        ? environment[currentEnvironment]
        : environment.staging;

// Handle Req Res

// Start the server
module.exports = envToExport;
