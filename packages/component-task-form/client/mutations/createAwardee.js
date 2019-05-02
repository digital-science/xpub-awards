import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

const createAwardeeMutation = gql`
    mutation CreateAwardee($input:CreateAwardeeInput) {
        awardeeId: createAwardee(input:$input)
    }
`;

export default (opts = {}) => {

    const mutation = useMutation(createAwardeeMutation, opts);

    return function wrappedCreateAwardeeMutation(input) {

        const options = Object.assign({}, opts);
        options.variables = {input};

        return mutation(options).then(result => {
            return (result && result.data) ? result.data.awardeeId : null;
        });
    };
};