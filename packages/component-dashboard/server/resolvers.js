
// NOTE: this is implemented this way currently for development purposes, it will be changhed into a more generic
// approach (fetching arbitrary collections of model objects).

const WorkflowModel = require('component-workflow-model/model');
const { AwardSubmission } = WorkflowModel.models;


module.exports = {

    Query: {

        // FIXME: limiting will need to be applied etc

        awardSubmissions: () => {

            console.log("---- awardSubmissions called ----");
            //console.dir(arguments);

            return AwardSubmission.query().where('outcome', null).eager('[awardeeAcceptances]');
        }
    }
};