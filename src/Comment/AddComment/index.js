import React, { Fragment, useState } from 'react';
import gql from 'graphql-tag';
import { Mutation, ApolloConsumer } from 'react-apollo';

import Button from '../../Button';
import COMMENT_FRAGMENT from '../fragments';
import { GET_COMMENTS_OF_ISSUE } from '..'

//import '../style.css';

const ADD_COMMENT = gql`
  mutation($id: ID!, $body: String!) {
    addComment(input:{subjectId: $id, body: $body}) {
      subject {
        id
      }
      commentEdge {
        cursor
        node {
          ...comment
        }
      }
    }
  }
  ${COMMENT_FRAGMENT}
`;

const ISSUE_FRAGMENT = gql`
  fragment issue on Issue {
        comments {
          edges {
            node {
              ...comment
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
}
`;
// const updateAddComment = (
//     client, {data},
//     { data: { addComment: { subject: { id } } } },


const AddComment = ({ repositoryOwner, repositoryName, issueNumber, issueId, cursor }) => {
    const [commentInput, setCommentInput] = useState();

    const onCommentTextAreaChange = (event) => {
        setCommentInput(event.target.value);
    };

    const updateAddComment = (
        client, data

    ) => {
        console.log(data);
        var t = {
            query: GET_COMMENTS_OF_ISSUE,
            variables: { repositoryOwner, repositoryName, issueNumber, cursor }
        };
        console.log(t);
        const comments = client.readQuery({
            query: GET_COMMENTS_OF_ISSUE,
            variables: { repositoryOwner, repositoryName, issueNumber, cursor }
        });
        console.log(comments);
        // const totalCount = repository.stargazers.totalCount - 1;
        // client.writeFragment({
        //     id: `Repository:${id}`,
        //     fragment: REPOSITORY_FRAGMENT,
        //     data: {
        //         ...repository,
        //         stargazers: {
        //             ...repository.stargazers,
        //             totalCount
        //         }
        //     }
        // });
    };

    return (
        <>
            <textarea onChange={onCommentTextAreaChange} value={commentInput}></textarea>
            <Mutation
                mutation={ADD_COMMENT}
                variables={{
                    id: issueId, body: commentInput
                }}
                update={(comments, setComments) => updateAddComment(comments, setComments)}>

                {(addComment, { data, loading, error }) =>
                    <Button className={'RepositoryItem-title-action'} onClick={addComment}>Submit</Button>
                }
            </Mutation>
        </>
    )
};

// optimisticResponse={{
//     updateSubscription: {
//         __typename: 'Mutation',
//         subscribable: {
//             __typename: 'Repository',
//             id,
//             viewerSubscription: isWatch(viewerSubscription)
//                 ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
//                 : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
//         },
//     },
// }}
// update={onUpdateSubscription} >

export default AddComment;