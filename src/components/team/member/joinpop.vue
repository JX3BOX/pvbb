<template>
    <el-dialog
        class="m-team-joinpop"
        :title="title"
        v-model="visible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
        <div class="m-team-joinpop-form" v-if="data && data.length">
            <div class="u-msg">
                <!-- <i class="el-icon-warning-outline"></i> -->
                请选择需要加入该团队的角色
            </div>
            <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="selectAll" class="u-all"
                >全选</el-checkbox
            >
            <el-checkbox-group class="u-list" v-model="roles" @change="checkIsAll">
                <el-checkbox v-for="item in data" :value="item.ID" :key="item.ID" class="u-item" border>
                    <el-tooltip class="item" effect="dark" :content="item.note || item.name" placement="bottom">
                        <div>
                            <img class="u-item-avatar" :src="showAvatar(item.mount)" />

                            <span class="u-item-name">{{ item.name }}</span>
                            <span class="u-item-server">{{ item.server }}</span>
                        </div>
                    </el-tooltip>
                </el-checkbox>
            </el-checkbox-group>
        </div>
        <div class="m-team-joinpop-null" v-else>
            <el-alert title="暂无可用角色" type="warning" show-icon> </el-alert>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="visible = false">取 消</el-button>
                <el-button type="primary" @click="confirm">确 定</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { getMyPureRoles, joinTeam } from "@/service/team/member.js";
export default {
    name: "",
    props: ["title", "show", "team_id"],
    data: function () {
        return {
            visible: false,
            data: [],

            roles: [],
            checkAll: false,
            isIndeterminate: false,
        };
    },
    watch: {
        show: function (newval) {
            this.visible = newval;
        },
        visible: function (newval) {
            this.$emit("update:show", newval);
            if (newval && this.team_id) {
                getMyPureRoles(this.team_id).then((res) => {
                    this.data = res.data.data || [];
                }).catch((err) => {
                    console.error("获取角色列表失败:", err);
                    this.$message.error("获取角色列表失败，请稍后重试");
                });
            } else if (newval && !this.team_id) {
                console.error("team_id 未传入");
                this.$message.error("团队ID缺失");
            }
        },
    },
    computed: {
        params: function () {
            return {
                roles: this.roles,
                team_id: this.$route.params.id,
            };
        },
        role_ids: function () {
            let ids = [];
            this.data.forEach((item) => {
                ids.push(item.ID);
            });
            return ids;
        },
    },
    methods: {
        confirm: function () {
            if (this.roles && this.roles.length) {
                joinTeam(this.team_id, this.roles).then((res) => {
                    this.$message({
                        message: "申请成功，请等待团队管理审核",
                        type: "success",
                    });
                    this.visible = false;
                });
            }
        },
        selectAll(status) {
            this.roles = status ? this.role_ids : [];
            this.isIndeterminate = false;
        },
        checkIsAll(value) {
            this.checkAll = value.length === this.role_ids.length;
            this.isIndeterminate = value.length > 0 && value.length < this.roles.length;
        },
        showAvatar: function (mount, body_type) {
            return __imgPath + "image/school/" + mount + ".png";
        },
    },
    mounted: function () {},
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/member/joinpop.less";
</style>
