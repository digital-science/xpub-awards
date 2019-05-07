const setupORCIDIdentityLinking = require('./server/orcid-linking');

function setupServer(app) {
    return setupORCIDIdentityLinking(app);
}

module.exports = {
    server: () => setupServer
};