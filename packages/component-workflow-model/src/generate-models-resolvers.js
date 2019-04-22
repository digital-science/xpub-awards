/* For each task we need to create a new "Model" class instance. In addition to this, we also create the base set
* of GraphQL endpoint resolvers. */

const { AwardsBaseModel } = require('component-model');
const { processDefinitionService, processInstanceService, taskService } = require('component-workflow/src/workflow');


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
        const r = createResolversForTask(task, models);
        Object.assign(resolvers, r);
    });

    return {models:allModels, resolvers};
};


/**/
/* Common Resolvers shared between multiple models. */
/**/
exports.commonResolvers = {
    Mutation: {
        completeTask: async function(ctxt, input) {
            return completeTask(input);
        }
    }
};



function createModelForTask(task, enums, lookupModel) {

    const model = task.model;
    if(!model) {
        return;
    }

    const p = model.elements.map(element => {

        if(element.type === "String") {
            return {key:element.field, value:{type:['string', 'null']}};
        } else if(element.type === "Integer") {
            return {key:element.field, value:{type:['integer', 'null']}};
        } else if(element.type === "ID") {
            return {key:element.field, value:{type:['string', 'null'], format:'uuid'}};
        }

        if(enums.hasOwnProperty(element.type)) {
            return {
                key:element.field,
                value:{
                    type:{ enum: enums[element.type].values }
                }
            };
        }

        return null;

    }).filter(e => !!e);

    const tableName = task.name.replace(/^(.)/g, (a) => a.toLowerCase()).replace(/([A-Z])/g, (a) => '-' + a.toLowerCase());
    const properties = {};
    p.forEach(p => {
        properties[p.key] = p.value;
    });

    const createClass = (name, cls) => ({
        [name] : class extends cls {
            static get tableName() {
                return tableName;
            }

            static get schema() {
                return {type:'object', properties};
            }
        }
    })[name];

    return createClass(task.name, AwardsBaseModel);
}



function createResolversForTask(task, models) {

    const ModelClass = models[task.name];

    const simpleCreate = async function _create() {
        return createInstanceWithModelClass(ModelClass, task);
    };

    const simpleGet = async function _get(ctxt, input) {
        return getInstanceForModelClass(ModelClass, task, input);
    };

    const simpleUpdate = async function(ctxt, input) {
        return updateInstanceWithModelClass(ModelClass, task, input);
    };


    const mutation = {};
    mutation[`create${task.name}`] = simpleCreate;

    const query = {};
    query[`get${task.name}`] = simpleGet;

    const r = {
        Mutation: mutation,
        Query: query
    };

    r[task.name] = {
        tasks: async function tasksResolver(obj) {
            return getTasksForInstance(obj.id);
        }
    };

    return r;
}



async function createInstanceWithModelClass(ModelClass, task) {

    console.log("creating new instance");
    const newInstance = new ModelClass({
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
    });

    console.log("saving new instance");

    await newInstance.save();

    // now that we have an instance of the object, we can create the process instance as well

    console.log("done creating new instance");

    const { processKey } = task.options;

    const createProcessOpts = {
        key: processKey,
        businessKey: newInstance.id
    };

    return processDefinitionService.start(createProcessOpts).then(data => {

        console.log(JSON.stringify(data, null, 4));
        return newInstance;
    });
}


async function getInstanceForModelClass(ModelClass, task, input) {

    console.dir(input.id);
    console.log("finding instance: " + input.id);

    return await ModelClass.find(input.id);
}


async function updateInstanceWithModelClass(ModelClass, task, input) {

    const modelDef = task.model;
    if(task.model.input !== true) {
        throw new Error("Model is not defined as an allowing updates.");
    }

    const object = await ModelClass.find(input.id);

    delete input.id;

    const allowedKeys =


}


function _allowedInputKeysForModelUpdateInput(model) {

    // For the model definition we want to determine the allowed input types.
    ///
    
}



async function getTasksForInstance(instanceID) {

    const taskOpts = {processInstanceBusinessKey:instanceID};

    return taskService.list(taskOpts).then((data) => {

        console.log(JSON.stringify(data, null, 4));

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



async function completeTask(input) {

    console.log("completeTask");
    console.dir(input.taskId);

    // sdfsd
}
