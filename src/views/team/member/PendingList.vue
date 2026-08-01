<template>
    <div class="v-member-pending">
        <header class="m-member-panel-header">
            <div>
                <h2>加入申请</h2>
                <p>核对角色资料后批准加入，待处理申请会集中显示在这里。</p>
            </div>
            <el-skeleton-item
                v-if="loading"
                variant="text"
                class="u-member-total-skeleton"
                aria-hidden="true"
            />
            <span v-else class="u-member-total">{{ total }} 项待处理</span>
        </header>

        <div v-if="loading" class="m-pending-card-grid m-pending-skeleton-grid" aria-hidden="true">
            <el-skeleton v-for="index in per" :key="index" animated class="m-pending-skeleton-card">
                <template #template>
                    <div class="u-pending-skeleton">
                        <el-skeleton-item variant="image" class="u-skeleton-avatar" />
                        <div class="u-skeleton-main">
                            <div class="u-skeleton-title">
                                <el-skeleton-item variant="text" class="u-skeleton-name" />
                                <el-skeleton-item variant="text" class="u-skeleton-verified" />
                            </div>
                            <div class="u-skeleton-tags">
                                <el-skeleton-item variant="text" />
                                <el-skeleton-item variant="text" />
                                <el-skeleton-item variant="text" />
                            </div>
                            <el-skeleton-item variant="text" class="u-skeleton-meta" />
                        </div>
                        <div class="u-skeleton-actions">
                            <el-skeleton-item variant="button" />
                            <el-skeleton-item variant="button" />
                        </div>
                    </div>
                </template>
            </el-skeleton>
        </div>
        <div class="m-pending-list" v-else-if="data && data.length">
            <ul class="m-pending-card-grid">
                <li class="u-item m-pending-card" v-for="(item, i) in data" :key="item.relation.role_id || i">
                    <span class="u-pic u-pending-avatar">
                        <RoleAvatar :mount="item.role.mount" :body_type="item.role.body_type" />
                    </span>
                    <div class="u-pending-main">
                        <span class="u-title">
                            <router-link class="u-rolename" :to="'/role/' + item.role.ID" target="_blank">{{
                                item.role.name
                            }}</router-link>
                            <span class="u-verified" v-if="!item.role.custom">
                                <el-icon><CircleCheckFilled /></el-icon>
                                已认证
                            </span>
                        </span>
                        <span class="u-meta u-role-meta">
                            <span>{{ item.role.server || "未知服务器" }}</span>
                            <span class="u-mount">
                                <img class="u-icon" :src="showSchoolIcon(item.role.mount)" />
                                {{ showSchoolName(item.role.mount) }}
                            </span>
                            <span>{{ showBodyType(item.role.body_type) }}</span>
                        </span>
                        <div class="u-apply-meta">
                            <span>
                                <el-icon><OfficeBuilding /></el-icon>
                                {{ (item.team && item.team.name) || "未知团队" }}
                            </span>
                            <span>
                                <el-icon><Clock /></el-icon>
                                {{ showTime(item.relation.created_at) }}
                            </span>
                        </div>
                    </div>
                    <div class="u-op">
                        <button
                            class="u-btn u-reject"
                            type="button"
                            :disabled="processingIds.includes(item.relation.role_id)"
                            @click="rejectRole(item.relation.role_id)"
                        >
                            <el-icon><Close /></el-icon>
                            拒绝
                        </button>
                        <button
                            class="u-btn u-pass"
                            type="button"
                            :disabled="processingIds.includes(item.relation.role_id)"
                            @click="checkRole(item.relation.role_id)"
                        >
                            <el-icon><Check /></el-icon>
                            批准加入
                        </button>
                    </div>
                </li>
            </ul>
            <el-pagination
                class="m-archive-pages"
                background
                layout="total, prev, pager, next,jumper"
                :hide-on-single-page="true"
                :page-size="per"
                :total="total"
                v-model:current-page="page"
                @current-change="changePage"
            ></el-pagination>
        </div>
        <div v-else class="m-member-empty">
            <span class="u-empty-icon" aria-hidden="true">
                <el-icon><Finished /></el-icon>
            </span>
            <h3>申请已全部处理</h3>
            <p>新的成员申请会显示在这里。</p>
        </div>
    </div>
</template>

<script>
import { getTeamPendingMembers, checkRole, deleteRole } from "@/service/team/member.js";
import RoleAvatar from "@/components/team/widget/RoleAvatar.vue";
import { showBodyType, showSchoolIcon, showSchoolName, showTime } from "@/utils/filters";
import { Check, CircleCheckFilled, Clock, Close, Finished, OfficeBuilding } from "@element-plus/icons-vue";
export default {
    name: "ListMemberPending",
    emits: ["pending-count-change"],
    props: ["id"],
    data: function () {
        return {
            data: [],
            per: 12,
            page: 1,
            total: 0,
            loading: false,
            processingIds: [],
        };
    },
    computed: {
        team_id: function () {
            return this.id;
        },
        params: function () {
            return {
                pageIndex: this.page,
                pageSize: this.per,
            };
        },
    },
    methods: {
        loadData: function () {
            this.loading = true;
            getTeamPendingMembers(this.team_id, this.params)
                .then((res) => {
                    this.data = res.data.data.list || [];
                    this.updateTotal(res.data.data.page.total);
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        checkRole(role_id) {
            if (this.processingIds.includes(role_id)) return;
            const teamId = this.team_id;
            this.processingIds.push(role_id);
            checkRole(teamId, role_id)
                .then(() => {
                    if (!this.removePendingRole(teamId, role_id)) return;
                    this.$notify({
                        title: "操作成功",
                        message: "批准该成员加入",
                        type: "success",
                    });
                })
                .finally(() => {
                    this.processingIds = this.processingIds.filter((id) => id !== role_id);
                });
        },
        rejectRole(role_id) {
            if (this.processingIds.includes(role_id)) return;
            const teamId = this.team_id;
            this.$confirm("确定拒绝该角色的加入申请？拒绝后该申请将从列表中移除。", "拒绝加入申请", {
                confirmButtonText: "确认拒绝",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    if (String(this.team_id) !== String(teamId)) return;
                    this.processingIds.push(role_id);
                    return deleteRole(teamId, role_id)
                        .then(() => {
                            if (!this.removePendingRole(teamId, role_id)) return;
                            this.$notify({
                                title: "操作成功",
                                message: "已拒绝该成员加入",
                                type: "success",
                            });
                        })
                        .finally(() => {
                            this.processingIds = this.processingIds.filter((id) => id !== role_id);
                        });
                })
                .catch(() => {});
        },
        removePendingRole(teamId, role_id) {
            if (String(this.team_id) !== String(teamId)) return false;
            const index = this.data.findIndex((item) => item.relation.role_id === role_id);
            if (index !== -1) {
                this.data.splice(index, 1);
                this.updateTotal(this.total - 1);
            }
            return true;
        },
        changePage: function () {
            window.scrollTo(0, 0);
        },
        init: function () {
            this.loadData();
        },
        updateTotal: function (total) {
            this.total = Math.max(0, Number(total) || 0);
            this.$emit("pending-count-change", this.total);
        },
        showBodyType,
        showSchoolIcon,
        showSchoolName,
        showTime,
    },
    watch: {
        team_id: function () {
            this.loadData();
        },
        params: {
            deep: true,
            handler: function () {
                this.loadData();
            },
        },
    },
    created: function () {
        this.init();
    },
    components: {
        Check,
        CircleCheckFilled,
        Clock,
        Close,
        Finished,
        OfficeBuilding,
        RoleAvatar,
    },
};
</script>
