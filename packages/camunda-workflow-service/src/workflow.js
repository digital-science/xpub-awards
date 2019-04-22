const CamSDK = require('camunda-bpm-sdk-js');
const config = require('config');

module.exports = {
    client: new CamSDK.Client({
        mock: false,
        apiUri: config.workflow.apiUri
    })
};
