<template>
    <ListLayout>
        <div class="v-joke" v-loading="loading">
            <!-- 单页 -->
            <div class="m-joke-single-container" v-if="id">
                <div class="m-joke-goback">
                    <el-button class="u-back" size="mini" icon="el-icon-arrow-left" @click="goBack">返回列表</el-button>
                    <a class="u-doc" href="/tool/23239" target="_blank">
                        <i class="el-icon-info"></i>游戏内获取或发布骚话
                    </a>
                </div>
                <el-row class="m-joke-list" :gutter="20">
                    <el-col :span="24">
                        <div class="m-joke-item">
                            <joke-item :joke="joke" mode="single" />
                        </div>
                    </el-col>
                </el-row>
                <!-- <div class="m-joke-tags" v-if="joke.tags && joke.tags.length">
                    <i class="el-icon-price-tag"></i>
                    <span class="u-tag" v-for="(tag,i) in joke.tags" :key="i">{{tag}}</span>
                </div>-->
                <Thx
                    class="m-thx"
                    :postId="~~id"
                    postType="joke"
                    :postTitle="title"
                    :userId="user_id"
                    :adminBoxcoinEnable="true"
                    :userBoxcoinEnable="true"
                    client="all"
                />
                <div class="m-single-comment">
                    <el-divider content-position="left">评论</el-divider>
                    <Comment :id="id" category="joke" />
                </div>
            </div>

            <!-- 列表 -->
            <div class="m-joke-list-container" v-else>
                <!-- 搜索 -->
                <div class="m-archive-search m-joke-search" slot="search-before">
                    <!-- <a :href="publish_link" class="u-publish el-button el-button--primary">+ 发布作品</a> -->
                    <el-input
                        placeholder="请输入搜索内容"
                        v-model.trim.lazy="search"
                        @keydown.native.enter="onSearch"
                        clearable
                        @clear="onSearch"
                    >
                        <span slot="prepend"><i class="el-icon-search"></i> <span class="u-search">关键词</span></span>
                        <el-switch
                            slot="append"
                            v-model="star"
                            :inactive-value="0"
                            :active-value="1"
                            inactive-text="只看精选"
                        ></el-switch>
                    </el-input>
                </div>
                <div class="m-joke-main">
                    <!-- 门派分类 -->
                    <left-tab class="m-joke-types" @setType="setType"></left-tab>
                    <!-- <div class="m-joke-types">
                        <el-tabs v-model="type" :tabPosition="windowWidth < 900 ? 'top' : 'left'">
                            <el-tab-pane name="all" label="全部">
                                <span slot="label">
                                    <i class="u-icon el-icon-menu" style="vertical-align: 0"></i>全部
                                </span>
                            </el-tab-pane>
                            <el-tab-pane v-for="(item, i) in schoolmap" :key="i" :name="i">
                                <div slot="label" style="min-width: 57px">
                                    <img class="u-icon" :src="i | showSchoolIcon" :alt="item" />
                                    {{ item }}
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div> -->
                    <div class="m-joke-content">
                        <!-- 快捷发布 -->
                        <joke-post :type="type"></joke-post>
                        <!-- 列表 -->
                        <div class="m-joke-list" :gutter="20" v-if="jokes && jokes.length">
                            <div :span="24" v-for="joke in jokes" :key="joke.id">
                                <div class="m-joke-item">
                                    <joke-item
                                        :joke="joke"
                                        :jokeRewardArr="jokeRewardArr"
                                        @doReward="doReward"
                                        @update="handleJokeUpdate"
                                    />
                                </div>
                            </div>
                        </div>
                        <!-- 空 -->
                        <el-alert v-else title="没有找到相关条目" type="info" show-icon></el-alert>
                        <div class="m-joke-footer">
                            <el-pagination
                                class="m-joke-pagination"
                                background
                                :page-size="per"
                                :hide-on-single-page="true"
                                :current-page.sync="page"
                                layout="total, prev, pager, next, jumper,sizes"
                                :total="total"
                                :page-sizes="[10, 30, 50, 70, 90]"
                                @current-change="skipTop"
                                @size-change="handleSizeChange"
                            ></el-pagination>
                            <!--  -->
                            <div class="m-joke-reward" v-if="isEditor">
                                <el-button class="m-joke-all" type="primary" size="mini" @click="rewardAll"
                                    >{{ this.rewardAllType ? "取消" : "" }} 全选</el-button
                                >
                                <Thx
                                    type="batchReward"
                                    postType="joke"
                                    :postId="jokeRewardArr"
                                    :adminBoxcoinEnable="true"
                                    :userBoxcoinEnable="true"
                                    client="all"
                                />
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
import Comment from "@jx3box/jx3box-comment-ui/src/Comment.vue";
import ListLayout from "@/layouts/ListLayout.vue";
import LeftTab from "@/components/left-tab.vue";

// 分类
import schoolmap from "@jx3box/jx3box-data/data/xf/schoolid.json";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";

// 数据
import { getJokes, getJoke } from "@/service/joke";
import { getLikes } from "@/service/next";

// 其他
import emotion from "@jx3box/jx3box-emotion/data/default.json";
import { publishLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";

export default {
    name: "Joke",
    components: {
        "joke-item": joke_item,
        Comment,
        "joke-post": joke_post,
        ListLayout,
        LeftTab,
    },
    data: function () {
        return {
            loading: false,
            schoolmap,

            // 快捷发布
            sortedEmotions: [],

            type: "all",
            star: 0,
            search: "",
            per: 10,
            page: 1,
            total: 0,
            jokes: [],

            joke: "",

            windowWidth: document.documentElement.clientWidth,
            jokeRewardArr: [], //打赏选中
        };
    },
    computed: {
        isNotSelf: function () {
            return (id) => {
                return id != User.getInfo().uid;
            };
        },
        isEditor: function () {
            return User.isEditor();
        },
        // 发布按钮链接
        publish_link: function () {
            return publishLink("joke");
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
            return [this.type, this.star, this.page, this.per];
        },
        reset_keys: function () {
            return [this.type, this.star];
        },
        user_id: function () {
            return this.joke?.user_id || 0;
        },
        title: function () {
            return this.joke?.content;
        },
        //全选状态
        rewardAllType: function () {
            return this.jokeRewardArr.length === this.jokes.filter((item) => item.user_id).length;
        },
    },
    filters: {
        showSchoolIcon: function (val) {
            return __imgPath + "image/school/" + val + ".png";
        },
    },
    methods: {
        setType(type) {
            this.type = type;
        },
        //调整展示条数
        handleSizeChange(val) {
            this.per = val;
            this.loadList();
        },
        // 表情排序
        sortEmotion() {
            const keys = Object.keys(emotion);
            keys.sort((item1, item2) => {
                return item1.localeCompare(item2);
            });
            keys.forEach((key) => {
                const obj = {
                    key,
                    value: emotion[key],
                };
                this.sortedEmotions.push(obj);
            });
        },
        loadList() {
            this.loading = true;
            getJokes(this.params)
                .then((res) => {
                    this.jokes = res?.data?.data?.list;
                    this.total = res?.data?.data?.total;
                    this.loadLike();
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadSingle() {
            this.loading = true;
            getJoke(this.id)
                .then((res) => {
                    this.joke = res?.data?.data;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        handleJokeUpdate: function () {
            this.loadList();
        },
        init: function () {
            this.id ? this.loadSingle() : this.loadList();
        },

        // 杂项
        goBack: function () {
            this.$router.push("/joke");

            this.$nextTick(() => {
                this.init();
            });
        },
        skipTop: function () {
            window.scrollTo(0, 0);
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
                getLikes(params).then((res) => {
                    const likes = res.data.data;
                    if (Object.keys(likes).length) {
                        this.jokes.forEach((d) => {
                            this.$set(d, "count", likes?.["joke-" + d.id]?.likes);
                        });
                    }
                });
            }
        },
        //取消/选中打赏文章
        doReward(data) {
            const list = this.jokeRewardArr.filter((item) => item.article_id == data.id);
            list.length
                ? (this.jokeRewardArr = this.jokeRewardArr.filter((item) => item.article_id != data.id))
                : this.jokeRewardArr.push({
                      user_id: data.user_id,
                      article_id: data.id.toString(),
                      article_type: "joke",
                  });
        },
        //取消/全选打赏文章
        rewardAll() {
            let arr = [];
            this.jokes.map((item) => {
                if (item.user_id && this.isNotSelf(item.user_id)) {
                    arr.push({
                        user_id: item.user_id,
                        article_id: item.id.toString(),
                        article_type: "joke",
                    });
                }
            });
            this.jokeRewardArr = this.rewardAllType ? [] : arr;
        },
        onSearch: function () {
            if (this.page !== 1) {
                this.page = 1;
                return;
            }
            this.init();
        },
    },
    watch: {
        keys: {
            deep: true,
            handler() {
                this.init();
            },
            immediate: true,
        },
        // 分页重置
        reset_keys: {
            deep: true,
            handler: function () {
                this.jokeRewardArr = [];
                this.page = 1;
            },
        },
        page: {
            deep: true,
            handler: function () {
                this.jokeRewardArr = [];
            },
        },
        id: {
            immediate: true,
            handler: function (val) {
                val && this.init();
            },
        }
    },
    mounted: function () {
        const that = this;
        window.onresize = () => {
            that.windowWidth = document.documentElement.clientWidth;
        };
    },
    created: function () {
        this.sortEmotion();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "../assets/css/joke/joke.less";
</style>
