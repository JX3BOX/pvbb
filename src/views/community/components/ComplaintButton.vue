<template>
    <el-button link :disabled="!allowReport" type="primary" @click="onMiscfeedback" icon="Warning">{{
        $t("pages.community.reply.report")
    }}</el-button>
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
            const layerStr = layerNum
                ? this.$t("pages.community.dialogs.reportFloor", { floor: layerNum })
                : this.$t("pages.community.dialogs.reportTopicAuthor");

            this.$prompt(
                this.$t("pages.community.dialogs.reportPrompt"),
                this.$t("pages.community.common.promptTitle"),
                {
                confirmButtonText: this.$t("pages.community.common.confirm"),
                cancelButtonText: this.$t("pages.community.common.cancel"),
                input: "textarea",
                inputPlaceholder: this.$t("pages.community.dialogs.reportPlaceholder"),
                inputValidator: (value) => {
                    if (!value) {
                        return this.$t("pages.community.dialogs.reportRequired");
                    }
                },
                }
            ).then(({ value }) => {
                const content = this.$t("pages.community.dialogs.reportContent", {
                    title: topicData.title,
                    layer: layerStr,
                    user: user_name,
                    content: value,
                });
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
                    this.$message.success(this.$t("pages.community.messages.reportSuccess"));
                });
            });
        },
    },
};
</script>

<style lang="scss" scoped></style>
