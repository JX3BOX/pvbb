<template>
    <div class="v-member-pending">
        <header class="m-member-panel-header">
            <div>
                <h2>{{ $t("team.member.joinRequests") }}</h2>
                <p>{{ $t("team.member.reviewHint") }}</p>
            </div>
            <el-skeleton-item v-if="loading" variant="text" class="u-member-total-skeleton" aria-hidden="true" />
            <span v-else class="u-member-total">{{ $t("team.member.pendingCount", { count: total }) }}</span>
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
                                {{ $t("team.member.verified") }}
                            </span>
                        </span>
                        <span class="u-meta u-role-meta">
                            <span>{{ item.role.server || $t("team.member.unknownServer") }}</span>
                            <span class="u-mount">
                                <img class="u-icon" :src="showSchoolIcon(item.role.mount)" />
                                {{ showSchoolName(item.role.mount) }}
                            </span>
                            <span>{{ showBodyType(item.role.body_type) }}</span>
                        </span>
                        <div class="u-declared-mounts">
                            <span class="u-declared-label">
                                <el-icon><MagicStick /></el-icon>
                                {{ $t("team.mountPreference.label") }}
                            </span>
                            <div class="u-declared-mount-list">
                                <template v-if="item.role.mounts && item.role.mounts.length">
                                    <span v-for="mount in item.role.mounts" :key="mount" class="u-declared-mount">
                                        <img :src="showMountIcon(mount)" :alt="showMountName(mount)" />
                                        {{ showMountName(mount) }}
                                    </span>
                                </template>
                                <em v-else>{{ $t("team.mountPreference.unconfigured") }}</em>
                            </div>
                        </div>
                        <div class="u-apply-meta">
                            <span>
                                <el-icon><User /></el-icon>
                                {{ $t("team.memberRole.owner") }}
                                <a
                                    v-if="ownerUid(item)"
                                    class="u-role-owner"
                                    :href="authorLink(ownerUid(item))"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {{ ownerName(item) }}
                                </a>
                                <template v-else>{{ $t("team.memberDialog.unregistered") }}</template>
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
                            {{ $t("team.member.reject") }}
                        </button>
                        <button
                            class="u-btn u-pass"
                            type="button"
                            :disabled="processingIds.includes(item.relation.role_id)"
                            @click="checkRole(item.relation.role_id)"
                        >
                            <el-icon><Check /></el-icon>
                            {{ $t("team.member.approve") }}
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
            <h3>{{ $t("team.member.allProcessed") }}</h3>
            <p>{{ $t("team.member.newRequestsHint") }}</p>
        </div>
    </div>
</template>

<script>
import { authorLink } from "@jx3box/jx3box-common/js/utils";
import { getTeamPendingMembers, checkRole, deleteRole } from "@/service/team/member.js";
import { getRoleMountPreferences } from "@/service/team/role_mount_preference";
import RoleAvatar from "@/components/team/widget/RoleAvatar.vue";
import { showBodyType, showMountIcon, showMountName, showSchoolIcon, showSchoolName, showTime } from "@/utils/filters";
import { mergeRoleMountPreferences } from "@/utils/team-role-mounts";
import { Check, CircleCheckFilled, Clock, Close, Finished, MagicStick, User } from "@element-plus/icons-vue";
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
                .then(async (res) => {
                    const list = res.data.data.list || [];
                    try {
                        const preferenceResponse = await getRoleMountPreferences(this.team_id);
                        const roles = mergeRoleMountPreferences(
                            list.map((item) => ({ ...item.role, ID: item.relation.role_id })),
                            preferenceResponse.data.data || []
                        );
                        this.data = list.map((item, index) => ({ ...item, role: roles[index] }));
                    } catch {
                        this.data = list;
                    }
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
                        title: this.$t("team.member.operationSucceeded"),
                        message: this.$t("team.member.approvedMessage"),
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
            this.$confirm(this.$t("team.member.rejectConfirm"), this.$t("team.member.rejectTitle"), {
                confirmButtonText: this.$t("team.member.confirmReject"),
                cancelButtonText: this.$t("team.member.cancel"),
                type: "warning",
            })
                .then(() => {
                    if (String(this.team_id) !== String(teamId)) return;
                    this.processingIds.push(role_id);
                    return deleteRole(teamId, role_id)
                        .then(() => {
                            if (!this.removePendingRole(teamId, role_id)) return;
                            this.$notify({
                                title: this.$t("team.member.operationSucceeded"),
                                message: this.$t("team.member.rejectedMessage"),
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
        ownerUid: function (item) {
            return (
                Number(
                    item?.user_info?.uid ||
                        item?.user_info?.id ||
                        item?.user_info?.ID ||
                        item?.relation?.uid ||
                        item?.role?.uid
                ) || 0
            );
        },
        ownerName: function (item) {
            return item?.user_info?.display_name || `UID ${this.ownerUid(item)}`;
        },
        authorLink,
        showBodyType,
        showMountIcon,
        showMountName,
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
        MagicStick,
        RoleAvatar,
        User,
    },
};
</script>
