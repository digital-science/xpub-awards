import { registerFormFieldType } from 'component-task-form/client/components/registry';

import FormFieldAwardeeORCIDLink from './form-field-awardee-orcid-link';
import FormFieldAwardeesEditor from './form-field-awardess-editor';


let hasRegistered = false;

export default () => {

    if(hasRegistered) {
        return;
    }

    registerFormFieldType('AwardeeORCIDIdentityLink', FormFieldAwardeeORCIDLink);
    registerFormFieldType('AwardeesEditor', FormFieldAwardeesEditor);
    hasRegistered = true;
};

