<template>
    <el-dialog
        v-model="visible"
        class="m-snapshot-edit-dialog"
        :title="dialogTitle"
        width="1100px"
        append-to-body
        destroy-on-close
        :close-on-click-modal="false"
        @closed="reset"
    >
        <div class="m-snapshot-edit" v-loading="loading">
            <el-segmented v-model="section" :options="sections" class="m-snapshot-edit__segmented" />

            <el-form v-if="section === '基本信息'" label-position="top" class="m-snapshot-edit__form">
                <el-form-item label="快照标题">
                    <el-input v-model="form.title" placeholder="请输入快照标题" clearable />
                </el-form-item>
                <el-form-item label="所属团队">
                    <el-select v-model.number="selectedTeamId" disabled placeholder="所属团队">
                        <el-option v-for="item in teams" :key="item.ID" :label="item.name" :value="item.ID" />
                    </el-select>
                </el-form-item>
                <el-form-item label="备注信息">
                    <el-input v-model="form.desc" type="textarea" :rows="4" placeholder="请输入备注信息" />
                </el-form-item>
            </el-form>

            <div v-else class="m-snapshot-edit__members">
                <div class="m-snapshot-edit__members-head">
                    <div>
                        <h3>参与人员</h3>
                        <p>拖动可以调整名单顺序，点击角色右上角可移除。</p>
                    </div>
                    <span>{{ list.length }} 人</span>
                </div>
                <div class="m-snapshot-edit__group-head" aria-label="团队小队编号">
                    <span v-for="group in 5" :key="group">{{ group }} 队</span>
                </div>
                <VueDraggable v-model="list" class="m-snapshot-edit__member-list">
                    <div v-for="(item, index) in list" :key="dragKey(item, 'snapshot-dialog-role')" class="u-member">
                        <img :src="showMountIcon(item[3])" alt="" />
                        <span>{{ item[0] }}</span>
                        <button type="button" aria-label="移除参与人员" @click.stop="delRole(index)">
                            <i class="el-icon-close"></i>
                        </button>
                    </div>
                </VueDraggable>
                <div class="m-snapshot-edit__role-adder">
                    <div class="m-snapshot-edit__role-adder-head">
                        <div>
                            <h3>添加角色</h3>
                            <p>补充角色名并选择心法后加入当前快照。</p>
                        </div>
                    </div>
                    <el-form
                        ref="roleForm"
                        :model="roleForm"
                        :rules="roleRules"
                        label-position="top"
                        class="m-snapshot-edit__role-form"
                    >
                        <el-form-item label="角色名" prop="name">
                            <el-input v-model="roleForm.name" placeholder="请输入角色名" clearable />
                        </el-form-item>
                        <el-form-item label="心法" prop="xf">
                            <el-select
                                v-model="roleForm.xf"
                                placeholder="请选择心法"
                                filterable
                                popper-class="m-snapshot-xf-select"
                            >
                                <template #prefix>
                                    <img
                                        v-if="roleForm.xf"
                                        class="u-selected-xf-icon"
                                        :src="showMountIcon(roleForm.xf)"
                                        alt=""
                                    />
                                </template>
                                <el-option
                                    v-for="item in xflist"
                                    :key="item.id"
                                    :label="item.name"
                                    :value="item.id"
                                >
                                    <div class="m-snapshot-xf-option">
                                        <img :src="showMountIcon(item.id)" :alt="item.name" />
                                        <span>{{ item.name }}</span>
                                    </div>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item class="u-add-action">
                            <el-button type="primary" icon="Plus" @click="addMember">添加到名单</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="m-snapshot-edit__footer">
                <el-button @click="visible = false">取消</el-button>
                <el-button type="primary" :loading="processing" :disabled="loading" @click="submit">
                    {{ snapshotId ? "保存修改" : "确认补录" }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { addSnapshot, editSnapshot, getSnapshot } from "@/service/team/snapshot.js";
import { getMyPowerTeams } from "@/service/team/team.js";
import { VueDraggable } from "vue-draggable-plus";
import { ensureDragKey } from "@/utils/draggable";
import { showMountIcon } from "@/utils/filters";
import xfmap from "@jx3box/jx3box-data/data/xf/xf.json";

export default {
    name: "EditSnapshotDialog",
    components: {
        VueDraggable,
    },
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        snapshotId: {
            type: [Number, String],
            default: null,
        },
        targetTeamId: {
            type: [Number, String],
            default: null,
        },
    },
    emits: ["update:modelValue", "saved"],
    data() {
        return {
            section: "基本信息",
            sections: ["基本信息", "参与人员"],
            form: {
                title: "",
                desc: "",
            },
            selectedTeamId: "",
            teams: [],
            list: [],
            roleForm: {
                name: "",
                xf: "",
            },
            roleRules: {
                name: [{ required: true, message: "请输入角色名", trigger: "blur" }],
                xf: [{ required: true, message: "请选择心法", trigger: "change" }],
            },
            loading: false,
            processing: false,
            loadRequestId: 0,
        };
    },
    computed: {
        visible: {
            get() {
                return this.modelValue;
            },
            set(value) {
                this.$emit("update:modelValue", value);
            },
        },
        dialogTitle() {
            return this.snapshotId ? "修改快照" : "手动补录快照";
        },
        teammate() {
            return this.list.map((item) => item.join(",")).join(";");
        },
        xflist() {
            return Object.values(xfmap).filter((item) => item.id !== 0);
        },
    },
    watch: {
        modelValue(value) {
            if (!value) return;
            if (this.snapshotId) {
                this.loadData();
            } else {
                this.initCreateData();
            }
        },
    },
    methods: {
        dragKey: ensureDragKey,
        showMountIcon,
        async initCreateData() {
            const requestId = ++this.loadRequestId;
            this.loading = true;
            try {
                const teamsRes = await getMyPowerTeams("r_snapshot");
                if (requestId !== this.loadRequestId || !this.modelValue || this.snapshotId) return;
                this.teams = teamsRes.data.data.list || [];
                const targetId = Number(this.targetTeamId);
                const targetTeam = this.teams.find((item) => Number(item.ID) === targetId);
                this.selectedTeamId = targetTeam ? targetId : this.teams[0]?.ID || "";
            } finally {
                if (requestId === this.loadRequestId) this.loading = false;
            }
        },
        async loadData() {
            const snapshotId = this.snapshotId;
            const requestId = ++this.loadRequestId;
            this.loading = true;
            try {
                const [data, teamsRes] = await Promise.all([getSnapshot(snapshotId), getMyPowerTeams("r_snapshot")]);
                if (requestId !== this.loadRequestId || String(snapshotId) !== String(this.snapshotId) || !this.modelValue) {
                    return;
                }
                this.form = {
                    ...data,
                    title: data.title || "",
                    desc: data.desc || "",
                };
                this.selectedTeamId = data.team_id;
                this.teams = teamsRes.data.data.list || [];
                this.list = (data.teammate || "")
                    .split(";")
                    .filter(Boolean)
                    .map((item) => item.split(","));
            } finally {
                if (requestId === this.loadRequestId) this.loading = false;
            }
        },
        delRole(index) {
            this.list.splice(index, 1);
        },
        addMember() {
            this.$refs.roleForm.validate((valid) => {
                if (!valid) return;
                this.list.push([this.roleForm.name, 0, 0, this.roleForm.xf]);
                this.$refs.roleForm.resetFields();
            });
        },
        async submit() {
            if (!this.selectedTeamId) {
                this.$message.warning("请选择所属团队");
                return;
            }
            this.processing = true;
            try {
                const payload = {
                    team_id: this.selectedTeamId,
                    title: this.form.title || "",
                    desc: this.form.desc || "",
                    teammate: this.teammate,
                };
                if (this.snapshotId) {
                    await editSnapshot(this.snapshotId, payload);
                } else {
                    await addSnapshot(this.selectedTeamId, payload);
                }
                this.$message.success(this.snapshotId ? "快照更新成功" : "快照补录成功");
                this.$emit("saved");
                this.visible = false;
            } catch (error) {
                this.$message.error(error?.response?.data?.msg || "快照保存失败，请稍后重试");
            } finally {
                this.processing = false;
            }
        },
        reset() {
            this.loadRequestId += 1;
            this.loading = false;
            this.section = "基本信息";
            this.form = { title: "", desc: "" };
            this.selectedTeamId = "";
            this.teams = [];
            this.list = [];
            this.roleForm = { name: "", xf: "" };
        },
    },
};
</script>

<style lang="less">
@import (reference) "@/assets/css/team/design-system/_tokens.less";

.m-snapshot-edit-dialog {
    border-radius: @team-radius-control;

    .el-dialog__header {
        margin-right: 0;
        padding: @team-space-4 @team-space-4 @team-space-3;
        border-bottom: 1px solid @team-border-light;
    }

    .el-dialog__title {
        color: @team-text-primary;
        font-size: 18px;
        font-weight: 600;
    }

    .el-dialog__body {
        min-height: 500px;
        padding: @team-space-4;
    }

    .el-dialog__footer {
        padding: @team-space-3 @team-space-4;
        border-top: 1px solid fade(@team-primary, 18%);
    }
}

.m-snapshot-edit {
    min-height: 460px;
}

.m-snapshot-edit__segmented {
    --el-segmented-color: @team-text-secondary;
    --el-segmented-bg-color: @team-surface-muted;
    --el-segmented-item-selected-color: @team-primary;
    --el-segmented-item-selected-bg-color: @team-surface;
    --el-segmented-item-hover-color: @team-primary;
    --el-segmented-item-hover-bg-color: @team-primary-soft;
    --el-segmented-item-active-bg-color: @team-primary-soft;
    width: 100%;
    margin-bottom: @team-space-4;
    padding: 4px;
    border: 1px solid @team-border-light;
    border-radius: 12px;
    background: @team-surface-muted;

    .el-segmented__item {
        min-height: 36px;
        border-radius: 9px;
        color: @team-text-secondary;
        font-size: 13px;
        font-weight: 600;
    }

    .el-segmented__item-selected {
        border-radius: 9px;
        box-shadow: @team-shadow-xs;
    }

    .el-segmented__item.is-selected {
        color: @team-primary;
    }
}

.m-snapshot-edit__form {
    .el-form-item {
        margin-bottom: @team-space-4;
    }

    .el-form-item__label {
        padding-bottom: 7px;
        color: @team-text-secondary;
        font-size: 13px;
        font-weight: 600;
        line-height: 20px;
    }

    .el-input,
    .el-select,
    .el-textarea {
        width: 100%;
    }

    .el-input__wrapper,
    .el-select__wrapper,
    .el-textarea__inner {
        border: 1px solid @team-border;
        border-radius: @team-radius-small;
        background: @team-surface;
        box-shadow: none;
        transition:
            border-color @team-duration-fast @team-ease-standard,
            box-shadow @team-duration-fast @team-ease-standard;

        &:hover {
            border-color: @team-border-focus;
        }
    }

    .el-input__wrapper,
    .el-select__wrapper {
        min-height: 42px;
        padding: 0 @team-space-2;
    }

    .el-textarea__inner {
        padding: 10px @team-space-2;
        line-height: 22px;
        resize: vertical;
    }

    .el-input__wrapper.is-focus,
    .el-select__wrapper.is-focused,
    .el-textarea__inner:focus {
        border-color: @team-primary;
        box-shadow: @team-shadow-focus;
    }

    .el-select__wrapper.is-disabled {
        border-color: var(--el-disabled-border-color);
        background-color: var(--el-disabled-bg-color);
        color: var(--el-disabled-text-color);
        cursor: not-allowed;
        box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;

        &:hover {
            border-color: var(--el-disabled-border-color);
            box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;
        }

        .el-select__selected-item {
            color: var(--el-disabled-text-color);
        }

        .el-select__caret {
            color: var(--el-disabled-text-color);
        }
    }
}

.m-snapshot-edit__members-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: @team-space-3;

    h3 {
        margin: 0;
        color: @team-text-primary;
        font-size: 15px;
        line-height: 22px;
    }

    p {
        margin: 3px 0 0;
        color: @team-text-muted;
        font-size: 12px;
    }

    > span {
        padding: 4px 9px;
        border-radius: 999px;
        background: @team-primary-soft;
        color: @team-primary;
        font-size: 12px;
        font-weight: 600;
    }
}

.m-snapshot-edit__member-list {
    display: grid;
    height: 242px;
    padding: 0;
    overflow-y: auto;
    border: 1px solid fade(@team-primary, 18%);
    border-top: 0;
    border-radius: 0 0 12px 12px;
    background: @team-surface;
    grid-auto-columns: 20%;
    grid-auto-flow: column;
    grid-template-rows: repeat(5, 48px);

    .u-member {
        position: relative;
        display: flex;
        min-width: 0;
        height: 48px;
        align-items: center;
        padding: 0 40px 0 @team-space-3;
        border-right: 1px solid fade(@team-primary, 14%);
        border-bottom: 1px solid fade(@team-primary, 12%);
        border-radius: 0;
        background: @team-surface;
        cursor: move;
        gap: @team-space-2;
        transition: background-color @team-duration-fast @team-ease-standard;

        img {
            width: 28px;
            height: 28px;
            flex: none;
            object-fit: contain;
        }

        span {
            min-width: 0;
            overflow: hidden;
            color: @team-text-regular;
            font-size: 14px;
            font-weight: 500;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        button {
            position: absolute;
            top: 10px;
            right: 8px;
            width: 24px;
            height: 24px;
            padding: 0;
            border: 0;
            border-radius: 7px;
            background: transparent;
            color: @team-text-muted;
            cursor: pointer;
            line-height: 24px;
            transition: background-color @team-duration-fast @team-ease-standard,
                color @team-duration-fast @team-ease-standard;

            &:hover {
                background: #fef2f2;
                color: #ef4444;
            }
        }

        &:nth-child(5n) {
            border-bottom: 0;
        }

        &:hover {
            background: fade(@team-primary, 5%);
        }
    }
}

.m-snapshot-edit__group-head {
    display: grid;
    overflow: hidden;
    border: 1px solid fade(@team-primary, 18%);
    border-bottom: 0;
    border-radius: 12px 12px 0 0;
    background: @team-primary-soft;
    grid-template-columns: repeat(5, minmax(0, 1fr));

    span {
        height: 36px;
        border-right: 1px solid fade(@team-primary, 18%);
        background: linear-gradient(180deg, #f5f3ff 0%, @team-primary-soft 100%);
        color: @team-primary;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 1px;
        line-height: 36px;
        text-align: center;

        &:last-child {
            border-right: 0;
        }
    }
}

.m-snapshot-edit__role-adder {
    margin-top: @team-space-3;
    padding: @team-space-3;
    border: 1px solid @team-border-light;
    border-radius: 12px;
    background: @team-surface-muted;
}

.m-snapshot-edit__role-adder-head {
    margin-bottom: @team-space-2;

    h3 {
        margin: 0;
        color: @team-text-primary;
        font-size: 14px;
        line-height: 20px;
    }

    p {
        margin: 2px 0 0;
        color: @team-text-muted;
        font-size: 12px;
        line-height: 18px;
    }
}

.m-snapshot-edit__role-form {
    display: grid;
    align-items: start;
    grid-template-columns: minmax(220px, 1fr) minmax(220px, 0.8fr) auto;
    gap: @team-space-3;

    .el-form-item {
        margin: 0;
    }

    .el-form-item__label {
        padding-bottom: 6px;
        color: @team-text-secondary;
        font-size: 12px;
        font-weight: 600;
        line-height: 18px;
    }

    .el-select {
        width: 100%;
    }

    .u-selected-xf-icon {
        width: 24px;
        height: 24px;
        flex: none;
        object-fit: contain;
    }

    .el-input__wrapper,
    .el-select__wrapper {
        min-height: 38px;
        padding: 0 12px;
        border: 1px solid @team-border;
        border-radius: 9px;
        background: @team-surface;
        box-shadow: none;
        transition:
            border-color @team-duration-fast @team-ease-standard,
            box-shadow @team-duration-fast @team-ease-standard;

        &:hover {
            border-color: @team-border-focus;
        }
    }

    .el-input__wrapper.is-focus,
    .el-select__wrapper.is-focused {
        border-color: @team-primary;
        box-shadow: @team-shadow-focus;
    }

    .u-add-action .el-button {
        min-height: 38px;
        margin: 0;
        border-radius: 9px;
        font-weight: 600;
    }

    .u-add-action {
        align-self: end;
        margin: 0;

        .el-form-item__content {
            align-items: flex-end;
        }
    }
}

.m-snapshot-xf-option {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;

    img {
        width: 28px;
        height: 28px;
        flex: none;
        object-fit: contain;
    }

    span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.m-snapshot-xf-select .el-select-dropdown__item {
    height: 42px;
    padding: 7px 12px;
    line-height: 28px;
}

.m-snapshot-edit__footer {
    display: flex;
    justify-content: flex-end;
    gap: @team-space-2;

    .el-button {
        min-width: 92px;
        margin-left: 0;
        border-radius: @team-radius-small;
    }
}

@media screen and (max-width: 1150px) {
    .m-snapshot-edit-dialog {
        width: calc(100% - 48px) !important;
    }
}

@media screen and (max-width: 900px) {
    .m-snapshot-edit__group-head {
        display: none;
    }

    .m-snapshot-edit__member-list {
        height: 282px;
        padding: @team-space-2;
        border-top: 1px solid @team-border-light;
        border-radius: 12px;
        grid-auto-columns: auto;
        grid-auto-flow: row;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        grid-template-rows: none;
        gap: @team-space-2;

        .u-member {
            height: 42px;
            border: 1px solid fade(@team-primary, 14%);
            border-radius: 9px;

            &:nth-child(5n) {
                border-bottom: 1px solid fade(@team-primary, 14%);
            }
        }
    }

    .m-snapshot-edit__role-form {
        grid-template-columns: 1fr 1fr;

        .u-add-action {
            grid-column: 1 / -1;
            margin-top: 0;
        }
    }
}

@media screen and (max-width: 620px) {
    .m-snapshot-edit-dialog {
        width: calc(100% - 24px) !important;
    }

    .m-snapshot-edit__member-list {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .m-snapshot-edit__role-form {
        grid-template-columns: 1fr;

        .u-add-action {
            grid-column: auto;
            margin-top: 0;
        }
    }
}
</style>
