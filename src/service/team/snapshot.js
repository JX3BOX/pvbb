import { $team } from "@jx3box/jx3box-common/js/api";

function getSnapshots(team_id, params) {
    return $team().get(`/api/team/snapshot/team/${team_id}`, {
        params,
    });
}

function delSnapshot(id) {
    return $team().delete(`/api/team/snapshot/record/${id}`);
}

function addSnapshot(team_id, data) {
    return $team().post(`/api/team/snapshot/team/${team_id}`, data);
}

function editSnapshot(id, data) {
    return $team().put(`/api/team/snapshot/record/${id}`, data);
}

function getSnapshot(id) {
    return $team()
        .get(`/api/team/snapshot/record/${id}`)
        .then((res) => {
            return res.data.data;
        });
}

function getSnapshotByTime(team_id, params) {
    return $team().get(`/api/team/snapshot/team/${team_id}/more`, {
        params,
    });
}

export { getSnapshots, addSnapshot, editSnapshot, getSnapshot, delSnapshot, getSnapshotByTime };
