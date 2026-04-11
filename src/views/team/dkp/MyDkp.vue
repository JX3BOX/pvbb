<template>
    <div class="v-dkp-history">
        <h1 class="m-title">
            <i class="el-icon-coin"></i>
            <span class="u-txt">我的DKP</span>
        </h1>
        <div class="m-dkp-box">
            <el-tabs v-model="org" type="card" class="m-dkp-my-tabs">
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
                <el-row :gutter="20">
                    <el-col :span="6">
                        <div class="u-block u-score">
                            <div><i class="el-icon-cherry"></i> 当前分数</div>
                            <div>
                                <b :class="{ isNegative: overview.score < 0 }">{{ overview.score }}</b>
                            </div>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="u-block u-score">
                            <div><i class="el-icon-data-line"></i> 当前排名</div>
                            <div>
                                <b>{{ rank || "-" }}</b>
                            </div>
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <div class="u-block u-total">
                            <div><i class="el-icon-time"></i> 历史累计</div>
                            <div>
                                <b class="u-total">{{ overview.total }}</b>
                            </div>
                        </div>
                    </el-col>
                    <el-col :span="6" class="u-all">
                        <router-link
                            class="u-link el-button el-button--primary is-plain el-button--small"
                            :to="`/org/${org}?tab=dkp`"
                            >查看全团成绩 &raquo;</router-link
                        >
                    </el-col>
                </el-row>
            </div>
            <div class="m-dkp-my-history">
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
export default {
    name: "MyDkp",
    props: [],
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
                this.org = String(this.orgs[0]["team_info"]["ID"]);
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
            this.loadTeams();
        },
    },
    mounted: function () {
        this.init();
    },
    watch: {
        org: function (val) {
            if (~~val) {
                this.loadDkp();
            }
        },
    },
    components: {
        "dkp-logs": dkp_logs,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/dkp/my_dkp.less";
</style>
