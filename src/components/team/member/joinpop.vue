<template>
    <el-dialog
        class="m-team-joinpop m-team-member-join-dialog"
        :title="title"
        v-model="visible"
        width="820px"
        align-center
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="!submitting"
    >
        <template #header>
            <div class="m-team-joinpop-header">
                <span class="u-header-icon" aria-hidden="true">
                    <el-icon><UserFilled /></el-icon>
                </span>
                <span class="u-header-copy">
                    <strong>{{ title }}</strong>
                    <small>选择需要加入该团队的角色，可同时提交多个角色</small>
                </span>
            </div>
        </template>

        <div class="m-team-joinpop-content" v-loading="loading">
            <template v-if="!loading && data.length">
                <div class="m-team-joinpop-toolbar">
                    <div class="u-selection-summary">
                        <strong>选择角色</strong>
                        <span>申请提交后，需要等待团队管理员审核</span>
                    </div>
                    <el-checkbox
                        :indeterminate="isIndeterminate"
                        v-model="checkAll"
                        @change="selectAll"
                        class="u-all"
                    >
                        全选
                        <span class="u-count">{{ roles.length }}/{{ data.length }}</span>
                    </el-checkbox>
                </div>

                <el-checkbox-group
                    class="u-list"
                    v-model="roles"
                    @change="checkIsAll"
                    aria-label="选择申请加入团队的角色"
                >
                    <el-checkbox v-for="item in data" :value="item.ID" :key="item.ID" class="u-role-card" border>
                        <div class="u-role-card__content">
                            <img
                                class="u-item-avatar"
                                :src="showAvatar(item.mount)"
                                :alt="`${item.name || '角色'}门派图标`"
                            />
                            <span class="u-role-card__copy">
                                <strong class="u-item-name" :title="item.note || item.name">{{ item.name }}</strong>
                                <small class="u-item-server" :title="item.server">{{ item.server || "未知服务器" }}</small>
                            </span>
                        </div>
                    </el-checkbox>
                </el-checkbox-group>
            </template>

            <div class="m-team-joinpop-null" v-else-if="!loading">
                <el-empty :image-size="80" description="暂无可申请加入该团队的角色">
                    <span class="u-empty-tip">已加入团队或尚未绑定的角色不会显示在这里</span>
                </el-empty>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <span class="u-footer-status" aria-live="polite">
                    <template v-if="data.length">已选择 <strong>{{ roles.length }}</strong> 个角色</template>
                    <template v-else>请选择可用角色后提交申请</template>
                </span>
                <div class="u-footer-actions">
                    <el-button :disabled="submitting" @click="visible = false">取消</el-button>
                    <el-button
                        type="primary"
                        :loading="submitting"
                        :disabled="loading || !roles.length"
                        @click="confirm"
                    >
                        提交申请
                    </el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { getMyPureRoles, joinTeam } from "@/service/team/member.js";
import { UserFilled } from "@element-plus/icons-vue";

export default {
    name: "TeamJoinPop",
    props: {
        title: {
            type: String,
            default: "加入团队",
        },
        show: {
            type: Boolean,
            default: false,
        },
        team_id: {
            type: [Number, String],
            default: 0,
        },
    },
    emits: ["update:show"],
    data: function () {
        return {
            visible: false,
            data: [],
            roles: [],
            checkAll: false,
            isIndeterminate: false,
            loading: false,
            submitting: false,
            loadVersion: 0,
        };
    },
    watch: {
        show: function (newval) {
            this.visible = newval;
        },
        visible: function (newval) {
            this.$emit("update:show", newval);
            if (newval && this.team_id) {
                this.loadRoles();
            } else if (newval && !this.team_id) {
                console.error("team_id 未传入");
                this.$message.error("团队ID缺失");
            } else {
                this.loadVersion += 1;
            }
        },
    },
    computed: {
        role_ids: function () {
            return this.data.map((item) => item.ID);
        },
    },
    methods: {
        resetSelection: function () {
            this.roles = [];
            this.checkAll = false;
            this.isIndeterminate = false;
        },
        loadRoles: function () {
            const version = ++this.loadVersion;
            this.loading = true;
            this.data = [];
            this.resetSelection();

            getMyPureRoles(this.team_id)
                .then((res) => {
                    if (version !== this.loadVersion || !this.visible) return;
                    this.data = res.data.data || [];
                })
                .catch((err) => {
                    if (version !== this.loadVersion || !this.visible) return;
                    console.error("获取角色列表失败:", err);
                    this.$message.error("获取角色列表失败，请稍后重试");
                })
                .finally(() => {
                    if (version === this.loadVersion) {
                        this.loading = false;
                    }
                });
        },
        confirm: function () {
            if (!this.roles.length || this.submitting) return;

            this.submitting = true;
            joinTeam(this.team_id, this.roles)
                .then(() => {
                    this.$message({
                        message: "申请成功，请等待团队管理审核",
                        type: "success",
                    });
                    this.visible = false;
                })
                .catch((err) => {
                    console.error("提交加入团队申请失败:", err);
                    this.$message.error("申请提交失败，请稍后重试");
                })
                .finally(() => {
                    this.submitting = false;
                });
        },
        selectAll: function (status) {
            this.roles = status ? [...this.role_ids] : [];
            this.isIndeterminate = false;
        },
        checkIsAll: function (value) {
            const total = this.role_ids.length;
            this.checkAll = total > 0 && value.length === total;
            this.isIndeterminate = value.length > 0 && value.length < total;
        },
        showAvatar: function (mount) {
            return __imgPath + "image/school/" + mount + ".png";
        },
    },
    beforeUnmount: function () {
        this.loadVersion += 1;
    },
    components: {
        UserFilled,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/member/joinpop.less";
</style>
