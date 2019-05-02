import gql from 'graphql-tag';
import { useQuery } from 'react-apollo-hooks';

export default (active, opts = {}) => {

    const queryOptions = {
        suspend: false,
        fetchPolicy: 'network-only'
    };

    Object.assign(queryOptions, opts);
    Object.assign(queryOptions, {
        variables: {
            id: active
        }
    });

    const getAwardSubmissionsQuery = gql`
query GetAwardSubmissions($active:Boolean) {
  submissions: awardSubmissions(active:$active) {
    id
    outcome
    files {
      fileName
      fileMimeType
    }
    awardees {
      id
      firstName
      lastName
      affiliation
      email
    }
    tasks {
      id
      formKey
    }
    awardeeAcceptances {
      id
      acceptanceOutcome
      publishingOutcome
      awardee {
        firstName
        lastName
      }
      tasks {
        id
        formKey
      }
    }
  }
}
`;

    return useQuery(getAwardSubmissionsQuery, queryOptions);
};

