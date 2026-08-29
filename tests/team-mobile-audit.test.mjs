import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("legacy team routes retain explicit mobile layout fallbacks", async () => {
    const [groupPage, groupStyles, snapshotStyles, applyPage, applyStyles, roleStyles, listRoleStyles] =
        await Promise.all([
            read("../src/views/team/role/GroupRole.vue"),
            read("../src/assets/css/team/role/my_teams.less"),
            read("../src/assets/css/team/snapshot/add.less"),
            read("../src/views/team/apply/ApplySingle.vue"),
            read("../src/assets/css/team/events/apply.less"),
            read("../src/assets/css/team/role/roleform.less"),
            read("../src/assets/css/team/role/list_role.less"),
        ]);

    assert.match(groupPage, /<td :data-label="\$t\('team\.role\.roleName'\)">/);
    assert.match(groupPage, /class="u-role-mount-preference-cell"[\s\S]*?:data-label="\$t\('team\.mountPreference\.label'\)"/);
    assert.match(groupStyles, /@media screen and \(max-width: 620px\)[\s\S]*?\.m-group-role[\s\S]*?thead\s*\{\s*display:\s*none/);
    assert.match(groupStyles, /td\s*\{[\s\S]*?grid-template-columns:\s*76px minmax\(0, 1fr\)/);
    assert.match(groupStyles, /content:\s*attr\(data-label\)/);

    assert.match(snapshotStyles, /@media screen and \(max-width: 620px\)[\s\S]*?\.u-user\s*\{[\s\S]*?width:\s*50%/);
    assert.match(snapshotStyles, /:deep\(\.demo-form-inline\)[\s\S]*?width:\s*100%;[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
    assert.match(snapshotStyles, /:deep\(\.el-form-item__content\)[\s\S]*?margin-left:\s*0 !important/);

    assert.match(applyPage, /class="m-apply-logs-table"[\s\S]*?<el-table/);
    assert.match(applyStyles, /@media screen and \(max-width: 620px\)[\s\S]*?\.u-team\s*\{[\s\S]*?flex-direction:\s*column/);
    assert.match(applyStyles, /\.el-input,[\s\S]*?\.el-textarea\s*\{\s*width:\s*100% !important/);
    assert.match(applyStyles, /\.m-apply-logs-table \.el-table\s*\{\s*min-width:\s*640px/);

    assert.match(roleStyles, /@media screen and \(max-width: 620px\)[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
    assert.match(roleStyles, /\.el-select,[\s\S]*?\.u-btn\s*\{\s*width:\s*100%/);
    assert.match(listRoleStyles, /\.m-team-note-dialog[\s\S]*?width:\s*calc\(100% - 24px\) !important;[\s\S]*?min-width:\s*0/);
});

test("team shell provides a viewport-safe baseline for routed pages and dialogs", async () => {
    const appStyles = await read("../src/assets/css/team/app.less");

    assert.match(appStyles, /@media screen and \(max-width: 820px\)[\s\S]*?\.m-team-modern-shell__sidebar[\s\S]*?position:\s*absolute/);
    assert.match(appStyles, /@media screen and \(max-width: @phone\)[\s\S]*?\.p-team \.m-main[\s\S]*?padding:\s*10px 15px/);
    assert.match(appStyles, /@media screen and \(max-width: @phone\)[\s\S]*?\.el-dialog\s*\{[\s\S]*?\.size\(100%\) !important;[\s\S]*?margin:\s*0 !important/);
});
