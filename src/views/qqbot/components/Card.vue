<template>
    <div class="card" :class="[role, item ? '' : 'notext', { 'is-readonly': readonly }]">
        <template v-if="item">
            <div class="card-header" @click="openEditor">
                <div class="card-header-left">
                    <img :src="`https://img.jx3box.com/image/xf/${item.mount}.png`" alt="" class="icon" />
                </div>
                <div class="card-header-mid">
                    {{ item.game_role }}
                </div>
                <div class="card-header-right">
                    <i v-if="!readonly" class="el-icon-close" @click.stop="handleDelete"></i>
                </div>
            </div>
            <div class="card-fotter" :title="item.remark">{{ item.remark }}</div>
        </template>
        <template v-else>
            <div class="null-text">虚位以待</div>
        </template>
        <el-dialog v-if="!readonly" v-model="dialogVisible" class="edit-dialog" width="680px">
            <template #header>
                <div class="edit-dialog__heading">
                    <div class="edit-dialog__icon"><i class="el-icon-user"></i></div>
                    <div>
                        <div class="edit-dialog__title">编辑成员</div>
                        <div class="edit-dialog__subtitle">修改角色信息并指定团队职业</div>
                    </div>
                </div>
            </template>
            <el-form :model="form" label-width="84px">
                <el-form-item label="角色名称" class="basic-form-item">
                    <el-input v-model="form.game_role" placeholder="请输入角色名称" />
                </el-form-item>
                <el-form-item label="指定职业" class="role-form-item">
                    <el-select
                        v-model="form.mount"
                        class="role-select"
                        filterable
                        popper-class="role-select-popper"
                        placeholder="请选择或搜索心法"
                    >
                        <template #prefix>
                            <img
                                v-if="selectedRole"
                                class="role-select__selected-icon"
                                :src="`https://img.jx3box.com/image/xf/${selectedRole.id}.png`"
                                alt=""
                            />
                        </template>
                        <el-option
                            v-for="role in roleOptions"
                            :key="role.id"
                            :label="role.name"
                            :value="role.id"
                        >
                            <div class="role-select__option">
                                <img :src="`https://img.jx3box.com/image/xf/${role.id}.png`" alt="" />
                                <span>{{ role.name }}</span>
                            </div>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注" class="basic-form-item">
                    <el-input v-model="form.remark" placeholder="添加成员备注（选填）" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleEdit">保存修改</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script>
import xfmap from "@jx3box/jx3box-data/data/xf/xf.json";
import { deleteMember, updateMember, updateMemberStatus } from "@/service/qqbot";
export default {
    name: "Card",
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        role: {
            type: String,
            default: "",
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            dialogVisible: false,
            form: {
                game_role: "",
                mount: "",
                remark: "",
            },
        };
    },
    computed: {
        xfmaps() {
            const maps = { ...xfmap };
            delete maps["山居剑意"];
            delete maps["通用"];
            maps["待定"] = { id: 0, name: "待定" };
            return maps;
        },
        roleOptions() {
            return Object.values(this.xfmaps);
        },
        selectedRole() {
            return this.roleOptions.find((role) => role.id === this.form.mount);
        },
    },
    watch: {
        item: {
            handler(newVal) {
                this.form.game_role = newVal?.game_role || "";
                this.form.mount = newVal?.mount || 0;
                this.form.remark = newVal?.remark || "";
            },
            immediate: true,
        },
    },
    methods: {
        openEditor() {
            if (!this.readonly) this.dialogVisible = true;
        },
        handleEdit() {
            if (this.readonly) return;
            updateMember(this.$route.query.id, this.item.id, { ...this.form, serial_no: this.item.serial_no }).then(
                (res) => {
                    this.$message.success("修改成功");
                    this.dialogVisible = false;
                    this.$emit("update");
                }
            );
        },
        handleDelete() {
            if (this.readonly) return;
            if (this.item.identity_status === 1 || this.item.identity_status === 2) {
                this.$confirm(
                    `确定把该成员移动到${this.item.identity_status === 1 ? "替补名单" : "排队名单"}中吗？`,
                    "提示",
                    {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning",
                    }
                ).then(() => {
                    updateMemberStatus(this.$route.query.id, this.item.id, {
                        identity_status: this.item.identity_status + 1,
                    }).then((res) => {
                        this.$message.success("移动成功");
                        this.$emit("update");
                    });
                });
                return;
            }
            if (this.item.identity_status === 3) {
                this.$confirm("确定删除该成员吗？", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning",
                }).then(() => {
                    deleteMember(this.$route.query.id, this.item.id).then((res) => {
                        this.$message.success("删除成功");
                        this.$emit("update");
                    });
                });
            }
        },
    },
};
</script>
<style lang="less" scoped>
.card {
    width: 180px;
    height: 66px;
    box-sizing: border-box;
    border-radius: 8px;
    background: linear-gradient(0deg, rgba(89, 89, 89, 1) 0%, rgba(5, 5, 5, 1) 49.85%);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    &.notext {
        background: linear-gradient(0deg, rgba(56, 56, 56, 1) 0%, rgba(0, 0, 0, 1) 100%);
        border: 1px solid rgba(110, 110, 110, 1);
        box-shadow: inset 0px 10px 5px rgba(0, 0, 0, 1);
    }
    &.is-readonly {
        .card-header {
            cursor: default;
        }

        &:hover {
            border-color: transparent;
        }
    }
    .card-header {
        height: 44px;
        border-radius: 0 0 8px 8px;
        background: rgba(229, 229, 229, 1);
        display: flex;
        align-items: center;
        box-sizing: border-box;
        padding: 4px;
        gap: 4px;
        cursor: pointer;
        .card-header-left {
            width: 36px;
            height: 36px;
            .icon {
                width: 100%;
                height: 100%;
            }
        }
        .card-header-mid {
            flex: 1 0 0;
            height: 21px;
            font-size: 14px;
            font-weight: 700;
            line-height: 21px;
            color: rgba(56, 56, 56, 1);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            text-align: center;
        }
        .card-header-right {
            width: 16px;
            height: 100%;
            color: rgba(229, 229, 229, 1);
            cursor: pointer;
            &:hover {
                color: black;
            }
        }
    }
    .card-fotter {
        width: 180px;
        height: 22px;
        font-size: 12px;
        line-height: 22px;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
        box-sizing: border-box;
        padding: 0 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    .null-text {
        width: 56px;
        height: 66px;
        font-size: 14px;
        line-height: 66px;
        color: rgba(255, 255, 255, 0.5);
        align-self: center;
    }
    &.HPS {
        background: linear-gradient(0deg, rgba(68, 130, 93, 1) 0%, rgba(0, 0, 0, 1) 55.25%);
    }
    &.T {
        background: linear-gradient(0deg, rgba(140, 91, 63, 1) 0%, rgba(0, 0, 0, 1) 55.25%);
    }
    &.DPS {
        background: linear-gradient(0deg, rgba(60, 98, 140, 1) 0%, rgba(0, 0, 0, 1) 52.93%);
    }
    &:hover {
        border: 2px solid rgba(255, 255, 255, 1);
        .card-header {
            background: rgba(255, 255, 255, 1);
            height: 42px;
        }
    }
    &.active {
        box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.5);
        border: 2px solid rgba(255, 255, 255, 1);
        .card-header {
            background: rgba(255, 255, 255, 1);
            height: 42px;
        }
    }
    .edit-dialog {
        .role-selection-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;

            .role-table {
                flex: 1;
                max-width: 800px;

                .role-grid {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #ccc;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

                    .role-header {
                        background: linear-gradient(to bottom, #f8f8f8, #e8e8e8);
                        border: 1px solid #ccc;
                        text-align: center;
                        font-weight: bold;
                        font-size: 13px;
                        color: #333;
                        width: 130px;
                        height: 35px;
                        position: relative;

                        &::after {
                            content: "";
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            height: 1px;
                            background: #bbb;
                        }
                    }

                    .role-cell {
                        border: 1px solid #ddd;
                        padding-left: 20px;
                        height: 35px;
                        width: 130px;
                        cursor: pointer;
                        position: relative;
                        vertical-align: middle;
                        box-sizing: border-box;

                        &:not(.empty) {
                            background-color: #fff;

                            &:hover {
                                background-color: #f5f5f5;
                                border-color: transparent;
                            }

                            &.selected {
                                background-color: #e3f2fd;
                                border-color: transparent;
                                box-shadow: 0 0 8px rgba(33, 150, 243, 0.3);
                                color: #1976d2;
                            }
                        }

                        &.empty {
                            background-color: #f9f9f9;
                            cursor: default;
                            border-color: #eee;
                        }

                        .role-icon {
                            width: 18px;
                            height: 18px;
                            margin-right: 3px;
                            vertical-align: middle;
                        }

                        .role-name {
                            font-size: 11px;
                            color: #333;
                            vertical-align: middle;
                            font-weight: 500;
                        }
                    }
                }
            }
        }
    }

    // 编队卡片采用轻量层级，避免大面积黑色渐变和内阴影造成视觉压迫。
    & {
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(0, 0, 0, 0.2);
        transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
    }
    &.notext {
        border: 1px dashed rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.14);
        box-shadow: none;
    }
    .card-header {
        height: 44px;
        border-radius: 0;
        background: rgba(255, 255, 255, 0.06);
        padding: 5px 7px;

        .card-header-left {
            width: 32px;
            height: 32px;
        }
        .card-header-mid {
            color: rgba(255, 255, 255, 0.82);
            font-size: 13px;
            text-align: left;
        }
        .card-header-right {
            color: rgba(255, 255, 255, 0.24);
            &:hover {
                color: #ff8299;
            }
        }
    }
    .card-fotter {
        color: rgba(255, 255, 255, 0.4);
    }
    .null-text {
        width: auto;
        color: rgba(255, 255, 255, 0.3);
        font-size: 12px;
    }
    &.HPS {
        border-left: 2px solid rgba(88, 190, 130, 0.7);
        background: rgba(68, 130, 93, 0.08);
    }
    &.T {
        border-left: 2px solid rgba(202, 132, 91, 0.7);
        background: rgba(140, 91, 63, 0.08);
    }
    &.DPS {
        border-left: 2px solid rgba(78, 140, 209, 0.72);
        background: rgba(60, 98, 140, 0.08);
    }
    &:hover,
    &.active {
        border-width: 1px;
        border-color: rgba(89, 145, 255, 0.7);
        background: rgba(69, 131, 255, 0.1);
        box-shadow: none;

        .card-header {
            height: 44px;
            background: rgba(255, 255, 255, 0.08);
        }
    }
}

:deep(.edit-dialog) {
    --el-dialog-bg-color: #202228;
    --el-text-color-primary: rgba(255, 255, 255, 0.88);
    --el-text-color-regular: rgba(255, 255, 255, 0.68);
    --el-border-color: rgba(255, 255, 255, 0.1);
    --el-fill-color-blank: rgba(255, 255, 255, 0.05);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background:
        radial-gradient(circle at 90% 0, rgba(64, 128, 255, 0.12), transparent 34%),
        #202228;
    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.5);

    :deep(.el-dialog__header) {
        margin: 0;
        padding: 22px 24px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    :deep(.el-dialog__headerbtn) {
        top: 18px;
        right: 18px;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        &:hover {
            background: rgba(255, 255, 255, 0.08);
        }
        .el-dialog__close {
            color: rgba(255, 255, 255, 0.48);
        }
    }
    :deep(.el-dialog__body) {
        padding: 22px 24px 10px;
        color: rgba(255, 255, 255, 0.72);
    }
    :deep(.el-dialog__footer) {
        padding: 14px 24px 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .edit-dialog__heading {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .edit-dialog__icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border: 1px solid rgba(89, 145, 255, 0.28);
        border-radius: 12px;
        background: rgba(64, 128, 255, 0.12);
        color: #78a7ff;
        font-size: 18px;
    }
    .edit-dialog__title {
        color: #fff;
        font-size: 18px;
        font-weight: 700;
        line-height: 26px;
    }
    .edit-dialog__subtitle {
        color: rgba(255, 255, 255, 0.38);
        font-size: 12px;
        line-height: 18px;
    }
    :deep(.el-form-item) {
        margin-bottom: 18px;
    }
    :deep(.el-form-item__label) {
        color: rgba(255, 255, 255, 0.52);
        font-size: 13px;
    }
    .basic-form-item {
        width: 520px;
    }
    :deep(.el-input__wrapper) {
        min-height: 38px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.2);
        box-shadow: none;
        &:hover {
            border-color: rgba(255, 255, 255, 0.2);
        }
        &.is-focus {
            border-color: rgba(69, 131, 255, 0.72);
            box-shadow: 0 0 0 3px rgba(69, 131, 255, 0.1);
        }
    }
    :deep(.el-input__inner) {
        color: rgba(255, 255, 255, 0.82);
        &::placeholder {
            color: rgba(255, 255, 255, 0.25);
        }
    }
    .role-form-item {
        margin-top: 2px;
    }
    .role-select {
        width: 520px;
        height: 40px;
    }
    .role-select__selected-icon {
        width: 22px;
        height: 22px;
        margin-right: 4px;
    }
    .role-select__option {
        display: flex;
        align-items: center;
        gap: 10px;

        img {
            width: 24px;
            height: 24px;
        }
        span {
            color: rgba(255, 255, 255, 0.72);
        }
    }
    :deep(.role-select .el-select__wrapper) {
        min-height: 40px;
    }
    :deep(.role-select .el-select-dropdown) {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: #26282f;
    }
    :deep(.role-select .el-select-dropdown__item) {
        height: 40px;
        line-height: 40px;
        color: rgba(255, 255, 255, 0.68);

        &.hover,
        &:hover {
            background: rgba(69, 131, 255, 0.1);
        }
        &.is-selected {
            background: rgba(69, 131, 255, 0.16);
            color: #8bb2ff;
        }
    }
    .role-selection-container {
        width: 100%;
        display: block;
    }
    .role-table {
        width: 100%;
        max-width: none;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
    }
    .role-grid {
        width: 100%;
        table-layout: fixed;
        border: 0;
        border-collapse: separate;
        border-spacing: 0;
        box-shadow: none;

        .role-header {
            width: auto;
            height: 34px;
            border: 0;
            border-right: 1px solid rgba(255, 255, 255, 0.07);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(255, 255, 255, 0.055);
            color: rgba(255, 255, 255, 0.52);
            font-size: 12px;

            &::after {
                display: none;
            }
        }
        .role-cell {
            width: auto;
            height: 44px;
            padding: 0 8px;
            border: 0;
            border-right: 1px solid rgba(255, 255, 255, 0.06);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            background: rgba(0, 0, 0, 0.1);
            transition: background-color 0.16s ease, box-shadow 0.16s ease;

            &:not(.empty) {
                background: rgba(0, 0, 0, 0.1);
                &:hover {
                    border-color: transparent;
                    background: rgba(69, 131, 255, 0.1);
                }
                &.selected {
                    border-color: transparent;
                    background: rgba(69, 131, 255, 0.18);
                    box-shadow: inset 3px 0 #518cff;

                    .role-name {
                        color: #8bb2ff;
                    }
                }
            }
            &.empty {
                border-color: rgba(255, 255, 255, 0.06);
                background: rgba(0, 0, 0, 0.06);
            }
            .role-icon {
                width: 24px;
                height: 24px;
                margin-right: 5px;
            }
            .role-name {
                color: rgba(255, 255, 255, 0.68);
                font-size: 11px;
            }
        }
    }
    .dialog-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;

        :deep(.el-button) {
            height: 36px;
            margin-left: 0;
            padding: 0 18px;
            border-color: rgba(255, 255, 255, 0.12);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.06);
            color: rgba(255, 255, 255, 0.62);
            &:hover {
                border-color: rgba(255, 255, 255, 0.22);
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }
            &.el-button--primary {
                border-color: #4080ff;
                background: #4080ff;
                color: #fff;
                &:hover {
                    background: #5590ff;
                }
            }
        }
    }
}

// 弹窗通过 Teleport 渲染，职业表格需要显式覆盖旧版高权重样式。
:deep(.edit-dialog .role-selection-container .role-table .role-grid) {
    border: 0;
    border-collapse: separate;
    border-spacing: 0;
    background: transparent;
    box-shadow: none;
}
:deep(.edit-dialog .role-selection-container .role-table .role-grid .role-header) {
    border: 0 !important;
    border-right: 1px solid rgba(255, 255, 255, 0.07) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
    background: rgba(255, 255, 255, 0.055) !important;
    color: rgba(255, 255, 255, 0.52) !important;
}
:deep(.edit-dialog .role-selection-container .role-table .role-grid .role-header::after) {
    display: none;
}
:deep(.edit-dialog .role-selection-container .role-table .role-grid .role-cell),
:deep(.edit-dialog .role-selection-container .role-table .role-grid .role-cell:not(.empty)) {
    border: 0 !important;
    border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
    background: rgba(0, 0, 0, 0.1) !important;
    box-shadow: none !important;
}
:deep(.edit-dialog .role-selection-container .role-table .role-grid .role-cell:not(.empty):hover) {
    background: rgba(69, 131, 255, 0.1) !important;
}
:deep(.edit-dialog .role-selection-container .role-table .role-grid .role-cell.selected) {
    background: rgba(69, 131, 255, 0.18) !important;
    box-shadow: inset 3px 0 #518cff !important;
}
:deep(.edit-dialog .role-selection-container .role-table .role-grid .role-cell.empty) {
    border-color: rgba(255, 255, 255, 0.06) !important;
    background: rgba(0, 0, 0, 0.06) !important;
}
:deep(.edit-dialog .role-selection-container .role-table .role-grid .role-cell .role-name) {
    color: rgba(255, 255, 255, 0.68) !important;
}
:deep(.edit-dialog .role-selection-container .role-table .role-grid .role-cell.selected .role-name) {
    color: #8bb2ff !important;
}

:deep(.edit-dialog .el-select__popper) {
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 10px !important;
    background: #26282f !important;
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42) !important;
}
:deep(.edit-dialog .el-select__popper .el-popper__arrow::before) {
    border-color: rgba(255, 255, 255, 0.12) !important;
    background: #26282f !important;
}
:deep(.edit-dialog .el-select__popper .el-select-dropdown__wrap) {
    max-height: 260px;
}
:deep(.edit-dialog .el-select__popper .el-select-dropdown__list) {
    padding: 6px;
}
:deep(.edit-dialog .el-select__popper .el-select-dropdown__item) {
    height: 40px;
    padding: 0 10px;
    border-radius: 7px;
    background: transparent !important;
    color: rgba(255, 255, 255, 0.68) !important;
    line-height: 40px;
}
:deep(.edit-dialog .el-select__popper .el-select-dropdown__item.hover),
:deep(.edit-dialog .el-select__popper .el-select-dropdown__item.is-hovering),
:deep(.edit-dialog .el-select__popper .el-select-dropdown__item:hover) {
    background: rgba(69, 131, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.82) !important;
}
:deep(.edit-dialog .el-select__popper .el-select-dropdown__item.is-selected) {
    background: rgba(69, 131, 255, 0.16) !important;
    color: #8bb2ff !important;
}
:deep(.edit-dialog .el-select__popper .el-select-dropdown__item.is-selected.is-hovering) {
    background: rgba(69, 131, 255, 0.22) !important;
    color: #a9c4ff !important;
}
:deep(.edit-dialog .el-select__popper .role-select__option) {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 10px;
}
:deep(.edit-dialog .el-select__popper .role-select__option img) {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}
:deep(.edit-dialog .el-select__popper .role-select__option span) {
    overflow: hidden;
    color: inherit;
    text-overflow: ellipsis;
    white-space: nowrap;
}

:deep(.role-select-popper) {
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 10px !important;
    background: #26282f !important;
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42) !important;
}
:deep(.role-select-popper .el-popper__arrow::before) {
    border-color: rgba(255, 255, 255, 0.12) !important;
    background: #26282f !important;
}
:deep(.role-select-popper .el-select-dropdown__wrap) {
    max-height: 320px;
}
:deep(.role-select-popper .el-select-dropdown__list) {
    padding: 6px;
}
:deep(.role-select-popper .el-select-dropdown__item) {
    height: 40px;
    padding: 0 10px;
    border-radius: 7px;
    background: transparent !important;
    color: rgba(255, 255, 255, 0.68) !important;
    line-height: 40px;
}
:deep(.role-select-popper .el-select-dropdown__item.hover),
:deep(.role-select-popper .el-select-dropdown__item.is-hovering),
:deep(.role-select-popper .el-select-dropdown__item:hover) {
    background: rgba(69, 131, 255, 0.1) !important;
    color: rgba(255, 255, 255, 0.82) !important;
}
:deep(.role-select-popper .el-select-dropdown__item.is-selected) {
    background: rgba(69, 131, 255, 0.16) !important;
    color: #8bb2ff !important;
}
:deep(.role-select-popper .el-select-dropdown__item.is-selected.is-hovering) {
    background: rgba(69, 131, 255, 0.22) !important;
    color: #a9c4ff !important;
}
:deep(.role-select-popper .role-select__option) {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    gap: 10px;
}
:deep(.role-select-popper .role-select__option img) {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
}
:deep(.role-select-popper .role-select__option span) {
    overflow: hidden;
    color: inherit;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>

<style lang="less">
.role-select-popper {
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    border-radius: 10px !important;
    background: #26282f !important;
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.42) !important;

    .el-popper__arrow::before {
        border-color: rgba(255, 255, 255, 0.12) !important;
        background: #26282f !important;
    }
    .el-select-dropdown__wrap {
        height: 320px;
        max-height: 320px !important;
    }
    .el-select-dropdown__list {
        padding: 6px;
    }
    .el-select-dropdown__item {
        height: 40px;
        padding: 0 10px;
        border-radius: 7px;
        background: transparent !important;
        color: rgba(255, 255, 255, 0.68) !important;
        line-height: 40px;

        &.hover,
        &.is-hovering,
        &:hover {
            background: rgba(69, 131, 255, 0.1) !important;
            color: rgba(255, 255, 255, 0.82) !important;
        }
        &.is-selected {
            background: rgba(69, 131, 255, 0.16) !important;
            color: #8bb2ff !important;
        }
        &.is-selected.is-hovering {
            background: rgba(69, 131, 255, 0.22) !important;
            color: #a9c4ff !important;
        }
    }
    .role-select__option {
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
        gap: 10px;

        img {
            width: 24px;
            height: 24px;
            flex-shrink: 0;
        }
        span {
            overflow: hidden;
            color: inherit;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
</style>
