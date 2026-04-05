import { $cms, $node, $next, $team } from "@jx3box/jx3box-common/js/api";

// ====== pvp =====
// 获取用户信息
export function getUserInfo(id) {
    return $cms().get(`/api/cms/user/${id}/info`);
}

// 是否是签约作者
export function isSuperAuthor(id) {
    return $cms().get(`/api/cms/user/is_super_author/${id}`);
}

export function getPost(id, no_cache = 0) {
    return $cms().get(`/api/cms/post/${id}`, {
        params: {
            __no_cache: no_cache,
        },
    });
}

// ====== baizhan =====
// 获取所有的百战BOSS列表
export function getBosses() {
    return $node().get("/monster/boss");
}

// 获取所有的百战roll点效果
export function getEffects() {
    return $node().get("/monster/effects");
}

// 获取当前地图
export function getMap(params) {
    return $cms().get(`/api/cms/app/monster/map`, {
        params,
    });
}

// ====== team =====
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
export function checkOAuth() {
    return $cms().get("/api/cms/account/oauth/status");
}

export function getQQbotToken() {
    return $next().get("/api/next2/qqbot/bind-token");
}

export function unbindQQbot() {
    return $next().delete("/api/next2/qqbot/bind-token");
}

export function getProfile() {
    return $cms().get("/api/cms/user/my/profile");
}

export function setProfile(data) {
    return $cms().put("/api/cms/user/my/profile", data);
}
export function getRaidList(data) {
    return $team().get("/api/team/qqbot/game-team-activity/my-create-records", {
        params: data,
    });
}
export function getMyAddRaidList(data) {
    return $team().get("/api/team/qqbot/game-team-activity/my-join-records", {
        params: data,
    });
}
export function updateRaidStatus(id, data) {
    return $team().put(`/api/team/qqbot/game-team-activity/${id}/status`, data);
}
export function getRaidDetail(id) {
    return $team().get(`/api/team/qqbot/game-team-activity/${id}`);
}
export function updateActivity(id, data) {
    return $team().put(`/api/team/qqbot/game-team-activity/${id}`, data);
}
export function clearList(id, data) {
    return $team().delete(`/api/team/qqbot/game-team-activity/${id}/member-list`, { data });
}
export function updateMember(id, memberRecordId, data) {
    return $team().put(`/api/team/qqbot/game-team-activity/${id}/member/${memberRecordId}`, data);
}
export function deleteMember(id, memberRecordId) {
    return $team().delete(`/api/team/qqbot/game-team-activity/${id}/member/${memberRecordId}`);
}
export function updateMemberStatus(id, memberRecordId, data) {
    return $team().put(`/api/team/qqbot/game-team-activity/${id}/member/${memberRecordId}/identity_status`, data);
}
export function setMemberPosition(id, data) {
    return $team().put(`/api/team/qqbot/game-team-activity/${id}/queue-set-position`, data);
}
export function switchPosition(id, data) {
    return $team().put(`/api/team/qqbot/game-team-activity/${id}/queue-switch-position`, data);
}
export function deleteActivity(id) {
    return $team().delete(`/api/team/qqbot/game-team-activity/${id}`);
}

