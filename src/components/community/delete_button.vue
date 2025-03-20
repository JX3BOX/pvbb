<template>
    <el-button type="text" @click="onDeleteClick" v-if="canDelete">
        <i class="el-icon-delete"></i>
        删除
    </el-button>
</template>

<script>
import {
    delMyComment,
    delCommentToMyReply,
    delReplyToMyTopic,
    deleteMyReply,
    manageDelComment,
    manageDelReply,
} from "@/service/community";
import User from "@jx3box/jx3box-common/js/user.js";
export default {
    name: "DeleteButton",
    inject: ["getTopicData", "getReplyList", "getReplyData", "getCommentList", "onSearch"],
    props: ["isMaster", "post", "type"],
    computed: {
        topicData: function() {
            return this.getTopicData();
        },
        replyData: function() {
            return this.getReplyData();
        },
        // 作者
        isAuthor: function() {
            return this.post.user_id == User.getInfo().uid;
        },
        // 是我的帖子的回帖 （我是楼主）
        isReplyToMyTopic: function() {
            return this.type === "reply" && this.topicData.user_id == User.getInfo().uid;
        },
        // 回复我的回帖 （我是层主）
        isCommentToMyReply: function() {
            return this.type === "comment" && this.replyData.user_id == User.getInfo().uid;
        },
        isSuperAdmin() {
            return User.isSuperAdmin() || User.hasPermission("manage_del_post");
        },
        isFollower() {
            return this.post?.user_id == User.getInfo()?.uid;
        },
        canDelete() {
            // 不是 1 楼 且 是超级管理 || 层主 || 楼主
            return !this.isMaster && (this.isSuperAdmin || this.isFollower || this.isTopicAuthor);
        },
        // 是否为楼主
        isTopicAuthor() {
            return this.topicData.user_id == User.getInfo().uid;
        },
    },
    methods: {
        onDeleteClick() {
            // 删除自己的评论与回帖
            if (this.isAuthor || this.isSuperAdmin || this.isTopicAuthor) {
                if (this.type === "comment") {
                    if (this.isAuthor || this.isTopicAuthor) {
                        this.delMyComment();
                    }

                    if (this.isSuperAdmin) {
                        this.manageDeleteComment();
                    }
                } else if (this.type === "reply") {
                    this.isSuperAdmin ? this.manageDeleteReply() : this.deleteMyReply();
                } else {
                    this.$message.success("未知的组件类型：" + this.type);
                }
            } else {
                // 删除回帖我的
                if (this.isReplyToMyTopic) {
                    // console.log("删除回帖我的");
                    this.delReplyToMyTopic();
                }
                // 删除回复我
                if (this.isCommentToMyReply) {
                    // console.log("删除回复我的");
                    this.delCommentToMyReply();
                }
            }
        },
        deleteMyReply: function() {
            this.$confirm("确认是否删除该回帖？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                deleteMyReply(this.post.id).then(() => {
                    this.$message.success("删除成功");
                    // 调用父组件的方法，刷新回到第一页
                    this.onSearch();
                });
            });
        },
        delMyComment: function() {
            this.$confirm("确认是否删除该评论？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                delMyComment(this.post.id).then(() => {
                    this.$message.success("删除成功");
                    this.getCommentList({ index: 1 });
                });
            });
        },
        delReplyToMyTopic: function() {
            this.$confirm("确认是否删除该回帖？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                delReplyToMyTopic(this.topicData.id, this.post.id).then(() => {
                    this.$message.success("删除成功");
                    // 调用父组件的方法，刷新回到第一页
                    this.onSearch();
                });
            });
        },
        delCommentToMyReply: function() {
            this.$confirm("确认是否删除该评论？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                delCommentToMyReply(this.post.topic_reply_id, this.post.id).then(() => {
                    this.$message.success("删除成功");
                    // 调用父组件的方法，刷新回到第一页
                    this.getCommentList({ index: 1 });
                });
            });
        },
        manageDeleteComment: function() {
            this.$confirm("确认是否删除该评论？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                manageDelComment(this.post.id).then(() => {
                    this.$message.success("删除成功");
                    this.getCommentList({ index: 1 });
                });
            });
        },
        manageDeleteReply: function() {
            this.$confirm("确认是否删除该回帖？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                manageDelReply(this.post.id).then(() => {
                    this.$message.success("删除成功");
                    this.onSearch();
                });
            });
        },
    },
};
</script>

<style lang="scss" scoped></style>
