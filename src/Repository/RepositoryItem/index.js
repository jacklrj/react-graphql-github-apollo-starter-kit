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

const UPDATE_SUBCRIPTION = gql`
  mutation($id: ID!, $state: SubscriptionState!) {
    updateSubscription (input: { subscribableId: $id, state: $state }) {
        subscribable {
        id
        viewerSubscription
      }
    }
  }
`;

const VIEWER_SUBSCRIPTIONS = {
    SUBSCRIBED: "SUBSCRIBED",
    UNSUBSCRIBED: "UNSUBSCRIBED"
};

const isWatch = viewerSubscription =>
    viewerSubscription === VIEWER_SUBSCRIPTIONS.SUBSCRIBED;

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
                totalCount
            }
        }
    });
};

const onUpdateSubscription = (
    client,
    { data: { updateSubscription: { subscribable: { id } } } },
) => {
    const repository = client.readFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
    });
    let totalCount = repository.watchers.totalCount;
    totalCount = isWatch(repository.viewerSubscription) ? totalCount + 1 : totalCount - 1;
    client.writeFragment({
        id: `Repository:${id}`,
        fragment: REPOSITORY_FRAGMENT,
        data: {
            ...repository,
            watchers: {
                ...repository.watchers,
                totalCount
            }
        }
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
                        <Mutation
                            mutation={STAR_REPOSITORY}
                            variables={{ id }}
                            optimisticResponse={{
                                addStar: {
                                    __typename: 'Mutation',
                                    starrable: {
                                        __typename: 'Repository',
                                        id,
                                        viewerHasStarred: !viewerHasStarred
                                    },
                                },
                            }}
                            update={updateAddStar}>
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
                            <Mutation
                                mutation={UNSTAR_REPOSITORY}
                                variables={{ id }}
                                optimisticResponse={{
                                    removeStar: {
                                        __typename: 'Mutation',
                                        starrable: {
                                            __typename: 'Repository',
                                            id,
                                            viewerHasStarred: !viewerHasStarred
                                        },
                                    },
                                }}
                                update={updateRemoveStar}>
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

                    <Mutation
                        mutation={UPDATE_SUBCRIPTION}
                        variables={{
                            id, state: isWatch(viewerSubscription)
                                ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
                                : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
                        }}
                        optimisticResponse={{
                            updateSubscription: {
                                __typename: 'Mutation',
                                subscribable: {
                                    __typename: 'Repository',
                                    id,
                                    viewerSubscription: isWatch(viewerSubscription)
                                        ? VIEWER_SUBSCRIPTIONS.UNSUBSCRIBED
                                        : VIEWER_SUBSCRIPTIONS.SUBSCRIBED,
                                },
                            },
                        }}
                        update={onUpdateSubscription} >
                        {(updateSubscription, { data, loading, error }) => (
                            <Button
                                className={'RepositoryItem-title-action'}
                                onClick={updateSubscription}
                            >  {watchers.totalCount}{' '}
                                {isWatch(viewerSubscription) ? 'Unwatch' : 'Watch'}
                            </Button>
                        )}
                    </Mutation>

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
        </div >
    );
export default RepositoryItem;