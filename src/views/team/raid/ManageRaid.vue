<template>
    <div class="v-raid-list" :class="{ 'is-embedded': embedded }">
        <h1 v-if="!embedded" class="m-title">
            <i class="el-icon-date"></i>
            <span class="u-txt">团队活动</span>
            <div class="u-op">
                <a href="/tool/23805" class="u-help" target="_blank"> <i class="el-icon-info"></i> 帮助文档 </a>
                <router-link
                    target="_blank"
                    to="/raid/add"
                    class="el-button el-button--primary el-button--mini"
                    v-if="orgs.length"
                >
                    <i class="el-icon-circle-plus-outline"></i>
                    创建活动
                </router-link>
            </div>
        </h1>
        <header v-else class="m-raid-embedded-header">
            <div>
                <h2>排表管理</h2>
                <p>创建和维护当前团队的活动排表。</p>
            </div>
            <router-link target="_blank" to="/raid/add" class="el-button el-button--primary el-button--small">
                <i class="el-icon-circle-plus-outline"></i>
                创建活动
            </router-link>
        </header>
        <div class="m-raid-box" v-if="orgs.length">
            <div v-if="!embedded && orgs.length > 1" class="m-raid-tab">
                <el-tabs v-model="team_id" type="card" class="m-raid-card-tabs">
                    <el-tab-pane :name="String(item.ID)" v-for="(item, i) in orgs" :key="i">
                        <template #label>
                            <img class="u-org-logo" :src="getThumbnail(item.logo, 84)" v-if="item.logo" />
                            <img class="u-org-logo" src="@/assets/img/team/null.png" v-else />
                            <span class="u-org-name">{{ item.name || "未知" }}</span>
                        </template>
                    </el-tab-pane>
                </el-tabs>
            </div>

            <div class="m-raid-search">
                <el-input placeholder="输入关键词.." v-model="search">
                    <template #prepend><i class="el-icon-search"></i> 搜索</template>
                    <template #append>
                        <el-button icon="Position"></el-button>
                    </template>
                </el-input>
            </div>

            <div class="m-raid-container" v-loading="loading">
                <div class="m-raid-list" v-if="list && list.length">
                    <raid-item
                        v-for="(item, i) in list"
                        :data="item"
                        :key="item.id"
                        :team_id="team_id"
                        @dropItem="deleteItem(i)"
                        @sticky="setSticky"
                    />
                    <el-pagination
                        class="m-raid-pages"
                        background
                        layout="total, prev, pager, next,jumper"
                        :hide-on-single-page="true"
                        :page-size="per"
                        :total="total"
                        v-model:current-page="page"
                        @current-change="changePage"
                    ></el-pagination>
                </div>

                <el-alert class="m-raid-null" type="info" show-icon v-else>
                    <template #title>
                        暂无任何记录，点击查看
                        <a href="/tool/23805" target="_blank">帮助文档</a>
                    </template>
                </el-alert>
            </div>
        </div>
        <el-alert v-else title="你当前没有任何团队的排表管理权限" type="info" show-icon></el-alert>
    </div>
</template>

<script>
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { manageRaid } from "@/service/team/raid.js";
import { getMyPowerTeams } from "@/service/team/team.js";
import RaidItem from "@/components/team/raid/RaidItem.vue";
import { showBodyType, showSchoolIcon, showSchoolName } from "@/utils/filters";

import localforage from "localforage";

export default {
    name: "ManageRaid",
    props: {
        teamId: {
            type: [Number, String],
            default: 0,
        },
        embedded: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {
            team_id: "",
            orgs: [],

            list: [],
            page: 1,
            per: 10,
            total: 1,
            loading: false,

            search: "",
        };
    },
    computed: {
        params: function () {
            return {
                page: this.page,
                per: this.per,
                search: this.search,
            };
        },
    },
    methods: {
        loadTeams() {
            return getMyPowerTeams("r_raid").then(async (res) => {
                const orgs = res.data.data.list || [];
                if (~~this.teamId) {
                    const current = orgs.find((item) => ~~item.ID === ~~this.teamId);
                    this.orgs = current ? [current] : [];
                    this.team_id = current ? String(current.ID) : "";
                    return;
                }
                this.orgs = orgs;
                this.team_id = this.orgs[0]?.ID ? String(this.orgs[0].ID) : "";
            });
        },
        loadData() {
            this.loading = true;
            return manageRaid(this.team_id, this.params)
                .then((res) => {
                    this.list = res.data.data.list || [];
                    this.total = res.data.data.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        deleteItem: function (i) {
            this.list.splice(i, 1);
        },
        changeTeam: function () {
            // 将当前团队的信息保存在localStorage
            const currentTeam = this.orgs.find((org) => String(org.ID) === String(this.team_id));
            if (currentTeam) {
                localforage.setItem("currentTeam", currentTeam);
            }
        },
        changePage: function () {
            window.scrollTo(0, 0);
        },
        init() {
            this.loadTeams();
        },
        setSticky() {
            if (this.page !== 1) {
                this.page = 1;
            } else {
                this.loadData();
            }
        },
        showTeamLogo: function (val) {
            return getThumbnail(val, 84);
        },
    },
    mounted: function () {
        this.init();
    },
    watch: {
        teamId: function (value) {
            if (~~value) this.loadTeams();
        },
        params: {
            deep: true,
            handler: function () {
                this.loadData();
            },
        },
        team_id: {
            handler: function (val) {
                if (val) this.loadData();
            },
        },
    },
    components: {
        RaidItem,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/manage_raid.less";
</style>
