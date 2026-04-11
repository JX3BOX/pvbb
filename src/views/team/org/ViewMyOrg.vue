<template>
    <div class="v-org-view" v-if="id" v-loading="loading">
        <!-- 查看团队信息 -->
        <team-info :info="data" :team_id="id" />

        <!-- 团队内容TAB组 -->
        <el-tabs v-model="tab" type="card" class="m-team-view">
            <el-tab-pane label="我的角色" name="overview" lazy>
                <template #label> <i class="el-icon-user"></i> 我的角色 </template>
                <team-role :team_id="id" />
            </el-tab-pane>

            <el-tab-pane label="我的成绩" name="history" lazy>
                <template #label> <i class="el-icon-medal"></i> 我的战绩 </template>
                <myBattle :team-id="id" />
            </el-tab-pane>

            <el-tab-pane label="成员管理" name="manage-member" lazy v-if="permissions.r_member || isSuper">
                <template #label>
                    <i class="el-icon-user"></i> 团员管理
                    <i class="u-count" v-if="pendingCount">{{ pendingCount }}</i>
                </template>
                <ListMember :id="id" />
            </el-tab-pane>
            <el-tab-pane label="快照管理" name="manage-snapshot" lazy v-if="permissions.r_snapshot || isSuper">
                <template #label> <i class="el-icon-camera"></i> 快照管理 </template>
                <SnapshotList />
            </el-tab-pane>
            <el-tab-pane label="战绩管理" name="battle-record" lazy v-if="permissions.r_raid || isSuper">
                <template #label> <i class="el-icon-trophy"></i> 战绩管理 </template>
                <ManageBattle :team-id="id" />
            </el-tab-pane>
            <el-tab-pane label="视频管理" name="video" lazy v-if="permissions.r_video || isSuper">
                <template #label> <i class="el-icon-video-camera"></i> 视频管理 </template>
                <ManageVideo :super="data.super" />
            </el-tab-pane>
            <!-- <el-tab-pane label="基本设置" name="setting" lazy>
                    <template #label> <i class="el-icon-setting"></i> 基本设置 </template>
                    <team-form :data="data" btn_txt="更新" @submit="submit" ref="teamForm"></team-form>
                </el-tab-pane> -->
            <el-tab-pane label="高级设置" name="advance" lazy v-if="isSuper">
                <template #label> <i class="el-icon-s-operation"></i> 团队设置 </template>
                <team-advanced-setting :data="data"></team-advanced-setting>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import team_info from "@/components/team/org/team_info.vue";
import team_role from "@/components/team/org/team_role.vue";
import SnapshotList from "@/views/team/snapshot/ListSnapshot.vue";
import team_advanced_setting from "@/components/team/org/team_advanced_setting.vue";
import ListMember from "../member/ListMember.vue";
import ManageVideo from "./ManageVideo.vue";
import myBattle from "../battle/myBattle.vue";
import ManageBattle from "../battle/index.vue";

import User from "@jx3box/jx3box-common/js/user.js";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import { getTeam, updateTeam, getTeamPermissions } from "@/service/team/team.js";
import { checkMyAuthority } from "@/service/team/member.js";
export default {
    name: "ViewMyOrg",
    props: [],
    data: function () {
        return {
            tab: "overview",
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
        query: function () {
            return this.$route.query.tab;
        },
        isSuper() {
            return this.data.super == User.getInfo().uid;
        },
        pendingCount() {
            const pendingList = this.$store.state.pendingList;
            const pending = pendingList.find((item) => item.team_id == this.id);

            return pending ? pending?.pending : 0;
        },
        hasPermission() {
            return Object.values(this.permissions).some((v) => v == 1);
        },
        allowedTabs() {
            const tabs = ["overview", "history"];
            if (this.permissions.r_member || this.isSuper) tabs.push("manage-member");
            if (this.permissions.r_snapshot || this.isSuper) tabs.push("manage-snapshot");
            if (this.permissions.r_raid || this.isSuper) tabs.push("battle-record");
            if (this.permissions.r_video || this.isSuper) tabs.push("video");
            if (this.isSuper) tabs.push("advance");
            return tabs;
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
            this.permissionsLoaded = false;
            this.getTeam().then(() => {
                postStat("team", this.id);
                this.done = true;
                this.ensureTabAccessible();
            });
            getTeamPermissions(this.id)
                .then((res) => {
                    Object.keys(this.permissions).forEach((key) => {
                        this.permissions[key] = res.data.data[key];
                    });
                })
                .finally(() => {
                    this.permissionsLoaded = true;
                    this.ensureTabAccessible();
                });
        },
        checkAuthority: function () {
            User.isLogin() &&
                checkMyAuthority(this.id).then((res) => {
                    this.authority = res.data.data;
                });
        },
        checkTab: function () {
            this.tab = this.$route.query.tab || "overview";
            this.ensureTabAccessible();
        },
        ensureTabAccessible: function () {
            if (!this.permissionsLoaded || !this.done) return;
            if (this.allowedTabs.includes(this.tab)) return;
            const fallback = this.allowedTabs[0] || "overview";
            if (this.tab !== fallback) {
                this.tab = fallback;
            }
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
            User.isLogin() && this.checkAuthority();
        },
        submit: function () {
            this.processing = true;
            this.done = false;
            console.log(this.data);
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
    watch: {
        id: {
            immediate: true,
            handler: function (val) {
                val && this.init();
            },
        },
        query: {
            immediate: true,
            handler: function (val) {
                this.tab = val || "overview";
                this.ensureTabAccessible();
            },
        },
        tab: function (val) {
            if (this.$route.query.tab === val) return;
            this.$router.replace({
                query: {
                    ...this.$route.query,
                    tab: val,
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
    components: {
        "team-role": team_role,
        "team-info": team_info,
        // "team-form": team_from,
        "team-advanced-setting": team_advanced_setting,

        SnapshotList,
        ListMember,
        ManageVideo,
        myBattle,
        ManageBattle,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/view_org.less";
</style>
