import { $next } from "@jx3box/jx3box-common/js/https";
function getLikes(params) {
    return $next().get(`/api/summary/batch`, {
        params,
    });
}

function getBirthdayList(params) {
    return $next().get(`/api/next2/users/birthday/today`, {
        params
    })
}

export { getLikes, getBirthdayList }
