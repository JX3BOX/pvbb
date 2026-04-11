<template>
    <div class="v-raid-myteams">
        <h1 class="m-title">
            <i class="el-icon-s-flag"></i>
            <span class="u-txt">我的活动</span>
            <div class="u-op">
                <el-button class="u-join" size="small" icon="Plus" @click="goTeamList">加入团队</el-button>
                <el-button class="u-back" size="small" icon="Search" @click="goRaidList">活动大厅</el-button>
            </div>
        </h1>
        <div class="m-raid-joined" v-loading="loading">
            <div class="m-raid-myteams" v-if="data && data.length">
                <div class="m-raid-table">
                    <template v-for="item in data" :key="item.id">
                        <activity-item
                            :activity="item.raid_info"
                            :team-info="item.raid_team_info"
                            :canQuit="true"
                            @quit="handleQuit"
                        ></activity-item>
                    </template>
                </div>
            </div>
            <el-alert class="m-raid-myteams-null" title="没有近期的活动" type="info" show-icon v-else></el-alert>
            <div class="m-raid-myteam-tip"><i class="el-icon-warning-outline"></i> 此处仅显示我报名的近期的活动</div>
        </div>
    </div>
</template>

<script>
import { getMyJoinedTeams } from "@/service/team/member.js";
import { getMyTeamRaids } from "@/service/team/raid.js";
import { moment } from "@jx3box/jx3box-common/js/moment";
import ActivityItem from "@/components/team/raid/ActivityItem.vue";
export default {
    name: "MyTeamRaid",
    props: [],
    components: {
        ActivityItem,
    },
    data: function () {
        return {
            teams: [],
            ids: [],
            data: [],
            loading: false,
        };
    },
    computed: {
        is_guawang: function () {
            return !this.teams?.length;
        },
    },
    watch: {},
    methods: {
        goTeamList: function () {
            this.$router.push("/org/list");
        },
        goRaidList: function () {
            this.$router.push("/raid/list");
        },
        loadTeams: function () {
            return getMyJoinedTeams().then((res) => {
                this.teams = res.data.data || [];
                // 队伍ID序列
                let ids = [];
                this.teams.forEach((item) => {
                    ids.push(item?.team_info?.ID);
                });
                this.ids = ids.join(",");
            });
        },
        showCountColor: function (current, total) {
            if (current == total) {
                return "full";
            } else if (current < total * 0.3) {
                return "rich";
            } else if (current >= total * 0.8) {
                return "warning";
            }
            return "";
        },
        isToday: function (d) {
            return moment(d).format("MM-DD") == moment(new Date()).format("MM-DD");
        },
        loadRaids: function () {
            this.loading = true;
            getMyTeamRaids()
                .then((res) => {
                    this.data = res.data.data;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        subscribe: function (id) {
            this.$router.push(`/raid/${id}`);
        },
        handleQuit(id) {
            this.data = this.data.filter((item) => item.raid_info.id != id);
            debugger;
        },
    },
    filters: {
        showRaidTime: function (d) {
            return moment(d).format("HH:mm");
        },
        showRaidWeek: function (d) {
            return moment(d).format("dddd");
        },
        showRaidMonth: function (d) {
            return moment(d).format("MM");
        },
        showRaidDate: function (d) {
            return moment(d).format("DD");
        },
    },
    created: function () {},
    mounted: function () {
        // this.loadTeams().then(() => {
        this.loadRaids();
        // });
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/list_raid.less";
</style>
