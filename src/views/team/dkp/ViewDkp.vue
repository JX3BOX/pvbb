<template>
    <div class="v-dkp-view">
        <el-divider content-position="left">
            <i class="el-icon-data-line"></i> DKP制度
        </el-divider>
        <div class="m-dkp-rule">{{ rule || "无" }}</div>
        <el-divider content-position="left">
            <i class="el-icon-coin"></i> DKP记录
        </el-divider>
        <div class="m-dkp-overview" v-loading="loading">
            <template v-if="hasRight">
                <el-segmented v-model="tab" :options="tabs" class="m-dkp-segmented">
                    <template #default="{ item }">
                        <span class="u-segmented-label">
                            <i :class="item.icon"></i>
                            {{ item.label }}
                        </span>
                    </template>
                </el-segmented>
                <dkp-list v-if="tab === 'list' && data.length > 0" :org="id" :list="data" :readOnly="true" />
                <dkp-logs v-if="tab === 'logs'" :org="id" />
            </template>
            <template v-else>
                <el-alert class="u-tip" title="没有查看权限" type="warning" show-icon></el-alert>
            </template>
        </div>
    </div>
</template>

<script>
import { getDkpRule, getTeamDkpList } from "@/service/team/dkp.js";
import { getMyTeamUsersNoPager } from "@/service/team/member.js";
import dkp_list from "@/components/team/dkp/dkp_list.vue";
import dkp_logs from "@/components/team/dkp/dkp_logs.vue";
export default {
    name: "ViewDkp",
    props: ["v", "super", "authority"],
    data: function () {
        return {
            rule: "",
            data: [], //dkp情况一览
            loading: false,
            tab: "list",
            tabs: [
                { label: "当前分值", value: "list", icon: "el-icon-tickets" },
                { label: "历史记录", value: "logs", icon: "el-icon-time" },
            ],
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        hasRight: function () {
            return !this.v || ~~this.authority.authority >= ~~this.v;
        },
    },
    methods: {
        init() {
            if (this.hasRight) {
                this.getDkpRule(this.id);
                this.getTeamDkpList(this.id);
                this.loadMyTeamMembers()
            }
        },
        getDkpRule(team_id) {
            return getDkpRule(team_id).then((res) => {
                this.rule = res.data.data && res.data.data.rule;
            });
        },
        getTeamDkpList(team_id) {
            this.loading = true;
            return getTeamDkpList(team_id)
                .then((res) => {
                    this.data = res.data.data;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 获取当前团队的成员列表
        loadMyTeamMembers: function (){
            getMyTeamUsersNoPager(this.id).then(res => {
                this.$store.commit('SET_TEAM_MEMBERS', res.data.data.list)
            })
        },
    },
    watch: {
        hasRight: {
            immediate: true,
            handler: function (value) {
                if (value) this.init();
            },
        },
        id: function () {
            if (this.hasRight) this.init();
        },
    },
    components: {
        "dkp-list": dkp_list,
        "dkp-logs": dkp_logs,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/dkp/view_dkp.less";
</style>
