import { $cms } from "@jx3box/jx3box-common/js/https";

function getCollections(params) {
    return $cms()({
        method: "GET",
        url: `/api/cms/post/collection`,
        params: params,
    });
}

function removeCollection(collection_id) {
    return $cms()({
        method: "DELETE",
        url: `/api/cms/post/collection/${collection_id}`,
    });
}

function getCollection($collection_id) {
    return $cms()({
        method: "GET",
        url: `/api/cms/post/collection/${$collection_id}`,
    });
}

function updateCollection(id, data) {
    return $cms().put(`/api/cms/manage/post/collection/${id}`, data);
}

// 管理员发送私信
function sendMessage(data) {
    return $cms().post(`/api/cms/manage/message`, data);
}

export { getCollections, removeCollection, getCollection, updateCollection, sendMessage };
