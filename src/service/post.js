import { $cms, $next } from "@jx3box/jx3box-common/js/https";

function getMyPost(params) {
    return $cms().get("/api/cms/posts/my", {
        params: params,
    });
}

function getPosts(params) {
    return $cms().get("/api/cms/posts", {
        params,
    });
}
function getPost(id) {
    return $cms().get(`/api/cms/post/${id}`);
}


function removeFeedback(id) {
    return $cms().put(`/api/cms/post/${id}/setting`, {
        post_status: "dustbin",
    });
}

function getTopicsCount(params) {
    return $cms().get(`/api/cms/post/topics/count`, { params });
}

export { getPosts, getPost, getMyPost, removeFeedback, getTopicsCount };
