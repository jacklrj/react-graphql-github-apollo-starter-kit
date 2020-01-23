import React, { Fragment } from 'react';
import RepositoryItem from '../RepositoryItem';
import Loading from '../../Loading';
import FetchMore from '../../FetchMore';
import '../style.css';

const getUpdateQuery = entry => (previousResult, { fetchMoreResult }) => {
    if (!fetchMoreResult) {
        return previousResult;
    }
    return {
        ...previousResult,
        [entry]: {
            ...previousResult.organization,
            repositories: {
                ...previousResult[entry].repositories,
                ...fetchMoreResult[entry].repositories,
                edges: [
                    ...previousResult[entry].repositories.edges,
                    ...fetchMoreResult[entry].repositories.edges,
                ],
            },
        },
    };
};

const RepositoryList = ({ repositories, loading, fetchMore, entry }) => (
    <Fragment>
        {repositories.edges.map(({ node }) => (
            <div key={node.id} className="RepositoryItem">
                <RepositoryItem {...node} />
            </div>
        ))}
        <FetchMore
            loading={loading}
            hasNextPage={repositories.pageInfo.hasNextPage}
            variables={{ cursor: repositories.pageInfo.endCursor }}
            updateQuery={getUpdateQuery(entry)}
            fetchMore={fetchMore}>
            Repositories
        </FetchMore>
    </Fragment>
);
export default RepositoryList;