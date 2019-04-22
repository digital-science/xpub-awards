// const fs = require('fs')
// const path = require('path')
const authentication = require('@pubsweet/model-user/src/authentication');

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
    app.locals.passport.use('bearer', authentication.strategies.bearer);
    app.locals.passport.use('anonymous', authentication.strategies.anonymous);
    app.locals.passport.use('local', authentication.strategies.local);
}
