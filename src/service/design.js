import { $cms } from "@jx3box/jx3box-common/js/https";

export const getDesignLog = (params) => {
    return $cms().get(`/api/cms/design/task/log`, { params });
};

export const getBannerList = (params) => {
    return $cms().get(`/api/cms/news/v2`, { params });
};

// 管理推送接口

export const createDesignTask = (data) => {
    return $cms().post(`/api/cms/design/task`, data);
};

export const getDesignTask = (params) => {
    return $cms().get(`/api/cms/design/task/log`, { params });
};

export const getConfigBannerTypes = (params) => {
    return $cms().get(`/api/cms/config/banner/types`, { params });
};
