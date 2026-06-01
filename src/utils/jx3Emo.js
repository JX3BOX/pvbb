import jx3boxData from "@jx3box/jx3box-common/data/jx3box.json";

const DATA_BASE = jx3boxData?.__dataPath || "https://data.jx3box.com/";
const IMG_BASE = jx3boxData?.__imgPath || "https://img.jx3box.com/";
const STORAGE_KEY = "jx3_emotion_catalog";

let emotionMapPromise = null;

function flattenCatalog(list = []) {
    const map = new Map();
    list.forEach((group) => {
        const items = Array.isArray(group?.items) ? group.items : [];
        items.forEach((item) => {
            const key = String(item?.key || "").trim();
            const filename = String(item?.filename || "").trim();
            if (!key || !filename) {
                return;
            }
            map.set(key, filename);
            if (!key.startsWith("#")) {
                map.set(`#${key}`, filename);
            }
        });
    });
    return map;
}

function escapeHtml(text = "") {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function findEmotionKey(candidates = [], map) {
    for (const raw of candidates) {
        const key = String(raw || "").trim();
        if (!key) {
            continue;
        }
        if (map.has(key)) {
            return key;
        }
        if (!key.startsWith("#") && map.has(`#${key}`)) {
            return `#${key}`;
        }
    }
    return "";
}

export function resolveEmotionImageUrl(filename = "") {
    const source = String(filename || "").trim();
    if (!source) {
        return "";
    }
    if (/^https?:\/\//i.test(source) || source.startsWith("//")) {
        return source;
    }
    const normalized = source.replace(/^\/+/, "");
    return `${IMG_BASE}emotion/output/${normalized}`;
}

function buildEmotionImageTag(key, filename, style) {
    const url = resolveEmotionImageUrl(filename);
    return `<img src="${url}" alt="${key}" title="${key}" class="u-jx3-emo" style="${style}" />`;
}

function replaceEmotionImageElements(container, map, style) {
    container.querySelectorAll("img").forEach((img) => {
        const key = findEmotionKey(
            [img.getAttribute("data-emo-key"), img.getAttribute("alt"), img.getAttribute("title")],
            map
        );
        if (!key) {
            return;
        }
        const filename = map.get(key);
        if (!filename) {
            return;
        }
        img.outerHTML = buildEmotionImageTag(key, filename, style);
    });
}

function replaceEmotionTextNodes(container, map, style, keys) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let current = walker.nextNode();

    while (current) {
        textNodes.push(current);
        current = walker.nextNode();
    }

    textNodes.forEach((node) => {
        const text = String(node.nodeValue || "");
        if (!text.includes("#")) {
            return;
        }

        let html = escapeHtml(text);
        keys.forEach((key) => {
            if (!html.includes(key)) {
                return;
            }
            const filename = map.get(key);
            if (!filename) {
                return;
            }
            html = html.replaceAll(key, buildEmotionImageTag(key, filename, style));
        });

        if (html === escapeHtml(text)) {
            return;
        }

        const fragment = document.createRange().createContextualFragment(html);
        node.replaceWith(fragment);
    });
}

async function loadEmotionMap() {
    if (emotionMapPromise) {
        return emotionMapPromise;
    }

    emotionMapPromise = (async () => {
        try {
            const cache = window.localStorage.getItem(STORAGE_KEY);
            if (cache) {
                const parsed = JSON.parse(cache);
                return flattenCatalog(parsed);
            }
        } catch (error) {
            // ignore cache parse errors
        }

        const url = `${DATA_BASE}emotion/output/catalog.json`;
        const res = await fetch(url);
        const data = await res.json();
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            // ignore cache write errors
        }
        return flattenCatalog(data);
    })();

    return emotionMapPromise;
}

export async function renderEmotionHTML(content = "", options = {}) {
    const text = String(content || "");
    if (!text || (!text.includes("#") && !/<img\b/i.test(text))) {
        return text;
    }

    const map = await loadEmotionMap();
    if (!map.size) {
        return text;
    }

    let html = text;
    const { maxWidth = 60, maxHeight = 60 } = options;
    let style = "";
    style += `max-width: ${maxWidth}px;`;
    style += `max-height: ${maxHeight}px;`;
    const keys = Array.from(map.keys()).sort((a, b) => b.length - a.length);
    if (typeof document === "undefined") {
        keys.forEach((key) => {
            if (!html.includes(key)) {
                return;
            }

            const filename = map.get(key);
            if (!filename) {
                return;
            }

            html = html.replaceAll(key, buildEmotionImageTag(key, filename, style));
        });
        return html;
    }

    const container = document.createElement("div");
    container.innerHTML = html;

    replaceEmotionImageElements(container, map, style);
    replaceEmotionTextNodes(container, map, style, keys);

    return container.innerHTML;
}
