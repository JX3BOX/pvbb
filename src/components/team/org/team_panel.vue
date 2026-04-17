<template>
    <div class="m-team-admin">
        <div class="u-feeling">
            <Good
                v-if="!isRaid"
                class="u-like"
                mode="heart"
                txt="好评"
                :showCount="true"
                :team_id="team_id"
                :count="likes"
            />

            <!-- <template v-if="isAdmin && !isRaid">
                <el-tooltip class="item" effect="dark" content placement="top">
                    <template #content>
                        <div class="m-admin-assessor">
                            <i class="el-icon-s-custom"></i> 团队认证员：
                            <a :href="authorLink(assessor.uid)" target="_blank">{{ assessor.display_name }}</a>
                        </div>
                    </template>
                    <el-button v-if="!status" type="success" icon="CircleCheck" size="small" @click="verifyTeam(1)"
                        >通过认证</el-button
                    >
                    <el-button v-else type="info" icon="CircleCheck" size="small" @click="verifyTeam(0)"
                        >取消认证</el-button
                    >
                </el-tooltip>
            </template> -->
        </div>

        <div class="u-panel">
            <el-button type="primary" icon="Right" size="small" @click="openPop">加入团队</el-button>
            <template v-if="!isRaid">
                <el-button v-if="isLeader || isSuperAdmin" type="primary" icon="Edit" size="small" @click="editTeam"
                    >编辑团队</el-button
                >
            </template>
        </div>

        <!-- 加入弹层 -->
        <joinpop title="加入团队" v-model="join_pop_visible" :team_id="team_id" />
    </div>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import { authorLink } from "@jx3box/jx3box-common/js/utils";
import Good from "@/components/team/widget/Good.vue";
import joinpop from "@/components/team/member/joinpop.vue";

import { getStat } from "@jx3box/jx3box-common/js/stat.js";
import { checkTeam, delTeam } from "@/service/team/team.js";
import { auditTeam } from "@/service/team/verify.js";
import { getUserInfo } from "@/service/team/server.js";

export default {
    name: "team_panel",
    props: ["team", "isRaid", "team_id"],
    data: function () {
        return {
            isAdmin: User.isAdmin(),
            isSuperAdmin: User.isSuperAdmin(),
            uid: User.getInfo().uid,

            likes: 0,
            join_pop_visible: false,
            assessor: {
                name: "认证管理员",
                uid: "",
            },
        };
    },
    computed: {
        id: function () {
            return this.team_id;
        },
        data: function () {
            return this.team;
        },
        isLeader: function () {
            return this.data.super == this.uid;
        },
        status: function () {
            return !!this.data.status;
        },
    },
    methods: {
        getAssessor: function (uid) {
            uid &&
                getUserInfo(uid).then((res) => {
                    this.assessor = res.data.data;
                });
        },
        verifyTeam: function (status) {
            //认证
            if (status) {
                auditTeam(this.data.name)
                    .then((res) => {
                        if (res.data.data.is_exist) {
                            this.$notify({
                                title: "失败",
                                message: "名称与记录的工作室重名",
                                type: "error",
                            });
                            return false; //是工作室
                        } else {
                            return true; //不是工作室
                        }
                    })
                    .then((valid) => {
                        if (valid) {
                            this.checkTeam(1);
                        }
                    });
            } else {
                //取消认证
                this.checkTeam(0);
            }
        },
        checkTeam: function (status) {
            checkTeam(this.team_id, status).then((res) => {
                if (res.status == 200) {
                    this.$notify({
                        title: "成功",
                        message: "操作成功",
                        type: "success",
                    });
                    this.data.status = !!!this.data.status;
                    this.$forceUpdate();
                } else {
                    this.$notify({
                        title: "失败",
                        message: "操作失败",
                        type: "error",
                    });
                }
            });
        },
        editTeam: function () {
            this.$router.push({
                name: "edit_org",
                params: {
                    id: this.team_id,
                },
            });
        },
        openPop: function () {
            if (User.isLogin()) {
                this.join_pop_visible = true;
            } else {
                User.toLogin();
            }
        },
        authorLink,
    },
    mounted: function () {
        if (this.team_id) {
            if (this.status && !this.isRaid) {
                this.getAssessor(this.data.assessor);
            }
            getStat("team", this.team_id).then((res) => {
                this.likes = res.data.like;
            });
        }
    },
    components: {
        Good,
        joinpop,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_panel.less";
</style>
