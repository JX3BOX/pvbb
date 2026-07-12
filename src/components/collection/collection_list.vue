<template>
    <div class="m-collection-box" v-loading="loading" ref="listRef">
        <section class="m-collection-hero">
            <div class="u-hero-copy">
                <span class="u-eyebrow">JX3BOX COLLECTION</span>
                <h1>{{ $t("pages.collection.list.heroTitle") }}</h1>
                <p>{{ $t("pages.collection.list.heroDescription") }}</p>
            </div>
            <div class="u-hero-action">
                <a :href="publish_link" class="u-publish el-button el-button--large el-button--primary">
                    <i class="el-icon-plus"></i> {{ $t("pages.collection.list.create") }}
                </a>
                <span v-if="total" class="u-total">{{ $t("pages.collection.list.total", { count: total }) }}</span>
            </div>
        </section>

        <!-- 搜索 -->
        <div class="m-archive-search m-collection-search">
            <i class="el-icon-search u-search-icon"></i>
            <el-input
                :placeholder="$t('pages.collection.list.searchPlaceholder')"
                v-model.trim="search"
                clearable
                @clear="onSearch"
                size="large"
                @keydown.enter="onSearch"
            />
            <el-button class="u-btn" @click="onSearch">{{ $t("pages.collection.list.search") }}</el-button>
        </div>
        <Banner :subtype="'collection'"></Banner>
        <!-- 列表 -->
        <section class="m-collection-shelf" v-if="data && data.length">
            <div class="m-collection-shelf-head">
                <div>
                    <span class="u-title">{{ $t("pages.collection.list.all") }}</span>
                    <span class="u-desc">{{ $t("pages.collection.list.discover") }}</span>
                </div>
                <span class="u-page">{{ $t("pages.collection.list.page", { page }) }}</span>
            </div>
            <div class="m-collection-list">
                <template v-for="(item, i) in data" :key="i">
                    <collection-item :data="item" />
                </template>
            </div>
        </section>
        <!-- 空 -->
        <el-alert
            class="m-collection-null"
            v-else-if="loadError"
            :title="$t('pages.collection.list.loadFailed')"
            type="error"
            show-icon
        ></el-alert>
        <el-alert
            class="m-collection-null"
            v-else-if="!loading"
            :title="$t('pages.collection.list.empty')"
            type="info"
            show-icon
        ></el-alert>
        <!-- 分页 -->
        <el-pagination
            class="m-collection-pagination"
            background
            :page-size="per"
            :hide-on-single-page="true"
            v-model:current-page="page"
            layout="total, prev, pager, next, jumper"
            :total="total"
            @current-change="skipTop"
        ></el-pagination>
    </div>
</template>

<script>
import { publishLink } from "@jx3box/jx3box-common/js/utils";
import collection_item_v2 from "./collection_item_v2.vue";
import { getCollections } from "@/service/collection.js";
import Banner from "@/components/bbs/banner.vue";
import { isPhone } from "@/utils/common";
export default {
    name: "CollectionList",
    props: [],
    components: {
        "collection-item": collection_item_v2,
        Banner,
    },
    data: function () {
        return {
            loading: false, //加载状态

            data: [], //数据列表
            page: 1, //当前页数
            total: 1, //总条目数
            pages: 1, //总页数
            per: 18, //每页条目
            search: "",
            loadError: false,
            requestId: 0,

            count: 0,
        };
    },
    computed: {
        // 发布按钮链接
        publish_link: function () {
            return publishLink("collection");
        },
        params: function () {
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
        skipTop: function () {
            window.scrollTo(0, 0);
        },
        loadData: function () {
            const requestId = ++this.requestId;
            this.loading = true;
            this.loadError = false;
            const params = {
                ...this.params,
                keyword: this.search,
            };
            getCollections(params)
                .then((res) => {
                    if (requestId !== this.requestId) return;
                    this.data = res?.data?.data?.list || [];
                    this.total = res?.data?.data?.total || 0;
                })
                .catch(() => {
                    if (requestId !== this.requestId) return;
                    this.data = [];
                    this.total = 0;
                    this.loadError = true;
                })
                .finally(() => {
                    if (requestId !== this.requestId) return;
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
            this.per = this.isPhone ? 12 : Math.max(this.count, 1) * 4;
        },
    },
    watch: {
        page: function () {
            this.loadData();
        },
    },
    mounted() {
        this.showCount();
        this.loadData();
    },
};
</script>
<style lang="less">
.m-collection-box {
    padding: 0;
    min-height: calc(100vh - 180px);
    box-sizing: border-box;
    background:
        radial-gradient(circle at 92% 0, rgba(97, 86, 225, 0.1), transparent 260px),
        #fff;

    .m-collection-hero {
        margin-top:10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding: 28px 30px;
        margin-bottom: 22px;
        border: 1px solid #ebeaff;
        border-radius: 14px;
        color: #fff;
        overflow: hidden;
        background: linear-gradient(120deg, #26213f 0%, #42377c 56%, #6558ce 100%);
        box-shadow: 0 12px 30px rgba(60, 49, 128, 0.14);
        position: relative;

        &::after {
            content: "";
            position: absolute;
            right: -54px;
            bottom: -110px;
            width: 270px;
            height: 270px;
            border: 42px solid rgba(255, 255, 255, 0.08);
            border-radius: 50%;
        }
    }
    .u-hero-copy,
    .u-hero-action {
        position: relative;
        z-index: 1;
    }
    .u-eyebrow {
        display: block;
        margin-bottom: 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: rgba(255, 255, 255, 0.62);
    }
    h1 {
        margin: 0 0 8px;
        font-size: 28px;
        line-height: 1.2;
        color: #fff;
    }
    .u-hero-copy p {
        margin: 0;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.78);
    }
    .u-hero-action {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: 14px;
    }
    .u-publish {
        margin: 0;
        border: 0;
        color: #4a3dac;
        background: #fff;
        box-shadow: 0 5px 14px rgba(20, 15, 57, 0.18);
        &:hover,
        &:focus {
            color: #33268b;
            background: #f5f3ff;
        }
    }
    .u-total {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.72);
    }
    .m-collection-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        gap: 16px;
        margin-top: 18px;
        justify-content: initial;
    }
    .m-collection-shelf {
        margin-top: 26px;
        padding: 20px;
        border: 1px solid #ecebf3;
        border-radius: 16px;
        background: #fafafe;
    }
    .m-collection-shelf-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        padding: 0 2px 14px;
        border-bottom: 1px solid #e9e8f0;
        .u-title {
            font-size: 17px;
            font-weight: 700;
            color: #2f2b43;
        }
        .u-desc {
            margin-left: 10px;
            font-size: 12px;
            color: #9a97a9;
        }
        .u-page {
            font-size: 12px;
            color: #8c87a0;
        }
    }
    .m-collection-search {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        padding: 6px;
        border: 1px solid #e8e8ee;
        border-radius: 10px;
        background: #fff;
        box-shadow: 0 5px 16px rgba(32, 31, 49, 0.04);
        .u-search-icon {
            flex: 0 0 auto;
            padding-left: 12px;
            color: #8c8a9a;
        }
        .el-input {
            flex: 1;
        }
        .el-input__wrapper {
            box-shadow: none !important;
        }
        .u-btn {
            flex: 0 0 auto;
            height: 34px;
            padding: 0 20px;
            border: 0;
            border-radius: 7px;
            color: #fff;
            background: #5b4ed3;
            &:hover { background: #493cbc; }
        }
    }
    .m-banner {
        margin-top: 18px;
    }
}

@media screen and (max-width: @ipad) {
    .m-collection-box {
        .m-collection-list { grid-template-columns: repeat(4, 1fr); }
    }
}
@media screen and (max-width: 1400px) {
    .m-collection-box .m-collection-hero {
        display: block;
        .u-hero-action { margin-top: 18px; }
    }
}
@media screen and (max-width: @phone) {
    .m-collection-box {
        .m-collection-hero {
            display: block;
            padding: 22px;
        }
        h1 { font-size: 24px; }
        .u-hero-copy p { line-height: 1.7; }
        .u-hero-action { margin-top: 18px; }
        .m-collection-shelf { padding: 14px 10px 10px; }
        .m-collection-shelf-head {
            padding: 0 4px 12px;
            .u-desc, .u-page { display: none; }
        }
        .m-collection-list { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
    }
}
</style>
