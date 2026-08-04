<template>
    <div class="m-team-intro">
        <el-divider content-position="left"
            ><i class="el-icon-data-board"></i> {{ $t("team.publicContent.intro") }}</el-divider
        >
        <div class="m-team-txt u-content" v-if="description">{{ description }}</div>
        <div class="u-null" v-else>
            <i class="el-icon-warning-outline"></i> {{ $t("team.publicIntroEmpty") }}
        </div>
    </div>
</template>

<script>
export default {
    name: "team_intro",
    props: ["intro"],
    data: function () {
        return {};
    },
    computed: {
        description: function () {
            return this.intro?.desc?.trim() || "";
        },
    },
    methods: {},
    mounted: function() {},
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_intro.less";
</style>
