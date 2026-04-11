import { $team } from "@jx3box/jx3box-common/js/api";

function getAdmins(team_id) {
    return $team().get(`/api/team/my-team/${team_id}/manage/admin`);
}

function addAdmin(team_id, user_id) {
    return $team().post(`/api/team/my-team/${team_id}/manage/admin`, {
        user_id: user_id,
    });
}

function delAdmin(team_id, user_id) {
    return $team().delete(`/api/team/my-team/${team_id}/manage/admin/${user_id}`);
}

function updateAdmin(team_id, user_id, data) {
    return $team().put(`/api/team/my-team/${team_id}/manage/admin/${user_id}`, data);
}

function getLeaders(team_id) {
    return $team().get(`/api/team/info/${team_id}/managers`);
}

// 移除团队角色
function removeTeamRole(team_id, role_id) {
    return $team().delete(`/api/team/relation/${team_id}/manage/role/${role_id}`);
}

// 移除账号下所有的团队角色
function removeTeamRoleAll(team_id, user_id) {
    return $team().delete(`/api/team/relation/${team_id}/manage/user/${user_id}`);
}

export { getAdmins, addAdmin, delAdmin, updateAdmin, getLeaders, removeTeamRole, removeTeamRoleAll };
