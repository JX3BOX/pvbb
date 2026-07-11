<template>
    <div class="m-nav__bbs">
        <Banner class="m-nav-banner"></Banner>

        <div class="m-nav--links">
            <h5 class="u-title">{{ $t("pages.community.sidebar.matrixTitle") }}</h5>
            <div class="m-nav--links__list">
                <a href="/community" :class="{ 'on': routeActive('community') }">
                    <img svg-inline class="u-icon" :src="getAppIcon('community')" alt="" />
                    <span>{{ $t("pages.community.sidebar.apps.community") }}</span>
                    <em>Community</em>
                </a>
                <a href="/joke" :class="{ 'on': routeActive('joke') }">
                    <img svg-inline class="u-icon" :src="getAppIcon('joke')" alt="" />
                    <span>{{ $t("pages.community.sidebar.apps.joke") }}</span>
                    <em>Joke</em>
                </a>
                <a href="/emotion" :class="{ 'on': routeActive('emotion') }">
                    <img svg-inline class="u-icon" :src="getAppIcon('emotion')" alt="" />
                    <span>{{ $t("pages.community.sidebar.apps.emotion") }}</span>
                    <em>Emotion</em>
                </a>
                <a href="/collection" :class="{ 'on': routeActive('collection') }">
                    <img svg-inline class="u-icon" :src="getAppIcon('collection')" alt="" />
                    <span>{{ $t("pages.community.sidebar.apps.collection") }}</span>
                    <em>Collection</em>
                </a>
                <a href="/namespace" :class="{ 'on': routeActive('namespace') }">
                    <img svg-inline class="u-icon" :src="getAppIcon('namespace')" alt="" />
                    <span>{{ $t("pages.community.sidebar.apps.namespace") }}</span>
                    <em>Namespace</em>
                </a>
            </div>
        </div>

        <div class="m-nav__qqbot">
            <a href="/qqbot" target="_blank">
                <img src="@/assets/img/qqbot/qqbot.gif" :alt="$t('pages.community.sidebar.qqBotAlt')" />
            </a>
        </div>
    </div>
</template>

<script>
import { getMenu } from "@jx3box/jx3box-common/js/system.js";
import { feedback } from "@/utils/config";
import { getAppType, getAppIcon } from "@jx3box/jx3box-common/js/utils";
import { getConfigBanner } from "@/service/cms";
import Banner from "@/components/bbs/banner.vue";
import { __cdn } from "@/utils/config";
export default {
    name: "list_nav",
    props: [],
    data: function () {
        return {
            // menu: [
            //     // {
            //     //     slug: "index",
            //     //     icon: "el-icon-receiving",
            //     //     name: "全部",
            //     // },
            //     // {
            //     //     slug: "bbs",
            //     //     icon: "el-icon-collection",
            //     //     name: "剑三茶馆",
            //     //     routeName: "bbs",
            //     // },
            //     // {
            //     //     slug: "joke",
            //     //     icon: "el-icon-cold-drink",
            //     //     name: "剑三骚话",
            //     //     isActive: this.isActive,
            //     //     routeName: "joke",
            //     // },
            //     // {
            //     //     slug: "emotion",
            //     //     icon: "el-icon-sugar",
            //     //     name: "剑三趣图",
            //     //     isActive: this.isActive,
            //     //     routeName: "emotion",
            //     // },
            //     // {
            //     //     slug: "exam",
            //     //     icon: "el-icon-document",
            //     //     name: "剑三考试",
            //     //     isActive: this.isActivePage
            //     // },
            //     // {
            //     //     slug: "collection",
            //     //     icon: "el-icon-paperclip",
            //     //     name: "剑三小册",
            //     //     isActive: this.isActivePage,
            //     //     routeName: "collection"
            //     // },
            //     // {
            //     //     slug: "namespace",
            //     //     icon: "el-icon-postcard",
            //     //     name: "剑三铭牌",
            //     //     desc: "剑网3.com",
            //     //     isActive: this.isActive,
            //     //     routeName: "namespace",
            //     // },
            //     // {
            //     //     slug: "exam",
            //     //     icon: "el-icon-document",
            //     //     name: "剑三题库",
            //     // },
            // ],
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
        getAppIcon(key) {
            return __cdn + "logo/logo-light/" + key + ".svg";
        },
        isActive: function (slug) {
            return slug == this.$route.name;
        },
        isActivePage: function (slug) {
            return getAppType() && getAppType() == slug;
        },
        onQQClick() {
            navigator.clipboard.writeText(this.qq).then(() => {
                this.$notify({
                    title: this.$t("pages.community.sidebar.copySuccess"),
                    message: this.$t("pages.community.sidebar.copyContent", { content: this.qq }),
                    type: "success",
                });
            });
        },
        loadTags() {
            getMenu("bbs_links").then((res) => {
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
        // this.loadTags();
        // this.loadMenu();
    },
    components: { Banner },
};
</script>
<style lang="less">
.m-nav__bbs{
    padding:15px;
}
.m-nav__qqbot{
    .r(6px);
    overflow: hidden;
}
@import "@/assets/css/common/side_nav.less";
</style>
