<template>
    <div class="v-org-add">
        <h1 class="m-title">
            <i class="el-icon-setting"></i><span class="u-txt">团队设置</span>
            <router-link :to="'/org/' + id" class="u-homepage" v-if="id" target="_blank">
                <i class="el-icon-s-home"></i>
                <span>团队主页</span>
            </router-link>
            <div class="u-op">
                <el-button class="u-transform" type="warning" size="small" icon="Sort" @click="transformTeam"
                    >移交团队</el-button
                >
                <el-button v-if="id" class="u-delete" type="danger" size="small" icon="Delete" @click="deleteTeam"
                    >删除团队</el-button
                >
            </div>
        </h1>
        <el-tabs v-model="tab" type="card">
            <el-tab-pane label="基本信息" name="setting" lazy
                ><div class="m-team-form" v-loading="loading">
                    <el-alert v-if="done" class="u-done" :class="{ on: done }" type="success" show-icon
                        ><template #title
                            >更新成功，<router-link :to="'/org/' + id" v-if="id" target="_blank"
                                >点击查看
                            </router-link></template
                        ></el-alert
                    >
                    <teamform
                        :data="form"
                        @submit="submit"
                        btn_txt="更新"
                        :processing="processing"
                        ref="teamForm"
                    /></div
            ></el-tab-pane>
            <el-tab-pane label="权限管理" name="permission" lazy>
                <EditPermission />
            </el-tab-pane>
            <el-tab-pane label="高级设置" name="config" lazy>
                <EditOrgConfig :team-info="form" />
            </el-tab-pane>
            <el-tab-pane label="其它功能" name="other" lazy>
                <EditOrgOther />
            </el-tab-pane>
        </el-tabs>
        <userpop
            title="移交团队"
            :data="to_uid"
            class="m-team-transform"
            v-model="openTransformDialog"
            @confirm="confirmTransform"
        >
            <div class="u-warning el-alert el-alert--warning is-light">
                <i class="el-icon-warning"></i>当对方没有团队时，可以直接移交。如果对方已有团队， 对方为<a
                    href="/vip/premium?from=team_transform"
                    target="_blank"
                    >专业版账号</a
                >时方可使用本功能
            </div>
            请输入需要移交的用户UID:
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
                v_dkp: 0,
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
                        this.$message.error("没有操作权限");
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
                        message: "更新成功",
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
            this.$alert("确定删除团队的所有数据吗？该操作不可恢复！", "提醒", {
                confirmButtonText: "确定",
                callback: (action) => {
                    if (action == "confirm") {
                        delTeam(this.id).then((res) => {
                            if (res.data.data.effect) {
                                this.$notify({
                                    title: "成功",
                                    message: "删除成功",
                                    type: "success",
                                });
                                // location.reload();
                                this.$router.push("/");
                            } else {
                                this.$notify({
                                    title: "失败",
                                    message: "操作失败",
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
                    title: "错误",
                    message: "不能转交给自己",
                });
                return;
            }
            transformTeam(this.id, this.to_uid).then((res) => {
                this.$message({
                    message: "移交成功",
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
