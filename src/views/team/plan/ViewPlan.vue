<template>
    <div class="m-team-activity">
        <el-divider content-position="left">
            <i class="el-icon-date"></i> 近期计划
        </el-divider>
        <planItem />
        <router-link class="el-button moreplan" :to="'/plan/' + team_id + '/all'">
            <span class="u-txt">&raquo; 查看更多活动计划</span>
        </router-link>
        <!-- <div class="u-list" v-if="data && data.length">
          <planItem />
        </div>
        <div class="u-null" v-else>
          <i class="el-icon-warning-outline"></i>
          最近没有公开的活动
        </div>-->
        <!-- // TODO
        // 二维码 （现成的组件）
        // 自适应-->
    </div>
</template>

<script>
import planItem from "@/components/team/plan/planItem.vue";
export default {
    name: "ViewPlan",
    props: ['v',"super",'authority'],
    data: function () {
        return {
            data: [],
        };
    },
    computed: {
        team_id : function (){
            return this.$route.params.id
        },
        hasRight : function (){
            return !this.v || ~~this.authority.authority >= ~~this.v
        },
    },
    methods: {},
    mounted: function () {},
    components: { planItem },
};
</script>
<style scoped lang="less">
.moreplan {
    .w(100%);
    .mt(40px);
}
</style>
