import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("public raid detail restores the roster for signed-out visitors", async () => {
    const page = await read("../src/views/team/raid/ViewRaid.vue");

    assert.match(page, /if \(!User\.isLogin\(\)\) return Promise\.resolve\(\{ authority: 0, r_raid: 0 \}\)/);
    assert.match(page, /await Promise\.allSettled\(\[[\s\S]*?this\.getTeam\(teamId\),[\s\S]*?this\.getAuthority\(teamId\)/);
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

test("snapshot editor submits a writable field whitelist and handles request errors", async () => {
    const dialog = await read("../src/components/team/snapshot/EditSnapshotDialog.vue");

    assert.doesNotMatch(dialog, /const payload = \{\s*\.\.\.this\.form/);
    assert.match(dialog, /const payload = \{[\s\S]*?team_id: this\.selectedTeamId,[\s\S]*?title: this\.form\.title \|\| "",[\s\S]*?desc: this\.form\.desc \|\| "",[\s\S]*?teammate: this\.teammate/);
    assert.match(dialog, /catch \(error\) \{[\s\S]*?error\?\.response\?\.data\?\.msg \|\| this\.\$t\("team\.snapshotEdit\.saveFailed"\)/);
});

test("raid detail only shows legacy conflict-free mounts for legacy content", async () => {
    const page = await read("../src/views/team/raid/ViewRaid.vue");

    assert.match(page, /if \(!Array\.isArray\(this\.data\?\.content\)\) return \[\]/);
});

test("raid detail renders the configured roster dimensions and capacity", async () => {
    const [page, raid, templateSource] = await Promise.all([
        read("../src/views/team/raid/ViewRaid.vue"),
        read("../src/components/team/raid/Raid.vue"),
        read("../src/assets/data/team/team_templates.json"),
    ]);
    const templates = JSON.parse(templateSource);

    assert.match(page, /<Raid[\s\S]*:row="displayRow"[\s\S]*:col="displayCol"/);
    assert.match(page, /displayRow:\s*function\s*\(\)\s*\{\s*return Number\(this\.data\?\.count\) === 10 \? 5/);
    assert.match(page, /displayCol:\s*function\s*\(\)\s*\{\s*return Number\(this\.data\?\.count\) === 10 \? 5/);
    assert.match(raid, /const configuredCount = Number\(this\.count\)/);
    assert.match(raid, /if \(configuredCount > 0\) return configuredCount/);
    assert.match(raid, /return Number\(this\.row \|\| 0\) \* Number\(this\.col \|\| 0\)/);
    assert.match(raid, /Number\(item\?\.is_valid\) === 1/);
    assert.match(raid, /return this\.normalMemberCount < this\.capacity/);
    assert.doesNotMatch(raid, /this\.members\.length <= this\.row \* this\.col/);
    assert.match(raid, /<raid-normal-v2[\s\S]*?:capacity="capacity"/);
    assert.deepEqual(
        templates
            .filter(({ key }) => ["10std", "15std"].includes(key))
            .map(({ key, count, row, col }) => ({ key, count, row, col })),
        [
            { key: "10std", count: 10, row: 5, col: 2 },
            { key: "15std", count: 15, row: 5, col: 3 },
        ],
    );
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
    for (const source of [normalV1, normalV2, sub, tobe]) {
        assert.match(source, /props:\s*\[[^\]]*"header"/);
    }
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
    assert.match(roleDialog, /<RoleAvatar[\s\S]*?:mount="displayRole\.school"[\s\S]*?:body_type="displayRole\.body_type"/);
    assert.match(roleDialog, /showSchoolName\(displayRole\.school\)/);
    assert.match(roleDialog, /Number\(this\.member\?\.mount\)/);

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
    assert.match(join, /team\.raid\.join\.confirm/);
    assert.doesNotMatch(join, /team\/member\/joinpop\.less/);
    assert.doesNotMatch(join, /!custom\s*&\s*isLogin/);
    assert.match(memberSetting, /emits:\s*\["close", "updateRole"\]/);
    assert.match(memberSetting, /\bteleported\b/);
    assert.match(memberSetting, /class="m-raid-member-setting"/);
    assert.match(memberSetting, /class="m-raid-selected-role"/);
    assert.match(memberSetting, /v-model="selectedSchool"[\s\S]*?@change="handleSchoolChange"/);
    assert.match(memberSetting, /\ballow-create\b/);
    assert.match(memberSetting, /v-for="role in filteredRoles"/);
    assert.doesNotMatch(memberSetting, /memberSetting\.orTemporary|memberSetting\.temporaryPlaceholder/);
    assert.doesNotMatch(memberSetting, /\bgetRoles\b/);
    assert.match(memberSetting, /class="m-raid-member-filter-row"[\s\S]*?v-model="selectedSchool"[\s\S]*?v-model="form\.mount"/);
    assert.match(memberSetting, /v-for="mount in getRoleMounts\(role\)"[\s\S]*?:src="showMountIcon\(mount\)"/);
    assert.doesNotMatch(memberSetting, /:src="showSchoolIcon\(role\.mount\)"/);
    assert.match(memberSetting, /handler\(val\)[\s\S]*?this\.selectedSchool = this\.getSchoolByMount\(val\.mount\)/);
    assert.match(memberSetting, /this\.tmpVal = val\.role_id \|\| val\.name \|\| ""/);
    assert.match(memberSetting, /Number\(id\) === 0 \? this\.\$t\("team\.raid\.memberSetting\.allSchools"\) : name/);
    assert.match(memberSetting, /getMountInfo\(mount\)[\s\S]*?Object\.values\(xf_map\)\.find\(\(item\) => Number\(item\.id\) === mountId\)/);
    assert.match(memberSetting, /return Number\(mountInfo\?\.school\) \|\| mountId \|\| 0/);
    assert.match(memberSetting, /this\.form\.name = typeof val === "string" \? val\.trim\(\) : ""/);
    assert.match(memberSetting, /const roles = Array\.isArray\(this\.roles\) \? this\.roles : \[\]/);
    assert.match(memberSetting, /return Array\.isArray\(this\.\$store\.state\.roles\) \? this\.\$store\.state\.roles : \[\]/);
    assert.match(memberSetting, /allRoles:\s*\{[\s\S]*?if \(this\.visible\) this\.roles = cloneDeep\(val\)/);
    assert.match(memberSetting, /filteredRoles\(\)[\s\S]*?this\.usedRoleIds\.has\(String\(role\.ID\)\)[\s\S]*?this\.isRoleCompatibleWithMount\(role, this\.form\.mount\)/);
    assert.match(memberSetting, /roleMounts\.some\(\(mount\) => this\.getSchoolByMount\(mount\) === Number\(this\.selectedSchool\)\)/);
    assert.match(memberSetting, /usedRoleIds\(\)[\s\S]*?state\.normalMembers[\s\S]*?state\.subMembers[\s\S]*?state\.tobeMembers/);
    assert.match(memberSetting, /getRoleMounts\(role\)[\s\S]*?normalizeMounts\(role\?\.mounts\)[\s\S]*?Number\(item\.school\) === mountId/);
    assert.match(memberSetting, /isRoleCompatibleWithMount\(role, mount\)[\s\S]*?roleMount === this\.getSchoolByMount\(mountId\)/);
    assert.match(memberSetting, /handleMountChange\(\)[\s\S]*?this\.selectedSchool = this\.getSchoolByMount\(this\.form\.mount\)/);
    assert.match(memberSetting, /handleSchoolChange\(\)[\s\S]*?if \(!this\.selectedSchool\) \{\s*this\.form\.mount = "";\s*return;/);
    assert.match(memberSetting, /syncMountSelection\(\)[\s\S]*?this\.form\.mount = options\.length === 1 \? options\[0\]\.id : ""/);
    assert.doesNotMatch(memberSetting, /this\.form\.mount = this\.xfMaps\[0\]\?\.id \|\| ""/);
    assert.doesNotMatch(memberSetting, /popper-append-to-body/);
    assert.match(memberSetting, /Number\(member\?\.is_valid\) === 1/);
    assert.doesNotMatch(memberSetting, /member\.remark \|\| member\.mount \|\| member\.role_id \|\| member\.name/);
    assert.match(normalV2, /props:\s*\[[^\]]*"capacity"/);
    assert.match(normalV2, /:disabled="isFull"/);
    assert.match(normalV2, /:max="memberLimit"/);
    assert.match(normalV2, /return this\.count >= this\.memberLimit/);
    assert.doesNotMatch(memberPop, /\bfilters:\s*\{/);
});

test("raid roster mutations refresh authoritative state and surface request failures", async () => {
    const [raid, normal, sub, tobe, join, memberSetting, page, common] = await Promise.all([
        read("../src/components/team/raid/Raid.vue"),
        read("../src/components/team/raid/RaidNormal_v2.vue"),
        read("../src/components/team/raid/RaidSub.vue"),
        read("../src/components/team/raid/RaidTobe.vue"),
        read("../src/components/team/raid/JoinPop.vue"),
        read("../src/components/team/raid/RaidMemberSetting.vue"),
        read("../src/views/team/raid/ViewRaid.vue"),
        read("../src/utils/common.js"),
    ]);

    assert.match(common, /error\?\.response\?\.data\?\.msg/);
    assert.match(common, /error\?\.data\?\.msg/);
    assert.match(common, /error\?\.msg/);
    assert.match(common, /error\?\.message/);
    for (const source of [raid, normal, sub, tobe, join, memberSetting, page]) {
        assert.match(source, /import \{ getRequestErrorMessage \} from "@\/utils\/common"/);
        assert.match(source, /getRequestErrorMessage\(error|notifyError\(error\)/);
    }

    assert.match(raid, /const version = \+\+this\.memberLoadVersion/);
    assert.match(raid, /if \(!this\.isCurrentMemberLoad\(raidId, version\)\) return/);
    assert.match(raid, /this\.applyMemberLists\(res\?\.data\?\.data \|\| \[\]\)/);
    assert.match(raid, /catch \(error\)[\s\S]*?this\.applyMemberLists\(\[\]\)/);
    assert.match(raid, /this\.\$store\.commit\("SET_TOBE_MEMBERS", this\.tobeMembers\)/);

    assert.match(normal, /await removeMember[\s\S]*?this\.\$emit\("update"\)/);
    assert.match(normal, /await covertNormal2Sub[\s\S]*?this\.\$emit\("update"\)/);
    assert.match(normal, /const order = cloneDeep\(this\.order\)[\s\S]*?if \(!order\.length\)[\s\S]*?SET_MEMBER_ORDER", \[\][\s\S]*?return[\s\S]*?await sortMember/);
    assert.match(normal, /await sortMember[\s\S]*?SET_MEMBER_ORDER/);
    assert.match(normal, /catch \(error\)[\s\S]*?this\.notifyError\(error\)[\s\S]*?this\.\$emit\("update"\)/);
    assert.match(normal, /handleSetting\(member, index\)[\s\S]*?this\.action = ""/);
    assert.match(normal, /handleSave\(member\)[\s\S]*?this\.action = ""/);
    assert.match(normal, /onClick: \(\) => this\.confirmRemove\(this\.selectedMember, this\.selectedIndex\)/);
    assert.match(normal, /async confirmRemove\(member, index\)[\s\S]*?team\.raid\.member\.removeConfirm[\s\S]*?await this\.remove\(member, index\)/);

    assert.match(sub, /handleSetting\(member, index\)[\s\S]*?this\.action = ""/);
    assert.match(sub, /handleSave\(member\)[\s\S]*?this\.action = ""/);
    assert.match(sub, /await covertSub2Normal[\s\S]*?catch \(e\)[\s\S]*?this\.notifyError\(e\)/);
    assert.match(sub, /onClick: \(\) => this\.confirmRemove\(this\.selectedMember, this\.selectedIndex\)/);
    assert.match(sub, /async confirmRemove\(member, index\)[\s\S]*?team\.raid\.member\.removeConfirm[\s\S]*?await this\.remove\(member, index\)/);
    assert.match(tobe, /await covertTobe2Normal[\s\S]*?catch \(e\)[\s\S]*?this\.notifyError\(e\)/);
    assert.match(tobe, /await rejectMember[\s\S]*?catch \(error\)[\s\S]*?this\.notifyError\(error\)/);
    assert.match(tobe, /onClick: \(\) => this\.confirmReject\(this\.selectedMember, this\.selectedIndex\)/);
    assert.match(tobe, /async confirmReject\(member, index\)[\s\S]*?team\.member\.rejectConfirm[\s\S]*?await this\.reject\(member, index\)/);

    assert.match(memberSetting, /async handleSave\(\)[\s\S]*?if \(this\.addLoading\) return/);
    assert.match(memberSetting, /this\.addLoading = true[\s\S]*?finally[\s\S]*?this\.addLoading = false/);
    assert.match(memberSetting, /this\.\$emit\("updateRole", \{[\s\S]*?\.\.\.this\.data,[\s\S]*?\.\.\.data,[\s\S]*?is_valid:/);
    assert.match(memberSetting, /catch \(error\)[\s\S]*?getRequestErrorMessage\(error/);

    assert.match(page, /<Raid[\s\S]*?ref="raidBoard"/);
    assert.match(page, /if \(!User\.isLogin\(\)\)[\s\S]*?account\/login\?redirect=/);
    assert.match(page, /if \(this\.joinSubmitting\) return/);
    assert.match(page, /const member = res\?\.data\?\.data[\s\S]*?member\?\.type === "tobe"/);
    assert.match(page, /await this\.\$refs\.raidBoard\?\.loadMembers\?\.\(\)/);
    assert.match(join, /:loading="submitting"/);
    assert.match(join, /:disabled="submitting \|\| loading"/);
    assert.match(join, /if \(this\.submitting \|\| this\.loading\) return/);
    assert.match(join, /this\.form\.mount = "0"/);
    assert.doesNotMatch(join, /mountRequired|Number\(formData\.mount\) > 0/);
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
    assert.match(page, /handleRaidSaved:\s*async function[\s\S]*await this\.init\(\)/);
    assert.match(page, /team\.raid\.view\.description/);
    assert.doesNotMatch(page, />活动说明</);
    assert.doesNotMatch(page, /showMiniprogramCode|icon="FullScreen"/);
    assert.match(sidebar, /this\.\$route\.name === "view_raid"/);
    assert.match(sidebar, /this\.\$store\.state\.team\?\.ID/);
    assert.match(appStyles, /\.m-title[\s\S]*\.u-op[\s\S]*min-height:\s*38px/);
    assert.match(pageStyles, /\.m-raid-view-hero[\s\S]*min-height:\s*40px/);
    assert.match(raidStyles, /grid-auto-flow:\s*column/);
    assert.match(raidStyles, /grid-template-columns:\s*repeat\(var\(--raid-columns,\s*5\),\s*minmax\(0,\s*1fr\)\)/);
    assert.match(raidStyles, /grid-template-rows:\s*repeat\(var\(--raid-rows,\s*5\),\s*68px\)/);
    assert.match(raidStyles, /@media screen and \(max-width:\s*@phone\)[\s\S]*\.m-raid-corebox\.m-raid-normal\s*\{[\s\S]*overflow-x:\s*auto/);
    assert.match(raidStyles, /@media screen and \(max-width:\s*@phone\)[\s\S]*\.m-raid-normal \.m-raid-members\s*\{[\s\S]*grid-auto-flow:\s*column/);
    assert.match(raidStyles, /grid-template-columns:\s*repeat\(var\(--raid-columns,\s*5\),\s*220px\)/);
    assert.match(raidStyles, /\.m-raid-corebox\.m-raid-normal \.m-raid-flag\s*\{[\s\S]*display:\s*flex/);
    assert.match(raidStyles, /\.m-raid-corebox\.m-raid-normal[\s\S]*border-radius:\s*18px/);
    assert.match(normalV1 + normalV2, /--raid-columns/);
    assert.match(normalV1 + normalV2, /team\.raid\.board\.group/);
    assert.doesNotMatch(normalV1 + normalV2, /canDrag\(\)[\s\S]*?routerName\s*!==\s*["']view_raid["']/);
    assert.doesNotMatch(normalV2, /class="m-raid-tobebox m-raid-normalbox"/);
});
