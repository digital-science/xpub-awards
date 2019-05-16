import React, { Fragment } from 'react';
import { withFormField, withFormFieldData, fetchFields } from 'component-task-form/client';

import styled from 'styled-components';

import { BlockLabel } from 'ds-awards-theme/components/label';



function FormFieldAwardeeDetails({formData, binding, instanceId, instanceType, refetchFormData, options = {}}) {

    const [awardee] = withFormFieldData(formData, binding);

    return (
        <Fragment>
            {options.label ? <BlockLabel>{options.label}</BlockLabel> : null}
            {awardee ? <AwardeeDetails awardee={awardee} /> : null}
        </Fragment>
    );
}


const AwardeeDetails = styled(({className, awardee}) => {

    return (
        <div className={className}>
            <div><span>Name</span> {awardee.firstName} {awardee.lastName}</div>
            {awardee.email ? <div className="email"><span>Email</span> {awardee.email}</div> : null}
            {awardee.affiliation ? <div className="affiliation"><span>Affiliation</span> {awardee.affiliation}</div> : null}
        </div>
    )

})`
  font-family: ProximaNovaLight, sans-serif;
  font-size: 14px;
  
  margin-top: 5px;
  
  > div {
    padding-bottom: 4px;
  }
  
  > div > span {
    color: #464646;
    padding: 2px 5px;
    background: #e4e4e4;
    border-radius: 3px;
  }
`;


export default withFormField(FormFieldAwardeeDetails, (element) => {

    // From the GraphQL endpoint we want to fetch the file set along with the associated name, size, type etc.
    // The top level field that we are interested in (that comes in via the formData data set is the binding values).

    const topLevel = element.binding;
    const fetch = fetchFields(element.binding, `id, firstName, lastName, affiliation, email`);

    return {topLevel, fetch};
});