<template>
    <div class="p-team-my-org p-team-public" v-if="id && accessGranted" v-loading="loading">
        <section
            class="m-public-org__hero"
            :class="{ 'has-banner': publicBanner }"
            :style="publicBanner ? { '--team-banner-image': `url('${publicBanner}')` } : null"
            aria-label="团队信息"
        >
            <div v-if="loadError" class="m-my-org__error">
                <span>团队信息加载失败，请稍后重试。</span>
                <button type="button" @click="loadData">重新加载</button>
            </div>
            <team-info
                v-else-if="done"
                :key="`my-team-info-${id}`"
                :info="data"
                :team_id="id"
                :show-manage-action="false"
                :show-public-actions="false"
                :show-home-action="true"
            />
        </section>

        <section v-if="!loadError" class="m-my-org__workspace" :aria-label="workspaceAriaLabel">
            <el-tabs v-model="tab" class="m-team-view">
                <template v-if="isManagementMode">
                    <el-tab-pane label="成员管理" name="manage-member" lazy v-if="permissions.r_member || isSuper">
                        <template #label>
                            <el-icon><Avatar /></el-icon>
                            <span>成员管理</span>
                            <i class="u-count" v-if="pendingCount">{{ pendingCount }}</i>
                        </template>
                        <ListMember :id="id" />
                    </el-tab-pane>

                    <el-tab-pane label="战绩管理" name="manage-battle" lazy v-if="permissions.r_race || isSuper">
                        <template #label>
                            <el-icon><Trophy /></el-icon>
                            <span>战绩管理</span>
                        </template>
                        <ManageBattle :team-id="id" />
                    </el-tab-pane>

                    <el-tab-pane label="活动管理" name="manage-raid" lazy v-if="permissions.r_raid || isSuper">
                        <template #label>
                            <el-icon><Calendar /></el-icon>
                            <span>活动管理</span>
                        </template>
                        <ManageRaid :team-id="id" embedded />
                    </el-tab-pane>

                    <el-tab-pane label="快照管理" name="manage-snapshot" lazy v-if="permissions.r_snapshot || isSuper">
                        <template #label>
                            <el-icon><Camera /></el-icon>
                            <span>快照管理</span>
                        </template>
                        <SnapshotList :team-id="id" :can-configure-password="isSuper" />
                    </el-tab-pane>

                    <el-tab-pane label="DKP管理" name="manage-dkp" lazy v-if="permissions.r_dkp || isSuper">
                        <template #label>
                            <el-icon><Coin /></el-icon>
                            <span>DKP管理</span>
                        </template>
                        <ManageDkp :team-id="id" />
                    </el-tab-pane>

                    <el-tab-pane label="视频管理" name="video" lazy v-if="canManageVideo">
                        <template #label>
                            <el-icon><VideoCamera /></el-icon>
                            <span>视频管理</span>
                        </template>
                        <ManageVideo
                            :key="`manage-video-${id}`"
                            :team-id="id"
                            :can-manage="canManageVideo"
                        />
                    </el-tab-pane>

                    <el-tab-pane label="团队设置" name="setting" lazy v-if="isSuper">
                        <template #label>
                            <el-icon><Setting /></el-icon>
                            <span>团队设置</span>
                        </template>

                        <nav class="m-workspace-subnav" aria-label="团队设置">
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'basic' }"
                                @click="switchSection('basic')"
                            >
                                基本设置
                            </button>
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'verify' }"
                                @click="switchSection('verify')"
                            >
                                团队认证
                            </button>
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'permission' }"
                                @click="switchSection('permission')"
                            >
                                权限管理
                            </button>
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'feature' }"
                                @click="switchSection('feature')"
                            >
                                功能设置
                            </button>
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'other' }"
                                @click="switchSection('other')"
                            >
                                其它设置
                            </button>
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'advanced' }"
                                @click="switchSection('advanced')"
                            >
                                高级设置
                            </button>
                        </nav>

                        <team-form
                            v-if="archiveSection === 'basic'"
                            ref="teamForm"
                            variant="archive"
                            :data="data"
                            btn_txt="更新"
                            :processing="processing"
                            @submit="submit"
                        />
                        <VerifyOrg
                            v-else-if="archiveSection === 'verify'"
                            :key="`verify-${id}`"
                            variant="archive"
                            :team-id="id"
                            :team-data="data"
                        />
                        <EditPermission v-else-if="archiveSection === 'permission'" variant="archive" :team-id="id" />
                        <div
                            v-else-if="archiveSection === 'feature'"
                            :key="`feature-${id}`"
                            class="m-archive-feature"
                        >
                            <EditOrgConfig
                                variant="archive"
                                config-section="feature"
                                :team-info="data"
                            />
                        </div>
                        <div
                            v-else-if="archiveSection === 'other'"
                            :key="`other-${id}`"
                            class="m-archive-other"
                        >
                            <EditNamespace variant="archive" />
                            <EditOrgConfig variant="archive" config-section="other" :team-info="data" />
                        </div>
                        <div v-else :key="`advanced-${id}`" class="m-archive-advanced">
                            <team-advanced-setting
                                class="is-single-setting"
                                variant="archive"
                                :data="data"
                                initial-active="other"
                            />
                        </div>
                    </el-tab-pane>
                </template>

                <template v-else>
                    <el-tab-pane label="我的角色" name="overview" lazy>
                        <template #label>
                            <el-icon><User /></el-icon>
                            <span>我的角色</span>
                        </template>
                        <team-role v-if="isLogin" :team_id="id" />
                    </el-tab-pane>

                    <el-tab-pane label="我的战绩" name="history" lazy>
                        <template #label>
                            <el-icon><Trophy /></el-icon>
                            <span>我的战绩</span>
                        </template>
                        <myBattle :team-id="id" />
                    </el-tab-pane>

                    <el-tab-pane label="团队活动" name="my-raid" lazy>
                        <template #label>
                            <el-icon><Calendar /></el-icon>
                            <span>团队活动</span>
                        </template>
                        <MyTeamRaid :team-id="id" embedded />
                    </el-tab-pane>

                    <el-tab-pane label="团队快照" name="snapshot" lazy>
                        <template #label>
                            <el-icon><Camera /></el-icon>
                            <span>团队快照</span>
                        </template>
                        <SnapshotList :team-id="id" read-only />
                    </el-tab-pane>

                    <el-tab-pane label="团队DKP" name="my-dkp" lazy>
                        <template #label>
                            <el-icon><Coin /></el-icon>
                            <span>团队DKP</span>
                        </template>
                        <MyDkp :team-id="id" />
                    </el-tab-pane>

                    <el-tab-pane label="通关视频" name="video" lazy>
                        <template #label>
                            <el-icon><VideoPlay /></el-icon>
                            <span>通关视频</span>
                        </template>
                        <ViewVideo v-if="done" />
                    </el-tab-pane>

                    <el-tab-pane label="留言板" name="comment" lazy>
                        <template #label>
                            <el-icon><ChatLineSquare /></el-icon>
                            <span>留言板</span>
                        </template>
                        <ViewComment
                            v-if="done"
                            :v="data.v_comment"
                            :super="data.super"
                            :authority="authority"
                        />
                    </el-tab-pane>

                </template>
            </el-tabs>
        </section>
    </div>
</template>

<script>
import team_role from "@/components/team/org/team_role.vue";
import team_form from "@/components/team/org/teamform.vue";
import team_info from "@/components/team/org/team_info.vue";
import team_advanced_setting from "@/components/team/org/team_advanced_setting.vue";
import SnapshotList from "@/views/team/snapshot/ListSnapshot.vue";
import VerifyOrg from "@/views/team/org/VerifyOrg.vue";
import ViewComment from "@/views/team/org/ViewComment.vue";
import ViewVideo from "@/views/team/org/ViewVideo.vue";
import EditPermission from "@/views/team/org/EditPermission.vue";
import EditOrgConfig from "@/views/team/org/EditOrgConfig.vue";
import EditNamespace from "@/views/team/org/EditNamespace.vue";
import ListMember from "../member/ListMember.vue";
import ManageVideo from "./ManageVideo.vue";
import myBattle from "../battle/myBattle.vue";
import ManageBattle from "../battle/index.vue";
import ManageDkp from "../dkp/ManageDkp.vue";
import MyDkp from "../dkp/MyDkp.vue";
import ManageRaid from "../raid/ManageRaid.vue";
import MyTeamRaid from "../raid/MyTeamRaid.vue";

import User from "@jx3box/jx3box-common/js/user.js";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { getAllMyTeams, getTeam, updateTeam, getTeamPermissions } from "@/service/team/team.js";
import { checkMyAuthority, getPendingCount } from "@/service/team/member.js";
import {
    Avatar,
    Calendar,
    Camera,
    ChatLineSquare,
    Coin,
    Setting,
    Trophy,
    User as UserIcon,
    VideoCamera,
    VideoPlay,
} from "@element-plus/icons-vue";

const MEMBER_TABS = ["overview", "history", "my-raid", "snapshot", "my-dkp", "video", "comment"];
const MANAGEMENT_TAB_NAMES = [
    "manage-member",
    "manage-battle",
    "video",
    "manage-snapshot",
    "manage-dkp",
    "manage-raid",
    "setting",
];
const LEGACY_TAB_MAP = {
    "battle-record": { mode: "manage", tab: "manage-battle" },
    verify: { mode: "manage", tab: "setting", section: "verify" },
    permission: { mode: "manage", tab: "setting", section: "permission" },
    config: { mode: "manage", tab: "setting", section: "feature" },
    other: { mode: "manage", tab: "setting", section: "other" },
};

export default {
    name: "ViewMyOrg",
    data: function () {
        return {
            tab: "overview",
            archiveSection: "basic",
            syncingRoute: false,
            teams: [],
            teamsLoading: false,
            teamsLoaded: false,
            loadError: false,
            accessGranted: false,
            data: {
                status: 0,
                name: "团队名称",
                server: "服务器名称",
                logo: "",
                desc: "团队介绍",
                uid: 0,
                recruit: "",
                honors: [],
                medals: [],
                tags: ["可教学", "固定团"],
                v_member: 0,
                v_activity: 0,
                v_dkp: 2,
                v_comment: 0,
            },
            loading: false,
            done: false,
            processing: false,
            authority: {
                authority: 0,
            },
            permissionsLoaded: false,
            permissions: {
                r_dkp: 0,
                r_member: 0,
                r_audit: 0,
                r_plan: 0,
                r_snapshot: 0,
                r_drop: 0,
                r_raid: 0,
                r_video: 0,
                r_race: 0,
            },
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        uid: function () {
            return User.getInfo().uid;
        },
        isLogin: function () {
            return User.isLogin();
        },
        routeState: function () {
            return `${this.$route.name}|${this.$route.query.mode || ""}|${this.$route.query.tab || ""}|${
                this.$route.query.subtab || ""
            }|${this.$route.query.section || ""}`;
        },
        isSuper: function () {
            return this.data.super == this.uid;
        },
        canManageVideo: function () {
            return this.isSuper || Number(this.permissions.r_video) === 1;
        },
        managementTabs: function () {
            const tabs = [];
            if (this.permissions.r_member || this.isSuper) tabs.push("manage-member");
            if (this.permissions.r_race || this.isSuper) tabs.push("manage-battle");
            if (this.permissions.r_raid || this.isSuper) tabs.push("manage-raid");
            if (this.permissions.r_snapshot || this.isSuper) tabs.push("manage-snapshot");
            if (this.permissions.r_dkp || this.isSuper) tabs.push("manage-dkp");
            if (this.canManageVideo) tabs.push("video");
            if (this.isSuper) tabs.push("setting");
            return tabs;
        },
        canManageTeam: function () {
            return this.managementTabs.length > 0;
        },
        workspaceMode: function () {
            if (this.$route.meta.workspaceMode) return this.$route.meta.workspaceMode;
            if (this.$route.query.mode === "manage") return "manage";
            return MANAGEMENT_TAB_NAMES.includes(this.$route.query.tab) ? "manage" : "member";
        },
        isManagementMode: function () {
            return this.workspaceMode === "manage";
        },
        workspaceAriaLabel: function () {
            return this.isManagementMode ? "团队管理功能" : "我的团队信息";
        },
        publicBanner: function () {
            return this.data.banner ? resolveImagePath(this.data.banner) : "";
        },
        pendingCount: function () {
            const pendingList = this.$store.state.pendingList;
            const pending = pendingList.find((item) => item.team_id == this.id);
            return pending ? pending?.pending : 0;
        },
        allowedTabs: function () {
            return this.isManagementMode ? this.managementTabs : MEMBER_TABS;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler: function (value) {
                if (!value) {
                    this.openFirstTeam();
                    return;
                }
                this.init();
            },
        },
        routeState: {
            immediate: true,
            handler: function () {
                this.applyRouteState();
            },
        },
        tab: function (value) {
            if (this.syncingRoute) return;
            this.replaceRouteState(this.workspaceMode, value, value === "setting" ? this.archiveSection : "", true);
        },
        permissions: {
            deep: true,
            handler: function () {
                this.applyRouteState();
            },
        },
    },
    methods: {
        getTeam: function () {
            return getTeam(this.id).then((res) => {
                this.data = res.data.data;
                this.$store.commit("SET_TEAM", this.data);
            });
        },
        loadData: function () {
            if (!this.id) return;
            const requestedId = this.id;

            this.loading = true;
            this.loadError = false;
            this.accessGranted = this.isManagementMode;
            this.authority = { authority: 0 };
            this.permissionsLoaded = false;
            this.done = false;
            Object.keys(this.permissions).forEach((key) => {
                this.permissions[key] = 0;
            });

            const teamRequest = this.getTeam()
                .then(() => {
                    postStat("team", this.id);
                    this.done = true;
                })
                .catch(() => {
                    this.loadError = true;
                });

            const permissionsRequest = User.isLogin()
                ? getTeamPermissions(this.id)
                      .then((res) => {
                          Object.keys(this.permissions).forEach((key) => {
                              this.permissions[key] = res.data.data[key];
                          });
                      })
                      .finally(() => {
                          this.permissionsLoaded = true;
                      })
                : Promise.resolve().then(() => {
                      this.permissionsLoaded = true;
                  });

            const authorityRequest = this.isManagementMode
                ? Promise.resolve()
                : checkMyAuthority(requestedId).then((res) => {
                      this.authority = res.data.data || { authority: 0 };
                      if (res.data.data.authority < 2) {
                          return this.$router.replace({
                              name: "view_org",
                              params: { id: requestedId },
                          });
                      }
                      this.accessGranted = true;
                  });

            Promise.allSettled([teamRequest, permissionsRequest, authorityRequest]).finally(() => {
                const isCurrentWorkspace = ["view_my_org", "manage_my_org"].includes(this.$route.name);
                if (!isCurrentWorkspace || this.id !== requestedId) return;
                this.loading = false;
                this.applyRouteState();
            });
        },
        loadTeams: function () {
            if (this.teamsLoaded) return Promise.resolve(this.teams);
            if (this.teamsLoading) return Promise.resolve([]);
            this.teamsLoading = true;

            return getAllMyTeams()
                .then((res) => {
                    this.teams = res.data.data || [];
                    this.teams.sort((a, b) => {
                        return a.super == this.uid ? -1 : b.super == this.uid ? 1 : 0;
                    });
                    this.teamsLoaded = true;
                    return this.teams;
                })
                .catch(() => {
                    this.teams = [];
                    return this.teams;
                })
                .finally(() => {
                    this.teamsLoading = false;
                });
        },
        openFirstTeam: function () {
            if (!User.isLogin()) return;

            this.loadTeams().then((teams) => {
                if (this.id || !teams.length) return;
                this.$router.replace({
                    name: "view_my_org",
                    params: {
                        id: teams[0].ID,
                    },
                });
            });
        },
        loadPendingCount: function () {
            getPendingCount()
                .then((res) => {
                    this.$store.commit("SET_PENDING_LIST", res.data.data || []);
                })
                .catch(() => {});
        },
        normalizeRouteState: function () {
            const routeMode = this.$route.meta.workspaceMode || "";
            const rawMode = this.$route.query.mode;
            const rawTab = this.$route.query.tab || "";
            const rawSection = this.$route.query.section || "";
            const rawSubtab = this.$route.query.subtab || "";
            const legacyState = LEGACY_TAB_MAP[rawTab];
            let mode = legacyState?.mode || "";
            let tab = legacyState?.tab || rawTab || (routeMode === "manage" ? "manage-member" : "overview");
            let section = legacyState?.section || rawSubtab || rawSection;

            if (!mode && (rawMode === "manage" || rawMode === "member")) mode = rawMode;

            if (!legacyState && rawTab === "history" && rawSection === "manage") {
                mode = "manage";
                tab = "manage-battle";
                section = "";
            } else if (!legacyState && rawTab === "my-dkp" && rawSection === "manage") {
                mode = "manage";
                tab = "manage-dkp";
                section = "";
            } else if (!legacyState && rawTab === "raid") {
                mode = rawSection === "manage" ? "manage" : "member";
                tab = rawSection === "manage" ? "manage-raid" : "my-raid";
                section = "";
            }

            if (!mode) mode = routeMode || (MANAGEMENT_TAB_NAMES.includes(tab) ? "manage" : "member");
            if (mode === "manage" && !this.canManageTeam) {
                mode = "member";
                tab = "overview";
                section = "";
            }

            const allowedTabs = mode === "manage" ? this.managementTabs : MEMBER_TABS;
            if (!allowedTabs.includes(tab)) tab = allowedTabs[0] || "overview";

            if (tab === "setting") {
                const allowedSections = ["basic", "verify", "permission", "feature", "other", "advanced"];
                section = allowedSections.includes(section) ? section : "basic";
            } else {
                section = "";
            }

            return { rawMode, rawTab, rawSection, rawSubtab, mode, tab, section };
        },
        applyRouteState: function () {
            if (!this.permissionsLoaded || !this.done) return;

            const { mode, tab, section } = this.normalizeRouteState();
            this.syncingRoute = true;
            this.tab = tab;
            if (tab === "setting") this.archiveSection = section;

            this.$nextTick(() => {
                this.syncingRoute = false;
                this.replaceRouteState(mode, tab, section);
            });
        },
        replaceRouteState: function (mode, tab, section = "", resetSubtab = false) {
            const routeName = mode === "manage" ? "manage_my_org" : "view_my_org";
            const defaultTab = mode === "manage" ? this.managementTabs[0] || "manage-member" : "overview";
            const hasCanonicalTab = tab === defaultTab ? !("tab" in this.$route.query) : this.$route.query.tab === tab;
            const hasCanonicalSubtab = tab === "setting" ? this.$route.query.subtab === section : true;
            if (
                this.$route.name === routeName &&
                !("mode" in this.$route.query) &&
                hasCanonicalTab &&
                hasCanonicalSubtab &&
                !("section" in this.$route.query)
            )
                return;

            const query = { ...this.$route.query };
            delete query.mode;
            if (tab === defaultTab) delete query.tab;
            else query.tab = tab;
            delete query.section;
            if (resetSubtab) delete query.subtab;
            if (tab === "setting") query.subtab = section;
            this.$router.replace({
                name: routeName,
                params: { id: this.id },
                query,
            });
        },
        switchSection: function (section) {
            this.archiveSection = section;
            this.replaceRouteState("manage", "setting", section);
        },
        init: function () {
            this.loadData();
            if (User.isLogin()) {
                this.loadPendingCount();
            }
        },
        submit: function () {
            this.processing = true;
            this.done = false;
            updateTeam(this.id, this.data)
                .then((res) => {
                    this.$message({
                        message: "更新成功",
                        type: "success",
                    });
                    this.data = res.data.data;
                    this.done = true;
                    this.$refs.teamForm?.submitTv();
                })
                .finally(() => {
                    this.processing = false;
                });
        },
    },
    components: {
        "team-role": team_role,
        "team-form": team_form,
        "team-info": team_info,
        "team-advanced-setting": team_advanced_setting,
        Avatar,
        Calendar,
        Camera,
        ChatLineSquare,
        Coin,
        EditOrgConfig,
        EditNamespace,
        EditPermission,
        Setting,
        SnapshotList,
        ListMember,
        ManageVideo,
        myBattle,
        ManageBattle,
        ManageDkp,
        ManageRaid,
        MyDkp,
        MyTeamRaid,
        Trophy,
        User: UserIcon,
        VideoCamera,
        VideoPlay,
        VerifyOrg,
        ViewComment,
        ViewVideo,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/view_org.less";
@import "@/assets/css/team/org/view_my_org.less";
</style>
