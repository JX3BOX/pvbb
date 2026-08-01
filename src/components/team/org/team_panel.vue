<template>
    <div class="m-team-admin">
        <div class="u-feeling">
            <Good
                v-if="showPublicActions && !isRaid"
                class="u-like"
                mode="heart"
                :txt="$t('team.publicActions.praise')"
                :showCount="true"
                :team_id="team_id"
                :count="likes"
            />

            <!-- <template v-if="isAdmin && !isRaid">
                <el-tooltip class="item" effect="dark" content placement="top">
                    <template #content>
                        <div class="m-admin-assessor">
                            <i class="el-icon-s-custom"></i> {{ $t("team.publicActions.verifier") }}
                            <a :href="authorLink(assessor.uid)" target="_blank">{{ assessor.display_name }}</a>
                        </div>
                    </template>
                    <el-button v-if="!status" type="success" icon="CircleCheck" size="small" @click="verifyTeam(1)"
                        >{{ $t("team.publicActions.approve") }}</el-button
                    >
                    <el-button v-else type="info" icon="CircleCheck" size="small" @click="verifyTeam(0)"
                        >{{ $t("team.publicActions.revoke") }}</el-button
                    >
                </el-tooltip>
            </template> -->
        </div>

        <div class="u-panel">
            <router-link v-if="showHomeAction" class="u-team-home-link" :to="`/org/${team_id}`" target="_blank">
                <el-button type="primary" plain icon="HomeFilled" size="small">{{ $t("team.publicActions.homepage") }}</el-button>
            </router-link>
            <el-button
                v-if="showPublicActions && showJoinAction"
                type="primary"
                icon="Right"
                size="small"
                @click="openPop"
            >
                {{ $t("team.publicActions.join") }}
            </el-button>
            <template v-if="!isRaid">
                <el-button v-if="showEditAction" type="primary" plain icon="Edit" size="small" @click="editTeam">
                    {{ $t("team.publicActions.edit") }}
                </el-button>
            </template>
        </div>

        <!-- 加入弹层 -->
        <joinpop :title="$t('team.publicActions.join')" v-model:show="join_pop_visible" :team_id="team_id" />
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
    props: {
        team: {
            type: Object,
            default: () => ({}),
        },
        isRaid: {
            type: Boolean,
            default: false,
        },
        team_id: {
            type: [Number, String],
            default: 0,
        },
        isMine: {
            type: Boolean,
            default: false,
        },
        showManageAction: {
            type: Boolean,
            default: true,
        },
        showPublicActions: {
            type: Boolean,
            default: true,
        },
        showHomeAction: {
            type: Boolean,
            default: false,
        },
        alwaysShowJoinAction: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {
            isAdmin: User.isAdmin(),
            isSuperAdmin: User.isSuperAdmin(),
            uid: User.getInfo().uid,

            likes: 0,
            join_pop_visible: false,
            assessor: {
                name: this.$t("team.publicActions.verifierFallback"),
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
        showJoinAction: function () {
            return this.alwaysShowJoinAction || (!this.isMine && !this.isLeader);
        },
        showEditAction: function () {
            return this.showManageAction && (this.isLeader || this.isSuperAdmin);
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
                                title: this.$t("team.publicActions.failed"),
                                message: this.$t("team.publicActions.duplicateStudio"),
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
                        title: this.$t("team.publicActions.success"),
                        message: this.$t("team.publicActions.operationSuccess"),
                        type: "success",
                    });
                    this.data.status = !!!this.data.status;
                    this.$forceUpdate();
                } else {
                    this.$notify({
                        title: this.$t("team.publicActions.failed"),
                        message: this.$t("team.publicActions.operationFailed"),
                        type: "error",
                    });
                }
            });
        },
        editTeam: function () {
            this.$router.push({
                name: "manage_my_org",
                params: {
                    id: this.team_id,
                },
                query: {
                    tab: "setting",
                    subtab: "basic",
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
