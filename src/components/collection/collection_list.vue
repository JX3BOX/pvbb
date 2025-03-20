<template>
    <div class="m-collection-box" v-loading="loading" ref="listRef">
        <!-- 搜索 -->
        <div class="m-archive-search m-collection-search">
            <a :href="publish_link" class="u-publish el-button el-button--primary">+ 创建小册</a>
            <el-input
                placeholder="请输入搜索内容"
                v-model.trim.lazy="search"
                class="input-with-select"
                clearable
                @clear="onSearch"
                @keydown.native.enter="onSearch"
            >
                <template #prepend> <i class="el-icon-search"></i> 关键词 </template>
                <template #append>
                    <el-button icon="el-icon-position" class="u-btn" @click="onSearch"></el-button>
                </template>
            </el-input>
        </div>
        <Banner :subtype="'collection'"></Banner>
        <!-- 列表 -->
        <div class="m-collection-list" v-if="data && data.length">
            <template v-for="(item, i) in data">
                <collection-item :data="item" :key="i" :style="!isPhone ? `width: calc(100% / ${count})` : ''" />
            </template>
        </div>
        <!-- 空 -->
        <el-alert class="m-collection-null" v-else title="没有找到相关条目" type="info" show-icon></el-alert>
        <!-- 分页 -->
        <el-pagination
            class="m-collection-pagination"
            background
            :page-size="per"
            :hide-on-single-page="true"
            :current-page.sync="page"
            layout="total, prev, pager, next, jumper"
            :total="total"
            @current-change="skipTop"
        ></el-pagination>
    </div>
</template>

<script>
import { publishLink } from "@jx3box/jx3box-common/js/utils";
// import collection_item from "./collection_item.vue";
import collection_item_v2 from "./collection_item_v2.vue";
import { getCollections } from "@/service/collection.js";
import Banner from "@/components/bbs/banner.vue";
import { isPhone } from "@/utils/common";
export default {
    name: "CollectionList",
    props: [],
    components: {
        // "collection-item": collection_item,
        "collection-item": collection_item_v2,
        Banner,
    },
    data: function() {
        return {
            loading: false, //加载状态

            data: [], //数据列表
            page: 1, //当前页数
            total: 1, //总条目数
            pages: 1, //总页数
            per: 18, //每页条目
            search: "",

            count: 0,
        };
    },
    computed: {
        // 发布按钮链接
        publish_link: function() {
            return publishLink("collection");
        },
        params: function() {
            return {
                page: this.page,
                per: this.per,
            };
        },
        isPhone() {
            return isPhone();
        },
    },
    methods: {
        skipTop: function() {
            window.scrollTo(0, 0);
        },
        loadData: function() {
            this.loading = true;
            const params = {
                ...this.params,
                keyword: this.search,
            };
            getCollections(params)
                .then((res) => {
                    this.data = res?.data?.data?.list;
                    this.total = res?.data?.data?.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        onSearch() {
            if (this.page !== 1) {
                this.page = 1;
                return;
            }
            this.loadData();
        },
        showCount() {
            const listWidth = this.$refs.listRef?.clientWidth;
            this.count = Math.floor(listWidth / 260);
            this.per = this.isPhone ? 12 : this.count * 4;
        },
    },
    watch: {
        params: {
            immediate: true,
            deep: true,
            handler: function() {
                this.loadData();
            },
        },
    },
    mounted() {
        this.showCount();
    },
};
</script>
<style lang="less">
.m-collection-box {
    .m-collection-list {
        gap: 0;
        justify-content: flex-start;
    }
}
</style>
