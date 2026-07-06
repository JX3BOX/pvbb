import axios from "axios";
import treasurePerfect from "@jx3box/jx3box-common/data/treasure_perfect.json";
import { getRoleGameAchievements, getAdventures, getAchievements } from "@/service/qqbot-pvx";
import { getPerfectItems } from "@/assets/js/treasure-layout";

const REMOTE_LAYOUT_URL =
    process.env.VUE_APP_ADVENTURE_TREASURE_LAYOUT_URL ||
    "https://cdn.jsdelivr.net/npm/@jx3box/jx3box-common/data/treasure_perfect.json";

let layoutPromise;

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

function isValidTreasureLayout(layout) {
    return Array.isArray(layout?.perfect?.items);
}

function getLayoutItems(layout = {}) {
    return Array.isArray(layout?.perfect?.items) ? layout.perfect.items : [];
}

function getLayoutItemId(item = {}) {
    return Number(item.id || item.dwID);
}

function hasAllBaseItems(baseItems = [], overrideItems = []) {
    const overrideItemIds = new Set(overrideItems.map(getLayoutItemId).filter(Boolean));
    return baseItems.every((item) => overrideItemIds.has(getLayoutItemId(item)));
}

function mergeTreasureLayout(baseLayout = treasurePerfect, overrideLayout = {}) {
    const baseItems = getLayoutItems(baseLayout);
    const overrideItems = getLayoutItems(overrideLayout);

    if (hasAllBaseItems(baseItems, overrideItems)) {
        return {
            ...baseLayout,
            ...overrideLayout,
            perfect: {
                ...(baseLayout.perfect || {}),
                ...(overrideLayout.perfect || {}),
                items: overrideItems,
            },
        };
    }

    const overrideItemMap = overrideItems.reduce((map, item) => {
        const id = getLayoutItemId(item);
        if (id) map[id] = item;
        return map;
    }, {});
    const mergedItemIds = new Set();
    const items = baseItems.map((baseItem) => {
        const id = getLayoutItemId(baseItem);
        mergedItemIds.add(id);
        return {
            ...baseItem,
            ...(overrideItemMap[id] || {}),
        };
    });

    overrideItems.forEach((item) => {
        const id = getLayoutItemId(item);
        if (!mergedItemIds.has(id)) items.push(item);
    });

    return {
        ...baseLayout,
        ...overrideLayout,
        perfect: {
            ...(baseLayout.perfect || {}),
            ...(overrideLayout.perfect || {}),
            items,
        },
    };
}

function normalizeLayoutResponse(res) {
    const layout = res?.data?.data || res?.data || res;
    return isValidTreasureLayout(layout) ? mergeTreasureLayout(treasurePerfect, layout) : treasurePerfect;
}

export function getTreasureLayout(options = {}) {
    const url = String(options.url || REMOTE_LAYOUT_URL || "").trim();
    if (!url) return Promise.resolve(treasurePerfect);

    if (!layoutPromise || options.force || options.url) {
        layoutPromise = axios
            .get(url, {
                withCredentials: false,
            })
            .then(normalizeLayoutResponse)
            .catch(() => treasurePerfect);
    }

    return layoutPromise;
}

function getAchievedAdventureIds(achievements = "", achievementMap = []) {
    const achievementIds = String(achievements || "").split(",");
    return new Set(
        (achievementMap || [])
            .filter((item) => achievementIds.includes(String(item.achievement_id)))
            .map((item) => Number(item.adventure_id))
    );
}

function buildPerfectAchievements(adventureList = [], achievedIds, layout) {
    const adventureMap = (adventureList || []).reduce((map, item) => {
        const id = Number(item.dwID);
        if (id) map[id] = item;
        return map;
    }, {});
    const achievementsList = [];
    let actNum = 0;

    getPerfectItems(layout).forEach((layoutItem, index) => {
        const id = getLayoutItemId(layoutItem);
        const adventure = adventureMap[id];
        if (!id || !adventure) return;

        const isAct = achievedIds.has(id);
        if (isAct) actNum++;
        achievementsList.push({
            ...adventure,
            isAct,
            hasClass: layoutItem.key || "",
            layout: layoutItem,
            zIndex: index + 1,
        });
    });

    return {
        achievementsList,
        actNum,
        allNum: achievementsList.length,
    };
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

    const achievements = res?.data?.data?.achievements || "";
    const achievedIds = getAchievedAdventureIds(achievements, mapRule?.data);

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

        if (type === "perfect") {
            const perfectData = buildPerfectAchievements(adventureRes?.data?.list || [], achievedIds, layout);
            returnData[`${type}AllNum`] = perfectData.allNum;
            returnData[`${type}NowNum`] = perfectData.actNum;
            returnData[type] = perfectData.achievementsList;
            return;
        }

        (adventureRes?.data?.list || []).forEach((item) => {
            if (achievedIds.has(Number(item.dwID))) {
                achievementsList.push(item);
                actNum++;
            }
        });

        returnData[`${type}AllNum`] = adventureRes?.data?.list?.length || 0;
        returnData[`${type}NowNum`] = actNum;
        returnData[type] = achievementsList;
    });

    await Promise.all(adventurePromises);

    const totalNow = returnData.petNowNum + returnData.normalNowNum + returnData.perfectNowNum;
    const totalAll = returnData.petAllNum + returnData.normalAllNum + returnData.perfectAllNum;
    returnData.progress = totalAll ? ((totalNow / totalAll) * 100).toFixed(2) : "0.00";

    return {
        layout,
        data: returnData,
    };
}
