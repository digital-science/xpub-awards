module.exports = function _setupEmailAwardeeTask(client) {
    client.subscribe('email-awardee', async ({ task, taskService }) => {
        console.log(`[External-Task] Email Awardee:`);
        console.log(JSON.stringify(task, null, 4));

        /* const processID = task.processInstanceId; */
        await taskService.complete(task);
    });
};
