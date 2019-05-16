import React, { Fragment, useEffect, useState } from 'react';
import withFormField, {fetchFields} from "component-task-form/client/components/fields/withFormField";
import styled from 'styled-components';

import Label from 'ds-awards-theme/components/label';
import AvatarAwardeePerson from './avatar-awardee-person';



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

    const label = options.label ? <Label>{options.label}</Label> : null;

    return (
        <Fragment>
            {label}
            <AwardeeListingHolder>
                {awardeesListing.map(awardee => <li key={awardee.id}><AvatarAwardeePerson awardee={awardee} /></li>)}
            </AwardeeListingHolder>
        </Fragment>
    );
}

const AwardeeListingHolder = styled.ol`
  
    padding: 0;
    margin: 0;
    list-style: none;
    
    >:first-child {
      margin-top: 5px;
    }
    
    > li {
      margin-bottom: 5px;
    }
`;



export default withFormField(FormFieldAwardeeListing, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the formData data set is the binding values).

    const topLevel = element.binding;
    const fetch = fetchFields(element.binding, `id, firstName, lastName, affiliation, email`);

    return {topLevel, fetch};
});