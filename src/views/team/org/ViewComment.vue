<template>
    <div class="m-team-comment">
        <CommonComment :id="id" category="team" :normal="hasRight" />
        <el-alert class="u-tip" :title="$t('team.publicContent.noPermission')" type="warning" show-icon v-if="!hasRight"></el-alert>
    </div>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import CommonComment from "@jx3box/jx3box-ui/src/single/Comment.vue";
export default {
    name: "ViewComment",
    props: ["v", "super", "authority"],
    data: function () {
        return {};
    },
    computed: {
        hasRight: function () {
            return !this.v || ~~this.authority.authority >= ~~this.v;
        },
        id: function () {
            return this.$route.params.id;
        },
    },
    methods: {},
    mounted: function () {},
    components: {
        CommonComment,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_comment.less";
</style>
