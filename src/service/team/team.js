import { $team } from "@jx3box/jx3box-common/js/api";
import { postStat } from "@jx3box/jx3box-common/js/stat";

function getMyTeams(params) {
    return $team().get("/api/team/my-team", {
        params: params,
    });
}

function getMyManageTeams(params) {
    return $team().get("/api/team/my-manage-teams", {
        params: params,
    });
}
function getMyPowerTeams(powers) {
    return $team().get(`/api/team/my-manage-teams-that-have-power`, {
        params: {
            powers: powers,
        },
    });
}

function createTeam(data) {
    return $team().post("/api/team/my-team", data);
}
function updateTeam(id, data) {
    return $team().put("/api/team/my-team/" + id, data);
}
function updateTeamInfo(team_id, data) {
    return $team().patch(`/api/team/my-team/${team_id}`, data);
}

function getTeam(id) {
    return $team().get("/api/team/info/" + id);
}

function checkTeam(id, status) {
    return $team().put("/api/team/info/" + id + "/verity?status=" + status);
}

function delTeam(id) {
    return $team().delete("/api/team/info/" + id);
}

function getTeams(params) {
    return $team().get("/api/team/public", {
        params: params,
    });
}

function hasTeam(server, name) {
    return $team().get("/api/team/check-repeat-team-name", {
        params: {
            server: server,
            name: name,
        },
    });
}

function getVideos(id, params) {
    return $team().get(`/api/team/video/team/${id}`, { params });
}
function getVideosMaster(id, params) {
    return $team().get(`/api/team/video/team/${id}/all`, { params });
}
function addVideo(params) {
    return $team().post(`/api/team/video`, params);
}
function deleteVideo(id) {
    return $team().delete(`/api/team/video/${id}`);
}
function updateVideo(id, params) {
    return $team().put(`/api/team/video/${id}`, params);
}
function getBoss(params) {
    return $team().get(`/api/team/rank/events/boss-list`, { params });
}

function transformTeam(team_id, user_id) {
    return $team().put(`/api/team/my-team/${team_id}/transfer/to/user/${user_id}`);
}

function addLike(team_id) {
    return postStat("team", team_id, "like");
}

function putMyTeamsPassword(team_id, password) {
    return $team().put(`/api/team/config/${team_id}/advanced/snapshot_pwd`, {
        password,
    });
}

function getTeamHonors(team_id) {
    return $team().get(`/api/team/info/${team_id}/honors`);
}

function getTeamsList(team_id) {
    return $team().get(`/api/team/rank/events`);
}

// 创建/修改我的某个团队的直播间列表
function createTeamLiveList(team_id, data) {
    return $team().post(`/api/team/my-team/${team_id}/live-room`, data);
}

// 获取我的某个团队的直播间列表
function getTeamLiveList(team_id) {
    return $team().get(`/api/team/my-team/${team_id}/live-room`);
}

// 获取我的团队
function getAllMyTeams(params) {
    return $team().get("/api/team/relation/my/all-team");
}

// 加载团队权限
function getTeamPermissions(team_id) {
    return $team().get(`api/team/my-team/${team_id}/manage/power-list`);
}

export {
    getTeamsList,
    getMyTeams,
    getMyManageTeams,
    getMyPowerTeams,
    createTeam,
    updateTeam,
    getTeam,
    checkTeam,
    delTeam,
    getTeams,
    transformTeam,
    addLike,
    getVideos,
    getVideosMaster,
    addVideo,
    updateVideo,
    deleteVideo,
    getBoss,
    hasTeam,
    putMyTeamsPassword,
    getTeamHonors,
    updateTeamInfo,
    createTeamLiveList,
    getTeamLiveList,
    getAllMyTeams,
    getTeamPermissions,
};
