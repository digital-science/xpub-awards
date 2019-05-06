// const fs = require('fs')
// const path = require('path')
const authentication = require('@pubsweet/model-user/src/authentication');
const setupORCiDEndpoints = require('./server/orcid');

// const resolvers = require('./server/src/resolvers')

module.exports = {
    // resolvers,
    server: () => configurePassport
    /* typeDefs: fs.readFileSync(
        path.join(__dirname, '/server/src/typeDefs.graphqls'),
        'utf8',
    ), */
};

function configurePassport(app) {

    const { passport } = app.locals;

    passport.use('bearer', authentication.strategies.bearer);
    passport.use('anonymous', authentication.strategies.anonymous);
    passport.use('local', authentication.strategies.local);

    return setupORCiDEndpoints(app);
}
