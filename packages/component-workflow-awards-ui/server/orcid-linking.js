const logger = require('@pubsweet/logger');
const config = require('config');

const { models } = require('component-workflow-model/model');
const { AwardeeAcceptance, Awardee, Identity } = models;

const { associatePath, associateCallbackPath } = config.get('orcid');



// ===> /task/awardee-acceptance/112461ac-1326-481f-bc97-2a0884eb50f9/acceptance/28dfb437-70a3-11e9-b145-0242ac110003



module.exports = (app) => {

    const { passport } = app.locals;
    const callbackURL = `${config.get('pubsweet-client.baseUrl')}${associateCallbackPath}`;

    app.get(associatePath,
        (req, res, next) => {

            const {acceptanceId, awardeeId, redirect} = req.query;
            if(!acceptanceId || !awardeeId) {
                return res.status(400).send("Required identifiers missing");
            }

            const state = JSON.stringify({acceptanceId, awardeeId, redirect}, null, 4);

            console.log("associate-path request called!!!");
            console.log(`callbackURL = ${config.get('pubsweet-client.baseUrl')}${associateCallbackPath}`);
            console.log(`state = ${state}`);

            passport.authenticate('orcid', {
                state: encodeBase64(state),
                callbackURL
            })(req, res, next);
        }
    );

    app.get(associateCallbackPath,
        passport.authenticate('orcid', {
            failureRedirect: "/",
            callbackURL
        }),
        associateORCIDWithAwardee
    );
};



async function associateORCIDWithAwardee(req, res) {

    // FIXME: errors returned should be a nicely formated, user presentable error page

    const state = parseState(req);

    console.dir(state);

    if(state instanceof Error) {
        logger.error(`Associate ORCID identity failed, unable to parse state due to: ${state.toString()}`);
        return res.status(400).send("Associate ORCID identity failed due to invalid state.");
    }

    const { acceptanceId, awardeeId, redirect } = state;

    const acceptance = await AwardeeAcceptance.find(acceptanceId, ['awardee']);
    if(!acceptance) {
        logger.warn(`Associate ORCID: unable to find awardee acceptance instance for id (${acceptanceId})`);
        return res.status(500).send("Unable to associate ORCID identity, awardee acceptance instance not found");
    }

    const { awardee } = acceptance;
    if(!awardee) {
        logger.warn(`Associate ORCID: unable to find awardee associated with acceptance for id (${acceptanceId})`);
        return res.status(500).send("Unable to associate ORCID identity, awardee not found");
    }

    if(awardee.id !== awardeeId) {
        logger.warn(`Associate ORCID: mis-matching awardee ${awardeeId} if for acceptance with awardee id (${awardee.id})`);
        return res.status(500).send("Unable to associate ORCID identity, awardee do not match");
    }

    // We now want to create a new identity, with the specified attributes from ORCiD and associate it with
    // the awardee.

    const profile = req.user;

    const identity = new Identity({
        created: new Date().toISOString(),
        updated: new Date().toISOString(),

        type: 'orcid',
        identityId: profile.orcid,
        displayName: profile.name,

        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        accessScope: profile.scope,
        accessTokenExpire: profile.expiry
    });

    await identity.save();


    // With the newly created identity, we want to associate that with the awardee in question.
    await awardee.$relatedQuery('identity').relate(identity.id);


    console.dir(identity);
    console.dir(acceptance);
    console.dir(awardee);
    console.dir(req.user);

    // for an awardee,
    // we want to create an identity and then associate it with the specified
    // awardee acceptance instance

    // wait for the database changes to be confirmed and then redirect back to the awardee acceptance page...

    // FIXME: need to verify that the redirect URI is valid and allowed !!!, should be restricted to a set of allowed redirect bases

    return res.redirect(redirect || "/");


    /*
    { orcid: '0000-0001-9332-2604',
  name: 'Jared Watts',
  accessToken: '2aa06bf1-4fbd-481c-927e-88255be033c4',
  refreshToken: 'ed1250e2-3b4d-45b7-8fc7-30405dc7f304',
  scope: '/authenticate',
  expiry: 631138518 }
     */
}



function encodeBase64(string) {
    return (new Buffer(string)).toString('base64');
}

function decodeBase64(encodedString) {
    return (new Buffer(encodedString, 'base64')).toString('utf8');
}

function parseState(req) {

    if(!req.query.state) {
        return new Error("ORCID response missing state parameter");
    }

    const stateJson = decodeBase64(req.query.state);
    let state = null;

    try {
        state = JSON.parse(stateJson);
    } catch(e) {
        return new Error("ORCID response, unable to parse returned state");
    }

    if(!state || !state.acceptanceId || !state.awardeeId) {
        return new Error("ORCID response, state parameter was invalid");
    }

    return state;
}
