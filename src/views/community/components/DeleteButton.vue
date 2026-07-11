<template>
    <el-button link @click="onDeleteClick" type="primary" v-if="canDelete" icon="Delete">
        {{ $t("pages.community.reply.delete") }}
    </el-button>
</template>

<script>
import {
    delMyComment,
    delCommentToMyReply,
    delReplyToMyTopic,
    manageDelComment,
    manageDelReply,
} from "@/service/community";
import User from "@jx3box/jx3box-common/js/user.js";
export default {
    name: "DeleteButton",
    inject: ["getTopicData", "getReplyList", "getReplyData", "getCommentList", "onSearch"],
    props: ["isMaster", "post", "type"],
    computed: {
        topicData: function () {
            return this.getTopicData();
        },
        replyData: function () {
            return this.getReplyData();
        },
        // 作者
        isAuthor: function () {
            return this.post.user_id == User.getInfo().uid;
        },
        // 回复我的回帖 （我是层主）
        isCommentToMyReply: function () {
            return this.type === "comment" && this.replyData.user_id == User.getInfo().uid;
        },
        isSuperAdmin() {
            return User.isSuperAdmin() || User.hasPermission("manage_del_post");
        },
        canDelete() {
            if (this.isMaster || !User.isLogin()) return false;
            if (this.type === "comment") {
                return this.isSuperAdmin || this.isAuthor || this.isCommentToMyReply;
            }
            if (this.type === "reply") {
                // 非管理员只能调用“删除我的主题下的回帖”接口，因此仅楼主可见。
                return this.isSuperAdmin || this.isTopicAuthor;
            }
            return false;
        },
        // 是否为楼主
        isTopicAuthor() {
            return this.topicData.user_id == User.getInfo().uid;
        },
    },
    methods: {
        onDeleteClick() {
            if (this.type === "comment") {
                if (this.isSuperAdmin) {
                    this.manageDeleteComment();
                } else if (this.isAuthor) {
                    this.delMyComment();
                } else if (this.isCommentToMyReply) {
                    this.delCommentToMyReply();
                }

                return;
            }

            if (this.type === "reply") {
                this.isSuperAdmin ? this.manageDeleteReply() : this.delReplyToMyTopic();
                return;
            }

            this.$message.success(
                this.$t("pages.community.messages.unknownComponentType", { type: this.type })
            );
        },
        delMyComment: function () {
            this.$confirm(
                this.$t("pages.community.dialogs.deleteCommentConfirm"),
                this.$t("pages.community.common.promptTitle"),
                {
                confirmButtonText: this.$t("pages.community.common.confirm"),
                cancelButtonText: this.$t("pages.community.common.cancel"),
                type: "warning",
                }
            ).then(() => {
                delMyComment(this.post.id).then(() => {
                    this.$message.success(this.$t("pages.community.messages.deleteSuccess"));
                    this.getCommentList({ index: 1 });
                });
            });
        },
        delReplyToMyTopic: function () {
            this.$confirm(
                this.$t("pages.community.dialogs.deleteReplyConfirm"),
                this.$t("pages.community.common.promptTitle"),
                {
                confirmButtonText: this.$t("pages.community.common.confirm"),
                cancelButtonText: this.$t("pages.community.common.cancel"),
                type: "warning",
                }
            ).then(() => {
                delReplyToMyTopic(this.topicData.id, this.post.id).then(() => {
                    this.$message.success(this.$t("pages.community.messages.deleteSuccess"));
                    // 调用父组件的方法，刷新回到第一页
                    this.onSearch();
                });
            });
        },
        delCommentToMyReply: function () {
            this.$confirm(
                this.$t("pages.community.dialogs.deleteCommentConfirm"),
                this.$t("pages.community.common.promptTitle"),
                {
                confirmButtonText: this.$t("pages.community.common.confirm"),
                cancelButtonText: this.$t("pages.community.common.cancel"),
                type: "warning",
                }
            ).then(() => {
                delCommentToMyReply(this.post.topic_reply_id, this.post.id).then(() => {
                    this.$message.success(this.$t("pages.community.messages.deleteSuccess"));
                    // 调用父组件的方法，刷新回到第一页
                    this.getCommentList({ index: 1 });
                });
            });
        },
        manageDeleteComment: function () {
            this.$confirm(
                this.$t("pages.community.dialogs.deleteCommentConfirm"),
                this.$t("pages.community.common.promptTitle"),
                {
                confirmButtonText: this.$t("pages.community.common.confirm"),
                cancelButtonText: this.$t("pages.community.common.cancel"),
                type: "warning",
                }
            ).then(() => {
                manageDelComment(this.post.id).then(() => {
                    this.$message.success(this.$t("pages.community.messages.deleteSuccess"));
                    this.getCommentList({ index: 1 });
                });
            });
        },
        manageDeleteReply: function () {
            this.$confirm(
                this.$t("pages.community.dialogs.deleteReplyConfirm"),
                this.$t("pages.community.common.promptTitle"),
                {
                confirmButtonText: this.$t("pages.community.common.confirm"),
                cancelButtonText: this.$t("pages.community.common.cancel"),
                type: "warning",
                }
            ).then(() => {
                manageDelReply(this.post.id).then(() => {
                    this.$message.success(this.$t("pages.community.messages.deleteSuccess"));
                    this.onSearch();
                });
            });
        },
    },
};
</script>

<style lang="scss" scoped></style>
