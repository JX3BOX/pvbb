import { $node } from "@jx3box/jx3box-common/js/api";

const $ = $node();
const $mute = $node({ mute: true });

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

// 获取单个物品（与 tmp item-icon 一致的接口）
export function get_item(item_id, client = "std") {
    if (!item_id) return;
    return $mute.get(`api/node/item/${item_id}`, {
        params: { client },
    });
}
