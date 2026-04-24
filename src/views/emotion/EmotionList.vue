<template>
    <div class="m-emotion-list-container" v-loading="loading">
        <div class="m-archive-search m-emotion-search">
            <el-input
                v-model.trim="search"
                placeholder="请输入搜索内容"
                clearable
                size="large"
                @keydown.enter="onSearch"
                @clear="onSearch"
            >
                <template #prepend>
                    <i class="el-icon-search"></i>
                    <span class="u-search">关键词</span>
                </template>
                <template #append>
                    <el-switch
                        v-model="star"
                        class="u-star"
                        :inactive-value="0"
                        :active-value="1"
                        inactive-text="只看精选"
                    />
                </template>
            </el-input>
        </div>

        <div class="m-emotion-main">
            <left-tab class="m-emotion-types" @setType="setType" />
            <div class="m-emotion-content">
                <emotion-post @success="handlePublishSuccess" />

                <ul class="m-emotion-list" v-if="list.length">
                    <waterfall
                        ref="waterfall"
                        :autoResize="waterfallOptions.autoResize"
                        :moveTransitionDuration="0.4"
                        :fillBox="waterfallOptions.fillBox"
                        :list="list"
                        imgKey="src"
                        :col-width="waterfallOptions.colWidth"
                        :col="waterfallOptions.col"
                    >
                        <template #default="item">
                            <div class="u-item waterfall-item m-emotion-item" :class="{ fadeIn: item.state == 'show' }">
                                <div class="u-emotion">
                                    <img
                                        class="u-pic u-emotion-pic waterfall-img"
                                        :src="showEmotion(item.data.url)"
                                        :alt="item.data.desc"
                                        :key="item.data.url"
                                        @click="handlePreview(item.data)"
                                    />
                                    <i class="u-star" v-if="item.data.star">
                                        <i class="el-icon-star-off"></i>
                                        <i class="u-original" v-if="item.data.original">原创</i>
                                    </i>
                                </div>
                                <div class="u-item-bottom">
                                    <div class="u-info-user">
                                        <a
                                            class="u-user-name"
                                            :href="doEmotionUser(item.data).userLink"
                                            target="_blank"
                                        >
                                            <img
                                                class="u-user-avatar waterfall-img"
                                                :src="doEmotionUser(item.data).userAvatar"
                                                :key="doEmotionUser(item.data).userAvatar"
                                            />
                                            {{ doEmotionUser(item.data).username }}
                                        </a>
                                    </div>
                                    <div class="u-info-misc">
                                        <time class="u-time">{{ doEmotionUser(item.data).time }}</time>
                                        <el-checkbox
                                            v-if="isEditor"
                                            v-model="rewardObj[item.data.id]"
                                            class="u-op-item u-op-gift"
                                            :disabled="!item.data.user_id || isSelf(item.data)"
                                            @change="doReward($event, item.data)"
                                        >
                                            选中
                                        </el-checkbox>
                                        <a
                                            v-else
                                            class="u-like"
                                            :class="{ on: item.data.isLike }"
                                            title="赞"
                                            @click="addLike(item.data)"
                                        >
                                            <i class="like-icon">{{ item.data.isLike ? "♥ " : "♡ " }}</i>
                                            <span class="like-text">Like</span>
                                            <span class="like-count" v-if="item.data.count">{{ item.data.count }}</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </waterfall>
                </ul>

                <el-alert v-else title="没有找到相关条目" type="info" show-icon />

                <div class="m-emotion-footer">
                    <el-pagination
                        v-model:current-page="page"
                        class="m-emotion-pagination"
                        background
                        :page-size="per"
                        :hide-on-single-page="true"
                        layout="total, prev, pager, next, jumper,sizes"
                        :total="total"
                        :page-sizes="[10, 30, 50, 70, 90]"
                        @current-change="handleCurrentChange"
                        @size-change="handleSizeChange"
                    />
                    <div class="m-emotion-reward" v-if="isEditor">
                        <el-button class="m-emotion-all" type="primary" size="small" @click="rewardAll">
                            {{ rewardAllType ? "取消" : "" }} 全选
                        </el-button>
                        <!-- <Thx
                            type="batchReward"
                            postType="emotion"
                            :postId="rewardArr"
                            :adminBoxcoinEnable="true"
                            :userBoxcoinEnable="true"
                            client="all"
                        /> -->
                        <!-- TODO: 实装 -->
                        <el-button type="primary" size="small">设为精选</el-button>
                    </div>
                    <template v-else>
                        <el-button
                            v-show="page < pages"
                            class="m-emotion-more"
                            type="primary"
                            icon="ArrowDown"
                            size="small"
                            :disabled="loading"
                            @click="loadMore"
                        >
                            加载更多
                        </el-button>
                    </template>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
import WaterfallRapid from "@/components/WaterfallRapid.vue";
import LeftTab from "@/components/left-tab.vue";
import emotion_post from "@/components/emotion/emotion_post";
import { resolveImagePath, getThumbnail, authorLink, showAvatar } from "@jx3box/jx3box-common/js/utils";
import { getRelativeTime } from "@/utils/dateFormat.js";
import { getEmotions } from "@/service/emotion";
import { getLikes } from "@/service/next";
import { postStat } from "@jx3box/jx3box-common/js/stat";
import User from "@jx3box/jx3box-common/js/user";

export default {
    name: "EmotionList",
    components: {
        waterfall: WaterfallRapid,
        LeftTab,
        "emotion-post": emotion_post,
    },
    data() {
        return {
            loading: false,
            type: "all",
            star: 0,
            original: 0,
            search: "",
            per: 50,
            page: 1,
            pages: 1,
            total: 0,
            emotions: [],
            list: [],
            waterfallOptions: {
                autoResize: true,
                fillBox: true,
                colWidth: 260,
                col: 5,
            },
            resizeHandler: null,
            rewardObj: {},
            rewardArr: [],
        };
    },
    computed: {
        params() {
            return {
                per: ~~this.per,
                page: ~~this.page,
                type: this.type == "all" ? "" : this.type,
                search: this.search,
                star: this.star ? 1 : "",
                original: this.original ? 1 : "",
            };
        },
        keys() {
            return [this.type, this.star, this.original];
        },
        rewardAllType() {
            const validCount = this.emotions.filter((item) => item.user_id).length;
            return validCount > 0 && this.rewardArr.length === validCount;
        },
        isEditor() {
            return User.isEditor();
        },
    },
    watch: {
        keys: {
            deep: true,
            handler() {
                this.rewardArr = [];
                if (this.page !== 1) {
                    this.page = 1;
                    if (this.updatePaginationQuery({ page: 1, per: this.per })) return;
                }
                if (!this.updatePaginationQuery({ page: 1, per: this.per })) {
                    this.loadList();
                }
            },
        },
        "$route.query": {
            deep: true,
            immediate: true,
            handler(query) {
                const { page, per } = this.getPaginationFromQuery(query);
                this.page = page;
                this.per = per;

                if (this.shouldReplacePaginationQuery(query, page, per)) {
                    this.updatePaginationQuery({ page, per }, true);
                    return;
                }

                this.loadList();
            },
        },
    },
    created() {
        this.waterfallOptions.col = this.calcCol();
        this.resizeCalc();
    },
    beforeUnmount() {
        if (this.resizeHandler) {
            window.removeEventListener("resize", this.resizeHandler);
        }
    },
    methods: {
        handleSizeChange(val) {
            this.per = val;
            this.rewardArr = [];
            if (this.page !== 1) {
                this.page = 1;
                if (this.updatePaginationQuery({ page: 1, per: val })) return;
            }
            if (!this.updatePaginationQuery({ page: 1, per: val })) {
                this.loadList();
            }
        },
        handlePublishSuccess() {
            this.rewardArr = [];
            if (this.page !== 1) {
                this.page = 1;
                if (this.updatePaginationQuery({ page: 1, per: this.per })) return;
            }
            if (!this.updatePaginationQuery({ page: 1, per: this.per })) {
                this.loadList();
            }
        },
        doReward(val, data) {
            if (val) {
                if (!this.rewardArr.find((item) => ~~item.article_id === ~~data.id)) {
                    this.rewardArr.push({
                        user_id: data.user_id,
                        article_id: data.id.toString(),
                        article_type: "emotion",
                    });
                }
                return;
            }

            this.rewardArr = this.rewardArr.filter((item) => ~~item.article_id !== ~~data.id);
        },
        rewardAll() {
            const arr = [];

            this.emotions.forEach((item) => {
                if (item.user_id && this.isNotSelf(item.user_id)) {
                    arr.push({
                        user_id: item.user_id,
                        article_id: item.id.toString(),
                        article_type: "emotion",
                    });
                }
                this.rewardObj[item.id] = !this.rewardAllType;
            });

            this.rewardArr = this.rewardAllType ? [] : arr;
        },
        isNotSelf(id) {
            return id != User.getInfo().uid;
        },
        isSelf(emotion) {
            return emotion.user_id == User.getInfo().uid;
        },
        setType(type) {
            this.type = type;
        },
        onSearch() {
            if (this.page !== 1) {
                this.page = 1;
                if (this.updatePaginationQuery({ page: 1, per: this.per })) return;
            }
            if (!this.updatePaginationQuery({ page: 1, per: this.per })) {
                this.loadList();
            }
        },
        handleCurrentChange(page) {
            this.page = page;
            this.rewardArr = [];
            this.skipTop();
            if (!this.updatePaginationQuery({ page, per: this.per })) {
                this.loadList();
            }
        },
        handleDelete() {
            this.onSearch();
        },
        loadList(appendMode = false) {
            this.loading = true;
            const params = {
                ...this.params,
                page: appendMode ? this.page + 1 : this.page,
            };

            return getEmotions(params)
                .then((res) => {
                    const rows = (res.data?.data?.list || []).map((item) => ({
                        ...item,
                        isLike: item.isLike || false,
                    }));

                    if (appendMode) {
                        this.page = params.page;
                        this.list = [...this.list, ...rows];
                        this.emotions = cloneDeep(this.list);
                    } else {
                        this.rewardObj = {};
                        this.list = rows;
                        this.emotions = cloneDeep(rows);
                    }

                    this.total = res.data?.data?.total || 0;
                    this.pages = res.data?.data?.pages || 1;

                    return this.loadLike();
                })
                .then(() => {
                    if (!this.$refs.waterfall) return;

                    this.$nextTick(() => {
                        if (appendMode) {
                            this.$refs.waterfall.repaints(params.page * this.per, 1);
                        } else {
                            this.$refs.waterfall.init();
                        }

                        this.$refs.waterfall.onRender = () => {
                            this.loading = false;
                        };
                    });
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadMore() {
            this.loadList(true);
        },
        normalizePositiveInteger(value, fallback) {
            const rawValue = Array.isArray(value) ? value[0] : value;
            const number = parseInt(rawValue, 10);
            return number > 0 ? number : fallback;
        },
        getPaginationFromQuery(query = this.$route.query) {
            return {
                page: this.normalizePositiveInteger(query.page, 1),
                per: this.normalizePositiveInteger(query.per, this.per),
            };
        },
        shouldReplacePaginationQuery(query = this.$route.query, page = this.page, per = this.per) {
            const hasPage = Object.prototype.hasOwnProperty.call(query, "page");
            const hasPer = Object.prototype.hasOwnProperty.call(query, "per");
            return (hasPage && String(query.page) !== String(page)) || (hasPer && String(query.per) !== String(per));
        },
        updatePaginationQuery({ page = this.page, per = this.per } = {}, replace = false) {
            const query = {
                ...this.$route.query,
                page: String(page),
                per: String(per),
            };

            if (String(this.$route.query.page) === query.page && String(this.$route.query.per) === query.per) {
                return false;
            }

            this.$router[replace ? "replace" : "push"]({
                name: this.$route.name,
                params: this.$route.params,
                query,
            });
            return true;
        },
        loadLike() {
            if (!this.emotions.length) return Promise.resolve();

            let id = this.emotions.map((d) => "emotion-" + d.id).join(",");
            const params = {
                post_type: "emotion",
                post_action: "likes",
                id,
            };

            return getLikes(params).then((res) => {
                const likes = res.data?.data || {};

                this.emotions.forEach((d) => {
                    d.count = likes?.["emotion-" + d.id]?.likes || d.count || 0;
                });

                this.list = this.list.map((item) => {
                    const current = this.emotions.find((emotion) => emotion.id === item.id);
                    return current ? { ...item, count: current.count } : item;
                });
            });
        },
        skipTop() {
            window.scrollTo(0, 0);
        },
        calcCol() {
            const colW = 300;
            const width = window.innerWidth;

            if (width < 780) return 2;
            if (width > 1024) return parseInt((window.innerWidth - 330) / colW);
            return parseInt(window.innerWidth / colW);
        },
        resizeCalc() {
            this.resizeHandler = debounce(() => {
                this.waterfallOptions.col = this.calcCol();
            }, 200);

            window.addEventListener("resize", this.resizeHandler);
        },
        handlePreview(data) {
            this.$router.push({ name: "emotion", params: { id: data.id } });
        },
        showEmotion(url) {
            return this.checkIsGif(url) ? resolveImagePath(url) : getThumbnail(url, "emotion_thumbnail");
        },
        checkIsGif(url) {
            return url?.split(".").pop().toLowerCase() == "gif";
        },
        doEmotionUser(emotion) {
            const gmt = emotion?.updated_at;

            return {
                time: getRelativeTime(new Date(gmt)) || "",
                username: emotion?.user_info?.display_name.slice(0, 12) || "匿名",
                userLink: authorLink(emotion?.user_id) || "",
                userAvatar: showAvatar(emotion?.user_info?.user_avatar) || "",
            };
        },
        addLike(item) {
            if (item.isLike) return;

            item.count = (item.count || 0) + 1;
            postStat("emotion", item?.id, "likes");
            item.isLike = true;
        },
    },
};
</script>
