<template>
    <div class="v-dkp-list">
        <!-- 头部 -->
        <header v-if="!teamId" class="m-dkp-page-header m-select-org-dkp">
            <span class="u-dkp-page-icon" aria-hidden="true">
                <el-icon><Coin /></el-icon>
            </span>
            <div class="u-dkp-page-heading">
                <h1>{{ $t("team.dkp.title") }}</h1>
                <p>{{ $t("team.dkp.description") }}</p>
            </div>
            <el-select
                class="m-select-org"
                v-model.number="org"
                :placeholder="$t('team.dkp.selectTeam')"
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
                <a href="/tool/23786" class="u-help" target="_blank"> <i class="el-icon-info"></i> {{ $t("team.dkp.help") }} </a>
                <el-button
                    v-if="orgs.length"
                    type="warning"
                    class="u-back"
                    size="small"
                    icon="RefreshLeft"
                    :disabled="!isSuperLeader"
                    @click="resetAllDkp"
                    >{{ $t("team.dkp.resetAll") }}</el-button
                >
            </div>
        </header>
        <div v-if="org" class="m-dkp-box">
            <nav class="m-dkp-manage-nav" :aria-label="$t('team.dkp.aria')">
                <button type="button" :class="{ 'is-active': activeTab === 'score' }" @click="switchTab('score')">
                    <i class="el-icon-tickets"></i>
                    <span>{{ $t("team.dkp.current") }}</span>
                </button>
                <button type="button" :class="{ 'is-active': activeTab === 'logs' }" @click="switchTab('logs')">
                    <i class="el-icon-time"></i>
                    <span>{{ $t("team.dkp.history") }}</span>
                </button>
                <button
                    type="button"
                    :class="{ 'is-active': activeTab === 'snapshot' }"
                    @click="switchTab('snapshot')"
                >
                    <i class="el-icon-camera"></i>
                    <span>{{ $t("team.dkp.snapshot") }}</span>
                </button>
                <button
                    v-if="isSuperLeader"
                    type="button"
                    :class="{ 'is-active': activeTab === 'advanced' }"
                    @click="switchTab('advanced')"
                >
                    <i class="el-icon-setting"></i>
                    <span>{{ $t("team.dkp.advanced") }}</span>
                </button>
                <a class="u-dkp-help" href="/tool/23786" target="_blank" rel="noopener noreferrer">
                    <i class="el-icon-document" aria-hidden="true"></i>
                    <span>{{ $t("team.dkp.help") }}</span>
                </a>
            </nav>
            <section v-if="activeTab === 'advanced'" class="m-dkp-advanced" aria-labelledby="dkp-advanced-title">
                <div class="m-dkp-advanced-heading">
                    <span class="u-advanced-icon" aria-hidden="true"><i class="el-icon-setting"></i></span>
                    <div>
                        <h2 id="dkp-advanced-title">{{ $t("team.dkp.advanced") }}</h2>
                        <p>{{ $t("team.dkp.advancedDescription") }}</p>
                    </div>
                </div>
                <div class="m-dkp-danger-card">
                    <div class="u-danger-content">
                        <h3>{{ $t("team.dkp.resetTitle") }}</h3>
                        <p>{{ $t("team.dkp.resetDescription") }}</p>
                        <div class="u-danger-notice">
                            <i class="el-icon-warning-outline" aria-hidden="true"></i>
                            <span>{{ $t("team.dkp.resetNotice") }}</span>
                        </div>
                    </div>
                    <el-button
                        type="danger"
                        icon="RefreshLeft"
                        :disabled="!isSuperLeader"
                        @click="resetAllDkp"
                    >
                        {{ $t("team.dkp.reset") }}
                    </el-button>
                </div>
            </section>
            <component
                v-else
                :is="componentsMaps[activeTab]"
                :org="org"
                :readOnly="activeTab === 'snapshot'"
                :supportDkpSync="true"
            />
        </div>
        <el-alert v-else :title="$t('team.dkp.noPermission')" type="info" show-icon></el-alert>
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
import { Coin } from "@element-plus/icons-vue";
import bus from "@/store/bus";
export default {
    name: "ManageDkp",
    props: {
        teamId: {
            type: [Number, String],
            default: 0,
        },
    },
    data: function () {
        return {
            // 团队
            org: "",
            orgs: [],
            activeTab: "score",
            isSuperLeader: false,
            leaderChecked: false,

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
        allowedTabs() {
            const tabs = ["score", "logs", "snapshot"];
            if (this.isSuperLeader) tabs.push("advanced");
            return tabs;
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
            if (~~this.teamId) {
                this.org = ~~this.teamId;
                return;
            }
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
            this.isSuperLeader = false;
            this.leaderChecked = false;
            if (this.activeTab === "advanced") this.activeTab = "score";
            getTeam(this.org).then((res) => {
                this.isSuperLeader = res.data.data.super == User.getInfo().uid;
                this.leaderChecked = true;
                this.syncTabFromRoute(true);
            });
        },
        switchTab: function (tab) {
            if (!this.allowedTabs.includes(tab)) return;

            this.activeTab = tab;
            if (this.$route.query.subtab === tab) return;

            this.$router
                .replace({
                    query: {
                        ...this.$route.query,
                        subtab: tab,
                    },
                })
                .catch(() => {});
        },
        syncTabFromRoute: function (normalize = false) {
            const subtab = this.$route.query.subtab || "score";
            if (subtab === "advanced" && !this.leaderChecked) return;

            const nextTab = this.allowedTabs.includes(subtab) ? subtab : "score";
            this.activeTab = nextTab;
            if (normalize && subtab !== nextTab) this.switchTab(nextTab);
        },
        // 清空重置
        resetAllDkp: function () {
            if (!this.isSuperLeader) {
                this.$message.warning(this.$t("team.dkp.founderOnly"));
                return;
            }
            this.$alert(this.$t("team.dkp.resetConfirm"), this.$t("team.dkp.resetTitle"), {
                confirmButtonText: this.$t("team.dkp.confirmReset"),
                cancelButtonText: this.$t("team.dkp.cancel"),
                showCancelButton: true,
                type: "warning",
                callback: (action) => {
                    if (action == "confirm") {
                        resetDkp(this.org).then(() => {
                            bus.$emit("resetAllDkp");
                            this.$message({
                                message: this.$t("team.dkp.resetSuccess"),
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
        teamId: {
            handler: function (val) {
                if (~~val) this.org = ~~val;
            },
        },
        org: {
            immediate: true,
            handler: function (val) {
                if (val) {
                    this.checkLeader();
                    this.loadMyTeamMembers();
                }
            },
        },
        "$route.query.subtab": {
            immediate: true,
            handler: function () {
                this.syncTabFromRoute();
            },
        },
    },
    components: {
        "dkp-list": dkp_list,
        "dkp-logs": dkp_logs,
        "snapshot-list": snapshot_list,
        Coin,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/dkp/list_dkp.less";
</style>
