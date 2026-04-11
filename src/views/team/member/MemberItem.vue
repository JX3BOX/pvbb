<template>
    <div class="u-member-item">
        <div class="u-member-item-header">
            <a class="u-avatar" :href="authorLink(item.uid)">
                <img :src="showAvatar(item.user_info && item.user_info.avatar)" />
            </a>
            <a class="u-name" :href="authorLink(item.uid)">
                {{ (item.user_info && item.user_info.display_name) || "未注册" }}
            </a>
        </div>
        <div class="u-member-item-content">
            <el-row class="u-roles">
                <el-col
                    class="u-own-item"
                    :span="24"
                    v-for="(role, index) in item.roles"
                    :key="role.roleInfo.ID + index"
                >
                    <router-link
                        class="u-own-item-exact u-own-item-link u-role"
                        :to="'/role/' + role.relation.role_id"
                        target="_blank"
                        v-if="role.relation.role_id"
                        :title="role.roleInfo.name"
                    >
                        <img class="u-role-pic" :src="showSchoolIcon(role.roleInfo.mount)" alt />
                        <em>{{ showBodyType(role.roleInfo.body_type) }}</em>
                        <span class="u-role-name">
                            {{ role.roleInfo.name }}
                        </span>
                        <i class="el-icon-close u-del" @click.stop="(e) => onRemoveRole(e, role)"></i>
                    </router-link>
                </el-col>
            </el-row>
        </div>
        <div class="u-op">
            <el-tooltip class="item" effect="dark" content="移除该账号" placement="top">
                <el-button
                    v-if="item.uid"
                    class="u-btn u-reject"
                    type="info"
                    size="small"
                    plain
                    @click="removeAccount"
                    icon="Close"
                ></el-button>
            </el-tooltip>
        </div>
    </div>
</template>

<script>
import { authorLink, showAvatar } from "@jx3box/jx3box-common/js/utils";
import { addAdmin, removeTeamRole, removeTeamRoleAll } from "@/service/team/admin.js";
import { showBodyType, showSchoolIcon } from "@/utils/filters";
export default {
    name: "MemberItem",
    props: {
        item: {
            type: Object,
            default: () => {},
        },
        id: {
            type: Number,
        },
    },
    data() {
        return {
            data: [],
            per: 10,
            page: 1,
            total: 1,
            loading: false,
        };
    },
    computed: {
        team_id: function () {
            return this.id;
        },
        isPRO: function () {
            return this.$parent.isPRO;
        },
        setAdminTip: function () {
            let str = "设为管理员";
            if (!this.isPRO) str += ",仅专业版用户可用";
            return str;
        },
    },
    methods: {
        showBodyType,
        showSchoolIcon,
        setAdmin: function (team_id, user_id, item) {
            if (this.isPRO) {
                addAdmin(team_id, user_id).then((res) => {
                    this.$notify({
                        title: "添加成功",
                        message: "请在权限管理中添加相应权限",
                        type: "success",
                    });
                    item.isAdmin = true;
                });
            } else {
                this.$alert(
                    `仅专业版会员可用，<a target="_blank" href="/vip/premium/?from=team_userlist">点击开通</a>。`,
                    "提醒",
                    {
                        confirmButtonText: "确定",
                        dangerouslyUseHTMLString: true,
                    }
                );
            }
        },
        removeAccount: function () {
            this.$confirm("此操作会将该账号下所有角色移除，确定移除该账号？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    removeTeamRoleAll(this.team_id, this.item.uid).then((res) => {
                        this.$notify({
                            title: "移除成功",
                            message: "已移除该账号",
                            type: "success",
                        });
                        this.$emit("remove", this.item.uid);
                    });
                })
                .catch(() => {});
        },
        onRemoveRole: function (e, role) {
            e.stopPropagation();
            e.preventDefault();
            this.$confirm("确定移除该角色？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    removeTeamRole(this.team_id, role.relation.role_id).then((res) => {
                        this.$notify({
                            title: "移除成功",
                            message: "已移除该角色",
                            type: "success",
                        });
                        // eslint-disable-next-line vue/no-mutating-props
                        this.item.roles = this.item?.roles?.filter(
                            (item) => item.relation.role_id != role.relation.role_id
                        );
                    });
                })
                .catch(() => {});
        },
        showAvatar: function (val) {
            return showAvatar(val, 204);
        },
        authorLink,
    },
    filters: {},
    mounted: function () {},
};
</script>

<style lang="less">
@import "@/assets/css/team/member/member_item.less";
</style>
