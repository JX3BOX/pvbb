import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("raid management creates and edits activities in the shared dialog", async () => {
    const [manager, item, dialog] = await Promise.all([
        read("../src/views/team/raid/ManageRaid.vue"),
        read("../src/components/team/raid/RaidItem.vue"),
        read("../src/components/team/raid/RaidFormDialog.vue"),
    ]);

    assert.match(manager, /<RaidFormDialog/);
    assert.match(manager, /@click="openCreateDialog"/);
    assert.match(manager, /@edit="openEditDialog"/);
    assert.doesNotMatch(manager, /to="\/raid\/add"/);
    assert.match(manager, /const cachedTeam = \{/);
    assert.doesNotMatch(manager, /setItem\("currentTeam", currentTeam\)/);
    assert.match(item, /this\.\$emit\("edit", id\)/);
    assert.match(item, /name:\s*["']view_raid["']/);
    assert.match(item, /this\.\$router\.resolve\(\{/);
    assert.doesNotMatch(item, /window\.open\(`\/raid\//);
    assert.match(dialog, /isEdit \? ['"]编辑活动['"] : ['"]创建活动['"]/);
    assert.match(dialog, /addRaid\(data\)/);
    assert.match(dialog, /updateRaid\(this\.raidId, data\)/);
    assert.match(dialog, /moment\(raid\.start_time\)\.format\("YYYY-MM-DD HH:mm:ss"\)/);
    assert.match(dialog, /const requestId = \+\+this\.openRequestId/);
    assert.match(dialog, /requestId !== this\.openRequestId/);
    assert.match(dialog, /const requestId = \+\+this\.presetRequestId/);
    assert.match(dialog, /client !== this\.currentClient/);
});

test("raid activity dialog keeps the existing API contract and grouped form sections", async () => {
    const [dialog, styles] = await Promise.all([
        read("../src/components/team/raid/RaidFormDialog.vue"),
        read("../src/assets/css/team/raid/form_dialog.less"),
    ]);

    assert.match(dialog, /<h4>基础信息<\/h4>/);
    assert.match(dialog, /<h4>报名设置<\/h4>/);
    assert.match(dialog, /<h4>补充说明<\/h4>/);
    assert.match(dialog, /width="920px"/);
    assert.match(dialog, /align-center/);
    assert.match(dialog, /:rows="3"/);
    assert.match(styles, /max-height: calc\(100vh - 24px\)/);
    assert.match(styles, /margin: auto/);
    assert.match(styles, /flex: 1 1 auto/);
    assert.doesNotMatch(dialog, /m-raid-form-intro/);
    for (const field of [
        "team_id",
        "server",
        "client",
        "team_name",
        "name",
        "title",
        "desc",
        "leader",
        "auth",
        "start_time",
        "is_public",
        "auto_accept",
        "force_match",
        "count",
        "row",
        "col",
    ]) {
        assert.match(dialog, new RegExp(`"${field}"`));
    }
    assert.match(dialog, /if \(value\) this\.form\.force_match = 0/);
    assert.match(dialog, /:disabled="!isVerified"/);
});
