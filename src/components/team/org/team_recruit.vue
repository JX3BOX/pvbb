<template>
    <div class="m-team-recruit">
        <el-divider content-position="left">
            <i class="el-icon-umbrella"></i> 团队招募
        </el-divider>
        <div class="m-team-txt u-content">{{ recruit }}</div>
        <div class="m-team-tags" v-if="tags && tags.length">
            <span
                class="u-tag"
                v-for="(tag, i) in tags"
                :key="i"
                :class="{ love: tag == '可教学' }"
            >{{ tag }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: "team_recruit",
    props: ["recruit", "tags"],
    data: function () {
        return {};
    },
    computed: {
        data: function () {
            return this.recruit;
        },
    },
    methods: {},
    mounted: function () {},
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_recruit.less";
</style>
