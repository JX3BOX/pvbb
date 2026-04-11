<template>
    <div class="m-team-intro">
        <el-divider content-position="left"
            ><i class="el-icon-data-board"></i> 团队介绍</el-divider
        >
        <div class="m-team-txt u-content">{{ data.desc }}</div>
    </div>
</template>

<script>
export default {
    name: "team_intro",
    props: ['intro'],
    data: function() {
        return {

        };
    },
    computed: {
        data : function (){
            return this.intro
        }
    },
    methods: {},
    mounted: function() {},
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_intro.less";
</style>
