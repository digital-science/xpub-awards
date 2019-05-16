import FormFieldDate from './fields/form-field-date';
import FormFieldTextArea from './fields/form-field-textarea';
import FormFieldText from './fields/form-field-text';
import FormFieldFileUploader from './fields/form-field-file-uploader';
import FormFieldButton from './fields/form-field-button';

import FormFieldStaticText from './fields/form-field-static-text';
import FormFieldFilesListing from './fields/form-field-files-listing';


// Lookup registry for form fields.
const FormFieldRegistry = {
    'Date' : FormFieldDate,
    'TextArea' : FormFieldTextArea,
    'Text' : FormFieldText,
    'Button' : FormFieldButton,

    'FileUploader': FormFieldFileUploader,

    // Static details form fields
    'StaticText' : FormFieldStaticText,
    'FilesListing': FormFieldFilesListing
};

export default FormFieldRegistry;

export function registerFormFieldType(name, component) {
    FormFieldRegistry[name] = component;
}