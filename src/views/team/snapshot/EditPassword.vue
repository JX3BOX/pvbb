<template>
    <section class="m-team-snapshot-password" :class="{ 'is-archive': variant === 'archive' }">
        <div v-if="variant === 'archive'" class="m-archive-field-label">快照密码</div>
        <el-divider v-else content-position="left"> <i class="el-icon-camera"></i> 快照密码 </el-divider>
        <div class="u-password-box">
            <el-alert
                v-if="variant !== 'archive'"
                :title="
                    '上传团队快照需先设置团队快照密码，密码为6个数字组成'
                "
                type="warning"
                :closable="false"
                show-icon
            ></el-alert>
            <div class="u-password">
                <el-input
                    class="u-input"
                    type="password"
                    v-model="password"
                    :maxlength="6"
                    placeholder="请输入 6 位数字"
                    inputmode="numeric"
                    show-password
                    @input="formatPassword"
                ></el-input>
                <el-button class="u-btn" type="primary" @click="onSubmit" :disabled="!ready" :loading="saving"
                    >{{ variant === "archive" ? "保存密码" : "设置密码" }}</el-button
                >
            </div>
        </div>
    </section>
</template>
<script>
import { putMyTeamsPassword } from "@/service/team/team.js";
export default {
    name: "editPassword",
    props: {
        variant: {
            type: String,
            default: "default",
        },
    },
    data: function () {
        return {
            password: "",
            saving: false,
        };
    },
    computed: {
        ready: function () {
            return /^\d{6}$/.test(this.password);
        },
        id() {
            return ~~this.$route.params.id;
        },
    },
    methods: {
        formatPassword(value) {
            this.password = value.replace(/\D/g, "").slice(0, 6);
        },
        onSubmit() {
            this.saving = true;
            return putMyTeamsPassword(this.id, this.password)
                .then(() => {
                    this.password = "";

                    this.$notify({
                        title: "设置密码成功",
                        type: "success",
                    });
                })
                .finally(() => {
                    this.saving = false;
                });
        },
    },
};
</script>
<style scoped lang="less">
@import (reference) "@/assets/css/team/design-system/_tokens.less";

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

.m-team-snapshot-password.is-archive {
    min-width: 0;
    margin-bottom: @team-space-3;

    .u-password-box {
        width: 100%;
    }

    .u-password {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        padding: 0;
        gap: @team-space-2;

        .u-input {
            width: 100%;
            margin: 0;
        }

        .u-btn {
            min-width: 104px;
            min-height: 40px;
            margin: 0;
            border-radius: 10px;
            font-weight: 600;
        }

        :deep(.el-input__wrapper) {
            min-height: 40px;
            border-radius: 10px;
        }
    }
}

@media screen and (max-width: 520px) {
    .m-team-snapshot-password.is-archive {
        .u-password {
            grid-template-columns: minmax(0, 1fr);

            .u-btn {
                width: 100%;
            }
        }
    }
}
</style>
