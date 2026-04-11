import { $team, $cms } from "@jx3box/jx3box-common/js/api";

function getBattleOrJcl(params) {
    return $team().get(`/api/team/battle/my-list`, { params });
}

//关联战斗数据
function setBattleJcL(id, data) {
    return $team().post(`/api/team/my-race-rank/records/item/${id}/bind-battle`, data);
}

// 获取我的团队百强成绩
function getMyTeamBattleList(params) {
    return $team().get(`/api/team/my-team/race-rank/records`, {
        params,
    });
}

//获取我的百强成绩
function getMyBattleList(params) {
    return $team().get(`/api/team/my-race-rank/records`, { params });
}

// 获取成就对应的首领配置
export function getBossConfig(params) {
    return $cms().get(`/api/cms/team/boss_aid`, { params });
}

export { getBattleOrJcl, setBattleJcL, getMyTeamBattleList, getMyBattleList };
