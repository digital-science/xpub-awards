import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';
import { useMemo } from 'react';


function _generateGraphQL(instanceType, binding) {
    const niceBindingName = binding.charAt(0).toUpperCase() + binding.slice(1);
    return gql`
        mutation SetInstanceBoundAwardees($id:ID, $linked:[ID]) {
          update: set${instanceType.name}${niceBindingName}(id:$id, linked:$linked)
        }`;
}


export default (instanceType, binding, opts = {}) => {

    const setInstanceBoundAwardeesMutation = useMemo(() => _generateGraphQL(instanceType, binding), [instanceType, instanceType.name, binding]);
    const mutation = useMutation(setInstanceBoundAwardeesMutation);

    return function wrappedSetInstanceAssociatedAwardeesMutation(id, linked) {

        const combinedOpts = Object.assign({}, opts);
        combinedOpts.variables = {
            id: id,
            linked: linked || []
        };

        return mutation(combinedOpts).then(result => {
            return (result && result.data) ? result.data.update : null;
        });
    };
};

