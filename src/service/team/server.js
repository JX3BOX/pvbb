import { $cms } from "@jx3box/jx3box-common/js/api";

function getUserInfo(uid) {
    return $cms().get(`/api/cms/user/${uid}/info`);
}

function getNews(type, limit = 5) {
    let _params = {
        type: type,
        status: 1,
    };
    if (limit) {
        _params.limit = limit;
    }
    return $cms().get(`/api/cms/news`, {
        params: _params,
    });
}

function getBanner() {
    return $cms().get(`/api/cms/news/v2`, {
        params: {
            type: "common",
            subtype: "team",
            limit: 5,
            status: 1,
        },
    });
}

function uploadImage(formdata) {
    return $cms().post(`/api/cms/upload/avatar`, formdata);
}

function getEvent(params) {
    return $cms().get(`/api/cms/team/event`, { params });
}

function getEventAid(params) {
    return $cms().get(`/api/cms/team/event/aid`, { params });
}

const getConfigBanner = (params) => {
    return $cms().get(`api/cms/config/banner`, {
        params,
    });
};

export { getUserInfo, getNews, uploadImage, getBanner, getEvent, getEventAid, getConfigBanner };
