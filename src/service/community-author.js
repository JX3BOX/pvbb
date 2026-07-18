import { getUserInfo } from "@jx3box/jx3box-ui/service/author";
import { getAuthorRss } from "@jx3box/jx3box-common/js/rss";
import User from "@jx3box/jx3box-common/js/user";
import { getUserSkin } from "@/service/cms";

const userInfoRequests = new Map();
const userSkinRequests = new Map();
const authorRssRequests = new Map();
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_MAX_SIZE = 200;

function cleanupCache(cache, now = Date.now()) {
    cache.forEach((entry, key) => {
        if (entry.expiresAt <= now) cache.delete(key);
    });

    while (cache.size > CACHE_MAX_SIZE) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
    }
}

function memoize(cache, key, loader) {
    const now = Date.now();
    cleanupCache(cache, now);

    const cached = cache.get(key);
    if (cached) {
        // Map 的迭代顺序作为轻量 LRU；命中后移动到末尾。
        cache.delete(key);
        cache.set(key, cached);
        return cached.request;
    }

    const request = Promise.resolve()
        .then(loader)
        .catch((error) => {
            // 只清理由当前请求写入的记录，避免误删后续刷新产生的新请求。
            if (cache.get(key)?.request === request) {
                cache.delete(key);
            }
            throw error;
        });

    cache.set(key, {
        request,
        expiresAt: now + CACHE_TTL,
    });
    cleanupCache(cache, now);
    return request;
}

function memoizeByUid(cache, uid, loader) {
    return memoize(cache, String(uid), loader);
}

function getCommunityViewerIdentity() {
    if (!User.isLogin()) return "guest";
    return `user:${User.getInfo()?.uid || "authenticated"}`;
}

function getAuthorRssCacheKey(uid, viewerIdentity = getCommunityViewerIdentity()) {
    return `${viewerIdentity}:${String(uid)}`;
}

function getCommunityUserInfo(uid) {
    return memoizeByUid(userInfoRequests, uid, () => getUserInfo(uid));
}

function getCommunityUserSkin(uid) {
    return memoizeByUid(userSkinRequests, uid, () => getUserSkin(uid));
}

function getCommunityAuthorRss(uid) {
    return memoize(authorRssRequests, getAuthorRssCacheKey(uid), () => getAuthorRss({ id: uid }));
}

function clearCommunityAuthorRss(uid, viewerIdentity = getCommunityViewerIdentity()) {
    authorRssRequests.delete(getAuthorRssCacheKey(uid, viewerIdentity));
}

export {
    getCommunityUserInfo,
    getCommunityUserSkin,
    getCommunityAuthorRss,
    clearCommunityAuthorRss,
    getCommunityViewerIdentity,
};
