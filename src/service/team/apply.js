import { $team } from "@jx3box/jx3box-common/js/api";
// 监测资格
function postApplyRecord(params) {
    return $team().post(`/api/team/apply/record`, params);
}
// 获取申请记录
function getApplyRecord(params) {
    return $team().get(`/api/team/apply/record`, { params });
}
// 获取所有福利申请
function getEvents() {
    return $team().get(`/api/team/apply/event`);
}
// 获取对应福利申请
function getApply(id) {
    return $team().get(`/api/team/apply/event/${id}`);
}

/**
 * @description 检测申请资格
 * @param {{ team_id: Number, event_id: String }} params
 * @returns {Promise}
 */
function checkApply(params) {
    return $team({ mute: true }).get(`/api/team/apply/record/check`, {
        params,
    });
}

export { getApplyRecord, postApplyRecord, getApply, getEvents, checkApply };
