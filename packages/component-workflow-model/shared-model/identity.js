const { AwardsBaseModel } = require('component-model');


class Identity extends AwardsBaseModel {

    static get tableName() {
        return 'identity';
    }

    static get schema() {
        return {
            type:'object',
            properties: {
                type: { type: ['string', 'null'] },
                displayName: { type: ['string', 'null'] },
                displayAffiliation: { type: ['string', 'null'] }
            }
        };
    }
}



async function createIdentity(context, { input }) {

    const identity = new Identity({
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        ...input
    });

    await identity.save();

    return identity.id;
}

async function updateIdentity(context, { input }) {

    if(!input.id) {
        return false;
    }

    const identity = await Identity.find(input.id);
    if(!identity) {
        return false;
    }

    Object.keys(input).forEach(key => {
        if(key !== 'id') {
            identity[key] = input[key];
        }
    });

    await identity.save();
    return true;
}

async function getIdentity(context, { id }) {

    return await Identity.find(id);
}


exports.resolvers = {
    Query: {
        getIdentity
    },
    Mutation: {
        createIdentity,
        updateIdentity
    }
};


exports.model = exports.Identity = Identity;
