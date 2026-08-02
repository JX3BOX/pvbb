import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

test("migrated team shell and battle surfaces contain no user-facing Chinese literals", async () => {
    const files = [
        "../src/pages/team/App.vue",
        "../src/components/team/org/team_home_sidebar.vue",
        "../src/views/team/org/ListOrg.vue",
        "../src/views/team/org/ViewOrg.vue",
        "../src/views/team/org/ViewMyOrg.vue",
        "../src/views/team/battle/battleItem.vue",
        "../src/views/team/battle/el-select-loading.vue",
        "../src/views/team/battle/index.vue",
        "../src/views/team/battle/myBattle.vue",
        "../src/views/team/battle/relevance.vue",
        "../src/views/team/battle/teamItem.vue",
        "../src/components/team/Wrapper.vue",
        "../src/components/team/widget/Nav.vue",
        "../src/components/team/widget/Nav2.vue",
        "../src/components/team/widget/Goback.vue",
        "../src/views/team/member/ListMember.vue",
        "../src/views/team/member/UserList.vue",
        "../src/views/team/member/PendingList.vue",
        "../src/views/team/member/MemberItem.vue",
        "../src/views/team/snapshot/ListSnapshot.vue",
        "../src/views/team/snapshot/EditPassword.vue",
        "../src/components/team/snapshot/snapshotItem.vue",
        "../src/components/team/snapshot/snapshotStat.vue",
        "../src/components/team/snapshot/snapshotChart.vue",
        "../src/components/team/snapshot/snapshotList.vue",
        "../src/views/team/dkp/ManageDkp.vue",
        "../src/components/team/dkp/dkp_list.vue",
        "../src/components/team/dkp/dkp_logs.vue",
        "../src/components/team/dkp/drop_item.vue",
        "../src/components/team/dkp/dkp_dialog.vue",
        "../src/views/team/org/ManageVideo.vue",
        "../src/components/team/org/team_videos.vue",
        "../src/components/team/org/teamform.vue",
        "../src/components/team/org/team_role.vue",
        "../src/components/team/org/team_info.vue",
        "../src/views/team/dkp/MyDkp.vue",
        "../src/views/team/org/EditPermission.vue",
        "../src/views/team/org/EditOrgConfig.vue",
        "../src/components/team/org/team_verify_logs.vue",
        "../src/components/team/org/team_intro.vue",
        "../src/components/team/org/team_recruit.vue",
        "../src/components/team/org/team_trophy.vue",
        "../src/components/team/org/team_medals.vue",
        "../src/views/team/member/ViewMember.vue",
        "../src/views/team/raid/TeamRaid.vue",
        "../src/views/team/org/ViewComment.vue",
        "../src/components/team/org/team_panel.vue",
        "../src/views/team/org/EditNamespace.vue",
        "../src/components/team/org/team_advanced_setting.vue",
        "../src/components/team/org/team_list.vue",
        "../src/components/team/member/joinpop.vue",
    ];

    for (const path of files) {
        const source = await readFile(new URL(path, import.meta.url), "utf8");
        const withoutComments = source
            .replace(/<!--[\s\S]*?-->/g, "")
            .replace(/\/\/.*$/gm, "")
            .replace(/\/\*[\s\S]*?\*\//g, "");
        assert.doesNotMatch(withoutComments, /[\p{Script=Han}]/u, `${path} still contains Chinese UI copy`);
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
