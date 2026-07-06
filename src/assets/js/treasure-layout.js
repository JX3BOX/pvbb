import treasurePerfect from "@jx3box/jx3box-common/data/treasure_perfect.json";

const STYLE_LENGTH_KEYS = new Set(["top", "right", "bottom", "left", "width", "height", "fontSize", "lineHeight"]);

const DEFAULT_PERFECT_ASSETS = Object.freeze({
    worldBackground: "world/world_bg.svg",
    textBackground: "world/text_bg.png",
    textActiveBackground: "world/text_bg_act.png",
});

const DEFAULT_PERFECT_LAYOUTS = Object.freeze({
    portrait: {
        stage: {
            width: 700,
            height: 700,
        },
        worldBackgroundStyle: {
            left: 55,
            bottom: 36,
            width: 579,
        },
        count: {
            badge: "portrait/world_qy_bg.png",
            style: {
                top: 82,
                left: -23,
            },
            imageStyle: {
                width: 184,
            },
            textStyle: {
                top: 7,
                right: 10,
            },
            format: "inline",
        },
    },
    landscape: {
        stage: {
            width: 700,
            height: 700,
        },
        worldBackgroundStyle: {
            left: 55,
            bottom: 36,
            width: 579,
        },
        count: {
            badge: "landscape/world_qy_bg.png",
            style: {
                top: 0,
                right: 41,
            },
            imageStyle: {
                width: 32,
            },
            textStyle: {
                bottom: 10,
                left: "50%",
                transform: "translateX(-50%)",
                lineHeight: 20,
            },
            format: "stack",
        },
    },
});

export function toCssStyle(style = {}) {
    return Object.entries(style || {}).reduce((result, [key, value]) => {
        if (value === undefined || value === null || value === "") return result;
        result[key] = STYLE_LENGTH_KEYS.has(key) && Number.isFinite(Number(value)) ? `${value}px` : value;
        return result;
    }, {});
}

export function createPerfectLayoutMap(layout = {}) {
    return (layout?.perfect?.items || []).reduce((map, item) => {
        const id = Number(item?.id || item?.dwID);
        if (id) map[id] = item;
        return map;
    }, {});
}

export function getPerfectItems(layout = treasurePerfect) {
    const items = layout?.perfect?.items || [];
    return items.length ? items : treasurePerfect?.perfect?.items || [];
}

export function getPerfectAssets(layout = {}) {
    return {
        ...DEFAULT_PERFECT_ASSETS,
        ...(treasurePerfect?.perfect?.assets || {}),
        ...(layout?.perfect?.assets || {}),
    };
}

export function getPerfectModeLayout(layout = {}, mode = "portrait") {
    const fallbackLayouts = treasurePerfect?.perfect?.layouts || {};
    const layouts = layout?.perfect?.layouts || {};
    const base =
        fallbackLayouts[mode] ||
        fallbackLayouts.portrait ||
        DEFAULT_PERFECT_LAYOUTS[mode] ||
        DEFAULT_PERFECT_LAYOUTS.portrait;
    const selected = layouts[mode] || {};
    const selectedCount = selected.count || {};
    const baseCount = base.count || {};

    return {
        ...base,
        ...selected,
        stage: {
            ...(base.stage || {}),
            ...(selected.stage || {}),
        },
        worldBackgroundStyle: {
            ...(base.worldBackgroundStyle || {}),
            ...(selected.worldBackgroundStyle || {}),
        },
        count: {
            ...baseCount,
            ...selectedCount,
            style: {
                ...(baseCount.style || {}),
                ...(selectedCount.style || {}),
            },
            imageStyle: {
                ...(baseCount.imageStyle || {}),
                ...(selectedCount.imageStyle || {}),
            },
            textStyle: {
                ...(baseCount.textStyle || {}),
                ...(selectedCount.textStyle || {}),
            },
        },
    };
}

export function getPerfectLayout(layout = {}, mode = "portrait") {
    const assets = getPerfectAssets(layout);
    const modeLayout = getPerfectModeLayout(layout, mode);
    const count = modeLayout.count || {};

    return {
        stage: modeLayout.stage,
        worldBackground: {
            src: assets.worldBackground,
            style: modeLayout.worldBackgroundStyle,
        },
        countBadge: count.badge,
        countStyle: count.style,
        countImageStyle: count.imageStyle,
        countTextStyle: count.textStyle,
        countFormat: count.format || "inline",
        textBackground: assets.textBackground,
        textActiveBackground: assets.textActiveBackground,
    };
}

export function getPerfectItemLayout(item = {}, mode = "portrait") {
    const baseLayout = item.layout || {};
    const modeLayout = baseLayout.layouts?.[mode] || {};

    return {
        ...baseLayout,
        ...modeLayout,
        imageStyle: {
            ...(baseLayout.imageStyle || {}),
            ...(modeLayout.imageStyle || {}),
        },
        labelStyle: {
            ...(baseLayout.labelStyle || {}),
            ...(modeLayout.labelStyle || {}),
        },
    };
}
