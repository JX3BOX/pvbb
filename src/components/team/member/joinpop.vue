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
        @closed="handleClosed"
    >
        <template #header>
            <div class="m-team-joinpop-header">
                <span class="u-header-icon" aria-hidden="true">
                    <el-icon><UserFilled /></el-icon>
                </span>
                <span class="u-header-copy">
                    <strong>{{ resolvedTitle }}</strong>
                    <small>{{ founderGuide ? $t("team.createGuide.description") : $t("team.joinDialog.description") }}</small>
                </span>
            </div>
        </template>

        <div class="m-team-joinpop-content" v-loading="loading">
            <template v-if="!loading && data.length">
                <div class="m-team-joinpop-toolbar">
                    <div class="u-selection-summary">
                        <strong>{{ $t("team.joinDialog.selectRoles") }}</strong>
                        <span>{{ copy("reviewHint") }}</span>
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
                    :aria-label="copy('aria')"
                >
                    <el-checkbox
                        v-for="item in data"
                        :value="item.ID"
                        :key="item.ID"
                        class="u-role-card"
                        border
                    >
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

                <section v-if="selectedRoles.length" class="m-team-joinpop-preferences">
                    <div class="u-preferences-heading">
                        <strong>{{ $t("team.mountPreference.label") }}</strong>
                        <span>{{ $t("team.mountPreference.requiredHint") }}</span>
                    </div>
                    <div class="u-preferences-list">
                        <div v-for="item in selectedRoles" :key="item.ID" class="u-preference-card">
                            <div class="u-preference-role">
                                <img
                                    class="u-preference-avatar"
                                    :src="showAvatar(item.mount)"
                                    :alt="$t('team.joinDialog.mountAlt', { name: item.name || $t('team.joinDialog.roleFallback') })"
                                />
                                <span class="u-preference-role__copy">
                                    <strong :title="item.note || item.name">{{ item.name }}</strong>
                                    <small :title="item.server">{{ item.server || $t("team.joinDialog.unknownServer") }}</small>
                                </span>
                            </div>
                            <div class="u-role-mount-preference">
                                <span class="u-preference-label">
                                    {{ $t("team.mountPreference.label") }}
                                    <b>{{ $t("team.mountPreference.required") }}</b>
                                </span>
                                <RoleMountPreferenceSelect
                                    v-model="mountPreferences[item.ID]"
                                    :role-mount="item.mount"
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </template>

            <div class="m-team-joinpop-null" v-else-if="!loading">
                <el-empty :image-size="80" :description="copy('empty')">
                    <span class="u-empty-tip">{{ copy("emptyHint") }}</span>
                </el-empty>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <span class="u-footer-status" aria-live="polite">
                    <template v-if="data.length">{{ $t("team.joinDialog.selected", { count: roles.length }) }}</template>
                    <template v-else>{{ copy("selectHint") }}</template>
                </span>
                <div class="u-footer-actions">
                    <el-button :disabled="submitting" @click="visible = false">{{ copy("cancel") }}</el-button>
                    <el-button
                        type="primary"
                        :loading="submitting"
                        :disabled="loading || !allPreferencesReady"
                        @click="confirm"
                    >
                        {{ copy("submit") }}
                    </el-button>
                </div>
            </div>
        </template>
    </el-dialog>
</template>

<script>
import { getMyPureRoles, joinTeam } from "@/service/team/member.js";
import { getRoleMountPreferences, saveRoleMountPreferences } from "@/service/team/role_mount_preference";
import RoleMountPreferenceSelect from "@/components/team/member/RoleMountPreferenceSelect.vue";
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
        founderGuide: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:show", "success", "closed"],
    data: function () {
        return {
            visible: false,
            data: [],
            roles: [],
            mountPreferences: {},
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
            return this.title || this.copy("title");
        },
        role_ids: function () {
            return this.data.map((item) => item.ID);
        },
        selectedRoles: function () {
            return this.data.filter((item) => this.roles.includes(item.ID));
        },
        allPreferencesReady: function () {
            return (
                this.roles.length > 0 &&
                this.roles.every((roleId) => Array.isArray(this.mountPreferences[roleId]) && this.mountPreferences[roleId].length)
            );
        },
    },
    methods: {
        copy: function (key) {
            const founderKeys = [
                "title",
                "reviewHint",
                "aria",
                "empty",
                "emptyHint",
                "selectHint",
                "cancel",
                "submit",
                "success",
                "submitFailed",
            ];
            const namespace = this.founderGuide && founderKeys.includes(key) ? "createGuide" : "joinDialog";
            return this.$t(`team.${namespace}.${key}`);
        },
        resetSelection: function () {
            this.roles = [];
            this.mountPreferences = {};
            this.checkAll = false;
            this.isIndeterminate = false;
        },
        loadRoles: function () {
            const version = ++this.loadVersion;
            this.loading = true;
            this.data = [];
            this.resetSelection();

            getMyPureRoles(this.team_id)
                .then(async (res) => {
                    if (version !== this.loadVersion || !this.visible) return;
                    this.data = res.data.data || [];
                    const preferenceResponse = await getRoleMountPreferences(this.team_id).catch(() => null);
                    if (version !== this.loadVersion || !this.visible) return;
                    const preferences = preferenceResponse?.data?.data || [];
                    this.mountPreferences = Object.fromEntries(
                        this.role_ids.map((roleId) => {
                            const record = preferences.find((item) => String(item.role_id) === String(roleId));
                            return [roleId, Array.isArray(record?.mounts) ? record.mounts.map(Number) : []];
                        })
                    );
                    if (this.founderGuide) {
                        this.roles = [...this.role_ids];
                        this.checkAll = this.role_ids.length > 0;
                    }
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
            if (!this.allPreferencesReady || this.submitting) {
                if (this.roles.length && !this.allPreferencesReady) {
                    this.$message.warning(this.$t("team.mountPreference.requiredHint"));
                }
                return;
            }

            this.submitting = true;
            const preferences = this.roles.map((roleId) => ({
                role_id: Number(roleId),
                mounts: this.mountPreferences[roleId].map(Number),
            }));
            saveRoleMountPreferences(this.team_id, preferences)
                .then(() => joinTeam(this.team_id, this.roles, { founderDirect: this.founderGuide }))
                .then(() => {
                    this.$message({
                        message: this.copy("success"),
                        type: "success",
                    });
                    this.$emit("success", [...this.roles]);
                    this.visible = false;
                })
                .catch((err) => {
                    console.error("Failed to submit team application:", err);
                    this.$message.error(this.copy("submitFailed"));
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
        handleClosed: function () {
            this.$emit("closed");
        },
    },
    beforeUnmount: function () {
        this.loadVersion += 1;
    },
    components: {
        RoleMountPreferenceSelect,
        UserFilled,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/member/joinpop.less";
</style>
