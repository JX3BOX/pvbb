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

                <el-form-item :label="$t('team.raid.memberSetting.school')">
                    <el-select
                        v-model="selectedSchool"
                        :placeholder="$t('team.raid.memberSetting.schoolPlaceholder')"
                        :disabled="!canEdit"
                        filterable
                        clearable
                        @change="handleSchoolChange"
                    >
                        <el-option
                            v-for="school in schoolOptions"
                            :key="school.id"
                            :label="school.name"
                            :value="school.id"
                        >
                            <div class="m-raid-member-option">
                                <img :src="showSchoolIcon(school.id)" :alt="school.name" />
                                <span>{{ school.name }}</span>
                            </div>
                        </el-option>
                    </el-select>
                </el-form-item>

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
                                        <img :src="showSchoolIcon(role.mount)" :alt="role.name" />
                                        <span>{{ role.name }}</span>
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
                <el-form-item :label="$t('team.raid.memberSetting.mount')" prop="mount">
                    <el-select v-model="form.mount" :placeholder="$t('team.raid.memberSetting.selectMount')" filterable clearable>
                        <el-option v-for="xf in xfMaps" :key="xf.id" :value="xf.id" :label="xf.name">
                            <div class="m-raid-member-option">
                                <img :src="showMountIcon(xf.id)" :alt="xf.name" />
                                <span>{{ xf.name }}</span>
                            </div>
                        </el-option>
                    </el-select>
                </el-form-item>

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
import { showMountIcon, showSchoolIcon } from "@/utils/filters";
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
        schoolOptions() {
            return Object.entries(school_map).map(([id, name]) => ({ id: Number(id), name }));
        },
        filteredRoles() {
            if (!this.selectedSchool) return this.roles;
            return this.roles.filter((role) => this.getSchoolByMount(role.mount) === this.selectedSchool);
        },
        allRoles() {
            return this.$store.state.roles;
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
                this.form.name = member.name;
                this.form.role_id = member.ID;
                this.selectedSchool = this.getSchoolByMount(member.mount);
                this.form.mount = this.xfMaps[0]?.id || "";
                this.tmpVal = member.ID;
                return;
            }

            this.form.name = typeof val === "string" ? val.trim() : "";
            this.tmpVal = this.form.name;
            this.ensureMountMatchesSchool();
        },
        getSchoolByMount(mount) {
            const mountId = Number(mount);
            const mountInfo = Object.values(xf_map).find((item) => Number(item.id) === mountId);
            return Number(mountInfo?.school) || mountId || 0;
        },
        handleSchoolChange() {
            if (this.form.role_id) {
                const role = this.roles.find((item) => String(item.ID) === String(this.form.role_id));
                if (!this.selectedSchool || this.getSchoolByMount(role?.mount) !== this.selectedSchool) {
                    this.clearRole();
                }
            }
            this.ensureMountMatchesSchool();
        },
        ensureMountMatchesSchool() {
            if (!this.selectedSchool) return;
            const hasCurrentMount = this.xfMaps.some((item) => Number(item.id) === Number(this.form.mount));
            if (!hasCurrentMount) this.form.mount = this.xfMaps[0]?.id || "";
        },
        clearRole() {
            this.form.role_id = 0;
            this.form.name = "";
            this.form.mount = "";
            this.tmpVal = "";
        },
        removeRole() {
            this.clearRole();
        },
        showMountIcon,
        showSchoolIcon,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/team/raid/member_setting.less";
</style>
