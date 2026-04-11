import { $cms } from "@jx3box/jx3box-common/js/api";
function auditTeam(team_name) {
    return $cms().get("/api/cms/team/exist", {
        params: {
            name: team_name,
        },
    });
}

function verifyTeam(team_id, data) {
    return $cms().post(`/api/cms/team/${team_id}/verify`, data);
}

function getVerifyLogs(team_id, params) {
    return $cms().get(`/api/cms/team/${team_id}/verify`, {
        params: params,
    });
}

export { auditTeam, verifyTeam, getVerifyLogs };
