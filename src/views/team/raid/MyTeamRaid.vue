<template>
    <div class="v-raid-myteams" :class="{ 'is-embedded': embedded }">
        <h1 v-if="!embedded" class="m-title">
            <i class="el-icon-s-flag"></i>
            <span class="u-txt">{{ $t("team.raid.legacy.myActivities") }}</span>
            <div class="u-op">
                <el-button class="u-join" size="small" icon="Plus" @click="goTeamList">{{ $t("team.raid.legacy.joinTeam") }}</el-button>
                <el-button class="u-back" size="small" icon="Search" @click="goRaidList">{{ $t("team.raid.legacy.lobby") }}</el-button>
            </div>
        </h1>
        <div class="m-raid-joined" v-loading="loading">
            <div class="m-public-raid-toolbar">
                <el-input
                    v-model="search"
                    :placeholder="$t('team.raid.manage.searchPlaceholder')"
                    clearable
                    :aria-label="$t('team.raid.manage.searchAria')"
                ></el-input>
                <span class="u-raid-total">{{ $t("team.raid.manage.total", { count: filteredDisplayData.length }) }}</span>
            </div>
            <div class="m-raid-myteams" v-if="filteredDisplayData.length">
                <div class="m-raid-table">
                    <template v-for="item in filteredDisplayData" :key="item.activity.id">
                        <activity-item
                            :activity="item.activity"
                            :team-info="item.teamInfo"
                            :joined="item.joined"
                            :can-quit="item.joined"
                            :is-home-page="true"
                            @quit="handleQuit"
                        ></activity-item>
                    </template>
                </div>
            </div>
            <div class="m-public-raid-empty" v-else-if="!loading">
                <span class="u-empty-icon" aria-hidden="true"><el-icon><Calendar /></el-icon></span>
                <h3>{{ $t(search ? "team.raid.manage.emptySearch" : "team.raid.legacy.noRecent") }}</h3>
                <p v-if="search">{{ $t("team.raid.manage.retrySearch") }}</p>
            </div>
            <div class="m-raid-myteam-tip">
                <i class="el-icon-warning-outline"></i>
                {{ $t(showAll ? "team.publicContent.recentOnly" : "team.raid.legacy.recentHint") }}
            </div>
        </div>
    </div>
</template>

<script>
import { getMyJoinedTeams } from "@/service/team/member.js";
import { getMemberTeamRaids, getMyTeamRaids } from "@/service/team/raid.js";
import { moment } from "@jx3box/jx3box-common/js/moment";
import ActivityItem from "@/components/team/raid/ActivityItem.vue";
import { Calendar } from "@element-plus/icons-vue";
export default {
    name: "MyTeamRaid",
    props: {
        teamId: {
            type: [Number, String],
            default: 0,
        },
        embedded: {
            type: Boolean,
            default: false,
        },
        showAll: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        ActivityItem,
        Calendar,
    },
    data: function () {
        return {
            teams: [],
            ids: [],
            data: [],
            raids: [],
            loading: false,
            search: "",
        };
    },
    computed: {
        displayData: function () {
            const joinedRaids = (this.data || []).filter((item) => {
                const teamId = item?.raid_team_info?.ID || item?.raid_info?.team_id;
                return !this.teamId || String(teamId) === String(this.teamId);
            });
            const joinedMap = new Map(joinedRaids.map((item) => [String(item.raid_info?.id), item]));

            if (this.showAll) {
                return (this.raids || []).map((activity) => {
                    const joinedItem = joinedMap.get(String(activity.id));
                    return {
                        activity,
                        teamInfo: joinedItem?.raid_team_info || {},
                        joined: !!joinedItem,
                    };
                });
            }

            return joinedRaids.map((item) => ({
                activity: item.raid_info,
                teamInfo: item.raid_team_info,
                joined: true,
            }));
        },
        filteredDisplayData: function () {
            const keyword = this.search.trim().toLowerCase();
            if (!keyword) return this.displayData;
            return this.displayData.filter(({ activity }) => {
                return [activity.name, activity.title, activity.server].some((value) =>
                    String(value || "").toLowerCase().includes(keyword),
                );
            });
        },
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
            const requests = [getMyTeamRaids()];
            if (this.showAll && this.teamId) requests.push(getMemberTeamRaids(this.teamId));

            Promise.all(requests)
                .then(([joinedRes, raidsRes]) => {
                    this.data = joinedRes.data?.data || [];
                    this.raids = raidsRes?.data?.data || [];
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
