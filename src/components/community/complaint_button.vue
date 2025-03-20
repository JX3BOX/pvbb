<template>
    <el-button type="text" :disabled="!allowReport" @click="onMiscfeedback">
        <i class="el-icon-warning-outline"></i>
        举报
    </el-button>
</template>

<script>
import { feedback } from "@/service/community";
import User from "@jx3box/jx3box-common/js/user.js";
export default {
    name: "ComplaintButton",
    props: ["post"],
    inject: ["getTopicData", "getReplyData"],
    computed: {
        isLogin: function () {
            return User.isLogin();
        },
        // 是否允许举报
        allowReport: function () {
            // 登陆 && 不是自己
            return this.isLogin && this.post.user_id != User.getInfo().uid;
        },
    },
    methods: {
        onMiscfeedback() {
            const topicData = this.getTopicData();
            const replyData = this.getReplyData();
            const userInfo = this.post.user_info || this.post.ext_user_info;
            const user_name = userInfo.display_name;
            const layerNum = replyData.floor || 0;
            const layerStr = layerNum ? layerNum + "楼" : "楼主";

            this.$prompt(`请输入要举报的内容`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                input: "textarea",
                inputPlaceholder: "请输入要举报的内容",
                inputValidator: (value) => {
                    if (!value) {
                        return "内容不能为空!";
                    }
                },
            }).then(({ value }) => {
                const content = `魔盒论坛《${topicData.title}》${layerStr}的${user_name}：${value}`;
                feedback({
                    // 平台
                    client: topicData.client,
                    // 举报内容
                    content,
                    // 是否公开
                    public: 0,
                    // 类型：举报
                    subtype: "3",
                    // 来源：官网
                    type: "1",
                    // 来源地址
                    refer: `/community/${topicData.id}#${layerNum}`,
                }).then(() => {
                    this.$message.success("举报成功");
                });
            });
        },
    },
};
</script>

<style lang="scss" scoped></style>
