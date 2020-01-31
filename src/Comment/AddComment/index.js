import React, { Fragment, useState } from 'react';
import gql from 'graphql-tag';
import { Mutation, ApolloConsumer } from 'react-apollo';

import Button from '../../Button';
import COMMENT_FRAGMENT from '../fragments';

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
const updateAddComment = (
    client, data

) => {
    console.log(data);
    const repository = client.readFragment({
        id: `Issue:${data.data.addComment.subject.id}`,
        fragment: ISSUE_FRAGMENT,
    });
    console.log(repository);
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

const AddComment = ({ id, commentsState, setCommentsState }) => {
    const [commentInput, setCommentInput] = useState();

    const onCommentTextAreaChange = (event) => {
        setCommentInput(event.target.value);
    };

    return (
        <>
            <textarea onChange={onCommentTextAreaChange} value={commentInput}></textarea>
            <Mutation
                mutation={ADD_COMMENT}
                variables={{
                    id, body: commentInput
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