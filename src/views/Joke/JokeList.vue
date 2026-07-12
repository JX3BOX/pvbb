<template>
    <ContentListShell
        class="m-joke-list-container"
        :title="$t('pages.joke.title')"
        :description="$t('pages.joke.heroDescription')"
        icon="el-icon-chat-dot-round"
        :loading="loading"
        :type="type"
        @set-type="setType"
    >
        <template #publish>
            <joke-post :type="type" />
        </template>

        <ContentSearchBar
            v-model:keyword="search"
            v-model:star="star"
            :placeholder="$t('pages.joke.searchPlaceholder')"
            :featured-label="$t('pages.joke.featured')"
            @search="onSearch"
        />

        <div class="m-joke-list" v-if="jokes.length">
            <joke-item
                v-for="joke in jokes"
                :key="joke.id"
                :joke="joke"
                :selected-ids="selectedJokeIds"
                @selection-change="toggleSelection"
                @update="handleJokeUpdate"
            />
        </div>

        <el-alert v-else-if="listError" :title="listError" type="error" show-icon />
        <el-alert v-else :title="$t('pages.joke.noResults')" type="info" show-icon />

        <div class="m-joke-footer">
            <el-pagination
                v-model:current-page="page"
                class="m-joke-pagination"
                background
                :page-size="per"
                :hide-on-single-page="true"
                layout="total, prev, pager, next, jumper,sizes"
                :total="total"
                :page-sizes="[10, 30, 50, 70, 90]"
                @current-change="handleCurrentChange"
                @size-change="handleSizeChange"
            />
            <div class="m-joke-reward" v-if="isEditor">
                <el-button class="m-joke-all" type="primary" size="small" @click="toggleSelectAll">
                    {{ allSelected ? $t("pages.joke.deselectAll") : $t("pages.joke.selectAll") }}
                </el-button>
                <el-button
                    type="primary"
                    size="small"
                    :loading="batchStarLoading"
                    :disabled="!selectedJokeIds.length || batchStarLoading"
                    @click="starSelectedJokes"
                >
                    {{ $t("pages.joke.markFeatured") }}
                </el-button>
            </div>
        </div>
    </ContentListShell>
</template>

<script>
import ContentListShell from "@/components/common/ContentListShell.vue";
import ContentSearchBar from "@/components/common/ContentSearchBar.vue";
import joke_item from "@/components/joke/joke_item";
import joke_post from "@/components/joke/joke_post.vue";
import { getJokes, starJoke, unstarJoke } from "@/service/joke";
import { getLikes } from "@/service/next";
import User from "@jx3box/jx3box-common/js/user";
import { toggleStarWithAutoAppraise } from "@/utils/starAutoAppraise";
import { getPaginationFromQuery, isSameRouteQuery, shouldReplacePaginationQuery } from "@/utils/listQuery";

export default {
    name: "JokeList",
    components: {
        ContentListShell,
        ContentSearchBar,
        "joke-item": joke_item,
        "joke-post": joke_post,
    },
    data() {
        return {
            loading: false,
            listError: "",
            type: "all",
            star: 0,
            search: "",
            per: 10,
            page: 1,
            total: 0,
            jokes: [],
            selectedJokeIds: [],
            batchStarLoading: false,
            syncingRouteState: false,
        };
    },
    computed: {
        isEditor() {
            return User.isEditor();
        },
        params() {
            return {
                per: ~~this.per,
                page: ~~this.page,
                type: this.type === "all" ? "" : this.type,
                search: this.search,
                star: this.star ? 1 : "",
            };
        },
        keys() {
            return [this.type, this.star];
        },
        selectedJokes() {
            const selectedIds = new Set(this.selectedJokeIds.map(String));
            return this.jokes.filter((item) => selectedIds.has(String(item.id)));
        },
        allSelected() {
            return !!this.jokes.length && this.jokes.every((item) => this.selectedJokeIds.includes(String(item.id)));
        },
    },
    watch: {
        keys: {
            deep: true,
            handler() {
                if (this.syncingRouteState) return;

                this.selectedJokeIds = [];
                if (this.page !== 1) {
                    this.page = 1;
                    if (this.updatePaginationQuery({ page: 1, per: this.per })) return;
                }
                if (!this.updatePaginationQuery({ page: 1, per: this.per })) {
                    this.loadList();
                }
            },
        },
        page() {
            this.selectedJokeIds = [];
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
    methods: {
        setType(type) {
            this.type = type;
        },
        handleSizeChange(per) {
            this.per = per;
            this.page = 1;
            this.selectedJokeIds = [];
            if (!this.updatePaginationQuery({ page: 1, per })) {
                this.loadList();
            }
        },
        loadList(extraParams = {}) {
            this.loading = true;
            this.listError = "";
            return getJokes({
                ...this.params,
                ...extraParams,
            })
                .then((res) => {
                    this.jokes = res?.data?.data?.list || [];
                    this.total = res?.data?.data?.total || 0;
                    return this.loadLike();
                })
                .catch((error) => {
                    this.jokes = [];
                    this.total = 0;
                    this.listError = this.getRequestErrorMessage(error, this.$t("pages.joke.listLoadFailed"));
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        handleJokeUpdate(options = {}) {
            this.loadList(options.noCache ? { _no_cache: 1 } : {});
        },
        getQueryString(value, fallback = "") {
            const rawValue = Array.isArray(value) ? value[0] : value;
            return typeof rawValue === "string" ? rawValue : fallback;
        },
        getListStateFromQuery(query = this.$route.query) {
            return {
                type: this.getQueryString(query.type, "all") || "all",
                star: this.getQueryString(query.star) === "1" ? 1 : 0,
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
        skipTop() {
            window.scrollTo(0, 0);
        },
        handleCurrentChange(page) {
            this.page = page;
            this.selectedJokeIds = [];
            this.skipTop();
            if (!this.updatePaginationQuery({ page, per: this.per })) {
                this.loadList();
            }
        },
        loadLike() {
            if (!this.jokes.length) return Promise.resolve();

            const params = {
                post_type: "joke",
                post_action: "likes",
                id: this.jokes.map((item) => `joke-${item.id}`).join(","),
            };

            return getLikes(params)
                .then((res) => {
                    const likes = res.data?.data || {};
                    this.jokes.forEach((item) => {
                        item.count = likes?.[`joke-${item.id}`]?.likes;
                    });
                })
                .catch(() => {});
        },
        toggleSelection(joke) {
            const id = String(joke.id);
            this.selectedJokeIds = this.selectedJokeIds.includes(id)
                ? this.selectedJokeIds.filter((item) => item !== id)
                : [...this.selectedJokeIds, id];
        },
        toggleSelectAll() {
            this.selectedJokeIds = this.allSelected ? [] : this.jokes.map((item) => String(item.id));
        },
        async starSelectedJokes() {
            if (this.batchStarLoading) return;

            const pending = this.selectedJokes.filter((item) => !item.star);
            if (!pending.length) {
                this.$notify({
                    title: this.$t("pages.joke.notice"),
                    message: this.$t("pages.joke.selectedAlreadyFeatured"),
                    type: "info",
                });
                return;
            }

            try {
                await this.$confirm(
                    this.$t("pages.joke.batchFeaturedConfirm", { count: pending.length }),
                    this.$t("pages.joke.batchFeaturedTitle"),
                    {
                        confirmButtonText: this.$t("pages.joke.confirm"),
                        cancelButtonText: this.$t("pages.joke.cancel"),
                        type: "warning",
                    }
                );
            } catch (_) {
                return;
            }

            this.batchStarLoading = true;
            try {
                const results = await Promise.allSettled(
                    pending.map((item) =>
                        toggleStarWithAutoAppraise({
                            postType: "joke",
                            articleId: item.id,
                            userId: item.user_id,
                            isStar: false,
                            starRequest: starJoke,
                            unstarRequest: unstarJoke,
                        })
                    )
                );
                const failedCount = results.filter((item) => item.status === "rejected").length;
                const successCount = results.length - failedCount;

                if (successCount) {
                    this.selectedJokeIds = [];
                    await this.loadList({ _no_cache: 1 });
                }

                this.$notify({
                    title: failedCount ? this.$t("pages.joke.failed") : this.$t("pages.joke.success"),
                    message: failedCount
                        ? this.$t("pages.joke.batchFeaturedPartial", { success: successCount, failed: failedCount })
                        : this.$t("pages.joke.batchFeaturedSuccess", { count: successCount }),
                    type: failedCount ? "warning" : "success",
                });
            } finally {
                this.batchStarLoading = false;
            }
        },
        getRequestErrorMessage(error, fallback) {
            const message =
                error?.response?.data?.msg || error?.response?.data?.message || error?.data?.msg || error?.message;
            return typeof message === "string" && message.trim() ? message : fallback;
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
    },
};
</script>
