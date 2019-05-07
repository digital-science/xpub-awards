const { Variables } = require('camunda-external-task-client-js');
const { models } = require('component-workflow-model/model');
const { AwardSubmission, AwardeeAcceptance } = models;
const logger = require('@pubsweet/logger');

module.exports = function _setupPrepareAwardeesTask(client) {

    client.subscribe('prepare-awardees', async ({ task, taskService }) => {

        logger.info(`[External-Task] Prepare Awardees called for submission '${task.businessKey}'`);

        const submissionId = task.businessKey;
        if(!submissionId) {
            // FIXME: may need to fail task here and report it
            logger.error(`External Task (prepare-awardees): failed to process for submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return;
        }

        const submission = await AwardSubmission.find(submissionId, 'awardees');
        const awardees = submission.awardees;

        if(!awardees || !awardees.length) {
            logger.error(`External Task (prepare-awardees): insufficient awardees were present in the award submission data set (submissionId="${submissionId}")`);
            return;
        }


        // Iterate each of the awardees and create an award acceptance model instance.
        const awardAcceptances = await Promise.all(awardees.map(async awardee => {

            const acceptance = new AwardeeAcceptance({
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
            });

            await acceptance.save();

            // Link the awardee and award submission back to this award acceptance.
            await Promise.all([
                acceptance.$relatedQuery('awardee').relate(awardee.id),
                acceptance.$relatedQuery('awardSubmission').relate(submissionId)
            ]);

            return acceptance;
        }));

        console.dir(awardAcceptances);

        const acceptanceIds = awardAcceptances.map(a => a.id);

        const processVariables = new Variables();
        processVariables.set("awardees", acceptanceIds);

        await taskService.complete(task, processVariables);


        // TODO: we want to be able to retrieve all of the award acceptances from the original award as well via the GraphQL endpoint
        // does the awardee reference the acceptance instance or does the award submission instance allow for looking up all
        // referenced acceptance instances ???

    });
};
