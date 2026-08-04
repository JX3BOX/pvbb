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

                <el-form-item :label="$t('team.raid.memberSetting.roleName')" prop="name">
                    <el-input
                        v-if="!['normal', 'sub'].includes(mode)"
                        v-model="form.name"
                        :placeholder="$t('team.raid.memberSetting.rolePlaceholder')"
                        :disabled="!canEdit"
                        clearable
                    />

                    <div v-else class="m-raid-member-source">
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
                                clearable
                                :placeholder="$t('team.raid.memberSetting.selectBound')"
                                :disabled="!canEdit"
                                @change="handleChange"
                            >
                                <el-option v-for="role in roles" :key="role.ID" :label="role.name" :value="role.ID">
                                    <div class="m-raid-member-option">
                                        <img :src="showSchoolIcon(role.mount)" :alt="role.name" />
                                        <span>{{ role.name }}</span>
                                        <small v-if="role.server">{{ role.server }}</small>
                                    </div>
                                </el-option>
                            </el-select>
                            <div class="m-raid-member-divider"><span>{{ $t("team.raid.memberSetting.orTemporary") }}</span></div>
                            <el-input
                                v-model="form.name"
                                :placeholder="$t('team.raid.memberSetting.temporaryPlaceholder')"
                                :disabled="!canEdit"
                                clearable
                            />
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
                <el-button @click="handleCancel">{{ $t("team.raid.common.cancel") }}</el-button>
                <el-button type="primary" :loading="addLoading" @click="handleSave">{{ $t("team.raid.memberSetting.save") }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { getRoles, addNormalMember, addSubMember, updateMember } from "@/service/team/raid.js";
import xf_map from "@jx3box/jx3box-data/data/xf/xf.json";
import mountg from "@jx3box/jx3box-data/data/xf/mount_group.json";
import cloneDeep from "lodash/cloneDeep";
import pick from "lodash/pick";
import { showMountIcon, showSchoolIcon } from "@/utils/filters";

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
        loading: false,
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
        visible(val) {
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
                        title: this.$t("team.raid.common.tip"),
                        message: this.$t("team.raid.board.full"),
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
                this.selectedSchool = Number(member.mount) || 0;
                this.form.mount = this.xfMaps[0]?.id || "";
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
        showMountIcon,
        showSchoolIcon,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/team/raid/member_setting.less";
</style>
