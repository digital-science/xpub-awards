const { models } = require('component-workflow-model/model');
const { AwardeeAcceptance } = models;


module.exports = function _setupEmailAwardeeTask(client) {

    client.subscribe('email-awardee', async ({ task, taskService }) => {

        console.log("---------------");
        console.log(`[External-Task] Email Awardee:`);
        console.log(JSON.stringify(task, null, 4));

        const acceptanceId = task.businessKey;
        if(!acceptanceId) {
            // FIXME: may need to fail task here and report it
            logger.error(`External Task (email-awardee): failed to process for submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return;
        }

        const acceptance = await AwardeeAcceptance.find(acceptanceId, ['awardee', 'awardSubmission']);
        if(!acceptance) {
            logger.warn(`External Task (email-awardee): unable to find awardee acceptance instance for id (${acceptanceId})`);
            return;
        }

        const submission = acceptance.awardSubmission;
        const awardee = acceptance.awardee;

        console.log("Would have sent an email to the following awardee, regarding the award submission: ");
        console.dir(submission);
        console.dir(awardee);
        console.log("---------------");

        // FIXME: record sending an email etc. in a communication log associated with the submission??

        await taskService.complete(task);
    });
};
