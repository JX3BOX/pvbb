import { $helper, $cms, $team } from "@jx3box/jx3box-common/js/api";

function getMyManageTeams(params) {
    return $helper({ proxy: true }).get("/api/team_dkp/team", {
        params: params,
    });
}

function getAllMembersDkpList(team_id) {
    return $helper({ proxy: true }).get(`/api/team_dkp/team/${team_id}`);
}

function initDkp(team_id) {
    return $helper({ proxy: true }).get(`/api/team_dkp/team/${team_id}/init`);
}

function syncDkp(team_id) {
    return $helper({ proxy: true }).get(`/api/team_dkp/team/${team_id}/sync`);
}

function modifyDkp(team_id, data) {
    return $helper({ proxy: true }).put(`/api/team_dkp/team/${team_id}/modify`, data);
}

function editDkp(team_id, data) {
    return $helper({ proxy: true }).put(`/api/team_dkp/team/${team_id}/edit`, data);
}

function deleteDkp(team_id, data) {
    return $helper({ proxy: true }).put(`/api/team_dkp/team/${team_id}/remove`, data);
}

function searchItem(params) {
    return $helper({ proxy: true }).get(`/api/item/search`, {
        params: params,
    });
}

function getPersonalDkpAll() {
    return $helper({ proxy: true }).get("api/team_dkp/personal");
}

function getPersonalDkp(team_id) {
    return $helper({ proxy: true }).get(`api/team_dkp/personal/${team_id}`);
}

function getPersonalDkpLog(team_id, params) {
    return $helper({ proxy: true }).get(`api/team_dkp_log/personal/${team_id}`, {
        params: params,
    });
}

function getTeamDkpLog(team_id, params) {
    return $helper({ proxy: true }).get(`api/team_dkp_log/team/${team_id}`, {
        params: params,
    });
}

function getBriefTeamDkp(team_id) {
    return $helper({ proxy: true }).get(`/api/team_dkp/team/${team_id}/brief`);
}

// 新版 dkp api
function getTeamDkpList(team_id) {
    return $cms().get(`/api/cms/team/dkp/${team_id}`);
}

function getTeamDkpLogs(team_id, params) {
    return $cms().get(`/api/cms/team/dkp/${team_id}/logs`, {
        params,
    });
}

function getTeamMyDkp(team_id) {
    return $cms().get(`/api/cms/team/dkp/${team_id}/my`);
}

function syncSnapshotDkp(id, data) {
    return $team().post(`/api/team/snapshot/record/${id}/dkp`, data);
}

function updateDkp(team_id, data) {
    return $cms().put(`/api/cms/team/dkp/${team_id}/records`, data);
}

function resetDkp(team_id) {
    return $cms().put(`/api/cms/team/dkp/${team_id}/reset`);
}

function updateDkpRule(team_id, data) {
    return $cms().put(`/api/cms/team/dkp/${team_id}/rule`, {
        rule: data,
    });
}

function getDkpRule(team_id) {
    return $cms().get(`/api/cms/team/dkp/${team_id}/rule`);
}

export {
    getMyManageTeams,
    getAllMembersDkpList,
    initDkp,
    syncDkp,
    modifyDkp,
    editDkp,
    deleteDkp,
    searchItem,
    getPersonalDkpAll,
    getPersonalDkp,
    getPersonalDkpLog,
    getTeamDkpLog,
    getBriefTeamDkp,
    getDkpRule,
    updateDkpRule,
    getTeamDkpList,
    getTeamDkpLogs,
    getTeamMyDkp,
    updateDkp,
    resetDkp,
    syncSnapshotDkp,
};
