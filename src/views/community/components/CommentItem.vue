<template>
    <div class="m-comment-wrapper" :class="{ 'has-decoration': decoration }">
        <div class="m-comment-right" :style="decorationStyles">
            <img
                class="u-avatar"
                :src="showAvatar(isAnonymous ? '' : userInfo.avatar)"
                :alt="$t('pages.community.common.avatarAlt')"
            />
            <div class="m-comment-content">
                <div class="u-content-top">
                    <div class="u-name">
                        <a
                            v-if="!isAnonymous"
                            :href="authorLink(userInfo.id)"
                            :alt="$t('pages.community.common.usernameAlt')"
                            >{{ displayName }}</a
                        >
                        <span v-else>{{ displayName }}</span>
                        <span class="m-comment-time u-mobile-show">{{ post.updated_at }}</span>
                    </div>
                    <div>
                        <el-dropdown class="u-more u-mobile-show" trigger="click" placement="bottom">
                            <span class="el-dropdown-link">
                                <i class="el-icon-more"></i>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item>
                                        <DeleteButton :post="post" type="comment" />
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <AddBlockButton :post="post" />
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <ComplaintButton :post="post" />
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>
                <p class="u-answer-user">{{
                    $t("pages.community.reply.replyTo", { name: replyTargetName })
                }}</p>
                <p class="u-content" v-html="renderContent"></p>
                <div class="u-comment-toolbar">
                    <div class="u-comment-actions">
                        <el-button link size="small" type="primary" @click="addLike" class="">
                            <div class="u-btn-content">
                                <i :class="`u-like-icon ${isLike && 'is-like'}`"
                                    ><img
                                        v-if="!isLike"
                                        src="@/assets/img/community/heart_1.svg"
                                        svg-inline
                                        alt="" /><img v-else src="@/assets/img/community/heart_2.svg" svg-inline alt=""
                                /></i>
                                {{
                                    isLike
                                        ? $t("pages.community.reply.liked")
                                        : $t("pages.community.reply.like")
                                }}
                                <span class="u-count" v-if="likeCount"> ({{ likeCountRender }})</span>
                            </div>
                        </el-button>
                        <el-button
                            link
                            size="small"
                            type="primary"
                            @click="onShowReply"
                            :disabled="!isLogin || isDisabledComment"
                        >
                            <i class="el-icon-chat-round"></i>
                            <span>{{ $t("pages.community.reply.reply") }}</span>
                        </el-button>
                    </div>
                    <div class="u-mobile-hidden">
                        <DeleteButton :post="post" type="comment" />
                        <!-- <AddBlackHoleButton :post="post" type="comment" /> -->
                        <AddBlockButton :post="post" />
                        <ComplaintButton :post="post" />
                        <span class="m-comment-time u-mobile-hidden">{{ post.updated_at }}</span>
                    </div>
                </div>
                <ReplyForReply
                    v-if="showReplyForReplyFrom"
                    :username="displayName"
                    :user-href="isAnonymous ? '' : authorLink(userInfo.id)"
                    @hideForm="showReplyForReplyFrom = false"
                    @doReply="doReply"
                    :commentStrict="commentStrict"
                    :current-id="post.id"
                    :submitting="replySubmitting"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { authorLink, showAvatar, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import JX3_EMOTION from "@jx3box/jx3box-emotion";
import { replyReply } from "@/service/community";
import { postStat } from "@jx3box/jx3box-common/js/stat";
import { getCommunityUserSkin } from "@/service/community-author";
import { __cdn } from "@/utils/config";
import { enableLazyImages } from "@/utils/community";

import ReplyForReply from "./ReplyForReply.vue";
import AddBlockButton from "./AddBlockButton.vue";
import ComplaintButton from "./ComplaintButton.vue";
import DeleteButton from "./DeleteButton.vue";
import sanitizeCommunityReplyHtml from "@/utils/community-rich-text";

export default {
    name: "CommentItem",
    emits: ["decoration-change"],
    props: ["post", "commentStrict"],
    inject: ["getTopicData", "getTopicPassword", "getReplyData", "getCommentList"],
    components: {
        ReplyForReply,
        AddBlockButton,
        // AddBlackHoleButton,
        ComplaintButton,
        DeleteButton,
    },
    data() {
        return {
            decoration: "",
            decorationPosition: "",
            isLike: false,
            likeCount: 0,
            renderContent: "",
            showReplyForReplyFrom: false,
            commentList: [],
            replySubmitting: false,
            renderVersion: 0,
        };
    },
    watch: {
        content: {
            handler: function (val) {
                this.formatContent(val);
            },
            immediate: true,
        },
        "post.likes": {
            handler: function (val) {
                this.likeCount = val;
            },
            immediate: true,
        },
    },
    computed: {
        uid() {
            return this.userInfo?.id || 0;
        },
        // 是否登录
        likeCountRender: function () {
            if (this.likeCount >= 100) {
                return "99+";
            } else if (this.likeCount != 0) {
                return this.likeCount;
            } else {
                return "";
            }
        },
        userInfo: function () {
            return this.post?.user_info || this.post?.ext_user_info || {};
        },
        replyUserInfo: function () {
            return this.post?.reply_for_user_info || {};
        },
        isAnonymous() {
            return !!this.getTopicData()?.anonymous && Number(this.post?.user_id || 0) === 0;
        },
        displayName() {
            return this.isAnonymous
                ? this.$t("pages.community.single.mysteriousUser")
                : this.userInfo.display_name || this.$t("pages.community.common.unknownUser");
        },
        replyTargetName() {
            const anonymousTarget =
                !!this.getTopicData()?.anonymous &&
                Number(this.post?.reply_for_user_id || 0) === 0 &&
                !this.replyUserInfo.id;
            return anonymousTarget
                ? this.$t("pages.community.single.mysteriousUser")
                : this.replyUserInfo.display_name || this.$t("pages.community.common.unknownUser");
        },
        comments: function () {
            return this.post.comments;
        },
        content: function () {
            return this.post.content;
        },
        id: function () {
            return this.post.id;
        },
        isLogin() {
            return User.isLogin();
        },
        isDisabledComment() {
            return !!this.getTopicData()?.disable_comment;
        },
        decorationStyles() {
            return this.decoration
                ? {
                      backgroundImage: `url(${this.decoration})`,
                      backgroundPosition: this.decorationPosition,
                      borderRadius: "8px",
                  }
                : null;
        },
    },
    mounted() {
        this.getDecoration();
    },
    methods: {
        setDecoration(detail) {
            const image = String(detail?.image || "").trim();
            if (!image) return;
            this.decoration = /^(https?:)?\/\//.test(image) ? image : __cdn + image.replace(/^\/+/, "");
            this.decorationPosition = detail.position || "";
            this.$emit("decoration-change", this.post.id);
        },
        getDecoration() {
            if (!this.uid || this.isAnonymous) return;
            getCommunityUserSkin(this.uid)
                .then((res) => {
                    const records = res.data.data || [];
                    const detail = records
                        .flatMap((record) => (Array.isArray(record?.skins) ? record.skins : []))
                        .find((item) => item?.subtype === "pc_comment" && item.image);
                    if (detail) this.setDecoration(detail);
                })
                .catch(() => {});
        },
        authorLink,
        async formatContent(val) {
            const version = ++this.renderVersion;
            val = String(val || "");
            const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])(?![^<>]*>)/gi;
            val = val.replace(urlPattern, (match, url) => {
                // 如果匹配的是 img 标签的 src 属性，不进行替换
                if (/src="[^"]*"/i.test(match)) {
                    return match;
                }
                // 只允许站内链接 如果要去除限制 把这个判断去掉
                if (match.indexOf("jx3box.com") == -1) {
                    return match;
                }
                return `<a href="${url}" target="_blank">${url}</a>`;
            });
            const ins = new JX3_EMOTION(val);
            const html = await ins._renderHTML();
            if (version === this.renderVersion) {
                this.renderContent = enableLazyImages(resolveImagePath(sanitizeCommunityReplyHtml(html)));
            }
        },
        onShowReply() {
            if (!this.ensureLogin() || this.isDisabledComment) return;
            this.showReplyForReplyFrom = !this.showReplyForReplyFrom;
        },
        doReply({ content }) {
            if (!this.ensureLogin() || this.replySubmitting) return;
            const id = this.$route.params.id;
            const replyId = this.post.topic_reply_id;
            const userId = this.userInfo.id;
            if (id && replyId) {
                this.replySubmitting = true;
                return replyReply(
                    id,
                    replyId,
                    {
                        content: content,
                        reply_for_user_id: Number(userId) || 0,
                    },
                    this.getTopicPassword() ? { password: this.getTopicPassword() } : undefined
                )
                    .then(() => {
                        this.getCommentList();
                        this.showReplyForReplyFrom = false;
                    })
                    .catch((error) => {
                        this.$message.error(
                            error?.response?.data?.msg ||
                                error?.message ||
                                this.$t("pages.community.messages.replyFailed")
                        );
                    })
                    .finally(() => {
                        this.replySubmitting = false;
                    });
            } else {
                this.$message.error(this.$t("pages.community.messages.invalidReplyData"));
            }
        },
        // 点赞
        addLike: function () {
            if (this.isLike) return;
            this.likeCount++;
            if (!this.isLike) {
                postStat("community_comment", this.post.id, "likes");
            }
            this.isLike = true;
        },
        showAvatar(value) {
            return resolveImagePath(showAvatar(value));
        },
        ensureLogin() {
            if (User.isLogin()) return true;
            this.$message.warning(this.$t("pages.community.messages.loginRequired"));
            return false;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/community/comment_item.less";
</style>
