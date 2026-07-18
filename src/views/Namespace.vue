<template>
    <ListLayout>
        <div class="m-namespace-box">
            <section class="m-namespace-hero">
                <div class="u-hero-copy">
                    <span class="u-eyebrow">JX3BOX NAMESPACE</span>
                    <h1>{{ $t("pages.namespace.list.heroTitle") }}</h1>
                    <p>{{ $t("pages.namespace.list.heroDescription") }}</p>
                </div>
                <div class="u-hero-action">
                    <div class="u-action-list">
                        <a
                            :href="publish_link"
                            class="u-publish u-namespace-create el-button el-button--large el-button--primary"
                        >
                            <i class="el-icon-plus"></i><span>{{ $t("pages.namespace.list.create") }}</span>
                        </a>
                        <a
                            href="/publish/#/bucket/namespace"
                            class="u-publish u-namespace-mine el-button el-button--large"
                        >
                            <i class="el-icon-receiving"></i><span>{{ $t("pages.namespace.list.mine") }}</span>
                        </a>
                    </div>
                    <span class="u-total">{{ $t("pages.namespace.list.total", { count: total }) }}</span>
                </div>
            </section>

            <!-- 搜索 -->
            <div class="m-archive-search m-namespace-search" key="namespace-search">
                <i class="el-icon-search u-search-icon"></i>
                <el-input
                    :placeholder="$t('pages.namespace.list.searchPlaceholder')"
                    v-model.trim="search"
                    clearable
                    @clear="onSearch"
                    @keydown.enter="onSearch"
                    class="input-with-select"
                    size="large"
                ></el-input>
                <el-button class="u-btn" @click="onSearch">{{ $t("pages.namespace.list.search") }}</el-button>
            </div>
            <section class="v-namespace m-namespace-shelf">
                <div class="m-namespace-shelf-head">
                    <div>
                        <span class="u-title">{{ $t("pages.namespace.list.all") }}</span>
                        <span class="u-desc">{{ $t("pages.namespace.list.discover") }}</span>
                    </div>
                    <span class="u-page">{{ $t("pages.namespace.list.page", { page }) }}</span>
                </div>
                <div class="m-namespace-toolbar">
                    <!-- tab切换 -->
                    <el-tabs class="m-namespace-tab" v-model="type">
                        <el-tab-pane :label="$t('pages.namespace.list.all')" name="all"></el-tab-pane>
                        <el-tab-pane
                            v-for="item in types"
                            :label="$t(item.labelKey)"
                            :key="item.value"
                            :name="item.value"
                        ></el-tab-pane>
                    </el-tabs>
                    <!-- 排序 -->
                    <div class="m-namespace-order">
                        <orderBy class="u-item" @filter="changeOrder"></orderBy>
                    </div>
                </div>
                <el-alert v-if="query" type="warning" show-icon class="m-namespace-warning">
                    <template #title>
                        {{ $t("pages.namespace.list.notFound", { query }) }}
                    </template>
                </el-alert>
                <!-- 列表内容 -->
                <div v-if="loading" class="m-namespace-list m-namespace-skeleton" aria-hidden="true">
                    <el-skeleton v-for="index in 6" :key="index" animated>
                        <template #template>
                            <div class="m-namespace-item">
                                <el-skeleton-item variant="text" class="u-skeleton-title" />
                                <el-skeleton-item variant="text" class="u-skeleton-desc" />
                                <div class="u-skeleton-meta">
                                    <el-skeleton-item variant="text" class="u-skeleton-author" />
                                    <el-skeleton-item variant="text" class="u-skeleton-time" />
                                </div>
                            </div>
                        </template>
                    </el-skeleton>
                </div>
                <div class="m-namespace-list" v-else-if="list && list.length">
                    <div class="u-namespace" v-for="item in list" :key="item.ID">
                        <namespace-item :data="item" />
                    </div>
                </div>
                <!-- 无数据 -->
                <div class="m-namespace-null" v-else>
                    <el-alert :title="$t('pages.namespace.list.empty')" type="info" show-icon></el-alert>
                </div>
                <!-- 分页 -->
                <el-pagination
                    v-if="!loading"
                    class="m-namespace-pages"
                    background
                    layout="total, prev, pager, next,jumper"
                    :hide-on-single-page="true"
                    :page-size="per"
                    :total="total"
                    v-model:current-page="page"
                ></el-pagination>
            </section>
        </div>
    </ListLayout>
</template>

<script>
import namespaceItem from "@/components/namespace/namespace_item";
import { getNamespaceList } from "@/service/namespace.js";
import { publishLink } from "@jx3box/jx3box-common/js/utils.js";
import ListLayout from "@/layouts/ListLayout.vue";

export default {
    name: "Namespace",
    props: [],
    data: function () {
        return {
            type: "all",
            types: [
                { labelKey: "pages.namespace.list.types.player", value: "player" },
                { labelKey: "pages.namespace.list.types.team", value: "team" },
                { labelKey: "pages.namespace.list.types.system", value: "system" },
                { labelKey: "pages.namespace.list.types.custom", value: "custom" },
            ],
            list: "",
            per: 24,
            total: 1,
            page: 1,
            order: "update",
            search: "",
            query: "",
            loading: false,
        };
    },
    computed: {
        params: function () {
            let _params = {
                source_type: this.type == "all" ? "" : this.type,
                // source_id
                page: this.page,
                per: this.per,
                // status: 1
            };
            if (this.order == "podate") {
                _params.sort = "created";
            } else {
                _params.sort = "updated";
            }
            return _params;
        },
        publish_link: function () {
            return publishLink("namespace");
        },
        buy_link: function () {
            return "/vip/namespace?from=bbs_namespace";
        },
    },
    methods: {
        loadNamespaceList: function () {
            this.loading = true;
            const params = this.removeEmpty(
                Object.assign({}, this.params, {
                    key: this.search,
                })
            );
            getNamespaceList(params)
                .then((res) => {
                    this.list = res.data.data.list || [];
                    this.total = res.data.data.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        changeOrder: function (o) {
            this.order = o.val;
        },
        onSearch: function () {
            if (this.page != 1) {
                this.page = 1;
                return;
            }
            this.loadNamespaceList();
        },
        removeEmpty: function (obj) {
            Object.keys(obj).forEach((key) => {
                if (obj[key] === null || obj[key] === undefined || obj[key] === "") {
                    delete obj[key];
                }
            });
            return obj;
        },
    },
    watch: {
        type: function () {
            this.page = 1;
        },
        params: {
            deep: true,
            immediate: true,
            handler: function (newVal) {
                this.query = "";
                this.loadNamespaceList();
            },
        },
    },
    created: function () {
        this.query = this.$route.query.namespace;
    },
    components: {
        "namespace-item": namespaceItem,
        ListLayout,
    },
};
</script>

<style lang="less">
@import "../assets/css/app.less";
@import "../assets/css/namespace/namespace.less";
</style>
