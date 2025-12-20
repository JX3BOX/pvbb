<template>
    <CommunityLayout>
        <div class="p-community-v2">
            <ListTabs v-model="category" />
            <div class="m-archive-search" slot="search-before">
                <a :href="publish_link" class="u-publish el-button el-button--primary">+ 发布作品</a>
                <el-input
                    placeholder="请输入搜索内容"
                    v-model.trim.lazy="title"
                    clearable
                    @clear="onSearch"
                    @keydown.native.enter="onSearch"
                >
                    <span slot="prepend"><i class="el-icon-search"></i> 关键词</span>
                    <template #append>
                        <el-button icon="el-icon-position" @click="onSearch"></el-button>
                    </template>
                </el-input>
            </div>

            <!-- 筛选 -->
            <div class="m-archive-filter">
                <div class="m-filter__left">
                    <!-- 版本过滤 -->
                    <clientBy @filter="filterImperceptibly" :type="client"></clientBy>
                    <el-checkbox
                        v-model="is_star"
                        :true-label="1"
                        :false-label="0"
                        border
                        size="mini"
                        @change="onIsStarChange"
                        >只看精选</el-checkbox
                    >
                </div>
                <el-radio-group class="m-list-view" v-model="view" size="mini" @input="onViewChange">
                    <el-radio-button :label="1"><i class="el-icon-s-grid"></i> 卡片</el-radio-button>
                    <el-radio-button :label="2"><i class="el-icon-tickets"></i> 列表</el-radio-button>
                </el-radio-group>
            </div>

            <div class="m-community-content" v-loading="loading">
                <template v-if="view == 1">
                    <!-- 置顶文章 -->
                    <TopicTop :key="topTopicData.id" v-if="topTopicData" :data="topTopicData" />
                    <!-- 瀑布流 -->
                    <div class="m-topic-list" v-if="list.length">
                        <Waterfall
                            :col="col"
                            :autoResize="true"
                            :moveTransitionDuration="0"
                            :fillBox="true"
                            :list="list"
                            :gutter="20"
                            ref="waterfall"
                        >
                            <div slot-scope="item" :class="{ fadeIn: item.state == 'show' }">
                                <TopicItem :key="item.data.id" :data="item.data" />
                            </div>
                        </Waterfall>
                    </div>
                </template>
                <template v-else>
                    <!-- 列表 -->
                    <div class="m-archive-list m-topic-list">
                        <ul class="u-list">
                            <ListItem :key="topTopicData.id" :keyword="title" v-if="topTopicData" :item="topTopicData" />
                            <ListItem v-for="item in list" :keyword="title" :key="item.id" :item="item" />
                        </ul>
                    </div>
                </template>
                <!-- 分页 -->
                <CommunityPagination
                    ref="paginationRef"
                    :total="total"
                    :per="per"
                    :current-page.sync="page"
                    @current-change="changePage"
                    :loading="loading"
                    :has-next-page="hasNextPage"
                    @append-page="appendPage"
                />
            </div>
            <el-backtop style="z-index: 999"></el-backtop>
        </div>

        <design-task v-model="showDesignTask" :post="currentPost"></design-task>
    </CommunityLayout>
</template>

<script>
const appKey = "community";

import { getTopicList, getTopicBucket } from "@/service/community";
import { publishLink } from "@jx3box/jx3box-common/js/utils";
import { getLikes } from "@/service/next";
import { formatCategoryList } from "@/utils/community";
import bus from "@/utils/bus";

import Waterfall from "vue-waterfall-rapid";
import CommunityLayout from "@/layouts/CommunityLayout.vue";
import ListTabs from "@/components/community/list_tabs.vue";
import CommunityPagination from "@/components/community/community_pagination.vue";
import TopicItem from "@/components/community/topic_item.vue";
import ListItem from "@/components/community/list_item.vue";
import TopicTop from "@/components/community/topic_top.vue";
import DesignTask from "@jx3box/jx3box-common-ui/src/bread/DesignTask.vue";

export default {
    name: "Community_v2",
    components: {
        CommunityLayout,
        ListTabs,
        CommunityPagination,
        TopicItem,
        ListItem,
        TopicTop,
        Waterfall,
        DesignTask,
    },
    data: function () {
        return {
            // 筛选条件
            title: "",
            category: "心得",
            isSearch: false,
            client: "all", // 版本过滤，默认不过滤
            is_star: 0, // 只看精选，0否1是

            view: 1, // 列表视图，1卡片，2列表
            page: 1, // 当前页码
            per: 20, // 每页数量
            total: 0, // 总数
            pages: 0, // 总页数
            number_queries: ["per", "page"],

            categoryList: [],

            loading: false, // 加载状态
            list: [], // 文章列表
            topTopicData: null,    // 置顶文章数据

            currentPost: null,
            showDesignTask: false,
        };
    },
    computed: {
        // 发布按钮链接
        publish_link: function () {
            return publishLink(appKey);
        },
        // 是否显示加载更多
        hasNextPage: function () {
            return this.pages >= 1 && this.per * this.page < this.total;
        },
    },
    provide() {
        return {
            onCategoryChange: this.onCategoryChange,
            getCategoryStyle: this.getCategoryStyle,
        };
    },
    mounted() {
        window.addEventListener("resize", this.handleResize);
        window.addEventListener("scroll", this.handleScroll);
        // 初始化的时候执行一次
        this.handleResize();
        this.loadData();
        this.getCategoryList();

        const view = localStorage.getItem("community_view");
        if (view) {
            this.view = +view;
        } else {
            this.view = 1;
        }

        bus.on("design-task", (post) => {
            this.currentPost = post;
            this.showDesignTask = true;
        });
    },
    beforeDestroy() {
        window.removeEventListener("resize", this.handleResize);
        window.removeEventListener("scroll", this.handleScroll);
    },
    watch: {
        // 加载路由参数
        "$route.query": {
            deep: true,
            immediate: true,
            handler: function (query) {
                if (Object.keys(query).length) {
                    for (let key in query) {
                        // for:element分页组件兼容性问题
                        if (this.number_queries.includes(key)) {
                            this[key] = ~~query[key];
                        } else {
                            this[key] = query[key];
                        }
                    }
                }
            },
        },
        list: {
            handler: function (list) {
                if (list.length && this.$refs.waterfall) {
                    // 重新渲染瀑布流高度
                    this.$refs.waterfall.repaints();
                }
                if (list.length) {
                    this.getLikes();
                }
            },
            deep: true,
        },
        topTopicData: {
            handler: function (topTopicData) {
                if (topTopicData) {
                    const id = `community_topic-${topTopicData.id}`;
                    getLikes({
                        post_type: "community_topic",
                        post_action: "likes",
                        id,
                    }).then((res) => {
                        if (res.data.data[id] && res.data.data[id].likes) {
                            this.$set(topTopicData, "agree_count", res.data.data[id].likes);
                        }
                    });
                }
            },
        },
        category: function () {
            this.page = 1;
            this.loadData();
        },
    },
    methods: {
        getLikes() {
            const list = this.list.filter((item) => item.agree_count == null);
            const ids = list.map((item) => `community_topic-${item.id}`);
            // 将agree_count重置为0 防止重复请求获取like
            for (let index = 0; index < this.list.length; index++) {
                const item = this.list[index];
                if (item.agree_count == null) {
                    this.$set(this.list[index], "agree_count", 0);
                }
            }
            if (!ids.length) return;
            let id = ids.join(",");
            getLikes({
                post_type: "community_topic",
                post_action: "likes",
                id,
            }).then((res) => {
                const keys = Object.keys(res.data.data);
                if (keys.length) {
                    keys.forEach((key) => {
                        const id = key.split("-")[1];
                        const index = this.list.findIndex((item) => item.id == id);
                        if (index > -1) {
                            this.$set(this.list[index], "agree_count", res.data.data[key].likes);
                        }
                    });
                }
            });
        },
        onSearch() {
            this.page = 1;
            this.view = 2; // 搜索时切换为列表模式
            this.loadData();
        },
        // 加载数据
        loadData(appendMode = false) {
            this.isSearch = false;
            let query = this.buildQuery(appendMode);
            this.loading = true;
            getTopicList(query)
                .then((res) => {
                    let list = res.data.data.list || [];
                    list = list.map((item) => {
                        return {
                            ...item,
                            // 只有item.agree_cou = null 才会触发获取likes
                            agree_count: item.agree_count || null,
                        };
                    });

                    if (appendMode) {
                        this.list = this.list.concat(list || []);
                    } else {
                        // 第一页第一个帖子置顶
                        if (query.index === 1 && list && list.length) {
                            this.topTopicData = list.shift();
                        } else {
                            this.topTopicData = null;
                        }
                        this.list = list || [];
                        // 翻页滚动至顶部
                        this.$nextTick(() => {
                            window.scrollTo(0, 0);
                        });
                    }

                    this.total = res.data.data.page.total;
                    this.pages = res.data.data.page.pageTotal;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 翻页加载
        changePage: function () {
            this.loadData();
        },
        // 路由绑定
        replaceRoute: function (extend) {
            return this.$router.push({ name: this.$route.name, query: Object.assign({}, this.$route.query, extend) });
        },
        // 追加加载
        appendPage: function () {
            this.loadData(true);
        },
        // 构建最终请求参数
        buildQuery: function (appendMode) {
            if (appendMode) {
                this.page += 1;
            }
            let _query = {
                category: this.category,
                pageSize: this.per,
                index: this.page,
            };
            if (this.is_star) {
                _query.is_star = this.is_star;
            }
            if (this.title) {
                _query.title = this.title;
            }
            if (this.client && this.client !== "all") {
                _query.client = this.client;
            }
            this.replaceRoute({ category: this.category, page: this.page });

            return _query;
        },
        // 条件过滤（不附加路由）
        filterImperceptibly: function (o) {
            this[o["type"]] = o["val"];
        },
        // 视图切换
        onViewChange(view) {
            this.view = view;
            localStorage.setItem("community_view", view);
        },
        // 只看精选
        onIsStarChange() {
            this.loadData();
        },

        // 获取分类列表
        getCategoryList() {
            getTopicBucket({ type: "community" }).then((res) => {
                // 分类前面加个全部
                const list = [
                    {
                        name: "全部",
                        val: "",
                    },
                    ...res.data.data,
                ];
                this.categoryList = formatCategoryList(list);
            });
        },
        // 获取指定分类绑定样式
        getCategoryStyle: function (category) {
            let item = this.categoryList.find((item) => item.value === category);
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

        // 页面大小变动 重新计算列数
        handleResize() {
            if (window.innerWidth > 1920) {
                this.col = 3;
                return;
            }
            if (window.innerWidth > 1200) {
                this.col = 2;
                return;
            }
            this.col = 1;
        },
        handleScroll() {
            const paginationRef = this.$refs.paginationRef;
            if (paginationRef && this.hasNextPage) {
                const y = paginationRef.$el.offsetTop;
                // 判断高度是否达到触发 自动下拉加载的要求 && 不能处于加载状态
                if (window.scrollY + window.innerHeight > y && this.loading === false) {
                    this.appendPage();
                }
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/community/community.less";
@import "~@/assets/css/community/list.less";
@import "~@/assets/css/list.less";
.p-community-v2 {
    // padding: 20px 30px;
    .m-tabs {
        padding: 20px 30px 0 30px;
    }
    .m-archive-search, .m-archive-filter {
        margin: 0 30px 20px 30px;
    }
    background-color: #fff;
}
</style>
