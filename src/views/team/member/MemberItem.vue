<template>
    <article class="u-member-item">
        <button
            class="u-member-card-trigger"
            type="button"
            aria-haspopup="dialog"
            :aria-label="`查看 ${(item.user_info && item.user_info.display_name) || item.uid} 的角色列表`"
            @click="roleDialogVisible = true"
        >
            <span class="u-member-profile">
                <img class="u-avatar" :src="showAvatar(item.user_info && item.user_info.avatar)" alt="" />
                <span class="u-member-copy">
                    <b class="u-name">{{ (item.user_info && item.user_info.display_name) || "未注册" }}</b>
                    <em>UID {{ item.uid || "--" }}</em>
                </span>
            </span>
            <span class="u-role-count">{{ localRoles.length }} 个角色</span>
            <el-icon class="u-open-icon" aria-hidden="true"><ArrowRight /></el-icon>
        </button>
    </article>

    <el-dialog
        v-model="roleDialogVisible"
        class="m-member-role-dialog"
        width="520px"
        append-to-body
        destroy-on-close
    >
        <template #header>
            <div class="m-member-role-dialog-header">
                <a
                    class="u-dialog-member-link"
                    :href="authorLink(item.uid)"
                    target="_blank"
                    rel="noopener noreferrer"
                    :aria-label="`查看 ${(item.user_info && item.user_info.display_name) || item.uid} 的账号主页`"
                    title="查看账号主页"
                >
                    <img class="u-dialog-avatar" :src="showAvatar(item.user_info && item.user_info.avatar)" alt="" />
                    <span class="u-dialog-member-copy">
                        <b>{{ (item.user_info && item.user_info.display_name) || "未注册" }}</b>
                        <em>UID {{ item.uid || "--" }} · {{ localRoles.length }} 个角色</em>
                    </span>
                </a>
            </div>
        </template>

        <div class="m-member-role-dialog-body">
            <div v-if="localRoles.length" class="u-dialog-roles">
                <div
                    class="u-dialog-role-item"
                    v-for="(role, index) in localRoles"
                    :key="`${role.relation.role_id}-${index}`"
                >
                    <router-link
                        v-if="role.relation.role_id"
                        class="u-role"
                        :to="'/role/' + role.relation.role_id"
                        target="_blank"
                        :title="role.roleInfo.name"
                    >
                        <img class="u-role-pic" :src="showSchoolIcon(role.roleInfo.mount)" alt="" />
                        <span class="u-role-copy">
                            <b class="u-role-name">{{ role.roleInfo.name }}</b>
                            <em>{{ showBodyType(role.roleInfo.body_type) }}</em>
                        </span>
                    </router-link>
                    <button
                        class="u-remove-role"
                        type="button"
                        :aria-label="`移除角色 ${role.roleInfo.name}`"
                        :disabled="removingRoleIds.includes(role.relation.role_id)"
                        @click="onRemoveRole(role)"
                    >
                        <el-icon><Close /></el-icon>
                        <span>移除</span>
                    </button>
                </div>
            </div>
            <div v-else class="u-dialog-empty">
                <span>该账号暂无角色</span>
            </div>
        </div>

        <template #footer>
            <div class="m-member-role-dialog-footer">
                <button
                    v-if="item.uid"
                    class="u-remove-account"
                    type="button"
                    :aria-label="`移除成员 ${(item.user_info && item.user_info.display_name) || item.uid}`"
                    :disabled="removingAccount"
                    @click="removeAccount"
                >
                    <el-icon><Delete /></el-icon>
                    <span>{{ removingAccount ? "正在移除" : "移除成员" }}</span>
                </button>
                <button class="u-dialog-done" type="button" @click="roleDialogVisible = false">完成</button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { authorLink, showAvatar } from "@jx3box/jx3box-common/js/utils";
import { removeTeamRole, removeTeamRoleAll } from "@/service/team/admin.js";
import { showBodyType, showSchoolIcon } from "@/utils/filters";
import { ArrowRight, Close, Delete } from "@element-plus/icons-vue";
export default {
    name: "MemberItem",
    emits: ["remove"],
    props: {
        item: {
            type: Object,
            default: () => ({}),
        },
        id: {
            type: [Number, String],
        },
    },
    data() {
        return {
            localRoles: Array.isArray(this.item?.roles) ? [...this.item.roles] : [],
            roleDialogVisible: false,
            removingAccount: false,
            removingRoleIds: [],
        };
    },
    computed: {
        team_id: function () {
            return this.id;
        },
    },
    watch: {
        "item.roles": {
            deep: true,
            handler: function (roles) {
                this.localRoles = Array.isArray(roles) ? [...roles] : [];
            },
        },
    },
    methods: {
        showBodyType,
        showSchoolIcon,
        removeAccount: function () {
            this.$confirm("此操作会将该账号下所有角色移除，确定移除该账号？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    this.removingAccount = true;
                    return removeTeamRoleAll(this.team_id, this.item.uid)
                        .then(() => {
                            this.$notify({
                                title: "移除成功",
                                message: "已移除该账号",
                                type: "success",
                            });
                            this.$emit("remove", this.item.uid);
                        })
                        .finally(() => {
                            this.removingAccount = false;
                        });
                })
                .catch(() => {});
        },
        onRemoveRole: function (role) {
            this.$confirm("确定移除该角色？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    const roleId = role.relation.role_id;
                    this.removingRoleIds.push(roleId);
                    return removeTeamRole(this.team_id, roleId)
                        .then(() => {
                            this.$notify({
                                title: "移除成功",
                                message: "已移除该角色",
                                type: "success",
                            });
                            this.localRoles = this.localRoles.filter((item) => item.relation.role_id != roleId);
                            if (!this.localRoles.length) this.$emit("remove", this.item.uid);
                        })
                        .finally(() => {
                            this.removingRoleIds = this.removingRoleIds.filter((id) => id !== roleId);
                        });
                })
                .catch(() => {});
        },
        showAvatar: function (val) {
            return showAvatar(val, 204);
        },
        authorLink,
    },
    components: {
        ArrowRight,
        Close,
        Delete,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/member/member_item.less";
</style>
