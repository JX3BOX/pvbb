<template>
    <div class="v-role-bind">
        <h1 class="m-title">
            <i class="el-icon-connection"></i>
            <span class="u-txt">{{ $t("team.role.bind") }}</span>
            <div class="u-op">
                <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">{{ $t("team.role.back") }}</el-button>
            </div>
        </h1>
        <el-tabs v-model="tab" type="card">
            <el-tab-pane :label="$t('team.role.pluginBind')" name="std">
                <template #label>{{ $t("team.role.pluginBind") }}<span class="u-tab-tip">（{{ $t("team.role.retailOnly") }}）</span></template>
                <div class="m-token" v-loading="loading">
                    <h2 class="u-title">
                        {{ $t("team.role.token") }}
                        <span class="u-desc">{{ $t("team.role.tokenHint") }}</span>
                    </h2>
                    <span class="u-token" :title="$t('team.role.clickCopy')" @click="handleCopy(token)">
                        <i class="el-icon-document-copy"></i>
                        {{ token }}
                    </span>
                </div>
                <div class="m-tutorial">
                    <h2 class="u-title"><i class="el-icon-question"></i> {{ $t("team.role.steps") }}</h2>
                    <p>
                        {{ $t("team.role.step1") }}
                        <br />{{ $t("team.role.step2") }}
                        <br />{{ $t("team.role.step3") }}
                    </p>
                    <img class="u-demo" :src="demo_url" />
                </div>
            </el-tab-pane>
            <el-tab-pane :label="$t('team.role.customCreate')" name="origin">
                <roleform :data="form" @submit="submit" :btn_txt="$t('team.role.create')" :processing="processing" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import { getToken } from "@/service/team/role.js";
import { __ossMirror } from "@/utils/config";
import roleform from "@/components/team/role/roleform.vue";
import { createRole } from "@/service/team/role.js";
export default {
    name: "BindRole",
    props: [],
    data: function () {
        return {
            token: "INVALIDTESTTOKEN",
            demo_url: __ossMirror + "upload/post/2021/7/4/6658485.png",
            loading: false,
            tab: location.href.includes("origin") ? "origin" : "std",

            form: {
                name: "",
                server: (localStorage && localStorage.getItem("team_role_default_server")) || "",
                mount: "0",
                body_type: "1",
                note: "",
                custom: 1,
            },
            processing: false,
        };
    },
    computed: {},
    methods: {
        handleCopy: function (text) {
            this.$copyText(text)
                .then(() => {
                    this.onCopy(text);
                })
                .catch(() => {
                    this.onError();
                });
        },
        onCopy: function (text) {
            this.$notify({
                title: this.$t("team.role.copied"),
                message: text,
                type: "success",
            });
        },
        onError: function () {
            this.$notify.error({
                title: this.$t("team.role.copyFailed"),
                message: this.$t("team.role.copyManually"),
            });
        },
        submit: function () {
            this.processing = true;
            createRole(this.form)
                .then((res) => {
                    this.$message({
                        message: this.$t("team.role.updated"),
                        type: "success",
                    });
                    this.$router.push("/role/manage");
                })
                .finally(() => {
                    this.processing = false;
                });
        },
        goBack: function () {
            this.$router.push("/role/manage");
        },
    },
    mounted: function () {
        this.loading = true;
        getToken()
            .then((res) => {
                this.token = res.data.data.token;
            })
            .finally(() => {
                this.loading = false;
            });
    },
    components: {
        roleform,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/role/bind_role.less";
</style>
