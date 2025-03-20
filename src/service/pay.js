import { $pay } from "@jx3box/jx3box-common/js/https";

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
