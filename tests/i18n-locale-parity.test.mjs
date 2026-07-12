import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const locales = ["zh-CN", "en-US", "zh-TW", "vi"];
const localeRoot = new URL("../src/locale/", import.meta.url);

async function loadMessages(locale) {
    const source = await readFile(new URL(`${locale}/pages.js`, localeRoot), "utf8");
    const executable = source.replace(/^\s*export\s+default\s+/, "return ");
    return Function(executable)();
}

function flatten(value, prefix = "", output = {}) {
    Object.entries(value || {}).forEach(([key, child]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (child && typeof child === "object" && !Array.isArray(child)) {
            flatten(child, path, output);
        } else {
            output[path] = child;
        }
    });
    return output;
}

function placeholders(value) {
    return [...String(value || "").matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]).sort();
}

async function collectSourceFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = await Promise.all(
        entries.map((entry) => {
            const target = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
            if (entry.isDirectory()) return collectSourceFiles(target);
            return /\.(?:js|vue)$/.test(entry.name) ? [target] : [];
        })
    );
    return files.flat();
}

test("all application locales keep identical keys and placeholders", async () => {
    const messages = Object.fromEntries(
        await Promise.all(locales.map(async (locale) => [locale, flatten(await loadMessages(locale))]))
    );
    const reference = messages["zh-CN"];
    const referenceKeys = Object.keys(reference).sort();

    for (const locale of locales.slice(1)) {
        assert.deepEqual(Object.keys(messages[locale]).sort(), referenceKeys, `${locale} locale keys must match zh-CN`);
        for (const key of referenceKeys) {
            assert.deepEqual(
                placeholders(messages[locale][key]),
                placeholders(reference[key]),
                `${locale}:${key} placeholders must match zh-CN`
            );
        }
    }
});

test("static community, joke, and emotion i18n usages resolve in every locale", async () => {
    const messages = Object.fromEntries(
        await Promise.all(locales.map(async (locale) => [locale, flatten(await loadMessages(locale))]))
    );
    const sourceFiles = await collectSourceFiles(new URL("../src/", import.meta.url));
    const usedKeys = new Set();

    for (const file of sourceFiles) {
        const source = await readFile(file, "utf8");
        for (const match of source.matchAll(/\$t\(\s*["'](pages\.(?:community|joke|emotion)\.[^"']+)["']/g)) {
            usedKeys.add(match[1].replace(/^pages\./, ""));
        }
    }

    for (const locale of locales) {
        for (const key of usedKeys) {
            assert.ok(Object.hasOwn(messages[locale], key), `${locale} is missing ${key}`);
        }
    }
});
