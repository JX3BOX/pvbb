<template>
    <div class="p-team-my-org p-team-public" v-if="id && accessGranted" v-loading="loading">
        <section
            class="m-public-org__hero"
            :class="{ 'has-banner': publicBanner }"
            :style="publicBanner ? { '--team-banner-image': `url('${publicBanner}')` } : null"
            :aria-label="$t('team.common.teamInfo')"
        >
            <div v-if="loadError" class="m-my-org__error">
                <span>{{ $t("team.workspace.loadFailed") }}</span>
                <button type="button" @click="loadData">{{ $t("team.common.retry") }}</button>
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
                    <el-tab-pane :label="$t('team.workspace.memberManagement')" name="manage-member" lazy v-if="permissions.r_member || isSuper">
                        <template #label>
                            <el-icon><Avatar /></el-icon>
                            <span>{{ $t("team.workspace.memberManagement") }}</span>
                            <i class="u-count" v-if="pendingCount">{{ pendingCount }}</i>
                        </template>
                        <ListMember :id="id" />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.battleManagement')" name="manage-battle" lazy v-if="permissions.r_race || isSuper">
                        <template #label>
                            <el-icon><Trophy /></el-icon>
                            <span>{{ $t("team.workspace.battleManagement") }}</span>
                        </template>
                        <ManageBattle :team-id="id" />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.activityManagement')" name="manage-raid" lazy v-if="permissions.r_raid || isSuper">
                        <template #label>
                            <el-icon><Calendar /></el-icon>
                            <span>{{ $t("team.workspace.activityManagement") }}</span>
                        </template>
                        <ManageRaid :team-id="id" embedded />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.snapshotManagement')" name="manage-snapshot" lazy v-if="permissions.r_snapshot || isSuper">
                        <template #label>
                            <el-icon><Camera /></el-icon>
                            <span>{{ $t("team.workspace.snapshotManagement") }}</span>
                        </template>
                        <SnapshotList :team-id="id" :can-configure-password="isSuper" />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.dkpManagement')" name="manage-dkp" lazy v-if="permissions.r_dkp || isSuper">
                        <template #label>
                            <el-icon><Coin /></el-icon>
                            <span>{{ $t("team.workspace.dkpManagement") }}</span>
                        </template>
                        <ManageDkp :team-id="id" />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.videoManagement')" name="video" lazy v-if="canManageVideo">
                        <template #label>
                            <el-icon><VideoCamera /></el-icon>
                            <span>{{ $t("team.workspace.videoManagement") }}</span>
                        </template>
                        <ManageVideo
                            :key="`manage-video-${id}`"
                            :team-id="id"
                            :can-manage="canManageVideo"
                        />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.teamSettings')" name="setting" lazy v-if="isSuper">
                        <template #label>
                            <el-icon><Setting /></el-icon>
                            <span>{{ $t("team.workspace.teamSettings") }}</span>
                        </template>

                        <nav class="m-workspace-subnav" :aria-label="$t('team.workspace.teamSettings')">
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'basic' }"
                                @click="switchSection('basic')"
                            >
                                {{ $t("team.workspace.basicSettings") }}
                            </button>
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'verify' }"
                                @click="switchSection('verify')"
                            >
                                {{ $t("team.workspace.verification") }}
                            </button>
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'permission' }"
                                @click="switchSection('permission')"
                            >
                                {{ $t("team.workspace.permissions") }}
                            </button>
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'feature' }"
                                @click="switchSection('feature')"
                            >
                                {{ $t("team.workspace.featureSettings") }}
                            </button>
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'other' }"
                                @click="switchSection('other')"
                            >
                                {{ $t("team.workspace.otherSettings") }}
                            </button>
                            <button
                                type="button"
                                :class="{ 'is-active': archiveSection === 'advanced' }"
                                @click="switchSection('advanced')"
                            >
                                {{ $t("team.workspace.advancedSettings") }}
                            </button>
                        </nav>

                        <team-form
                            v-if="archiveSection === 'basic'"
                            ref="teamForm"
                            variant="archive"
                            :data="data"
                            :btn_txt="$t('team.common.update')"
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
                    <el-tab-pane :label="$t('team.workspace.myRoles')" name="overview" lazy>
                        <template #label>
                            <el-icon><User /></el-icon>
                            <span>{{ $t("team.workspace.myRoles") }}</span>
                        </template>
                        <team-role v-if="isLogin" :team_id="id" />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.myBattles')" name="battle" lazy>
                        <template #label>
                            <el-icon><Trophy /></el-icon>
                            <span>{{ $t("team.workspace.myBattles") }}</span>
                        </template>
                        <myBattle :team-id="id" />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.teamActivities')" name="my-raid" lazy>
                        <template #label>
                            <el-icon><Calendar /></el-icon>
                            <span>{{ $t("team.workspace.teamActivities") }}</span>
                        </template>
                        <MyTeamRaid :team-id="id" embedded />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.teamSnapshots')" name="snapshot" lazy>
                        <template #label>
                            <el-icon><Camera /></el-icon>
                            <span>{{ $t("team.workspace.teamSnapshots") }}</span>
                        </template>
                        <SnapshotList :team-id="id" read-only />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.teamDkp')" name="my-dkp" lazy>
                        <template #label>
                            <el-icon><Coin /></el-icon>
                            <span>{{ $t("team.workspace.teamDkp") }}</span>
                        </template>
                        <MyDkp :team-id="id" />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.videos')" name="video" lazy>
                        <template #label>
                            <el-icon><VideoPlay /></el-icon>
                            <span>{{ $t("team.workspace.videos") }}</span>
                        </template>
                        <ViewVideo v-if="done" />
                    </el-tab-pane>

                    <el-tab-pane :label="$t('team.workspace.comments')" name="comment" lazy>
                        <template #label>
                            <el-icon><ChatLineSquare /></el-icon>
                            <span>{{ $t("team.workspace.comments") }}</span>
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
import { getTeam, updateTeam, getTeamPermissions } from "@/service/team/team.js";
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

const MEMBER_TABS = ["overview", "battle", "my-raid", "snapshot", "my-dkp", "video", "comment"];
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
            loadError: false,
            accessGranted: false,
            data: {
                status: 0,
                name: this.$t("team.common.teamName"),
                server: this.$t("team.common.serverName"),
                logo: "",
                desc: this.$t("team.common.teamDescription"),
                uid: 0,
                recruit: "",
                honors: [],
                medals: [],
                tags: [this.$t("team.common.teachable"), this.$t("team.common.fixedTeam")],
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
            return this.isManagementMode
                ? this.$t("team.workspace.managementAria")
                : this.$t("team.workspace.memberAria");
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
                if (!value) return;
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

            if (!legacyState && rawTab === "history") {
                mode = rawSection === "manage" ? "manage" : "member";
                tab = rawSection === "manage" ? "manage-battle" : "battle";
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
                        message: this.$t("team.common.updated"),
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
