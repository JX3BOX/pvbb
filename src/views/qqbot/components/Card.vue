<template>
    <div class="card" :class="[role, item ? '' : 'notext']">
        <template v-if="item">
            <div class="card-header" @click="dialogVisible = true">
                <div class="card-header-left">
                    <img :src="`https://img.jx3box.com/image/xf/${item.mount}.png`" alt="" class="icon" />
                </div>
                <div class="card-header-mid">
                    {{ item.game_role }}
                </div>
                <div class="card-header-right">
                    <i class="el-icon-close" @click.stop="handleDelete"></i>
                </div>
            </div>
            <div class="card-fotter" :title="item.remark">{{ item.remark }}</div>
        </template>
        <template v-else>
            <div class="null-text">虚位以待</div>
        </template>
        <el-dialog v-model="dialogVisible" title="修改人员信息" class="edit-dialog" width="1000px">
            <el-form :model="form" label-width="120px">
                <el-form-item label="角色名称" style="width: 500px">
                    <el-input v-model="form.game_role" />
                </el-form-item>
                <el-form-item label="指定职业">
                    <div class="role-selection-container">
                        <div class="role-table">
                            <table class="role-grid">
                                <thead>
                                    <tr>
                                        <th class="role-header">坦克</th>
                                        <th class="role-header">治疗</th>
                                        <th class="role-header">内功</th>
                                        <th class="role-header">内功</th>
                                        <th class="role-header">外功</th>
                                        <th class="role-header">外功</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(row, rowIndex) in roleRows" :key="rowIndex">
                                        <td
                                            v-for="(cell, colIndex) in row"
                                            :key="colIndex"
                                            class="role-cell"
                                            :class="{ selected: form.mount === cell?.id, empty: !cell }"
                                            @click="selectRole(cell)"
                                        >
                                            <template v-if="cell">
                                                <img
                                                    :src="`https://img.jx3box.com/image/xf/${cell.id}.png`"
                                                    alt=""
                                                    class="role-icon"
                                                />
                                                <span class="role-name">{{ cell.name }}</span>
                                            </template>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            class="role-cell"
                                            @click="selectRole(null)"
                                            :class="{ selected: form.mount === 0 }"
                                        >
                                            <img
                                                :src="`https://img.jx3box.com/image/xf/0.png`"
                                                alt=""
                                                class="role-icon"
                                            />
                                            <span class="role-name">待定</span>
                                        </td>
                                        <td class="role-cell empty"></td>
                                        <td class="role-cell empty"></td>
                                        <td class="role-cell empty"></td>
                                        <td class="role-cell empty"></td>
                                        <td class="role-cell empty"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="备注" style="width: 500px">
                    <el-input v-model="form.remark" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button type="primary" @click="handleEdit">确 定</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script>
import xfmap from "@jx3box/jx3box-data/data/xf/xf.json";
import typeMap from "@jx3box/jx3box-data/data/xf/mount_group.json";
import { deleteMember, updateMember, updateMemberStatus } from "@/service/qqbot";
export default {
    name: "Card",
    props: {
        item: {
            type: Object,
            default: () => {},
        },
        role: {
            type: String,
            default: "",
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
        typeMap() {
            const map = { T: [], NDPS: [], WDPS: [], HPS: [] };
            const T = typeMap.mount_group["坦克"],
                n = typeMap.mount_group["内攻"],
                w = typeMap.mount_group["外攻"],
                h = typeMap.mount_group["治疗"];
            for (const key in this.xfmaps) {
                if (T.includes(this.xfmaps[key].id)) {
                    map.T.push(this.xfmaps[key]);
                } else if (n.includes(this.xfmaps[key].id)) {
                    map.NDPS.push(this.xfmaps[key]);
                } else if (w.includes(this.xfmaps[key].id)) {
                    map.WDPS.push(this.xfmaps[key]);
                } else if (h.includes(this.xfmaps[key].id)) {
                    map.HPS.push(this.xfmaps[key]);
                }
            }
            return map;
        },
        roleRows() {
            const splitArray = (arr) => {
                const mid = Math.ceil(arr.length / 2);
                return [arr.slice(0, mid), arr.slice(mid)];
            };
            const [ndps1, ndps2] = splitArray(this.typeMap.NDPS);
            const [wdps1, wdps2] = splitArray(this.typeMap.WDPS);
            const categories = [this.typeMap.T, this.typeMap.HPS, ndps1, ndps2, wdps1, wdps2];
            const maxRows = Math.max(...categories.map((cat) => cat.length));
            const rows = [];
            for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
                const row = [];
                for (let colIndex = 0; colIndex < 6; colIndex++) {
                    const category = categories[colIndex];
                    row.push(category[rowIndex] || null);
                }
                rows.push(row);
            }

            return rows;
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
        selectRole(role) {
            if (role) {
                this.form.mount = role.id;
            } else {
                this.form.mount = 0;
            }
        },
        handleEdit() {
            updateMember(this.$route.query.id, this.item.id, { ...this.form, serial_no: this.item.serial_no }).then(
                (res) => {
                    this.$message.success("修改成功");
                    this.dialogVisible = false;
                    this.$emit("update");
                }
            );
        },
        handleDelete() {
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
}
</style>
