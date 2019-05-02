class EnumDefinition {

    constructor(definition) {
        this.name = definition.name;
        this.values = definition.values;
    }

    resolve(reference) {
        const [name, key] = reference.split(".");
        if(name !== this.name) {
            return null;
        }
        return this.values[key];
    }
}

export default EnumDefinition;