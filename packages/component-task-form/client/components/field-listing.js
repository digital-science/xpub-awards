import React from 'react';
import styled from 'styled-components';


function _FormFieldListing({ className, task, submission, elements, fieldRegistry, formData, submitTaskOutcome, instanceId, instanceType, taskId, refetchFormData }) {

    if(!elements || !elements.length || !fieldRegistry || !formData || !instanceId || !instanceType) {
        return null;
    }

    const items = elements.map((e, i) => {

        const ElementComponent = fieldRegistry[e.type];
        if(ElementComponent) {
            return <ElementComponent key={i} task={task} submission={submission}
                binding={e.binding} options={e.options || {}} fieldRegistry={fieldRegistry}
                description={e} formData={formData} refetchFormData={refetchFormData}
                submitTaskOutcome={submitTaskOutcome} instanceId={instanceId} instanceType={instanceType}
                taskId={taskId}/>;
        }

        return <div key={i}>Unknown Element Type</div>;
    });

    return (
        <div className={`${className || ''} form-field-listing`}>
            {items}
        </div>
    );

}

export default styled(_FormFieldListing)`
    max-width: 500px;
`;