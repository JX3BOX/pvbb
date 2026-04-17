<template>
    <nav class="m-nav">
        <banner class="m-ladder-carousel"></banner>

        <div class="m-nav-app">
            <!-- <h5 class="u-title">茶馆矩阵</h5> -->
            <a href="/team" class="u-item" :class="{ 'is-active': routeActive('index') }">
                <i class="el-icon-office-building"></i>
                <span>团队大厅</span>
                <em>Teams</em>
            </a>
            <a href="/dashboard/role" class="u-item" target="_blank">
                <i class="el-icon-user"></i>
                <span>我的角色</span>
                <em>Role↗</em>
            </a>
            <span
                href="/role/group"
                class="u-item"
                :class="{ 'is-active': routeActive('group_role') }"
                @click.stop="onExpand"
            >
                <i class="el-icon-school"></i>
                <span>我的团队</span>
                <!-- <em>Mine</em> -->
                <i class="expanded-icon el-icon-caret-top" :class="{ 'is-expanded': !isExpand }"></i>
            </span>
        </div>
        <template v-if="!isExpand">
            <el-alert v-if="!isLogin" title="请先登录"></el-alert>
            <div class="m-nav-teams" v-else>
                <router-link
                    :to="'/my/org/' + item.ID + '?tab=overview'"
                    class="m-team-item"
                    v-for="item in teams"
                    :key="item.ID"
                    :class="{ active: activeId == item.ID && isMine }"
                >
                    <span class="u-pic">
                        <img :src="showLogo(item.logo)" v-if="item.logo" />
                        <img src="@/assets/img/team/team_logo_null.svg" v-else />
                    </span>
                    <span class="u-name">
                        {{ item.name }}
                    </span>
                    <el-tag class="u-tag" title="创始人" v-if="item.super == uid" size="small" type="warning"
                        >创始人</el-tag
                    >
                </router-link>
            </div>
        </template>
    </nav>
</template>

<script>
import ListBanner from "./ListBanner.vue";
import { getAppType, getAppIcon } from "@jx3box/jx3box-common/js/utils";
import { getAllMyTeams } from "@/service/team/team";
import User from "@jx3box/jx3box-common/js/user";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { getPendingCount } from "@/service/team/member.js";
export default {
    name: "Nav2",
    components: {
        banner: ListBanner,
    },
    data() {
        return {
            teams: [],
            isExpand: false,
        };
    },
    computed: {
        root: function () {
            return location.hostname == "localhost" ? "" : "/bbs";
        },
        client: function () {
            return this.$store.state.client;
        },
        isLogin() {
            return User.isLogin();
        },
        uid() {
            return User.getInfo().uid;
        },
        activeId() {
            return this.$route.params.id;
        },
        isMine() {
            return this.$route.name == "view_my_org";
        },
    },
    mounted() {
        if (this.isLogin) {
            this.loadMyAllTeams();

            getPendingCount().then((res) => {
                let list = res.data.data || [];
                this.$store.commit("SET_PENDING_LIST", list);
            });
        }
    },
    methods: {
        getAppIcon,
        isActive: function (slug) {
            return slug == this.$route.name;
        },
        isActivePage: function (slug) {
            return getAppType() && getAppType() == slug;
        },
        routeActive(app) {
            return this.$route.name?.includes(app);
        },
        loadMyAllTeams() {
            getAllMyTeams().then((res) => {
                this.teams = res.data.data || [];

                // 自己为创始人的团队排在最前面 item.super == this.uid
                this.teams.sort((a, b) => {
                    return a.super == this.uid ? -1 : b.super == this.uid ? 1 : 0;
                });
            });
        },
        showLogo: function (val) {
            return getThumbnail(val, 204, true);
        },
        onExpand(e) {
            e.stopPropagation();
            e.preventDefault();
            this.isExpand = !this.isExpand;
        },
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/widget/nav2.less";
</style>
