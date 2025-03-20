<template>
    <el-tooltip effect="dark" content="拉入黑洞后仅层主自己可见" placement="top">
        <el-button type="text" v-if="!isMaster" :disabled="!allowBlockHole" @click="addBlockHole()">
            <i class="el-icon-attract"></i>
            黑洞
        </el-button>
    </el-tooltip>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user.js";

export default {
    name: "add-black-hole-button",
    inject: ["getTopicData"],
    props: ["post", "isMaster", "type"],
    computed: {
        topicData: function () {
            return this.getTopicData();
        },
        isLogin: function () {
            return User.isLogin();
        },
        // 是否允许黑洞
        allowBlockHole: function () {
            // 未登录不允许
            if (!this.isLogin) {
                return false;
            }
            // 主楼不允许
            if (this.isMaster) {
                return false;
            }
            // 我自己发的 不可以黑洞
            if (this.post.user_id == User.getInfo().uid) {
                return false;
            }

            // 这是一条回帖  && 我是楼主 可以黑洞
            if (this.type === "reply" && this.topicData.user_id == User.getInfo().uid) {
                return true;
            }

            //  这是一条评论 && 回复的是我 我可以删除
            if (this.type === "comment" && this.post.reply_for_user_id == User.getInfo().uid) {
                return true;
            }

            return false;
        },
    },
    methods: {
        // 拉黑
        addBlockHole: function () {
            this.$confirm("功能暂未开放！", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {})
                .catch((_) => {});
            // this.$confirm("确定要拉黑此人？", "提示", {
            //     confirmButtonText: "确定",
            //     cancelButtonText: "取消",
            //     type: "warning",
            // })
            //     .then(() => {})
            //     .catch((_) => {});
        },
    },
};
</script>

<style lang="scss" scoped></style>
