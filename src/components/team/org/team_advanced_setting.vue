<template>
    <div class="m-advanced-setting" :class="{ 'is-archive': variant === 'archive' }">
        <div class="m-filter">
            <el-radio-group v-model="active">
                <el-radio-button value="team_info">基本信息</el-radio-button>
                <el-radio-button value="verify">团队认证</el-radio-button>
                <el-radio-button value="permission">权限管理</el-radio-button>
                <el-radio-button value="other">其他</el-radio-button>
            </el-radio-group>
        </div>

        <template v-if="active == 'verify'">
            <VerifyOrg />
        </template>
        <template v-else-if="active == 'team_info'">
            <team-form :data="data" btn_txt="更新" @submit="submit" ref="teamForm"></team-form>
        </template>
        <template v-else-if="active == 'permission'">
            <EditPermission />
        </template>
        <template v-else-if="active == 'other'">
            <template v-if="variant === 'archive'">
                <section class="m-team-operation-card">
                    <header class="m-team-form-section">
                        <h2>团队操作</h2>
                    </header>
                    <div class="m-team-operation-list">
                        <div class="m-team-operation-item">
                            <div class="u-operation-copy">
                                <h3>移交团队</h3>
                                <p>将团队所有权转交给另一位用户，移交后您将不再是团长。</p>
                            </div>
                            <el-button class="u-transform" type="warning" @click="transformTeam">
                                <el-icon><Switch /></el-icon>
                                <span>发起移交</span>
                            </el-button>
                        </div>
                        <div class="m-team-operation-item is-danger">
                            <div class="u-operation-copy">
                                <h3>删除团队</h3>
                                <p>永久删除团队及相关数据，此操作完成后无法恢复。</p>
                            </div>
                            <el-button v-if="id" class="u-delete" type="danger" @click="deleteTeam">
                                <el-icon><Delete /></el-icon>
                                <span>删除团队</span>
                            </el-button>
                        </div>
                    </div>
                </section>
            </template>
            <template v-else>
                <el-divider content-position="left"> <i class="el-icon-setting"></i> 团队操作 </el-divider>
                <div class="u-op">
                    <el-button class="u-transform" type="warning" icon="Sort" @click="transformTeam"
                        >移交团队</el-button
                    >
                    <el-button v-if="id" class="u-delete" type="danger" icon="Delete" @click="deleteTeam"
                        >删除团队</el-button
                    >
                </div>
                <EditNamespace />
            </template>
        </template>

        <userpop
            title="移交团队"
            :data="to_uid"
            :variant="variant"
            confirm-text="确认移交"
            class="m-team-transform"
            v-model="openTransformDialog"
            @confirm="confirmTransform"
        >
            请输入需要移交的用户UID:
        </userpop>
    </div>
</template>

<script>
import VerifyOrg from "@/views/team/org/VerifyOrg.vue";
import EditPermission from "@/views/team/org/EditPermission.vue";
import EditNamespace from "@/views/team/org/EditNamespace.vue";
import userpop from "@/components/team/widget/userpop.vue";
import team_from from "@/components/team/org/teamform.vue";
import { delTeam, transformTeam, updateTeam } from "@/service/team/team.js";
import User from "@jx3box/jx3box-common/js/user.js";
import { Delete, Switch } from "@element-plus/icons-vue";
export default {
    name: "AdvancedSetting",
    props: {
        data: {
            type: Object,
            default: () => ({}),
        },
        initialActive: {
            type: String,
            default: "team_info",
        },
        variant: {
            type: String,
            default: "default",
        },
    },
    components: {
        Delete,
        VerifyOrg,
        EditPermission,
        EditNamespace,
        Switch,
        userpop,
        "team-form": team_from,
    },
    data() {
        return {
            active: this.initialActive || "team_info",

            to_uid: "",
            openTransformDialog: false,
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
    },
    methods: {
        deleteTeam: function () {
            if (this.variant !== "archive") {
                this.$alert("确定删除团队的所有数据吗？该操作不可恢复！", "提醒", {
                    confirmButtonText: "确定",
                    callback: (action) => {
                        if (action === "confirm") this.removeTeam();
                    },
                });
                return;
            }

            return this.$confirm("团队及相关数据将被永久删除，且无法恢复。", "确认删除团队", {
                confirmButtonText: "确认删除",
                cancelButtonText: "取消",
                type: "warning",
                confirmButtonClass: "el-button--danger",
            })
                .then(() => {
                    return this.removeTeam();
                })
                .catch((action) => {
                    if (action !== "cancel" && action !== "close") throw action;
                });
        },
        removeTeam: function () {
            return delTeam(this.id).then((res) => {
                if (res.data.data.effect) {
                    this.$notify({
                        title: "成功",
                        message: this.variant === "archive" ? "团队已删除" : "删除成功",
                        type: "success",
                    });
                    this.$router.push("/");
                } else {
                    this.$notify({
                        title: "失败",
                        message: "操作失败",
                        type: "error",
                    });
                }
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
            return this.$confirm(
                `确认将团队${this.data.name ? `“${this.data.name}”` : ""}移交给 UID ${this.to_uid}？移交后您将不再是团长。`,
                "确认移交团队",
                {
                    confirmButtonText: "确认移交",
                    cancelButtonText: "取消",
                    type: "warning",
                }
            )
                .then(() => {
                    return transformTeam(this.id, this.to_uid);
                })
                .then(() => {
                    this.$message({
                        message: "移交成功",
                        type: "success",
                    });
                })
                .catch((action) => {
                    if (action !== "cancel" && action !== "close") throw action;
                });
        },
        submit: function () {
            this.processing = true;
            this.done = false;
            updateTeam(this.id, this.data)
                .then((res) => {
                    this.$message({
                        message: "更新成功",
                        type: "success",
                    });
                    // eslint-disable-next-line vue/no-mutating-props
                    this.data = res.data.data;
                    this.done = true;
                    this.$refs.teamForm?.submitTv();
                })
                .finally(() => {
                    this.processing = false;
                });
        },
    },
};
</script>

<style lang="less">
@import (reference) "@/assets/css/team/design-system/_tokens.less";

.m-advanced-setting {
    .m-filter {
        .x;
    }

    &.is-archive {
        display: block;
        min-width: 0;
        margin-top: @team-space-3;

        .m-team-operation-card {
            min-width: 0;
        }

        .m-team-operation-list {
            overflow: visible;
        }

        .m-team-operation-item {
            display: grid;
            min-width: 0;
            align-items: center;
            grid-template-columns: minmax(0, 1fr) auto;
            padding: @team-space-3 0;
            gap: @team-space-3;

            & + .m-team-operation-item {
                border-top: 1px solid @team-border-light;
            }

            &.is-danger {
                background: transparent;
            }

            .u-operation-copy {
                min-width: 0;

                h3 {
                    margin: 0;
                    color: @team-text-primary;
                    font-size: 14px;
                    font-weight: 600;
                    line-height: 21px;
                }

                p {
                    margin: 2px 0 0;
                    color: @team-text-muted;
                    font-size: 12px;
                    line-height: 18px;
                }
            }

            .el-button {
                min-width: 104px;
                min-height: 38px;
                margin: 0;
                border-radius: 10px;
                font-weight: 600;
            }
        }
    }
}

@media screen and (max-width: 620px) {
    .m-advanced-setting.is-archive {
        .m-team-operation-item {
            grid-template-columns: minmax(0, 1fr);
            gap: @team-space-2;

            .el-button {
                width: 100%;
            }
        }
    }
}
</style>
