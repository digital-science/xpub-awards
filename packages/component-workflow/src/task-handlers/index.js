const TaskEmailAwardee = require('./task-email-awardee');
const TaskPrepareAwardee = require('./task-prepare-awardees');
const TaskPublishAward = require('./task-publish-award');

const AllTaskSetups = [TaskEmailAwardee, TaskPrepareAwardee, TaskPublishAward];

module.exports = function initExternalTasks(client) {
    return Promise.all(AllTaskSetups.map(taskSetup => taskSetup(client)));
};
