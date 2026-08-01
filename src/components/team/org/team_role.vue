<template>
    <div class="v-org-list m-team-role">
        <div class="m-group-role-box" v-if="data && data.length">
            <table class="m-group-role-table">
                <thead>
                    <tr>
                        <th>{{ $t("team.myRole.name") }}</th>
                        <th>{{ $t("team.myRole.mount") }}</th>
                        <th>{{ $t("team.myRole.bodyType") }}</th>
                        <th>{{ $t("team.myRole.joinedAt") }}</th>
                        <th>{{ $t("team.myRole.public") }}</th>
                        <th>{{ $t("team.myRole.operation") }}</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(role, i) in data">
                        <tr :key="role + i" v-if="role && role.info">
                            <td>{{ role.info.name }}</td>
                            <td>
                                <div class="u-role__mount">
                                    <img :src="showSchoolIcon(role.info.mount)" />
                                    {{ showSchoolName(role.info.mount) }}
                                </div>
                            </td>
                            <td>{{ showBodyType(role.info.body_type) }}</td>
                            <td>{{ showTime(role.relation.created_at) }}</td>
                            <td>
                                <el-switch
                                    v-model="role.relation.public"
                                    active-color="#13ce66"
                                    :active-value="1"
                                    :inactive-value="0"
                                    @change="setPublic(role.info.ID, role.relation.public)"
                                ></el-switch>
                            </td>
                            <td>
                                <el-button
                                    class="u-quit-team"
                                    type="info"
                                    size="small"
                                    plain
                                    @click="confirmQuitTeam(role.info.ID, role.info.name, data, i)"
                                >
                                    <el-icon><SwitchButton /></el-icon>
                                    {{ $t("team.myRole.quit") }}</el-button
                                >
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
        <el-alert :title="$t('team.myRole.empty')" type="info" show-icon v-else></el-alert>
    </div>
</template>

<script>
import { getMyJoinedTeams, changeRolePublic, quitTeam as quitTeamRequest } from "@/service/team/member.js";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { showSchoolIcon, showSchoolName, showBodyType, showTime } from "@/utils/filters";
import { SwitchButton } from "@element-plus/icons-vue";

export default {
    name: "TeamRole",
    props: [],
    data: function () {
        return {
            data: [],

            uid: User.getInfo().uid,
            loading: false,
        };
    },
    computed: {
        team_id: function () {
            return this.$route.params.id;
        },
    },
    watch: {
        team_id: {
            handler: function () {
                this.loadData();
            },
            immediate: true,
        },
    },
    methods: {
        loadData: function () {
            this.loading = true;
            getMyJoinedTeams()
                .then((res) => {
                    const data = (res.data.data || [])?.filter((item) => {
                        return item.team_info.ID == this.team_id;
                    });

                    this.data = data.length ? data[0].roles : [];
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        setPublic: function (role_id, isPublic) {
            changeRolePublic(this.team_id, role_id, isPublic).then((res) => {
                this.$notify({
                    title: this.$t("team.myRole.settingSuccess"),
                    message: this.$t("team.myRole.settingUpdated"),
                    type: "success",
                });
            });
        },
        confirmQuitTeam: async function (role_id, roleName, list, i) {
            try {
                await this.$confirm(
                    this.$t("team.myRole.quitConfirm", { name: roleName || this.$t("team.myRole.unnamed") }),
                    this.$t("team.myRole.quitTitle"),
                    {
                        confirmButtonText: this.$t("team.myRole.confirmQuit"),
                        cancelButtonText: this.$t("team.myRole.cancel"),
                        type: "warning",
                        distinguishCancelAndClose: true,
                    }
                );
            } catch {
                return;
            }

            quitTeamRequest(this.team_id, role_id).then(() => {
                this.$notify({
                    title: this.$t("team.myRole.quitSuccess"),
                    message: this.$t("team.myRole.quitMessage"),
                    type: "success",
                });
                list.splice(i, 1);
            });
        },
        showTeamLogo: function (val) {
            return getThumbnail(val, 72, true);
        },
        showSchoolIcon,
        showSchoolName,
        showBodyType,
        showTime,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/role/my_teams.less";
</style>
