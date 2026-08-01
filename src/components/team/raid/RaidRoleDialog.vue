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
                    <strong>角色信息</strong>
                    <span>查看当前排表成员的绑定角色资料</span>
                </div>
            </div>
        </template>

        <div class="m-raid-role-dialog__body" v-loading="loading">
            <el-alert
                v-if="loadError"
                title="角色信息加载失败，请稍后重试"
                type="error"
                show-icon
                :closable="false"
            />

            <template v-else-if="displayRole">
                <section class="m-raid-role-profile">
                    <img class="u-role-icon" :src="showMountIcon(displayRole.mount)" :alt="displayRole.name" />
                    <div class="u-role-copy">
                        <div class="u-name-line">
                            <strong>{{ displayRole.name || member.name || "未命名角色" }}</strong>
                            <span v-if="role && !Number(role.custom)" class="u-verified">
                                <i class="el-icon-circle-check"></i> 已认证
                            </span>
                        </div>
                        <span>{{ displayRole.server || member.server || "服务器未知" }}</span>
                    </div>
                </section>

                <section class="m-raid-role-meta">
                    <div>
                        <span>门派</span>
                        <strong>{{ showRoleSchool(displayRole.mount) || "未知" }}</strong>
                    </div>
                    <div>
                        <span>心法</span>
                        <strong>{{ showMountName(displayRole.mount) || "未知" }}</strong>
                    </div>
                    <div>
                        <span>体型</span>
                        <strong>{{ showBodyType(displayRole.body_type) || "未知" }}</strong>
                    </div>
                </section>

                <section v-if="role && (role.display_name || role.uid)" class="m-raid-role-owner">
                    <span class="u-section-label">绑定账号</span>
                    <div class="u-owner-card">
                        <img :src="showAvatar(role.user_avatar)" alt="" />
                        <div>
                            <strong>{{ role.display_name || "未设置昵称" }}</strong>
                            <span>UID {{ role.uid || "--" }}</span>
                        </div>
                    </div>
                </section>

                <section v-if="member.remark || role?.note" class="m-raid-role-note">
                    <span class="u-section-label">排表备注</span>
                    <p>{{ member.remark || role.note }}</p>
                </section>
            </template>
        </div>

        <template #footer>
            <div class="m-raid-role-dialog__footer">
                <el-button type="primary" @click="visible = false">知道了</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { getRole } from "@/service/team/role.js";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import { showBodyType, showMountIcon, showMountName, showSchoolName } from "@/utils/filters";
import xfMap from "@jx3box/jx3box-data/data/xf/xf.json";

export default {
    name: "RaidRoleDialog",
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
            return {
                ...(this.member || {}),
                ...(this.role || {}),
                name: this.role?.name || this.member?.name,
                server: this.role?.server || this.member?.server,
                mount: Number(this.role?.mount) || Number(this.member?.mount) || 0,
                body_type: this.role?.body_type || this.member?.body_type,
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
        showMountIcon,
        showMountName,
        showSchoolName,
        showRoleSchool(mount) {
            const school = Object.values(xfMap).find((item) => Number(item.id) === Number(mount))?.school;
            return school ? showSchoolName(school) : "";
        },
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/role_dialog.less";
</style>
