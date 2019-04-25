const { Variables } = require('camunda-external-task-client-js');

module.exports = function _setupPrepareAwardeesTask(client) {

    client.subscribe('prepare-awardees', async ({ task, taskService }) => {

        console.log(`[External-Task] Prepare Awardees:`);
        console.log(JSON.stringify(task, null, 4));

        // The award submission itself can be found via the business key.
        // But, need to resolve the model instance somehow???
        // Maybe a "processDefinitionKey" to model mapping???

        const processVariables = new Variables();
        processVariables.set("awardees", ["jared-watts", "simon-porter"]);

        // Once we have a listing of the awardees, then we need to create a collection
        // of model instances that represent the awardee acceptance process.
        // ??? how is this defined ???

        await taskService.complete(task, processVariables);
    });
};
