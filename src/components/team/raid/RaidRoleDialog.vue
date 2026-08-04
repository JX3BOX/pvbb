<template>
    <el-dialog
        v-model="visible"
        class="m-raid-role-dialog"
        width="520px"
        append-to-body
        destroy-on-close
        :close-on-click-modal="false"
        @closed="reset"
    >
        <template #header>
            <div class="m-raid-role-dialog__title">
                <span class="u-title-icon"><i class="el-icon-user"></i></span>
                <div>
                    <strong>{{ $t("team.raid.roleDialog.title") }}</strong>
                    <span>{{ $t("team.raid.roleDialog.hint") }}</span>
                </div>
            </div>
        </template>

        <div class="m-raid-role-dialog__body" v-loading="loading">
            <el-alert
                v-if="loadError"
                :title="$t('team.raid.roleDialog.loadFailed')"
                type="error"
                show-icon
                :closable="false"
            />

            <template v-else-if="displayRole">
                <section class="m-raid-role-profile">
                    <RoleAvatar
                        class="u-role-icon"
                        :mount="displayRole.school"
                        :body_type="displayRole.body_type"
                        :alt="displayRole.name"
                    />
                    <div class="u-role-copy">
                        <div class="u-name-line">
                            <strong>{{ displayRole.name || member.name || $t("team.raid.roleDialog.unnamed") }}</strong>
                            <span v-if="role && !Number(role.custom)" class="u-verified">
                                <i class="el-icon-circle-check"></i> {{ $t("team.raid.roleDialog.verified") }}
                            </span>
                        </div>
                        <span>{{ displayRole.server || member.server || $t("team.raid.roleDialog.unknownServer") }}</span>
                    </div>
                </section>

                <section class="m-raid-role-meta">
                    <div class="u-meta-item">
                        <span class="u-meta-label">{{ $t("team.raid.roleDialog.school") }}</span>
                        <strong class="u-meta-value">
                            {{ showSchoolName(displayRole.school) || $t("team.raid.common.unknown") }}
                        </strong>
                    </div>
                    <div class="u-meta-item">
                        <span class="u-meta-label">{{ $t("team.raid.roleDialog.mount") }}</span>
                        <strong class="u-meta-value">
                            {{ showMountName(displayRole.mount) || $t("team.raid.common.unknown") }}
                        </strong>
                    </div>
                    <div class="u-meta-item">
                        <span class="u-meta-label">{{ $t("team.raid.roleDialog.bodyType") }}</span>
                        <strong class="u-meta-value">{{ showBodyType(displayRole.body_type) || $t("team.raid.common.unknown") }}</strong>
                    </div>
                </section>

                <section v-if="role && (role.display_name || role.uid)" class="m-raid-role-owner">
                    <span class="u-section-label">{{ $t("team.raid.roleDialog.owner") }}</span>
                    <div class="u-owner-card">
                        <img :src="showAvatar(role.user_avatar)" alt="" />
                        <div>
                            <strong>{{ role.display_name || $t("team.raid.roleDialog.nicknameUnset") }}</strong>
                            <span>UID {{ role.uid || "--" }}</span>
                        </div>
                    </div>
                </section>

                <section v-if="member.remark || role?.note" class="m-raid-role-note">
                    <span class="u-section-label">{{ $t("team.raid.roleDialog.remark") }}</span>
                    <p>{{ member.remark || role.note }}</p>
                </section>
            </template>
        </div>

        <template #footer>
            <div class="m-raid-role-dialog__footer">
                <el-button type="primary" @click="visible = false">{{ $t("team.raid.roleDialog.close") }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { getRole } from "@/service/team/role.js";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import {
    showBodyType,
    showMountName,
    showSchoolName,
} from "@/utils/filters";
import RoleAvatar from "@/components/team/widget/RoleAvatar.vue";
import xfMap from "@jx3box/jx3box-data/data/xf/xf.json";

const BODY_TYPE_MAP = {
    1: 1,
    2: 2,
    5: 5,
    6: 6,
    m2: 1,
    f2: 2,
    m1: 5,
    f1: 6,
    "\u6210\u7537": 1,
    "\u6210\u5973": 2,
    "\u6b63\u592a": 5,
    "\u841d\u8389": 6,
};

function normalizeBodyType(...values) {
    const value = values.find((item) => Object.prototype.hasOwnProperty.call(BODY_TYPE_MAP, item));
    return value === undefined ? 0 : BODY_TYPE_MAP[value];
}

export default {
    name: "RaidRoleDialog",
    components: { RoleAvatar },
    props: {
        modelValue: { type: Boolean, default: false },
        roleId: { type: [Number, String], default: "" },
        member: { type: Object, default: () => ({}) },
    },
    emits: ["update:modelValue"],
    data() {
        return {
            role: null,
            loading: false,
            loadError: false,
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
        displayRole() {
            if (!this.role && !this.member) return null;
            const boundRole = this.$store.state.roles.find(
                (item) => String(item.ID || item.id) === String(this.roleId)
            ) || {};
            const roleInfo = this.role?.role_info || this.role?.roleInfo || this.role?.info || {};
            const roleMount = Number(boundRole.mount) || Number(this.role?.mount) || Number(roleInfo.mount) || 0;
            const mount =
                Number(this.member?.mount) ||
                Number(this.member?.xf) ||
                Number(this.member?.xfid) ||
                Number(boundRole.xf) ||
                Number(boundRole.xfid) ||
                Number(this.role?.xf) ||
                Number(this.role?.xfid) ||
                Number(roleInfo.xf) ||
                Number(roleInfo.xfid) ||
                (roleMount >= 1000 ? roleMount : 0) ||
                0;
            const mountSchool = Object.values(xfMap).find((item) => Number(item.id) === mount)?.school || 0;
            const school = (roleMount > 0 && roleMount < 1000 ? roleMount : 0) || mountSchool;
            const sourceBodyType = normalizeBodyType(
                boundRole.body_type,
                boundRole.bodyType,
                boundRole.body,
                boundRole.body_id,
                this.role?.body_type,
                this.role?.bodyType,
                this.role?.body,
                this.role?.body_id,
                roleInfo.body_type,
                roleInfo.bodyType,
                roleInfo.body,
                roleInfo.body_id,
                this.member?.body_type,
                this.member?.bodyType,
                this.member?.body,
                this.member?.body_id
            );
            const bodyType = school === 4 && ![2, 6].includes(sourceBodyType) ? 6 : sourceBodyType;
            return {
                ...(this.member || {}),
                ...roleInfo,
                ...(this.role || {}),
                ...boundRole,
                name: boundRole.name || this.role?.name || roleInfo.name || this.member?.name,
                server: boundRole.server || this.role?.server || roleInfo.server || this.member?.server,
                school,
                mount,
                body_type: bodyType,
            };
        },
    },
    watch: {
        modelValue(value) {
            if (value) this.loadRole();
        },
    },
    methods: {
        async loadRole() {
            if (!this.roleId) return;
            this.loading = true;
            this.loadError = false;
            try {
                const res = await getRole(this.roleId);
                this.role = res?.data?.data || null;
            } catch (e) {
                this.loadError = true;
            } finally {
                this.loading = false;
            }
        },
        reset() {
            this.role = null;
            this.loading = false;
            this.loadError = false;
        },
        showAvatar,
        showBodyType,
        showMountName,
        showSchoolName,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/role_dialog.less";
</style>
