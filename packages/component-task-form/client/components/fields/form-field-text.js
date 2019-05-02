import React from 'react';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

function FormFieldText({formData, binding, options = {}}) {

    const {value, handleInputChange} = useFormValueBinding(formData, binding, "", (v) => v || "");
    const textInput = <input type="text" value={value} onChange={handleInputChange} />;

    return (
        <React.Fragment>
            {options.label ? <label>{options.label}</label> : null}
            {textInput}
        </React.Fragment>
    );
}

export default withFormField(FormFieldText);