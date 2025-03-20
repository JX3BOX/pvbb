import { $cms, $next } from "@jx3box/jx3box-common/js/https";

// 获取推荐骚话
function getRecommendedJokes() {
    return $next({ mute: true }).get(`/api/joke/recommended`);
}

// 发布
function postJoke(data) {
    return $next().post(`/api/joke/share`, data);
}

// 获取 joke 列表
const getJokes = (params) => {
    return $cms().get("/api/cms/post/jokes", {
        params: params,
    });
};

// 获取指定骚话
function getJoke(id) {
    return $cms().get(`/api/cms/post/joke/${id}`);
}

// 标星
const starJoke = (id) => {
    return $cms().put(`/api/cms/post/joke/${id}/star`);
};
// 取消标星
function unstarJoke(id){
    return $cms().put(`/api/cms/post/joke/${id}/unstar`);
}

// 删除
const removeJoke = (id) => {
    return $cms().delete(`/api/cms/post/joke/${id}`);
};

export { getJokes, getJoke, starJoke, removeJoke, getRecommendedJokes,postJoke,unstarJoke };
