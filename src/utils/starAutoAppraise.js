import { autoAppraise, autoUnAppraise } from "@/service/pay";

export async function toggleStarWithAutoAppraise({
    postType,
    articleId,
    userId,
    isStar,
    starRequest,
    unstarRequest,
}) {
    const nextStar = isStar ? 0 : 1;
    const applyCmsRequest = isStar ? unstarRequest : starRequest;
    const rollbackCmsRequest = isStar ? starRequest : unstarRequest;
    const autoRequest = isStar ? autoUnAppraise : autoAppraise;

    await applyCmsRequest(articleId);

    if (!userId) {
        return {
            nextStar,
            skippedAutoAppraise: true,
        };
    }

    try {
        await autoRequest(postType, articleId, userId, {
            client: "std",
            remark: "加精自动品鉴",
            is_anonymity: 1
        });
    } catch (error) {
        let rollbackError = null;

        try {
            await rollbackCmsRequest(articleId);
        } catch (rollbackException) {
            rollbackError = rollbackException;
        }

        const wrappedError = new Error("AUTO_APPRAISE_FAILED");
        wrappedError.cause = error;
        wrappedError.rollbackError = rollbackError;
        throw wrappedError;
    }

    return {
        nextStar,
        skippedAutoAppraise: false,
    };
}
