import React from 'react';
import { Query, ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import { withState } from 'recompose';

import './style.css';

import IssueItem from '../IssueItem';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import { ButtonUnobtrusive } from '../../Button';
import FetchMore from '../../FetchMore';

const ISSUE_STATES = {
  NONE: 'NONE',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
};

const TRANSITION_LABELS = {
  [ISSUE_STATES.NONE]: 'Show Open Issues',
  [ISSUE_STATES.OPEN]: 'Show Closed Issues',
  [ISSUE_STATES.CLOSED]: 'Hide Issues',
};
const TRANSITION_STATE = {
  [ISSUE_STATES.NONE]: ISSUE_STATES.OPEN,
  [ISSUE_STATES.OPEN]: ISSUE_STATES.CLOSED,
  [ISSUE_STATES.CLOSED]: ISSUE_STATES.NONE,
};

const isShow = issueState => issueState !== ISSUE_STATES.NONE;

const GET_ISSUES_OF_REPOSITORY = gql`
  query($repositoryOwner: String!, $repositoryName: String!, $issueState: IssueState!, $cursor: String) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issues(first: 5, states:[$issueState],  after: $cursor) {
        edges {
          node {
            id
            number
            state
            title
            url
            bodyHTML
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

const getUpdateQuery = (previousResult, { fetchMoreResult }) => {
  if (!fetchMoreResult) {
    return previousResult;
  }

  return {
    ...previousResult,
    repository: {
      ...previousResult.repository,
      issues: {
        ...previousResult.repository.issues,
        ...fetchMoreResult.repository.issues,
        edges: [
          ...previousResult.repository.issues.edges,
          ...fetchMoreResult.repository.issues.edges
        ]
      }
    }
  };
};

const prefetchIssues = (
  client,
  repositoryOwner,
  repositoryName,
  issueState,
) => {
  const nextIssueState = TRANSITION_STATE[issueState];
  if (isShow(nextIssueState)) {
    client.query({
      query: GET_ISSUES_OF_REPOSITORY,
      variables: {
        repositoryOwner,
        repositoryName,
        issueState: nextIssueState,
      },
    });
  }
};

const Issues = ({ issueState, onChangeIssueState, repositoryOwner, repositoryName }) => {
  return (
    <div className="Issues">
      <IssueFilter
        repositoryOwner={repositoryOwner}
        repositoryName={repositoryName}
        issueState={issueState}
        onChangeIssueState={onChangeIssueState}
      />

      {isShow(issueState) && (
        <Query
          query={GET_ISSUES_OF_REPOSITORY}
          variables={{
            repositoryOwner,
            repositoryName,
            issueState,
          }}
          notifyOnNetworkStatusChange={true}
        >
          {({ data, loading, error, fetchMore }) => {
            if (error) {
              return <ErrorMessage error={error} />;
            }

            const repository = data ? data.repository : null;

            if (loading && !repository) {
              return <Loading />;
            }

            const filteredRepository = {
              issues: {
                edges: repository.issues.edges.filter(
                  issue => issue.node.state === issueState,
                ),
                ...repository.issues
              },
            };

            if (!filteredRepository.issues.edges.length) {
              return <div className="IssueList">No issues ...</div>;
            }
            return <IssueList
              issues={filteredRepository.issues}
              repositoryOwner={repositoryOwner}
              repositoryName={repositoryName}
              loading={loading}
              fetchMore={fetchMore}
            />;
          }}
        </Query>
      )}
    </div>
  );
}

const IssueList = ({ issues, repositoryOwner, repositoryName, loading, fetchMore }) => (
  <>
    <div className="IssueList">
      {issues.edges.map(({ node }) => (
        <IssueItem
          key={node.id}
          issue={node}
          repositoryOwner={repositoryOwner}
          repositoryName={repositoryName} />
      ))}
    </div>
    <FetchMore
      loading={loading}
      hasNextPage={issues.pageInfo.hasNextPage}
      variables={{ cursor: issues.pageInfo.endCursor }}
      updateQuery={getUpdateQuery}
      fetchMore={fetchMore}>
      Issues
      </FetchMore>
  </>
);

const IssueFilter = ({ repositoryOwner, repositoryName, issueState, onChangeIssueState }) => (
  <ApolloConsumer>
    {client => (
      <ButtonUnobtrusive
        onClick={() =>
          onChangeIssueState(TRANSITION_STATE[issueState])
        }
        onMouseOver={() => prefetchIssues(client, repositoryOwner, repositoryName, issueState)}
      >
        {TRANSITION_LABELS[issueState]}
      </ButtonUnobtrusive>
    )}
  </ApolloConsumer>
);

export default withState(
  'issueState',
  'onChangeIssueState',
  ISSUE_STATES.NONE,
)(Issues);