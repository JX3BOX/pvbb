<template>
    <el-dialog
        v-model="dialogVisible"
        class="m-raid-member-setting"
        width="680px"
        align-center
        append-to-body
        :close-on-click-modal="false"
    >
        <template #header>
            <div class="m-raid-member-setting__title">
                <span class="u-title-icon"><i class="el-icon-user"></i></span>
                <div>
                    <strong>{{ title || $t("team.raid.board.roleSettings") }}</strong>
                    <span>{{ $t("team.raid.memberSetting.hint") }}</span>
                </div>
            </div>
        </template>

        <el-form ref="roleForm" class="m-raid-member-setting__form" :model="form" :rules="rules" label-position="top">
            <section class="m-raid-member-setting__section">
                <header>
                    <strong>{{ $t("team.raid.memberSetting.roleInfo") }}</strong>
                    <span>{{ $t("team.raid.memberSetting.roleInfoHint") }}</span>
                </header>

                <div class="m-raid-member-filter-row">
                    <el-form-item :label="$t('team.raid.memberSetting.school')">
                        <el-select
                            v-model="selectedSchool"
                            :placeholder="$t('team.raid.memberSetting.schoolPlaceholder')"
                            :disabled="!canEdit"
                            filterable
                            @change="handleSchoolChange"
                        >
                            <el-option
                                v-for="school in schoolOptions"
                                :key="school.id"
                                :label="school.name"
                                :value="school.id"
                            >
                                <div class="m-raid-member-option">
                                    <img v-if="school.id" :src="showSchoolIcon(school.id)" :alt="school.name" />
                                    <span>{{ school.name }}</span>
                                </div>
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item :label="$t('team.raid.memberSetting.mount')" prop="mount">
                        <el-select
                            v-model="form.mount"
                            :placeholder="$t('team.raid.memberSetting.selectMount')"
                            filterable
                            clearable
                            @change="handleMountChange"
                        >
                            <el-option v-for="xf in mountOptions" :key="xf.id" :value="xf.id" :label="xf.name">
                                <div class="m-raid-member-option">
                                    <img :src="showMountIcon(xf.id)" :alt="xf.name" />
                                    <span>{{ xf.name }}</span>
                                </div>
                            </el-option>
                        </el-select>
                    </el-form-item>
                </div>

                <el-form-item :label="$t('team.raid.memberSetting.roleName')" prop="name">
                    <div class="m-raid-member-source">
                        <div v-if="form.role_id" class="m-raid-selected-role">
                            <img :src="showMountIcon(form.mount)" :alt="form.name" />
                            <div>
                                <strong>{{ form.name }}</strong>
                                <span>{{ $t("team.raid.memberSetting.boundHint") }}</span>
                            </div>
                            <el-button link type="primary" :disabled="!canEdit" @click="removeRole">{{ $t("team.raid.memberSetting.changeRole") }}</el-button>
                        </div>
                        <template v-else>
                            <el-select
                                v-model="tmpVal"
                                popper-class="m-raid-pop-member-select"
                                teleported
                                filterable
                                allow-create
                                clearable
                                :placeholder="$t('team.raid.memberSetting.rolePlaceholder')"
                                :disabled="!canEdit"
                                @change="handleChange"
                            >
                                <el-option
                                    v-for="role in filteredRoles"
                                    :key="role.ID"
                                    :label="role.name"
                                    :value="role.ID"
                                >
                                    <div class="m-raid-member-option">
                                        <span>{{ role.name }}</span>
                                        <span class="u-role-mounts">
                                            <img
                                                v-for="mount in getRoleMounts(role)"
                                                :key="mount"
                                                :src="showMountIcon(mount)"
                                                :alt="showMountName(mount)"
                                                :title="showMountName(mount)"
                                            />
                                        </span>
                                        <small v-if="role.server">{{ role.server }}</small>
                                    </div>
                                </el-option>
                            </el-select>
                        </template>
                    </div>
                </el-form-item>
            </section>

            <section class="m-raid-member-setting__section">
                <header>
                    <strong>{{ $t("team.raid.memberSetting.rosterSettings") }}</strong>
                    <span>{{ $t("team.raid.memberSetting.rosterHint") }}</span>
                </header>
                <el-form-item :label="$t('team.raid.memberSetting.remark')" prop="remark">
                    <el-input
                        v-model="form.remark"
                        type="textarea"
                        :rows="2"
                        resize="none"
                        show-word-limit
                        :maxlength="20"
                        :placeholder="$t('team.raid.memberSetting.remarkPlaceholder')"
                    />
                </el-form-item>
            </section>
        </el-form>

        <template #footer>
            <div class="m-raid-member-setting__footer">
                <el-button :disabled="addLoading" @click="handleCancel">{{ $t("team.raid.common.cancel") }}</el-button>
                <el-button type="primary" :loading="addLoading" @click="handleSave">{{ $t("team.raid.memberSetting.save") }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { addNormalMember, addSubMember, updateMember } from "@/service/team/raid.js";
import xf_map from "@jx3box/jx3box-data/data/xf/xf.json";
import mountg from "@jx3box/jx3box-data/data/xf/mount_group.json";
import school_map from "@jx3box/jx3box-data/data/xf/schoolid.json";
import cloneDeep from "lodash/cloneDeep";
import pick from "lodash/pick";
import { showMountIcon, showMountName, showSchoolIcon } from "@/utils/filters";
import { getRequestErrorMessage } from "@/utils/common";

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
    emits: ["close", "updateRole"],
    data: () => ({
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
        addLoading: false,
        selectedSchool: 0,

        tmpVal: "",

        // 角色职能
        mountg,
    }),
    computed: {
        dialogVisible: {
            get() {
                return this.visible;
            },
            set(val) {
                if (!val) {
                    this.handleCancel();
                }
            },
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
        mountOptions() {
            if (!this.form.role_id) return this.xfMaps;

            const role = this.roles.find((item) => String(item.ID) === String(this.form.role_id));
            if (!role) return this.xfMaps;

            const roleMounts = new Set(this.getRoleMounts(role));
            return this.xfMaps.filter((item) => roleMounts.has(Number(item.id)));
        },
        schoolOptions() {
            return Object.entries(school_map).map(([id, name]) => ({
                id: Number(id),
                name: Number(id) === 0 ? this.$t("team.raid.memberSetting.allSchools") : name,
            }));
        },
        filteredRoles() {
            const roles = Array.isArray(this.roles) ? this.roles : [];
            return roles.filter((role) => {
                if (this.usedRoleIds.has(String(role.ID))) return false;

                const roleMounts = this.getRoleMounts(role);
                if (this.form.mount) return this.isRoleCompatibleWithMount(role, this.form.mount);
                if (!this.selectedSchool) return true;
                return roleMounts.some((mount) => this.getSchoolByMount(mount) === Number(this.selectedSchool));
            });
        },
        allRoles() {
            return Array.isArray(this.$store.state.roles) ? this.$store.state.roles : [];
        },
        usedRoleIds() {
            const currentRoleId = String(this.data?.role_id || "");
            const lists = [
                this.members,
                this.$store.state.normalMembers,
                this.$store.state.subMembers,
                this.$store.state.tobeMembers,
            ];
            return new Set(
                lists
                    .flatMap((list) => (Array.isArray(list) ? list : []))
                    .map((member) => String(member?.role_id || ""))
                    .filter((roleId) => roleId && roleId !== currentRoleId),
            );
        },
        isMaxCount() {
            const max = Number(this.max);
            if (!(max > 0)) return false;

            return this.members?.filter((member) => Number(member?.is_valid) === 1).length >= max;
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
                    this.selectedSchool = this.getSchoolByMount(val.mount);
                    this.tmpVal = val.role_id || val.name || "";
                }
            },
        },
        visible(val) {
            if (val) this.roles = cloneDeep(this.allRoles);
        },
        allRoles: {
            deep: true,
            handler(val) {
                if (this.visible) this.roles = cloneDeep(val);
            },
        },
    },
    methods: {
        async handleSave() {
            if (this.addLoading) return;

            const isExistingValidMember = Number(this.data?.is_valid) === 1;
            if (this.mode === "normal" && !isExistingValidMember && this.isMaxCount) {
                this.$notify({
                    title: this.$t("team.raid.common.tip"),
                    message: this.$t("team.raid.board.full"),
                    type: "warning",
                });
                return;
            }

            this.addLoading = true;
            try {
                if (this.data?.id) {
                    const data = pick(this.form, ["name", "mount", "remark"]);
                    data.role_id = this.form.role_id || null;
                    data.order = this.data.order;
                    await updateMember(this.raidId, this.data.id, data);
                    this.$emit("updateRole", {
                        ...this.data,
                        ...data,
                        is_valid: data.name || data.role_id ? 1 : 0,
                    });
                    this.resetForm();
                } else {
                    await this.add(this.data?.order);
                }
            } catch (error) {
                this.$notify({
                    title: this.$t("team.raid.common.tip"),
                    message: getRequestErrorMessage(error, this.$t("team.raid.misc.retry")),
                    type: "error",
                });
            } finally {
                this.addLoading = false;
            }
        },
        async add(order) {
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

            const res = await fn(this.raidId, data);
            this.$emit("updateRole", res.data.data);
            this.resetForm();
        },
        handleCancel() {
            this.roles = cloneDeep(this.allRoles);
            this.resetForm();
            this.$emit("close");
        },
        resetForm() {
            this.form = cloneDeep(default_form);
            this.tmpVal = "";
            this.selectedSchool = 0;
            this.$refs.roleForm?.clearValidate();
        },
        handleChange(val) {
            this.form.role_id = 0;
            const member = this.roles.find((role) => String(role.ID) === String(val));

            if (member) {
                const currentMount = Number(this.form.mount);
                const roleMounts = this.getRoleMounts(member);
                this.form.name = member.name;
                this.form.role_id = member.ID;
                if (!this.selectedSchool) {
                    const schools = new Set(roleMounts.map((mount) => this.getSchoolByMount(mount)));
                    if (schools.size === 1) this.selectedSchool = [...schools][0];
                }
                const availableMounts = roleMounts.filter(
                    (mount) => !this.selectedSchool || this.getSchoolByMount(mount) === Number(this.selectedSchool),
                );
                if (currentMount && availableMounts.includes(currentMount)) {
                    this.form.mount = currentMount;
                } else {
                    this.form.mount = availableMounts.length === 1 ? availableMounts[0] : "";
                }
                this.tmpVal = member.ID;
                return;
            }

            this.form.name = typeof val === "string" ? val.trim() : "";
            this.tmpVal = this.form.name;
            this.syncMountSelection();
        },
        normalizeMounts(value) {
            const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [value];
            return [...new Set(values.map(Number).filter((mount) => mount > 0 && this.getMountInfo(mount)))];
        },
        getMountInfo(mount) {
            const mountId = Number(mount);
            return Object.values(xf_map).find((item) => Number(item.id) === mountId);
        },
        getRoleMounts(role) {
            const preferredMounts = this.normalizeMounts(role?.mounts);
            if (preferredMounts.length) return preferredMounts;

            const mountId = Number(role?.mount);
            if (this.getMountInfo(mountId)) return [mountId];
            return Object.values(xf_map)
                .filter((item) => Number(item.school) === mountId)
                .map((item) => Number(item.id));
        },
        isRoleCompatibleWithMount(role, mount) {
            const mountId = Number(mount);
            const preferredMounts = this.normalizeMounts(role?.mounts);
            if (preferredMounts.length) return preferredMounts.includes(mountId);

            const roleMount = Number(role?.mount);
            if (this.getMountInfo(roleMount)) return roleMount === mountId;
            return roleMount > 0 && roleMount === this.getSchoolByMount(mountId);
        },
        getSchoolByMount(mount) {
            const mountId = Number(mount);
            const mountInfo = this.getMountInfo(mountId);
            return Number(mountInfo?.school) || mountId || 0;
        },
        handleSchoolChange() {
            if (!this.selectedSchool) {
                this.form.mount = "";
                return;
            }
            if (this.form.role_id) {
                const role = this.roles.find((item) => String(item.ID) === String(this.form.role_id));
                const matchesSchool = this.getRoleMounts(role).some(
                    (mount) => this.getSchoolByMount(mount) === Number(this.selectedSchool),
                );
                if (!matchesSchool) {
                    this.clearRole();
                }
            }
            this.syncMountSelection();
        },
        handleMountChange() {
            if (!this.form.mount) return;
            this.selectedSchool = this.getSchoolByMount(this.form.mount);
            if (this.form.role_id) {
                const role = this.roles.find((item) => String(item.ID) === String(this.form.role_id));
                if (!this.isRoleCompatibleWithMount(role, this.form.mount)) this.clearRoleBinding();
            }
        },
        syncMountSelection() {
            if (!this.selectedSchool) {
                this.form.mount = "";
                return;
            }
            const options = this.mountOptions;
            const hasCurrentMount = options.some((item) => Number(item.id) === Number(this.form.mount));
            if (hasCurrentMount) return;
            this.form.mount = options.length === 1 ? options[0].id : "";
        },
        clearRoleBinding() {
            this.form.role_id = 0;
            this.form.name = "";
            this.tmpVal = "";
        },
        clearRole() {
            this.clearRoleBinding();
            this.form.mount = "";
        },
        removeRole() {
            this.clearRole();
        },
        showMountIcon,
        showMountName,
        showSchoolIcon,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/team/raid/member_setting.less";
</style>
