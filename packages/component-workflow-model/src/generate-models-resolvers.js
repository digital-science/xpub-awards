/* For each task we need to create a new "Model" class instance. In addition to this, we also create the base set
 * of GraphQL endpoint resolvers. */

const { AwardsBaseModel } = require('component-model');
const { processDefinitionService, taskService } = require('camunda-workflow-service');
const { mergeResolvers, filterModelElementsForRelations, filterModelElementsForStates } = require('./utils');
const GraphQLFields = require('graphql-fields');
const logger = require('@pubsweet/logger');
const _ = require("lodash");


/**/
/* Generate Models & Resolvers for each of the top level defined tasks, enums and top level model objects. */
/**/
exports.generateModelsAndResolvers = function generateModelsAndResolvers(tasks, enums, topLevelModels) {

    const models = {};
    const resolvers = {};
    const allModels = {};

    const lookupModel = (modelName) => {
        return allModels[modelName] || null;
    };

    tasks.forEach(task => {
        models[task.name] = createModelForTask(task, enums, lookupModel);
    });

    Object.assign(allModels, topLevelModels);
    Object.assign(allModels, models);

    tasks.forEach(task => {
        const r = createResolversForTask(task, enums, models);
        mergeResolvers(resolvers, r);
    });

    return {models:allModels, resolvers};
};


/**/
/* Common Resolvers shared between multiple models. */
/**/
exports.commonResolvers = {
    Mutation: {
        completeTask: async function(ctxt, {input}) {
            return completeTask(input);
        }
    }
};


function _tableNameForEntityName(name) {

    return name.replace(/^(.)/g, (a) => a.toLowerCase()).replace(/([A-Z])/g, (a) => '-' + a.toLowerCase());
}

function _joinTableFieldNameForEntityName(name) {

    return name.replace(/^(.)/g, (a) => a.toLowerCase()) + 'Id';
}



function createModelForTask(task, enums, lookupModel) {

    const model = task.model;
    if(!model) {
        return;
    }

    const relations = filterModelElementsForRelations(model.elements, enums);
    const props = model.elements.map(element => {

        // FIXME: this should be more generalised into a generic lookup table or something of that sort of nature (this current impl smells a little)

        if(element.type === "String") {
            return {key:element.field, value:{type:['string', 'null']}};
        } else if(element.type === "Integer") {
            return {key:element.field, value:{type:['integer', 'null']}};
        } else if(element.type === "ID") {
            return {key:element.field, value:{type:['string', 'null'], format:'uuid'}};
        } else if(element.type === "DateTime") {
            return {key:element.field, value:{type:['string', 'object', 'null'], format:'date-time'}}; // 'object' allows the Date type
        }

        // See if the element type is defined as an enum and then use that as the defined type.
        if(enums.hasOwnProperty(element.type)) {
            const values = Object.values(enums[element.type].values);
            values.push(null);

            return {
                key:element.field,
                value:{
                    type: ['string', 'null'],
                    enum: values
                }
            };

        } else if(element.array !== true && element.joinField) {

            return {key:element.joinField, value:{type:['string', 'null'], format:'uuid'}};
        }

        return null;

    }).filter(e => !!e);

    const tableName = _tableNameForEntityName(task.name);
    const properties = {};
    props.forEach(p => {
        properties[p.key] = p.value;
    });

    const createClass = (name, cls) => ({
        [name] : class extends cls {

            static get tableName() {
                return tableName;
            }

            static get schema() {
                return {
                    type:'object',
                    properties
                };
            }

            static get relationMappings() {

                const r = {};

                relations.forEach(e => {

                    const mapping = {};
                    const destTableName = _tableNameForEntityName(e.type);

                    if(e.array === true) {

                        if(e.joinToField) {

                            mapping.relation = AwardsBaseModel.HasManyRelation;
                            mapping.modelClass = lookupModel(e.type);
                            mapping.join = {
                                from: `${tableName}.id`,
                                to: `${destTableName}.${e.joinToField}`
                            };

                        } else {

                            const joinTableName = `${tableName}-${_tableNameForEntityName(e.field)}`;

                            mapping.relation = AwardsBaseModel.ManyToManyRelation;
                            mapping.modelClass = lookupModel(e.type);
                            mapping.join = {
                                from: `${tableName}.id`,
                                through: {
                                    from: `${joinTableName}.${_joinTableFieldNameForEntityName(task.name)}`,
                                    to: `${joinTableName}.${_joinTableFieldNameForEntityName(e.type)}`
                                },
                                to: `${destTableName}.id`
                            };
                        }

                    } else {

                        if(!e.joinField) {
                            logger.warn(`Dynamic model ${task.name} has field element ${e.field} specified as a relationship (singular) but no 'join-field' specified.`);
                            return;
                        }

                        mapping.relation = AwardsBaseModel.BelongsToOneRelation;
                        mapping.modelClass = lookupModel(e.type);
                        mapping.join = {
                            from: `${tableName}.${e.joinField}`,
                            to: `${destTableName}.id`
                        };
                    }

                    r[e.field] = mapping;
                });

                return r;
            }
        }
    })[name];

    return createClass(task.name, AwardsBaseModel);
}



function createResolversForTask(task, enums, models) {

    const ModelClass = models[task.name];

    const relations = filterModelElementsForRelations(task.model.elements, enums);
    const relationFields = (relations || []).map(e => e.field);
    const states = filterModelElementsForStates(task.model.elements, enums);

    const simpleCreate = async function _create() {
        return createInstanceWithModelClass(ModelClass, task);
    };

    const simpleGet = async function _get(instance, args, context, info) {
        // FIXME: attempt to determine eager relations we may also want to resolve here and now if they have been requested
        console.log(`getInstanceForModelClass called ${task.name}`);
        return getInstanceForModelClass(ModelClass, task, args, info, relationFields);
    };

    const simpleUpdate = async function(ctxt, input) {
        return updateInstanceWithModelClass(ModelClass, task, input);
    };

    const allowCreate = !(task.model.noCreate === true);

    const mutation = {};
    if(allowCreate) {
        mutation[`create${task.name}`] = simpleCreate;
    }
    mutation[`update${task.name}`] = simpleUpdate;

    const query = {};
    query[`get${task.name}`] = simpleGet;

    const fieldResolvers = {};
    fieldResolvers.tasks = async function tasksResolver(obj) {
        return getTasksForInstance(obj.id);
    };

    relations.forEach(element => {

        fieldResolvers[element.field] = async (instance, args, context, info) => {

            if(!instance) {
                return null;
            }

            if (instance[element.field]) {
                return Promise.resolve(instance[element.field]);
            } else {
                return instance.$relatedQuery(element.field);
            }
        };
    });

    const accessorElements = relations ? relations.filter(e => e.accessors && e.accessors.length) : null;
    if(accessorElements && accessorElements.length) {

        accessorElements.filter(e => e.accessors.indexOf("set") !== -1).forEach(e => {

            let niceFieldName = e.field.charAt(0).toUpperCase() + e.field.slice(1);
            const mutationName = `set${task.name}${niceFieldName}`;

            mutation[mutationName] = async function(_, {id, linked}) {

                const object = await ModelClass.find(id);
                if(!object) {
                    return false;
                }

                await object.$relatedQuery(e.field).unrelate();

                if(linked && ((e.array === true && linked.length) || e.array === false)) {
                    await object.$relatedQuery(e.field).relate(linked);
                }

                return true;
            };
        });
    }

    const completeTaskMutationName = `completeTaskFor${task.name}`;
    mutation[completeTaskMutationName] = async function(_, {id, taskId, state}) {

        return completeTaskForInstance(ModelClass, states, id, taskId, state);
    };

    const r = {
        Mutation: mutation,
        Query: query
    };

    r[task.name] = fieldResolvers;
    return r;
}



async function createInstanceWithModelClass(ModelClass, task) {

    const newInstance = new ModelClass({
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
    });

    if(task.model && task.model.elements) {

        task.model.elements.forEach(e => {

            if(e.defaultEnumValue) {

                //FIXME: will need to check enum exists and value is valid
                const [enumName, value] = e.defaultEnumValue.split(".");
                newInstance[e.field] = value;

            } else if(e.defaultValue) {

                newInstance[e.field] = e.defaultValue;
            }
        });

        //defaultEnumValue
    }

    await newInstance.save();

    const { processKey } = task.options;
    const createProcessOpts = {
        key: processKey,
        businessKey: newInstance.id
    };

    return processDefinitionService.start(createProcessOpts).then(data => {
        return newInstance;
    });
}


async function getInstanceForModelClass(ModelClass, task, input, info, relationFields) {

    // We have a listing of fields which contain 'relations' to other fields. Take a look at what
    // has been requested and then create a list of eager loading relation fields that we
    // also want to resolve at the same time.

    const fieldsWithoutTypeName = GraphQLFields(info, {}, { excludedFields: ['__typename'] });
    let eagerResolves = null;

    if(relationFields && relationFields.length && fieldsWithoutTypeName) {
        const topLevelFields = Object.keys(fieldsWithoutTypeName);
        eagerResolves = relationFields.filter(f => topLevelFields.indexOf(f) !== -1);
    }

    return await ModelClass.find(input.id, eagerResolves);
}


async function updateInstanceWithModelClass(ModelClass, task, {input}) {

    const modelDef = task.model;
    if(task.model.input !== true) {
        throw new Error("Model is not defined as an allowing updates.");
    }

    const object = await ModelClass.find(input.id);

    delete input.id;

    // Create a listing of fields that can be updated, then we apply the update to the model object
    // provided that it is within the list of allowed fields.

    const allowedFields = _allowedInputKeysForModelUpdateInput(modelDef);

    Object.keys(input).forEach(key => {
        if(allowedFields.hasOwnProperty(key)) {
            object[key] = input[key];
        }
    });

    await object.save();
    return true;
}


function _allowedInputKeysForModelUpdateInput(model) {

    // For the model definition we want to determine the allowed input fields.

    const allowedInputFields = {};

    model.elements.forEach(e => {
        if(e.field && e.input !== false) {
            allowedInputFields[e.field] = e;
        }
    });

    return allowedInputFields;
}



async function getTasksForInstance(instanceID) {

    // From the business process engine fetch all the tasks that are currently associated with
    // the provided object identifier.

    // FIXME: security and filtering will need to be applied here to ensure the user has access rights to view the instanceID in the first instance

    const taskOpts = {processInstanceBusinessKey:instanceID};

    return taskService.list(taskOpts).then((data) => {

        const tasks = data._embedded.tasks || data._embedded.task;

        tasks.forEach(task => {
            delete task._links;
            delete task._embedded;
        });

        return tasks;

    }).catch((err) => {

        console.error("BPM engine request failed due to: " + err.toString());
        return Promise.reject(new Error("Unable to fetch tasks for instance due to business engine error."));
    });
}



async function completeTask({ taskId, variables }) {

    // Take the defined task identifier and mark the task as being completed within the business process engine.

    const taskOpts = {id: taskId};

    if(variables && variables.length) {
        const newVars = {};
        variables.filter(v => v.key).filter(v => (typeof(v.value) === "string" || typeof(v.value) === "number" || v.value === null)).forEach(value => {
            newVars[value.key] = {value: value.value};
        });
        taskOpts.variables = newVars;
    }

    return taskService.complete(taskOpts).then((data) => {

        return true;

    }).catch((err) => {

        console.error("BPM engine request failed due to: " + err.toString());
        return Promise.reject(new Error("Unable to complete task for instance due to business engine error."));
    });

}



async function completeTaskForInstance(ModelClass, stateElements, id, taskId, state) {

    const instance = await ModelClass.find(id);
    if(!instance) {
        throw new Error("Instance with identifier not found.");
    }

    // FIXME: check to ensure that the taskId exists and is associated with the instance provided

    const allowedKeys = stateElements ? stateElements.map(e => e.field) : [];
    const filteredState = (state && allowedKeys && allowedKeys.length) ? _.pick(state, allowedKeys) : null;
    const taskOpts = {id: taskId};

    // If we have a state update to apply then we can do this here and now.
    if(filteredState && Object.keys(filteredState).length) {

        let didModify = false;
        const newVars = {};

        Object.keys(filteredState).forEach(key => {

            const value = filteredState[key];

            if(instance[key] !== value) {
                instance[key] = value;
                didModify = true;
            }

            if(typeof(value) === "string" || typeof(value) === "number" || value === null) {
                newVars[key] = {value: value};
            }
        });

        taskOpts.variables = newVars;

        if(didModify) {
            await instance.save();
        }
    }

    return taskService.complete(taskOpts).then((data) => {

        return true;

    }).catch((err) => {

        logger.error(`Unable to complete business process engine task due to error: ${err.toString()}`);
        throw new Error("Unable to complete task for instance due to business engine error.");
    });

}
