import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { graphql } from 'react-apollo';
import Loading from '../Loading';
import ErrorMessage from '../Error';
import RepositoryList, { REPOSITORY_FRAGMENT } from '../Repository';

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  query($cursor:String) {
    viewer {
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
        after: $cursor
      ) {
        edges {
          node {
            ...repository
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
  ${REPOSITORY_FRAGMENT}
`;

const Profile = () =>
  <Query query={GET_REPOSITORIES_OF_CURRENT_USER} notifyOnNetworkStatusChange={true}
  >
    {({ data, loading, error, fetchMore }) => {
      if (error) {
        return <ErrorMessage error={error} />;
      }
      const viewer = data ? data.viewer : null;

      if (loading && !viewer) {
        return <Loading />;
      }

      return <RepositoryList
        loading={loading}
        repositories={viewer.repositories}
        fetchMore={fetchMore}
        entry={'viewer'}
      />;
    }}
  </Query>

// const Profile = ({ data, loading, error }) => {
//     if (error) {
//         return <ErrorMessage error={error} />;
//     }
//     const { viewer } = data;
//     if (loading || !viewer) {
//         return <Loading />;
//     }
//     return <RepositoryList repositories={viewer.repositories} />;
// };

export default Profile;
// export default graphql(GET_REPOSITORIES_OF_CURRENT_USER)(Profile);
