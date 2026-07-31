<template>
    <main class="v-raid-list p-team-activity-center">
        <header class="m-activity-center-hero">
            <div class="u-activity-center-icon" aria-hidden="true">
                <el-icon><Calendar /></el-icon>
            </div>
            <div class="m-activity-center-heading">
                <span>PUBLIC EVENTS</span>
                <h1>活动中心</h1>
                <p>浏览近期公开活动，找到合适的团队并预约参与。</p>
            </div>
            <div class="m-activity-center-actions">
                <el-button class="u-create-activity" type="primary" :loading="loadingTeams" @click="openCreateDialog">
                    <el-icon><Plus /></el-icon>
                    <span>新建活动</span>
                </el-button>
            </div>
        </header>

        <section class="m-activity-center-panel" aria-labelledby="activity-center-list-title">
            <div class="m-raid-filter">
                <div class="m-activity-filter-heading">
                    <div>
                        <h2 id="activity-center-list-title">近期活动</h2>
                        <p>按活动、服务器或日期筛选</p>
                    </div>
                    <span v-if="!loading">共 {{ total }} 个结果</span>
                </div>
                <el-form ref="form" label-position="top" class="m-activity-filter-form">
                    <el-form-item label="活动名称" class="u-name">
                        <el-select v-model="name" placeholder="全部活动">
                            <el-option key="name-all" label="全部" value=""></el-option>
                            <el-option
                                v-for="(item, i) in raidsWithClient"
                                :key="i"
                                :label="item.name"
                                :value="item.name"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="服务器" class="u-server">
                        <el-select v-model="server" placeholder="全部服务器">
                            <el-option
                                :label="item"
                                v-for="item in serversWithClient"
                                :key="item"
                                :value="item"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="搜索活动" class="u-title">
                        <el-input v-model="search" clearable placeholder="搜索活动名称或招募说明">
                            <template #prefix>
                                <el-icon><Search /></el-icon>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="活动日期" class="u-time">
                        <el-select v-model="time" placeholder="全部日期">
                            <el-option label="全部日期" key="all" value="-1"></el-option>
                            <el-option
                                :label="showTimeLable(item)"
                                v-for="(item, i) in dates"
                                :key="i"
                                :value="item.offset"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
            <div class="m-raid-index" v-loading="loading">
                <template v-if="data && data.length">
                    <div class="m-activity-center-list">
                        <raid-list :data="data" :time="time" modern />
                    </div>
                    <el-pagination
                        class="m-raid-pages"
                        background
                        layout="total, prev, pager, next, jumper"
                        :hide-on-single-page="true"
                        :page-size="per"
                        :total="total"
                        :current-page="page"
                        @current-change="changePage"
                    ></el-pagination>
                </template>
                <div v-else-if="!loading" class="m-activity-center-empty">
                    <span aria-hidden="true"><el-icon><Calendar /></el-icon></span>
                    <h2>没有找到符合条件的活动</h2>
                    <p>试试调整活动、服务器或日期筛选。</p>
                </div>
            </div>
        </section>
        <RaidFormDialog v-model="formVisible" :teams="teams" @saved="handleCreated" />
    </main>
</template>

<script>
import serverMap from "@jx3box/jx3box-data/data/server/server_map.json";
import { moment } from "@jx3box/jx3box-common/js/moment";
import { searchRaids, getRaidPresets } from "@/service/team/raid.js";
import { getMyPowerTeams } from "@/service/team/team.js";
import RaidList from "@/components/team/raid/RaidList.vue";
import RaidFormDialog from "@/components/team/raid/RaidFormDialog.vue";
import User from "@jx3box/jx3box-common/js/user";
export default {
    name: "Listraid",
    props: [],
    data: function () {
        return {
            name: "全部",
            server: "全部",
            title: "",
            search: "",
            time: "-1",
            dates: [],

            data: [],
            per: 20,
            page: 1,
            total: 0,
            loading: false,
            requestId: 0,

            raids: [],
            teams: [],
            loadingTeams: false,
            formVisible: false,
        };
    },
    computed: {
        params: function () {
            return {
                client: this.client,
                name: this.name == "全部" ? "" : this.name,
                server: this.server == "全部" ? "" : this.server,
                time: this.time == "全部" ? "-1" : this.time,
                search: this.search,
                page: this.page,
                per: this.per,
                is_public: 1,
            };
        },
        client: function () {
            return this.$store.state.client;
        },
        raidsWithClient: function () {
            const _raids = this.raids;
            return [..._raids];
        },
        serversWithClient: function () {
            const _servers = [];

            for (let name in serverMap) {
                if (serverMap[name].client === this.client) {
                    _servers.push(name);
                }
            }

            return ["全部", ..._servers];
        },
    },
    methods: {
        showRaidWeek: function (d) {
            return moment(d).format("dddd");
        },
        showRaidDate: function (d) {
            return moment(d).format("MM-DD");
        },
        buildDates: function () {
            let dates = [];
            for (let i = 0; i < 7; i++) {
                dates.push({
                    date: this.showRaidDate(new Date(moment().add(i, "days").startOf("day"))),
                    week: this.showRaidWeek(new Date(moment().add(i, "days").startOf("day"))),
                    offset: i,
                });
            }
            this.dates = dates;
        },
        loadRaids: function () {
            const requestId = ++this.requestId;
            this.loading = true;
            searchRaids(this.params)
                .then((res) => {
                    if (requestId !== this.requestId) return;
                    this.data = res.data.data.list || [];
                    this.total = res.data.data.total;
                })
                .finally(() => {
                    if (requestId === this.requestId) this.loading = false;
                });
        },
        changePage: function (page) {
            this.page = page;
            window.scrollTo(0, 0);
        },
        init: function () {
            this.buildDates();
            this.loadRaids();
            this.loadPresets();
        },
        loadPresets: function () {
            getRaidPresets(this.client).then((res) => {
                this.raids = res.data.data;
            });
        },
        loadTeams: function () {
            if (!User.isLogin()) return Promise.resolve();
            this.loadingTeams = true;
            return getMyPowerTeams("r_raid")
                .then((res) => {
                    this.teams = res?.data?.data?.list || [];
                })
                .finally(() => {
                    this.loadingTeams = false;
                });
        },
        openCreateDialog: async function () {
            if (!User.isLogin()) {
                window.location.href = `/account/login?redirect=${encodeURIComponent(window.location.href)}`;
                return;
            }
            if (!this.teams.length) await this.loadTeams();
            if (!this.teams.length) {
                this.$message.warning("你还没有可创建活动的团队权限");
                return;
            }
            this.formVisible = true;
        },
        handleCreated: function () {
            this.formVisible = false;
            this.page = 1;
            this.loadRaids();
        },
        showTimeLable: function (item) {
            let str = "";
            if (!item.offset) {
                str += "今天";
            } else if (item.offset == 1) {
                str += "明天";
            } else {
                str += item.date;
            }
            str += `(${item.week})`;
            return str;
        },
    },
    mounted: function () {
        this.init();
        this.loadTeams();
    },
    watch: {
        params: {
            deep: true,
            handler: function () {
                this.loadRaids();
            },
        },
        name: function () {
            this.page = 1;
        },
        server: function () {
            this.page = 1;
        },
        time: function () {
            this.page = 1;
        },
        search: function () {
            this.page = 1;
        },
    },
    components: {
        "raid-list": RaidList,
        RaidFormDialog,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/list_raid.less";
</style>
