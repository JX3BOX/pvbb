<template>
    <ListLayout>
        <!-- 搜索 -->
        <div class="m-archive-search m-namespace-search" key="namespace-search">
            <el-input
                placeholder="请输入搜索内容"
                v-model.trim="search"
                clearable
                @clear="onSearch"
                @keydown.enter="onSearch"
                class="input-with-select"
                size="large"
            >
                <template #prepend><i class="el-icon-search"></i> <span class="u-search">关键词</span></template>
                <template #append>
                    <el-button class="u-btn" @click="onSearch">
                        <i class="el-icon-position"></i>
                    </el-button>
                </template>
            </el-input>
        </div>
        <div class="v-namespace" v-loading="loading">
            <!-- tab切换 -->
            <el-tabs class="m-namespace-tab" v-model="type">
                <el-tab-pane label="全部" name="all"></el-tab-pane>
                <el-tab-pane
                    v-for="item in types"
                    :label="item.label"
                    :key="item.value"
                    :name="item.value"
                ></el-tab-pane>
            </el-tabs>
            <el-alert v-if="query" type="warning" show-icon class="m-namespace-warning">
                <template #title>
                    <b>{{ query }}</b> 铭牌不存在或正在审核中
                </template>
            </el-alert>
            <!-- 过滤 -->
            <div class="m-namespace-filter">
                <div class="m-namespace-add">
                    <a
                        :href="publish_link"
                        class="u-publish u-namespace-add el-button el-button--primary el-button--small"
                        >+ 注册铭牌</a
                    >
                    <a
                        href="/publish/#/bucket/namespace"
                        class="u-publish el-button el-button--primary el-button--small"
                    >
                        <span class="el-icon-receiving"></span>&nbsp;我的铭牌
                    </a>
                    <div class="m-namespace-total">
                        当前共
                        <b>{{ total }}</b
                        >个铭牌
                    </div>
                </div>
                <div class="m-namespace-order">
                    <orderBy class="u-item" @filter="changeOrder"></orderBy>
                </div>
            </div>

            <!-- 列表内容 -->
            <div class="m-namespace-list" v-if="list">
                <div class="u-namespace" v-for="item in list" :key="item.ID">
                    <namespace-item :data="item" />
                </div>
            </div>
            <!-- 无数据 -->
            <div class="m-namespace-null" v-else>
                <el-alert title="没有相关条目" type="info" show-icon></el-alert>
            </div>
            <!-- 分页 -->
            <el-pagination
                class="m-namespace-pages"
                background
                layout="total, prev, pager, next,jumper"
                :hide-on-single-page="true"
                :page-size="per"
                :total="total"
                v-model:current-page="page"
            ></el-pagination>
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
                { label: "玩家", value: "player" },
                { label: "团队", value: "team" },
                { label: "系统", value: "system" },
                { label: "自定义", value: "custom" },
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
