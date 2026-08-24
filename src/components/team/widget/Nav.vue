<template>
    <nav class="m-nav">
        <div class="m-nav-top">
            <!-- <router-link to="/org/list" class="u-item el-button el-button--primary">
                <i class="u-icon el-icon-search"></i>
                <span class="u-txt">团队查找</span>
            </router-link> -->
            <!-- <router-link to="/raid/list" class="u-item el-button el-button--primary">
                <i class="u-tv-living-icon">
                    <i class="u-tv-living-icon-col first"></i>
                    <i class="u-tv-living-icon-col"></i>
                    <i class="u-tv-living-icon-col last"></i>
                </i>
                <span class="u-txt">活动大厅</span>
            </router-link> -->
        </div>

        <h5 class="u-title">{{ $t("team.legacyNav.memberActions") }}</h5>
        <div class="m-nav-group m-nav-data">
            <a href="/dashboard/role">
                <i class="u-icon el-icon-user"></i>
                <span class="u-txt">{{ $t("team.workspace.myRoles") }}</span>
            </a>
            <a href="/dashboard/role/bind">
                <i class="u-icon el-icon-connection"></i>
                <span class="u-txt">{{ $t("team.legacyNav.bindRole") }}</span>
            </a>
            <router-link to="/org/list">
                <i class="u-icon el-icon-office-building"></i>
                <span class="u-txt">{{ $t("team.legacyNav.allTeams") }}</span>
            </router-link>
            <router-link to="/role/group">
                <i class="u-icon el-icon-school"></i>
                <span class="u-txt">{{ $t("team.sidebar.myTeams") }}</span>
            </router-link>
            <!-- <router-link to="/dkp/my">
                <i class="u-icon el-icon-coin"></i>
                <span class="u-txt">我的DKP</span>
            </router-link>
            <router-link to="/raid/my">
                <i class="u-icon el-icon-discover"></i>
                <span class="u-txt">我的活动</span>
            </router-link> -->
            <router-link to="/myBattle">
                <i class="u-icon el-icon-tickets"></i>
                <span class="u-txt">{{ $t("team.legacyNav.myResults") }}</span>
            </router-link>
        </div>
        <h5 class="u-title">{{ $t("team.legacyNav.leaderActions") }}</h5>
        <div class="m-nav-group m-nav-data">
            <router-link to="/org/manage">
                <i class="u-icon el-icon-setting"></i>
                <span class="u-txt">{{ $t("team.sidebar.management") }}</span>
            </router-link>
            <router-link to="/member/list">
                <i class="u-icon el-icon-user"></i>
                <span class="u-txt">{{ $t("team.legacyNav.memberManagement") }}</span>
                <i class="u-count" v-if="pendingMememberCount">{{ pendingMememberCount }}</i>
            </router-link>

            <router-link to="/snapshot/list">
                <i class="u-icon el-icon-camera"></i>
                <span class="u-txt">{{ $t("team.workspace.snapshotManagement") }}</span>
            </router-link>
            <router-link to="/raid/manage">
                <i class="u-icon el-icon-date"></i>
                <span class="u-txt">{{ $t("team.workspace.activityManagement") }}</span>
            </router-link>
            <router-link to="/dkp/manage">
                <i class="u-icon el-icon-coin"></i>
                <span class="u-txt">{{ $t("team.workspace.dkpManagement") }}</span>
            </router-link>
            <router-link to="/apply/list">
                <i class="u-icon el-icon-present"></i>
                <span class="u-txt">{{ $t("team.legacyNav.welfareApplications") }}</span>
            </router-link>
        </div>
    </nav>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import { getPendingCount } from "@/service/team/member.js";
export default {
    name: "Nav",
    data: function () {
        return {
            pendingMememberCount: 0,
        };
    },
    computed: {},
    methods: {},
    mounted: function () {
        User.isLogin() &&
            getPendingCount().then((res) => {
                let list = res.data.data || [];
                this.$store.commit("SET_PENDING_LIST", list);
                let count = 0;
                list.forEach((item) => {
                    count += item.pending;
                });
                this.pendingMememberCount = count;
            });
    },
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/widget/nav.less";
</style>
