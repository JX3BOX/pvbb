<template>
    <div class="m-comment-wrapper" :class="{ 'has-decoration': decoration }">
        <div class="m-comment-right" :style="decorationStyles">
            <img
                class="u-avatar"
                :src="showAvatar(userInfo.avatar)"
                :alt="$t('pages.community.common.avatarAlt')"
            />
            <div class="m-comment-content">
                <div class="u-content-top">
                    <div class="u-name">
                        <a :href="authorLink(userInfo.id)" :alt="$t('pages.community.common.usernameAlt')">{{
                            userInfo.display_name
                        }}</a>
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
                    $t("pages.community.reply.replyTo", { name: replyUserInfo.display_name })
                }}</p>
                <p class="u-content" v-html="renderContent"></p>
                <div class="u-comment-toolbar">
                    <div class="flex items-center">
                        <el-button link size="small" type="primary" @click="addLike" class="">
                            <div class="u-btn-content flex items-center">
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
                    :username="userInfo.display_name"
                    :user-href="authorLink(userInfo.id)"
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
import { getDecoration } from "@/service/cms";
import { __cdn } from "@/utils/config";

import ReplyForReply from "./ReplyForReply.vue";
import AddBlockButton from "./AddBlockButton.vue";
import ComplaintButton from "./ComplaintButton.vue";
import DeleteButton from "./DeleteButton.vue";
import sanitizeRichText from "@jx3box/jx3box-editor/src/assets/js/xss";

const DECORATION_KEY = "decoration_comment_";

export default {
    name: "CommentItem",
    emits: ["decoration-change"],
    props: ["post", "commentStrict"],
    inject: ["getTopicData", "getReplyData", "getCommentList"],
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
            isLike: false,
            likeCount: 0,
            renderContent: "",
            showReplyForReplyFrom: false,
            commentList: [],
            replySubmitting: false,
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
            return this.post.user_info.id;
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
            return this.post.user_info;
        },
        replyUserInfo: function () {
            return this.post.reply_for_user_info;
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
                      borderRadius: "8px",
                  }
                : null;
        },
    },
    mounted() {
        this.getDecoration();
    },
    methods: {
        setDecoration(decoration) {
            this.decoration = __cdn + `design/decoration/images/${decoration.val}/comment.png`;
            this.$emit("decoration-change", this.post.id);
        },
        getDecoration() {
            if (!this.uid) return;
            let decoration_local = sessionStorage.getItem(DECORATION_KEY + this.uid);
            if (decoration_local === "no") return;
            if (decoration_local) {
                //解析本地缓存
                let decoration_parse = JSON.parse(decoration_local);
                if (decoration_parse) {
                    this.setDecoration(decoration_parse);
                    return;
                }
            }
            getDecoration({ using: 1, user_id: this.uid, type: "comment" }).then((res) => {
                let decorationList = res.data.data;
                //筛选个人装扮
                let decoration = decorationList.find((item) => item.type == "comment");
                if (decoration) {
                    this.setDecoration(decoration);
                    sessionStorage.setItem(DECORATION_KEY + this.uid, JSON.stringify(decoration));
                    return;
                }
                sessionStorage.setItem(DECORATION_KEY + this.uid, "no");
            }).catch(() => {});
        },
        authorLink,
        async formatContent(val) {
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
            this.renderContent = resolveImagePath(sanitizeRichText(await ins._renderHTML()));
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
            if (id && replyId && userId) {
                this.replySubmitting = true;
                return replyReply(id, replyId, {
                    content: content,
                    reply_for_user_id: userId,
                })
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
