import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';

export default (instanceId, instanceType, fields, opts = {}) => {

    const queryOptions = {
        suspend: false,
        fetchPolicy: 'network-only'
    };

    Object.assign(queryOptions, opts);
    Object.assign(queryOptions, {
        variables: {
            id: instanceId
        }
    });

    const filteredFields = fields.filter(f => f !== "id");

    const getInstanceQuery = gql`
query GetInstance($id:ID) {
  result: get${instanceType.name}(id:$id) {
    id
    tasks {
      id
      formKey
    }
    ${filteredFields.join("\n")}
  }
}
`;

    return useQuery(getInstanceQuery, queryOptions);
};