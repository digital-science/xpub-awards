module.exports = function _setupPublishAwardTask(client) {
    client.subscribe('publish-award', async ({ task, taskService }) => {
        console.log(`[External-Task] Email Awardee:`);
        console.log(JSON.stringify(task, null, 4));

        /* const processID = task.processInstanceId; */
        await taskService.complete(task);
    });
};
