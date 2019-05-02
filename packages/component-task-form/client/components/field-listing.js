import React from 'react';


function FormFieldListing(props) {

    const { task, submission, elements, fieldRegistry, formData, submitTaskOutcome, instanceId, instanceType } = props;
    if(!elements || !elements.length || !fieldRegistry || !formData || !instanceId || !instanceType) {
        return null;
    }

    const items = elements.map((e, i) => {

        const ElementComponent = fieldRegistry[e.type];
        if(ElementComponent) {
            return <ElementComponent key={i} task={task} submission={submission}
                binding={e.binding} options={e.options || {}} fieldRegistry={fieldRegistry}
                description={e} formData={formData} submitTaskOutcome={submitTaskOutcome}
                instanceId={instanceId} instanceType={instanceType}/>;
        }

        return <div key={i}>Unknown Element Type</div>;
    });

    return (
        <div className="form-field-listing">
            {items}
        </div>
    );

}

export default FormFieldListing;