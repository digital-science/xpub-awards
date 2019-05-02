class FormElement {

    constructor(definition) {
        this.type = definition.element;

        if(definition.binding) {
            this.binding = definition.binding;
        }

        this.options = definition.options || {};

        if(definition.children) {
            this.children = definition.children.map(childDef => new FormElement(childDef));
        }
    }
}

export default FormElement;