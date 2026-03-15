import { $next } from "@jx3box/jx3box-common/js/api";
function getLikes(params) {
    return $next().get(`/api/summary/batch`, {
        params,
    });
}

function getBirthdayList(params) {
    return $next().get(`/api/next2/users/birthday/today`, {
        params,
    });
}

function getFans(uid) {
    return $next().get(`/api/next2/rss/overview/author/${uid}`);
}

export { getLikes, getBirthdayList, getFans };
