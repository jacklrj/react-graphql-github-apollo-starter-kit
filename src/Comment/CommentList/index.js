import React, { Fragment } from 'react';
import gql from 'graphql-tag';
import { Query, ApolloConsumer } from 'react-apollo';

import Button from '../../Button';
import Loading from '../../Loading';
import ErrorMessage from '../../Error';
import CommentItem from '../CommentItem';

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

const CommentFilter = () => (
    <Button>{true ? "Show Comments" : "Hide Comments"}
    </Button>
);


// const getUpdateQuery = entry => (previousResult, { fetchMoreResult }) => {
//     if (!fetchMoreResult) {
//         return previousResult;
//     }
//     return {
//         ...previousResult,
//         [entry]: {
//             ...previousResult[entry],
//             repositories: {
//                 ...previousResult[entry].repositories,
//                 ...fetchMoreResult[entry].repositories,
//                 edges: [
//                     ...previousResult[entry].repositories.edges,
//                     ...fetchMoreResult[entry].repositories.edges,
//                 ],
//             },
//         },
//     };
// };

const Comments = ({ repositoryOwner, repositoryName, issueNumber }) => (
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

                console.log(repository);
                return (
                    <CommentList comments={repository.issue.comments} />
                );

            }}
        </Query>
    </Fragment >
);

const CommentList = ({ comments }) => (
    <Fragment>
        {
            comments.edges.map(({ node }) => <CommentItem key={node.id} comment={node} />)
        }
    </Fragment >
);

export { CommentFilter };
export default Comments;

// const filteredRepository = {
//     issues: {
//         edges: repository.issues.edges.filter(
//             issue => issue.node.state === issueState,
//         ),
//         ...repository.issues
//     },
// };

// if (!filteredRepository.issues.edges.length) {
//     return <div className="IssueList">No issues ...</div>;
// }
// return <IssueList
//     issues={filteredRepository.issues}
//     loading={loading}
//     fetchMore={fetchMore}
// />;