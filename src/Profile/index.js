import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Loading from '../Loading';
import ErrorMessage from '../Error';
import RepositoryList from '../Repository';

const GET_CURRENT_USER = gql`
  {
    viewer {
      login
      name
    }
  }
`;

const GET_REPOSITORIES_OF_ORGANIZATION = gql`
  {
    organization(login:"the-road-to-learn-react") {
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
      ) {
        edges {
          node {
            name
            url
            descriptionHTML
            primaryLanguage {
              name
            }
            owner {
              login
              url
            }
            stargazers {
              totalCount
            }
            viewerHasStarred
            watchers {
              totalCount
            }
            viewerSubscription
          }
        }
      }
    }
  }
`;

const GET_REPOSITORIES_OF_CURRENT_USER = gql`
  {
    viewer {
      repositories(
        first: 5
        orderBy: { direction: DESC, field: STARGAZERS }
      ) {
        edges {
          node {
            id
            name
            url
            descriptionHTML
            primaryLanguage {
              name
            }
            owner {
              login
              url
            }
            stargazers {
              totalCount
            }
            viewerHasStarred
            watchers {
              totalCount
            }
            viewerSubscription
          }
        }
      }
    }
  }
`;

const Profile = () =>
    <Query query={GET_REPOSITORIES_OF_ORGANIZATION}>
        {({ data, loading, error }) => {
            if (error) {
                return <ErrorMessage error={error} />;
            }

            if (!data) {
                return null;
            }
            console.log(data);

            const { viewer, organization } = data;
            //const { organization } = data;

            if (loading || !organization) {
                return <Loading />;
            }

            return <RepositoryList repositories={organization.repositories} />;
        }}
    </Query>

export default Profile;