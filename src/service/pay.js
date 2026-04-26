import { $pay } from "@jx3box/jx3box-common/js/api";

export const getHistorySummary = (postType, postId) => {
    return $pay().get(`/api/inspire/article/${postType}/${postId}/history/summary`);
};

// 文章中 at 某人
export const atAuthors = ({ sendUserId, accessUserId, postId, postType }) => {
    return $pay({ mute: true }).get(`/api/horn/${sendUserId}/to/user/article/${postType}/${postId}`, {
        params: {
            accessUserId,
        },
    });
};

// 管理员加精自动品鉴
export function autoAppraise(postType, articleId, userId, data) {
    return $pay().post(`/api/inspire/article/${postType}/${articleId}/manager2creator/${userId}/auto-for-highlight`, data)
}

// 管理员取消加精自动品鉴
export function autoUnAppraise(postType, articleId, userId) {
    return $pay().delete(`/api/inspire/article/${postType}/${articleId}/manager2creator/${userId}/auto-for-highlight`)
}
