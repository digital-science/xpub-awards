const { generateModelsAndResolvers, commonResolvers } = require('./generate-models-resolvers');
const { mergeResolvers, filterModelElementsForBasicTypes, filterModelElementsForRelations } = require('./utils');
const GraphQLJSON = require('graphql-type-json');
const path = require('path');
const fs = require("fs");

const ModelFile = require('./../shared-model/file');
const ModelIdentity = require('./../shared-model/identity');
const ModelAwardee = require('./../shared-model/awardee');
const tab = "    ";


const baseObjectTypes = `id: ID!
    created: DateTime!
    updated: DateTime
    tasks: [Task]
`;
const baseObjectInputTypes = `id: ID!`;

const staticContent = fs.readFileSync(path.join(__dirname, '../shared-model/shared.graphqls'), 'utf8');


module.exports = function generateTypeDefsForDefinition(definition) {

    const resolvers = Object.assign({
        JSON: GraphQLJSON
    }, commonResolvers);

    let tasks = [];
    let taskUnion = '';
    let enums = [];
    let models = [];

    if(definition.tasks) {
        tasks = Object.values(definition.tasks).map(taskDef => generateTaskTypeDef(taskDef, definition.enums)).filter(v => !!v);
        taskUnion = "\n\n" + 'union WorkflowInstance = ' + Object.values(definition.tasks).map(t => t.name).join(" | ");
    }

    if(definition.enums) {
        enums = Object.values(definition.enums).map(enumDef => generateTypeDefForEnum(enumDef));
    }

    /*if(definition.models) {
        models = Object.values(definition.models).map(modelDef => generateTypeDefForModel(modelDef, definition.enums));
    }*/

    const topLevelModels = {
        File: ModelFile.model,
        Awardee: ModelAwardee.model,
        Identity: ModelIdentity.model
    };

    const resAndModels = definition.tasks ? generateModelsAndResolvers(Object.values(definition.tasks), definition.enums, topLevelModels) : {};

    mergeResolvers(resolvers, ModelFile.resolvers);
    mergeResolvers(resolvers, ModelIdentity.resolvers);
    mergeResolvers(resolvers, ModelAwardee.resolvers);

    return {
        models: resAndModels.models,
        typeDefs: tasks.join("\n\n") + taskUnion + "\n\n\n" + models.join("\n\n") + "\n\n\n" + enums.join("\n\n") + staticContent,
        resolvers: mergeResolvers(resolvers, resAndModels.resolvers),
    };
};



function generateTaskTypeDef(taskDef, enums) {

    if(!taskDef.model) {
        return;
    }

    const relationElements = filterModelElementsForRelations(taskDef.model.elements, enums);
    const accessorElements = relationElements ? relationElements.filter(e => e.accessors && e.accessors.length) : [];

    const modelTypeName = taskDef.name|| taskDef.model.name;
    const modelInputTypeName = `${modelTypeName}Input`;

    const model = generateTypeDefForModel(taskDef.model, taskDef.name, 'Object & WorkflowObject', baseObjectTypes, enums);
    const input = (taskDef.model.input === true) ? generateTypeDefForModelInput(taskDef.model, taskDef.name, baseObjectInputTypes, enums) : '';
    const query = `
extend type Query {
    get${taskDef.name}(id:ID): ${modelTypeName}
}
    `;

    let mutation = `
extend type Mutation {
`;

    if(!taskDef.model.hasOwnProperty('noCreate') || !(taskDef.model.noCreate === true)) {
        mutation += tab + `create${taskDef.name}: ${modelTypeName}`;
    }

    if(taskDef.model.input) {
        mutation += tab + `update${taskDef.name}(input:${modelInputTypeName}) : Boolean`;
    }

    if(accessorElements.length > 0) {
        const accessorMutations = accessorElements.map(e => {
            let niceFieldName = e.field.charAt(0).toUpperCase() + e.field.slice(1);

            if(e.accessors.indexOf("set") !== -1) {

                if(e.array === true) {
                    return tab + `set${taskDef.name}${niceFieldName}(id:ID, linked:[ID]) : Boolean`;
                }

                return tab + `set${taskDef.name}${niceFieldName}(id:ID, linked:ID) : Boolean`;
            }

            return null;
        });

        mutation += "\n\n" + accessorMutations.filter(v => !!v).join("\n");
    }

    mutation += "\n" + '}';

    return model + "\n\n" + input + "\n" + query + "\n" + mutation;
}


function _generateModelFieldsForElementsList(elements, enums, inputFilter=false) {

    let filteredElements = inputFilter ? filterModelElementsForBasicTypes(elements, enums) : elements;

    return filteredElements.map(e => {

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


function generateTypeDefForModel(modelDef, name, imp, baseObject, enums) {

    const elements = _generateModelFieldsForElementsList(modelDef.elements, enums);

    return `type ${name || modelDef.name} ${imp ? "implements " + imp + " " : ""}{${baseObject ? "\n" + tab + baseObject : ""}
${elements.map(v => tab + v).join("\n")}
}`;

}


function generateTypeDefForModelInput(modelDef, name, baseObject, enums) {

    const elements = _generateModelFieldsForElementsList(modelDef.elements, enums, true);

    return `input ${name || modelDef.name}Input {${baseObject ? "\n" + tab + baseObject : ""}
${elements.map(v => tab + v).join("\n")}
}`;

}


function generateTypeDefForEnum(enumDef) {

    return `enum ${enumDef.name} {
${enumDef.values.map(v => tab + v).join("\n")}
}`;

}
