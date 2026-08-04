<template>
    <el-form class="u-form" label-width="80px">
        <el-form-item :label="$t('team.apply.zone')">
            <el-select v-model="form.zone" :placeholder="$t('team.apply.select')">
                <el-option v-for="(item, index) in options" :key="index" :label="item" :value="item"> </el-option>
            </el-select>
        </el-form-item>
        <el-form-item :label="$t('team.apply.account')">
            <el-input v-model.lazy="form.account" :placeholder="$t('team.apply.accountPlaceholder')"></el-input>
            <div class="u-tip">* {{ $t("team.apply.accountHint") }}</div>
        </el-form-item>
        <el-form-item :label="$t('team.apply.confirmAccount')">
            <el-input v-model.lazy="form.accounts" :placeholder="$t('team.apply.confirmPlaceholder')"></el-input>
            <div class="u-tip" v-if="!agreement">* {{ $t("team.apply.mismatch") }}</div>
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
