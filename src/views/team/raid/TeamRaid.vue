<template>
    <div class="v-raid-tlist">
        <template v-if="hasRight">
            <div class="m-public-raid-toolbar">
                <el-input
                    v-model="search"
                    :placeholder="$t('team.raid.manage.searchPlaceholder')"
                    clearable
                    :aria-label="$t('team.raid.manage.searchAria')"
                ></el-input>
                <span class="u-raid-total">{{ $t("team.raid.manage.total", { count: filteredData.length }) }}</span>
            </div>
            <div class="m-raid-table" v-loading="loading">
                <template v-if="filteredData.length">
                    <activity-item
                        v-for="item in filteredData"
                        :key="item.id"
                        :activity="item"
                        :is-home-page="isHomePage"
                    ></activity-item>
                </template>
                <div class="m-public-raid-empty" v-else-if="!loading">
                    <span class="u-empty-icon" aria-hidden="true"><el-icon><Calendar /></el-icon></span>
                    <h3>{{ $t(search ? "team.raid.manage.emptySearch" : "team.publicActivityEmpty") }}</h3>
                    <p v-if="search">{{ $t("team.raid.manage.retrySearch") }}</p>
                </div>
            </div>
        </template>
        <template v-else>
            <el-alert class="u-tip" :title="$t('team.publicContent.noPermission')" type="warning" show-icon></el-alert>
        </template>
    </div>
</template>

<script>
import { getRaids } from "@/service/team/raid.js";
import { moment } from "@jx3box/jx3box-common/js/moment";
import ActivityItem from "@/components/team/raid/ActivityItem.vue";
import { Calendar } from "@element-plus/icons-vue";
export default {
    name: "TeamRaid",
    props: ["v", "super", "authority", "isHomePage"],
    data: function () {
        return {
            data: [],
            loading: false,
            search: "",
        };
    },
    computed: {
        team_id: function () {
            return ~~this.$route.params.id;
        },
        hasRight: function () {
            return !this.v || ~~this.authority.authority >= ~~this.v;
        },
        filteredData: function () {
            const keyword = this.search.trim().toLowerCase();
            if (!keyword) return this.data;
            return this.data.filter((item) => {
                return [item.name, item.title, item.server].some((value) => String(value || "").toLowerCase().includes(keyword));
            });
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
        Calendar,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/list_raid.less";
</style>
