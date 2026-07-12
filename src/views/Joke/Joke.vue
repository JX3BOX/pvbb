<template>
    <ListLayout>
        <div class="v-joke" v-loading="loading">
            <!-- 单页 -->
            <div class="m-joke-single-container" v-if="id">
                <div class="m-joke-goback">
                    <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">返回列表</el-button>
                    <a class="u-doc" href="/tool/23239" target="_blank">
                        <i class="el-icon-info"></i>游戏内获取或发布骚话
                    </a>
                </div>
                <template v-if="joke?.id">
                    <el-row class="m-joke-list" :gutter="20">
                        <el-col :span="24">
                            <joke-item :joke="joke" mode="single" @update="handleJokeUpdate" />
                        </el-col>
                    </el-row>
                    <Thx
                        class="m-thx"
                        :postId="~~id"
                        postType="joke"
                        :postTitle="title"
                        :userId="user_id"
                        :author-id="user_id"
                        :adminBoxcoinEnable="true"
                        :userBoxcoinEnable="true"
                        client="all"
                    />
                    <div class="m-single-comment">
                        <el-divider content-position="left">评论</el-divider>
                        <CommonComment :id="id" category="joke" />
                    </div>
                </template>
                <el-result
                    v-else-if="singleError"
                    icon="warning"
                    title="骚话不存在或已被删除"
                    :sub-title="singleError"
                >
                    <template #extra>
                        <el-button type="primary" @click="goBack">返回骚话列表</el-button>
                    </template>
                </el-result>
            </div>

            <!-- 列表 -->
            <div class="m-joke-list-container" v-else>
                <!-- 搜索 -->
                <div class="m-archive-search m-joke-search">
                    <!-- <a :href="publish_link" class="u-publish el-button el-button--primary">+ 发布作品</a> -->
                    <el-input
                        placeholder="请输入搜索内容"
                        v-model.trim="search"
                        @keydown.enter="onSearch"
                        clearable
                        @clear="onSearch"
                        size="large"
                    >
                        <template #prepend
                            ><i class="el-icon-search"></i>&nbsp;<span class="u-search">关键词</span></template
                        >
                        <template #append>
                            <el-switch
                                v-model="star"
                                :inactive-value="0"
                                :active-value="1"
                                inactive-text="只看精选"
                            ></el-switch>
                        </template>
                    </el-input>
                </div>
                <div class="m-joke-main">
                    <!-- 门派分类 -->
                    <left-tab class="m-joke-types" @setType="setType"></left-tab>
                    <div class="m-joke-content">
                        <!-- 快捷发布 -->
                        <joke-post :type="type"></joke-post>
                        <!-- 列表 -->
                        <div class="m-joke-list" :gutter="20" v-if="jokes && jokes.length">
                            <div :span="24" v-for="joke in jokes" :key="joke.id">
                                <joke-item
                                    :joke="joke"
                                    :selected-ids="selectedJokeIds"
                                    @selection-change="toggleSelection"
                                    @update="handleJokeUpdate"
                                />
                            </div>
                        </div>
                        <!-- 空 -->
                        <el-alert v-else-if="listError" :title="listError" type="error" show-icon></el-alert>
                        <el-alert v-else title="没有找到相关条目" type="info" show-icon></el-alert>
                        <div class="m-joke-footer">
                            <el-pagination
                                class="m-joke-pagination"
                                background
                                :page-size="per"
                                :hide-on-single-page="true"
                                v-model:current-page="page"
                                layout="total, prev, pager, next, jumper,sizes"
                                :total="total"
                                :page-sizes="[10, 30, 50, 70, 90]"
                                @current-change="handleCurrentChange"
                                @size-change="handleSizeChange"
                            ></el-pagination>
                            <!--  -->
                            <div class="m-joke-reward" v-if="isEditor">
                                <el-button class="m-joke-all" type="primary" size="small" @click="toggleSelectAll"
                                    >{{ allSelected ? "取消全选" : "全选" }}</el-button
                                >
                                <el-button
                                    type="primary"
                                    size="small"
                                    :loading="batchStarLoading"
                                    :disabled="!selectedJokeIds.length || batchStarLoading"
                                    @click="starSelectedJokes"
                                    >设为精选</el-button
                                >
                            </div>
                        </div>
                        <!-- 分页 -->
                    </div>
                </div>
            </div>
        </div>
    </ListLayout>
</template>

<script>
// 模块
import joke_item from "@/components/joke/joke_item";
import joke_post from "@/components/joke/joke_post.vue";
import ListLayout from "@/layouts/ListLayout.vue";
import LeftTab from "@/components/left-tab.vue";

// 数据
import { getJokes, getJoke, starJoke, unstarJoke } from "@/service/joke";
import { getLikes } from "@/service/next";

// 其他
import User from "@jx3box/jx3box-common/js/user";
import CommonComment from "@jx3box/jx3box-ui/src/single/Comment.vue";
import { toggleStarWithAutoAppraise } from "@/utils/starAutoAppraise";
import { buildJokeDocumentTitle, isJokeListHistoryEntry } from "@/utils/joke";

export default {
    name: "Joke",
    components: {
        "joke-item": joke_item,
        "joke-post": joke_post,
        ListLayout,
        LeftTab,
        CommonComment,
    },
    data: function () {
        return {
            loading: false,
            listError: "",
            singleError: "",

            type: "all",
            star: 0,
            search: "",
            per: 10,
            page: 1,
            total: 0,
            jokes: [],

            joke: {},

            selectedJokeIds: [],
            batchStarLoading: false,
        };
    },
    computed: {
        isEditor: function () {
            return User.isEditor();
        },
        id: function () {
            return this.$route.params.id;
        },
        params: function () {
            return {
                per: ~~this.per,
                page: ~~this.page,
                type: this.type == "all" ? "" : this.type,
                search: this.search,
                star: !!this.star ? 1 : "",
            };
        },
        keys: function () {
            return [this.type, this.star];
        },
        user_id: function () {
            return this.joke?.user_id || 0;
        },
        title: function () {
            return this.joke?.content;
        },
        selectedJokes: function () {
            const selectedIds = new Set(this.selectedJokeIds.map(String));
            return this.jokes.filter((item) => selectedIds.has(String(item.id)));
        },
        allSelected: function () {
            return !!this.jokes.length && this.jokes.every((item) => this.selectedJokeIds.includes(String(item.id)));
        },
    },
    methods: {
        setType(type) {
            this.type = type;
        },
        //调整展示条数
        handleSizeChange(val) {
            this.per = val;
            this.page = 1;
            this.selectedJokeIds = [];
            if (!this.updatePaginationQuery({ page: 1, per: val })) {
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
                    this.loadLike();
                })
                .catch((error) => {
                    this.jokes = [];
                    this.total = 0;
                    this.listError = this.getRequestErrorMessage(error, "骚话列表加载失败，请稍后重试");
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadSingle() {
            this.loading = true;
            this.joke = {};
            this.singleError = "";
            return getJoke(this.id)
                .then((res) => {
                    const joke = res?.data?.data;
                    if (!joke?.id) throw new Error("骚话不存在或已被删除");
                    this.joke = joke;
                    document.title = buildJokeDocumentTitle(
                        joke.content,
                        this.$t("pages.common.appendTitle")
                    );
                })
                .catch((error) => {
                    this.singleError = this.getRequestErrorMessage(error, "请返回列表后重新选择一条骚话");
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        handleJokeUpdate: function (options = {}) {
            if (this.id) {
                this.loadSingle();
                return;
            }
            this.loadList(options.noCache ? { _no_cache: 1 } : {});
        },
        init: function () {
            this.id ? this.loadSingle() : this.loadList();
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

        // 杂项
        goBack: function () {
            const back = window.history.state?.back;
            if (isJokeListHistoryEntry(back)) {
                this.$router.back();
                return;
            }
            this.$router.push("/joke");
        },
        skipTop: function () {
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
        // 批量获取点赞
        loadLike: function () {
            if (this.jokes && this.jokes.length) {
                let id = this.jokes.map((d) => "joke-" + d.id);
                id = id.join(",");
                const params = {
                    post_type: "joke",
                    post_action: "likes",
                    id: id,
                };
                return getLikes(params)
                    .then((res) => {
                        const likes = res.data.data;
                        if (Object.keys(likes).length) {
                            this.jokes.forEach((d) => {
                                d.count = likes?.["joke-" + d.id]?.likes;
                            });
                        }
                    })
                    .catch(() => {});
            }
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
                this.$notify({ title: "提示", message: "选中的骚话已经全部是精选", type: "info" });
                return;
            }

            try {
                await this.$confirm(`确定将选中的 ${pending.length} 条骚话设为精选吗？`, "批量精选", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                });
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
                    title: failedCount ? "部分失败" : "成功",
                    message: failedCount
                        ? `成功设置 ${successCount} 条，失败 ${failedCount} 条，请稍后重试`
                        : `已将 ${successCount} 条骚话设为精选`,
                    type: failedCount ? "warning" : "success",
                });
            } finally {
                this.batchStarLoading = false;
            }
        },
        getRequestErrorMessage(error, fallback) {
            const message =
                error?.response?.data?.msg ||
                error?.response?.data?.message ||
                error?.data?.msg ||
                error?.message;
            return typeof message === "string" && message.trim() ? message : fallback;
        },
        onSearch: function () {
            if (this.page !== 1) {
                this.page = 1;
                if (this.updatePaginationQuery({ page: 1, per: this.per })) return;
            }
            if (!this.updatePaginationQuery({ page: 1, per: this.per })) {
                this.init();
            }
        },
    },
    watch: {
        keys: {
            deep: true,
            handler() {
                this.selectedJokeIds = [];
                if (this.page !== 1) {
                    this.page = 1;
                    if (this.updatePaginationQuery({ page: 1, per: this.per })) return;
                }
                if (!this.updatePaginationQuery({ page: 1, per: this.per })) {
                    this.init();
                }
            },
        },
        page: {
            deep: true,
            handler: function () {
                this.selectedJokeIds = [];
            },
        },
        "$route.fullPath": {
            immediate: true,
            handler: function () {
                if (this.id) {
                    this.loadSingle();
                    return;
                }

                const query = this.$route.query;
                const { page, per } = this.getPaginationFromQuery(query);
                this.page = page;
                this.per = per;

                if (this.shouldReplacePaginationQuery(query, page, per)) {
                    this.updatePaginationQuery({ page, per }, true);
                    return;
                }

                this.init();
            },
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/joke/joke.less";
</style>
