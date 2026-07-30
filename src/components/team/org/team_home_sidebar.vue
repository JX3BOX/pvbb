<template>
    <aside class="m-team-home-sidebar" aria-label="团队个人工作台">
        <section class="m-team-home-sidebar__panel is-navigation">
            <div class="m-team-home-sidebar__brand">
                <span class="u-sidebar-brand-icon" aria-hidden="true">
                    <el-icon><Grid /></el-icon>
                </span>
                <div>
                    <strong>团队中心</strong>
                    <span>发现团队，切换我的工作视角</span>
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
                <a class="u-sidebar-nav-item" :href="dashboardRoleUrl" target="_blank" rel="noopener noreferrer">
                    <span class="u-sidebar-nav-icon"
                        ><el-icon><User /></el-icon
                    ></span>
                    <span class="u-sidebar-nav-copy">
                        <strong>角色中心</strong>
                        <small>管理全部已绑定角色</small>
                    </span>
                    <el-icon class="u-sidebar-nav-arrow"><TopRight /></el-icon>
                </a>
            </nav>
        </section>

        <section class="m-team-home-sidebar__panel is-my-teams" aria-labelledby="team-home-workspace-title">
            <header class="m-team-home-sidebar__section-header">
                <div>
                    <h2 id="team-home-workspace-title">团队工作区</h2>
                </div>
                <router-link v-if="isLogin" to="/org/add">创建</router-link>
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
                            <strong>我管理的团队</strong>
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
                                <span v-if="team.super == uid" class="u-sidebar-team-role" title="我创建的团队"
                                    >团长</span
                                >
                                <el-icon v-else class="u-sidebar-team-arrow"><ArrowRight /></el-icon>
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
                            <el-icon><User /></el-icon>
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
        </section>
    </aside>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { getAllMyTeams, getMyManageTeams } from "@/service/team/team";
import defaultLogo from "@/assets/img/team/team_logo_null.svg";
import {
    ArrowDown,
    ArrowRight,
    Grid,
    Lock,
    OfficeBuilding,
    Search,
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
        Grid,
        Lock,
        OfficeBuilding,
        Search,
        Setting,
        TopRight,
        User: UserIcon,
        Warning,
    },
    data: function () {
        const userInfo = User.getInfo() || {};
        return {
            defaultLogo,
            expandedGroups: {
                manage: true,
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
            return this.$route.name === "index";
        },
        workspaceMode: function () {
            return this.$route.query.mode === "manage" ? "manage" : "member";
        },
        workspaceTeamCount: function () {
            return this.uniqueTeams([...this.teams, ...this.managedTeams]).length;
        },
    },
    watch: {
        workspaceMode: {
            immediate: true,
            handler: function (mode) {
                if (!this.isLogin || this.$route.name !== "view_my_org") return;
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
                name: "view_my_org",
                params: { id: team.ID },
                query: {
                    mode,
                    tab: mode === "manage" ? "manage-member" : "overview",
                },
            };
        },
        isActiveTeam: function (team, mode) {
            return (
                this.$route.name === "view_my_org" &&
                String(team.ID) === String(this.$route.params.id) &&
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
