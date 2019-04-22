console.log('[component-workflow-model] Loading');

const workflowDesc = require('./../app/config/description');
const generateGraphQLDefs = require('./src/generate-graphql-definitions');

const defs = generateGraphQLDefs(workflowDesc);
console.log(defs.typeDefs);

module.exports = {

    typeDefs: defs.typeDefs,
    resolvers: defs.resolvers
};