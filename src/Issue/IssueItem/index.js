import React from 'react';
import { withState } from 'recompose';

import Link from '../../Link';
import Comments, { CommentFilter } from '../../Comment';

import './style.css';

const IssueItem = ({ issue, repositoryOwner, repositoryName, showComments, setShowComments }) => (
    <div className="IssueItem">
        {/* placeholder to add a show/hide comment button later */}
        <CommentFilter showComments={showComments} setShowComments={setShowComments} repositoryOwner={repositoryOwner} repositoryName={repositoryName} issueNumber={issue.number} />
        <div className="IssueItem-content">
            <h3>
                <Link href={issue.url}>{issue.title}</Link>
            </h3>
            <div dangerouslySetInnerHTML={{ __html: issue.bodyHTML }} />
            {/* placeholder to render a list of comments later */}
            {showComments && <Comments repositoryOwner={repositoryOwner} repositoryName={repositoryName} issueId={issue.id} issueNumber={issue.number} />}
        </div>
    </div>
);


export default withState('showComments', 'setShowComments', false)(IssueItem);
