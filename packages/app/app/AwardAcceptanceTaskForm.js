import React from 'react';
import WorkflowTaskFormHero from './WorkflowTaskFormHero';

function AwardAcceptanceTaskForm({ match, history }) {

    // Hard-code the task and task name

    const type = 'awardee-acceptance';
    const taskName = 'acceptance';

    match.params.type = type;
    match.params.taskName = taskName;

    return <WorkflowTaskFormHero match={match} history={history} />;
}

export default AwardAcceptanceTaskForm;