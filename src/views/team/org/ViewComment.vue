<template>
    <div class="m-team-comment">
        <el-divider content-position="left"><i class="el-icon-chat-line-square"></i> 团队留言板</el-divider>
        <Comment :id="id" category="team" :normal="hasRight" />
        <el-alert class="u-tip" title="没有查看权限" type="warning" show-icon v-if="!hasRight"> </el-alert>
    </div>
</template>

<script>

import User from "@jx3box/jx3box-common/js/user";
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
        Comment,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_comment.less";
</style>
