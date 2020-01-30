import gql from 'graphql-tag';
const COMMENT_FRAGMENT = gql`
  fragment comment on IssueComment {
    id
    author {
      login
      url
    }
    createdAt
    url
    bodyHTML
  }
`;
export default COMMENT_FRAGMENT;