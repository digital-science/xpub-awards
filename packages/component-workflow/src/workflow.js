const TaskHandlers = require('./task-handlers/index');
const { Client } = require('camunda-external-task-client-js');
const config = require('config');

const CamSDK = require('camunda-bpm-sdk-js');
const camClient = new CamSDK.Client({
    mock: false,
    apiUri: config.workflow.apiUri
});

exports.client = camClient;
exports.taskService = new camClient.resource('task');
exports.processDefinitionService = new camClient.resource('process-definition');
exports.processInstanceService = new camClient.resource('process-instance');

exports.server = function setupWorkflow(app) {

    const clientConfig = { baseUrl: config.get('workflow.apiUri') };
    const client = new Client(clientConfig);

    console.log("Setup external task handlers");
    TaskHandlers(client);

    console.log("Setup server");
    console.dir(config);
};
