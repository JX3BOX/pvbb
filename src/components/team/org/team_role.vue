<template>
    <div class="v-org-list">
        <div class="m-group-role-box" v-if="data && data.length">
            <table class="m-group-role-table">
                <thead>
                    <tr>
                        <th>角色名</th>
                        <th>心法</th>
                        <th>体型</th>
                        <th>加入时间</th>
                        <th>是否公开</th>
                        <th>操作</th>
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
                                <el-button type="info" size="small" plain @click="quitTeam(role.info.ID, data, i)"
                                    >退出</el-button
                                >
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
        <el-alert title="当前团队没有任何角色" type="info" show-icon v-else></el-alert>
    </div>
</template>

<script>
import { getMyJoinedTeams, changeRolePublic, quitTeam } from "@/service/team/member.js";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { showSchoolIcon, showSchoolName, showBodyType, showTime } from "@/utils/filters";

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
                    title: "设置成功",
                    message: "更新设置成功",
                    type: "success",
                });
            });
        },
        quitTeam: function (role_id, list, i) {
            quitTeam(this.team_id, role_id).then((res) => {
                this.$notify({
                    title: "退出成功",
                    message: "角色成功退出队伍",
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
