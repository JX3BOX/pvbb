<template>
    <div class="v-org-list">
        <h1 class="m-title">
            <i class="el-icon-school"></i>
            <span class="u-txt">{{ $t("team.role.myTeams") }}</span>
            <span class="u-team-link">
                <i class="el-icon-s-home"></i> {{ $t("team.roleCommon.visit") }} [<a class="u-link" :href="team_link.value">{{ team_link.label }}</a>]
            </span>
            <div class="u-op">
                <router-link to="/org/list" class="el-button el-button--primary el-button--mini">
                    <i class="el-icon-circle-plus-outline"></i>
                    {{ $t("team.role.findTeam") }}
                </router-link>
            </div>
        </h1>
        <div class="m-group-role" v-loading="loading">
            <template v-if="data && data.length">
                <el-tabs v-model="org" type="card" class="m-group-role-tabs">
                    <el-tab-pane :name="String(item.team_info.ID)" v-for="(item, i) in data" :key="i">
                        <template #label>
                            <img
                                class="u-org-logo"
                                :src="showTeamLogo(item.team_info.logo)"
                                v-if="item.team_info && item.team_info.logo"
                            />
                            <img class="u-org-logo" src="@/assets/img/team/null.png" v-else />
                            <span class="u-org-name">{{ (item.team_info && item.team_info.name) || $t("team.raid.common.unknown") }}</span>
                        </template>
                        <div class="m-group-role-box" v-if="item.roles && item.roles.length">
                            <table class="m-group-role-table">
                                <thead>
                                    <tr>
                                        <th>{{ $t("team.role.roleName") }}</th>
                                        <th>{{ $t("team.role.school") }}</th>
                                        <th>{{ $t("team.role.bodyType") }}</th>
                                        <th>{{ $t("team.mountPreference.label") }}</th>
                                        <th>{{ $t("team.role.joinedAt") }}</th>
                                        <th>{{ $t("team.role.public") }}</th>
                                        <th>{{ $t("team.role.operation") }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(role, i) in item.roles" :key="role + i">
                                        <td :data-label="$t('team.role.roleName')">{{ role.info.name }}</td>
                                        <td :data-label="$t('team.role.school')">
                                            <img :src="showSchoolIcon(role.info.mount)" />
                                            {{ showSchoolName(role.info.mount) }}
                                        </td>
                                        <td :data-label="$t('team.role.bodyType')">{{ showBodyType(role.info.body_type) }}</td>
                                        <td
                                            class="u-role-mount-preference-cell"
                                            :data-label="$t('team.mountPreference.label')"
                                        >
                                            <RoleMountPreferenceSelect
                                                v-model="role.info.mounts"
                                                :role-mount="role.info.mount"
                                            />
                                            <el-button
                                                type="primary"
                                                size="small"
                                                :loading="savingKey === preferenceKey(item.team_info.ID, role.info.ID)"
                                                :disabled="!role.info.mounts || !role.info.mounts.length"
                                                @click="saveMounts(item.team_info.ID, role.info)"
                                            >
                                                {{ $t("team.mountPreference.save") }}
                                            </el-button>
                                        </td>
                                        <td :data-label="$t('team.role.joinedAt')">{{ showTime(role.relation.created_at) }}</td>
                                        <td :data-label="$t('team.role.public')">
                                            <el-switch
                                                v-model="role.relation.public"
                                                active-color="#13ce66"
                                                :active-value="1"
                                                :inactive-value="0"
                                                @change="
                                                    setPublic(item.team_info.ID, role.info.ID, role.relation.public)
                                                "
                                            ></el-switch>
                                        </td>
                                        <td :data-label="$t('team.role.operation')">
                                            <el-button
                                                type="info"
                                                size="small"
                                                plain
                                                @click="quitTeam(item.team_info.ID, role.info.ID, item.roles, i)"
                                                >{{ $t("team.role.quit") }}</el-button
                                            >
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <el-alert :title="$t('team.role.noRoles')" type="info" show-icon v-else></el-alert>
                    </el-tab-pane>
                </el-tabs>
            </template>
            <template v-else>
                <div class="m-team-list-null">
                    <el-alert :title="$t('team.role.noJoinedTeams')" type="info" show-icon></el-alert>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { getMyJoinedTeams, changeRolePublic, quitTeam } from "@/service/team/member.js";
import {
    deleteRoleMountPreference,
    getRoleMountPreferences,
    saveRoleMountPreferences,
} from "@/service/team/role_mount_preference";
import RoleMountPreferenceSelect from "@/components/team/member/RoleMountPreferenceSelect.vue";
import { mergeRoleMountPreferences } from "@/utils/team-role-mounts";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { showBodyType, showSchoolIcon, showSchoolName, showTime } from "@/utils/filters";

export default {
    props: [],
    data: function () {
        return {
            data: [],
            per: 15,
            page: 1,
            total: 1,

            uid: User.getInfo().uid,
            loading: false,
            savingKey: "",

            org: "",
            team_link: {
                label: this.$t("team.role.viewTeam"),
                value: "",
            },
        };
    },
    methods: {
        loadData: function () {
            this.loading = true;
            getMyJoinedTeams()
                .then(async (res) => {
                    this.data = res.data.data || [];
                    await Promise.all(
                        this.data.map(async (team) => {
                            const roles = (team.roles || []).map((role) => ({ ...role.info }));
                            try {
                                const preferenceResponse = await getRoleMountPreferences(team.team_info.ID);
                                const mergedRoles = mergeRoleMountPreferences(
                                    roles,
                                    preferenceResponse.data.data || []
                                );
                                team.roles.forEach((role, index) => {
                                    role.info.mounts = mergedRoles[index].mounts || [];
                                });
                            } catch {
                                team.roles.forEach((role) => {
                                    role.info.mounts = Array.isArray(role.info.mounts) ? role.info.mounts : [];
                                });
                            }
                        })
                    );
                    this.org = this.data.length ? String(this.data[0]["team_info"]["ID"]) : "";
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        setPublic: function (team_id, role_id, isPublic) {
            changeRolePublic(team_id, role_id, isPublic).then((res) => {
                this.$notify({
                    title: this.$t("team.role.settingSuccess"),
                    message: this.$t("team.role.settingUpdated"),
                    type: "success",
                });
            });
        },
        preferenceKey: function (teamId, roleId) {
            return `${teamId}:${roleId}`;
        },
        saveMounts: function (teamId, role) {
            if (!role.mounts?.length) return;
            this.savingKey = this.preferenceKey(teamId, role.ID);
            saveRoleMountPreferences(teamId, [{ role_id: role.ID, mounts: role.mounts }])
                .then(() => {
                    this.$notify({
                        title: this.$t("team.mountPreference.saved"),
                        message: this.$t("team.mountPreference.savedHint"),
                        type: "success",
                    });
                })
                .finally(() => {
                    this.savingKey = "";
                });
        },
        quitTeam: function (team_id, role_id, list, i) {
            quitTeam(team_id, role_id).then((res) => {
                deleteRoleMountPreference(team_id, role_id).catch(() => {});
                this.$notify({
                    title: this.$t("team.role.quitSuccess"),
                    message: this.$t("team.role.quitMessage"),
                    type: "success",
                });
                list.splice(i, 1);
            });
        },
        showTeamLogo: function (val) {
            return getThumbnail(val, 72, true);
        },
        showBodyType,
        showSchoolIcon,
        showSchoolName,
        showTime,
    },
    watch: {
        params: {
            immediate: true,
            handler: function () {
                this.loadData();
            },
        },
        org: {
            immediate: true,
            handler: function (val) {
                const _org = this.data.find((item) => item?.team_info.ID == val);

                if (_org) {
                    this.team_link.label = ` ${_org.team_info.name} `;
                    this.team_link.value = `/team/org/${val}`;
                }
            },
        },
    },
    components: {
        RoleMountPreferenceSelect,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/role/my_teams.less";
</style>
