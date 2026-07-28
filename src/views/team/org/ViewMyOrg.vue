<template>
    <div class="p-team-my-org" v-if="id" v-loading="loading">
        <section class="m-my-org__hero" aria-labelledby="my-org-title">
            <header class="m-my-org__header">
                <div class="m-my-org__intro">
                    <span class="u-my-org-icon" aria-hidden="true">
                        <el-icon><OfficeBuilding /></el-icon>
                    </span>
                    <div class="m-my-org__heading">
                        <h1 id="my-org-title">团队工作台</h1>
                        <p>管理团队成员、战绩、内容与基础设置</p>
                    </div>
                </div>

                <div class="m-my-org__actions">
                    <div class="m-team-switch">
                        <el-select
                            v-model="selectedTeamId"
                            class="u-team-switcher"
                            placeholder="选择团队"
                            :loading="teamsLoading"
                            aria-label="切换当前团队"
                            @change="switchTeam"
                        >
                            <template #prefix>
                                <el-icon><Switch /></el-icon>
                            </template>
                            <el-option
                                v-for="team in teams"
                                :key="team.ID"
                                :label="team.name"
                                :value="String(team.ID)"
                            >
                                <div class="u-team-option">
                                    <img
                                        :src="showTeamLogo(team.logo)"
                                        :alt="`${team.name}团队 Logo`"
                                        @error="handleTeamLogoError"
                                    />
                                    <span>{{ team.name }}</span>
                                    <em v-if="team.super == uid">我创建的</em>
                                </div>
                            </el-option>
                        </el-select>
                    </div>

                    <router-link
                        class="u-my-org-action"
                        :to="`/org/${id}`"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span>查看团队主页</span>
                        <el-icon><ArrowRight /></el-icon>
                    </router-link>
                </div>
            </header>

            <div v-if="loadError" class="m-my-org__error">
                <span>团队信息加载失败，请稍后重试。</span>
                <button type="button" @click="loadData">重新加载</button>
            </div>
            <team-info v-else class="m-my-org__profile" :info="data" :team_id="id" :isMine="true" />
        </section>

        <section v-if="!loadError" class="m-my-org__workspace" aria-label="团队管理功能">
            <el-tabs v-model="tab" class="m-team-view">
                <el-tab-pane label="我的角色" name="overview" lazy>
                    <template #label>
                        <el-icon><User /></el-icon>
                        <span>我的角色</span>
                    </template>
                    <team-role v-if="isLogin" :team_id="id" />
                </el-tab-pane>

                <el-tab-pane label="我的战绩" name="history" lazy>
                    <template #label>
                        <el-icon><Medal /></el-icon>
                        <span>我的战绩</span>
                    </template>
                    <myBattle :team-id="id" />
                </el-tab-pane>

                <el-tab-pane label="我的DKP" name="my-dkp" lazy v-if="isLogin">
                    <template #label>
                        <el-icon><Coin /></el-icon>
                        <span>我的DKP</span>
                    </template>
                    <MyDkp :team-id="id" />
                </el-tab-pane>

                <el-tab-pane label="团员管理" name="manage-member" lazy v-if="permissions.r_member || isSuper">
                    <template #label>
                        <el-icon><Avatar /></el-icon>
                        <span>团员管理</span>
                        <i class="u-count" v-if="pendingCount">{{ pendingCount }}</i>
                    </template>
                    <ListMember :id="id" />
                </el-tab-pane>

                <el-tab-pane label="快照管理" name="manage-snapshot" lazy v-if="permissions.r_snapshot || isSuper">
                    <template #label>
                        <el-icon><Camera /></el-icon>
                        <span>快照管理</span>
                    </template>
                    <SnapshotList />
                </el-tab-pane>

                <el-tab-pane label="DKP管理" name="manage-dkp" lazy v-if="permissions.r_dkp || isSuper">
                    <template #label>
                        <el-icon><Coin /></el-icon>
                        <span>DKP管理</span>
                    </template>
                    <ManageDkp :team-id="id" />
                </el-tab-pane>

                <el-tab-pane label="战绩管理" name="battle-record" lazy v-if="permissions.r_raid || isSuper">
                    <template #label>
                        <el-icon><Trophy /></el-icon>
                        <span>战绩管理</span>
                    </template>
                    <ManageBattle :team-id="id" />
                </el-tab-pane>

                <el-tab-pane label="视频管理" name="video" lazy v-if="permissions.r_video || isSuper">
                    <template #label>
                        <el-icon><VideoCamera /></el-icon>
                        <span>视频管理</span>
                    </template>
                    <ManageVideo :super="data.super" />
                </el-tab-pane>

                <el-tab-pane label="基本设置" name="setting" lazy v-if="isSuper">
                    <template #label>
                        <el-icon><Edit /></el-icon>
                        <span>基本设置</span>
                    </template>
                    <team-form
                        ref="teamForm"
                        :data="data"
                        btn_txt="更新"
                        :processing="processing"
                        @submit="submit"
                    />
                </el-tab-pane>

                <el-tab-pane label="团队认证" name="verify" lazy v-if="isSuper">
                    <template #label>
                        <el-icon><CircleCheck /></el-icon>
                        <span>团队认证</span>
                    </template>
                    <VerifyOrg />
                </el-tab-pane>

                <el-tab-pane label="权限管理" name="permission" lazy v-if="isSuper">
                    <template #label>
                        <el-icon><Key /></el-icon>
                        <span>权限管理</span>
                    </template>
                    <EditPermission />
                </el-tab-pane>

                <el-tab-pane label="高级配置" name="config" lazy v-if="isSuper">
                    <template #label>
                        <el-icon><Tools /></el-icon>
                        <span>高级配置</span>
                    </template>
                    <EditOrgConfig :team-info="data" />
                </el-tab-pane>

                <el-tab-pane label="其他设置" name="other" lazy v-if="isSuper">
                    <template #label>
                        <el-icon><MoreFilled /></el-icon>
                        <span>其他设置</span>
                    </template>
                    <team-advanced-setting
                        class="is-single-setting"
                        :data="data"
                        initial-active="other"
                    />
                </el-tab-pane>
            </el-tabs>
        </section>
    </div>
</template>

<script>
import team_info from "@/components/team/org/team_info.vue";
import team_role from "@/components/team/org/team_role.vue";
import team_form from "@/components/team/org/teamform.vue";
import team_advanced_setting from "@/components/team/org/team_advanced_setting.vue";
import SnapshotList from "@/views/team/snapshot/ListSnapshot.vue";
import VerifyOrg from "@/views/team/org/VerifyOrg.vue";
import EditPermission from "@/views/team/org/EditPermission.vue";
import EditOrgConfig from "@/views/team/org/EditOrgConfig.vue";
import ListMember from "../member/ListMember.vue";
import ManageVideo from "./ManageVideo.vue";
import myBattle from "../battle/myBattle.vue";
import ManageBattle from "../battle/index.vue";
import ManageDkp from "../dkp/ManageDkp.vue";
import MyDkp from "../dkp/MyDkp.vue";

import User from "@jx3box/jx3box-common/js/user.js";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import { getAllMyTeams, getTeam, updateTeam, getTeamPermissions } from "@/service/team/team.js";
import { checkMyAuthority, getPendingCount } from "@/service/team/member.js";
import {
    ArrowRight,
    Avatar,
    Camera,
    CircleCheck,
    Coin,
    Edit,
    Key,
    Medal,
    MoreFilled,
    OfficeBuilding,
    Switch,
    Tools,
    Trophy,
    User as UserIcon,
    VideoCamera,
} from "@element-plus/icons-vue";

export default {
    name: "ViewMyOrg",
    data: function () {
        return {
            tab: "overview",
            selectedTeamId: "",
            teams: [],
            teamsLoading: false,
            teamsLoaded: false,
            loadError: false,
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
                v_dkp: 0,
                v_comment: 0,
            },
            loading: false,
            authority: {
                authority: 0,
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
            done: false,
            processing: false,
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
        query: function () {
            return this.$route.query.tab;
        },
        isSuper: function () {
            return this.data.super == this.uid;
        },
        pendingCount: function () {
            const pendingList = this.$store.state.pendingList;
            const pending = pendingList.find((item) => item.team_id == this.id);
            return pending ? pending?.pending : 0;
        },
        allowedTabs: function () {
            const tabs = ["overview", "history"];
            if (this.isLogin) tabs.push("my-dkp");
            if (this.permissions.r_member || this.isSuper) tabs.push("manage-member");
            if (this.permissions.r_snapshot || this.isSuper) tabs.push("manage-snapshot");
            if (this.permissions.r_dkp || this.isSuper) tabs.push("manage-dkp");
            if (this.permissions.r_raid || this.isSuper) tabs.push("battle-record");
            if (this.permissions.r_video || this.isSuper) tabs.push("video");
            if (this.isSuper) tabs.push("setting", "verify", "permission", "config", "other");
            return tabs;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler: function (value) {
                if (!value) return;
                this.selectedTeamId = String(value);
                this.init();
            },
        },
        query: {
            immediate: true,
            handler: function (value) {
                this.tab = value || "overview";
                this.ensureTabAccessible();
            },
        },
        tab: function (value) {
            if (this.$route.query.tab === value) return;
            this.$router.replace({
                query: {
                    ...this.$route.query,
                    tab: value,
                },
            });
        },
        permissions: {
            deep: true,
            handler: function () {
                this.ensureTabAccessible();
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

            this.loading = true;
            this.loadError = false;
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

            Promise.allSettled([teamRequest, permissionsRequest]).finally(() => {
                this.loading = false;
                this.ensureTabAccessible();
            });
        },
        loadTeams: function () {
            if (this.teamsLoading) return;
            this.teamsLoading = true;

            getAllMyTeams()
                .then((res) => {
                    this.teams = res.data.data || [];
                    this.teams.sort((a, b) => {
                        return a.super == this.uid ? -1 : b.super == this.uid ? 1 : 0;
                    });
                    this.teamsLoaded = true;
                })
                .catch(() => {
                    this.teams = [];
                })
                .finally(() => {
                    this.teamsLoading = false;
                });
        },
        loadPendingCount: function () {
            getPendingCount()
                .then((res) => {
                    this.$store.commit("SET_PENDING_LIST", res.data.data || []);
                })
                .catch(() => {});
        },
        checkAuthority: function () {
            User.isLogin() &&
                checkMyAuthority(this.id)
                    .then((res) => {
                        this.authority = res.data.data;
                    })
                    .catch(() => {});
        },
        ensureTabAccessible: function () {
            if (!this.permissionsLoaded || !this.done) return;
            if (this.allowedTabs.includes(this.tab)) return;

            const fallback = this.allowedTabs[0] || "overview";
            if (this.tab !== fallback) this.tab = fallback;
            if (this.$route.query.tab !== fallback) {
                this.$router.replace({
                    query: {
                        ...this.$route.query,
                        tab: fallback,
                    },
                });
            }
        },
        init: function () {
            this.checkTab();
            this.loadData();
            if (User.isLogin()) {
                if (!this.teamsLoaded) this.loadTeams();
                this.checkAuthority();
                this.loadPendingCount();
            }
        },
        checkTab: function () {
            this.tab = this.$route.query.tab || "overview";
            this.ensureTabAccessible();
        },
        switchTeam: function (teamId) {
            if (!teamId || String(this.id) === String(teamId)) return;
            this.$router.push({
                name: "view_my_org",
                params: {
                    id: teamId,
                },
                query: {
                    ...this.$route.query,
                    tab: this.tab,
                },
            });
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
        showTeamLogo: function (value) {
            return value ? getThumbnail(value, 96, true) : require("@/assets/img/team/team_logo_null.svg");
        },
        handleTeamLogoError: function (event) {
            event.target.src = require("@/assets/img/team/team_logo_null.svg");
        },
    },
    components: {
        "team-role": team_role,
        "team-info": team_info,
        "team-form": team_form,
        "team-advanced-setting": team_advanced_setting,
        ArrowRight,
        Avatar,
        Camera,
        CircleCheck,
        Coin,
        Edit,
        EditOrgConfig,
        EditPermission,
        Key,
        Medal,
        MoreFilled,
        OfficeBuilding,
        SnapshotList,
        Switch,
        Tools,
        ListMember,
        ManageVideo,
        myBattle,
        ManageBattle,
        ManageDkp,
        MyDkp,
        Trophy,
        User: UserIcon,
        VideoCamera,
        VerifyOrg,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/view_my_org.less";
</style>
