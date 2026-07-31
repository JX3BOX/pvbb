<template>
    <aside class="m-team-home-sidebar" aria-label="团队个人工作台">
        <section class="m-team-home-sidebar__panel is-navigation is-discovery">
            <div class="m-team-home-sidebar__brand">
                <span class="u-sidebar-brand-icon" aria-hidden="true">
                    <img :src="teamLogo" alt="" />
                </span>
                <div>
                    <strong>团队平台</strong>
                </div>
            </div>

            <nav class="m-team-home-sidebar__nav" aria-label="团队中心导航">
                <router-link
                    class="u-sidebar-nav-item"
                    :class="{ 'is-active': isTeamHome }"
                    to="/"
                    :aria-current="isTeamHome ? 'page' : undefined"
                >
                    <span class="u-sidebar-nav-icon"
                        ><el-icon><Search /></el-icon
                    ></span>
                    <span class="u-sidebar-nav-copy">
                        <strong>团队广场</strong>
                        <small>查找适合自己的团队</small>
                    </span>
                    <el-icon class="u-sidebar-nav-arrow"><ArrowRight /></el-icon>
                </router-link>
                <router-link
                    class="u-sidebar-nav-item"
                    :class="{ 'is-active': isTeamActivity }"
                    to="/raid/list"
                    :aria-current="isTeamActivity ? 'page' : undefined"
                >
                    <span class="u-sidebar-nav-icon"
                        ><el-icon><Calendar /></el-icon
                    ></span>
                    <span class="u-sidebar-nav-copy">
                        <strong>团队活动</strong>
                        <small>查看团队公开招募活动</small>
                    </span>
                    <el-icon class="u-sidebar-nav-arrow"><ArrowRight /></el-icon>
                </router-link>
            </nav>
        </section>

        <section class="m-team-home-sidebar__panel is-my-teams is-workspace" aria-labelledby="team-home-workspace-title">
            <header class="m-team-home-sidebar__section-header">
                <div>
                    <h2 id="team-home-workspace-title">团队工作区</h2>
                </div>
            </header>

            <div v-if="!isLogin" class="m-team-home-sidebar__login">
                <span class="u-sidebar-empty-icon" aria-hidden="true"
                    ><el-icon><Lock /></el-icon
                ></span>
                <strong>登录后查看团队工作区</strong>
                <p>按管理者与成员身份进入不同的团队视图。</p>
                <a :href="loginUrl">登录 / 注册</a>
            </div>

            <div v-else-if="loading" class="m-team-home-sidebar__skeleton" aria-label="团队工作区加载中">
                <div v-for="index in 4" :key="index" class="u-sidebar-team-skeleton" aria-hidden="true">
                    <span></span>
                    <i></i>
                </div>
            </div>

            <div v-else-if="loadError" class="m-team-home-sidebar__empty">
                <span class="u-sidebar-empty-icon" aria-hidden="true"
                    ><el-icon><Warning /></el-icon
                ></span>
                <strong>暂时无法加载</strong>
                <p>团队广场仍可正常浏览。</p>
                <button type="button" @click="loadTeams">重新加载</button>
            </div>

            <div v-else-if="workspaceTeamCount" class="m-team-home-sidebar__groups">
                <section class="m-sidebar-team-group" :class="{ 'is-expanded': expandedGroups.manage }">
                    <button
                        class="u-sidebar-group-toggle"
                        type="button"
                        :aria-expanded="expandedGroups.manage"
                        aria-controls="managed-team-list"
                        @click="toggleGroup('manage')"
                    >
                        <span class="u-sidebar-group-icon is-manage" aria-hidden="true">
                            <el-icon><Setting /></el-icon>
                        </span>
                        <span class="u-sidebar-group-copy">
                            <strong>团队管理</strong>
                        </span>
                        <span class="u-sidebar-group-count">{{ managedTeams.length }}</span>
                        <el-icon class="u-sidebar-group-arrow"><ArrowDown /></el-icon>
                    </button>

                    <div v-show="expandedGroups.manage" id="managed-team-list" class="m-team-home-sidebar__team-list">
                        <template v-if="managedTeams.length">
                            <router-link
                                v-for="team in managedTeams"
                                :key="`manage-${team.ID}`"
                                class="u-sidebar-team"
                                :class="{ 'is-active': isActiveTeam(team, 'manage') }"
                                :to="teamRoute(team, 'manage')"
                            >
                                <img
                                    :src="team.logo ? showLogo(team.logo) : defaultLogo"
                                    :alt="`${team.name}团队 Logo`"
                                    @error="useDefaultLogo"
                                />
                                <span class="u-sidebar-team-copy">
                                    <strong>{{ team.name }}</strong>
                                    <small>{{ team.server || "服务器未填写" }}</small>
                                </span>
                                <span
                                    class="u-sidebar-team-role"
                                    :class="team.super == uid ? 'is-founder' : 'is-admin'"
                                    :title="team.super == uid ? '团队创始人' : '团队管理员'"
                                >
                                    {{ team.super == uid ? "创始人" : "管理员" }}
                                </span>
                            </router-link>
                        </template>
                        <p v-else class="u-sidebar-group-empty">当前没有可管理的团队</p>
                    </div>
                </section>

                <section class="m-sidebar-team-group" :class="{ 'is-expanded': expandedGroups.member }">
                    <button
                        class="u-sidebar-group-toggle"
                        type="button"
                        :aria-expanded="expandedGroups.member"
                        aria-controls="member-team-list"
                        @click="toggleGroup('member')"
                    >
                        <span class="u-sidebar-group-icon is-member" aria-hidden="true">
                            <el-icon><School /></el-icon>
                        </span>
                        <span class="u-sidebar-group-copy">
                            <strong>我的团队</strong>
                        </span>
                        <span class="u-sidebar-group-count">{{ teams.length }}</span>
                        <el-icon class="u-sidebar-group-arrow"><ArrowDown /></el-icon>
                    </button>

                    <div v-show="expandedGroups.member" id="member-team-list" class="m-team-home-sidebar__team-list">
                        <template v-if="teams.length">
                            <router-link
                                v-for="team in teams"
                                :key="`member-${team.ID}`"
                                class="u-sidebar-team"
                                :class="{ 'is-active': isActiveTeam(team, 'member') }"
                                :to="teamRoute(team, 'member')"
                            >
                                <img
                                    :src="team.logo ? showLogo(team.logo) : defaultLogo"
                                    :alt="`${team.name}团队 Logo`"
                                    @error="useDefaultLogo"
                                />
                                <span class="u-sidebar-team-copy">
                                    <strong>{{ team.name }}</strong>
                                    <small>{{ team.server || "服务器未填写" }}</small>
                                </span>
                                <el-icon class="u-sidebar-team-arrow"><ArrowRight /></el-icon>
                            </router-link>
                        </template>
                        <p v-else class="u-sidebar-group-empty">当前没有以成员身份加入的团队</p>
                    </div>
                </section>
            </div>

            <div v-else class="m-team-home-sidebar__empty">
                <span class="u-sidebar-empty-icon" aria-hidden="true"
                    ><el-icon><OfficeBuilding /></el-icon
                ></span>
                <strong>还没有加入团队</strong>
                <p>从团队广场选择合适的伙伴，或者创建自己的团队。</p>
                <router-link to="/org/add">创建团队</router-link>
            </div>

            <a
                class="u-sidebar-workspace-link"
                :href="dashboardRoleUrl"
                target="_blank"
                rel="noopener noreferrer"
            >
                <span class="u-sidebar-group-icon is-role" aria-hidden="true">
                    <el-icon><User /></el-icon>
                </span>
                <span class="u-sidebar-group-copy">
                    <strong>我的角色</strong>
                </span>
                <el-icon class="u-sidebar-nav-arrow"><TopRight /></el-icon>
            </a>
        </section>
    </aside>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { __cdn } from "@/utils/config";
import { getAllMyTeams, getMyManageTeams } from "@/service/team/team";
import defaultLogo from "@/assets/img/team/team_logo_null.svg";
import {
    ArrowDown,
    ArrowRight,
    Calendar,
    Lock,
    OfficeBuilding,
    Search,
    School,
    Setting,
    TopRight,
    User as UserIcon,
    Warning,
} from "@element-plus/icons-vue";

export default {
    name: "TeamHomeSidebar",
    components: {
        ArrowDown,
        ArrowRight,
        Calendar,
        Lock,
        OfficeBuilding,
        Search,
        School,
        Setting,
        TopRight,
        User: UserIcon,
        Warning,
    },
    data: function () {
        const userInfo = User.getInfo() || {};
        return {
            defaultLogo,
            teamLogo: __cdn + "logo/logo-light/team.svg",
            expandedGroups: {
                manage: false,
                member: false,
            },
            isLogin: User.isLogin(),
            loadError: false,
            loading: false,
            managedTeams: [],
            teams: [],
            uid: userInfo.uid || 0,
        };
    },
    computed: {
        dashboardRoleUrl: function () {
            return "/dashboard/role";
        },
        loginUrl: function () {
            return `/account/login?redirect=${encodeURIComponent(window.location.href)}`;
        },
        isTeamHome: function () {
            return ["index", "view_org"].includes(this.$route.name);
        },
        isTeamActivity: function () {
            return ["list_raid", "view_raid"].includes(this.$route.name);
        },
        workspaceMode: function () {
            if (this.$route.name === "view_raid") {
                return this.$store.state.canManage ? "manage" : "member";
            }
            return this.$route.meta.workspaceMode || "member";
        },
        activeTeamId: function () {
            if (this.$route.name === "view_raid") return this.$store.state.team?.ID;
            return ["view_my_org", "manage_my_org"].includes(this.$route.name) ? this.$route.params.id : "";
        },
        workspaceTeamCount: function () {
            return this.uniqueTeams([...this.teams, ...this.managedTeams]).length;
        },
    },
    watch: {
        workspaceMode: {
            immediate: true,
            handler: function (mode) {
                if (!this.isLogin || !["view_my_org", "manage_my_org", "view_raid"].includes(this.$route.name)) return;
                if (this.$route.name === "view_raid") {
                    this.expandedGroups.manage = mode === "manage";
                    this.expandedGroups.member = mode === "member";
                    return;
                }
                this.expandedGroups[mode] = true;
            },
        },
    },
    mounted: function () {
        if (this.isLogin) this.loadTeams();
    },
    methods: {
        extractTeams: function (response) {
            const data = response?.data?.data;
            if (Array.isArray(data)) return data;
            return Array.isArray(data?.list) ? data.list : [];
        },
        uniqueTeams: function (teams) {
            return [...new Map(teams.filter((team) => team?.ID).map((team) => [String(team.ID), team])).values()];
        },
        sortTeams: function (teams) {
            return [...teams].sort((a, b) => {
                const aIsOwner = a.super == this.uid;
                const bIsOwner = b.super == this.uid;
                return aIsOwner === bIsOwner ? 0 : aIsOwner ? -1 : 1;
            });
        },
        loadTeams: function () {
            this.loading = true;
            this.loadError = false;

            Promise.allSettled([getAllMyTeams(), getMyManageTeams()])
                .then(([allTeamsResult, managedTeamsResult]) => {
                    const allTeams =
                        allTeamsResult.status === "fulfilled" ? this.extractTeams(allTeamsResult.value) : [];
                    const managedTeams =
                        managedTeamsResult.status === "fulfilled" ? this.extractTeams(managedTeamsResult.value) : [];
                    const ownedTeams = allTeams.filter((team) => team.super == this.uid);

                    this.teams = this.sortTeams(this.uniqueTeams(allTeams));
                    this.managedTeams = this.sortTeams(this.uniqueTeams([...managedTeams, ...ownedTeams]));
                    this.loadError = allTeamsResult.status === "rejected" && managedTeamsResult.status === "rejected";

                    if (!this.managedTeams.length) {
                        this.expandedGroups.manage = false;
                        this.expandedGroups.member = true;
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        toggleGroup: function (group) {
            this.expandedGroups[group] = !this.expandedGroups[group];
        },
        teamRoute: function (team, mode) {
            return {
                name: mode === "manage" ? "manage_my_org" : "view_my_org",
                params: { id: team.ID },
            };
        },
        isActiveTeam: function (team, mode) {
            return (
                ["view_my_org", "manage_my_org", "view_raid"].includes(this.$route.name) &&
                String(team.ID) === String(this.activeTeamId) &&
                this.workspaceMode === mode
            );
        },
        showLogo: function (val) {
            return getThumbnail(val, 96, true);
        },
        useDefaultLogo: function (event) {
            const image = event.currentTarget;
            if (image.dataset.fallbackApplied) return;
            image.dataset.fallbackApplied = "true";
            image.src = this.defaultLogo;
        },
    },
};
</script>
