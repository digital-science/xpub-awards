import React, { useContext } from 'react'
import { WorkflowDescriptionContext } from 'client-workflow-model'
import { TaskForm } from 'component-task-form/client'

function WorkflowPrimaryTask({ match }) {

    const { instanceId, taskId, taskName, type } = match.params;
    const WorkflowDescription = useContext(WorkflowDescriptionContext);

    const instanceType = WorkflowDescription.findInstanceTypeForUrlName(type);
    if(!instanceType) {
        throw new Error(`Unable to find task definition for type '${type}'.`);
    }

    const formDefinition = instanceType.formDefinitionForFormName(taskName);

    console.dir(WorkflowDescription);
    console.dir(instanceType);
    console.dir(formDefinition);

    return (
        <div>
            Workflow Primary Task
            <br />
            <br />
            <TaskForm instanceId={instanceId} instanceType={instanceType} taskId={taskId} formDefinition={formDefinition} workflowDescription={WorkflowDescription}>
            </TaskForm>
        </div>
    );
}

export default WorkflowPrimaryTask;

