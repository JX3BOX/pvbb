<template>
    <div
        ref="replyRoot"
        class="m-reply-wrapper"
        :class="{ 'is-master': isMaster }"
        :id="`floor-${post.floor || 0}`"
    >
        <div class="m-reply-left">
            <CommentUser :uid="userInfo.id" :isMaster="isMaster" :isAnonymous="isAnonymous" />
            <div class="u-top-right u-mobile-show">
                <div class="u-floor">
                    {{ isMaster ? $t("pages.community.single.topicAuthor") : "#" + post.floor }}
                </div>
                <div class="m-reply-time">{{ showTime }}</div>
            </div>
        </div>
        <div class="m-reply-right" :class="{ 'has-comment-decoration': hasCommentDecoration }">
            <slot name="header"></slot>
            <div class="m-reply-content">
                <div class="u-reply-floor u-mobile-hidden">
                    <a :href="`#floor-${post.floor || 0}`" @click="onFloorClick">{{
                        isMaster
                            ? $t("pages.community.single.topicAuthor")
                            : $t("pages.community.single.floor", { floor: post.floor })
                    }}</a>
                    <span class="u-comment-time u-mobile-hidden">{{ post.updated_at }}</span>
                    <div class="u-reply-op">
                        <el-button
                            v-if="isSuper || isFollower"
                            class="u-mobile-hidden"
                            @click="onEdit"
                            link
                            icon="Edit"
                            size="small"
                            type="primary"
                            >{{ $t("pages.community.reply.edit") }}</el-button
                        >
                    </div>
                </div>
                <span class="u-boxcoin" v-if="!isMaster && (isLogin || boxCoinTotal)">
                    <el-button
                        v-if="isLogin && !isMaster && !isAnonymous"
                        class="u-mobile-hidden"
                        link
                        @click="onThx"
                        size="small"
                    >
                        <span class="u-thx">
                            <img
                                src="@/assets/img/community/thx.webp"
                                :alt="$t('pages.community.reply.thanks')"
                            />
                            {{ $t("pages.community.reply.thanks") }}
                        </span>
                    </el-button>
                    <span class="u-boxcoin-total" v-if="boxCoinTotal" @click.stop="onBoxcoinClick">
                        <!-- <img class="u-boxcoin-img" src="~@/assets/img/community/like4.png" alt="" /> -->
                        {{ $t("pages.community.single.boxcoinReceived")
                        }}<span class="u-boxcoin-num">{{ boxCoinTotal }}</span
                        ><i class="el-icon-coin"></i>
                    </span>
                </span>
                <div class="u-reply-content">
                    <template v-if="visible || isSuper">
                        <Article v-if="isMaster" :content="renderContent" />
                    </template>
                    <div class="m-single-null" v-else-if="isMaster">
                        <el-alert type="warning" show-icon v-if="post.visible != 3">
                            <template #title>
                                <span>{{ nullTip }}</span>
                            </template>
                        </el-alert>

                        <template v-if="post.visible == 3">
                            <div class="m-pwd-box">
                                <i class="u-pwd-icon el-icon-lock"></i>
                                <div class="u-pwd-tip">{{ $t("pages.community.reply.passwordProtected") }}</div>
                                <el-input
                                    v-model="password"
                                    :placeholder="$t('pages.community.reply.passwordPlaceholder')"
                                    show-password
                                    clearable
                                    class="u-pwd-input"
                                >
                                    <template #prepend>{{ $t("pages.community.reply.passwordLabel") }}</template>
                                </el-input>
                                <el-button class="u-pwd-btn" type="primary" @click="enterPwd">{{
                                    $t("pages.community.common.confirm")
                                }}</el-button>
                            </div>
                        </template>
                    </div>

                    <div v-if="!isMaster" v-html="renderContent" />

                    <div v-if="extraImages && extraImages.length && isMaster && isFromPhone" class="m-image-box">
                        <a class="u-item" v-for="(item, index) in extraImages" :key="index">
                            <el-image
                                :src="getSquareBanner(item)"
                                fit="fill"
                                :preview-src-list="[resolveImagePath(item)]"
                            />
                        </a>
                    </div>
                </div>
                <!-- 打赏 只有主楼有打赏-->
                <Thx
                    v-if="isMaster && (visible || isSuper)"
                    class="m-single-thx"
                    :class="{ 'is-disabled-boxcoin': isDisableBoxcoin }"
                    :postId="~~id"
                    postType="community_topic"
                    :postTitle="post.title"
                    :userId="post.user_id"
                    :adminBoxcoinEnable="true"
                    :userBoxcoinEnable="true"
                    :client="post.client"
                    category="community"
                    showRss
                    :author-id="post.user_id"
                    :banner="resolveImagePath(post.banner_img)"
                    :contentMetaId="post.link_content_meta_id"
                    :allowGift="Number(!isDisableBoxcoin)"
                />
                <!-- 操作按钮 -->
                <!-- <div class="m-reply-time u-mobile-hidden">{{ showTime }}</div> -->
                <div class="u-reply-toolbar">
                    <div>
                        <ForwardButton class="u-mobile-hidden" :post="post" :isMaster="isMaster" />
                        <DeleteButton class="u-mobile-hidden" :post="post" type="reply" :isMaster="isMaster" />
                        <AddBlockButton class="u-mobile-hidden" :post="post" />
                        <ComplaintButton class="u-mobile-hidden" :post="post" />
                        <el-button
                            type="primary"
                            size="small"
                            class="u-reply-btn"
                            :class="{ 'is-disabled': isDisabledComment && isMaster }"
                            :style="styles"
                            @click="onShowReply"
                            :disabled="!isLogin || isDisabledComment"
                        >
                            <div class="u-btn">
                                <img src="@/assets/img/community/reply.svg" alt="" />
                                <span>{{
                                    isMaster
                                        ? $t("pages.community.reply.followup")
                                        : $t("pages.community.reply.reply")
                                }}</span>
                            </div>
                        </el-button>
                        <el-button
                            v-if="!isMaster"
                            :disabled="isLike"
                            type="primary"
                            size="small"
                            class="u-praise-btn"
                            @click="addLike"
                        >
                            <div class="u-btn">
                                <img src="@/assets/img/community/praise.svg" alt="" />
                                <span>{{ $t("pages.community.reply.like") }}</span>
                                <span>{{ likeCountRender }}</span>
                            </div>
                        </el-button>
                    </div>
                    <div>
                        <el-dropdown class="u-more u-mobile-show" trigger="click" placement="bottom">
                            <span class="el-dropdown-link">
                                <i class="el-icon-more"></i>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item>
                                        <ForwardButton class="u-mobile-hidden" :post="post" :isMaster="isMaster" />
                                    </el-dropdown-item>
                                    <el-dropdown-item v-if="!isMaster && (isSuper || isFollower)">
                                        <el-button class="u-mobile-hidden" @click="onEdit" link icon="Edit"
                                            >{{ $t("pages.community.reply.edit") }}</el-button
                                        >
                                    </el-dropdown-item>
                                    <el-dropdown-item v-if="isLogin && !isMaster && !isAnonymous">
                                        <el-button class="u-mobile-hidden" link icon="Present" @click="onThx"
                                            >{{ $t("pages.community.reply.thanks") }}</el-button
                                        >
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <DeleteButton
                                            class="u-mobile-hidden"
                                            :post="post"
                                            type="reply"
                                            :isMaster="isMaster"
                                        />
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <AddBlockButton class="u-mobile-hidden" :post="post" />
                                    </el-dropdown-item>
                                    <el-dropdown-item>
                                        <ComplaintButton class="u-mobile-hidden" :post="post" />
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>
                <!-- 回复的输入框 ，判断主楼不需要展示主楼是跟帖 -->
                <ReplyForReply
                    v-if="showReplyForReplyFrom"
                    :username="replyTargetName"
                    :user-href="isAnonymous ? '' : authorLink(userId)"
                    @hideForm="showReplyForReplyFrom = false"
                    @doReply="doReply"
                    :commentStrict="commentStrict"
                    :current-id="post.id"
                    :submitting="replySubmitting"
                />
            </div>

            <!-- 折叠评论 -->
            <div v-if="!isMaster && post.comments_count > 3" class="m-comment-collapse">
                <div v-if="isCollapse" @click="onCollapseChange">
                    <img width="14" src="@/assets/img/community/collapse_1.svg" alt="" />
                    <span>{{ $t("pages.community.reply.collapseComments") }}</span>
                </div>
                <div v-else @click="onCollapseChange">
                    <img width="14" src="@/assets/img/community/collapse_2.svg" alt="" />
                    <span>{{ $t("pages.community.reply.expandComments") }}</span>
                </div>
            </div>
            <!-- 评论列表 -->
            <div v-if="!isMaster && commentList.length" class="m-comment-list">
                <CommentItem
                    v-for="item in commentList"
                    :key="item.id"
                    :post="item"
                    :comment-strict="commentStrict"
                    @decoration-change="onCommentDecorationChange"
                />
            </div>

            <!-- 分页 -->
            <div v-if="isCollapse" class="m-pagination-box">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :hide-on-single-page="true"
                    :page-size="per"
                    :total="total"
                    v-model:current-page="page"
                    @current-change="changePage"
                ></el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
import { authorLink, editLink, getThumbnail, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { replyReply, getCommentList } from "@/service/community";
import User from "@jx3box/jx3box-common/js/user.js";
import { postStat } from "@jx3box/jx3box-common/js/stat";
import { getLikes } from "@/service/next";
import dayjs from "dayjs";
import bus from "@/utils/bus";
import { getHistorySummary } from "@/service/pay";

import DeleteButton from "./DeleteButton.vue";
import AddBlockButton from "./AddBlockButton.vue";
import ForwardButton from "./ForwardButton.vue";
import ComplaintButton from "./ComplaintButton.vue";
import Thx from "@jx3box/jx3box-ui/src/single/Thx.vue";
import CommentUser from "./CommentUser.vue";
import ReplyForReply from "./ReplyForReply.vue";
import CommentItem from "./CommentItem.vue";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import { renderEmotionHTML } from "@/utils/jx3Emo";
import sanitizeRichText from "@jx3box/jx3box-editor/src/assets/js/xss";
import sanitizeCommunityReplyHtml from "@/utils/community-rich-text";
import { enableLazyImages } from "@/utils/community";

export default {
    name: "ReplyItem",
    inject: ["getTopicData", "getTopicPassword", "getReplyList", "onReplyTopic"],
    props: ["isMaster", "post", "isAuthor", "nullTip", "commentStrict"],
    components: {
        DeleteButton,
        ForwardButton,
        ComplaintButton,
        AddBlockButton,
        CommentUser,
        ReplyForReply,
        CommentItem,
        Article,
        // AddBlackHoleButton,
    },
    provide() {
        return {
            getReplyData: () => this.post,
            getCommentList: this.getList,
        };
    },
    data() {
        return {
            page: 1, //当前页数
            per: 5, //每页条目
            total: 0, //总条目数
            isCollapse: false,
            isLike: false,
            likeCount: 0,
            showReplyForReplyFrom: false,
            renderContent: "",
            renderVersion: 0,
            commentList: [],
            decoratedCommentIds: {},

            // summary
            summary: {
                fromManager: 0,
                fromUser: 0,
            },

            password: "",
            replySubmitting: false,
            commentRequestVersion: 0,
            summaryObserver: null,
            summaryLoaded: false,
        };
    },
    computed: {
        showTime: function () {
            const time = this.post.created_at || this.post.updated_at;
            return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
        },
        // 主楼的跟帖按钮占位宽度 * 2
        styles: function () {
            if (this.isMaster) {
                return {
                    width: "150px",
                    height: "38px",
                };
            }
            return {};
        },
        id: function () {
            return this.$route.params.id;
        },
        onlyAuthor: function () {
            const v = this.$route.query.onlyAuthor;
            return (v == true || v == "true") && true;
        },
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
            if (this.post && this.post.user_info) {
                return this.post.user_info;
            }
            if (this.post && this.post.ext_user_info) {
                return this.post.ext_user_info;
            }
            return {};
        },
        userId: function () {
            if (this.post && this.post.user_info) {
                return this.post.user_info.id;
            }
            if (this.post && this.post.ext_user_info) {
                return this.post.ext_user_info.id;
            }
            return "";
        },
        isSuper() {
            return User.getInfo()?.group >= 64;
        },
        isFollower() {
            return this.post?.user_id && this.post?.user_id == User.getInfo()?.uid;
        },
        isLogin() {
            return User.isLogin();
        },
        boxCoinTotal() {
            return this.summary.fromManager + this.summary.fromUser;
        },
        isFromPhone() {
            return this.post?.is_from_phone;
        },
        extraImages() {
            return this.post?.extra_images;
        },
        visible: function () {
            return !!this.post?.visible_validate;
        },
        // 是否匿名
        isAnonymous: function () {
            return (
                !!this.post?.anonymous ||
                (!!this.getTopicData()?.anonymous && Number(this.post?.user_id || 0) === 0)
            );
        },
        replyTargetName() {
            return this.isAnonymous
                ? this.$t("pages.community.single.mysteriousUser")
                : this.userInfo.display_name || this.$t("pages.community.common.unknownUser");
        },
        // 是否禁止投币
        isDisableBoxcoin: function () {
            return !!this.post?.disable_inspire_boxcoin;
        },
        isDisabledComment: function () {
            return !!this.getTopicData()?.disable_comment || (this.isMaster && !this.visible && !this.isSuper);
        },
        hasCommentDecoration: function () {
            return Object.keys(this.decoratedCommentIds).length > 0;
        },
    },
    watch: {
        "post.content": {
            handler: function (val) {
                this.formatContent(val);
            },
            immediate: true,
        },
        post: {
            handler: async function () {
                const requestVersion = ++this.commentRequestVersion;
                this.commentList = [];
                if (this.post.comments) {
                    const commentList = await this.getLikes(this.post.comments);
                    if (requestVersion === this.commentRequestVersion) {
                        this.commentList = commentList;
                    }
                }
                this.summary = { fromManager: 0, fromUser: 0 };
                this.summaryLoaded = false;
                this.$nextTick(() => this.observeHomeworkBoxcoin());
            },
            immediate: true,
        },
        "post.likes": {
            handler: function (val) {
                this.likeCount = val;
            },
            immediate: true,
        },
        commentList: function (list) {
            const visibleIds = new Set((list || []).map((item) => String(item.id)));
            this.decoratedCommentIds = Object.fromEntries(
                Object.entries(this.decoratedCommentIds).filter(([id]) => visibleIds.has(id))
            );
        },
    },
    mounted() {
        this.observeHomeworkBoxcoin();
    },
    beforeUnmount() {
        this.summaryObserver?.disconnect();
        this.summaryObserver = null;
        ++this.commentRequestVersion;
        ++this.renderVersion;
    },
    methods: {
        observeHomeworkBoxcoin() {
            this.summaryObserver?.disconnect();
            this.summaryObserver = null;
            if (this.isMaster || !this.post?.id || this.summaryLoaded) return;
            const root = this.$refs.replyRoot;
            if (!root) return;
            if (typeof window.IntersectionObserver !== "function") {
                this.loadHomeworkBoxcoin();
                return;
            }
            this.summaryObserver = new window.IntersectionObserver(
                (entries) => {
                    if (!entries.some((entry) => entry.isIntersecting)) return;
                    this.summaryObserver?.disconnect();
                    this.summaryObserver = null;
                    this.loadHomeworkBoxcoin();
                },
                { rootMargin: "600px 0px" }
            );
            this.summaryObserver.observe(root);
        },
        onCommentDecorationChange(commentId) {
            if (!commentId) return;
            this.decoratedCommentIds = {
                ...this.decoratedCommentIds,
                [commentId]: true,
            };
        },
        onCollapseChange() {
            if (this.isCollapse) {
                ++this.commentRequestVersion;
                this.commentList = this.post.comments;
                this.isCollapse = false;
            } else {
                this.page = 1;
                this.isCollapse = true;
                this.getList();
            }
        },
        getSquareBanner: function (val) {
            const image = resolveImagePath(val);
            if (image.indexOf("jx3box.com") >= 0) {
                return getThumbnail(image, 48 * 2);
            }
            return image;
        },
        resolveImagePath,
        authorLink,
        async formatContent(val) {
            const version = ++this.renderVersion;
            val = String(val || "");
            if (this.isMaster) {
                const html = await renderEmotionHTML(val);
                if (version === this.renderVersion) {
                    this.renderContent = enableLazyImages(resolveImagePath(sanitizeRichText(html)));
                }
                return;
            }
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
            const html = await renderEmotionHTML(val.replace(/ style="[^"]*"/gi, ""));
            if (version === this.renderVersion) {
                const rendered = /<\w+[^>]*>/.test(html) ? html : html.replace(/\n/g, "<br />");
                this.renderContent = enableLazyImages(resolveImagePath(sanitizeCommunityReplyHtml(rendered)));
            }
        },
        onShowReply() {
            if (!this.ensureLogin() || this.isDisabledComment) return;
            if (this.isMaster) {
                // window.scrollTo(0, document.body.scrollHeight);
                this.$emit("onReplyTopic");
            } else {
                this.showReplyForReplyFrom = !this.showReplyForReplyFrom;
            }
        },
        doReply({ content }) {
            if (!this.ensureLogin() || this.replySubmitting) return;
            const id = this.$route.params.id;
            const replyId = this.post.id;
            if (id && replyId) {
                this.replySubmitting = true;
                return replyReply(
                    id,
                    replyId,
                    {
                        content: content,
                        reply_for_user_id: Number(this.userId) || 0,
                    },
                    this.getTopicPassword() ? { password: this.getTopicPassword() } : undefined
                )
                    .then(() => {
                        this.getList();
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
        changePage() {
            this.getList();
        },
        getList(postData = {}) {
            if (this.isMaster) return;
            const id = this.id;
            const replyId = this.post.id;
            if (id && replyId) {
                const requestVersion = ++this.commentRequestVersion;
                return getCommentList(id, replyId, {
                    index: this.page,
                    pageSize: this.per,
                    password: this.getTopicPassword() || undefined,
                    ...postData,
                })
                    .then(async (res) => {
                        if (requestVersion !== this.commentRequestVersion) return;
                        var list = res.data.data.list;

                        if (list) {
                            const commentList = await this.getLikes(list);
                            if (requestVersion !== this.commentRequestVersion) return;
                            this.commentList = commentList;
                            this.isCollapse = true;
                        } else {
                            this.commentList = [];
                        }
                        this.page = res.data.data.page.index;
                        this.total = res.data.data.page.total;
                        this.current = res.data.data.page.current;
                    })
                    .catch((error) => {
                        if (requestVersion !== this.commentRequestVersion) return;
                        this.isCollapse = false;
                        this.$message.error(
                            error?.response?.data?.msg ||
                                error?.message ||
                                this.$t("pages.community.messages.repliesLoadFailed")
                        );
                    });
            }
        },
        // 点赞
        addLike: function () {
            if (this.isLike) return;
            this.likeCount++;
            if (!this.isLike) {
                if (this.isMaster) {
                    postStat("community_topic", this.post.id, "likes");
                } else {
                    postStat("community_reply", this.post.id, "likes");
                }
            }
            this.isLike = true;
        },
        async getLikes(commentList) {
            if (!commentList.length) return commentList;
            if (commentList.every((item) => Object.prototype.hasOwnProperty.call(item, "likes"))) {
                return commentList;
            }
            const id = commentList.map((item) => `community_comment-${item.id}`).join(",");
            let list = [];
            const params = {
                post_type: "community_comment",
                post_action: "likes",
                id,
            };
            await getLikes(params)
                .then((res) => {
                    list = commentList.map((item) => {
                        item.likes = res.data.data[`community_comment-${item.id}`]?.likes || 0;
                        return item;
                    });
                })
                .catch(() => {
                    list = commentList;
                });
            return list;
        },
        onEdit() {
            if (this.isMaster) {
                const path =
                    editLink("community", this.post.id) + (!this.isFollower && this.isSuper ? "?from=admin" : "");
                window.open(path, "_blank");
            } else {
                const path =
                    editLink("community/reply", this.post.id) + (!this.isFollower && this.isSuper ? "?from=admin" : "");
                window.open(path, "_blank");
            }
        },
        onThx() {
            bus.emit("onThx", {
                postType: "community_topic_reply",
                postId: this.post.id,
                postUserId: this.userId,
                client: this.getTopicData()?.client || this.post?.client || "std",
            });
        },
        loadHomeworkBoxcoin() {
            if (!this.post?.id) return Promise.resolve();
            this.summaryLoaded = true;
            return getHistorySummary("community_topic_reply", this.post.id)
                .then((res) => {
                    this.summary = res.data.data;
                })
                .catch(() => {});
        },
        onBoxcoinClick() {
            bus.emit("boxcoin-click", {
                postType: "community_topic_reply",
                postId: this.post.id,
                postUserId: this.userId,
                client: this.getTopicData()?.client || this.post?.client || "std",
            });
        },
        onFloorClick() {
            // 复制楼层
            const floor = this.post.floor;

            const link = window.location.href.split("#")[0] + `#floor-${floor}`;
            navigator.clipboard.writeText(link).then(() => {
                this.$message.success(this.$t("pages.community.messages.floorCopied"));
            });
        },
        enterPwd() {
            this.$emit("enterPwd", this.password);
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
@import "~@/assets/css/community/reply_item.less";
</style>
