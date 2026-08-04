<template>
    <el-dialog
        class="m-team-joinpop m-team-member-join-dialog"
        :title="resolvedTitle"
        v-model="visible"
        width="820px"
        align-center
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        :show-close="!submitting"
        append-to-body
    >
        <template #header>
            <div class="m-team-joinpop-header">
                <span class="u-header-icon" aria-hidden="true">
                    <el-icon><UserFilled /></el-icon>
                </span>
                <span class="u-header-copy">
                    <strong>{{ resolvedTitle }}</strong>
                    <small>{{ $t("team.joinDialog.description") }}</small>
                </span>
            </div>
        </template>

        <div class="m-team-joinpop-content" v-loading="loading">
            <template v-if="!loading && data.length">
                <div class="m-team-joinpop-toolbar">
                    <div class="u-selection-summary">
                        <strong>{{ $t("team.joinDialog.selectRoles") }}</strong>
                        <span>{{ $t("team.joinDialog.reviewHint") }}</span>
                    </div>
                    <el-checkbox
                        :indeterminate="isIndeterminate"
                        v-model="checkAll"
                        @change="selectAll"
                        class="u-all"
                    >
                        {{ $t("team.joinDialog.selectAll") }}
                        <span class="u-count">{{ roles.length }}/{{ data.length }}</span>
                    </el-checkbox>
                </div>

                <el-checkbox-group
                    class="u-list"
                    v-model="roles"
                    @change="checkIsAll"
                    :aria-label="$t('team.joinDialog.aria')"
                >
                    <el-checkbox v-for="item in data" :value="item.ID" :key="item.ID" class="u-role-card" border>
                        <div class="u-role-card__content">
                            <img
                                class="u-item-avatar"
                                :src="showAvatar(item.mount)"
                                :alt="$t('team.joinDialog.mountAlt', { name: item.name || $t('team.joinDialog.roleFallback') })"
                            />
                            <span class="u-role-card__copy">
                                <strong class="u-item-name" :title="item.note || item.name">{{ item.name }}</strong>
                                <small class="u-item-server" :title="item.server">{{ item.server || $t("team.joinDialog.unknownServer") }}</small>
                            </span>
                        </div>
                    </el-checkbox>
                </el-checkbox-group>
            </template>

            <div class="m-team-joinpop-null" v-else-if="!loading">
                <el-empty :image-size="80" :description="$t('team.joinDialog.empty')">
                    <span class="u-empty-tip">{{ $t("team.joinDialog.emptyHint") }}</span>
                </el-empty>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <span class="u-footer-status" aria-live="polite">
                    <template v-if="data.length">{{ $t("team.joinDialog.selected", { count: roles.length }) }}</template>
                    <template v-else>{{ $t("team.joinDialog.selectHint") }}</template>
                </span>
                <div class="u-footer-actions">
                    <el-button :disabled="submitting" @click="visible = false">{{ $t("team.joinDialog.cancel") }}</el-button>
                    <el-button
                        type="primary"
                        :loading="submitting"
                        :disabled="loading || !roles.length"
                        @click="confirm"
                    >
                        {{ $t("team.joinDialog.submit") }}
                    </el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { getMyPureRoles, joinTeam } from "@/service/team/member.js";
import { UserFilled } from "@element-plus/icons-vue";

export default {
    name: "TeamJoinPop",
    props: {
        title: {
            type: String,
            default: "",
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
                console.error("team_id is required");
                this.$message.error(this.$t("team.joinDialog.missingTeam"));
            } else {
                this.loadVersion += 1;
            }
        },
    },
    computed: {
        resolvedTitle: function () {
            return this.title || this.$t("team.joinDialog.title");
        },
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
                    console.error("Failed to load team roles:", err);
                    this.$message.error(this.$t("team.joinDialog.loadFailed"));
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
                        message: this.$t("team.joinDialog.success"),
                        type: "success",
                    });
                    this.visible = false;
                })
                .catch((err) => {
                    console.error("Failed to submit team application:", err);
                    this.$message.error(this.$t("team.joinDialog.submitFailed"));
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
            return "https://img.jx3box.com/image/school/" + mount + ".png";
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
