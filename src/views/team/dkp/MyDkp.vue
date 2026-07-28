<template>
    <div class="v-dkp-history" :class="{ 'is-embedded': teamId }">
        <header v-if="!teamId" class="m-dkp-page-header">
            <span class="u-dkp-page-icon" aria-hidden="true">
                <el-icon><Coin /></el-icon>
            </span>
            <div>
                <h1>我的DKP</h1>
                <p>查看你在各团队的当前分值、排名与历史变更记录。</p>
            </div>
        </header>
        <header v-else class="m-dkp-embedded-header">
            <div>
                <h2>我的DKP</h2>
                <p>查看你在当前团队的分值、排名、历史累计与每次变更记录。</p>
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
                        <span class="u-org-name">{{ (item.team_info && item.team_info.name) || "未知" }}</span>
                    </template>
                </el-tab-pane>
            </el-tabs>
            <div class="m-dkp-my-overview" v-if="overview" v-loading="overview_loading">
                <div class="u-dkp-stat">
                    <span class="u-stat-icon is-score"><el-icon><TrendCharts /></el-icon></span>
                    <div class="u-stat-content">
                        <span class="u-stat-label">当前分数</span>
                        <b :class="{ isNegative: overview.score < 0 }">{{ overview.score }}</b>
                    </div>
                </div>
                <div class="u-dkp-stat">
                    <span class="u-stat-icon is-rank"><el-icon><Trophy /></el-icon></span>
                    <div class="u-stat-content">
                        <span class="u-stat-label">当前排名</span>
                        <b>{{ rank || "-" }}</b>
                    </div>
                </div>
                <div class="u-dkp-stat">
                    <span class="u-stat-icon is-total"><el-icon><Timer /></el-icon></span>
                    <div class="u-stat-content">
                        <span class="u-stat-label">历史累计</span>
                        <b>{{ overview.total }}</b>
                    </div>
                </div>
                <router-link class="u-all-score" :to="`/org/${org}?tab=dkp`">
                    <span>查看全团成绩</span>
                    <el-icon><ArrowRight /></el-icon>
                </router-link>
            </div>
            <div class="m-dkp-my-history">
                <div class="m-dkp-section-heading">
                    <div>
                        <h3>分值记录</h3>
                        <p>按角色或分数变动类型筛选历史明细</p>
                    </div>
                </div>
                <dkp-logs :user_id="user_id" :org="~~org" :my-roles="orgs" />
            </div>
        </div>
    </div>
</template>

<script>
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { getMyJoinedTeams } from "@/service/team/member.js";
import { getTeamMyDkp, getTeamDkpList } from "@/service/team/dkp.js";
import User from "@jx3box/jx3box-common/js/user";
import dkp_logs from "@/components/team/dkp/dkp_logs.vue";
import { ArrowRight, Coin, Timer, TrendCharts, Trophy } from "@element-plus/icons-vue";
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
                })
                .finally(() => {
                    this.overview_loading = false;
                });
            getTeamDkpList(this.org).then((res) => {
                let list = res.data.data;
                list.sort((a, b) => {
                    return b.score - a.score;
                });
                list.forEach((item, i) => {
                    if (item.user_id == User.getInfo().uid) {
                        this.rank = i + 1;
                    }
                });
            });
        },
        loadDkpLogs: function () {},
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
                this.loadDkp();
            }
        },
    },
    components: {
        "dkp-logs": dkp_logs,
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
