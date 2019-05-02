import React from 'react';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

function FormFieldTextArea({binding, formData, options = {}}) {

    const {value, handleInputChange} = useFormValueBinding(formData, binding, "", (v) => v || "");
    const textInput = <textarea value={value} onChange={handleInputChange} />;

    return (
        <React.Fragment>
            {options.label ? <React.Fragment><label>{options.label}</label><br /></React.Fragment> : null}
            {textInput}
        </React.Fragment>
    );
}

export default withFormField(FormFieldTextArea);