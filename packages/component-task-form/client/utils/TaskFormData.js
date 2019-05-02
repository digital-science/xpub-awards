import EventEmitter from 'event-emitter';

class TaskFormData {

    constructor(initialData = {}) {
        this._modifiedFields = {};
        this._defaultValues = {...initialData};
        this._generation = 0;
        this._submittedGeneration = 0;
    }

    getFieldValue(fieldID) {
        if(this._modifiedFields.hasOwnProperty(fieldID)) {
            return this._modifiedFields[fieldID];
        }
        return this._defaultValues[fieldID] || undefined;
    }

    setFieldValue(fieldID, value) {
        if(this._defaultValues.hasOwnProperty(fieldID) && this._defaultValues[fieldID] === value) {
            delete this._modifiedFields[fieldID];
            this.emit(`field.${fieldID}`, this, fieldID, value);
            this.emit(`modified`);
            ++this._generation;
            return;
        }

        this._modifiedFields[fieldID] = value;
        this.emit(`field.${fieldID}`, this, fieldID, value);
        this.emit(`modified`);
        ++this._generation;
    }

    resetFieldValue(fieldID) {

        if(!this._modifiedFields.hasOwnProperty(fieldID)) {
            return;
        }

        delete this._modifiedFields[fieldID];

        this.emit(`field.${fieldID}`, this, fieldID, undefined);
        this.emit(`modified`);
        ++this._generation;
    }

    getModifiedData() {
        const data = {};
        let isModified = false;

        for(let k in this._modifiedFields) {
            if(this._modifiedFields.hasOwnProperty(k)) {
                data[k] = this._modifiedFields[k];
                isModified = true;
            }
        }

        return isModified ? {data, generation:this._generation} : null;
    }

    updateForSubmittedModifications({data, generation}) {

        if(generation <= this._submittedGeneration) {
            return;
        }

        const sameGeneration = (this._generation === this._submittedGeneration);
        this._submittedGeneration = generation;

        for(let k in data) {
            if(data.hasOwnProperty(k)) {
                this._defaultValues[k] = data[k];

                // This is not a deep compare!!
                if(!sameGeneration && this._defaultValues[k] === this._modifiedFields[k]) {
                    delete this._modifiedFields[k];
                }
            }
        }

        if(sameGeneration) {
            this._modifiedFields = {};
        }
    }

    getGeneration() {
        return this._generation;
    }
}

EventEmitter(TaskFormData.prototype);

export default TaskFormData;