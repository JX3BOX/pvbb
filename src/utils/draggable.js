const DRAG_KEY = "__drag_key";

let dragKeySeed = 0;

export function ensureDragKey(item, prefix = "drag") {
    if (item && typeof item === "object") {
        if (!Object.prototype.hasOwnProperty.call(item, DRAG_KEY)) {
            Object.defineProperty(item, DRAG_KEY, {
                value: `${prefix}-${dragKeySeed++}`,
                enumerable: false,
                configurable: true,
            });
        }

        return item[DRAG_KEY];
    }

    return `${prefix}-${String(item)}`;
}
