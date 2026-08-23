import { $cms } from "@jx3box/jx3box-common/js/api";

// 批量读取角色在指定团队申报的可用心法。
export function getRoleMountPreferences(teamId) {
    return $cms().get(`/api/cms/team/role-mount-preferences/${teamId}`);
}

// 角色本人或成员管理员批量保存可用心法；Team 的加入/审核接口保持不变。
export function saveRoleMountPreferences(teamId, preferences) {
    return $cms().put(`/api/cms/team/role-mount-preferences/${teamId}`, { preferences });
}

export function deleteRoleMountPreference(teamId, roleId) {
    return $cms().delete(`/api/cms/team/role-mount-preferences/${teamId}/${roleId}`);
}
