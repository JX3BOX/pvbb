<template>
    <div class="p-team">
        <CommonHeader></CommonHeader>
        <Breadcrumb
            name="团队平台"
            slug="team"
            root="/team"
            :publishEnable="false"
            :adminEnable="false"
            :feedbackEnable="true"
            :crumbEnable="true"
            v-if="!isCreateTeam && !isTeamHome"
        >
            <template #logo>
                <img :src="logo" />
            </template>
        </Breadcrumb>
        <LeftSidebar v-if="!isCreateTeam && !isTeamHome">
            <Nav />
        </LeftSidebar>
        <Main
            :withoutRight="true"
            :withoutLeft="isTeamHome"
            :withoutBread="isTeamHome"
            :class="{ 'is-team-home-main': isTeamHome }"
            v-if="!isCreateTeam"
        >
            <div class="m-main" :class="{ 'is-team-home-content': isTeamHome }" :style="{ minHeight: keepHeight }">
                <router-view v-if="isPublic || isLogin" />
                <el-alert v-else title="请先登录" type="warning" description="使用本功能请先登录" show-icon> </el-alert>
            </div>
            <CommonFooter></CommonFooter>
        </Main>
        <template v-if="isCreateTeam">
            <div class="m-create-team">
                <router-view v-if="isPublic || isLogin" />
                <el-alert v-else title="请先登录" type="warning" description="使用本功能请先登录" show-icon> </el-alert>
            </div>
        </template>
    </div>
</template>

<script>
// import Nav from "@/components/widget/Nav.vue";
import Nav from "@/components/team/widget/Nav2.vue";
import User from "@jx3box/jx3box-common/js/user";
import { __Root, __cdn } from "@/utils/config";
export default {
    name: "wrapper",
    data: function () {
        return {
            isLogin: User.isLogin(),
            keepHeight: window.innerHeight - 220 + "px",
            logo: __cdn + "logo/logo-light/team.svg",
        };
    },
    computed: {
        isPublic: function () {
            return this.$route.meta.isPublic;
        },
        isCreateTeam: function () {
            return this.$route.meta.isCreateTeam;
        },
        isTeamHome: function () {
            return this.$route.name === "index";
        },
    },
    methods: {},
    mounted: function () {
        let oldhash = "#/org/view/";
        let old_id = location.hash.slice(oldhash.length, location.hash.length);
        if (location.hash.includes(oldhash)) {
            location.href = __Root + "team/org/" + old_id;
        }
    },
    components: {
        Nav,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/app.less";
@import "@/assets/css/team/miniprogram.less";
</style>
