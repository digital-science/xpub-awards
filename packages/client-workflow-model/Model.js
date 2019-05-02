class Model {

    constructor(definition) {
        this.fields = definition.elements || [];
    }

    stateFields() {
        return (this.fields || []).filter(f => f.state === true);
    }
}

export default Model;