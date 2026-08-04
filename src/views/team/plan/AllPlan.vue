<template>
    <div class="m-plan-all">
        <h1 class="m-title"><i class="el-icon-s-order"></i> {{ $t("team.plan.all") }}</h1>
        <div class="m-list-box">
            <div class="m-list-txt">
                <div class="title">{{ $t("team.plan.sampleTitle") }}</div>
                <div class="time">{{ $t("team.plan.samplePeriod", { start: "2020-02-02", end: "2020-02-09" }) }}</div>
            </div>
            <div class="m-list-btn">
                <el-button type="primary" size="small" icon="ArrowDown">{{ $t("team.plan.details") }}</el-button>
            </div>
        </div>
        <planItem />
        <div class="m-list-box">
            <div class="m-list-txt">
                <div class="title">{{ $t("team.plan.sampleTitle") }}</div>
                <div class="time">{{ $t("team.plan.samplePeriod", { start: "2020-02-02", end: "2020-02-09" }) }}</div>
            </div>
            <div class="m-list-btn">
                <el-button type="primary" size="small" icon="ArrowUp">{{ $t("team.plan.details") }}</el-button>
            </div>
        </div>
        <div class="m-list-box">
            <div class="m-list-txt">
                <div class="title">{{ $t("team.plan.sampleTitle") }}</div>
                <div class="time">{{ $t("team.plan.samplePeriod", { start: "2020-02-02", end: "2020-02-09" }) }}</div>
            </div>
            <div class="m-list-btn">
                <el-button type="primary" size="small" icon="Edit">{{ $t("team.plan.details") }}</el-button>
            </div>
        </div>
    </div>
</template>
<script>
import planItem from "@/components/team/plan/planItem.vue";
export default {
    name: "AllPlan",
    props: [],
    data: function () {
        return {};
    },
    computed: {},
    methods: {},
    mounted: function () {},
    components: {
        planItem,
    },
};
</script>
<style scoped lang="less">
@import "@/assets/css/team/plan/list_plan.less";
</style>
