import bodyData from "@jx3box/jx3box-facedat/assets/data/index.json";
function showBodyType(val) {
    return bodyData.bodyMap[val]?.label || "未知";
}

import school_id_map from "@jx3box/jx3box-data/data/xf/schoolid.json";
import { __imgPath } from "@/utils/config";
function showSchoolIcon(val) {
    let id = val || 0;
    return __imgPath + "image/school/" + id + ".png";
}
function showMountIcon(val) {
    let id = val || 0;
    return __imgPath + "image/xf/" + id + ".png";
}

import xfids from "@jx3box/jx3box-data/data/xf/xfid.json";
function showMountName(val) {
    let id = val || 0;
    return xfids[id] || "未知";
}
function showSchoolName(val) {
    let id = val || 0;
    return (id && school_id_map[id]) || "未知";
}

import vismap from "@/assets/data/team/vis.json";
function showVisLabel(val) {
    if (!val) val = 0;
    for (let i = 0; i < vismap.length; i++) {
        let item = vismap[i];
        if (item.value == val) {
            return item.label;
        }
    }
}

import { showTime, showDate } from "@jx3box/jx3box-common/js/moment.js";

import { authorLink } from "@jx3box/jx3box-common/js/utils";

export {
    showBodyType,
    showSchoolIcon,
    showSchoolName,
    showMountIcon,
    showTime,
    showDate,
    showVisLabel,
    showMountName,
    authorLink,
};
