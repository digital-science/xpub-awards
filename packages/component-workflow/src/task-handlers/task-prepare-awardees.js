module.exports = function _setupPrepareAwardeesTask(client) {
    client.subscribe('prepare-awardees', async ({ task, taskService }) => {
        console.log(`[External-Task] Prepare Awardees:`);
        console.log(JSON.stringify(task, null, 4));

        /* const processID = task.processInstanceId; */
        const r = await taskService.complete(task);
        console.dir(r);
    });
};
