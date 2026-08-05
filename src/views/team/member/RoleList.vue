<template>
    <div class="m-member-roles">
        <header class="m-member-panel-header">
            <div>
                <h2>{{ $t("team.memberAllRoles") }}</h2>
            </div>
            <el-skeleton-item v-if="loading" variant="text" class="u-member-total-skeleton" aria-hidden="true" />
            <span v-else class="u-member-total">{{ $t("team.memberRoleCount", { count: total }) }}</span>
        </header>

        <el-input
            v-model="search"
            clearable
            class="m-member-role-search"
            :placeholder="$t('team.memberRole.searchPlaceholder')"
            :prefix-icon="Search"
        />

        <div v-if="loading" class="m-role-card-grid m-pending-skeleton-grid" aria-hidden="true">
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

        <div v-else-if="data.length" class="m-member-list-roles">
            <ul class="m-role-card-grid">
                <li v-for="(item, i) in data" :key="item.relation.role_id || i" class="u-item m-pending-card m-role-card">
                    <span class="u-pic u-pending-avatar">
                        <RoleAvatar :mount="item.role.mount" :body_type="item.role.body_type" />
                    </span>
                    <div class="u-pending-main">
                        <span class="u-title">
                            <router-link class="u-rolename" :to="'/role/' + item.role.ID" target="_blank">
                                {{ item.role.name }}
                            </router-link>
                            <span v-if="!item.role.custom" class="u-verified">
                                <el-icon><CircleCheckFilled /></el-icon>
                                {{ $t("team.member.verified") }}
                            </span>
                            <span v-if="item.relation.role_remark" class="u-role-remark">
                                {{ item.relation.role_remark }}
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
                        <div class="u-apply-meta">
                            <span>
                                <el-icon><User /></el-icon>
                                {{ $t("team.memberRole.owner") }}
                                <a
                                    class="u-role-owner"
                                    :href="showAuthorLink(item.relation.uid)"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {{ item.user.display_name }}
                                </a>
                            </span>
                            <span>
                                <el-icon><Clock /></el-icon>
                                {{ showTime(item.relation.created_at) }}
                            </span>
                        </div>
                    </div>
                    <div class="u-role-footer">
                        <el-rate
                            v-model.number="item.relation.star"
                            class="u-star"
                            @change="updateStar(item.relation.team_id, item.relation.role_id, item.relation.star)"
                        />
                        <div class="u-role-actions">
                            <button class="u-btn u-note" type="button" @click="noteRole(item)">
                                <el-icon><EditPen /></el-icon>
                                {{ $t("team.memberRoleNote") }}
                            </button>
                            <el-dropdown trigger="click" @command="handleRoleCommand($event, item, i)">
                                <button
                                    class="u-btn u-more"
                                    type="button"
                                    :aria-label="$t('team.memberRoleMore')"
                                    :title="$t('team.memberRoleMore')"
                                >
                                    <el-icon><MoreFilled /></el-icon>
                                </button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item command="remove" class="u-role-remove-command">
                                            <el-icon><Delete /></el-icon>
                                            {{ $t("team.memberRole.remove") }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </div>
                </li>
            </ul>
            <el-pagination
                v-model:current-page="page"
                class="m-archive-pages"
                background
                layout="total, prev, pager, next, jumper"
                :hide-on-single-page="true"
                :page-size="per"
                :total="total"
                @current-change="changePage"
            />
        </div>

        <div v-else class="m-member-empty">
            <span class="u-empty-icon" aria-hidden="true"><el-icon><User /></el-icon></span>
            <h3>{{ $t("team.memberNoRoles") }}</h3>
            <p>{{ $t("team.memberNoRolesHint") }}</p>
        </div>

        <el-dialog v-model="noteVisible" :title="$t('team.role.note')" width="min(420px, 90vw)" class="m-team-note-dialog">
            <el-input v-model="note" :placeholder="$t('team.role.contentPlaceholder')" :maxlength="20" show-word-limit />
            <template #footer>
                <el-button @click="noteVisible = false">{{ $t("team.role.cancel") }}</el-button>
                <el-button type="primary" @click="confirmNote">{{ $t("team.role.confirm") }}</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import RoleAvatar from "@/components/team/widget/RoleAvatar.vue";
import { getMyTeamRoles, deleteRole, remarkRole, starRole } from "@/service/team/member.js";
import { showBodyType, showSchoolIcon, showSchoolName, showTime } from "@/utils/filters";
import { CircleCheckFilled, Clock, Delete, EditPen, MoreFilled, Search, User } from "@element-plus/icons-vue";
import { authorLink as getAuthorLink } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "RoleList",
    props: ["id"],
    components: { CircleCheckFilled, Clock, Delete, EditPen, MoreFilled, RoleAvatar, User },
    data: function () {
        return {
            data: [],
            per: 12,
            page: 1,
            total: 0,
            loading: false,
            search: "",
            noteVisible: false,
            currentItem: null,
            note: "",
            Search,
        };
    },
    computed: {
        team_id: function () {
            return this.id;
        },
        params: function () {
            return { pageIndex: this.page, pageSize: this.per, search: this.search };
        },
    },
    methods: {
        loadData: function () {
            this.loading = true;
            getMyTeamRoles(this.team_id, this.params)
                .then((res) => {
                    this.data = res.data.data.list || [];
                    this.total = Number(res.data.data.page.total) || 0;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        removeRole: function (item, index) {
            this.$confirm(this.$t("team.memberRole.removeConfirm"), this.$t("team.raid.item.message"), {
                confirmButtonText: this.$t("team.role.confirm"),
                cancelButtonText: this.$t("team.role.cancel"),
                type: "warning",
            })
                .then(() => deleteRole(item.relation.team_id, item.relation.role_id))
                .then(() => {
                    this.data.splice(index, 1);
                    this.total = Math.max(0, this.total - 1);
                    this.$notify({ title: this.$t("team.memberRole.deleted"), message: this.$t("team.memberRole.deletedMessage"), type: "success" });
                })
                .catch(() => {});
        },
        handleRoleCommand: function (command, item, index) {
            if (command === "remove") this.removeRole(item, index);
        },
        noteRole: function (item) {
            this.currentItem = item;
            this.note = item.relation.role_remark || "";
            this.noteVisible = true;
        },
        confirmNote: function () {
            if (!this.currentItem) return;
            remarkRole(this.currentItem.relation.team_id, this.currentItem.relation.role_id, this.note).then(() => {
                this.currentItem.relation.role_remark = this.note;
                this.noteVisible = false;
                this.$notify({ title: this.$t("team.memberRole.noteSuccess"), message: this.$t("team.memberRole.noteMessage"), type: "success" });
            });
        },
        updateStar: function (team_id, role_id, star) {
            starRole(team_id, role_id, star).then(() => {
                this.$notify({ title: this.$t("team.memberRole.starSuccess"), message: this.$t("team.memberRole.starMessage"), type: "success" });
            });
        },
        changePage: function () {
            window.scrollTo(0, 0);
        },
        showAuthorLink: function (uid) {
            return getAuthorLink(uid);
        },
        showBodyType,
        showSchoolIcon,
        showSchoolName,
        showTime,
    },
    watch: {
        team_id: function () {
            this.page = 1;
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
        this.loadData();
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/member/list_member.less";
</style>
