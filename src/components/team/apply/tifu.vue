<template>
    <el-form class="u-form" label-width="80px">
        <el-form-item label="游戏大区">
            <el-select v-model="form.zone" placeholder="请选择">
                <el-option v-for="(item, index) in options" :key="index" :label="item" :value="item"> </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="激活账号">
            <el-input v-model.lazy="form.account" placeholder="请填写正确的游戏账号"></el-input>
            <div class="u-tip">* 请填写正确的游戏账号，非角色名！</div>
        </el-form-item>
        <el-form-item label="确认账号">
            <el-input v-model.lazy="form.accounts" placeholder="请再输入一次游戏账号"></el-input>
            <div class="u-tip" v-if="!agreement">* 你输入的账号不一致!</div>
        </el-form-item>
    </el-form>
</template>
<script>
import zones from "@jx3box/jx3box-data/data/server/server_zones.json";
export default {
    name: "express",
    data: function () {
        return {
            options: zones,

            form: {
                zone: "",
                account: "",
                accounts: "",
            },
            agreement: true,
        };
    },
    watch: {
        form: {
            deep: true,
            handler: function ({ zone, account, accounts }) {
                if (zone && account && accounts) {
                    this.agreement = false;
                    if (account == accounts) {
                        this.agreement = true;
                        account = account.replace(" ", "");
                        this.$emit("isEmit", {
                            zone,
                            account,
                        });
                    }
                }
            },
        },
    },
    methods: {
        reset() {
            this.form.zone = "";
            this.form.account = "";
            this.form.accounts = "";
        },
    },
};
</script>
<style scope lang="less">
.u-form .u-tip {
    .color(#f00);
}
</style>
