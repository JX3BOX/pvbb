import { $next, $team } from "@jx3box/jx3box-common/js/api";

//获取全部指令列表
export function getCommandList(params) {
    return $next().get("/api/next2/qqbot/all-keywords", { params });
}
// 试用
export function postCommandTrial(data) {
    return $next().post("/api/next2/qqbot/try-command", data);
}
//获取团队信息
export function getTeamInfo(id) {
    return $team().get(`/api/team/qqbot/game-team-activity/${id}`);
}

//修改成员信息
export function updateMemberInfo(id, memberId, data) {
    return $team().put(`/api/team/qqbot/game-team-activity/${id}/member/${memberId}`, data);
}

//修改活动名称
export function updateTeamName(id, data) {
    return $team().put(`/api/team/qqbot/game-team-activity/${id}/name`, data);
}
