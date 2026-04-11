<template>
    <div class="planTable">
        <div class="m-title">
            <h3>{{list.title}}</h3>
            <div>（ {{list.startime }} 至 {{list.endtime}} ）</div>
        </div>
        <div class="m-label">
            <div class="m-col">具体时间</div>
            <div class="m-col m-txt">活动计划</div>
            <div class="m-col">人员安排</div>
        </div>
        <div class="m-line" v-for="(item, i) in list.plan" :key="i">
            <div class="m-col">{{ item.time }}</div>
            <div class="m-col m-txt">{{ item.title }}</div>
            <div class="m-col">
                <el-button size="small">查看排表</el-button>
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
                title: "第四周计划安排表",
                id: 1,
                startime: "2020-02-02",
                endtime: "2020-02-09",
                plan: [
                    {
                        time: "2016-05-03",
                        title:
                            "四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划四小团战计划",
                        activity_id: 1,
                    },
                    {
                        time: "2016-07-03",
                        title: "25英雄达摩洞",
                        activity_id: 1,
                    },
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
