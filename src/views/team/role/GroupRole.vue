<template>
    <div class="v-org-list">
        <h1 class="m-title">
            <i class="el-icon-school"></i>
            <span class="u-txt">我的团队</span>
            <span class="u-team-link">
                <i class="el-icon-s-home"></i> 前往 [<a class="u-link" :href="team_link.value">{{ team_link.label }}</a
                >] 主页
            </span>
            <div class="u-op">
                <router-link to="/org/list" class="el-button el-button--primary el-button--mini">
                    <i class="el-icon-circle-plus-outline"></i>
                    寻找团队
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
                            <span class="u-org-name">{{ (item.team_info && item.team_info.name) || "未知" }}</span>
                        </template>
                        <div class="m-group-role-box" v-if="item.roles && item.roles.length">
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
                                    <tr v-for="(role, i) in item.roles" :key="role + i">
                                        <td>{{ role.info.name }}</td>
                                        <td>
                                            <img :src="showSchoolIcon(role.info.mount)" />
                                            {{ showSchoolName(role.info.mount) }}
                                        </td>
                                        <td>{{ showBodyType(role.info.body_type) }}</td>
                                        <td>{{ showTime(role.relation.created_at) }}</td>
                                        <td>
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
                                        <td>
                                            <el-button
                                                type="info"
                                                size="small"
                                                plain
                                                @click="quitTeam(item.team_info.ID, role.info.ID, item.roles, i)"
                                                >退出</el-button
                                            >
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <el-alert title="当前团队没有任何角色" type="info" show-icon v-else></el-alert>
                    </el-tab-pane>
                </el-tabs>
            </template>
            <template v-else>
                <div class="m-team-list-null">
                    <el-alert title="当前没有加入任何团队" type="info" show-icon></el-alert>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { getMyJoinedTeams, changeRolePublic, quitTeam } from "@/service/team/member.js";
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

            org: "",
            team_link: {
                label: " 查看团队 ",
                value: "",
            },
        };
    },
    methods: {
        loadData: function () {
            this.loading = true;
            getMyJoinedTeams()
                .then((res) => {
                    this.data = res.data.data || [];
                    this.org = String(this.data[0]["team_info"]["ID"]);
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        setPublic: function (team_id, role_id, isPublic) {
            changeRolePublic(team_id, role_id, isPublic).then((res) => {
                this.$notify({
                    title: "设置成功",
                    message: "更新设置成功",
                    type: "success",
                });
            });
        },
        quitTeam: function (team_id, role_id, list, i) {
            quitTeam(team_id, role_id).then((res) => {
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
};
</script>

<style lang="less">
@import "@/assets/css/team/role/my_teams.less";
</style>
