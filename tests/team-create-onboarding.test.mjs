import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("team creation opens the founder role guide before entering the workspace", async () => {
    const source = await read("../src/views/team/org/AddOrg.vue");

    assert.match(source, /import joinpop from "@\/components\/team\/member\/joinpop\.vue"/);
    assert.match(source, /v-model:show="joinGuideVisible"/);
    assert.match(source, /:team_id="createdTeamId"/);
    assert.match(source, /founder-guide/);
    assert.match(source, /@closed="finishCreation"/);
    assert.match(source, /this\.createdTeamId = teamId;\s*this\.joinGuideVisible = true/);
    assert.match(
        source,
        /finishCreation:[\s\S]*?name: "manage_my_org",[\s\S]*?params: \{ id: teamId \}/
    );
});

test("founder role guide defaults to all roles without changing the normal join dialog", async () => {
    const [dialog, service, zhCn, zhTw, enUs, vi] = await Promise.all([
        read("../src/components/team/member/joinpop.vue"),
        read("../src/service/team/member.js"),
        read("../src/locale/zh-CN/team.js"),
        read("../src/locale/zh-TW/team.js"),
        read("../src/locale/en-US/team.js"),
        read("../src/locale/vi/team.js"),
    ]);

    assert.match(dialog, /founderGuide:[\s\S]*?type: Boolean,[\s\S]*?default: false/);
    assert.match(dialog, /emits: \["update:show", "success", "closed"\]/);
    assert.match(dialog, /const namespace = this\.founderGuide[\s\S]*?"createGuide" : "joinDialog"/);
    assert.match(
        dialog,
        /if \(this\.founderGuide\) \{\s*this\.roles = \[\.\.\.this\.role_ids\];\s*this\.checkAll = this\.role_ids\.length > 0;/
    );
    assert.match(dialog, /this\.\$emit\("success", \[\.\.\.this\.roles\]\)/);
    assert.match(dialog, /joinTeam\(this\.team_id, this\.roles, \{ founderDirect: this\.founderGuide \}\)/);
    assert.match(dialog, /handleClosed:[\s\S]*?this\.\$emit\("closed"\)/);
    assert.match(service, /founder_direct: options\.founderDirect === true/);

    for (const locale of [zhCn, zhTw, enUs, vi]) {
        assert.match(locale, /createGuide:\s*\{/);
    }
});
