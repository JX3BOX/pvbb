import axios from "axios";
import { $cms } from "@jx3box/jx3box-common/js/api";
import { __cdn } from "@/utils/config";

const decorationRequests = new Map();

function getMenu(key) {
    return $cms().get(`/api/cms/config/menu/${key}`);
}

function getAuthorInfo() {}

// 获取自定义主题
function getTopicBucket(params) {
    return $cms().get(`/api/cms/topic/bucket`, { params });
}

const getConfigBanner = (params) => {
    return $cms().get(`api/cms/config/banner`, {
        params,
    });
};

//获取装扮
function getDecoration(params) {
    const requestKey = JSON.stringify(
        Object.keys(params || {})
            .sort()
            .reduce((result, key) => {
                result[key] = params[key];
                return result;
            }, {})
    );
    if (decorationRequests.has(requestKey)) {
        return decorationRequests.get(requestKey);
    }

    const request = $cms()
        .get(`/api/cms/user/decoration`, { params })
        .finally(() => decorationRequests.delete(requestKey));
    decorationRequests.set(requestKey, request);
    return request;
}

function getUserSkin(user_id) {
    return $cms().get(`/api/cms/user/skin`, {
        params: { user_id },
    });
}

function getDecorationJson() {
    let url = __cdn + "design/decoration/index.json";
    return axios.get(url);
}

const getUserList = (params) => $cms().get(`/api/cms/user/list`, { params });

export { getMenu, getAuthorInfo, getTopicBucket, getConfigBanner, getUserList, getDecoration, getUserSkin, getDecorationJson };
