import { $cms } from "@jx3box/jx3box-common/js/https";

// 获取公开命名空间列表
function getNamespaceList(params) {
    return $cms().get("/api/cms/namespace", {
        params,
    });
}

// 获取详情
function getNamespaceDetail(id) {
    return $cms().get(`/api/cms/namespace/${id}`);
}

export { getNamespaceList, getNamespaceDetail };
