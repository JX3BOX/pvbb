<template>
    <div class="v-dkp-history" :class="{ 'is-embedded': teamId }">
        <header v-if="!teamId" class="m-dkp-page-header">
            <span class="u-dkp-page-icon" aria-hidden="true">
                <el-icon><Coin /></el-icon>
            </span>
            <div>
                <h1>{{ $t("team.myDkp.title") }}</h1>
                <p>{{ $t("team.myDkp.allTeamsDescription") }}</p>
            </div>
        </header>
        <header v-else class="m-dkp-embedded-header">
            <div>
                <h2>{{ $t("team.myDkp.title") }}</h2>
                <p>{{ $t("team.myDkp.teamDescription") }}</p>
            </div>
        </header>
        <div class="m-dkp-box">
            <el-tabs v-if="!teamId" v-model="org" type="card" class="m-dkp-my-tabs">
                <el-tab-pane :name="String(item.team_info.ID)" v-for="(item, i) in orgs" :key="i">
                    <template #label>
                        <img
                            class="u-org-logo"
                            :src="showTeamLogo(item.team_info.logo)"
                            v-if="item.team_info && item.team_info.logo"
                        />
                        <img class="u-org-logo" src="@/assets/img/team/null.png" v-else />
                        <span class="u-org-name">{{ (item.team_info && item.team_info.name) || $t("team.myDkp.unknownTeam") }}</span>
                    </template>
                </el-tab-pane>
            </el-tabs>
            <template v-if="showAllScores">
                <section class="m-dkp-all-scores" v-loading="allScoresLoading">
                    <header class="m-dkp-all-scores__header">
                        <div>
                            <h3>{{ $t("team.myDkp.teamScores") }}</h3>
                            <p>{{ $t("team.myDkp.teamScoresDescription") }}</p>
                        </div>
                        <button type="button" class="u-back-my-dkp" @click="showAllScores = false">
                            <el-icon><ArrowLeft /></el-icon>
                            <span>{{ $t("team.myDkp.back") }}</span>
                        </button>
                    </header>
                    <dkp-list :org="~~org" :read-only="true" />
                </section>
            </template>
            <template v-else>
                <div class="m-dkp-my-overview" v-if="overview" v-loading="overview_loading">
                    <div class="u-dkp-stat">
                        <span class="u-stat-icon is-score"><el-icon><TrendCharts /></el-icon></span>
                        <div class="u-stat-content">
                            <span class="u-stat-label">{{ $t("team.myDkp.currentScore") }}</span>
                            <b :class="{ isNegative: overview.score < 0 }">{{ overview.score }}</b>
                        </div>
                    </div>
                    <div class="u-dkp-stat">
                        <span class="u-stat-icon is-rank"><el-icon><Trophy /></el-icon></span>
                        <div class="u-stat-content">
                            <span class="u-stat-label">{{ $t("team.myDkp.currentRank") }}</span>
                            <b>{{ rank || "-" }}</b>
                        </div>
                    </div>
                    <div class="u-dkp-stat">
                        <span class="u-stat-icon is-total"><el-icon><Timer /></el-icon></span>
                        <div class="u-stat-content">
                            <span class="u-stat-label">{{ $t("team.myDkp.historicalTotal") }}</span>
                            <b>{{ overview.total }}</b>
                        </div>
                    </div>
                    <button type="button" class="u-all-score" @click="showAllTeamScores">
                        <span>{{ $t("team.myDkp.viewTeamScores") }}</span>
                        <el-icon><ArrowRight /></el-icon>
                    </button>
                </div>
                <div class="m-dkp-my-history">
                    <div class="m-dkp-section-heading">
                        <div>
                            <h3>{{ $t("team.myDkp.scoreHistory") }}</h3>
                            <p>{{ $t("team.myDkp.scoreHistoryDescription") }}</p>
                        </div>
                    </div>
                    <dkp-logs :user_id="user_id" :org="~~org" :my-roles="orgs" />
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { getMyJoinedTeams, getMyTeamUsersNoPager } from "@/service/team/member.js";
import { getTeamMyDkp } from "@/service/team/dkp.js";
import User from "@jx3box/jx3box-common/js/user";
import dkp_logs from "@/components/team/dkp/dkp_logs.vue";
import dkp_list from "@/components/team/dkp/dkp_list.vue";
import { ArrowLeft, ArrowRight, Coin, Timer, TrendCharts, Trophy } from "@element-plus/icons-vue";
export default {
    name: "MyDkp",
    props: {
        teamId: {
            type: [Number, String],
            default: 0,
        },
    },
    data: function () {
        return {
            org: "",
            orgs: [],

            overview: {
                score: 0,
                total: 0,
            },
            rank: "",
            overview_loading: false,

            logs_loading: false,
            user_id: ~~User.getInfo().uid,
            showAllScores: false,
            allScoresLoading: false,
        };
    },
    methods: {
        showTeamLogo: function (val) {
            return getThumbnail(val, 88);
        },
        loadTeams: function () {
            return getMyJoinedTeams().then((res) => {
                this.orgs = res.data.data || [];
                if (~~this.teamId) {
                    this.org = String(this.teamId);
                } else if (this.orgs.length) {
                    this.org = String(this.orgs[0]["team_info"]["ID"]);
                }
            });
        },
        loadDkpOverview: function () {
            if (!~~this.org) return;
            this.overview_loading = true;
            getTeamMyDkp(this.org)
                .then((res) => {
                    this.overview = res.data.data || {
                        score: 0,
                        total: 0,
                    };
                    this.rank = this.overview.rank || "";
                })
                .catch(() => {
                    this.overview = {
                        score: 0,
                        total: 0,
                    };
                    this.rank = "";
                })
                .finally(() => {
                    this.overview_loading = false;
                });
        },
        loadDkpLogs: function () {},
        showAllTeamScores: function () {
            const teamId = ~~this.org;
            if (!teamId) return;

            this.showAllScores = true;
            this.allScoresLoading = true;
            this.$store.commit("SET_TEAM_MEMBERS", []);
            getMyTeamUsersNoPager(teamId)
                .then((res) => {
                    if (teamId === ~~this.org) {
                        this.$store.commit("SET_TEAM_MEMBERS", res.data.data.list || []);
                    }
                })
                .finally(() => {
                    if (teamId === ~~this.org) this.allScoresLoading = false;
                });
        },
        loadDkp: function () {
            this.loadDkpOverview();
            this.loadDkpLogs();
        },
        init: function () {
            if (~~this.teamId) this.org = String(this.teamId);
            this.loadTeams();
        },
    },
    mounted: function () {
        this.init();
    },
    watch: {
        teamId: function (val) {
            if (~~val) this.org = String(val);
        },
        org: function (val) {
            if (~~val) {
                this.showAllScores = false;
                this.loadDkp();
            }
        },
    },
    components: {
        "dkp-logs": dkp_logs,
        "dkp-list": dkp_list,
        ArrowLeft,
        ArrowRight,
        Coin,
        Timer,
        TrendCharts,
        Trophy,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/dkp/my_dkp.less";
</style>
