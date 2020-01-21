import React from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import Link from '../../Link';
import Button from '../../Button';
import { REPOSITORY_FRAGMENT } from '..';
import '../style.css';

const STAR_REPOSITORY = gql`
  mutation($id: ID!) {
    addStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

const UNSTAR_REPOSITORY = gql`
  mutation($id: ID!) {
    removeStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

const WATCH_REPOSITORY = gql`
  mutation($id: ID!) {
    updateSubscription (input: { subscribableId: $id, state: SUBSCRIBED }) {
        subscribable {
        id
        viewerSubscription
      }
    }
  }
`;

const UNWATCH_REPOSITORY = gql`
  mutation($id: ID!) {
    updateSubscription (input: { subscribableId: $id, state: UNSUBSCRIBED }) {
        subscribable {
        id
        viewerSubscription
      }
    }
  }
`;

const updateAddStar = (
    client,
    { data: { addStar: { starrable: { id } } } },
) => {
    const repository = client.readFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
    });
    const totalCount = repository.stargazers.totalCount + 1;
    client.writeFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
        data: {
            ...repository,
            stargazers: {
                ...repository.stargazers,
                totalCount,
            },
        },
    });
};

const updateRemoveStar = (
    client,
    { data: { removeStar: { starrable: { id } } } },
) => {
    const repository = client.readFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
    });
    const totalCount = repository.stargazers.totalCount - 1;
    client.writeFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
        data: {
            ...repository,
            stargazers: {
                ...repository.stargazers,
                totalCount,
            },
        },
    });
};

const RepositoryItem = ({
    id,
    name,
    url,
    descriptionHTML,
    primaryLanguage,
    owner,
    stargazers,
    watchers,
    viewerSubscription,
    viewerHasStarred,
}) => (
        <div>
            <div className="RepositoryItem-title">
                <h2>
                    <Link href={url}>{name}</Link>
                </h2>
                <div>
                    {!viewerHasStarred ? (
                        <Mutation mutation={STAR_REPOSITORY} variables={{ id }} update={updateAddStar}>
                            {(addStar, { data, loading, error }) => (
                                <Button
                                    className={'RepositoryItem-title-action'}
                                    onClick={addStar}
                                >
                                    {stargazers.totalCount} Star
                                </Button>
                            )}
                        </Mutation>
                    ) : (
                            <Mutation mutation={UNSTAR_REPOSITORY} variables={{ id }} update={updateRemoveStar}>
                                {(removeStar, { data, loading, error }) => (
                                    <Button
                                        className={'RepositoryItem-title-action'}
                                        onClick={removeStar}
                                    >
                                        {stargazers.totalCount} Unstar
                                </Button>
                                )}
                            </Mutation>
                        )}
                    {viewerSubscription === "UNSUBSCRIBED" ? (
                        <Mutation mutation={WATCH_REPOSITORY} variables={{ id }}>
                            {(updateSubscription, { data, loading, error }) => (
                                <Button
                                    className={'RepositoryItem-title-action'}
                                    onClick={updateSubscription}
                                >Watch
                                </Button>
                            )}
                        </Mutation>
                    ) : (
                            <Mutation mutation={UNWATCH_REPOSITORY} variables={{ id }}>
                                {(updateSubscription, { data, loading, error }) => (
                                    <Button
                                        className={'RepositoryItem-title-action'}
                                        onClick={updateSubscription}
                                    >Unwatch
                                    </Button>
                                )}
                            </Mutation>
                        )}
                </div>
            </div>
            <div className="RepositoryItem-description">
                <div
                    className="RepositoryItem-description-info"
                    dangerouslySetInnerHTML={{ __html: descriptionHTML }}
                />
                <div className="RepositoryItem-description-details">
                    <div>
                        {primaryLanguage && (
                            <span>Language: {primaryLanguage.name}</span>
                        )}
                    </div>
                    <div>
                        {owner && (
                            <span>
                                Owner: <a href={owner.url}>{owner.login}</a>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
export default RepositoryItem;