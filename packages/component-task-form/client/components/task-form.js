import React from 'react';
import Spinner from 'ds-awards-theme/components/spinner';

import useTimedMinimumDisplay from './../hooks/useTimedMinimumDisplay';
import useFormInstanceData from './../hooks/useInstanceDataForForm';

import FieldListing from './field-listing';


export default function TaskForm({ instanceId, taskId, instanceType, formDefinition, workflowDescription, wasSubmitted, autoSave=true }) {

    const [showIsSaving, displayIsSavingMessage, removeIsSavingMessage] = useTimedMinimumDisplay(1000);

    const fd = useFormInstanceData(instanceId, taskId, instanceType, formDefinition, workflowDescription, wasSubmitted, autoSave, displayIsSavingMessage, removeIsSavingMessage);
    const {instance, error, loading, task, submitTaskOutcome, formData, refetchFormData, fieldRegistry} = fd;

    if(loading) {
        return <div>Loading</div>;
    }

    if(error) {
        return <div>Error: {error}</div>;
    }

    if(!instance) {
        return <div>Instance Not Found</div>
    }

    if(!task) {
        return <div>Task Not Found</div>
    }

    return formData ? (
        <div className="task-form" style={{padding: "20px", position:"relative"}}>
            <div style={{position:'absolute', top:0, left: "500px", visibility:showIsSaving ? "visible" : "hidden"}}>
                <Spinner /> <span>Saving&hellip;</span>
            </div>

            {/*<div>InstanceId: {instanceId}</div>*/}
            {/*<div>TaskId: {taskId}</div>*/}

            <div>
                <FieldListing elements={formDefinition.elements} fieldRegistry={fieldRegistry} formData={formData} refetchFormData={refetchFormData}
                    instanceId={instanceId} instanceType={instanceType} taskId={taskId} submitTaskOutcome={submitTaskOutcome} />
            </div>
        </div>
    ) : (
        <div>Loading</div>
    );
};