import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';


function _fieldsObjectToGraphQL(fields, indent) {

    return Object.keys(fields).map(f => {

        const v = fields[f];
        if(v === null) {
            return `${indent}${f}`;
        }

        return `${indent}${f} {\n${_fieldsObjectToGraphQL(v, indent + "  ")}\n${indent}}`;

    }).join("\n");
}



export default (instanceId, instanceType, fields, opts = {}) => {

    const queryOptions = {
        ssr: false,
        suspend: false,
        fetchPolicy: 'network-only'
    };

    Object.assign(queryOptions, opts);
    Object.assign(queryOptions, {
        variables: {
            id: instanceId
        }
    });

    const filteredFields = Object.assign({}, fields || {});

    if(!filteredFields.id) {
        filteredFields.id = null;
    }

    if(!filteredFields.tasks) {
        filteredFields.tasks = {};
    }
    filteredFields.tasks.id = null;
    filteredFields.tasks.formKey = null;

    const getInstanceQuery = gql`
query Get${instanceType.name}Instance($id:ID) {
  result: get${instanceType.name}(id:$id) {
${_fieldsObjectToGraphQL(filteredFields, '    ')}
  }
}
`;

    return useQuery(getInstanceQuery, queryOptions);
};