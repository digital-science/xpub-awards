import React, { useState, useEffect } from 'react';


export default function withFormFieldData(formData, binding, fallbackValue=null) {

    const [field, setField] = useState(fallbackValue);

    const formDataWasChanged = function _formDataWasChanged(form, field, v) {
        setField(formData.getFieldValue(field) || []);
    };

    useEffect(() => {

        if(!formData || !binding) {
            return;
        }

        formData.on(`field.${binding}`, formDataWasChanged);
        setField(formData.getFieldValue(binding) || fallbackValue);

        return function cleanup() {
            formData.off(`field.${binding}`, formDataWasChanged);
        };

    }, [formData, binding]);

    return [field, setField];
};