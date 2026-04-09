import { $node } from "@jx3box/jx3box-common/js/api";

const $ = $node();

// 获取单个成就
export function get_achievement(achievement_id, params) {
    if (!achievement_id) return null;
    return $.get(`api/node/achievement/${achievement_id}`, { params });
}

// 获取单个任务
export function get_quest(id, client = "std") {
    return $.get(`/quest/`, {
        params: { id, client },
    });
}

// 物品详情沿用 jx3box-editor 的封装
export { get_item } from "@jx3box/jx3box-editor/src/service/item";
