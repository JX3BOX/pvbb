<template>
    <div class="v-plan-add">
        <h1 class="m-title"><i class="el-icon-circle-plus-outline"></i> 创建计划</h1>
        <el-form ref="form" :model="form" label-width="80px" :label-position="position" class="m-plan-form">
            <el-form-item label="活动计划">
                <el-input v-model="form.title" placeholder="标题"></el-input>
            </el-form-item>
            <el-form-item label="活动时间">
                <el-date-picker
                    v-model="form.start_time"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                ></el-date-picker>
            </el-form-item>
            <el-form-item label="所属团队">
                <el-select class="m-plan-select-options" v-model.number="team_id" placeholder="请选择">
                    <el-option v-for="(item, i) in teams" :key="i" :label="item.name" :value="item.ID">
                        <img class="u-plan-select-logo" :src="item.logo" v-if="item.logo" />
                        <img class="u-org-logo" src="@/assets/img/team/null.png" v-else />
                        <span class="u-plan-select-name">{{ item.name }}</span>
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="计划状态">
                <el-switch v-model="form.status" active-color="#13ce66"></el-switch>
                <!-- <el-alert class="u-tip" title="团队活动页可展示最多5个活动计划" type="info" show-icon></el-alert> -->
            </el-form-item>

            <el-form-item label="计划清单">
                <div class="m-plan-form-line" v-for="(item, index) in form.plan" :key="index">
                    <el-input v-model="item.val" class="m-plan-form-input" placeholder="活动事项"></el-input>
                    <el-select v-model="item.activity_id" class="m-plan-form-select" placeholder="关联排表">
                        <el-option label="奶花一队" value="shanghai"></el-option>
                    </el-select>
                    <el-date-picker
                        v-model="item.time"
                        type="datetime"
                        class="m-plan-form-picker"
                        placeholder="选择时间段"
                    ></el-date-picker>
                    <el-button
                        type="danger"
                        class="m-plan-form-btn"
                        icon="Delete"
                        @click.prevent="removeItem(item)"
                    ></el-button>
                </div>
            </el-form-item>
            <el-form-item>
                <el-button class="m-plan-form-addBtn" @click="addItem">
                    <i class="el-icon-plus"></i> 添加计划
                </el-button>
            </el-form-item>
            <el-form-item>
                <div class="m-plan-form-submit">
                    <el-button type="primary" @click="submit">提交</el-button>
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { getMyPowerTeams } from "@/service/team/team.js";
export default {
    name: "AddPlan",
    props: [],
    data: function () {
        return {
            position: window.innerWidth < 768 ? "top" : "left",
            team_id: "",
            teams: [],
            form: {
                id: "",
                title: "",
                start_time: "",
                end_time: "",
                user_id: "",
                version: 1,
                status: 0,
                plan: [
                    {
                        val: "",
                        activity_id: "",
                        time: "",
                    },
                ],
            },
        };
    },
    methods: {
        addItem() {
            this.form.plan.push({
                val: "",
                activity_id: "",
                time: "",
            });
        },
        removeItem(item) {
            var index = this.form.plan.indexOf(item);
            if (index !== -1) {
                this.form.plan.splice(index, 1);
            }
        },
        submit: function () {},
    },
    filters: {},
    mounted: function () {
        getMyPowerTeams("r_member").then((res) => {
            this.teams = res.data.data.list;
        });
    },
    components: {},
};
</script>

<style scope lang="less">
@import "@/assets/css/team/plan/add_plan.less";
</style>

<style lang="less">
.u-plan-select-logo {
    // .fl;
    .size(28px);
    .y;
    .mr(5px);
}
.u-plan-select-name {
    .fz(14px);
}
</style>
