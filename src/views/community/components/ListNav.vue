<template>
    <div class="m-list-nav">
        <Banner class="m-ladder-carousel"></Banner>

        <div class="m-nav-app">
            <h5 class="u-title">茶馆矩阵</h5>
            <a href="/bbs" :class="{ 'is-active': routeActive('bbs') }">
                <i class="el-icon-cold-drink"></i>
                <span>茶馆</span>
                <em>BBS</em>
            </a>
            <a href="/joke" :class="{ 'is-active': routeActive('joke') }">
                <i class="el-icon-cherry"></i>
                <span>骚话</span>
                <em>Joke</em>
            </a>
            <a href="/emotion" :class="{ 'is-active': routeActive('emotion') }">
                <i class="el-icon-sugar"></i>
                <span>趣图</span>
                <em>Emotion</em>
            </a>
            <a href="/collection" :class="{ 'is-active': routeActive('collection') }">
                <i class="el-icon-paperclip"></i>
                <span>小册</span>
                <em>Collection</em>
            </a>
            <a href="/namespace" :class="{ 'is-active': routeActive('namespace') }">
                <i class="el-icon-postcard"></i>
                <span>铭牌</span>
                <em>Namespace</em>
            </a>
        </div>

        <ul class="m-banner-list">
            <li>
                <a href="">
                    <img src="https://jx3.xoyo.com/uploadfile/2023/1019/20231019102915490.jpg" alt="资料片专题" />
                </a>
            </li>

            <li>
                <a href="">
                    <img
                        src="https://cdn.jx3box.com/upload/post/2024/3/15/4011_5088107.png?x-oss-process=image/auto-orient,1/resize,m_fill,w_640,h_320/quality,Q_100"
                        alt="活动专题"
                    />
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
import { getMenu } from "@jx3box/jx3box-common/js/system.js";
import { feedback } from "@/utils/config";
import { getAppType, getAppIcon } from "@jx3box/jx3box-common/js/utils";
import { getConfigBanner } from "@/service/cms";
import Banner from "@/components/bbs/banner.vue";
export default {
    name: "list_nav",
    props: [],
    data: function () {
        return {
            tags: [],
            feedback,
            qq: "2471800",
            slideList: [],
        };
    },
    computed: {
        root: function () {
            return location.hostname == "localhost" ? "" : "/bbs";
        },
        client: function () {
            return this.$store.state.client;
        },
    },
    methods: {
        getAppIcon,
        isActive: function (slug) {
            return slug == this.$route.name;
        },
        isActivePage: function (slug) {
            return getAppType() && getAppType() == slug;
        },
        onQQClick() {
            navigator.clipboard.writeText(this.qq).then(() => {
                this.$notify({
                    title: "复制成功",
                    message: "内容：" + this.qq,
                    type: "success",
                });
            });
        },
        loadTags() {
            getMenu("bbs_links").then((res) => {
                // console.log(res);
                this.tags = res || [];
            });
        },
        loadMenu() {
            getConfigBanner({ client: this.client, status: 1, per: 10, type: "banner", subtype: "bbs" }).then((res) => {
                this.slideList = res.data.data.list;
            });
        },
        routeActive(app) {
            return this.$route.name.includes(app);
        },
    },
    mounted: function () {
        this.loadTags();
        // this.loadMenu();
    },
    components: { Banner },
};
</script>
<style lang="less">
@import "../../assets/css/nav.less";
</style>
