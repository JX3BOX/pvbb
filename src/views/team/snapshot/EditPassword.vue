<template>
    <section class="m-team-snapshot-password" :class="{ 'is-archive': variant === 'archive' }">
        <div v-if="variant === 'archive'" class="m-archive-field-label">快照密码</div>
        <header v-else class="u-password-heading">
            <span class="u-heading-icon" aria-hidden="true"><i class="el-icon-camera"></i></span>
            <div>
                <h2>快照密码</h2>
                <p>管理游戏内插件上传团队快照时使用的验证密码</p>
            </div>
        </header>
        <div class="u-password-box">
            <div v-if="variant !== 'archive'" class="u-password-notice">
                <i class="el-icon-warning-outline" aria-hidden="true"></i>
                <div>
                    <strong>上传验证</strong>
                    <p>上传团队快照前需要验证此密码。密码仅由 6 位数字组成，请妥善保管。</p>
                </div>
            </div>
            <div class="u-password-field">
                <label v-if="variant !== 'archive'" for="team-snapshot-password">团队快照密码</label>
                <div class="u-password">
                    <el-input
                        id="team-snapshot-password"
                        class="u-input"
                        type="password"
                        v-model="password"
                        :maxlength="6"
                        placeholder="请输入 6 位数字"
                        inputmode="numeric"
                        autocomplete="new-password"
                        show-password
                        @input="formatPassword"
                    ></el-input>
                    <el-button class="u-btn" type="primary" @click="onSubmit" :disabled="!ready" :loading="saving"
                        >{{ variant === "archive" ? "保存密码" : "保存设置" }}</el-button
                    >
                </div>
                <div v-if="variant !== 'archive'" class="u-password-meta">
                    <span>仅支持数字，输入满 6 位后即可保存</span>
                    <span :class="{ 'is-complete': ready }">{{ password.length }}/6</span>
                </div>
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

.m-team-snapshot-password {
    min-width: 0;

    .u-password-heading {
        display: flex;
        align-items: center;
        margin-bottom: @team-space-3;
        gap: @team-space-2;

        .u-heading-icon {
            display: inline-flex;
            width: 40px;
            height: 40px;
            align-items: center;
            justify-content: center;
            flex: none;
            border-radius: 12px;
            background: @team-primary-soft;
            color: @team-primary;
            font-size: 18px;
        }

        h2 {
            margin: 0;
            color: @team-text-primary;
            font-size: 16px;
            font-weight: 700;
            line-height: 23px;
        }

        p {
            margin: 2px 0 0;
            color: @team-text-muted;
            font-size: 12px;
            line-height: 18px;
        }
    }

    .u-password-box {
        width: 680px;
        max-width: 100%;
        padding: @team-space-4;
        border: 1px solid @team-border-light;
        border-radius: @team-radius-control;
        background: @team-surface;
        box-shadow: @team-shadow-xs;
        box-sizing: border-box;
    }

    .u-password-notice {
        display: flex;
        align-items: flex-start;
        margin-bottom: @team-space-4;
        padding: @team-space-3;
        border: 1px solid fade(@team-accent-yellow, 24%);
        border-radius: @team-radius-small;
        background: fade(@team-accent-yellow, 7%);
        color: @team-text-secondary;
        gap: @team-space-2;

        > i {
            flex: none;
            margin-top: 2px;
            color: @team-accent-yellow;
            font-size: 17px;
        }

        strong {
            display: block;
            color: @team-text-primary;
            font-size: 13px;
            line-height: 20px;
        }

        p {
            margin: 2px 0 0;
            font-size: 12px;
            line-height: 19px;
        }
    }

    .u-password-field {
        > label {
            display: block;
            margin-bottom: @team-space-1;
            color: @team-text-regular;
            font-size: 13px;
            font-weight: 600;
            line-height: 20px;
        }
    }

    .u-password {
        display: flex;
        align-items: center;
        gap: @team-space-2;

        .u-input {
            width: 320px;
            max-width: 100%;
            margin: 0;
        }

        :deep(.el-input__wrapper) {
            min-height: 42px;
            padding: 0 @team-space-3;
            border: 1px solid @team-border;
            border-radius: @team-radius-small;
            background: @team-surface;
            box-shadow: none;
            transition: border-color @team-duration-fast @team-ease-standard,
                box-shadow @team-duration-fast @team-ease-standard;

            &:hover {
                border-color: @team-border-focus;
            }

            &.is-focus {
                border-color: @team-primary;
                box-shadow: @team-shadow-focus;
            }
        }

        .u-btn {
            min-width: 112px;
            min-height: 42px;
            margin: 0;
            border-color: @team-primary;
            border-radius: @team-radius-small;
            background: @team-primary;
            font-weight: 600;

            &:not(.is-disabled):hover,
            &:not(.is-disabled):focus-visible {
                border-color: @team-primary-hover;
                background: @team-primary-hover;
            }
        }
    }

    .u-password-meta {
        display: flex;
        width: 320px;
        max-width: 100%;
        align-items: center;
        justify-content: space-between;
        margin-top: 7px;
        color: @team-text-muted;
        font-size: 11px;
        line-height: 17px;
        gap: @team-space-2;

        .is-complete {
            color: @team-primary;
            font-weight: 700;
        }
    }
}

.m-team-snapshot-password.is-archive {
    min-width: 0;
    margin-bottom: @team-space-3;

    .u-password-box {
        width: 100%;
        max-width: none;
        padding: 0;
        border: 0;
        border-radius: 0;
        box-shadow: none;
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
    .m-team-snapshot-password:not(.is-archive) {
        .u-password-box {
            padding: @team-space-3;
        }

        .u-password {
            align-items: stretch;
            flex-direction: column;

            .u-input,
            .u-btn {
                width: 100%;
            }
        }

        .u-password-meta {
            width: 100%;
        }
    }

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
