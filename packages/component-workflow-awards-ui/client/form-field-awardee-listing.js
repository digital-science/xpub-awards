import React, { useEffect, useState } from 'react';
import withFormField, {fetchFields} from "component-task-form/client/components/fields/withFormField";



function FormFieldAwardeeListing({formData, binding, instanceId, instanceType, refetchFormData, options = {}}) {

    const [awardeesListing, setAwardeesListing] = useState([]);

    const formDataWasChanged = function _formDataWasChanged(form, field, v) {
        setAwardeesListing(form.getFieldValue(field) || []);
    };

    useEffect(() => {

        if(!formData || !binding) {
            return;
        }

        const simpleBinding = binding.split('.')[0];

        formData.on(`field.${simpleBinding}`, formDataWasChanged);
        setAwardeesListing(formData.getFieldValue(binding) || []);

        return function cleanup() {
            formData.off(`field.${simpleBinding}`, formDataWasChanged);
        };

    }, [formData, binding]);


    return <ol>{awardeesListing.map(awardee => <li key={awardee.id}>{awardee.firstName} {awardee.lastName}</li>)}</ol>
}



export default withFormField(FormFieldAwardeeListing, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the formData data set is the binding values).

    const topLevel = element.binding;
    const fetch = fetchFields(element.binding, `id, firstName, lastName, affiliation, email`);

    return {topLevel, fetch};
});