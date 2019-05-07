const OrcidStrategy = require('passport-orcid');
const config = require("config");

const { clientID, clientSecret, callbackPath, successPath, authenticatePath } = config.get('orcid');



module.exports = (app) => {

    const { passport } = app.locals;
    const options = {
        sandbox: process.env.NODE_ENV !== 'production',
        callbackURL: `${config.get('pubsweet-client.baseUrl')}${callbackPath}`,
        clientID,
        clientSecret
    };

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });

    const orcid = new OrcidStrategy(options, (accessToken, refreshToken, params, profile, done) => {

        profile = {
            orcid: params.orcid,
            name: params.name,
            accessToken,
            refreshToken,
            scope: params.scope,
            expiry: params.expires_in,
        };

        return done(null, profile);
    });

    passport.use(orcid);


    app.get(authenticatePath,
        (req, res, next) => {

            passport.authenticate('orcid', {
                state: req.query.userId
            })(req, res, next);
        }
    );

    app.get(callbackPath,
        passport.authenticate('orcid', {
            failureRedirect: successPath,
        }),
        didAuthenticateWithORCID,
    );
};



function didAuthenticateWithORCID(req, res) {

    const userId = req.query.state;

    console.dir(req);
    console.dir(res);

    console.dir(req.user);
    console.dir(req.query);

    // for an awardee,
    // we want to create an identity and then associate it with the specified
    // awardee acceptance instance


    return res.send("Authenticated !!");


    /*
    { orcid: '0000-0001-9332-2604',
  name: 'Jared Watts',
  accessToken: '2aa06bf1-4fbd-481c-927e-88255be033c4',
  refreshToken: 'ed1250e2-3b4d-45b7-8fc7-30405dc7f304',
  scope: '/authenticate',
  expiry: 631138518 }
     */
}
