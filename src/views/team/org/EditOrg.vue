<template>
    <div class="v-org-add">
        <h1 class="m-title">
            <i class="el-icon-setting"></i><span class="u-txt">{{ $t("team.orgLegacy.settings") }}</span>
            <router-link :to="'/org/' + id" class="u-homepage" v-if="id" target="_blank">
                <i class="el-icon-s-home"></i>
                <span>{{ $t("team.orgLegacy.homepage") }}</span>
            </router-link>
            <div class="u-op">
                <el-button class="u-transform" type="warning" size="small" icon="Sort" @click="transformTeam"
                    >{{ $t("team.orgLegacy.transfer") }}</el-button
                >
                <el-button v-if="id" class="u-delete" type="danger" size="small" icon="Delete" @click="deleteTeam"
                    >{{ $t("team.orgLegacy.delete") }}</el-button
                >
            </div>
        </h1>
        <el-tabs v-model="tab" type="card">
            <el-tab-pane :label="$t('team.orgLegacy.basic')" name="setting" lazy
                ><div class="m-team-form" v-loading="loading">
                    <el-alert v-if="done" class="u-done" :class="{ on: done }" type="success" show-icon
                        ><template #title
                            >{{ $t("team.orgLegacy.updated") }}，<router-link :to="'/org/' + id" v-if="id" target="_blank"
                                >{{ $t("team.header.view") }}
                            </router-link></template
                        ></el-alert
                    >
                    <teamform
                        :data="form"
                        @submit="submit"
                        :btn_txt="$t('team.orgLegacy.update')"
                        :processing="processing"
                        ref="teamForm"
                    /></div
            ></el-tab-pane>
            <el-tab-pane :label="$t('team.orgLegacy.permissions')" name="permission" lazy>
                <EditPermission />
            </el-tab-pane>
            <el-tab-pane :label="$t('team.orgLegacy.advanced')" name="config" lazy>
                <EditOrgConfig :team-info="form" />
            </el-tab-pane>
            <el-tab-pane :label="$t('team.orgLegacy.other')" name="other" lazy>
                <EditOrgOther />
            </el-tab-pane>
        </el-tabs>
        <userpop
            :title="$t('team.orgLegacy.transfer')"
            :data="to_uid"
            class="m-team-transform"
            v-model="openTransformDialog"
            @confirm="confirmTransform"
        >
            <div class="u-warning el-alert el-alert--warning is-light">
                <i class="el-icon-warning"></i>{{ $t("team.orgLegacy.transferHint") }}<a
                    href="/vip/premium?from=team_transform"
                    target="_blank"
                    >{{ $t("team.orgLegacy.premium") }}</a
                >
            </div>
            {{ $t("team.orgLegacy.transferUid") }}
        </userpop>
    </div>
</template>

<script>
import { getTeam, updateTeam, delTeam, transformTeam } from "@/service/team/team.js";
import teamform from "@/components/team/org/teamform.vue";
import userpop from "@/components/team/widget/userpop.vue";
import User from "@jx3box/jx3box-common/js/user";
import EditPermission from "@/views/team/org/EditPermission.vue";
import EditOrgOther from "@/views/team/org/EditOrgOther.vue";
import EditOrgConfig from "@/views/team/org/EditOrgConfig.vue";
export default {
    name: "EditOrg",
    props: [],
    data: function () {
        return {
            isVerified: false,

            form: {
                name: "",
                server: "",
                logo: "",
                desc: "",
                recruit: "",
                tv_type: "",
                tv: "",
                v_member: 0,
                v_dkp: 2,
                v_activity: 0,
                v_comment: 0,
                yy_channel: "",
                qq_group: "",
                tags: [],
                wiki: "",
            },

            done: false,
            loading: false,
            processing: false,

            to_uid: "",
            openTransformDialog: false,

            tab: "setting",
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
    },
    methods: {
        loadData: function () {
            this.loading = true;
            getTeam(this.id)
                .then((res) => {
                    if (res.data.data.super != User.getInfo().uid && User.getInfo().group < 128) {
                        this.$message.error(this.$t("team.orgLegacy.noPermission"));
                        return;
                    }

                    this.form = res.data.data;
                    this.isVerified = res.data.data.status;

                    // 提交到store
                    this.$store.state.team = res.data.data;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        submit: function () {
            this.processing = true;
            this.done = false;
            updateTeam(this.id, this.form)
                .then((res) => {
                    this.$message({
                        message: this.$t("team.orgLegacy.updated"),
                        type: "success",
                    });
                    this.form = res.data.data;
                    this.done = true; //停留当前页面显示tips
                    this.$refs.teamForm?.submitTv();
                })
                .finally(() => {
                    this.processing = false;
                });
        },
        deleteTeam: function () {
            this.$alert(this.$t("team.orgLegacy.deleteConfirm"), this.$t("team.orgLegacy.reminder"), {
                confirmButtonText: this.$t("team.raid.common.confirm"),
                callback: (action) => {
                    if (action == "confirm") {
                        delTeam(this.id).then((res) => {
                            if (res.data.data.effect) {
                                this.$notify({
                                    title: this.$t("team.orgLegacy.success"),
                                    message: this.$t("team.orgLegacy.deleted"),
                                    type: "success",
                                });
                                // location.reload();
                                this.$router.push("/");
                            } else {
                                this.$notify({
                                    title: this.$t("team.orgLegacy.failed"),
                                    message: this.$t("team.orgLegacy.operationFailed"),
                                    type: "error",
                                });
                            }
                        });
                    }
                },
            });
        },
        transformTeam: function () {
            this.openTransformDialog = true;
        },
        confirmTransform: function (uid) {
            this.to_uid = uid;
            if (this.to_uid == User.getInfo().uid) {
                this.$notify.error({
                    title: this.$t("team.orgLegacy.error"),
                    message: this.$t("team.orgLegacy.selfTransfer"),
                });
                return;
            }
            transformTeam(this.id, this.to_uid).then((res) => {
                this.$message({
                    message: this.$t("team.orgLegacy.transferSuccess"),
                    type: "success",
                });
            });
        },
    },
    watch: {
        tab: function (val) {
            this.$router.push({
                query: {
                    tab: val,
                },
            });
        },
    },
    mounted: function () {
        this.tab = this.$route.query.tab || "setting";
        this.loadData();
    },
    components: {
        teamform,
        userpop,
        EditPermission,
        EditOrgConfig,
        EditOrgOther,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/add_org.less";
</style>
