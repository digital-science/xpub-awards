import { registerFormFieldType } from 'component-task-form/client/components/registry';

import FormFieldAwardeeORCIDLink from './form-field-awardee-orcid-link';
import FormFieldAwardeesEditor from './form-field-awardees-editor';
import FormFieldAwardeeListing from './form-field-awardee-listing';
import FormFieldAwardeeDetails from './form-field-awardee-details';

let hasRegistered = false;

export default () => {

    if(hasRegistered) {
        return;
    }

    registerFormFieldType('AwardeeORCIDIdentityLink', FormFieldAwardeeORCIDLink);
    registerFormFieldType('AwardeesEditor', FormFieldAwardeesEditor);
    registerFormFieldType('AwardeeListing', FormFieldAwardeeListing);
    registerFormFieldType('AwardeeDetails', FormFieldAwardeeDetails);
    hasRegistered = true;
};

