const DEFAULT_ROOT = "#app";
const DEFAULT_TIMEOUT = 8000;
const DEFAULT_FRAMES = 2;
const READY_LOG_FLAG = process.env.VUE_APP_QQBOT_READY_LOG;
const DEFAULT_LOG =
    READY_LOG_FLAG === "true" || (READY_LOG_FLAG !== "false" && process.env.NODE_ENV === "development");
let readyTicket = 0;

function nextFrame() {
    return new Promise((resolve) => {
        if (typeof requestAnimationFrame === "function") {
            requestAnimationFrame(() => resolve());
            return;
        }
        setTimeout(resolve, 0);
    });
}

async function waitFrames(count = DEFAULT_FRAMES) {
    for (let i = 0; i < count; i++) {
        await nextFrame();
    }
}

function resolveRoot(root) {
    if (typeof document === "undefined") return null;
    if (!root) return document.querySelector(DEFAULT_ROOT) || document.body || document.documentElement;
    if (typeof root === "string") return document.querySelector(root) || document.body || document.documentElement;
    return root;
}

function shouldLog(options = {}) {
    if (typeof options.log === "boolean") return options.log;
    return DEFAULT_LOG;
}

function describeRoot(root) {
    if (!root) return DEFAULT_ROOT;
    if (typeof root === "string") return root;
    if (root.id) return `#${root.id}`;
    const className = typeof root.className === "string" ? root.className.trim().replace(/\s+/g, ".") : "";
    return className ? `${root.tagName.toLowerCase()}.${className}` : root.tagName.toLowerCase();
}

function withTimeout(promise, timeout = DEFAULT_TIMEOUT) {
    let timer = null;
    const fallback = new Promise((resolve) => {
        timer = setTimeout(resolve, timeout);
    });
    return Promise.race([promise, fallback]).finally(() => {
        if (timer) clearTimeout(timer);
    });
}

function waitForImage(img) {
    if (!img || img.complete) return Promise.resolve();
    return new Promise((resolve) => {
        const done = () => {
            img.removeEventListener("load", done);
            img.removeEventListener("error", done);
            resolve();
        };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
    });
}

function extractCssUrls(value = "") {
    const urls = [];
    const regexp = /url\((['"]?)(.*?)\1\)/g;
    let match = regexp.exec(value);
    while (match) {
        const url = match[2];
        if (url && !/^data:/i.test(url)) urls.push(url);
        match = regexp.exec(value);
    }
    return urls;
}

function collectCssImageUrls(root) {
    if (typeof getComputedStyle !== "function") return [];
    const elements = [root, ...Array.from(root.querySelectorAll("*"))];
    const urls = new Set();
    elements.forEach((el) => {
        const style = getComputedStyle(el);
        ["backgroundImage", "borderImageSource", "listStyleImage"].forEach((prop) => {
            extractCssUrls(style[prop]).forEach((url) => urls.add(url));
        });
    });
    return [...urls];
}

function waitForCssImage(url) {
    if (typeof Image === "undefined") return Promise.resolve();
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve;
        img.src = url;
        if (img.complete) resolve();
    });
}

async function waitForFonts() {
    if (typeof document === "undefined" || !document.fonts?.ready) return;
    try {
        await document.fonts.ready;
    } catch (e) {
        // Font readiness should never block robot screenshots.
    }
}

export function resetQQBotReady(options = {}) {
    if (typeof window === "undefined") return;
    readyTicket += 1;
    window.__READY__ = false;
    window.__DATA_READY__ = typeof options.dataReady === "boolean" ? options.dataReady : false;
    if (shouldLog(options)) {
        console.log("[QQBot Ready] reset", {
            ready: window.__READY__,
            dataReady: window.__DATA_READY__,
            ticket: readyTicket,
        });
    }
}

export function setQQBotDataReady(value = true, options = {}) {
    if (typeof window === "undefined") return;
    window.__DATA_READY__ = value;
    if (shouldLog(options)) {
        console.log("[QQBot Ready] data ready changed", {
            dataReady: window.__DATA_READY__,
            ticket: readyTicket,
        });
    }
}

export async function waitForQQBotAssets(options = {}) {
    const timeout = options.timeout || DEFAULT_TIMEOUT;
    await waitFrames(options.beforeFrames || DEFAULT_FRAMES);
    const root = resolveRoot(options.root);
    if (!root) return;

    const images = Array.from(root.querySelectorAll("img"));
    const cssImages = collectCssImageUrls(root);
    const tasks = [
        ...images.map(waitForImage),
        ...cssImages.map(waitForCssImage),
        waitForFonts(),
    ];

    await withTimeout(Promise.all(tasks), timeout);
    await waitFrames(options.afterFrames || DEFAULT_FRAMES);

    return {
        images: images.length,
        cssImages: cssImages.length,
        timeout,
    };
}

export async function markQQBotReady(options = {}) {
    if (typeof window === "undefined") return;
    const ticket = readyTicket;
    const logReady = shouldLog(options);
    let stats = null;
    try {
        stats = await waitForQQBotAssets(options);
    } finally {
        if (ticket !== readyTicket) {
            if (logReady) {
                console.log("[QQBot Ready] skipped stale ready state", {
                    root: describeRoot(options.root),
                    ticket,
                    currentTicket: readyTicket,
                });
            }
            return;
        }
        window.__READY__ = true;
        if (logReady) {
            console.log("[QQBot Ready] __READY__ = true", {
                root: describeRoot(options.root),
                dataReady: window.__DATA_READY__,
                ...(stats || {}),
            });
        }
    }
}
