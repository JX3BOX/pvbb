<template>
    <CommunitySingleLayout :post="post">
        <div class="m-community-single" v-loading="loading">
            <div class="m-list-box">
                <!--  楼主 -->
                <div class="m-master-box">
                    <ReplyItem
                        v-if="this.page === 1 && post.id"
                        :null-tip="null_tip"
                        :isMaster="true"
                        :post="post"
                        @onReplyTopic="handleReplyTopic"
                        @enterPwd="enterPwd"
                    >
                        <template #header>
                            <!-- 头部 -->
                            <div class="m-community-header">
                                <CommunityPostHeader :post="post" :stat="stat">
                                    <template #append>
                                        <el-pagination
                                            layout="prev, pager, next"
                                            :hide-on-single-page="true"
                                            :page-size="per"
                                            :total="total"
                                            @current-change="changeTopPage"
                                            size="small"
                                            class="m-pageheader-pagination"
                                        ></el-pagination>
                                    </template>
                                </CommunityPostHeader>
                                <!-- 文集小册 -->
                                <Collection
                                    class="m-single-collection"
                                    :id="collection_id"
                                    :defaultVisible="collection_collapse"
                                    @collectionUpdate="updateCollection"
                                />
                                <el-divider class="m-community-header__divider" content-position="left"
                                    >JX3BOX</el-divider
                                >
                            </div>
                        </template>
                    </ReplyItem>
                </div>

                <!-- 帖子回复 -->
                <div class="m-reply-box">
                    <ReplyItem
                        v-for="(item, i) in replyList"
                        :key="item.id"
                        :post="item"
                        :is-master="false"
                        :is-author="isAuthor"
                        :comment-strict="comment_strict"
                        :ref="'reply' + i"
                    />
                </div>
            </div>
            <!-- 帖子回复e -->

            <!-- 分页 -->

            <div class="m-community-footer">
                <el-button
                    class="u-more-buttom"
                    :style="{ fontSize: hasNextPage ? '14px' : '12px' }"
                    :type="hasNextPage ? 'primary' : 'info'"
                    :link="!hasNextPage"
                    @click="nextPage"
                    :loading="loading"
                    :disabled="!hasNextPage || loading"
                    :icon="hasNextPage ? 'ArrowDown' : ''"
                >
                    {{
                        hasNextPage
                            ? $t("pages.community.common.nextPage")
                            : $t("pages.community.common.noMore")
                    }}
                </el-button>

                <div class="m-pagination-box">
                    <el-pagination
                        background
                        layout="total, prev, pager, next, jumper"
                        :hide-on-single-page="true"
                        :page-size="per"
                        :total="total"
                        v-model:current-page="page"
                        @current-change="changePage"
                    ></el-pagination>
                </div>
                <div class="u-editor">
                    <el-divider content-position="left">{{ $t("pages.community.single.replySection") }}</el-divider>
                    <CommentEditor
                        ref="footerEditor"
                        @submit="onReplyTopic"
                        v-if="!isDisabledComment"
                        :class="{ 'c-comment-mask': comment_strict }"
                        :submitting="replySubmitting"
                        :is-login="isLogin"
                        :initial-content="replyDraftContent"
                        :initial-mentions="replyDraftMentions"
                    />
                    <el-alert :show-close="false" center v-else class="m-disabled-comment-tip"
                        >{{ $t("pages.community.single.commentsClosed") }}</el-alert
                    >
                </div>
            </div>
        </div>

        <Homework
            v-model="showHomeWork"
            :title="$t('pages.community.single.thanksDialogTitle')"
            :postType="postType"
            :postId="postId"
            :client="postClient"
            :userId="postUserId"
            :article-id="~~id"
            category="community"
            @updateRecord="updateRecord"
        ></Homework>
        <boxCoinRecords
            v-model="showBoxCoin"
            :postType="postType"
            :postId="postId"
            :client="postClient"
        ></boxCoinRecords>

        <el-dialog
            v-model="showComment"
            :title="$t('pages.community.single.quickReplyDialogTitle')"
            :width="isPhone ? '95%' : ''"
        >
            <CommentEditor
                ref="dialogEditor"
                @submit="onReplyTopic"
                :class="{ 'c-comment-mask': comment_strict }"
                :submitting="replySubmitting"
                :is-login="isLogin"
            ></CommentEditor>
        </el-dialog>

        <go-to-top-or-bottom />

        <div class="w-jx3-element-pop" :style="jx3_element.style">
            <jx3-author :uid="author.id" v-show="jx3_element.type === 'author'" />
        </div>
    </CommunitySingleLayout>
</template>

<script>
import ReplyItem from "@/views/community/components/ReplyItem.vue";
import GoToTopOrBottom from "@/views/community/components/GoToTopOrBottom.vue";
import CommunitySingleLayout from "@/layouts/CommunitySingleLayout.vue";
import CommunityPostHeader from "@/views/community/components/CommunityPostHeader.vue";
import CommentEditor from "@/views/community/components/CommentEditor.vue";
import {
    getTopicDetails,
    getTopicDetailsFromAdmin,
    getTopicReplyList,
    replyTopic,
} from "@/service/community";
import { getStat, postStat, postHistory } from "@jx3box/jx3box-common/js/stat";
import { getLikes } from "@/service/next";
import User from "@jx3box/jx3box-common/js/user";
import Homework from "@jx3box/jx3box-ui/src/interact/Homework.vue";
import boxCoinRecords from "./components/BoxcoinRecords.vue";
import bus from "@/utils/bus";
import { atAuthors } from "@/service/pay";
import Collection from "@jx3box/jx3box-ui/src/single/Collection.vue";
import renderJx3Element from "@jx3box/jx3box-editor/src/assets/js/jx3_element";
import Author from "@jx3box/jx3box-editor/src/components/Author.vue";
import { postReadHistory } from "@jx3box/jx3box-common/js/stat";
import { getConfig } from "@jx3box/jx3box-common/js/system";
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";

const appKey = "community";
const siteClient = location.hostname.split(".").includes("origin") ? "origin" : "std";
const supportedPostClients = new Set(["std", "origin", "wujie"]);
const REPLY_DRAFT_PREFIX = "jx3box:pvbb:community:draft:";
const visibilityKeys = {
    0: "public",
    1: "private",
    2: "friends",
    3: "password",
    4: "paid",
    5: "followers",
};

export default {
    components: {
        CommentEditor,
        CommunitySingleLayout,
        CommunityPostHeader,
        ReplyItem,
        Homework,
        boxCoinRecords,
        GoToTopOrBottom,
        Collection,
        "jx3-author": Author,
    },
    provide() {
        return {
            getTopicData: () => this.post,
            getReplyList: this.getReplyList,
            setOnlyAuthor: this.setOnlyAuthor,
            onReplyTopic: this.onReplyTopic,
            onSearch: this.onSearch,
        };
    },
    data() {
        return {
            floor: 0,
            stat: "",
            page: 1, //当前页数
            per: 10, //每页条目
            total: 0, //总条目数
            pageTotal: 0, //总页数
            post: {},
            replyList: [],
            categoryList: [],
            loading: false,
            currentReplyRequest: null,
            currentReplyRequestKey: "",
            replyRequestVersion: 0,
            detailRequestVersion: 0,
            routeReady: false,
            componentActive: true,
            replySubmitting: false,
            replyDraftContent: "",
            replyDraftMentions: [],
            onlyAuthor: false,
            number_queries: ["per", "page"],
            mode: null,

            // 打赏相关 start
            showHomeWork: false,
            postType: "community",
            postId: "",
            postUserId: 0,
            postClient: "std",
            showBoxCoin: false,
            // 打赏相关 end

            showComment: false,
            comment_strict: false,

            collection_data: "",

            // COMMON
            jx3_element: {
                style: {
                    top: 0,
                    left: 0,
                    display: "block",
                },
                type: "",
            },

            author: {
                id: "",
            },

            password: "",
            thxHandler: null,
            boxcoinHandler: null,
        };
    },
    computed: {
        styles: function () {
            let item = this.categoryList.find((item) => item.value === this.post.category);
            if (item) {
                return item;
            } else {
                return {
                    icon: `game`,
                    hoverColor: "rgba(235, 244, 255, 1)",
                    color: "rgba(64, 128, 255, 1)",
                };
            }
        },
        id: function () {
            return this.$route.params.id;
        },
        isAuthor() {
            return this.post?.user_id == User.getInfo().uid;
        },
        isSuper() {
            return User.getInfo()?.group >= 64;
        },
        isPhone() {
            return window.innerWidth < 768;
        },
        isAdminMode() {
            return this.isSuper && (this.mode === "admin" || this.$route.query.from === "admin");
        },
        isLogin() {
            return User.isLogin();
        },
        replyClient() {
            const queryClient = this.$route.query.client;
            if (typeof queryClient === "string" && supportedPostClients.has(queryClient)) {
                return queryClient;
            }
            return supportedPostClients.has(this.post?.client) ? this.post.client : siteClient;
        },
        // 是否显示加载更多
        hasNextPage: function () {
            return this.pageTotal >= 1 && this.per * this.page < this.total;
        },
        collection_id() {
            return this.post.collection_id;
        },
        collection_collapse: function () {
            return this.post?.collection_collapse;
        },
        null_tip: function () {
            const visibilityKey = visibilityKeys[this.post?.visible];
            const visibility = visibilityKey
                ? this.$t(`pages.community.visibility.${visibilityKey}`)
                : this.post?.visible;
            return this.$t("pages.community.visibility.authorRestricted", { visibility });
        },
        visible: function () {
            return !!this.post?.visible_validate;
        },
        isDisabledComment: function () {
            return !!this.post?.disable_comment;
        },
    },
    created() {
        this.getJumpFloor();
        this.restoreReplyDraft();
    },
    mounted() {
        if (!this.id) return this.$message.error(this.$t("pages.community.messages.missingTopicId"));
        this.routeReady = true;
        Promise.resolve(this.getDetails())
            .then(() => (this.componentActive ? this.getReplyList() : null))
            .then(() => {
                if (!this.componentActive) return;
                this.$nextTick(() => {
                    renderJx3Element(this);
                });
            });

        getConfig({
            key: "comment_strict",
        })
            .then((res) => {
                if (!this.componentActive) return;
                if (res.data.data?.val == 1) {
                    if (User.isLogin()) {
                        this.comment_strict = User.getInfo().group < 16;
                    }
                }
            })
            .catch(() => {});

        // 打赏
        this.thxHandler = (data) => {
            this.postType = data.postType;
            this.postId = data.postId;
            this.postUserId = data.postUserId;
            this.showHomeWork = true;
        };
        bus.on("onThx", this.thxHandler);

        this.boxcoinHandler = (data) => {
            this.postType = data.postType;
            this.postId = data.postId;
            this.showBoxCoin = true;
        };
        bus.on("boxcoin-click", this.boxcoinHandler);
    },
    beforeUnmount() {
        this.componentActive = false;
        ++this.detailRequestVersion;
        ++this.replyRequestVersion;
        this.currentReplyRequest = null;
        this.currentReplyRequestKey = "";
        if (this.thxHandler) bus.off("onThx", this.thxHandler);
        if (this.boxcoinHandler) bus.off("boxcoin-click", this.boxcoinHandler);
    },
    watch: {
        // 加载路由参数
        "$route.query": {
            deep: true,
            immediate: true,
            handler: function (query) {
                const nextPage = Math.min(100000, Math.max(1, Number(query.page) || 1));
                const nextOnlyAuthor = query.onlyAuthor === true || query.onlyAuthor === "true";
                const shouldReload = this.page !== nextPage || this.onlyAuthor !== nextOnlyAuthor;
                this.page = nextPage;
                this.onlyAuthor = nextOnlyAuthor;
                if (this.routeReady && shouldReload) {
                    this.getReplyList();
                }
            },
        },
    },
    methods: {
        getErrorMessage(error, fallback) {
            return (
                error?.response?.data?.msg ||
                error?.response?.data?.message ||
                error?.message ||
                fallback ||
                this.$t("pages.community.messages.requestFailed")
            );
        },
        /**
         * 获取url楼诚参数
         */
        getJumpFloor: function () {
            const floor = this.getHashFloor();
            if (floor) {
                this.floor = floor;
                this.page = Math.ceil(floor / this.per);
            }
        },
        getHashFloor() {
            const hash = window.location.hash;
            const floor = Number.parseInt(hash.replace(/^#(?:floor-)?/, "").split("?")[0], 10);
            return Number.isFinite(floor) && floor >= 1 ? floor : 0;
        },
        /**
         * 跳转到指定楼层
         * @param floor 楼层
         */
        jumpFloor(floor) {
            const _floor = floor || this.floor;
            this.$nextTick(() => {
                const positionFloor = () => {
                    if (!this.componentActive) return;
                    const el = document.getElementById("floor-" + _floor);
                    if (!el) return;
                    const top = window.scrollY + el.getBoundingClientRect().top - 120;
                    // 全局启用了 smooth scroll，连续 scrollIntoView/scrollBy 会互相取消。
                    window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
                    this.floor = 0;
                };
                // 等浏览器完成 hash 的默认定位，再扣除顶部固定区域的高度。
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        positionFloor();
                        const pendingImages = Array.from(document.querySelectorAll("#floor-0 img")).filter(
                            (img) => !img.complete
                        );
                        if (!pendingImages.length) return;
                        const imageSettled = Promise.all(
                            pendingImages.map(
                                (img) =>
                                    new Promise((resolve) => {
                                        img.addEventListener("load", resolve, { once: true });
                                        img.addEventListener("error", resolve, { once: true });
                                    })
                            )
                        );
                        Promise.race([imageSettled, new Promise((resolve) => window.setTimeout(resolve, 1500))]).then(
                            () => window.requestAnimationFrame(positionFloor)
                        );
                    });
                });
            });
        },
        // 翻页按钮
        nextPage: function () {
            this.getReplyList(true);
        },
        onSearch() {
            this.page = 1;
            this.$nextTick(() => {
                this.getReplyList();
            });
        },
        /**
         * 传入 true ｜ false  只看楼主、取消只看楼主
         * @param val bool
         */
        setOnlyAuthor(v) {
            this.page = 1;
            this.onlyAuthor = v;
            this.getReplyList();
        },

        buildQuery: function () {
            let _query = {
                index: this.page,
                pageSize: this.per,
                order_created_at: 0,
            };
            if (this.onlyAuthor && (this.onlyAuthor == true || this.onlyAuthor == "true")) {
                _query.user_id = this.post.user_id;
                _query.only_author = 1;
            }
            this.replaceRoute({ page: this.page, onlyAuthor: this.onlyAuthor });
            return _query;
        },
        getTopicData: function () {
            return this.post;
        },
        getDetails: function () {
            const requestVersion = ++this.detailRequestVersion;
            let fun = getTopicDetails;
            if (this.isAdminMode) {
                fun = getTopicDetailsFromAdmin;
            }
            const params = {};
            if (this.password) {
                params.password = this.password;
            }
            return fun(this.id, params)
                .then((res) => {
                    if (requestVersion !== this.detailRequestVersion) return null;
                    this.post = res.data.data;

                    this.updateDocumentTitle();

                    getStat(appKey, this.id).then((res) => {
                        this.stat = res.data;
                        this.post.likes = this.stat.likes || 0;
                    });
                    postStat(appKey, this.id);

                    if (User.isLogin()) {
                        postHistory({
                            source_type: "community",
                            source_id: ~~this.id,
                            link: location.href,
                            title: this.post.title,
                            author_id: this.post.user_id,
                            banner: resolveImagePath(this.post.banner_img),
                            content_meta_id: this.post.link_content_meta_id,
                        });

                        this.post.visible > 1 &&
                            this.post.visible_validate &&
                            postReadHistory({
                                id: this.id,
                                category: "communicate",
                                subcategory: "default",
                                visible_type: ~~this.post.visible,
                                author_id: this.post.user_id,
                                banner: resolveImagePath(this.post.banner_img),
                                contentMetaId: this.post.link_content_meta_id,
                            });
                    }
                })
                .catch((error) => {
                    if (requestVersion === this.detailRequestVersion) {
                        this.$message.error(
                            this.getErrorMessage(error, this.$t("pages.community.messages.topicLoadFailed"))
                        );
                    }
                    return null;
                });
        },
        getReplyList: function (appendMode) {
            const previousPage = this.page;
            if (appendMode) {
                this.page += 1;
            }
            const params = this.buildQuery();
            const requestKey = JSON.stringify(params);
            if (this.currentReplyRequestKey === requestKey && this.currentReplyRequest) {
                return this.currentReplyRequest;
            }

            const requestVersion = ++this.replyRequestVersion;
            this.loading = true;
            this.currentReplyRequestKey = requestKey;
            const request = getTopicReplyList(this.id, params)
                .then(async (res) => {
                    if (requestVersion !== this.replyRequestVersion) return;
                    var list = res.data.data.list;
                    const page = res.data.data.page;
                    if (list == null) {
                        this.replyList = [];
                    } else {
                        // 把点赞数量请求过来填充进去
                        list = await this.getLikes(list);
                        if (requestVersion !== this.replyRequestVersion) return;
                        this.replyList = list;
                        // 如果有楼层参数 跳转到指定楼层
                        const hashFloor = this.getHashFloor();
                        if (hashFloor) {
                            this.jumpFloor(hashFloor);
                        }
                    }
                    this.total = page.total;
                    this.pageTotal = page.pageTotal;
                    this.$nextTick(() => {
                        this.page = page.index;
                    });
                })
                .catch((error) => {
                    if (appendMode && requestVersion === this.replyRequestVersion) {
                        this.page = previousPage;
                    }
                    if (requestVersion === this.replyRequestVersion) {
                        this.$message.error(
                            this.getErrorMessage(error, this.$t("pages.community.messages.repliesLoadFailed"))
                        );
                    }
                    return null;
                })
                .finally(() => {
                    if (requestVersion === this.replyRequestVersion) {
                        this.loading = false;
                        this.currentReplyRequest = null;
                    }
                });
            this.currentReplyRequest = request;
            return request;
        },
        async getLikes(replyList) {
            if (!replyList.length) return replyList;
            const ids = replyList.map((item) => `community_reply-${item.id}`);
            let id = ids.join(",");
            let list = [];
            await getLikes({
                post_type: "community_reply",
                post_action: "likes",
                id,
            })
                .then((res) => {
                    list = replyList.map((item) => {
                        item.likes = res.data.data[`community_reply-${item.id}`]?.likes || 0;
                        return item;
                    });
                })
                .catch(() => {
                    list = replyList;
                });
            return list;
        },
        /** 回帖 */
        onReplyTopic(payload = {}) {
            if (this.replySubmitting) return;
            if (this.isDisabledComment) {
                return this.$message.warning(this.$t("pages.community.single.commentsClosed"));
            }
            if (!this.id) return this.$message.error(this.$t("pages.community.messages.missingTopicId"));
            if (!User.isLogin()) {
                if (this.saveReplyDraft(payload)) {
                    User.toLogin(location.href);
                } else {
                    this.$refs.footerEditor?.unlock?.();
                    this.$refs.dialogEditor?.unlock?.();
                }
                return;
            }

            this.saveReplyDraft(payload, { silent: true });
            let { attachmentList = [], content = "", atUsers = [] } = payload;
            // 拼接图片列表到 content 中
            if (attachmentList && attachmentList.length) {
                const imageTags = attachmentList
                    .map((image) => `<p><img class='attachment' src="${resolveImagePath(image)}" /></p>`)
                    .join("");
                content += imageTags;
            }
            this.replySubmitting = true;
            return replyTopic(this.id, {
                client: this.replyClient,
                content: content,
            })
                .then((res) => {
                    this.onReplyTopicSuccess(res.data.data);
                    this.showComment = false;
                    this.clearReplyDraft();
                    this.$refs.footerEditor?.reset?.();
                    this.$refs.dialogEditor?.reset?.();
                    this.noticeMentionsUser(atUsers);
                })
                .catch((error) => {
                    this.$message.error(
                        this.getErrorMessage(error, this.$t("pages.community.messages.replyFailed"))
                    );
                })
                .finally(() => {
                    this.replySubmitting = false;
                });
        },
        getReplyDraftKey() {
            return `${REPLY_DRAFT_PREFIX}${this.id}:topic`;
        },
        normalizeReplyDraftMentions(mentions) {
            return (Array.isArray(mentions) ? mentions : [])
                .map((item) => ({
                    ID: Number(item?.ID),
                    display_name: String(item?.display_name || ""),
                }))
                .filter((item) => Number.isInteger(item.ID) && item.ID > 0 && item.display_name);
        },
        saveReplyDraft(payload = {}, { silent = false } = {}) {
            const content = String(payload.draftContent ?? payload.content ?? "");
            const mentions = this.normalizeReplyDraftMentions(payload.draftMentions ?? payload.atUsers);
            try {
                sessionStorage.setItem(
                    this.getReplyDraftKey(),
                    JSON.stringify({
                        version: 1,
                        topicId: String(this.id),
                        content,
                        mentions,
                        updatedAt: Date.now(),
                    })
                );
                return true;
            } catch (_) {
                if (!silent) {
                    this.$message.error(this.$t("pages.community.messages.replyDraftSaveFailed"));
                }
                return false;
            }
        },
        restoreReplyDraft() {
            try {
                const raw = sessionStorage.getItem(this.getReplyDraftKey());
                if (!raw) return;
                const draft = JSON.parse(raw);
                if (draft?.version !== 1 || String(draft.topicId) !== String(this.id)) {
                    sessionStorage.removeItem(this.getReplyDraftKey());
                    return;
                }
                this.replyDraftContent = String(draft.content || "");
                this.replyDraftMentions = this.normalizeReplyDraftMentions(draft.mentions);
            } catch (_) {
                try {
                    sessionStorage.removeItem(this.getReplyDraftKey());
                } catch (_) {}
            }
        },
        clearReplyDraft() {
            try {
                sessionStorage.removeItem(this.getReplyDraftKey());
            } catch (_) {}
            this.replyDraftContent = "";
            this.replyDraftMentions = [];
        },
        // 通知at用户
        noticeMentionsUser(atUsers) {
            const ids = (atUsers || []).map((item) => item.ID).filter(Boolean);
            if (!ids.length) return;
            const userInfo = User.getInfo();
            atAuthors({
                sendUserId: userInfo.uid,
                accessUserId: ids.join(","),
                postId: this.id,
                postType: "community",
            }).catch(() => {});
        },
        /**
         * 回复成功后的操作
         * 如果当前的回复不需要翻页，可以不用重新渲染列表
         * 如果当前的回复条数已经超过一页，可以直接跳转到最后一页
         */
        onReplyTopicSuccess(data) {
            const nextTotal = this.total + 1;
            const lastPage = Math.max(1, Math.ceil(nextTotal / this.per));
            this.total = nextTotal;
            if (this.page === lastPage && this.replyList.length < this.per) {
                const userInfo = User.getInfo();
                this.replyList.push({
                    ...data,
                    user_info: {
                        id: Number(userInfo.uid),
                        display_name: userInfo.name,
                        avatar: userInfo.avatar,
                    },
                });
                this.$nextTick(() => {
                    window.scrollTo(0, document.body.scrollHeight);
                });
            } else {
                this.page = lastPage;
                this.$nextTick(() => {
                    this.getReplyList().finally(() => {
                        window.scrollTo(0, document.body.scrollHeight);
                    });
                });
            }
        },
        changePage(page) {
            this.page = page;
            this.getReplyList();
        },
        // 路由绑定
        replaceRoute: function (extend) {
            const query = Object.assign({}, this.$route.query, extend);
            if (this.isSameRouteQuery(query)) return Promise.resolve();
            return this.$router
                .push({ name: this.$route.name, query, hash: this.$route.hash })
                .then(() => {
                    window.scrollTo(0, 0);
                })
                .catch((err) => {});
        },
        isSameRouteQuery(query) {
            return (
                Object.keys(query).length === Object.keys(this.$route.query).length &&
                Object.keys(query).every((key) => `${query[key]}` === `${this.$route.query[key]}`)
            );
        },
        handleReplyTopic() {
            if (!this.ensureLogin()) return;
            // 展示快捷回复弹窗
            this.showComment = true;
        },
        updateRecord(data) {
            const targetPostId = Number(data?.post_id || this.postId);
            const targetIndex = this.replyList.findIndex((item) => Number(item.id) === targetPostId);

            if (targetIndex === -1) return;

            // 替换一遍对象，确保子组件能感知到这条 reply 的最新状态
            this.replyList.splice(targetIndex, 1, {
                ...this.replyList[targetIndex],
            });

            this.$nextTick(() => {
                const replyRef = this.$refs[`reply${targetIndex}`];
                const replyItem = Array.isArray(replyRef) ? replyRef[0] : replyRef;
                replyItem?.loadHomeworkBoxcoin?.();
            });
        },
        updateCollection: function (val) {
            this.collection_data = val;
        },

        enterPwd(value) {
            this.password = value;
            this.getDetails();
        },
        changeTopPage(page) {
            this.page = page;
            this.getReplyList();
        },
        ensureLogin() {
            if (User.isLogin()) return true;
            this.$message.warning(this.$t("pages.community.messages.loginRequired"));
            return false;
        },
        updateDocumentTitle() {
            if (!this.post?.title) return;
            document.title = `${this.post.title} ${this.$t("pages.common.appendTitle")}`;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/community/community-single.less";
.m-community-header__divider {
    margin: 10px 0 20px 0;
}
.w-jx3-element-pop {
    position: fixed;
    .z(2000);
}
.m-single-collection {
    margin-bottom: 20px;
}

.c-comment-mask {
    .pr;
    .u-mask {
        display: block;
    }
}

@media screen and (max-width: @phone) {
    .m-single-thx {
        zoom: 0.8;
    }
}
</style>
