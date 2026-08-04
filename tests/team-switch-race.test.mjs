import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("team workspace rejects stale team responses and commits the captured team only", async () => {
    const workspace = await read("../src/views/team/org/ViewMyOrg.vue");

    assert.match(workspace, /const version = \+\+this\.loadVersion/);
    assert.match(workspace, /getTeam\(requestedId\)/);
    assert.match(workspace, /getTeamPermissions\(requestedId\)/);
    assert.match(workspace, /checkMyAuthority\(requestedId\)/);
    assert.match(
        workspace,
        /isCurrentLoad:\s*function \(requestedId, version\)[\s\S]*?version === this\.loadVersion[\s\S]*?this\.id === requestedId/,
    );
    assert.match(workspace, /this\.data = createDefaultTeam\(this\.\$t, requestedId\)/);
    assert.match(workspace, /if \(this\.isCurrentLoad\(requestedId, version\)\) this\.permissionsLoaded = true/);
    assert.match(workspace, /Promise\.allSettled[\s\S]*?if \(!this\.isCurrentLoad\(requestedId, version\)\) return;[\s\S]*?this\.loading = false/);
    assert.match(workspace, /:key="`team-form-\$\{id\}`"/);
    assert.match(workspace, /:key="`permission-\$\{id\}`"/);
    for (const key of ["member-management", "battle-management", "raid-management", "member-roles", "member-battles", "member-raids"]) {
        assert.match(workspace, new RegExp(':key="`' + key + '-\\$\\{id\\}`"'));
    }
});

test("team save waits for live settings and never reuses the destination team id", async () => {
    const [workspace, form] = await Promise.all([
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/components/team/org/teamform.vue"),
    ]);

    const updateIndex = workspace.indexOf("await updateTeam(requestedId, payload)");
    const liveIndex = workspace.indexOf("await form?.submitTv(requestedId)");
    const successIndex = workspace.indexOf('message: this.$t("team.common.updated")');
    assert.ok(updateIndex >= 0 && liveIndex > updateIndex && successIndex > liveIndex);
    assert.match(workspace, /const payload = JSON\.parse\(JSON\.stringify\(this\.data\)\)/);
    assert.match(workspace, /finally \{[\s\S]*?if \(this\.isCurrentLoad\(requestedId, version\)\)[\s\S]*?this\.done = true;[\s\S]*?this\.processing = false/);
    assert.match(form, /submitTv:\s*function \(teamId = this\.id\)/);
    assert.match(form, /team_id:\s*~~teamId/);
    assert.match(form, /return createTeamLiveList\(teamId, data\)/);
    assert.doesNotMatch(form, /createTeamLiveList\(this\.id, data\)\.catch/);
});

test("raid detail and team activity list ignore stale route responses", async () => {
    const [detail, list] = await Promise.all([
        read("../src/views/team/raid/ViewRaid.vue"),
        read("../src/views/team/raid/MyTeamRaid.vue"),
    ]);

    assert.match(detail, /id:\s*\{[\s\S]*?immediate:\s*true[\s\S]*?this\.init\(\)/);
    assert.match(detail, /const raidId = this\.id;[\s\S]*?const version = \+\+this\.loadVersion/);
    assert.match(detail, /this\.data = "";[\s\S]*?this\.info = "";[\s\S]*?this\.loadedRaidId = ""/);
    assert.match(detail, /this\.\$store\.commit\("SET_TEAM", \{\}\)/);
    assert.match(detail, /isCurrentRaidLoad:[\s\S]*?this\.\$route\.name === "view_raid"/);
    assert.match(detail, /if \(!this\.isCurrentRaidLoad\(raidId, version\)\) return/);
    assert.match(detail, /finally \{[\s\S]*?if \(this\.isCurrentRaidLoad\(raidId, version\)\) this\.loading = false/);
    assert.match(detail, /addTobeMember\(raidId, role\)[\s\S]*?isCurrentRaidLoad\(raidId, version\)/);
    assert.match(detail, /updateRaid\(raidId, _data\)[\s\S]*?isCurrentRaidLoad\(raidId, version\)/);
    assert.match(detail, /<RaidFormDialog[\s\S]*?:key="`raid-form-\$\{id\}`"/);
    assert.match(detail, /<join-pop[\s\S]*?:key="`raid-join-\$\{id\}`"/);

    assert.match(list, /requestKey:\s*function[\s\S]*?this\.teamId[\s\S]*?this\.showAll/);
    assert.match(list, /requestKey:\s*\{[\s\S]*?immediate:\s*true[\s\S]*?this\.loadRaids\(\)/);
    assert.match(list, /const teamId = this\.teamId;[\s\S]*?const version = \+\+this\.loadVersion/);
    assert.match(list, /this\.data = \[\];[\s\S]*?this\.raids = \[\];[\s\S]*?this\.search = ""/);
    assert.match(list, /getMemberTeamRaids\(teamId\)/);
    assert.match(list, /if \(!this\.isCurrentRaidRequest\(teamId, showAll, version\)\) return/);
    assert.match(list, /finally\(\(\) => \{[\s\S]*?isCurrentRaidRequest\(teamId, showAll, version\)[\s\S]*?this\.loading = false/);
});

test("the org list alias uses the same modern home shell and visible entry points avoid legacy shells", async () => {
    const [app, list, sidebar, info, role] = await Promise.all([
        read("../src/pages/team/App.vue"),
        read("../src/views/team/org/ListOrg.vue"),
        read("../src/components/team/org/team_home_sidebar.vue"),
        read("../src/components/team/org/team_info.vue"),
        read("../src/views/team/role/ViewRole.vue"),
    ]);

    assert.match(app, /"index",[\s\S]*?"list_org",[\s\S]*?"view_org"/);
    assert.match(list, /\["index", "list_org"\]\.includes\(this\.\$route\.name\)/);
    assert.match(list, /<team-list :home-mode="true"/);
    assert.match(sidebar, /\["index", "list_org", "view_org"\]\.includes\(this\.\$route\.name\)/);
    assert.match(info, /name:\s*"manage_my_org"[\s\S]*?tab:\s*"setting"[\s\S]*?subtab:\s*"verify"/);
    assert.doesNotMatch(info, /:to="'\/org\/verify\/' \+ id"/);
    assert.match(role, /window\.location\.href = "\/dashboard\/role"/);
    assert.doesNotMatch(role, /this\.\$router\.push\("\/role\/manage"\)/);
});
