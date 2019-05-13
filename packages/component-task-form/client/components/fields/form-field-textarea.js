import React from 'react';
import useFormValueBinding from './../../hooks/useFormValueBinding';
import withFormField from './withFormField'

import Label from 'ds-awards-theme/components/label';
import TextArea from 'ds-awards-theme/components/text-area';


function FormFieldTextArea({binding, formData, options = {}}) {

    const {value, handleInputChange} = useFormValueBinding(formData, binding, "", (v) => v || "");
    const textInput = <TextArea value={value} onChange={handleInputChange} />;

    return (
        <React.Fragment>
            {options.label ? <React.Fragment><Label>{options.label}</Label><br /></React.Fragment> : null}
            {textInput}
        </React.Fragment>
    );
}

export default withFormField(FormFieldTextArea);