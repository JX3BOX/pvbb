<template>
    <div class="v-raid-list">
        <h1 class="m-title">
            <i class="el-icon-date"></i>
            <span class="u-txt">活动大厅</span>
            <div class="u-op">
                <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">返回首页</el-button>
            </div>
        </h1>
        <div class="m-raid-index" v-loading="loading">
            <div class="m-raid-filter">
                <el-form ref="form" label-width="100px" label-position="left">
                    <el-form-item label="活动名称" class="u-name">
                        <template #label>
                            <span class="u-label"> <i class="el-icon-data-analysis"></i>活动名称 </span>
                        </template>
                        <el-select v-model="name" placeholder="请选择">
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
                        <template #label>
                            <span class="u-label"> <i class="el-icon-map-location"></i>服务器 </span>
                        </template>
                        <el-select v-model="server" placeholder="请选择">
                            <el-option
                                :label="item"
                                v-for="item in serversWithClient"
                                :key="item"
                                :value="item"
                            ></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="活动时间" class="u-time">
                        <template #label>
                            <span class="u-label"> <i class="el-icon-date"></i>活动时间 </span>
                        </template>
                        <template v-if="isMobile">
                            <el-select v-model="time" placeholder="请选择">
                                <el-option label="全部" key="all" value="-1"></el-option>
                                <el-option
                                    :label="showTimeLable(item)"
                                    v-for="(item, i) in dates"
                                    :key="i"
                                    :value="item.offset"
                                >
                                    <b class="u-sp" v-if="!item.offset">今天</b>
                                    <b class="u-sp" v-if="item.offset == 1">明天</b>
                                    {{ item.date }}
                                    <span class="u-week">({{ item.week }})</span>
                                </el-option>
                            </el-select>
                        </template>
                        <template v-else>
                            <el-radio-group v-model="time" size="small">
                                <el-radio-button label="-1" class="u-radio" border size="small">全部</el-radio-button>
                                <el-radio-button
                                    :label="item.offset"
                                    v-for="(item, i) in dates"
                                    :key="i"
                                    class="u-radio"
                                    border
                                    size="small"
                                >
                                    <b class="u-sp" v-if="!item.offset">今天</b>
                                    <b class="u-sp" v-if="item.offset == 1">明天</b>
                                    {{ item.date }}
                                    <span class="u-week">({{ item.week }})</span>
                                </el-radio-button>
                            </el-radio-group>
                        </template>
                    </el-form-item>
                    <el-form-item label="搜索活动" class="u-title">
                        <template #label>
                            <span class="u-label"> <i class="el-icon-search"></i>搜索活动 </span>
                        </template>
                        <el-input v-model="search" placeholder="输入关键词...">
                            <template #append>
                                <i class="el-icon-position"></i>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template v-if="data && data.length">
                <div v-loading="loading">
                    <raid-list :data="data" :time="time" />
                </div>
                <el-pagination
                    class="m-raid-pages"
                    background
                    layout="total, prev, pager, next,jumper"
                    :hide-on-single-page="true"
                    :page-size="per"
                    :total="total"
                    :current-page="page"
                    @current-change="changePage"
                ></el-pagination>
            </template>
            <el-alert v-else title="没有找到符合条件的记录" type="info" show-icon></el-alert>
        </div>
    </div>
</template>

<script>
import serverMap from "@jx3box/jx3box-data/data/server/server_map.json";
import { moment } from "@jx3box/jx3box-common/js/moment";
import { searchRaids, getRaidPresets } from "@/service/team/raid.js";
import RaidList from "@/components/team/raid/RaidList.vue";
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
            total: 1,
            loading: false,

            position: window.innerWidth < 768 ? "top" : "left",
            isMobile: window.innerWidth < 768,

            raids: [],
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
            this.loading = true;
            searchRaids(this.params)
                .then((res) => {
                    this.data = res.data.data.list || [];
                    this.total = res.data.data.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        goBack: function () {
            this.$router.push("/");
        },
        changePage: function () {
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
    },
    watch: {
        params: {
            deep: true,
            handler: function () {
                this.loadRaids();
            },
        },
    },
    components: {
        "raid-list": RaidList,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/list_raid.less";
</style>
