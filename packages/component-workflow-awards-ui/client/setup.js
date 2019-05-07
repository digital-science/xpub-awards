import { registerFormFieldType } from 'component-task-form/client/components/registry';

import FormFieldAwardeeORCIDLink from './form-field-awardee-orcid-link';
import FormFieldAwardeesEditor from './form-field-awardess-editor';


export default () => {
    registerFormFieldType('AwardeeORCIDIdentityLink', FormFieldAwardeeORCIDLink);
    registerFormFieldType('AwardeesEditor', FormFieldAwardeesEditor);
};

