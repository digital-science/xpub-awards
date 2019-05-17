const { models } = require('component-workflow-model/model');
const { AwardeeAcceptance } = models;
const logger = require('@pubsweet/logger');
const config = require('config');

const { ServiceSendEmail, EmailTemplate } = require('component-workflow-send-email');


const LogPrefix = '[ExternalTask/EmailAwardee]';


module.exports = function _setupEmailAwardeeTask(client) {

    const emailTemplate = new EmailTemplate("awardee-acceptance");
    const baseUrl = config.get('pubsweet-client.baseUrl');

    async function sendEmailForAwardeeAcceptance(acceptance) {

        const submission = acceptance.awardSubmission;
        const awardee = acceptance.awardee;
        const awardAcceptanceUrl = `${baseUrl}/award/${acceptance.id}/acceptance`;

        if(!awardee) {
            logger.error(`${LogPrefix} no awardee present in award acceptance instance`);
            return Promise.reject(new Error("No awardee present to send email to."));
        }

        if(!awardee.email) {
            logger.error(`${LogPrefix} awardee has no valid email address to send an email to`);
            return Promise.reject(new Error("Awardee has no valid email address."));
        }

        const text = emailTemplate.template({awardee, submission, awardAcceptanceUrl});
        const to = (awardee.firstName && awardee.lastName && awardee.firstName.indexOf('@') === -1 && awardee.lastName.indexOf('@') === -1) ?
            `${awardee.firstName} ${awardee.lastName} <${awardee.email}>` : `${awardee.email}`;

        //awardee.email

        const opts = {
            subject: "Award Acceptance",
            to,
            text
        };

        return ServiceSendEmail.sendEmail(opts);
    }

    client.subscribe('email-awardee', async ({ task, taskService }) => {

        logger.debug(`${LogPrefix} email awardee is starting`);

        const acceptanceId = task.businessKey;
        if(!acceptanceId) {
            // FIXME: may need to fail task here and report it
            logger.error(`${LogPrefix} failed to process for submission due to missing business key (processInstanceId="${task.processInstanceId}")`);
            return;
        }

        const acceptance = await AwardeeAcceptance.find(acceptanceId, ['awardee', 'awardSubmission']);
        if(!acceptance) {
            logger.warn(`${LogPrefix} unable to find awardee acceptance instance for id (${acceptanceId})`);
            return;
        }

        sendEmailForAwardeeAcceptance(acceptance).then(() => {

            logger.debug(`${LogPrefix} email to awardee was sent, completing external task`);
            return taskService.complete(task);
        });

        // FIXME: record sending an email etc. in a communication log associated with the submission??
    });
};
