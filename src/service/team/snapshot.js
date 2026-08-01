import { $cms } from "@jx3box/jx3box-common/js/api";

function getSnapshots(team_id, params) {
    return $cms().get(`/api/cms/team/snapshot/team/${team_id}`, {
        params,
    });
}

function delSnapshot(id) {
    return $cms().delete(`/api/cms/team/snapshot/record/${id}`);
}

function addSnapshot(team_id, data) {
    return $cms().post(`/api/cms/team/snapshot/team/${team_id}`, data);
}

function editSnapshot(id, data) {
    return $cms().put(`/api/cms/team/snapshot/record/${id}`, data);
}

function getSnapshot(id) {
    return $cms()
        .get(`/api/cms/team/snapshot/record/${id}`)
        .then((res) => {
            return res.data.data;
        });
}

function getSnapshotByTime(team_id, params) {
    return $cms().get(`/api/cms/team/snapshot/team/${team_id}/more`, {
        params,
    });
}

export { getSnapshots, addSnapshot, editSnapshot, getSnapshot, delSnapshot, getSnapshotByTime };
