import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const locales = ["zh-CN", "en-US", "zh-TW", "vi"];
const localeRoot = new URL("../src/locale/", import.meta.url);

async function loadModule(locale, moduleName) {
    const source = await readFile(new URL(`${locale}/${moduleName}.js`, localeRoot), "utf8");
    return Function(source.replace(/^\s*export\s+default\s+/, "return "))();
}

function flatten(value, prefix = "", output = {}) {
    Object.entries(value || {}).forEach(([key, child]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (child && typeof child === "object" && !Array.isArray(child)) flatten(child, path, output);
        else output[path] = child;
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

test("team locale modules keep identical keys and placeholders", async () => {
    const messages = Object.fromEntries(
        await Promise.all(locales.map(async (locale) => [locale, flatten(await loadModule(locale, "team"))]))
    );
    const reference = messages["zh-CN"];
    const keys = Object.keys(reference).sort();

    for (const locale of locales.slice(1)) {
        assert.deepEqual(Object.keys(messages[locale]).sort(), keys, `${locale} team keys must match zh-CN`);
        for (const key of keys) {
            assert.deepEqual(
                placeholders(messages[locale][key]),
                placeholders(reference[key]),
                `${locale}:team.${key} placeholders must match zh-CN`
            );
        }
    }
});

test("all team application sources contain no user-facing Chinese literals", async () => {
    const roots = ["../src/pages/team/", "../src/views/team/", "../src/components/team/"];
    const files = (await Promise.all(roots.map((root) => collectSourceFiles(new URL(root, import.meta.url))))).flat();

    for (const file of files) {
        const source = await readFile(file, "utf8");
        const withoutComments = source
            .replace(/<!--[\s\S]*?-->/g, "")
            .replace(/\/\/.*$/gm, "")
            .replace(/\/\*[\s\S]*?\*\//g, "")
            // These are API-provided role-function enum values used only for branching;
            // their rendered abbreviations are localized through team.raid.roles.*.
            .replace(/case "(?:内攻|外攻|坦克|治疗)":/g, "");
        assert.doesNotMatch(withoutComments, /[\p{Script=Han}]/u, `${file.pathname} still contains Chinese UI copy`);
    }
});

test("static team i18n usages resolve in every locale", async () => {
    const messages = Object.fromEntries(
        await Promise.all(locales.map(async (locale) => [locale, flatten(await loadModule(locale, "team"))]))
    );
    const roots = ["../src/pages/team/", "../src/views/team/", "../src/components/team/"];
    const files = (await Promise.all(roots.map((root) => collectSourceFiles(new URL(root, import.meta.url))))).flat();
    const usedKeys = new Set();

    for (const file of files) {
        const source = await readFile(file, "utf8");
        for (const match of source.matchAll(/\$t\(\s*["'](team\.[^"']+)["']/g)) {
            usedKeys.add(match[1].replace(/^team\./, ""));
        }
    }

    for (const locale of locales) {
        for (const key of usedKeys) {
            assert.ok(Object.hasOwn(messages[locale], key), `${locale} is missing team.${key}`);
        }
    }
});

test("team plaza filter placeholders use locale messages", async () => {
    const source = await readFile(new URL("../src/components/team/org/team_list.vue", import.meta.url), "utf8");
    assert.match(source, /:placeholder="\$t\('team\.homeFilters\.selectServer'\)"/);
    assert.match(source, /:placeholder="\$t\('team\.homeFilters\.searchTeams'\)"/);
    assert.doesNotMatch(source, /placeholder="(?:选择服务器|查找团队)"/);
});

test("team join dialog is teleported above the public tabs", async () => {
    const source = await readFile(new URL("../src/components/team/member/joinpop.vue", import.meta.url), "utf8");
    assert.match(source, /<el-dialog[\s\S]*?append-to-body/);
    assert.match(source, /team\.joinDialog\.description/);
});
