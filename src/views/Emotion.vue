<template>
    <ListLayout>
        <div class="v-emotion" v-loading="loading">
            <!--单页-->
            <div class="m-emotion-single-container" v-if="id">
                <div class="m-emotion-goback">
                    <el-button class="u-back" size="mini" icon="el-icon-arrow-left" @click="goBack">返回列表</el-button>
                </div>
                <emotion-item :emotion="emotion" mode="single"></emotion-item>
            </div>
            <!--列表-->
            <div class="m-emotion-list-container" v-else>
                <!-- 搜索 -->
                <div class="m-archive-search m-emotion-search" slot="search-before">
                    <!-- <a :href="publish_link" class="u-publish el-button el-button--primary">+ 发布作品</a> -->
                    <el-input
                        placeholder="请输入搜索内容"
                        v-model.trim.lazy="search"
                        @keydown.native.enter="onSearch"
                        @clear="onSearch"
                        clearable
                    >
                        <span slot="prepend"><i class="el-icon-search"></i> <span class="u-search">关键词</span></span>
                        <template slot="append">
                            <el-switch
                                class="u-star"
                                v-model="star"
                                :inactive-value="0"
                                :active-value="1"
                                inactive-text="只看精选"
                            ></el-switch>
                            <!-- <el-switch
                                class="u-original"
                                v-model="original"
                                :inactive-value="0"
                                :active-value="1"
                                inactive-text="只看原创"
                            ></el-switch> -->
                        </template>
                    </el-input>
                </div>
                <div class="m-emotion-main">
                    <!-- 门派分类 -->
                    <left-tab class="m-emotion-types" @setType="setType"></left-tab>
                    <!-- <div class="m-emotion-types">
                        <el-tabs v-model="type" :tabPosition="windowWidth < 900 ? 'top' : 'left'">
                            <el-tab-pane name="all" label="全部">
                                <span slot="label">
                                    <i class="u-icon el-icon-menu" style="vertical-align: 0"></i>全部
                                </span>
                            </el-tab-pane>
                            <el-tab-pane v-for="(item, i) in schoolmap" :key="i" :name="i">
                                <div slot="label" style="min-width: 57px">
                                    <img class="u-icon" :src="showSchoolIcon(i)" :alt="item" />
                                    {{ item }}
                                </div>
                            </el-tab-pane>
                        </el-tabs>
                    </div> -->
                    <div class="m-emotion-content">
                        <!--快速发布-->
                        <emotion-post></emotion-post>
                        <ul class="m-emotion-list" v-if="list && list.length">
                            <waterfall
                                :autoResize="waterfall_options.autoResize"
                                :moveTransitionDuration="0.4"
                                :fillBox="waterfall_options.fillBox"
                                :list="list"
                                imgKey="src"
                                ref="waterfall"
                                :col-width="waterfall_options.colWidth"
                                :col="waterfall_options.col"
                            >
                                <div
                                    class="u-item waterfall-item m-emotion-item"
                                    :class="{ fadeIn: item.state == 'show' }"
                                    slot-scope="item"
                                >
                                    <div class="u-emotion">
                                        <img
                                            class="u-pic u-emotion-pic waterfall-img"
                                            :src="showEmotion(item.data.url)"
                                            :alt="item.data.desc"
                                            :key="item.data.url"
                                            @click="handlePreview(item.data)"
                                        />
                                        <i class="u-star" v-if="item.data.star"
                                            ><i class="el-icon-star-off"></i
                                            ><i class="u-original" v-if="item.data.original">原创</i></i
                                        >
                                    </div>
                                    <div class="u-item-bottom">
                                        <div class="u-info-user">
                                            <a
                                                class="u-user-name"
                                                :href="doEmotionUser(item.data).userLink"
                                                target="_blank"
                                                ><img
                                                    class="u-user-avatar waterfall-img"
                                                    :src="doEmotionUser(item.data).userAvatar"
                                                    :key="doEmotionUser(item.data).userAvatar"
                                                />{{ doEmotionUser(item.data).username }}</a
                                            >
                                        </div>
                                        <div class="u-info-misc">
                                            <time class="u-time">{{ doEmotionUser(item.data).time }}</time>
                                            <el-checkbox
                                                v-if="isEditor"
                                                :disabled="!item.data.user_id || isSelf(item.data)"
                                                v-model="rewardObj[item.data.id]"
                                                @change="doReward($event, item.data)"
                                                class="u-op-item u-op-gift"
                                                >打赏</el-checkbox
                                            >
                                            <a
                                                v-else
                                                class="u-like"
                                                :class="{ on: item.data.isLike }"
                                                title="赞"
                                                @click="addLike(item.data)"
                                            >
                                                <i class="like-icon">{{ item.data.isLike ? "♥" : "♡" }}</i>
                                                <span class="like-text">Like</span>
                                                <span class="like-count" v-if="item.data.count">{{
                                                    item.data.count
                                                }}</span>
                                            </a>
                                        </div>
                                    </div>
                                    <!-- <emotion-item
                                        :emotion="item.data"
                                        :index="item.index"
                                        @preview="handlePreview"
                                        :key="'emotion-' + item.data.type + '-' + item.data.id + new Date().getTime()"
                                    ></emotion-item> -->
                                </div>
                            </waterfall>
                        </ul>

                        <!-- 空 -->
                        <el-alert v-else title="没有找到相关条目" type="info" show-icon></el-alert>

                        <!-- 分页 -->
                        <div class="m-emotion-footer">
                            <el-pagination
                                class="m-emotion-pagination"
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
                            <div class="m-emotion-reward" v-if="isEditor">
                                <el-button class="m-emotion-all" type="primary" size="mini" @click="rewardAll"
                                    >{{ this.rewardAllType ? "取消" : "" }} 全选</el-button
                                >
                                <Thx
                                    type="batchReward"
                                    postType="emotion"
                                    :postId="rewardArr"
                                    :adminBoxcoinEnable="true"
                                    :userBoxcoinEnable="true"
                                    client="all"
                                />
                            </div>
                            <template v-else>
                                <el-button
                                    class="m-emotion-more"
                                    type="primary"
                                    @click="loadMore"
                                    v-show="page < pages"
                                    icon="el-icon-arrow-down"
                                    size="small"
                                    :disabled="loading"
                                    >加载更多</el-button
                                >
                            </template>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 预览弹窗 -->
            <EmotionPreview
                v-if="dialogVisible"
                :visible="dialogVisible"
                :data="emotion"
                @close="handleClose"
                @del="handleDelete"
            ></EmotionPreview>
        </div>
    </ListLayout>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import debounce from "lodash/debounce";
import waterfall from "vue-waterfall-rapid";
import ListLayout from "@/layouts/ListLayout.vue";
import LeftTab from "@/components/left-tab.vue";

// 模块
import emotion_item from "@/components/emotion/emotion_item";
import emotion_post from "@/components/emotion/emotion_post";
import EmotionPreview from "@/components/emotion/emotion_preview.vue";
import { resolveImagePath, getThumbnail, authorLink, showAvatar } from "@jx3box/jx3box-common/js/utils";
import { getRelativeTime } from "@/utils/dateFormat.js";

// 分类
import schoolmap from "@jx3box/jx3box-data/data/xf/schoolid.json";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";

// 数据
import { getEmotions, getEmotion } from "@/service/emotion";
import { getLikes } from "@/service/next";
import { publishLink } from "@jx3box/jx3box-common/js/utils";
import { postStat } from "@jx3box/jx3box-common/js/stat";

import User from "@jx3box/jx3box-common/js/user";

export default {
    name: "Emotion",
    components: {
        "emotion-post": emotion_post,
        "emotion-item": emotion_item,
        // Comment,
        waterfall,
        ListLayout,
        EmotionPreview,
        LeftTab,
    },
    data: function () {
        return {
            loading: false,

            // types
            schoolmap,

            // pagination
            type: "all",
            star: 0,
            original: 0,
            search: "",
            per: 50,
            page: 1,
            pages: 1,
            total: 0,
            emotions: [], //当前页面列表
            list: [], //合并列表
            // appendMode: false,

            emotion: "",

            // 瀑布流
            waterfall_options: {
                //是否根据容器尺寸自动计算重绘
                autoResize: true,
                //是否始终填满容器
                fillBox: true,
                //列宽-有指定列数则此属性失效
                colWidth: 260,
                //列数
                col: 5,
            },
            windowWidth: document.documentElement.clientWidth,

            dialogVisible: false,
            checked: false,
            rewardObj: {},
            rewardArr: [], //打赏选中
        };
    },
    computed: {
        // 发布按钮链接
        publish_link: function () {
            return publishLink("emotion");
        },
        id: function () {
            return ~~this.$route.params.id;
        },
        params: function ({ search, per, page, star, original }) {
            return {
                per: ~~per,
                page: ~~page,
                type: this.type == "all" ? "" : this.type,
                search,
                star: !!this.star ? 1 : "",
                original: !!this.original ? 1 : "",
            };
        },
        keys: function () {
            return [this.id, this.type, this.star, this.original];
        },
        reset_keys: function () {
            return [this.type, this.star, this.original];
        },
        images: function () {
            return this.list.map((item) => resolveImagePath(item.url));
        },
        //全选状态
        rewardAllType: function () {
            return this.rewardArr.length === this.emotions.filter((item) => item.user_id).length;
        },
        isEditor: function () {
            return User.isEditor();
        },
    },
    methods: {
        //调整展示条数
        handleSizeChange(val) {
            this.per = val;
            this.loadList();
        },
        //取消/选中打赏文章
        doReward(val, data) {
            if (val) {
                if (!this.rewardArr.find((item) => ~~item.article_id === ~~data.id)) {
                    this.rewardArr.push({
                        user_id: data.user_id,
                        article_id: data.id.toString(),
                        article_type: "emotion",
                    });
                }
            } else {
                this.rewardArr = this.rewardArr.filter((item) => ~~item.article_id !== ~~data.id);
            }
        },
        //取消/全选打赏文章
        rewardAll() {
            let arr = [];
            this.emotions.map((item) => {
                if (item.user_id && this.isNotSelf(item.user_id)) {
                    arr.push({
                        user_id: item.user_id,
                        article_id: item.id.toString(),
                        article_type: "emotion",
                    });
                }
                this.$set(this.rewardObj, item.id, !this.rewardAllType);
            });
            this.rewardArr = this.rewardAllType ? [] : arr;
        },
        isNotSelf: function () {
            return (id) => {
                return id != User.getInfo().uid;
            };
        },
        isSelf: function (emotion) {
            return emotion.user_id == User.getInfo().uid;
        },
        setType(type) {
            this.type = type;
        },
        showSchoolIcon: function (val) {
            return __imgPath + "image/school/" + val + ".png";
        },
        onSearch() {
            if (this.page !== 1) {
                this.page = 1;
                return;
            }
            this.loadList();
        },
        handleDelete() {
            this.onSearch();
        },
        loadList: function (appendMode = false) {
            this.loading = true;
            if (appendMode) {
                this.page++;
            }
            const params = {
                ...this.params,
            };
            return getEmotions(params)
                .then((res) => {
                    if (appendMode) {
                        this.list = [...this.list, ...(res.data?.data?.list || [])];
                        this.emotions = cloneDeep(this.list);
                    } else {
                        this.list = this.emotions = res.data?.data?.list || [];
                    }
                    this.total = res.data.data.total;
                    this.pages = res.data.data.pages;
                    this.list = this.list.map((item) => {
                        item.isLike = false;
                        return item;
                    });

                    this.loadLike();
                })
                .then(() => {
                    // 有内容时
                    if (this.$refs.waterfall) {
                        this.loading = true;
                        this.$nextTick(() => {
                            // 渲染追加的部分
                            if (appendMode) {
                                this.$refs.waterfall.repaints(params.page * this.per, 1);
                                // 全部重新渲染（切分类等）
                            } else {
                                this.$refs.waterfall.init();
                            }

                            this.$refs.waterfall.onRender = (res) => {
                                this.loading = false;
                                console.log("waterfall渲染完毕", res);
                            };
                        });
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadSingle() {
            this.loading = true;
            getEmotion(this.id)
                .then((res) => {
                    this.emotion = res?.data?.data;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadMore: function () {
            this.loadList(true);
        },
        // 批量获取点赞
        loadLike: function () {
            if (this.emotions && this.emotions.length) {
                let id = this.emotions.map((d) => "emotion-" + d.id);
                id = id.join(",");
                const params = {
                    post_type: "emotion",
                    post_action: "likes",
                    id: id,
                };
                getLikes(params).then((res) => {
                    const likes = res.data.data;
                    if (Object.keys(likes).length) {
                        this.emotions.forEach((d) => {
                            this.$set(d, "count", likes?.["emotion-" + d.id]?.likes);
                        });
                    }
                });
            }
        },

        // 杂项
        goBack: function () {
            this.$router.push("/emotion");
        },
        skipTop: function () {
            window.scrollTo(0, 0);
        },

        // 瀑布流
        calcCol: function () {
            const col_w = 300;
            let w = window.innerWidth;
            let col = 0;
            if (w < 780) {
                col = 2;
            } else if (w > 1024) {
                col = parseInt((window.innerWidth - 330) / col_w); //扣除侧边栏
            } else {
                col = parseInt(window.innerWidth / col_w); //平板竖屏
            }
            return col;
        },
        // 重新计算列数
        resizeCalc: function () {
            const vm = this;
            let repaint = debounce(function () {
                vm.waterfall_options.col = vm.calcCol();
            }, 200);
            window.addEventListener("resize", repaint);
        },
        // 图片预览
        handlePreview: function (data) {
            if (this.windowWidth < 900) {
                this.$router.push({ name: "emotion", params: { id: data.id } });
            } else {
                this.emotion = data;
                this.dialogVisible = true;
            }
            // this.$hevueImgPreview({
            //     multiple: true, // 开启多图预览模式
            //     nowImgIndex: i, // 多图预览，默认展示第二张图片
            //     imgList: this.images, // 需要预览的多图数组
            //     controlBar: false,
            //     clickMaskCLose: true,
            // });
        },
        handleClose() {
            this.emotion = "";
            this.dialogVisible = false;
        },
        // 初始化
        init: function () {
            if (this.id) {
                this.loadSingle();
            } else {
                this.waterfall_options.col = this.calcCol();
                this.loadList();
            }
        },
        showEmotion: function (url) {
            if (this.checkIsGif(url)) {
                return resolveImagePath(url);
            } else {
                return getThumbnail(url, "emotion_thumbnail");
            }
        },
        checkIsGif: function (url) {
            return url?.split(".").pop().toLowerCase() == "gif";
        },
        hasUser(emotion) {
            return emotion.user_info?.user_id;
        },
        doEmotionUser(emotion) {
            const gmt = emotion?.updated_at;
            return {
                time: getRelativeTime(new Date(gmt)) || "",
                username: emotion?.user_info?.display_name.slice(0, 12) || "匿名",
                userLink: authorLink(emotion?.user_id) || "",
                userAvatar: showAvatar(emotion?.user_info?.user_avatar) || "",
            };
        },
        // 点赞
        addLike: function (item) {
            if (item.isLike) return;

            item.count++;
            if (!item.isLike) {
                postStat("emotion", item?.id, "likes");
            }
            item.isLike = true;
        },
    },
    watch: {
        keys: {
            deep: true,
            handler: function () {
                this.init();
            },
            immediate: true,
        },
        // 分页重置
        reset_keys: {
            deep: true,
            handler: function () {
                this.page = 1;
                this.rewardArr = [];
            },
        },
        page: {
            deep: true,
            handler: function () {
                this.rewardArr = [];
                this.loadList();
            },
        },
    },
    mounted: function () {
        const that = this;
        window.onresize = () => {
            that.windowWidth = document.documentElement.clientWidth;
        };
    },
    created: function () {
        this.resizeCalc();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/emotion/emotion.less";
</style>
