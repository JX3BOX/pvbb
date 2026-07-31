import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("public raid detail restores the roster for signed-out visitors", async () => {
    const page = await read("../src/views/team/raid/ViewRaid.vue");

    assert.match(page, /if \(!User\.isLogin\(\)\) return Promise\.resolve\(\)/);
    assert.match(page, /await Promise\.allSettled\(\[this\.getTeam\(\), this\.getAuthority\(\)\]\)/);
    assert.match(page, /this\.\$store\.commit\("setManageStatus", false\)/);
    assert.match(page, /this\.\$store\.commit\("setIsTeammate", false\)/);
    assert.match(page, /this\.flag = true/);
    assert.match(page, /class="m-raid-view-section m-raid-view-board"/);
    assert.match(page, /<Raid[\s\S]*:is-public="data\.is_public"/);
});

test("snapshot editor ignores stale record responses", async () => {
    const dialog = await read("../src/components/team/snapshot/EditSnapshotDialog.vue");

    assert.match(dialog, /const snapshotId = this\.snapshotId/);
    assert.match(dialog, /const requestId = \+\+this\.loadRequestId/);
    assert.match(dialog, /requestId !== this\.loadRequestId/);
    assert.match(dialog, /String\(snapshotId\) !== String\(this\.snapshotId\)/);
    assert.match(dialog, /this\.loadRequestId \+= 1/);
});

test("raid detail only shows legacy conflict-free mounts for legacy content", async () => {
    const page = await read("../src/views/team/raid/ViewRaid.vue");

    assert.match(page, /if \(!Array\.isArray\(this\.data\?\.content\)\) return \[\]/);
});

test("raid detail component chain uses Vue 3 model and mitt event contracts", async () => {
    const [raid, normalV1, normalV2, sub, tobe, join, memberSetting, memberPop, roleDialog, page] = await Promise.all([
        read("../src/components/team/raid/Raid.vue"),
        read("../src/components/team/raid/RaidNormal_v1.vue"),
        read("../src/components/team/raid/RaidNormal_v2.vue"),
        read("../src/components/team/raid/RaidSub.vue"),
        read("../src/components/team/raid/RaidTobe.vue"),
        read("../src/components/team/raid/JoinPop.vue"),
        read("../src/components/team/raid/RaidMemberSetting.vue"),
        read("../src/components/team/raid/MemberPop.vue"),
        read("../src/components/team/raid/RaidRoleDialog.vue"),
        read("../src/views/team/raid/ViewRaid.vue"),
    ]);

    assert.doesNotMatch(raid, /<raid-normal-v[12][\s\S]*?v-model="members"/);
    assert.match(raid, /<raid-normal-v1[\s\S]*?:data="members"/);
    assert.match(raid, /<raid-normal-v2[\s\S]*?:data="members"/);
    assert.doesNotMatch(normalV1 + normalV2, /\bmodel:\s*\{/);
    assert.match(normalV1 + normalV2, /import RaidRoleDialog from "@\/components\/team\/raid\/RaidRoleDialog\.vue"/);
    assert.match(normalV1 + normalV2, /class="u-member-role-trigger"/);
    assert.match(normalV1 + normalV2, /@click\.stop="openRoleDialog\(member\)"/);
    assert.doesNotMatch(normalV1 + normalV2, /:to="`\/role\/\$\{member\.role_id\}`"/);
    assert.match(normalV2, /const position = Number\(member\?\.order\) - 1/);
    assert.match(normalV2, /_members\[position\] = member/);
    assert.doesNotMatch(normalV2, /const member = val\[index\]/);
    assert.match(sub + tobe, /<raid-role-dialog/);
    assert.doesNotMatch(sub + tobe, /:to="`\/role\/\$\{member\.role_id\}`"/);
    assert.match(roleDialog, /getRole\(this\.roleId\)/);
    assert.match(roleDialog, /class="m-raid-role-meta"/);
    assert.match(roleDialog, /Object\.values\(xfMap\)\.find/);

    for (const source of [normalV1, normalV2, sub, tobe, page]) {
        assert.match(source, /import bus from "@\/utils\/bus"/);
        assert.doesNotMatch(source, /this\.\$bus\.\$(?:on|off|emit)/);
    }
    assert.match(sub, /bus\.off\("pending", this\.handlePending\)/);
    assert.match(tobe, /bus\.off\("updateTobe", this\.handleUpdateTobe\)/);
    assert.match(normalV2, /covertNormal2Sub[\s\S]*this\.\$emit\("update"\)/);
    assert.match(raid, /handlePass\([\s\S]*?this\.loadMembers\(\)/);
    assert.doesNotMatch(raid, /handlePass\([\s\S]*?this\.members\.push\(member\)/);
    assert.match(sub, /await covertSub2Normal[\s\S]*?this\.\$emit\("pass"/);
    assert.match(tobe, /await covertTobe2Normal[\s\S]*?this\.\$emit\("pass"/);
    for (const source of [normalV2, sub, tobe]) {
        assert.doesNotMatch(source, /<el-tooltip[^>]*>\s*<el-popconfirm/);
    }
    assert.match(join, /emits:\s*\["update:modelValue", "confirm"\]/);
    assert.match(join, /:value="item\.ID"/);
    assert.match(join, /width="920px"/);
    assert.match(join, /class="m-raid-joinpop-mode"/);
    assert.match(join, /v-for="item in roleData"/);
    assert.match(join, /确认报名/);
    assert.doesNotMatch(join, /team\/member\/joinpop\.less/);
    assert.doesNotMatch(join, /!custom\s*&\s*isLogin/);
    assert.match(memberSetting, /emits:\s*\["close", "updateRole"\]/);
    assert.match(memberSetting, /\bteleported\b/);
    assert.match(memberSetting, /class="m-raid-member-setting"/);
    assert.match(memberSetting, /class="m-raid-selected-role"/);
    assert.match(memberSetting, /或填写临时角色/);
    assert.match(memberSetting, /:src="showSchoolIcon\(role\.mount\)"/);
    assert.match(memberSetting, /this\.selectedSchool = Number\(member\.mount\) \|\| 0/);
    assert.match(memberSetting, /this\.form\.mount = this\.xfMaps\[0\]\?\.id \|\| ""/);
    assert.doesNotMatch(memberSetting, /popper-append-to-body/);
    assert.doesNotMatch(memberPop, /\bfilters:\s*\{/);
});

test("raid detail uses the modern team shell, shared editor and accessible top actions", async () => {
    const [app, page, sidebar, appStyles, pageStyles, raidStyles, normalV1, normalV2] = await Promise.all([
        read("../src/pages/team/App.vue"),
        read("../src/views/team/raid/ViewRaid.vue"),
        read("../src/components/team/org/team_home_sidebar.vue"),
        read("../src/assets/css/team/app.less"),
        read("../src/assets/css/team/raid/view_raid.less"),
        read("../src/assets/css/team/raid/raid.less"),
        read("../src/components/team/raid/RaidNormal_v1.vue"),
        read("../src/components/team/raid/RaidNormal_v2.vue"),
    ]);

    assert.match(app, /"view_raid"/);
    assert.match(page, /this\.\$store\.commit\("SET_TEAM", this\.info\)/);
    assert.match(page, /import RaidFormDialog from "@\/components\/team\/raid\/RaidFormDialog\.vue"/);
    assert.match(page, /<RaidFormDialog[\s\S]*v-model="formVisible"[\s\S]*:raid-id="id"[\s\S]*@saved="handleRaidSaved"/);
    assert.match(page, /editRaid:\s*function\s*\(\)\s*\{\s*this\.formVisible = true/);
    assert.doesNotMatch(page, /this\.\$router\.push\(`\/raid\/edit\/\$\{this\.id\}`\)/);
    assert.match(page, /handleRaidSaved:\s*async function[\s\S]*await this\.getRaid\(\)/);
    assert.match(sidebar, /this\.\$route\.name === "view_raid"/);
    assert.match(sidebar, /this\.\$store\.state\.team\?\.ID/);
    assert.match(appStyles, /\.m-title[\s\S]*\.u-op[\s\S]*min-height:\s*38px/);
    assert.match(pageStyles, /\.m-raid-view-hero[\s\S]*min-height:\s*40px/);
    assert.match(raidStyles, /grid-auto-flow:\s*column/);
    assert.match(raidStyles, /grid-template-columns:\s*repeat\(var\(--raid-columns,\s*5\),\s*minmax\(0,\s*1fr\)\)/);
    assert.match(raidStyles, /grid-template-rows:\s*repeat\(var\(--raid-rows,\s*5\),\s*68px\)/);
    assert.match(raidStyles, /\.m-raid-corebox\.m-raid-normal[\s\S]*border-radius:\s*18px/);
    assert.match(normalV1 + normalV2, /--raid-columns/);
    assert.match(normalV1 + normalV2, /\{\{\s*f\s*\}\}\s*队/);
    assert.doesNotMatch(normalV2, /class="m-raid-tobebox m-raid-normalbox"/);
});
