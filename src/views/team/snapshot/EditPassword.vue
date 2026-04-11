<template>
    <div class="m-team-snapshot-password">
        <el-divider content-position="left"> <i class="el-icon-camera"></i> 快照密码 </el-divider>
        <div class="u-password-box">
            <el-alert title="上传团队快照需先设置团队快照密码，密码为6个数字组成" type="warning" show-icon></el-alert>
            <div class="u-password">
                <el-input
                    class="u-input"
                    type="password"
                    v-model="password"
                    :maxlength="6"
                    show-word-limit
                    show-password
                ></el-input>
                <el-button class="u-btn" type="primary" @click="onSubmit" :disabled="!ready">设置密码</el-button>
            </div>
        </div>
    </div>
</template>
<script>
import { putMyTeamsPassword } from "@/service/team/team.js";
export default {
    name: "editPassword",
    data: function () {
        return {
            password: "",
        };
    },
    computed: {
        ready: function () {
            let re = /\d{6}/g;
            let result = re.test(this.password);
            return result;
        },
        id() {
            return ~~this.$route.params.id;
        },
    },
    methods: {
        onSubmit() {
            putMyTeamsPassword(this.id, this.password).then(() => {
                this.password = "";

                this.$notify({
                    title: "设置密码成功",
                    type: "success",
                });
            });
        },
    },
};
</script>
<style scoped lang="less">
.m-team-snapshot-password .u-password {
    display: flex;
    align-items: center;
    padding: 20px 10px;
    .u-input {
        width: 240px;
    }
    .u-input,
    .u-btn {
        .mr(10px);
    }
    .u-forget {
        flex-shrink: 0;
        .fz(13px);
        .color(#999);
    }
}
</style>
