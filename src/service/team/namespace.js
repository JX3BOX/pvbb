import { $cms } from "@jx3box/jx3box-common/js/api";

function postNamespace(data) {
    return $cms().post(`/api/cms/namespace/team`, data);
}

function updateNamespace(id, data) {
    return $cms().put(`/api/cms/namespace/${id}`, data);
}

//获取全局铭牌
function getNamespaceByKey(key) {
    return $cms().get(`/api/cms/namespace/key`, {
        params: {
            key: key,
        },
    });
}

// 查找铭牌
function getNamespaceTeam(params) {
    return $cms().get(`/api/cms/namespace/team`, {
        params,
    });
}

export { postNamespace, getNamespaceByKey, getNamespaceTeam, updateNamespace };
