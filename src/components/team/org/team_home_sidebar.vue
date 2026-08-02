<template>
    <aside
        class="m-team-home-sidebar"
        :class="{ 'is-mobile-drawer-open': mobileDrawerOpen }"
        :aria-label="$t('team.sidebar.ariaLabel')"
    >
        <button
            class="u-team-mobile-navigation-trigger"
            type="button"
            aria-controls="team-mobile-navigation-drawer"
            :aria-expanded="mobileDrawerOpen"
            :aria-label="$t('team.sidebar.mobileOpen')"
            :title="$t('team.sidebar.mobileOpen')"
            @click="openMobileDrawer"
        >
            <el-icon><ArrowRight /></el-icon>
        </button>

        <button
            v-if="mobileDrawerOpen"
            class="u-team-mobile-navigation-mask"
            type="button"
            :aria-label="$t('team.sidebar.mobileClose')"
            @click="closeMobileDrawer"
        ></button>

        <div
            id="team-mobile-navigation-drawer"
            class="m-team-home-sidebar__drawer"
            :class="{ 'is-open': mobileDrawerOpen }"
        >
            <header class="m-team-mobile-navigation-header">
                <div>
                    <img :src="teamLogo" alt="" />
                    <strong>{{ $t("team.common.platform") }}</strong>
                </div>
                <button type="button" :aria-label="$t('team.sidebar.mobileClose')" @click="closeMobileDrawer">
                    <el-icon><Close /></el-icon>
                </button>
            </header>

        <section class="m-team-home-sidebar__panel is-navigation is-discovery">
            <div class="m-team-home-sidebar__brand">
                <span class="u-sidebar-brand-icon" aria-hidden="true">
                    <img :src="teamLogo" alt="" />
                </span>
                <div>
                    <strong>{{ $t("team.common.platform") }}</strong>
                </div>
            </div>

            <nav class="m-team-home-sidebar__nav" :aria-label="$t('team.sidebar.navigation')">
                <router-link
                    class="u-sidebar-nav-item"
                    :class="{ 'is-active': isTeamHome }"
                    to="/"
                    :aria-current="isTeamHome ? 'page' : undefined"
                    @click="closeMobileDrawer"
                >
                    <span class="u-sidebar-nav-icon"
                        ><el-icon><Search /></el-icon
                    ></span>
                    <span class="u-sidebar-nav-copy">
                        <strong>{{ $t("team.sidebar.plaza") }}</strong>
                        <small>{{ $t("team.sidebar.plazaDescription") }}</small>
                    </span>
                    <el-icon class="u-sidebar-nav-arrow"><ArrowRight /></el-icon>
                </router-link>
                <router-link
                    class="u-sidebar-nav-item"
                    :class="{ 'is-active': isTeamActivity }"
                    to="/raid/list"
                    :aria-current="isTeamActivity ? 'page' : undefined"
                    @click="closeMobileDrawer"
                >
                    <span class="u-sidebar-nav-icon"
                        ><el-icon><Calendar /></el-icon
                    ></span>
                    <span class="u-sidebar-nav-copy">
                        <strong>{{ $t("team.sidebar.activity") }}</strong>
                        <small>{{ $t("team.sidebar.activityDescription") }}</small>
                    </span>
                    <el-icon class="u-sidebar-nav-arrow"><ArrowRight /></el-icon>
                </router-link>
            </nav>
        </section>

        <section class="m-team-home-sidebar__panel is-my-teams is-workspace" aria-labelledby="team-home-workspace-title">
            <header class="m-team-home-sidebar__section-header">
                <div>
                    <h2 id="team-home-workspace-title">{{ $t("team.sidebar.workspace") }}</h2>
                </div>
            </header>

            <div v-if="!isLogin" class="m-team-home-sidebar__login">
                <span class="u-sidebar-empty-icon" aria-hidden="true"
                    ><el-icon><Lock /></el-icon
                ></span>
                <strong>{{ $t("team.sidebar.loginTitle") }}</strong>
                <p>{{ $t("team.sidebar.loginDescription") }}</p>
                <a :href="loginUrl" @click="closeMobileDrawer">{{ $t("team.sidebar.login") }}</a>
            </div>

            <div
                v-else-if="loading"
                class="m-team-home-sidebar__skeleton"
                :aria-label="$t('team.sidebar.loading')"
            >
                <div v-for="index in 4" :key="index" class="u-sidebar-team-skeleton" aria-hidden="true">
                    <span></span>
                    <i></i>
                </div>
            </div>

            <div v-else-if="loadError" class="m-team-home-sidebar__empty">
                <span class="u-sidebar-empty-icon" aria-hidden="true"
                    ><el-icon><Warning /></el-icon
                ></span>
                <strong>{{ $t("team.sidebar.loadFailed") }}</strong>
                <p>{{ $t("team.sidebar.loadFailedDescription") }}</p>
                <button type="button" @click="loadTeams">{{ $t("team.common.retry") }}</button>
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
                            <strong>{{ $t("team.sidebar.management") }}</strong>
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
                                @click="closeMobileDrawer"
                            >
                                <img
                                    :src="team.logo ? showLogo(team.logo) : defaultLogo"
                                    :alt="$t('team.common.teamLogoAlt', { name: team.name })"
                                    @error="useDefaultLogo"
                                />
                                <span class="u-sidebar-team-copy">
                                    <strong>{{ team.name }}</strong>
                                    <small>{{ team.server || $t("team.common.serverMissing") }}</small>
                                </span>
                                <span
                                    class="u-sidebar-team-role"
                                    :class="team.super == uid ? 'is-founder' : 'is-admin'"
                                    :title="
                                        team.super == uid
                                            ? $t('team.common.teamFounder')
                                            : $t('team.common.teamAdministrator')
                                    "
                                >
                                    {{
                                        team.super == uid
                                            ? $t("team.common.founder")
                                            : $t("team.common.administrator")
                                    }}
                                </span>
                            </router-link>
                        </template>
                        <p v-else class="u-sidebar-group-empty">{{ $t("team.sidebar.noManagedTeams") }}</p>
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
                            <strong>{{ $t("team.sidebar.myTeams") }}</strong>
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
                                @click="closeMobileDrawer"
                            >
                                <img
                                    :src="team.logo ? showLogo(team.logo) : defaultLogo"
                                    :alt="$t('team.common.teamLogoAlt', { name: team.name })"
                                    @error="useDefaultLogo"
                                />
                                <span class="u-sidebar-team-copy">
                                    <strong>{{ team.name }}</strong>
                                    <small>{{ team.server || $t("team.common.serverMissing") }}</small>
                                </span>
                                <el-icon class="u-sidebar-team-arrow"><ArrowRight /></el-icon>
                            </router-link>
                        </template>
                        <p v-else class="u-sidebar-group-empty">{{ $t("team.sidebar.noMemberTeams") }}</p>
                    </div>
                </section>
            </div>

            <div v-else class="m-team-home-sidebar__empty">
                <span class="u-sidebar-empty-icon" aria-hidden="true"
                    ><el-icon><OfficeBuilding /></el-icon
                ></span>
                <strong>{{ $t("team.sidebar.emptyTitle") }}</strong>
                <p>{{ $t("team.sidebar.emptyDescription") }}</p>
                <router-link to="/org/add" @click="closeMobileDrawer">{{ $t("team.sidebar.createTeam") }}</router-link>
            </div>

            <a
                class="u-sidebar-workspace-link"
                :href="dashboardRoleUrl"
                target="_blank"
                rel="noopener noreferrer"
                @click="closeMobileDrawer"
            >
                <span class="u-sidebar-group-icon is-role" aria-hidden="true">
                    <el-icon><User /></el-icon>
                </span>
                <span class="u-sidebar-group-copy">
                    <strong>{{ $t("team.sidebar.myRoles") }}</strong>
                </span>
                <el-icon class="u-sidebar-nav-arrow"><TopRight /></el-icon>
            </a>
        </section>
        </div>
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
    Close,
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
        Close,
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
            mobileDrawerOpen: false,
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
        "$route.fullPath": function () {
            this.closeMobileDrawer();
        },
        mobileDrawerOpen: function (isOpen) {
            document.body.classList.toggle("is-team-navigation-open", isOpen);
        },
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
        document.addEventListener("keydown", this.handleMobileDrawerKeydown);
    },
    beforeUnmount: function () {
        document.removeEventListener("keydown", this.handleMobileDrawerKeydown);
        document.body.classList.remove("is-team-navigation-open");
    },
    methods: {
        openMobileDrawer: function () {
            this.mobileDrawerOpen = true;
        },
        closeMobileDrawer: function () {
            this.mobileDrawerOpen = false;
        },
        handleMobileDrawerKeydown: function (event) {
            if (event.key === "Escape") this.closeMobileDrawer();
        },
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

                    this.openFirstMemberTeam();
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        toggleGroup: function (group) {
            this.expandedGroups[group] = !this.expandedGroups[group];
        },
        openFirstMemberTeam: function () {
            if (this.$route.name !== "view_my_org" || this.$route.params.id || !this.teams.length) return;
            this.expandedGroups.member = true;
            this.$router.replace(this.teamRoute(this.teams[0], "member"));
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
