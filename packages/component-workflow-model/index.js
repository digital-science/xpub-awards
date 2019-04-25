console.log('[component-workflow-model] Loading');

const workflowDesc = require('./../app/config/description');
const generateGraphQLDefs = require('./src/generate-graphql-definitions');

const defs = generateGraphQLDefs(workflowDesc);
console.log(defs.typeDefs);

const File = require('./shared-model/file');


function serverSetup(app) {

    // Add the file download endpoint to the server.
    File.serverSetup(app);
}


module.exports = {

    server: () => serverSetup,
    typeDefs: defs.typeDefs,
    resolvers: defs.resolvers
};