import { $team } from "@jx3box/jx3box-common/js/api";
import User from "@jx3box/jx3box-common/js/user";

function getMyJoinedTeams() {
    return $team().get(`/api/team/relation/my/all-roles`);
}

function getMyPureRoles(team_id) {
    return $team().get(`/api/team/relation/my/${team_id}/roles/not-at-team`);
}
function joinTeam(team_id, list) {
    return $team().post(`/api/team/relation/my/${team_id}/join`, {
        roles: list,
    });
}
function quitTeam(team_id, role_id) {
    return $team().delete(`/api/team/relation/my/${team_id}/quit`, {
        params: {
            role_id,
        },
    });
}

function changeRolePublic(team_id, role_id, isPublic) {
    return $team().put(`/api/team/relation/my/${team_id}/role/${role_id}/public`, {
        public: isPublic,
    });
}

function checkMyAuthority(team_id) {
    return $team().get(`/api/team/relation/my/${team_id}/authority`);
    // 99-创始人，如果在team_teams表中与当前团队的super匹配，即是团队创建人时，设authority为99
    // 3-管理员，如果在team_admins表中，指定团队的admins序列中包含当前用户uid，即是团队管理员时，设authority为3，且返回admin表中的详细权限。
    // 2-团员，如果当前用户有角色加入了该团队，查询team_relation表，返回是否存在有效的记录条目
    // 1-登录用户，其他登录用户，设authority为1
    // 0-游客，如果没有登录，设authority为0
}

function getRoleBelongTeams(role_id) {
    return $team().get(`/api/team/relation/role/${role_id}/teams`);
}

function getTeamMembers(team_id, params) {
    return $team().get(`/api/team/relation/${team_id}/roles`, {
        params,
    });
}

function getTeamPendingMembers(team_id, params) {
    return $team().get(`/api/team/relation/${team_id}/manage/need-review-roles`, {
        params,
    });
}

function getMyTeamRoles(team_id, params) {
    return $team().get(`/api/team/relation/${team_id}/manage/role-list`, {
        params,
    });
}

function getMyTeamUsers(team_id, params) {
    return $team().get(`api/team/relation/${team_id}/manage/user`, {
        params,
    });
}
// 不分页获取团员
function getMyTeamUsersNoPager(team_id) {
    return $team().get(`api/team/relation/${team_id}/manage/user/nopager`);
}

function checkRole(team_id, role_id) {
    return $team().put(`/api/team/relation/${team_id}/manage/role/${role_id}/review`, {
        action: 1,
    });
}

function deleteRole(team_id, role_id) {
    return $team().delete(`/api/team/relation/${team_id}/manage/role/${role_id}`);
}

function getPendingCount() {
    return $team().get(`/api/team/relation/review-apply-join-team-list/count`);
}

function remarkRole(team_id, role_id, remark) {
    return $team().put(`/api/team/relation/${team_id}/manage/role/${role_id}/remark`, {
        role_remark: remark,
    });
}

function starRole(team_id, role_id, star) {
    return $team().put(`/api/team/relation/${team_id}/manage/role/${role_id}/star`, {
        star: star,
    });
}

function getTeamBirthDay(team_id, params) {
    return $team().get(`/api/team/relation/${team_id}/users/birthday`, {
        params,
    });
}

export {
    getMyPureRoles,
    getMyJoinedTeams,
    joinTeam,
    quitTeam,
    checkMyAuthority,
    getRoleBelongTeams,
    getTeamMembers,
    changeRolePublic,
    getTeamPendingMembers,
    getMyTeamRoles,
    getMyTeamUsers,
    getMyTeamUsersNoPager,
    checkRole,
    deleteRole,
    getPendingCount,
    remarkRole,
    starRole,
    getTeamBirthDay,
};
