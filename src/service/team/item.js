import { $helper } from "@jx3box/jx3box-common/js/api";
import { __imgPath, __iconPath } from "@/utils/config";

// 获取物品
function get_item(item_id) {
    return $helper().get(`/api/item/${item_id}`);
}

// 物品图标样式
function item_color(quality) {
    switch (quality) {
        case 0:
            return "rgb(167,167,167)";
        case 1:
            return "rgb(0,0,0)";
        case 2:
            return "rgb(0,210,75)";
        case 3:
            return "rgb(0,126,255)";
        case 4:
            return "rgb(254,45,254)";
        case 5:
            return "rgb(255,165,0)";
        default:
            return "rgb(0,0,0)";
    }
}

function item_border(item) {
    switch (item.Quality) {
        case 3:
            return `url(${__imgPath}image/item/blue.png)`;
        case 4:
            return `url(${__imgPath}image/item/purple.png)`;
        case 5:
            return `url(${__imgPath}image/item/orange.gif)`;
        default:
            return "";
    }
}

function item_border_quest(item) {
    if (item.IsQuest > 0) return `url(${__imgPath}image/item/renwu.png)`;
    return "";
}

function icon_url(icon_id) {
    if (isNaN(parseInt(icon_id))) {
        return `${__imgPath}image/common/nullicon.png`;
    } else {
        return `${__iconPath}icon/${icon_id}.png`;
    }
}

export { get_item, item_color, item_border, item_border_quest, icon_url };
