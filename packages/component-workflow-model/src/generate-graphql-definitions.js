const { generateModelsAndResolvers, commonResolvers } = require('./generate-models-resolvers');
const tab = "    ";

const baseObjectTypes = `id: ID!
    created: DateTime!
    updated: DateTime
    tasks: [Task]
`;

const baseObjectInputTypes = `id: ID!`;

const staticContent = `


interface Object {
    ${baseObjectTypes}
}

interface WorkflowObject {
    tasks: [Task]
}

type Task {
    id: ID
    created: DateTime
    formKey: String
}


input CompleteTaskInput {
    taskId: ID!
}

extend type Mutation {
    completeTask(input:CompleteTaskInput): Boolean
}


scalar DateTime`;


module.exports = function generateTypeDefsForDefinition(definition) {

    let tasks = [];
    let taskUnion = '';
    let enums = [];
    let models = [];
    const resolvers = Object.assign({}, commonResolvers);

    if(definition.tasks) {
        tasks = Object.values(definition.tasks).map(taskDef => generateTaskTypeDef(taskDef)).filter(v => !!v);
        taskUnion = "\n\n" + 'union WorkflowInstance = ' + Object.values(definition.tasks).map(t => t.name).join(" | ");
    }

    if(definition.enums) {
        enums = Object.values(definition.enums).map(enumDef => generateTypeDefForEnum(enumDef));
    }

    if(definition.models) {
        models = Object.values(definition.models).map(modelDef => generateTypeDefForModel(modelDef));
    }

    const resAndModels = definition.tasks ? generateModelsAndResolvers(Object.values(definition.tasks), definition.enums) : {};

    return {
        typeDefs: tasks.join("\n\n") + taskUnion + "\n\n\n" + models.join("\n\n") + "\n\n\n" + enums.join("\n\n") + staticContent,
        resolvers: _mergeResolvers(resolvers, resAndModels.resolvers),
    };
};


function generateTaskTypeDef(taskDef) {

    if(!taskDef.model) {
        return;
    }

    const modelTypeName = taskDef.name|| taskDef.model.name;
    const modelInputTypeName = `${modelTypeName}Input`;

    const model = generateTypeDefForModel(taskDef.model, taskDef.name, 'Object & WorkflowObject', baseObjectTypes);
    const input = (taskDef.model.input === true) ? generateTypeDefForModelInput(taskDef.model, taskDef.name, baseObjectInputTypes) : '';
    const query = `
extend type Query {
    get${taskDef.name}(id:ID): ${modelTypeName}
}
    `;

    let mutation = `
extend type Mutation {
    create${taskDef.name}: ${modelTypeName}
`;

    if(taskDef.model.input) {
        mutation += tab + `update${taskDef.name}(input:${modelInputTypeName}) : Boolean`;
    }

    mutation += "\n" + '}';

    return model + "\n\n" + input + "\n" + query + "\n" + mutation;
}


function _generateModelFieldsForElementsList(elements, inputFilter=false) {

    return elements.map(e => {

        if(inputFilter && e.hasOwnProperty('input') && e.input === false) {
            return null;
        }

        if(e.array) {
            if(inputFilter && e.input !== true) {
                return null;
            }
            return `${e.field}: [${e.type}]`;
        }

        return `${e.field}: ${e.type}`;

    }).filter(v => !!v);
}


function generateTypeDefForModel(modelDef, name, imp, baseObject) {

    const elements = _generateModelFieldsForElementsList(modelDef.elements);

    return `type ${name || modelDef.name} ${imp ? "implements " + imp + " " : ""}{${baseObject ? "\n" + tab + baseObject : ""}
${elements.map(v => tab + v).join("\n")}
}`;

}


function generateTypeDefForModelInput(modelDef, name, baseObject) {

    const elements = _generateModelFieldsForElementsList(modelDef.elements, true);

    return `input ${name || modelDef.name}Input {${baseObject ? "\n" + tab + baseObject : ""}
${elements.map(v => tab + v).join("\n")}
}`;

}


function generateTypeDefForEnum(enumDef) {

    return `enum ${enumDef.name} {
${enumDef.values.map(v => tab + v).join("\n")}
}`;

}




function _mergeResolvers(target, source) {

    if(!source) {
        return target;
    }

    Object.keys(source).forEach(key => {
        const dest = target[key] || {};
        Object.assign(dest, source[key]);
        target[key] = dest;
    });

    return target;
}