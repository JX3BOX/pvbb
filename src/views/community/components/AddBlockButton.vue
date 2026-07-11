<template>
    <el-button link :disabled="!allowBlock" type="primary" @click="addBlock" icon="CircleClose">
        {{ $t("pages.community.reply.block") }}
    </el-button>
</template>

<script>
import { addBlock } from "@/service/community";
import User from "@jx3box/jx3box-common/js/user.js";

export default {
    name: "add-block-button",
    props: ["post"],
    computed: {
        isLogin: function () {
            return User.isLogin();
        },
        // 是否允许拉黑
        allowBlock: function () {
            // 登录  && 不是自己
            return this.isLogin && this.post.user_id != User.getInfo().uid;
        },
    },
    methods: {
        // 拉黑
        addBlock: function () {
            this.$confirm(this.$t("pages.community.dialogs.blockConfirm"), this.$t("pages.community.common.promptTitle"), {
                confirmButtonText: this.$t("pages.community.common.confirm"),
                cancelButtonText: this.$t("pages.community.common.cancel"),
                type: "warning",
            })
                .then(() => {
                    addBlock(this.post.user_id)
                        .then(() => {
                            this.$message.success(this.$t("pages.community.messages.blockSuccess"));
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                })
                .catch(() => {});
        },
    },
};
</script>

<style lang="scss" scoped></style>
