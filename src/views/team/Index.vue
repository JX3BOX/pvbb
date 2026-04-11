<template>
    <div class="v-index">
        <div class="m-index-panel">
            <div class="m-index-panel-block">
                <h2 class="u-title">我是团员</h2>
                <div class="u-list">
                    <router-link to="/role/bind" title="插件绑定角色">
                        <i class="u-icon el-icon-connection"></i>
                        <span class="u-txt">绑定角色</span>
                    </router-link>
                    <!-- <router-link to="/role/add" title="手动添加角色">
                        <i class="u-icon el-icon-circle-plus-outline"></i>
                        <span class="u-txt">添加角色</span>
                    </router-link> -->
                    <router-link to="/role/manage" title="我的角色列表">
                        <i class="u-icon el-icon-user"></i>
                        <span class="u-txt">角色管理</span>
                    </router-link>
                    <router-link to="/role/group">
                        <i class="u-icon el-icon-school"></i>
                        <span class="u-txt">我的团队</span>
                    </router-link>
                    <router-link to="/dkp/my">
                        <i class="u-icon el-icon-coin"></i>
                        <span class="u-txt">我的DKP</span>
                    </router-link>
                    <router-link to="/raid/my">
                        <i class="u-icon el-icon-add-location"></i>
                        <span class="u-txt">报名活动</span>
                    </router-link>
                </div>
            </div>

            <div class="m-index-panel-block">
                <h2 class="u-title">我是团长</h2>
                <div class="u-list">
                    <router-link to="/org/add">
                        <i class="u-icon el-icon-circle-plus-outline"></i>
                        <span class="u-txt">创建团队</span>
                    </router-link>
                    <router-link to="/org/manage/">
                        <i class="u-icon el-icon-setting"></i>
                        <span class="u-txt">团队设置</span>
                    </router-link>
                    <router-link to="/member/list">
                        <i class="u-icon el-icon-news"></i>
                        <span class="u-txt">队员管理</span>
                    </router-link>
                    <router-link to="/dkp/manage">
                        <i class="u-icon el-icon-coin"></i>
                        <span class="u-txt">DKP管理</span>
                    </router-link>
                    <router-link to="/snapshot/list">
                        <i class="u-icon el-icon-camera"></i>
                        <span class="u-txt">团队快照</span>
                    </router-link>
                    <router-link to="/raid/manage">
                        <i class="u-icon el-icon-date"></i>
                        <span class="u-txt">团队活动</span>
                    </router-link>
                </div>
            </div>
        </div>
        <index-slider class="m-index-banner" />
        <div class="m-index-recruit">
            <team-list :limit="8" :isIndex="true" />
        </div>
        <div class="m-index-board">
            <div class="m-team-list-header">
                <h2 class="u-title"><i class="el-icon-date"></i> 活动大厅</h2>
                <el-select
                    class="u-server u-select u-filter"
                    v-model="server"
                    placeholder="选择服务器"
                    size="small"
                    filterable
                >
                    <el-option key="all" label="全部服务器" value></el-option>
                    <el-option v-for="(item,i) in servers" :key="i" :label="item" :value="item"></el-option>
                </el-select>
                <el-input class="u-name u-filter" v-model="search" placeholder="查找活动" size="small">
                    <i class="el-icon-search" slot="append" @click="loadRaids"></i>
                </el-input>
                <router-link class="u-more el-button el-button--primary is-plain el-button--mini" to="/raid/list"
                    >查看更多&raquo;</router-link
                >
            </div>
            <div v-loading="loading">
                <template v-if="data && data.length">
                    <raid-list :data="data" time="全部" :isIndex="true" />
                </template>
                <el-alert v-else title="没有找到符合条件的记录" type="info" show-icon></el-alert>
            </div>
        </div>
    </div>
</template>

<script>
import TeamList from "@/components/team/org/team_list.vue";
import RaidList from "@/components/team/raid/RaidList.vue";
import IndexSlider from "@/components/team/widget/IndexSlider.vue";
import { searchRaids } from "@/service/team/raid.js";
import servers from "@jx3box/jx3box-data/data/server/server_list.json";
export default {
    name: "Index",
    props: [],
    data: function () {
        return {
            servers,
            server: "",
            search: "",
            loading: false,
            data: [],
        };
    },
    computed: {
        params: function () {
            return {
                server: this.server,
                search: this.search,
                time: "-1",
                per: 20,
                is_public: 1,
            };
        },
    },
    methods: {
        loadRaids: function () {
            this.loading = true;
            searchRaids(this.params)
                .then((res) => {
                    this.data = res.data.data.list || [];
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
    watch: {
        params: {
            deep: true,
            handler: function () {
                this.loadRaids();
            },
        },
    },
    mounted: function () {
        this.loadRaids();
    },
    components: {
        "team-list": TeamList,
        "raid-list": RaidList,
        "index-slider": IndexSlider,
    },
};
</script>

<style lang="less">
@import "../assets/css/index.less";
@import "../assets/css/raid/list_raid.less";
</style>
