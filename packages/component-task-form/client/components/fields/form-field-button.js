import React from 'react';
import withFormField from './withFormField';

import './form-field-button.css';


function FormFieldButton({submitTaskOutcome, options}) {

    function handleSubmit(taskOutcome) {
        if(submitTaskOutcome && taskOutcome) {
            return submitTaskOutcome(taskOutcome, options);
        }
    }

    return (
        <button className={"form-field-button" + (options.default ? " default" : "")}
            onClick={() => {handleSubmit(options.outcome)}}>{options.label}
        </button>
    );
}

export default withFormField(FormFieldButton);