import FormFieldDate from './fields/form-field-date';
import FormFieldTextArea from './fields/form-field-textarea';
import FormFieldText from './fields/form-field-text';
import FormFieldFileUploader from './fields/form-field-file-uploader';
import FormFieldButton from './fields/form-field-button';


// Lookup registry for form fields.
const FormFieldRegistry = {
    'Date' : FormFieldDate,
    'TextArea' : FormFieldTextArea,
    'Text' : FormFieldText,
    'Button' : FormFieldButton,

    'FileUploader': FormFieldFileUploader
};

export default FormFieldRegistry;

export function registerFormFieldType(name, component) {
    FormFieldRegistry[name] = component;
}