import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("team join saves required mount preferences without changing the Team join payload", async () => {
    const [dialog, memberService, preferenceService] = await Promise.all([
        read("../src/components/team/member/joinpop.vue"),
        read("../src/service/team/member.js"),
        read("../src/service/team/role_mount_preference.js"),
    ]);

    assert.match(dialog, /<RoleMountPreferenceSelect[\s\S]*?v-model="mountPreferences\[item\.ID\]"/);
    assert.match(dialog, /allPreferencesReady[\s\S]*?this\.roles\.every/);
    assert.match(dialog, /saveRoleMountPreferences\(this\.team_id, preferences\)[\s\S]*?joinTeam\(/);
    assert.match(memberService, /roles:\s*list,[\s\S]*?founder_direct:/);
    assert.doesNotMatch(memberService, /mounts|preferences/);
    assert.match(preferenceService, /getRoleMountPreferences\(teamId\)[\s\S]*?\.get\(`\/api\/cms\/team\/role-mount-preferences\/\$\{teamId\}`\)/);
    assert.doesNotMatch(preferenceService, /role_ids/);
    assert.match(preferenceService, /\$cms\(\)\.put\(`\/api\/cms\/team\/role-mount-preferences\/\$\{teamId\}`/);
});

test("preference options include same-school builds and explicit universal builds", async () => {
    const utility = await read("../src/utils/team-role-mounts.js");

    assert.match(utility, /UNIVERSAL_TEAM_MOUNT_IDS = new Set\(\[10821\]\)/);
    assert.match(utility, /Number\(item\.school\) === school \|\| UNIVERSAL_TEAM_MOUNT_IDS\.has/);
    assert.match(utility, /mergeRoleMountPreferences/);
});

test("team role preferences feed member review, self-service, admin editing, and raid filtering", async () => {
    const [pending, adminRoles, myTeams, store, memberSetting] = await Promise.all([
        read("../src/views/team/member/PendingList.vue"),
        read("../src/views/team/member/RoleList.vue"),
        read("../src/views/team/role/GroupRole.vue"),
        read("../src/pages/team/store.js"),
        read("../src/components/team/raid/RaidMemberSetting.vue"),
    ]);

    assert.match(pending, /getRoleMountPreferences[\s\S]*?mergeRoleMountPreferences/);
    assert.match(pending, /team\.mountPreference\.unconfigured/);
    assert.match(adminRoles, /editMounts\(item\)[\s\S]*?saveRoleMountPreferences/);
    assert.match(myTeams, /<RoleMountPreferenceSelect[\s\S]*?saveMounts\(item\.team_info\.ID, role\.info\)/);
    assert.match(store, /getRoleMountPreferences[\s\S]*?mergeRoleMountPreferences[\s\S]*?SET_ROLES/);
    assert.match(memberSetting, /normalizeMounts\(role\?\.mounts\)/);
    assert.match(memberSetting, /isRoleCompatibleWithMount\(role, this\.form\.mount\)/);
});

test("all team locales define the mount preference copy", async () => {
    const locales = await Promise.all(
        ["zh-CN", "zh-TW", "en-US", "vi"].map((locale) => read(`../src/locale/${locale}/team.js`))
    );
    for (const locale of locales) {
        assert.match(locale, /mountPreference:\s*\{/);
        assert.match(locale, /requiredHint:/);
        assert.match(locale, /adminTitle:/);
    }
});
