import React, { Fragment } from 'react';
import gql from 'graphql-tag';
import { Query, ApolloConsumer } from 'react-apollo';

import Button from '../../Button';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import CommentItem from '../CommentItem';
import FetchMore from '../../FetchMore';

import '../style.css';

const GET_COMMENTS_OF_ISSUE = gql`
  query($repositoryOwner: String!, $repositoryName: String!, $issueNumber: Int!, $cursor: String) {
    repository(name: $repositoryName, owner: $repositoryOwner) {
      issue(number: $issueNumber) {
        comments(first: 5,  after: $cursor) {
          edges {
            node {
              id
              author {
                login
                url
              }
              createdAt
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
  }
`;

const prefetchComments = (
    client,
    repositoryOwner,
    repositoryName,
    issueNumber
) => {
    client.query({
        query: GET_COMMENTS_OF_ISSUE,
        variables: {
            repositoryOwner,
            repositoryName,
            issueNumber
        },
    });
};

const CommentFilter = ({ showComments, setShowComments, repositoryOwner, repositoryName, issueNumber }) => (
    <ApolloConsumer>
        {client => (
            <Button
                onClick={() => setShowComments((prevState) => !prevState)}
                onMouseOver={() => prefetchComments(client, repositoryOwner, repositoryName, issueNumber)}>
                {!showComments ? "Show Comments" : "Hide Comments"}
            </Button>
        )}
    </ApolloConsumer >
);


const getUpdateQuery = (previousResult, { fetchMoreResult }) => {
    if (!fetchMoreResult) {
        return previousResult;
    }
    return {
        ...previousResult,
        repository: {
            ...previousResult.repository,
            issue: {
                ...previousResult.repository.issue,
                comments: {
                    ...previousResult.repository.issue.comments,
                    ...fetchMoreResult.repository.issue.comments,
                    edges: [
                        ...previousResult.repository.issue.comments.edges,
                        ...fetchMoreResult.repository.issue.comments.edges
                    ]
                }
            }
        }
    };
};

const Comments = ({ repositoryOwner, repositoryName, issueNumber, isShow }) => (
    <Fragment>
        <Query
            query={GET_COMMENTS_OF_ISSUE}
            variables={{
                repositoryOwner,
                repositoryName,
                issueNumber

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

                if (!repository.issue.comments.edges.length) {
                    return <div className="IssueList">No comments ...</div>;
                }

                return (
                    <CommentList comments={repository.issue.comments} loading={loading} fetchMore={fetchMore} />
                );

            }}
        </Query>
    </Fragment >
);

const CommentList = ({ comments, loading, fetchMore }) => (
    <Fragment>
        {
            comments.edges.map(({ node }) => <CommentItem key={node.id} comment={node} />)
        }
        <FetchMore
            loading={loading}
            hasNextPage={comments.pageInfo.hasNextPage}
            variables={{ cursor: comments.pageInfo.endCursor }}
            updateQuery={getUpdateQuery}
            fetchMore={fetchMore}>
            Comments
      </FetchMore>
    </Fragment >
);

export { CommentFilter };
export default Comments;