import React from 'react';

import Link from '../../Link';
import Comments, { CommentFilter } from '../../Comment';

import './style.css';

const IssueItem = ({ issue, repositoryOwner, repositoryName }) => (
    <div className="IssueItem">
        {/* placeholder to add a show/hide comment button later */}
        <CommentFilter />
        <div className="IssueItem-content">
            <h3>
                <Link href={issue.url}>{issue.title}</Link>
            </h3>
            <div dangerouslySetInnerHTML={{ __html: issue.bodyHTML }} />
            {/* placeholder to render a list of comments later */}
            <Comments repositoryOwner={repositoryOwner} repositoryName={repositoryName} issueNumber={issue.number} />
        </div>
    </div>
);


export default IssueItem;