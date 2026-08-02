<template>
    <div class="m-advanced-setting" :class="{ 'is-archive': variant === 'archive' }">
        <div class="m-filter">
            <el-radio-group v-model="active">
                <el-radio-button value="team_info">{{ $t("team.advanced.basic") }}</el-radio-button>
                <el-radio-button value="verify">{{ $t("team.advanced.verification") }}</el-radio-button>
                <el-radio-button value="permission">{{ $t("team.advanced.permissions") }}</el-radio-button>
                <el-radio-button value="other">{{ $t("team.advanced.other") }}</el-radio-button>
            </el-radio-group>
        </div>

        <template v-if="active == 'verify'">
            <VerifyOrg />
        </template>
        <template v-else-if="active == 'team_info'">
            <team-form :data="data" :btn_txt="$t('team.advanced.update')" @submit="submit" ref="teamForm"></team-form>
        </template>
        <template v-else-if="active == 'permission'">
            <EditPermission />
        </template>
        <template v-else-if="active == 'other'">
            <template v-if="variant === 'archive'">
                <section class="m-team-operation-card">
                    <header class="m-team-form-section">
                        <h2>{{ $t("team.advanced.actions") }}</h2>
                    </header>
                    <div class="m-team-operation-list">
                        <div class="m-team-operation-item">
                            <div class="u-operation-copy">
                                <h3>{{ $t("team.advanced.transfer") }}</h3>
                                <p>{{ $t("team.advanced.transferHint") }}</p>
                            </div>
                            <el-button class="u-transform" type="warning" @click="transformTeam">
                                <el-icon><Switch /></el-icon>
                                <span>{{ $t("team.advanced.startTransfer") }}</span>
                            </el-button>
                        </div>
                        <div class="m-team-operation-item is-danger">
                            <div class="u-operation-copy">
                                <h3>{{ $t("team.advanced.deleteTeam") }}</h3>
                                <p>{{ $t("team.advanced.deleteHint") }}</p>
                            </div>
                            <el-button v-if="id" class="u-delete" type="danger" @click="deleteTeam">
                                <el-icon><Delete /></el-icon>
                                <span>{{ $t("team.advanced.deleteTeam") }}</span>
                            </el-button>
                        </div>
                    </div>
                </section>
            </template>
            <template v-else>
                <el-divider content-position="left"> <i class="el-icon-setting"></i> {{ $t("team.advanced.actions") }} </el-divider>
                <div class="u-op">
                    <el-button class="u-transform" type="warning" icon="Sort" @click="transformTeam"
                        >{{ $t("team.advanced.transfer") }}</el-button
                    >
                    <el-button v-if="id" class="u-delete" type="danger" icon="Delete" @click="deleteTeam"
                        >{{ $t("team.advanced.deleteTeam") }}</el-button
                    >
                </div>
                <EditNamespace />
            </template>
        </template>

        <userpop
            :title="$t('team.advanced.transfer')"
            :data="to_uid"
            :variant="variant"
            :confirm-text="$t('team.advanced.confirmTransfer')"
            class="m-team-transform"
            v-model="openTransformDialog"
            @confirm="confirmTransform"
        >
            {{ $t("team.advanced.uidPrompt") }}
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
                this.$alert(this.$t("team.advanced.deleteLegacyConfirm"), this.$t("team.advanced.reminder"), {
                    confirmButtonText: this.$t("team.advanced.confirm"),
                    callback: (action) => {
                        if (action === "confirm") this.removeTeam();
                    },
                });
                return;
            }

            return this.$confirm(this.$t("team.advanced.deleteConfirm"), this.$t("team.advanced.deleteTitle"), {
                confirmButtonText: this.$t("team.advanced.confirmDelete"),
                cancelButtonText: this.$t("team.advanced.cancel"),
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
                        title: this.$t("team.advanced.success"),
                        message: this.variant === "archive" ? this.$t("team.advanced.teamDeleted") : this.$t("team.advanced.deleted"),
                        type: "success",
                    });
                    this.$router.push("/");
                } else {
                    this.$notify({
                        title: this.$t("team.advanced.failed"),
                        message: this.$t("team.advanced.operationFailed"),
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
                    title: this.$t("team.advanced.error"),
                    message: this.$t("team.advanced.selfTransfer"),
                });
                return;
            }
            return this.$confirm(
                this.$t("team.advanced.transferConfirm", { name: this.data.name ? `“${this.data.name}”` : "", uid: this.to_uid }),
                this.$t("team.advanced.transferTitle"),
                {
                    confirmButtonText: this.$t("team.advanced.confirmTransfer"),
                    cancelButtonText: this.$t("team.advanced.cancel"),
                    type: "warning",
                }
            )
                .then(() => {
                    return transformTeam(this.id, this.to_uid);
                })
                .then(() => {
                    this.$message({
                        message: this.$t("team.advanced.transferSuccess"),
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
                        message: this.$t("team.advanced.updated"),
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
