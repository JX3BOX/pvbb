<template>
    <el-dialog
        class="m-rank-relevance-dialog"
        v-model="dialogVisible"
        title="关联战斗数据"
        width="600px"
        append-to-body
        destroy-on-close
    >
        <template #header>
            <div class="m-rank-relevance-header">
                <span class="u-header-icon" aria-hidden="true">
                    <el-icon><Connection /></el-icon>
                </span>
                <span class="u-header-copy">
                    <b>关联战斗数据</b>
                    <em>{{ subjectType }}：{{ subjectName }}</em>
                </span>
            </div>
        </template>

        <div class="m-rank-relevance-notice">
            <el-icon aria-hidden="true"><WarningFilled /></el-icon>
            <span>关联结果将用于战绩统计与日志展示，请确认所选数据与本次出战一致。</span>
        </div>

        <el-form class="m-rank-relevance-form" label-position="top">
            <el-form-item>
                <template #label>
                    <span class="u-field-label">
                        <span class="u-field-icon" aria-hidden="true"><el-icon><DataAnalysis /></el-icon></span>
                        <span>
                            <b>战斗统计</b>
                            <em>关联本次战斗的统计记录</em>
                        </span>
                    </span>
                </template>
                <el-select
                    class="u-select"
                    v-model="form.jx3box_battle_id"
                    placeholder="请选择关联的战斗统计"
                    size="large"
                    clearable
                    filterable
                    remote
                    :remote-method="loadBattle"
                    :default-first-option="true"
                    :loading="battleQuery.BattleLoading"
                    no-data-text="暂无可关联的战斗统计"
                >
                    <el-option v-for="item in battleList" :key="item.id" :label="item.title" :value="item.id">
                    </el-option>
                    <ElSelectLoading
                        :page="battleQuery.BattlePage"
                        :loading="battleQuery.BattleLoading"
                        :hasMore="battleQuery.BattleHasMore"
                        @loadMore="loadMoreBattle"
                    ></ElSelectLoading>
                </el-select>
            </el-form-item>
            <el-form-item>
                <template #label>
                    <span class="u-field-label">
                        <span class="u-field-icon" aria-hidden="true"><el-icon><Document /></el-icon></span>
                        <span>
                            <b>日志 JCL</b>
                            <em>关联本次战斗的日志分析</em>
                        </span>
                    </span>
                </template>
                <el-select
                    class="u-select"
                    v-model="form.jx3box_jcl_id"
                    placeholder="请选择关联的日志分析"
                    size="large"
                    clearable
                    filterable
                    remote
                    :remote-method="loadJcl"
                    :default-first-option="true"
                    :loading="jclQuery.JclLoading"
                    no-data-text="暂无可关联的日志分析"
                >
                    <el-option v-for="item in jclList" :key="item.id" :label="item.title" :value="item.id"> </el-option>
                    <ElSelectLoading
                        :page="jclQuery.JclPage"
                        :loading="jclQuery.JclLoading"
                        :hasMore="jclQuery.JclHasMore"
                        @loadMore="loadMoreJcl"
                    ></ElSelectLoading>
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="m-rank-relevance-footer">
                <el-button :disabled="submitting" @click="close">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="submit">确认关联</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { getBattleOrJcl, setBattleJcL } from "@/service/team/battle.js";
import { Connection, DataAnalysis, Document, WarningFilled } from "@element-plus/icons-vue";
import ElSelectLoading from "./el-select-loading.vue";
export default {
    components: { Connection, DataAnalysis, Document, ElSelectLoading, WarningFilled },
    emits: ["update:modelValue", "update"],
    props: {
        modelValue: {
            type: Boolean,
            default: true,
        },
        role: {
            type: Boolean,
            default: false,
        },
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            form: {
                jx3box_battle_id: null,
                jx3box_jcl_id: null,
            },

            battleList: [],
            battleQuery: {
                title: "",
                total: 0,
                BattleLoading: false,
                BattlePage: 1,
                BattleHasMore: false,
            },

            jclList: [],
            jclQuery: {
                title: "",
                total: 0,
                JclLoading: false,
                JclPage: 1,
                JclHasMore: false,
            },
            submitting: false,
        };
    },
    computed: {
        dialogVisible: {
            get() {
                return this.modelValue;
            },
            set(val) {
                this.$emit("update:modelValue", val);
                if (!val) {
                    this.$emit("update", false);
                }
            },
        },
        id() {
            return this.data.ID;
        },
        subjectType() {
            return this.role ? "角色" : "团队";
        },
        subjectName() {
            return this.role
                ? this.data.role || "未知角色"
                : this.data.team_info?.name || this.data.team || "未知团队";
        },
    },
    watch: {
        data: {
            immediate: true,
            deep: true,
            handler: function () {
                this.form.jx3box_battle_id = this.normalizeRelationId(this.data.jx3box_battle_id);
                this.form.jx3box_jcl_id = this.normalizeRelationId(this.data.jx3box_jcl_id);
            },
        },
    },
    created() {
        this.loadJcl();
        this.loadBattle();
    },
    methods: {
        normalizeRelationId(value) {
            return value && value !== "0" ? value : null;
        },
        close() {
            this.dialogVisible = false;
        },
        loadBattle(title = "", pageIndex = 1) {
            if (title !== this.battleQuery.title) {
                pageIndex = 1;
            }
            this.battleQuery.title = title;
            this.battleQuery.BattleLoading = true;
            getBattleOrJcl({ pageIndex: pageIndex, type: "tinymins", title: title })
                .then((res) => {
                    const Battle = res.data?.data?.list || [];
                    if (pageIndex === 1) {
                        this.battleList = Battle;
                    } else {
                        this.battleList = this.battleList.concat(Battle);
                    }
                    const page = res.data?.data?.page || {};
                    const { index, pageTotal } = page;
                    this.battleQuery.BattlePage = index;
                    this.battleQuery.BattleHasMore = index < pageTotal;
                })
                .finally(() => {
                    this.battleQuery.BattleLoading = false;
                });
        },
        loadMoreBattle(page) {
            this.loadBattle(this.battleQuery.title, page);
        },
        loadJcl(title = "", pageIndex = 1) {
            if (title !== this.jclQuery.title) {
                pageIndex = 1;
            }
            this.jclQuery.title = title;
            this.jclQuery.JclLoading = true;
            getBattleOrJcl({ pageIndex: pageIndex, type: "jcl", subject: "team", title: title })
                .then((res) => {
                    const Jcl = res.data?.data?.list || [];
                    if (pageIndex === 1) {
                        this.jclList = Jcl;
                    } else {
                        this.jclList = this.jclList.concat(Jcl);
                    }
                    const page = res.data?.data?.page || {};
                    const { index, pageTotal } = page;
                    this.jclQuery.JclPage = index;
                    this.jclQuery.JclHasMore = index < pageTotal;
                })
                .finally(() => {
                    this.jclQuery.JclLoading = false;
                });
        },
        loadMoreJcl(page) {
            this.loadJcl(this.jclQuery.title, page);
        },

        submit() {
            this.submitting = true;
            setBattleJcL(this.id, this.form)
                .then(() => {
                    this.$message.success("关联审核提交成功");
                    this.close();
                })
                .finally(() => {
                    this.submitting = false;
                });
        },
    },
};
</script>
<style lang="less">
@import (reference) "@/assets/css/team/design-system/_tokens.less";

.m-rank-relevance-dialog.el-dialog {
    max-width: calc(100vw - 32px);
    margin-top: max(24px, calc((100vh - 560px) / 2));
    margin-bottom: 24px;
    overflow: hidden;
    border: 1px solid @team-border-light;
    border-radius: 16px;
    background: @team-surface;
    box-shadow: 0 24px 64px rgba(15, 23, 42, 0.16);

    .el-dialog__header {
        margin: 0;
        padding: @team-space-4 56px @team-space-3 @team-space-4;
        border-bottom: 1px solid @team-border-light;
    }

    .el-dialog__headerbtn {
        top: 18px;
        right: 18px;
        width: 32px;
        height: 32px;
        border-radius: 9px;

        &:hover {
            background: @team-surface-muted;
        }

        .el-dialog__close {
            color: @team-text-muted;
        }
    }

    .el-dialog__body {
        padding: @team-space-4 @team-space-4 @team-space-5;
    }

    .el-dialog__footer {
        padding: @team-space-3 @team-space-4 @team-space-4;
        border-top: 1px solid @team-border-light;
    }

    .el-form-item {
        margin-bottom: @team-space-3;
        padding: @team-space-3;
        border: 1px solid @team-border-light;
        border-radius: @team-radius-small;
        background: @team-surface-muted;

        &:last-child {
            margin-bottom: 0;
        }
    }

    .el-form-item__label {
        height: auto;
        margin-bottom: @team-space-2;
        padding: 0;
        line-height: normal;
    }

    .el-select {
        width: 100%;
    }

    .el-select__wrapper {
        min-height: 42px;
        border-radius: 9px;
        background: @team-surface;
        box-shadow: 0 0 0 1px @team-border inset;

        &:hover {
            box-shadow: 0 0 0 1px @team-border-focus inset;
        }

        &.is-focused {
            box-shadow: 0 0 0 1px @team-primary inset, @team-shadow-focus;
        }
    }
}

.m-rank-relevance-header {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: @team-space-2;

    .u-header-icon {
        display: inline-flex;
        width: 42px;
        height: 42px;
        align-items: center;
        justify-content: center;
        flex: none;
        border-radius: 12px;
        background: @team-primary-soft;
        color: @team-primary;
        font-size: 20px;
    }

    .u-header-copy {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 2px;

        b {
            color: @team-text-primary;
            font-size: 17px;
            font-weight: 650;
            line-height: 24px;
        }

        em {
            overflow: hidden;
            color: @team-text-muted;
            font-size: 12px;
            font-style: normal;
            line-height: 18px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}

.m-rank-relevance-notice {
    display: flex;
    align-items: flex-start;
    margin-bottom: @team-space-3;
    padding: 10px @team-space-2;
    border: 1px solid #fde7b0;
    border-radius: 9px;
    background: #fffbeb;
    color: #a16207;
    font-size: 12px;
    line-height: 19px;
    gap: 8px;

    .el-icon {
        flex: none;
        margin-top: 2px;
        color: #f59e0b;
        font-size: 15px;
    }
}

.m-rank-relevance-form {
    .u-field-label {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 10px;
    }

    .u-field-icon {
        display: inline-flex;
        width: 32px;
        height: 32px;
        align-items: center;
        justify-content: center;
        flex: none;
        border-radius: 9px;
        background: @team-primary-soft;
        color: @team-primary;
        font-size: 16px;
    }

    .u-field-label > span:last-child {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 1px;

        b {
            color: @team-text-regular;
            font-size: 13px;
            font-weight: 600;
            line-height: 19px;
        }

        em {
            color: @team-text-muted;
            font-size: 11px;
            font-style: normal;
            line-height: 17px;
        }
    }
}

.m-rank-relevance-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: @team-space-2;

    .el-button {
        min-width: 80px;
        min-height: 38px;
        margin: 0;
        border-radius: 9px;
        font-weight: 600;
    }

    .el-button--primary {
        border-color: @team-primary;
        background: @team-primary;

        &:hover,
        &:focus {
            border-color: @team-primary-hover;
            background: @team-primary-hover;
        }
    }
}

@media screen and (max-width: 560px) {
    .m-rank-relevance-dialog.el-dialog {
        .el-dialog__header {
            padding: @team-space-3 52px @team-space-3 @team-space-3;
        }

        .el-dialog__body {
            padding: @team-space-3;
        }

        .el-dialog__footer {
            padding: @team-space-3;
        }

        .el-form-item {
            padding: @team-space-2;
        }

        .m-rank-relevance-notice {
            margin-bottom: @team-space-2;
        }

        .m-rank-relevance-footer {
            .el-button {
                flex: 1;
            }
        }
    }
}
</style>
