import { $cms, $team } from "@jx3box/jx3box-common/js/api";

// 排表
function addRaid(data) {
    return $cms().post(`/api/cms/team/raid`, data);
}

function updateRaid(id, data) {
    return $cms().put(`/api/cms/team/raid/${id}`, data);
}

function getRaid(id) {
    return $cms().get(`/api/cms/team/raid/${id}`);
}

function deleteRaid(team_id, id) {
    return $cms().delete(`/api/cms/team/raid/${team_id}/${id}`);
}
function removeRaid(id) {
    return $cms().delete(`/api/cms/team/raid/${id}`);
}

function manageRaid(team_id, params) {
    return $cms().get(`/api/cms/team/raids/manage/${team_id}`, {
        params,
    });
}

function getRaids(team_id) {
    return $cms().get(`/api/cms/team/raids/${team_id}`);
}

function searchRaids(params) {
    return $cms().get(`/api/cms/team/raids`, {
        params: params,
    });
}

function getMyTeamRaids() {
    return $cms().get(`/api/cms/team/raids/my-join`);
}

function getRoles(teamId, search) {
    return $team().get(`/api/team/relation/${teamId}/roles/search`, {
        params: {
            role: search,
        },
    });
}

// 模板
function addRaidTemplate(data) {
    return $cms().post(`/api/cms/team/raid_template`, data);
}
function updateRaidTemplate(id, data) {
    return $cms().put(`/api/cms/team/raid_template/${id}`, data);
}
function deleteRaidTemplate(team_id, id) {
    return $cms().delete(`/api/cms/team/raid_template/${team_id}/${id}`);
}
function getRaidTemplate(id) {
    return $cms().get(`/api/cms/team/raid_template/${id}`);
}
function listRaidTemplate(team_id) {
    return $cms().get(`/api/cms/team/raid_templates/${team_id}`);
}

// 获取活动名称
function getRaidPresets(client = "std") {
    return $cms().get(`/api/cms/team/raid/presets`, {
        params: {
            client,
        },
    });
}

// 退出活动
function quitRaid(raid_id) {
    return $cms().delete(`/api/cms/team/raid/${raid_id}/raid_member/quit`);
}

// 团队活动置顶
function setRaidSticky(raid_id, data) {
    return $cms().put(`/api/cms/team/raid/${raid_id}/sticky`, data);
}

// 获取成员列表
function getRaidMembers(raid_id) {
    return $cms().get(`/api/cms/team/raid/${raid_id}/raid_member/list`);
}
// 正式名单操作
// ================
// 新增正式成员
function addNormalMember(raid_id, data) {
    return $cms().post(`/api/cms/team/raid/${raid_id}/raid_member/normal`, data);
}
// 修改正式成员和替补成员信息
function updateMember(raid_id, id, data) {
    return $cms().put(`/api/cms/team/raid/${raid_id}/raid_member/${id}`, data);
}
// 正式队员转替补
function covertNormal2Sub(raid_id, id) {
    return $cms().put(`/api/cms/team/raid/${raid_id}/raid_member/${id}/downgrade`);
}
// 排序
function sortMember(raid_id, data) {
    return $cms().put(`/api/cms/team/raid/${raid_id}/raid_member/order`, data);
}

// 替补名单操作
// ================
// 新增替补
function addSubMember(raid_id, data) {
    return $cms().post(`/api/cms/team/raid/${raid_id}/raid_member/sub`, data);
}
// 替补转正
function covertSub2Normal(raid_id, id, replaceId) {
    let url = `/api/cms/team/raid/${raid_id}/raid_member/${id}/upgrade` + (replaceId ? `?replace=${replaceId}` : "");
    return $cms().put(url);
}
// 删除替补|正式
function removeMember(raid_id, id) {
    return $cms().delete(`/api/cms/team/raid/${raid_id}/raid_member/${id}/remove`);
}

// 候选名单操作
// ===============
// 报名
function addTobeMember(raid_id, data) {
    return $cms().post(`/api/cms/team/raid/${raid_id}/raid_member/tobe`, data);
}
// 转为替补
function covertTobe2Sub(raid_id, id) {
    return $cms().put(`/api/cms/team/raid/${raid_id}/raid_member/${id}/candidate`);
}
// 拒绝申请
function rejectMember(raid_id, id) {
    return $cms().delete(`/api/cms/team/raid/${raid_id}/raid_member/${id}/reject`);
}
// 转为正式
function covertTobe2Normal(raid_id, id, replaceId) {
    let url = `/api/cms/team/raid/${raid_id}/raid_member/${id}/accept` + (replaceId ? `?replace=${replaceId}` : "");
    return $cms().put(url);
}

// 获取小程序码
function getWxacode(raid_id) {
    return $cms().get(`/api/cms/team/raid/${raid_id}/meta/wxacode`);
}

export {
    addRaid,
    updateRaid,
    getRaid,
    deleteRaid,
    removeRaid,
    manageRaid,
    getRaids,
    searchRaids,
    getMyTeamRaids,
    getRoles,
    addRaidTemplate,
    updateRaidTemplate,
    deleteRaidTemplate,
    getRaidTemplate,
    listRaidTemplate,
    getRaidPresets,
    getRaidMembers,
    addSubMember,
    addNormalMember,
    addTobeMember,
    updateMember,
    covertNormal2Sub,
    covertSub2Normal,
    removeMember,
    covertTobe2Sub,
    rejectMember,
    sortMember,
    covertTobe2Normal,
    quitRaid,
    setRaidSticky,
    getWxacode,
};
