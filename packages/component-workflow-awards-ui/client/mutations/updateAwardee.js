import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

const updateAwardeeMutation = gql`
    mutation UpdateAwardee($input:UpdateAwardeeInput) {
        updated: updateAwardee(input:$input)
    }
`;

export default (opts = {}) => {

    const mutation = useMutation(updateAwardeeMutation, opts);

    return function wrappedUpdateAwardeeMutation(input) {

        const options = Object.assign({}, opts);
        options.variables = {input};

        return mutation(options).then(result => {
            return (result && result.data) ? result.data.updated : null;
        });
    };
};