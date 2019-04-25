const { AwardsBaseModel } = require('component-model');
const { Identity } = require('./identity');


class Awardee extends AwardsBaseModel {

    static get tableName() {
        return 'awardee';
    }

    static get schema() {
        return {
            type:'object',
            properties: {
                firstName: { type: ['string', 'null'] },
                lastName: { type: ['string', 'null'] },
                affiliation: { type: ['string', 'null'] },
                email: { type: ['string', 'null'] },
                identityId: { type: ['string', 'null'] }
            }
        };
    }

    static get relationMappings() {
        return {
            identity: {
                relation: AwardsBaseModel.BelongsToOneRelation,
                modelClass: Identity,
                join: {
                    from: 'awardee.identityId',
                    to: 'identity.id',
                },
            }
        }
    }
}


async function createAwardee(context, { input }) {

    const awardee = new Awardee({
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        ...input
    });

    await awardee.save();

    return awardee.id;
}

async function updateAwardee(context, { input }) {

    if(!input.id) {
        return false;
    }

    const awardee = await Awardee.find(input.id);
    if(!awardee) {
        return false;
    }

    Object.keys(input).forEach(key => {
        if(key !== 'id') {
            awardee[key] = input[key];
        }
    });

    await awardee.save();
    return true;
}

async function getAwardee(context, { id }) {

    return await Awardee.find(id, 'identity');
}

async function linkIdentityToAwardee(context, { input }) {

    const {awardeeId, identityId} = input;

    const [awardee, identity] = await Promise.all([
        Awardee.find(awardeeId, 'identity'),
        identityId ? Identity.find(identityId) : null
    ]);

    if(!awardee) {
        return false;
    }

    if(identityId) {
        if(identity) {
            await awardee.$relatedQuery('identity').relate(identityId);
        }
    } else {
        await awardee.$relatedQuery('identity').unrelate();
    }

    return true;
}

async function resolveIdentityForAwardee(instance) {

    if(!instance) {
        return null;
    }

    if (instance.identity) {
        return Promise.resolve(instance.identity);
    }

    return instance.$relatedQuery('identity');
}


exports.resolvers = {
    Awardee: {
        identity: resolveIdentityForAwardee
    },
    Query: {
        getAwardee
    },
    Mutation: {
        createAwardee,
        updateAwardee,
        linkIdentityToAwardee
    }
};

exports.model = exports.Awardee = Awardee;
