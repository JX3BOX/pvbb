<template>
    <div class="planTable">
        <div class="m-title">
            <h3>{{list.title}}</h3>
            <div>{{ $t("team.plan.samplePeriod", { start: list.startime, end: list.endtime }) }}</div>
        </div>
        <div class="m-label">
            <div class="m-col">{{ $t("team.plan.exactTime") }}</div>
            <div class="m-col m-txt">{{ $t("team.plan.activityPlan") }}</div>
            <div class="m-col">{{ $t("team.plan.staffing") }}</div>
        </div>
        <div class="m-line" v-for="(item, i) in list.plan" :key="i">
            <div class="m-col">{{ item.time }}</div>
            <div class="m-col m-txt">{{ item.title }}</div>
            <div class="m-col">
                <el-button size="small">{{ $t("team.plan.viewRoster") }}</el-button>
            </div>
        </div>
    </div>
</template>
<script>
//import somemod from '@/components/somemod.vue';
export default {
    name: "planItem",
    props: [],
    data: function () {
        return {
            list: {
                title: this.$t("team.plan.sampleTitle"),
                id: 1,
                startime: "2020-02-02",
                endtime: "2020-02-09",
                plan: [
                    { time: "2016-05-03", title: this.$t("team.plan.sampleItem"), activity_id: 1 },
                    { time: "2016-07-03", title: this.$t("team.plan.sampleRaid"), activity_id: 1 },
                ],
            },
        };
    },
    computed: {},
    methods: {},
    mounted: function () {},
    components: {},
};
</script>

<style scoped lang="less">
@import "@/assets/css/team/plan/table_plan.less";
</style>
