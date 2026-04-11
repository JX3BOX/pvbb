<template>
    <div class="v-plan-list">
        <h1 class="m-title">
            <i class="el-icon-date"></i> 活动规划
            <el-select
                class="m-select-org"
                v-model.number="org"
                placeholder="请选择团队"
                size="medium"
                filterable
                popper-class="m-select-org-options"
            >
                <el-option v-for="(item, i) in orgs" :key="i" :label="item.name" :value="item.ID">
                    <img class="u-org-logo" :src="item.logo" v-if="item.logo" />
                    <img class="u-org-logo" src="@/assets/img/team/null.png" v-else />
                    <span class="u-org-name">{{ item.name }}</span>
                </el-option>
            </el-select>
            <div class="u-op">
                <router-link to="/plan/add" class="el-button el-button--success el-button--mini">
                    <i class="el-icon-circle-plus-outline"></i> 创建计划
                </router-link>
            </div>
        </h1>
        <div class="m-plan-list">
            <div class="m-list-box">
                <div class="m-list-txt">
                    <div class="title">14周一团活动计划</div>
                    <div class="time">计划时间：2020-02-02 至 2020-02-09</div>
                </div>
                <div class="m-list-btn">
                    <el-button type="primary" size="small" icon="Edit">修改</el-button>
                    <el-button type size="small" icon="Delete">删除</el-button>
                </div>
            </div>
            <div class="m-list-box">
                <div class="m-list-txt">
                    <div class="title">15周二团活动计划</div>
                    <div class="time">计划时间：2020-02-02 至 2020-02-09</div>
                </div>
                <div class="m-list-btn">
                    <el-button type="primary" size="small" icon="Edit">修改</el-button>
                    <el-button type size="small" icon="Delete">删除</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getMyPowerTeams } from "@/service/team/team.js";
export default {
    name: "ListPlan",
    props: [],
    data: function () {
        return {
            org: 0,
            orgs: [],
        };
    },
    mounted: function () {
        getMyPowerTeams("r_member").then((res) => {
            this.orgs = res.data.data.list;
            this.org = this.orgs[0]["ID"];
        });
    },
    components: {},
};
</script>

<style scoped lang="less">
@import "@/assets/css/team/plan/list_plan.less";
</style>
