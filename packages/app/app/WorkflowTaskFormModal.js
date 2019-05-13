import React, { useContext } from 'react';
import { WorkflowDescriptionContext } from 'client-workflow-model'
import { TaskForm } from 'component-task-form/client'
import ModalOverlay from 'component-overlay/components/overlay';


// Register Awards specific UI components
import SetupWorkflowAwardsUI from 'component-workflow-awards-ui/client/setup';
SetupWorkflowAwardsUI();


function WorkflowTaskFormModal({ match, history }) {

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

    const wasSubmitted = () => {
        history.push("/");
    };

    return (
        <ModalOverlay isOpen={true} hasClose={true} close={wasSubmitted}>
            <TaskForm instanceId={instanceId} instanceType={instanceType} taskId={taskId}
                formDefinition={formDefinition} workflowDescription={WorkflowDescription}
                wasSubmitted={wasSubmitted}>
            </TaskForm>
            <button onClick={wasSubmitted}>Close</button>
        </ModalOverlay>
    );
}

export default WorkflowTaskFormModal;

