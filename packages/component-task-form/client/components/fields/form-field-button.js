import React from 'react';
import Button from 'ds-awards-theme/components/button';
import withFormField from './withFormField';


function FormFieldButton({taskId, submitTaskOutcome, options}) {

    function handleSubmit(taskOutcome) {
        if(submitTaskOutcome && taskOutcome) {
            return submitTaskOutcome(taskId, taskOutcome, options);
        }
    }

    return (
        <Button default={options.default || false} className={"form-field-button"}
            onClick={() => {handleSubmit(options.outcome)}}>{options.label}
        </Button>
    );
}

export default withFormField(FormFieldButton);