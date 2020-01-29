import React from 'react';
import moment from 'moment';

import Link from '../../Link';

import './style.css';
import { DEFAULT_DEPRECATION_REASON } from 'graphql';

const CommentItem = ({ comment }) => (
    <div className="IssueItem">
        <div className="IssueItem-content">
            <h3>
                <Link href={comment.url}></Link><Link href={comment.author.url}>{comment.author.login}</Link> commented on {moment(comment.createdAt).format("MMM DD, YYYY h:mm A Z")}
            </h3>
            <div dangerouslySetInnerHTML={{ __html: comment.bodyHTML }} />
        </div>
    </div>
);


export default CommentItem;