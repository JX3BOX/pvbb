import { $next } from "@jx3box/jx3box-common/js/api";

export function getCollectionRss({ id } = {}) {
    return $next({ mute: true }).get(`/api/next2/rss/overview/post-collection/${id}`);
}

export function subscribeCollection({ id, data } = {}) {
    return $next().post(`/api/next2/rss/subscribe/post-collection/${id}`, data);
}

export function unsubscribeCollection({ id } = {}) {
    return $next().delete(`/api/next2/rss/subscribe/post-collection/${id}`);
}
