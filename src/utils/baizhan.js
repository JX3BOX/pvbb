import { iconLink } from "@jx3box/jx3box-common/js/utils";

export function getEffectInfo(effects, id, type = "icon") {
    const item = effects.find((item) => item.nID === id);
    const iconId = item?.dwIconID || 18005;
    let str = iconLink(iconId);
    if (type === "name") {
        str = item?.szName;
    }
    if (type === "desc") {
        str = item?.szDescription;
    }
    if (type === "reward") {
        str = item?.reward;
    }
    if (type === "tags") {
        str = item?.tags;
    }
    return str;
}
