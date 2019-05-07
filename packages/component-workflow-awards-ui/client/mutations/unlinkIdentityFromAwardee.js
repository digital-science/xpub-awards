import gql from 'graphql-tag';
import { useMutation } from 'react-apollo-hooks';

const unlinkIdentityFromAwardee = gql`
    mutation UnlinkIdentityFromAwardee($awardeeId:ID!) {
      result: linkIdentityToAwardee(input: {
        awardeeId: $awardeeId
        identityId: null
      })
    }
`;

export default (opts = {}) => {

    const mutation = useMutation(unlinkIdentityFromAwardee, opts);

    return function wrappedUnlinkIdentityFromAwardee(awardeeId) {

        const options = Object.assign({}, opts);
        options.variables = {
            awardeeId
        };

        return mutation(options).then(result => {
            return (result && result.data) ? result.data.result : null;
        });
    };
};

