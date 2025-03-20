<template>
    <CommunityLayout>
        <CommunityHeader :categoryList="categoryList" />
        <CommunitySearch @search="onSearch" ref="searchInput">
            <template #right>
                <div class="m-search-right">
                    <el-checkbox v-model="is_star" :true-label="1" :false-label="0" border size="mini" @change="onIsStarChange">只看精选</el-checkbox>
                    <el-radio-group class="m-list-view" v-model="view" size="mini" @input="onViewChange">
                        <el-radio-button :label="1"><i class="el-icon-s-grid"></i> 卡片</el-radio-button>
                        <el-radio-button :label="2"><i class="el-icon-tickets"></i> 列表</el-radio-button>
                    </el-radio-group>
                </div>
            </template>
        </CommunitySearch>
        <div class="m-community-content" v-loading="loading">
            <!-- 搜索时展示的内容 -->
            <div v-if="isSearch">
                <!-- 搜索结果列表 -->
                <CommunitySearchList
                    :list="searchList"
                    @search="onSearch"
                    @close="closeSearch"
                    :keyword="searchParams.q"
                >
                    <!-- 分页 -->
                    <CommunityPagination
                        :total="total"
                        :per="per"
                        :current-page.sync="page"
                        @current-change="changePage"
                        :loading="loading"
                        :has-next-page="hasNextPage"
                        @append-page="appendPage"
                /></CommunitySearchList>
            </div>
            <!-- 正常展示的内容 -->
            <div v-else>
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
                            <ListItem :key="topTopicData.id" v-if="topTopicData" :item="topTopicData" />
                            <ListItem v-for="item in list" :key="item.id" :item="item" />
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
        </div>
        <el-backtop style="z-index: 999"></el-backtop>
    </CommunityLayout>
</template>

<script>
import CommunityLayout from "@/layouts/CommunityLayout.vue";
import CommunityHeader from "@/components/community/header.vue";
import CommunitySearch from "@/components/community/search.vue";
import Waterfall from "vue-waterfall-rapid";
import TopicItem from "@/components/community/topic_item.vue";
import ListItem from "@/components/community/list_item.vue";
import { getTopicList, globalSearch } from "@/service/community";
import TopicTop from "@/components/community/topic_top.vue";
import { getTopicBucket } from "@/service/community";
import { formatCategoryList } from "@/utils/community";
import CommunitySearchList from "@/components/community/community_search_list.vue";
import CommunityPagination from "@/components/community/community_pagination.vue";
import { getLikes } from "@/service/next";
const filter_name = `community_discussion_topic,community_discussion_topic_reply`;
export default {
    components: {
        CommunityPagination,
        CommunityLayout,
        CommunityHeader,
        CommunitySearch,
        CommunitySearchList,
        Waterfall,
        TopicItem,
        TopicTop,
        ListItem,
    },
    data() {
        return {
            searchParams: {
                q: "",
                filter_name: filter_name,
            },
            loading: false,
            col: 1,
            page: 1, //当前页数
            total: 0, //总条目数
            per: 18, //每页条目
            pages: 0, //总页数
            number_queries: ["per", "page"],
            category: undefined,
            list: [],
            searchList: [],
            isSearch: false,
            topTopicData: null,
            categoryList: [],

            // 视图 1:瀑布流 2:列表
            view: 2,
            // 是否只看精选
            is_star: "",
        };
    },
    computed: {
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
        // 关闭搜索，重置数据 && 加载展示
        closeSearch() {
            this.isSearch = false;
            this.page = 1;
            this.total = 0;
            this.per = 18;
            this.pages = 0;
            this.searchParams = {
                q: "",
                filter_name: "community_discussion_topic,community_discussion_topic_reply",
            };
            if (this.$refs.searchInput) {
                this.$refs.searchInput.closeSearch();
            }
            this.loadData();
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
        // 搜索触发
        onSearch(params) {
            // 展示搜索界面
            this.isSearch = true;
            // 初始化分页数据 s
            this.page = 1;
            this.total = 0;
            this.per = 20;
            this.pages = 0;
            // 初始化分页数据 e

            this.searchParams = {
                ...this.searchParams,
                ...params,
            };

            this.loadSearchData();
        },
        // 切换展示分类
        onCategoryChange: function (category) {
            this.category = category;
            this.closeSearch();
        },
        // 翻页加载
        changePage: function () {
            if (this.isSearch) {
                this.loadSearchData();
            } else {
                this.loadData();
            }
        },
        // 路由绑定
        replaceRoute: function (extend) {
            return this.$router.push({ name: this.$route.name, query: Object.assign({}, this.$route.query, extend) });
        },
        // 追加加载
        appendPage: function () {
            if (this.isSearch) {
                this.loadSearchData(true);
            } else {
                this.loadData(true);
            }
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
            this.replaceRoute({ category: this.category, page: this.page });

            return _query;
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
        // 加载搜索数据
        loadSearchData(appendMode = false) {
            if (appendMode) {
                this.page += 1;
            }
            this.loading = true;
            globalSearch({
                ...this.searchParams,
                pageIndex: this.page,
                // pageSize: this.per,
            })
                .then((res) => {
                    if (appendMode) {
                        this.searchList = this.searchList.concat(res.data.data.hits || []);
                    } else {
                        this.searchList = res.data.data.hits || [];
                    }
                    const page = res.data.data.page;
                    this.total = page.total;
                    this.pages = page.pageTotal;
                    this.page = page.pageIndex;
                })
                .finally(() => {
                    this.loading = false;
                });
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
        // 视图切换
        onViewChange(view) {
            this.view = view;
            localStorage.setItem("community_view", view);
        },
        // 只看精选
        onIsStarChange() {
            this.loadData();
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/community/community.less";

@import "~@/assets/css/app.less";
@import "~@/assets/css/community/list.less";

@media screen and (max-width: @phone) {
    .m-search-right {
        .none;
    }
}
</style>
