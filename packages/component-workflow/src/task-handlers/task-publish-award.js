const { models } = require('component-workflow-model/model');
const { AwardSubmission } = models;


module.exports = function _setupPublishAwardTask(client) {

    client.subscribe('publish-award', async ({ task, taskService }) => {

        console.log("---------------");
        console.log(`[External-Task] Publish Award:`);
        console.log(JSON.stringify(task, null, 4));

        const instanceId = task.businessKey;
        if(!instanceId) {
            // FIXME: may need to fail task here and report it
            logger.error(`External Task (publish-award): failed to process for submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return;
        }

        const submission = await AwardSubmission.find(instanceId);
        if(!submission) {
            logger.warn(`External Task (publish-award): unable to find award submission instance for id (${instanceId})`);
            return;
        }

        // submission -> change to a different state now that it has been published
        // ....

        /* const processID = task.processInstanceId; */
        //await taskService.complete(task);
    });
};
