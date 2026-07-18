<template>
    <ContentListShell
        class="m-emotion-list-container"
        :title="$t('pages.emotion.title')"
        :description="$t('pages.emotion.heroDescription')"
        icon="el-icon-picture-outline"
        :loading="loading && !!list.length"
        :type="type"
        @set-type="setType"
    >
        <template #publish>
            <emotion-post @success="handlePublishSuccess" />
        </template>

        <ContentSearchBar
            v-model:keyword="search"
            v-model:star="star"
            :placeholder="$t('pages.emotion.searchPlaceholder')"
            :featured-label="$t('pages.emotion.featured')"
            @search="onSearch"
        />

                <el-alert
                    v-if="loadError"
                    class="m-emotion-load-error"
                    :title="loadError"
                    type="error"
                    show-icon
                    :closable="false"
                />

                <div v-if="loading && !list.length" class="m-emotion-skeleton" aria-hidden="true">
                    <div v-for="item in skeletonItems" :key="item" class="m-emotion-skeleton-item">
                        <el-skeleton animated>
                            <template #template>
                                <el-skeleton-item variant="image" class="u-skeleton-image" />
                                <el-skeleton-item variant="text" class="u-skeleton-description" />
                                <div class="u-skeleton-meta">
                                    <el-skeleton-item variant="circle" class="u-skeleton-avatar" />
                                    <el-skeleton-item variant="text" class="u-skeleton-name" />
                                    <el-skeleton-item variant="text" class="u-skeleton-action" />
                                </div>
                            </template>
                        </el-skeleton>
                    </div>
                </div>

                <ul class="m-emotion-list" v-else-if="list.length">
                    <waterfall
                        ref="waterfall"
                        allow-overflow
                        :autoResize="waterfallOptions.autoResize"
                        :moveTransitionDuration="0.4"
                        :fillBox="waterfallOptions.fillBox"
                        :list="list"
                        imgKey="src"
                        :col-width="waterfallOptions.colWidth"
                        :col="waterfallOptions.col"
                    >
                        <template #default="item">
                            <EmotionItem
                                class="u-item waterfall-item"
                                :class="{ fadeIn: item.state === 'show' }"
                                :emotion="item.data"
                                :is-editor="isEditor"
                                :star-loading="!!starLoadingObj[item.data.id]"
                                @preview="handlePreview"
                                @star="handleStar"
                                @like="addLike"
                            />
                        </template>
                    </waterfall>
                </ul>

                <el-alert v-else-if="!loading && !loadError" :title="$t('pages.emotion.noEntries')" type="info" show-icon />

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
                    <el-button
                        v-if="!isEditor"
                        v-show="page < pages"
                        class="m-emotion-more"
                        type="primary"
                        icon="ArrowDown"
                        size="small"
                        :disabled="loading"
                        @click="loadMore"
                    >
                        {{ $t("pages.emotion.loadMore") }}
                    </el-button>
                </div>
    </ContentListShell>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
import ContentListShell from "@/components/common/ContentListShell.vue";
import ContentSearchBar from "@/components/common/ContentSearchBar.vue";
import WaterfallRapid from "@/components/WaterfallRapid.vue";
import EmotionItem from "@/components/emotion/emotion_item.vue";
import emotion_post from "@/components/emotion/emotion_post";
import { getEmotions, starEmotion, unstarEmotion } from "@/service/emotion";
import { getLikes } from "@/service/next";
import { postStat } from "@jx3box/jx3box-common/js/stat";
import User from "@jx3box/jx3box-common/js/user";
import { toggleStarWithAutoAppraise } from "@/utils/starAutoAppraise";
import { getPaginationFromQuery, isSameRouteQuery, shouldReplacePaginationQuery } from "@/utils/listQuery";

export default {
    name: "EmotionList",
    components: {
        ContentListShell,
        ContentSearchBar,
        EmotionItem,
        waterfall: WaterfallRapid,
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
            loadError: "",
            waterfallOptions: {
                autoResize: true,
                fillBox: true,
                colWidth: 260,
                col: 5,
            },
            resizeHandler: null,
            starLoadingObj: {},
            syncingRouteState: false,
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
        isEditor() {
            return User.isEditor();
        },
        skeletonItems() {
            return Math.min(Math.max(Number(this.per) || 10, 5), 10);
        },
    },
    watch: {
        keys: {
            deep: true,
            handler() {
                if (this.syncingRouteState) return;

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
                const { page, per } = getPaginationFromQuery(query, this.per);
                const routeState = this.getListStateFromQuery(query);

                this.syncingRouteState = true;
                this.page = page;
                this.per = per;
                this.type = routeState.type;
                this.star = routeState.star;
                this.original = routeState.original;
                this.search = routeState.search;

                this.$nextTick(() => {
                    this.syncingRouteState = false;
                });

                if (shouldReplacePaginationQuery(query, page, per)) {
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
            if (this.page !== 1) {
                this.page = 1;
                if (this.updatePaginationQuery({ page: 1, per: val })) return;
            }
            if (!this.updatePaginationQuery({ page: 1, per: val })) {
                this.loadList();
            }
        },
        handlePublishSuccess() {
            if (this.page !== 1) {
                this.page = 1;
                if (this.updatePaginationQuery({ page: 1, per: this.per })) return;
            }
            if (!this.updatePaginationQuery({ page: 1, per: this.per })) {
                this.loadList();
            }
        },
        handleStar(emotion) {
            const id = emotion?.id;
            if (!id || this.starLoadingObj[id]) return;

            const isStar = !!emotion.star;

            this.starLoadingObj = {
                ...this.starLoadingObj,
                [id]: true,
            };

            toggleStarWithAutoAppraise({
                postType: "emotion",
                articleId: id,
                userId: emotion.user_id,
                isStar,
                starRequest: starEmotion,
                unstarRequest: unstarEmotion,
            })
                .then(({ nextStar, skippedAutoAppraise }) => {
                    emotion.star = nextStar;
                    const target = this.emotions.find((item) => item.id === id);
                    if (target) target.star = nextStar;

                    this.$notify({
                        title: this.$t("pages.emotion.success"),
                        message: this.$t(isStar ? "pages.emotion.cancelFeaturedSuccess" : "pages.emotion.setFeaturedSuccess"),
                        type: "success",
                    });

                    if (skippedAutoAppraise) {
                        this.$notify({
                            title: this.$t("pages.emotion.notice"),
                            message: this.$t("pages.emotion.autoAppraiseSkipped"),
                            type: "warning",
                        });
                    }

                    return this.loadList(false, { _no_cache: 1 });
                })
                .catch((error) => {
                    const rollbackFailed = !!error?.rollbackError;
                    this.$notify({
                        title: this.$t("pages.emotion.failure"),
                        message: rollbackFailed
                            ? this.$t("pages.emotion.autoAppraiseRollbackFailed")
                            : isStar
                              ? this.$t("pages.emotion.cancelAutoAppraiseFailed")
                              : this.$t("pages.emotion.autoAppraiseFailed"),
                        type: "error",
                    });
                })
                .finally(() => {
                    this.starLoadingObj = {
                        ...this.starLoadingObj,
                        [id]: false,
                    };
                });
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
            this.skipTop();
            if (!this.updatePaginationQuery({ page, per: this.per })) {
                this.loadList();
            }
        },
        handleDelete() {
            this.onSearch();
        },
        loadList(appendMode = false, extraParams = {}) {
            this.loading = true;
            this.loadError = "";
            const params = {
                ...this.params,
                page: appendMode ? this.page + 1 : this.page,
                ...extraParams,
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
                .catch(() => {
                    this.loadError = this.$t("pages.emotion.loadError");
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadMore() {
            this.loadList(true);
        },
        getQueryString(value, fallback = "") {
            const rawValue = Array.isArray(value) ? value[0] : value;
            return typeof rawValue === "string" ? rawValue : fallback;
        },
        getListStateFromQuery(query = this.$route.query) {
            return {
                type: this.getQueryString(query.type, "all") || "all",
                star: this.getQueryString(query.star) === "1" ? 1 : 0,
                original: this.getQueryString(query.original) === "1" ? 1 : 0,
                search: this.getQueryString(query.search),
            };
        },
        buildListQuery({ page = this.page, per = this.per } = {}) {
            const query = {
                ...this.$route.query,
                page: String(page),
                per: String(per),
            };

            if (this.type && this.type !== "all") query.type = this.type;
            else delete query.type;

            if (this.star) query.star = "1";
            else delete query.star;

            if (this.original) query.original = "1";
            else delete query.original;

            if (this.search) query.search = this.search;
            else delete query.search;

            return query;
        },
        updatePaginationQuery({ page = this.page, per = this.per } = {}, replace = false) {
            const query = this.buildListQuery({ page, per });

            if (isSameRouteQuery(this.$route.query, query)) {
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
            this.$router.push({ name: "emotion", params: { id: data.id }, query: this.buildListQuery() });
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
