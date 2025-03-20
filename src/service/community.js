import { $next, $cms } from "@jx3box/jx3box-common/js/https";
import axios from "axios";
import { __cdn } from "@jx3box/jx3box-common/data/jx3box";

const API_PREFIX = `/api/next2`;
const gs_url = process.env.NODE_ENV === "development" ? "" : "https://gs.jx3box.com";
// 获取分类
function getTopicBucket(params) {
    return $cms().get(`/api/cms/topic/bucket`, { params });
}

// 获取公开的讨论主题帖子列表
const getTopicList = (params) => {
    return $next().get(`${API_PREFIX}/community/discussion/topic/list`, { params });
};

// 获取帖子详情
function getTopicDetails(id, params) {
    return $next().get(`${API_PREFIX}/community/discussion/topic/item/${id}`, { params });
}

// 管理员-获取帖子详情 查看审核的帖子
function getTopicDetailsFromAdmin(id) {
    return $next().get(`${API_PREFIX}/community/discussion/manage/topic/item/${id}`);
}

// 获取帖子回复列表
function getTopicReplyList(id, params) {
    return $next().get(`${API_PREFIX}/community/discussion/topic/item/${id}/reply/list`, {
        params,
    });
}

// 回复主贴
function replyTopic(id, data) {
    return $next().post(`${API_PREFIX}/community/discussion/topic/item/${id}/reply`, data);
}
// 删除我的回贴
function deleteMyReply(id) {
    return $next().delete(`${API_PREFIX}/community/discussion/my/reply/item/${id}`);
}
//  删除我的帖子的回帖
function delReplyToMyTopic(id, replyId) {
    return $next().delete(`${API_PREFIX}/community/discussion/my/topic/item/${id}/reply/item/${replyId}`);
}

// 删除回复我的回复
function delCommentToMyReply(id, commentId) {
    return $next().delete(`${API_PREFIX}/community/discussion/my/reply/item/${id}/comment/item/${commentId}`);
}

// 删除我的评论
function delMyComment(id) {
    return $next().delete(`${API_PREFIX}/community/discussion/my/comment/item/${id}`);
}

// 主贴回帖的评论
function replyReply(id, replyId, data) {
    return $next().post(`${API_PREFIX}/community/discussion/topic/item/${id}/reply/item/${replyId}/comments`, data);
}

/**
 * 获取评论列表
 * @param {*} id
 * @param {*} replyId
 * @param {*} params
 * @returns
 */
function getCommentList(id, replyId, params) {
    return $next().get(`${API_PREFIX}/community/discussion/topic/item/${id}/reply/item/${replyId}/comments/list`, {
        params,
    });
}
/**
 * 屏蔽用户
 * @param {*} userId
 * @returns
 */
function addBlock(userId) {
    return $next().post(`/api/my-userlist/deny/${userId}`);
}

/**
 * 提交反馈
 * @param {*} data
 */
function feedback(data) {
    return $next().post(`/api/miscfeedback`, data);
}

function globalSearch(params) {
    return axios.get(`${gs_url}/api/search`, {
        params: params,
    });
}

// ============== 管理接口 ==============
/**
 * 管理员删除评论
 * @param {*} id
 */
function manageDelComment(id) {
    return $next().delete(`${API_PREFIX}/community/discussion/manage/comment/item/${id}`);
}

/**
 * 管理员删除回帖
 * @param {*} id
 */
function manageDelReply(id) {
    return $next().delete(`${API_PREFIX}/community/discussion/manage/reply/item/${id}`);
}

function getSkinJson() {
    let url = __cdn + `design/decoration/community_skin.json?${Date.now()}`;
    return axios.get(url);
}

export {
    globalSearch,
    getTopicList,
    getTopicBucket,
    getTopicDetails,
    getTopicReplyList,
    replyTopic,
    delReplyToMyTopic,
    delCommentToMyReply,
    replyReply,
    getCommentList,
    deleteMyReply,
    delMyComment,
    addBlock,
    feedback,
    manageDelComment,
    manageDelReply,
    getSkinJson,
    getTopicDetailsFromAdmin,
};
