<template>
    <div class="v-snapshot-list">
        <div class="m-snapshot-box">
            <div class="m-filter">
                <el-radio-group v-model="tab">
                    <el-radio-button value="list">全部快照</el-radio-button>
                    <el-radio-button value="stat">团员印象</el-radio-button>
                    <el-radio-button value="chart">快照统计</el-radio-button>
                    <el-radio-button value="password">密码配置</el-radio-button>
                </el-radio-group>
            </div>
            <keep-alive>
                <component :is="componentsMap[tab]" :org="org" />
            </keep-alive>
        </div>
    </div>
</template>
<script>
import snapshotList from "@/components/team/snapshot/snapshotList.vue";
import snapshotStat from "@/components/team/snapshot/snapshotStat.vue";
import snapshotChart from "@/components/team/snapshot/snapshotChart.vue";
import EditPassword from "./EditPassword.vue";

import { getMyPowerTeams } from "@/service/team/team.js";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "ListSnapshot",
    props: [],
    data: function () {
        return {
            tab: "list",

            org: "",
            orgs: [],

            componentsMap: {
                list: "snapshot-list",
                stat: "snapshot-stat",
                chart: "snapshot-chart",
                password: "edit-password",
            },
        };
    },
    computed: {},
    methods: {
        loadTeams() {
            return getMyPowerTeams("r_snapshot").then((res) => {
                this.orgs = res.data.data.list || [];
                this.org = this.orgs.length && this.orgs[0]["ID"];
            });
        },
        init() {
            this.loadTeams();
        },
    },
    mounted: function () {
        this.init();
    },
    filters: {
        showTeamLogo: function (val) {
            return getThumbnail(val, 84);
        },
    },
    components: {
        "snapshot-list": snapshotList,
        "snapshot-stat": snapshotStat,
        "snapshot-chart": snapshotChart,
        "edit-password": EditPassword,
    },
};
</script>

<style lang="less">
.m-snapshot-box {
    .m-filter {
        .x;
        margin-bottom: 20px;
    }
}
</style>
