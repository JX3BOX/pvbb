<template>
    <div class="v-dkp-list">
        <!-- 头部 -->
        <h1 class="m-title m-select-org-dkp">
            <i class="el-icon-coin"></i>
            <span class="u-txt">DKP管理</span>
            <el-select
                class="m-select-org"
                v-model.number="org"
                placeholder="请选择团队"
                popper-class="m-select-org-options"
                v-if="orgs.length"
            >
                <el-option v-for="(item, i) in orgs" :key="i" :label="item.name" :value="item.ID">
                    <img class="u-org-logo" :src="showTeamLogo(item.logo)" v-if="item.logo" />
                    <img class="u-org-logo" src="@/assets/img/team/null.png" v-else />
                    <span class="u-org-name">{{ item.name }}</span>
                </el-option>
            </el-select>
            <div class="u-op">
                <a href="/tool/23786" class="u-help" target="_blank"> <i class="el-icon-info"></i> 帮助文档 </a>
                <el-button
                    v-if="orgs.length"
                    type="warning"
                    class="u-back"
                    size="small"
                    icon="RefreshLeft"
                    :disabled="!isSuperLeader"
                    @click="resetAllDkp"
                    >全部重置</el-button
                >
            </div>
        </h1>
        <div v-if="org" class="m-dkp-box">
            <el-tabs type="card" v-model="activeTab">
                <el-tab-pane label="当前分值" name="score">
                    <template #label> <i class="el-icon-tickets"></i> 当前分值 </template>
                </el-tab-pane>
                <el-tab-pane label="历史记录" name="logs">
                    <template #label> <i class="el-icon-time"></i> 历史记录 </template>
                </el-tab-pane>
                <el-tab-pane label="快照关联" name="snapshot">
                    <template #label> <i class="el-icon-camera"></i> 快照关联 </template>
                </el-tab-pane>
            </el-tabs>
            <keep-alive>
                <component
                    :is="componentsMaps[activeTab]"
                    :org="org"
                    :readOnly="activeTab === 'snapshot'"
                    :supportDkpSync="true"
                />
            </keep-alive>
        </div>
        <el-alert v-else title="你当前没有任何团队的DKP管理权限" type="info" show-icon></el-alert>
    </div>
</template>

<script>
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";

import dkp_list from "@/components/team/dkp/dkp_list.vue";
import dkp_logs from "@/components/team/dkp/dkp_logs.vue";
import { getMyTeamUsersNoPager } from "@/service/team/member.js";
import { getMyPowerTeams } from "@/service/team/team.js";

import snapshot_list from "@/components/team/snapshot/snapshotList.vue";
import { getTeam } from "@/service/team/team.js";
import User from "@jx3box/jx3box-common/js/user";
import { resetDkp } from "@/service/team/dkp.js";
export default {
    name: "ManageDkp",
    props: [],
    data: function () {
        return {
            // 团队
            org: "",
            orgs: [],
            activeTab: "score",
            isSuperLeader: false,

            componentsMaps: {
                score: "dkp-list",
                logs: "dkp-logs",
                snapshot: "snapshot-list",
            },
        };
    },
    computed: {
        teamMembers() {
            return this.$store.state.teamMembers;
        },
    },
    filters: {
        showTeamLogo: function (val) {
            return getThumbnail(val, 84);
        },
    },
    methods: {
        // 加载我参与管理DKP的团队、并设置默认团队
        init() {
            getMyPowerTeams("r_dkp").then((res) => {
                this.orgs = res.data.data.list || [];
                this.org = this.orgs.length && this.orgs[0]["ID"];
            });
        },
        // 获取当前团队的成员列表
        loadMyTeamMembers: function () {
            getMyTeamUsersNoPager(this.org).then((res) => {
                this.$store.commit("SET_TEAM_MEMBERS", res.data.data.list);
            });
        },
        checkLeader: function () {
            getTeam(this.org).then((res) => {
                this.isSuperLeader = res.data.data.super == User.getInfo().uid;
            });
        },
        // 清空重置
        resetAllDkp: function () {
            this.$alert("确定全部清空重置么，此操作将不会删除历史记录，仅归零当前所有成员数值。", "警告", {
                confirmButtonText: "确定",
                callback: (action) => {
                    if (action == "confirm") {
                        resetDkp(this.org).then(() => {
                            this.$bus.$emit("resetAllDkp");
                            this.$message({
                                message: "重置成功",
                                type: "success",
                            });
                        });
                    }
                },
            });
        },
        showTeamLogo: function (val) {
            return getThumbnail(val, 324);
        },
    },
    mounted: function () {
        this.init();
    },
    watch: {
        org: {
            immediate: true,
            handler: function (val) {
                if (val) {
                    this.checkLeader();
                    this.loadMyTeamMembers();
                }
            },
        },
    },
    components: {
        "dkp-list": dkp_list,
        "dkp-logs": dkp_logs,
        "snapshot-list": snapshot_list,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/dkp/list_dkp.less";
</style>
