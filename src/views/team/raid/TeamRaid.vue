<template>
    <div class="v-raid-tlist">
        <el-divider content-position="left"> <i class="el-icon-map-location"></i> 团队活动 </el-divider>
        <template v-if="hasRight">
            <div class="m-raid-table" v-loading="loading">
                <template v-for="item in data">
                    <activity-item :activity="item" :key="item.id" :is-home-page="isHomePage"></activity-item>
                </template>
                <div class="u-tip"><i class="el-icon-warning-outline"></i> 默认仅显示最近7天活动</div>
            </div>
        </template>
        <template v-else>
            <el-alert class="u-tip" title="没有查看权限" type="warning" show-icon></el-alert>
        </template>
    </div>
</template>

<script>
import { getRaids } from "@/service/team/raid.js";
import { moment } from "@jx3box/jx3box-common/js/moment";
import ActivityItem from "@/components/team/raid/ActivityItem.vue";
export default {
    name: "TeamRaid",
    props: ["v", "super", "authority", "isHomePage"],
    data: function () {
        return {
            data: [],
            loading: false,
        };
    },
    computed: {
        team_id: function () {
            return ~~this.$route.params.id;
        },
        hasRight: function () {
            return !this.v || ~~this.authority.authority >= ~~this.v;
        },
    },
    methods: {
        subscribe: function (id) {
            this.$router.push("/raid/" + id);
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
        loadRaids: function () {
            this.loading = true;
            getRaids(this.team_id)
                .then((res) => {
                    this.data = res.data?.data || [];
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        isToday: function (d) {
            return moment(d).format("MM-DD") == moment(new Date()).format("MM-DD");
        },
        init: function () {
            this.hasRight && this.loadRaids();
        },
    },
    mounted: function () {
        this.init();
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
    components: {
        ActivityItem,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/list_raid.less";
</style>
