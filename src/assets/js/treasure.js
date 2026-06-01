import axios from "axios";
import treasurePerfect from "@jx3box/jx3box-common/data/treasure_perfect.json";
import { getRoleGameAchievements, getAdventures, getAchievements } from "@/service/qqbot-pvx";
import { createPerfectLayoutMap } from "@/assets/js/treasure-layout";

const REMOTE_LAYOUT_URL =
    process.env.VUE_APP_ADVENTURE_TREASURE_LAYOUT_URL ||
    "https://cdn.jsdelivr.net/npm/@jx3box/jx3box-common@latest/data/treasure_perfect.json";

function formatDateTime(dateTimeString) {
    const dateTime = new Date(dateTimeString);
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, "0");
    const date = String(dateTime.getDate()).padStart(2, "0");
    const hours = String(dateTime.getHours()).padStart(2, "0");
    const minutes = String(dateTime.getMinutes()).padStart(2, "0");
    const seconds = String(dateTime.getSeconds()).padStart(2, "0");
    return `${year}年${month}月${date}日 ${hours}:${minutes}:${seconds}`;
}

function normalizeLayoutResponse(res) {
    const layout = res?.data?.data || res?.data || res || treasurePerfect;
    return layout?.perfect?.items?.length ? layout : treasurePerfect;
}

export async function getTreasureLayout(options = {}) {
    const url = String(options.url || REMOTE_LAYOUT_URL || "").trim();
    if (!url) return treasurePerfect;

    try {
        const res = await axios.get(url, {
            withCredentials: false,
        });
        return normalizeLayoutResponse(res);
    } catch {
        return treasurePerfect;
    }
}

export default async function getTreasureData(userJx3Id) {
    const client = location.href.includes("origin") ? "origin" : "std";
    const returnData = {
        pet: [],
        normal: [],
        perfect: [],
    };

    const [res, mapRule, layout] = await Promise.all([
        getRoleGameAchievements(userJx3Id),
        getAchievements(client),
        getTreasureLayout(),
    ]);
    const perfectLayoutMap = createPerfectLayoutMap(layout);

    const achievements = res?.data?.data?.achievements || "";
    let list = achievements.split(",");
    const newList = [];
    (mapRule?.data || []).forEach((item) => {
        if (list.includes(String(item.achievement_id))) {
            newList.push(item.adventure_id);
        }
    });
    list = newList;

    if (res?.data?.data?.updated_at) {
        returnData.updated_at = formatDateTime(res.data.data.updated_at);
    } else {
        returnData.updated_at = "暂无记录";
    }

    const adventureTypes = ["pet", "normal", "perfect"];
    const adventurePromises = adventureTypes.map(async (type) => {
        const adventureRes = await getAdventures({ type, _no_page: 1 }, client);
        const achievementsList = [];
        let actNum = 0;
        let unNum = 0;

        (adventureRes?.data?.list || []).forEach((item) => {
            if (type === "perfect") {
                const itemLayout = perfectLayoutMap[Number(item.dwID)];
                if (!itemLayout) {
                    unNum++;
                    return;
                }

                const isAct = list.includes(item.dwID);
                if (isAct) actNum++;
                achievementsList.push({
                    ...item,
                    isAct,
                    hasClass: itemLayout.key,
                    layout: itemLayout,
                    zIndex: itemLayout.zIndex,
                });
            } else if (list.includes(item.dwID)) {
                achievementsList.push(item);
                actNum++;
            }
        });

        returnData[`${type}AllNum`] = (adventureRes?.data?.list?.length || 0) - unNum;
        returnData[`${type}NowNum`] = actNum;
        returnData[type] = achievementsList;
    });

    await Promise.all(adventurePromises);

    returnData.progress =
        (returnData.petNowNum + returnData.normalNowNum + returnData.perfectNowNum) /
        (returnData.petAllNum + returnData.normalAllNum + returnData.perfectAllNum);
    returnData.progress = (returnData.progress * 100).toFixed(2);

    return {
        layout,
        data: returnData,
    };
}
