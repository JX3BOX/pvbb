<template>
    <el-dialog :title="title" :visible="dialogVisivble" @close="handleCancel" width="720px">
        <el-form
            class="u-role-setting"
            :model="form"
            :rules="rules"
            ref="roleForm"
            label-width="120px"
            :label-position="position"
        >
            <el-form-item label="角色名称" prop="name">
                <el-input
                    v-if="!['normal', 'sub'].includes(mode)"
                    v-model="form.name"
                    class="u-name"
                    placeholder="请输入角色名称"
                    :disabled="!canEdit"
                ></el-input>
                <el-input
                    v-model="form.name"
                    placeholder="请输入团员名称"
                    class="u-role-setting-member"
                    :disabled="!!form.role_id || !canEdit"
                >
                    <template #append>
                        <el-select
                            v-model="tmpVal"
                            popper-class="m-raid-pop-member-select"
                            popper-append-to-body
                            @change="handleChange"
                            :disabled="!!form.role_id || !canEdit"
                        >
                            <el-option v-for="(role, index) in roles" :key="index" :label="role.name" :value="role.ID">
                                <div style="display: inline-flex; align-items: center">
                                    <img
                                        style="margin-right: 8px"
                                        width="24"
                                        height="24"
                                        :src="showSchoolIcon(role.mount)"
                                    />
                                    <span>{{ role.name }}</span>
                                </div>
                            </el-option>
                        </el-select>
                    </template>
                </el-input>
                <el-button
                    v-if="form.role_id"
                    :disabled="!canEdit"
                    class="u-remove-role"
                    type="text"
                    icon="CircleClose"
                    @click="removeRole"
                ></el-button>
            </el-form-item>
            <el-form-item label="指定心法" prop="mount">
                <el-select v-model="form.mount" placeholder="请选择心法" filterable>
                    <el-option v-for="xf in xfMaps" :key="xf.id" :value="xf.id" :label="xf.name">
                        <div style="display: inline-flex; align-items: center">
                            <img style="margin-right: 8px" width="24" height="24" :src="showMountIcon(xf.id)" />
                            <span>{{ xf.name }}</span>
                        </div>
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="备注内容" prop="remark">
                <el-input show-word-limit :maxlength="20" v-model="form.remark" placeholder="请输入备注"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :loading="addLoading" @click="handleSave">保存</el-button>
                <el-button @click="handleCancel">取消</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>

<script>
import { getRoles, addNormalMember, addSubMember, updateMember } from "@/service/team/raid.js";
import xf_map from "@jx3box/jx3box-data/data/xf/xf.json";
import mountg from "@jx3box/jx3box-data/data/xf/mount_group.json";
import { __imgPath } from "@/utils/config";
import cloneDeep from "lodash/cloneDeep";
import pick from "lodash/pick";
import { showSchoolIcon, showMountIcon } from "@/utils/filters";

const default_form = {
    role_func: "",
    name: "",
    mount: "",
    is_core: false,
    pending: [],
    remark: "",
    role_id: 0,
};
export default {
    name: "MemberSetting",
    props: ["data", "teamId", "mode", "title", "visible", "members", "max"],
    data: () => ({
        position: window.innerWidth < 768 ? "top" : "left",
        form: {
            role_func: "", // 角色职能
            name: "", // 角色名称
            mount: "", // 角色心法
            is_core: false, // 是否阵眼
            pending: [], // 替补
            remark: "", // 备注
            role_id: 0, // 角色id
        },
        rules: {},
        roles: [],
        substitute: [],
        loading: false,
        addLoading: false,
        selectedSchool: 0,

        tmpVal: "",

        // 角色职能
        mountg,
    }),
    computed: {
        dialogVisivble() {
            return this.visible;
        },
        xfMaps({ selectedSchool }) {
            if (selectedSchool) {
                const obj = {};
                for (const key in xf_map) {
                    if (xf_map[key].school === this.selectedSchool) {
                        obj[key] = xf_map[key];
                    }
                }
                return Object.values(obj);
            }
            return Object.values(xf_map);
        },
        allRoles() {
            return this.$store.state.roles;
        },
        isMaxCount() {
            return (
                this.members?.filter((member) => {
                    return member.remark || member.mount || member.role_id || member.name;
                }).length >= this.max
            );
        },
        raidId() {
            return this.$route.params.id;
        },
        canEdit() {
            return (this.data && this.data?.is_member_request === 0) || !this.data;
        },
    },
    watch: {
        data: {
            deep: true,
            handler(val) {
                if (val) {
                    for (const key of Object.keys(val)) {
                        this.form[key] = val[key];
                    }
                }
            },
        },
        dialogVisivble(val) {
            if (val) this.roles = cloneDeep(this.allRoles);
        },
    },
    methods: {
        handleSave() {
            // 修改
            if (this.data) {
                if (this.data.id) {
                    const data = pick(this.form, ["name", "mount", "remark"]);
                    data.role_id = this.form.role_id || null;
                    data.order = this.data.order;
                    updateMember(this.raidId, this.data.id, data).then(() => {
                        this.$emit("updateRole", data);
                    });
                } else {
                    this.add(this.data?.order);
                }
            } else {
                // 新增
                if (!this.isMaxCount) {
                    this.addLoading = true;
                    this.add();
                } else {
                    this.$notify({
                        title: "提示",
                        message: "成员数已达模板上限，不能继续添加",
                        type: "warning",
                    });
                }
            }
        },
        add(order) {
            const fn = this.mode === "normal" ? addNormalMember : addSubMember;

            let data = pick(this.form, ["name", "remark"]);
            this.form.role_id && (data.role_id = this.form.role_id);
            if (this.mode === "normal") {
                // 虚拟队员
                const member = this.members?.find((member) => member.is_virtual);
                if (member) {
                    data.order = order || member.order;
                } else {
                    const validMember = this.members?.find((member) => member.is_valid === 0);
                    validMember && (data.order = validMember.order);
                }
            }
            data.mount = ~~this.form.mount;

            fn(this.raidId, data)
                .then((res) => {
                    this.$emit("updateRole", res.data.data);
                    this.form = cloneDeep(default_form);
                    this.selectedSchool = 0;
                })
                .finally(() => {
                    this.addLoading = false;
                });
        },
        handleCancel() {
            this.roles = cloneDeep(this.allRoles);
            this.form = cloneDeep(default_form);
            this.$emit("close");
        },
        handleChange(val) {
            this.form.role_id = 0;
            const [member] = this.roles ? this.roles.filter((role) => role.ID === val) : [];

            if (member) {
                this.form.name = member.name;
                this.form.role_id = member.ID;
                this.selectedSchool = ~~member.mount;
                this.form.mount = this.xfMaps[0].id;
            }
        },
        remoteMethod(query) {
            if (query !== "") {
                getRoles(this.teamId, query).then((res) => {
                    this.roles = res.data.data.list;
                    this.loading = false;
                });
                // 如果新的id不在角色列表则重置已选择的门派
                if (this.roles?.some((r) => r.name === this.form.name)) {
                    this.selectedSchool = 0;
                }
            } else {
                this.roles = cloneDeep(this.allRoles);
                this.selectedSchool = 0;
            }
        },
        // 清空选择
        handleClear() {
            this.roles = cloneDeep(this.allRoles);
            this.selectedSchool = 0;
        },
        handleNameInput(val) {
            this.remoteMethod(val);
        },
        removeRole() {
            this.form.role_id = "";
            this.form.name = "";
            this.form.mount = "";
            this.selectedSchool = 0;
        },
        showSchoolIcon,
        showMountIcon,
    },
};
</script>

<style lang="less">
.u-role-setting {
    .el-dialog__body {
        padding-top: 0 !important;
    }
    .u-name {
        width: 200px;
        margin-right: 8px;
    }
    .el-form-item {
        margin-bottom: 22px;
    }
    .u-tip {
        margin-left: 4px;
    }
}
.m-raid-pop-member-select {
    width: 200px;
}
.u-role-setting-member {
    max-width: 220px;
    .el-input-group__append {
        padding: 0 18px;
    }
    .el-input__suffix {
        right: 10px;
    }
}

.u-remove-role {
    margin-left: 8px;
    cursor: pointer;
}
</style>
