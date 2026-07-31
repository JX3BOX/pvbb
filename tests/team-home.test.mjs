import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
    return readFile(new URL(path, import.meta.url), "utf8");
}

test("team bootstrap avoids duplicate component and plugin registration", async () => {
    const entry = await read("../src/pages/team/index.js");

    assert.match(entry, /if \(!app\.component\(key\)\)/);
    assert.equal(entry.match(/app\.use\(VueSvgInlinePlugin/g)?.length, 1);
});

test("team home uses a personal workbench beside the discovery workspace", async () => {
    const [app, page, sidebar, list, shell] = await Promise.all([
        read("../src/pages/team/App.vue"),
        read("../src/views/team/org/ListOrg.vue"),
        read("../src/components/team/org/team_home_sidebar.vue"),
        read("../src/components/team/org/team_list.vue"),
        read("../src/assets/css/team/app.less"),
    ]);

    assert.match(app, /class="m-team-modern-shell"/);
    assert.match(app, /<TeamHomeSidebar\s*\/>/);
    assert.match(app, /"manage_my_org"/);
    assert.doesNotMatch(page, /TeamHomeSidebar/);
    assert.match(page, /class="u-team-home-action is-primary" to="\/org\/add"/);
    assert.match(sidebar, /getAllMyTeams\(\)/);
    assert.match(sidebar, /to="\/raid\/list"/);
    assert.match(sidebar, /getMyManageTeams\(\)/);
    assert.match(sidebar, /User\.isLogin\(\)/);
    assert.match(sidebar, /<strong>团队管理<\/strong>/);
    assert.match(sidebar, /<strong>我的团队<\/strong>/);
    assert.match(sidebar, /team\.super == uid \? "创始人" : "管理员"/);
    assert.match(sidebar, /team\.super == uid \? 'is-founder' : 'is-admin'/);
    assert.doesNotMatch(sidebar, />团长<\/span>/);
    assert.match(sidebar, /class="u-sidebar-group-icon is-member"[\s\S]*?<School \/>/);
    assert.match(sidebar, /to="\/raid\/list"/);
    assert.match(sidebar, /<strong>团队活动<\/strong>/);
    assert.match(sidebar, /<strong>团队平台<\/strong>/);
    assert.doesNotMatch(sidebar, /<strong>团队中心<\/strong>/);
    assert.match(sidebar, /teamLogo:\s*__cdn \+ "logo\/logo-light\/team\.svg"/);
    assert.match(page, /teamLogo:\s*__cdn \+ "logo\/logo-light\/team\.svg"/);
    assert.match(sidebar, /<strong>我的角色<\/strong>/);
    assert.match(sidebar, /:href="dashboardRoleUrl"/);
    assert.doesNotMatch(sidebar, /发现团队与公开活动/);
    assert.doesNotMatch(sidebar, /管理全部已绑定角色/);
    assert.match(sidebar, /expandedGroups:\s*\{\s*manage:\s*false/);
    assert.doesNotMatch(sidebar, /<router-link v-if="isLogin" to="\/org\/add">创建<\/router-link>/);
    assert.doesNotMatch(sidebar, /<span v-if="isLogin && !loading">\{\{ workspaceTeamCount \}\}<\/span>/);
    assert.doesNotMatch(sidebar, /成员、内容、数据与设置/);
    assert.doesNotMatch(sidebar, /角色、战绩、DKP 与 RAID/);
    assert.match(sidebar, /:aria-expanded="expandedGroups\.manage"/);
    assert.match(sidebar, /:aria-expanded="expandedGroups\.member"/);
    assert.match(list, /v-if="!homeMode" to="\/org\/add"/);
    assert.match(shell, /\.m-main\.is-team-modern-content[\s\S]*padding:\s*24px 24px 32px 12px/);
    assert.match(shell, /\.m-team-modern-shell[\s\S]*max-width:\s*none/);
    assert.match(shell, /grid-template-columns:\s*280px minmax\(0, 1fr\)/);
});

test("team creation reuses the modern workspace and grouped archive form language", async () => {
    const [app, page, form, styles] = await Promise.all([
        read("../src/pages/team/App.vue"),
        read("../src/views/team/org/AddOrg.vue"),
        read("../src/components/team/org/teamform.vue"),
        read("../src/assets/css/team/org/add_org.less"),
    ]);

    assert.match(app, /"manage_my_org"/);
    assert.match(page, /class="v-org-add p-team-create"/);
    assert.match(page, /class="m-team-create__hero"/);
    assert.match(page, /teamLogo:\s*__cdn \+ "logo\/logo-light\/team\.svg"/);
    assert.match(page, /建立团队档案，完善基础资料与对外展示信息/);
    assert.doesNotMatch(page, /<OfficeBuilding \/>/);
    assert.match(page, /variant="archive"/);
    assert.match(page, /正在检查创建权限/);
    assert.match(page, /name:\s*"manage_my_org"/);
    assert.match(page, /v_member:\s*0/);
    assert.match(page, /v_dkp:\s*0/);
    assert.match(page, /v_activity:\s*0/);
    assert.match(page, /v_comment:\s*0/);
    assert.doesNotMatch(page, /带有必填校验的项目会在提交时提示/);
    assert.doesNotMatch(page, /class="m-title"/);
    assert.match(form, /:loading="building"/);
    assert.match(styles, /@import \(reference\) "\.\.\/design-system\/_tokens\.less"/);
    assert.match(styles, /\.m-team-create__workspace[\s\S]*border-radius:\s*@team-radius-panel/);
});

test("team home sidebar has loading, error, empty and unauthenticated states", async () => {
    const sidebar = await read("../src/components/team/org/team_home_sidebar.vue");

    assert.match(sidebar, /v-if="!isLogin"/);
    assert.match(sidebar, /v-else-if="loading"/);
    assert.match(sidebar, /v-else-if="loadError"/);
    assert.match(sidebar, /v-else-if="workspaceTeamCount"/);
    assert.match(sidebar, /@error="useDefaultLogo"/);
    assert.match(sidebar, /Promise\.allSettled\(\[getAllMyTeams\(\), getMyManageTeams\(\)\]\)/);
    assert.match(sidebar, /allTeamsResult\.status === "rejected" && managedTeamsResult\.status === "rejected"/);
});

test("team workspace uses the persistent sidebar as its only team switcher", async () => {
    const [workspace, sidebar] = await Promise.all([
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/components/team/org/team_home_sidebar.vue"),
    ]);

    assert.doesNotMatch(workspace, /selectedTeamId|switchTeam|u-team-switcher|m-team-switch/);
    assert.match(workspace, /openFirstTeam/);
    assert.match(sidebar, /teamRoute:\s*function \(team, mode\)/);
    assert.match(sidebar, /name:\s*mode === "manage" \? "manage_my_org" : "view_my_org"/);
    assert.doesNotMatch(sidebar, /query:\s*\{\s*mode/);
    assert.match(sidebar, /this\.workspaceMode === mode/);
});

test("team management uses a canonical route without the mode query", async () => {
    const [router, workspace, sidebar, createPage, panel, namespace] = await Promise.all([
        read("../src/pages/team/router.js"),
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/components/team/org/team_home_sidebar.vue"),
        read("../src/views/team/org/AddOrg.vue"),
        read("../src/components/team/org/team_panel.vue"),
        read("../src/views/team/org/EditNamespace.vue"),
    ]);

    assert.match(router, /name:\s*"manage_my_org"[\s\S]*?path:\s*"\/manage\/org\/:id"/);
    assert.match(router, /workspaceMode:\s*"manage"/);
    assert.match(router, /beforeEnter:\s*normalizeLegacyWorkspaceRoute/);
    assert.match(router, /delete query\.mode/);
    assert.match(workspace, /name:\s*routeName/);
    assert.match(workspace, /delete query\.mode/);
    assert.match(sidebar, /name:\s*mode === "manage" \? "manage_my_org" : "view_my_org"/);
    assert.match(createPage, /name:\s*"manage_my_org"/);
    assert.match(panel, /name:\s*"manage_my_org"/);
    assert.match(namespace, /name:\s*"manage_my_org"/);
});

test("team public homepage shares the modern shell and keeps public modules intact", async () => {
    const [app, sidebar, router, page, pageStyles, shellStyles] = await Promise.all([
        read("../src/pages/team/App.vue"),
        read("../src/components/team/org/team_home_sidebar.vue"),
        read("../src/pages/team/router.js"),
        read("../src/views/team/org/ViewOrg.vue"),
        read("../src/assets/css/team/org/view_org.less"),
        read("../src/assets/css/team/app.less"),
    ]);

    assert.match(app, /"index", "view_org"/);
    assert.match(sidebar, /\["index", "view_org"\]\.includes\(this\.\$route\.name\)/);
    assert.match(router, /name:\s*"view_org"[\s\S]*?path:\s*"\/org\/:id"[\s\S]*?isPublic:\s*true/);
    assert.match(page, /class="v-org-view p-team-public"/);
    assert.match(page, /class="m-public-org__hero"/);
    assert.match(page, /class="m-public-org__workspace"/);
    assert.match(page, /<team-info[\s\S]*?:info="data"[\s\S]*?:team_id="id"/);
    assert.match(page, /<team-info[\s\S]*?:show-manage-action="false"/);
    assert.match(page, /class="m-team-view m-public-org__tabs"/);
    assert.doesNotMatch(page, /<el-tabs[^>]*type="card"/);
    for (const tab of ["团队概况", "团队成员", "DKP记录", "通关视频", "留言板"]) {
        assert.match(page, new RegExp(`<span>${tab}<\\/span>`));
    }
    for (const component of ["team-intro", "team-recruit", "team-medals", "team-trophy", "ViewMember", "ViewDkp", "ViewVideo", "ViewComment"]) {
        assert.match(page, new RegExp(`<${component}\\b`));
    }
    assert.match(page, /const PUBLIC_TABS = \["overview", "member", "dkp", "video", "comment"\]/);
    assert.match(page, /const query = \{ \.\.\.this\.\$route\.query \}/);
    assert.match(page, /Promise\.all\(\[this\.loadTeamInfo\(id\), this\.loadAuthority\(id\)\]\)/);
    assert.match(page, /version !== this\.loadVersion \|\| id !== this\.id/);
    assert.match(page, /:key="`public-team-tabs-\$\{id\}`"/);
    assert.match(page, /class="m-public-org__error"/);
    assert.match(shellStyles, /> \.p-team-public/);
    assert.match(pageStyles, /\.p-team-public[\s\S]*\.m-public-org__hero[\s\S]*border-radius:\s*@team-radius-control/);
    assert.match(pageStyles, /\.m-team-info[\s\S]*grid-template-columns:\s*76px minmax\(0, 1fr\) auto/);
    assert.match(pageStyles, /\.m-public-org__overview[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
});

test("team join dialog uses an isolated responsive role picker without changing the join contract", async () => {
    const [dialog, styles, service, raidDialog] = await Promise.all([
        read("../src/components/team/member/joinpop.vue"),
        read("../src/assets/css/team/member/joinpop.less"),
        read("../src/service/team/member.js"),
        read("../src/components/team/raid/JoinPop.vue"),
    ]);

    assert.match(dialog, /class="m-team-joinpop m-team-member-join-dialog"/);
    assert.match(dialog, /width="820px"[\s\S]*?align-center/);
    assert.match(dialog, /class="m-team-joinpop-header"/);
    assert.match(dialog, /class="m-team-joinpop-toolbar"/);
    assert.match(dialog, /class="u-role-card" border/);
    assert.match(dialog, /class="u-footer-actions"/);
    assert.match(dialog, /:disabled="loading \|\| !roles\.length"/);
    assert.match(dialog, /:loading="submitting"/);
    assert.match(dialog, /v-loading="loading"/);
    assert.match(dialog, /this\.isIndeterminate = value\.length > 0 && value\.length < total/);
    assert.match(dialog, /if \(!this\.roles\.length \|\| this\.submitting\) return/);
    assert.match(dialog, /version !== this\.loadVersion \|\| !this\.visible/);
    assert.match(service, /get\(`\/api\/team\/relation\/my\/\$\{team_id\}\/roles\/not-at-team`\)/);
    assert.match(service, /post\(`\/api\/team\/relation\/my\/\$\{team_id\}\/join`,\s*\{[\s\S]*?roles:\s*list/);
    assert.match(styles, /\.m-team-member-join-dialog\.el-dialog\s*\{[\s\S]*?border-radius:\s*18px/);
    assert.match(styles, /\.u-list\s*\{[\s\S]*?grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)/);
    assert.match(styles, /\.el-checkbox\.is-bordered\.u-role-card[\s\S]*?&\.is-checked/);
    assert.match(
        styles,
        /\.el-checkbox__input\.is-checked \.el-checkbox__inner::after[\s\S]*?translate\(-50%, -58%\)/,
    );
    assert.match(
        styles,
        /\.el-checkbox\.is-bordered\.u-role-card[\s\S]*?\.el-checkbox__label[\s\S]*?background:\s*transparent/,
    );
    assert.match(styles, /\.dialog-footer[\s\S]*?justify-content:\s*space-between/);
    assert.match(styles, /@media screen and \(max-width: 520px\)[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
    assert.doesNotMatch(raidDialog, /m-team-member-join-dialog/);
});

test("team praise follows the mobile joke heart interaction without changing the team stat contract", async () => {
    const [good, styles, service] = await Promise.all([
        read("../src/components/team/widget/Good.vue"),
        read("../src/assets/css/team/widget/good.less"),
        read("../src/service/team/team.js"),
    ]);

    assert.match(good, /class="w-like-heart"/);
    assert.match(good, /'is-liked': liked, 'is-animating': animating/);
    assert.match(good, /:aria-pressed="liked \? 'true' : 'false'"/);
    assert.match(good, /class="u-heart-icon"/);
    assert.match(good, /v-if="animating" class="u-like-feedback"[^>]*>\+1</);
    assert.match(good, /if \(!this\.id \|\| this\.submitting \|\| this\.liked\) return/);
    assert.match(good, /this\.total = Number\(this\.total \|\| 0\) \+ 1/);
    assert.match(good, /await addLike\(this\.id\)/);
    assert.match(good, /this\.total = Math\.max\(Number\(this\.total \|\| 1\) - 1, 0\)/);
    assert.match(good, /}, 760\)/);
    assert.match(good, /beforeUnmount[\s\S]*?clearTimeout\(this\.animationTimer\)/);
    assert.doesNotMatch(styles, /web_heart_animation\.png|steps\(28\)/);
    for (const animation of ["team-good-pop", "team-good-ring", "team-good-particles", "team-good-feedback"]) {
        assert.match(styles, new RegExp(`@keyframes ${animation}`));
    }
    assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(service, /function addLike\(team_id\)[\s\S]*?postStat\("team", team_id, "like"\)/);
});

test("team public members use grouped profile cards with compact responsive states", async () => {
    const [page, styles] = await Promise.all([
        read("../src/views/team/member/ViewMember.vue"),
        read("../src/assets/css/team/member/view_member.less"),
    ]);

    for (const section of ["is-leaders", "is-birthday", "is-members"]) {
        assert.match(page, new RegExp(`class="m-public-member-section ${section}"`));
    }
    assert.match(page, /class="m-public-member-grid is-user-grid"/);
    assert.match(page, /class="m-public-member-grid is-role-grid"/);
    assert.match(page, /<h2 id="team-leaders-title">团队管理员<\/h2>/);
    assert.match(page, /\{\{ total \}\} 个角色/);
    assert.match(page, /class="u-public-member-card is-role"/);
    assert.match(page, /class="m-public-member-state is-birthday-empty"/);
    assert.match(page, /class="m-public-member-state is-locked"/);
    assert.match(page, /class="m-team-member-pages"/);
    assert.match(page, /return !this\.v \|\| ~~this\.authority\.authority >= ~~this\.v/);
    assert.match(page, /getLeaders\(this\.team_id\)/);
    assert.match(page, /getTeamMembers\(this\.team_id, this\.params\)/);
    assert.match(page, /getTeamBirthDay\(this\.team_id\)/);
    assert.match(styles, /@import \(reference\) "\.\.\/design-system\/_tokens\.less"/);
    assert.match(styles, /\.m-public-member-section[\s\S]*border-radius:\s*@team-radius-control/);
    assert.match(styles, /\.m-public-member-grid[\s\S]*grid-template-columns:\s*repeat\(auto-fill/);
    assert.match(styles, /\.u-public-member-card[\s\S]*min-height:\s*68px/);
    assert.match(styles, /@media screen and \(max-width: 620px\)[\s\S]*grid-template-columns:\s*repeat\(2/);
});

test("member account removal lives in the role dialog footer", async () => {
    const [member, styles, service] = await Promise.all([
        read("../src/views/team/member/MemberItem.vue"),
        read("../src/assets/css/team/member/member_item.less"),
        read("../src/service/team/admin.js"),
    ]);

    const memberCard = member.slice(0, member.indexOf("<el-dialog"));
    const memberCardStyles = styles.slice(0, styles.indexOf(".m-member-role-dialog.el-dialog"));

    assert.doesNotMatch(memberCard, /u-remove-account|<Delete \/>/);
    assert.doesNotMatch(memberCardStyles, /\.u-remove-account/);
    assert.match(
        member,
        /<template #footer>[\s\S]*?class="m-member-role-dialog-footer"[\s\S]*?class="u-remove-account"[\s\S]*?class="u-dialog-done"/,
    );
    assert.match(member, /this\.\$confirm\("此操作会将该账号下所有角色移除/);
    assert.match(member, /removeTeamRoleAll\(this\.team_id, this\.item\.uid\)/);
    assert.match(styles, /\.m-member-role-dialog-footer[\s\S]*?\.u-remove-account[\s\S]*?color:\s*#dc2626/);
    assert.match(styles, /\.u-dialog-done[\s\S]*?margin-left:\s*auto/);
    assert.match(service, /function removeTeamRoleAll\(team_id, user_id\)/);
});

test("team homepage medals are display-only", async () => {
    const [teamMedals, medal] = await Promise.all([
        read("../src/components/team/org/team_medals.vue"),
        read("../src/components/team/medal.vue"),
    ]);

    assert.match(teamMedals, /<Medal[^>]*:interactive="false"/);
    assert.match(medal, /interactive:\s*\{[\s\S]*?type:\s*Boolean[\s\S]*?default:\s*true/);
    assert.match(medal, /<a[\s\S]*?v-if="interactive"/);
    assert.match(medal, /<span v-else class="u-medal is-static"/);
    assert.match(medal, /&\.is-static\s*\{[\s\S]*?cursor:\s*default/);
});

test("team card tabs keep their top border above painted tab backgrounds", async () => {
    const [shellStyles, dkp] = await Promise.all([
        read("../src/assets/css/team/app.less"),
        read("../src/views/team/dkp/ViewDkp.vue"),
    ]);

    assert.match(dkp, /<el-tabs v-model="tab" type="card">/);
    assert.match(
        shellStyles,
        /\.el-tabs--card\s*>\s*\.el-tabs__header\s+\.el-tabs__item\s*\{[\s\S]*?margin-top:\s*0\s*!important/,
    );
});

test("team edit action opens the basic settings section in the workbench", async () => {
    const panel = await read("../src/components/team/org/team_panel.vue");

    assert.match(panel, /name:\s*"manage_my_org"/);
    assert.doesNotMatch(panel, /mode:\s*"manage"/);
    assert.match(panel, /tab:\s*"setting"/);
    assert.match(panel, /section:\s*"basic"/);
    assert.match(panel, /this\.showManageAction && \(this\.isLeader \|\| this\.isSuperAdmin\)/);
});

test("team workspace separates management tools from the member view", async () => {
    const [workspace, raidManager, myRaid] = await Promise.all([
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/views/team/raid/ManageRaid.vue"),
        read("../src/views/team/raid/MyTeamRaid.vue"),
    ]);
    const topLevelLabels = [...workspace.matchAll(/<el-tab-pane label="([^"]+)"/g)].map((match) => match[1]);
    const managementStart = workspace.indexOf('<template v-if="isManagementMode">');
    const memberStart = workspace.indexOf("<template v-else>", managementStart);
    const managementTemplate = workspace.slice(managementStart, memberStart);
    const memberTemplate = workspace.slice(memberStart);

    assert.deepEqual(topLevelLabels, [
        "成员管理",
        "战绩管理",
        "快照管理",
        "DKP管理",
        "RAID管理",
        "视频管理",
        "团队设置",
        "我的角色",
        "我的战绩",
        "我的DKP",
        "参与的RAID",
    ]);
    assert.doesNotMatch(managementTemplate, /我的角色|我的战绩|我的DKP|参与的RAID/);
    assert.doesNotMatch(memberTemplate, /成员管理|战绩管理|视频管理|快照管理|DKP管理|RAID管理|团队设置/);
    assert.match(managementTemplate, /<Setting \/>[\s\S]*?<span>团队设置<\/span>/);
    assert.match(workspace, /class="m-my-org__identity"/);
    assert.doesNotMatch(workspace, /当前管理团队|当前团队/);
    assert.match(workspace, /data\.logo \? showTeamLogo\(data\.logo\) : defaultLogo/);
    assert.match(workspace, /isSuper \? "创始人" : "管理员"/);
    assert.match(workspace, /团队 ID \{\{ id \}\}/);
    assert.doesNotMatch(workspace, /<team-info|switchWorkspaceMode|专注成员、内容、团队数据与基础设置/);
    assert.match(workspace, /const LEGACY_TAB_MAP = \{/);
    assert.match(workspace, /"battle-record": \{ mode: "manage", tab: "manage-battle" \}/);
    assert.match(raidManager, /teamId:/);
    assert.match(raidManager, /'is-embedded': embedded/);
    assert.match(myRaid, /teamId:/);
    assert.match(myRaid, /displayData:\s*function/);
    assert.match(myRaid, /String\(teamId\) === String\(this\.teamId\)/);
});

test("team archive uses a grouped basic settings form without changing other form entries", async () => {
    const [workspace, form, styles] = await Promise.all([
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/components/team/org/teamform.vue"),
        read("../src/assets/css/team/org/teamform.less"),
    ]);

    assert.match(workspace, /variant="archive"/);
    assert.match(form, /<h2>团队身份<\/h2>/);
    assert.match(form, /<h2>对外展示<\/h2>/);
    assert.match(form, /<h2>联系与直播<\/h2>/);
    assert.match(form, /<h2>内容可见范围<\/h2>/);
    assert.doesNotMatch(form, /u-field-help/);
    assert.doesNotMatch(form, /<p>设置团队最基础的识别信息/);
    assert.match(form, /this\.variant === "archive"/);
    assert.match(styles, /\.m-team-teamform\.is-archive/);
    assert.match(styles, /grid-template-columns:\s*repeat\(12, minmax\(0, 1fr\)\)/);
    assert.match(styles, /\.m-team-form-section[\s\S]*&::before[\s\S]*background:\s*@team-primary/);
});

test("team archive certification and permission management match the compact archive design", async () => {
    const [workspace, page, form, logs, styles, permission, permissionStyles, userpop, userpopStyles] =
        await Promise.all([
            read("../src/views/team/org/ViewMyOrg.vue"),
            read("../src/views/team/org/VerifyOrg.vue"),
            read("../src/components/team/org/team_verify.vue"),
            read("../src/components/team/org/team_verify_logs.vue"),
            read("../src/assets/css/team/org/verify_org.less"),
            read("../src/views/team/org/EditPermission.vue"),
            read("../src/assets/css/team/org/edit_permission.less"),
            read("../src/components/team/widget/userpop.vue"),
            read("../src/assets/css/team/widget/userpop.less"),
        ]);

    assert.match(workspace, /<VerifyOrg[\s\S]*?variant="archive"[\s\S]*?:team-id="id"[\s\S]*?:team-data="data"/);
    assert.match(page, /<h2>申请须知<\/h2>/);
    assert.match(page, /<h2>认证流程<\/h2>/);
    assert.match(page, /<h2>认证申请<\/h2>/);
    assert.match(form, /class="m-team-verify-summary"/);
    assert.match(form, /label="认证联系 QQ"/);
    assert.match(form, /'is-editable': canApply/);
    assert.match(form, /placeholder="请填写可联系到您的 QQ 号"/);
    assert.match(form, /immediate:\s*true/);
    assert.match(logs, /<h2>近期认证记录<\/h2>/);
    assert.match(logs, /props:\s*\["teamId"\]/);
    assert.match(logs, /<el-empty v-else/);
    assert.match(styles, /\.v-org-verify\.is-archive/);
    assert.match(styles, /&\.is-editable[\s\S]*&\.is-focus/);
    assert.match(workspace, /<EditPermission[\s\S]*?variant="archive"[\s\S]*?:team-id="id"/);
    assert.match(permission, /<h2>管理员权限<\/h2>/);
    assert.match(permission, /this\.variant === "archive"/);
    assert.match(permissionStyles, /\.m-permission-panel\.is-archive/);
    assert.match(permissionStyles, /position:\s*sticky/);
    assert.match(permissionStyles, /\.el-checkbox__input\.is-disabled\.is-checked/);
    assert.match(permissionStyles, /cursor:\s*not-allowed/);
    assert.match(permission, /:variant="variant"/);
    assert.match(permission, />移除<\/el-button/);
    assert.match(permission, /this\.\$confirm\([\s\S]*?确认移除[\s\S]*?cancelButtonText:\s*"取消"/);
    assert.doesNotMatch(permission, />删除<\/el-button|确认删除|删除管理员/);
    const founderPermissions = permission.slice(
        permission.indexOf('<template v-if="item.level == 99">'),
        permission.indexOf("<template v-else>")
    );
    assert.equal((founderPermissions.match(/<el-checkbox checked disabled>/g) || []).length, 10);
    for (const permissionKey of ["r_dkp", "r_drop", "r_raid"]) {
        const checkbox = permission.match(
            new RegExp(`v-model="item\\.${permissionKey}"[\\s\\S]*?<\\/el-checkbox\\b`)
        )?.[0];
        assert.ok(checkbox, `${permissionKey} checkbox should exist`);
        assert.doesNotMatch(checkbox, /\bdisabled\b/);
    }
    assert.match(userpop, /等待识别用户/);
    assert.match(userpop, /this\.variant === "archive"/);
    assert.match(userpop, /debounce\(this\.lookupUser, 500\)/);
    assert.match(userpop, /this\.lookupUserDebounced\?\.cancel\(\)/);
    assert.match(userpop, /version !== this\.lookupVersion/);
    assert.match(userpopStyles, /\.m-team-userpop\.is-archive/);
    assert.match(userpopStyles, /\.u-preview[\s\S]*&\.is-ready/);
    assert.doesNotMatch(userpopStyles, /\.el-dialog__title/);
});

test("team role table follows the archive certification table language", async () => {
    const [role, styles] = await Promise.all([
        read("../src/components/team/org/team_role.vue"),
        read("../src/assets/css/team/role/my_teams.less"),
    ]);

    assert.match(role, /class="v-org-list m-team-role"/);
    assert.match(styles, /\.m-team-role[\s\S]*\.m-group-role-box[\s\S]*border-radius:\s*12px/);
    assert.match(styles, /\.m-team-role[\s\S]*\.m-group-role-table[\s\S]*border-collapse:\s*separate/);
    assert.match(styles, /\.u-role__mount[\s\S]*justify-content:\s*flex-start/);
    assert.match(styles, /tbody tr:last-child td[\s\S]*border-bottom:\s*0/);
});

test("DKP tables follow the archive certification table language", async () => {
    const [manager, managerStyles, list, logs, listStyles, logStyles, characterStyles, dialog, dialogStyles] =
        await Promise.all([
            read("../src/views/team/dkp/ManageDkp.vue"),
            read("../src/assets/css/team/dkp/list_dkp.less"),
            read("../src/components/team/dkp/dkp_list.vue"),
            read("../src/components/team/dkp/dkp_logs.vue"),
            read("../src/assets/css/team/dkp/dkp_list.less"),
            read("../src/assets/css/team/dkp/dkp_logs.less"),
            read("../src/assets/css/team/dkp/character.less"),
            read("../src/components/team/dkp/dkp_dialog.vue"),
            read("../src/assets/css/team/dkp/dkp_dialog.less"),
        ]);

    assert.match(manager, /class="m-dkp-manage-nav"/);
    assert.doesNotMatch(manager, /<el-tabs type="card"/);
    assert.doesNotMatch(manager, /<keep-alive>/);
    assert.match(managerStyles, /\.m-dkp-manage-nav[\s\S]*button[\s\S]*&\.is-active/);
    assert.doesNotMatch(list, /<el-table[\s\S]*?\sborder(?:\s|>)/);
    assert.match(list, /type="selection" width="52" align="center"/);
    assert.match(list, /label="操作" width="120" v-if="!readOnly"/);
    assert.doesNotMatch(logs, /<el-table[\s\S]*?\sborder(?:\s|>)/);
    assert.match(listStyles, /\.m-dkp-list[\s\S]*border-radius:\s*12px/);
    assert.match(listStyles, /--el-table-border-color:\s*@team-border-light/);
    assert.match(logStyles, /\.m-dkp-logs-container[\s\S]*border-radius:\s*12px/);
    assert.match(logStyles, /--el-table-border-color:\s*@team-border-light/);
    assert.match(logs, /class="u-user" :href="authorLink\(scope\.row\.user_id\)"/);
    assert.match(logStyles, /\.u-user\s*\{[\s\S]*display:\s*inline-flex[\s\S]*align-items:\s*center/);
    assert.doesNotMatch(listStyles, /content:\s*"全选"/);
    assert.match(list, /popper-class="m-dkp-role-popover"/);
    assert.match(list, /class="m-dkp-role-grid"/);
    assert.match(characterStyles, /\.m-team-character_wrapper\s*\{[\s\S]*display:\s*flex/);
    assert.match(characterStyles, /\.m-dkp-role-grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(2/);
    assert.match(characterStyles, /\.u-character-name\s*\{[\s\S]*min-width:\s*0[\s\S]*flex:\s*1/);
    assert.doesNotMatch(characterStyles, /\.u-character-name\s*\{[\s\S]*\.w\(160px\)/);
    assert.match(dialog, /width="620px"/);
    assert.match(dialog, /label-position="top"/);
    assert.match(dialog, /class="m-dkp-target-list"/);
    assert.match(dialogStyles, /\.m-dkp-dialog-modify\.el-dialog/);
    assert.match(dialogStyles, /\.m-dkp-dialog-form__row[\s\S]*grid-template-columns:\s*repeat\(2/);
});

test("DKP snapshot association reuses the five-team roster styling", async () => {
    const [item, itemStyles, bodyStyles, list, listStyles, stat, statStyles, chart, chartData] = await Promise.all([
        read("../src/components/team/snapshot/snapshotItem.vue"),
        read("../src/assets/css/team/snapshot/item.less"),
        read("../src/assets/css/team/snapshot/body.less"),
        read("../src/components/team/snapshot/snapshotList.vue"),
        read("../src/assets/css/team/snapshot/list.less"),
        read("../src/components/team/snapshot/snapshotStat.vue"),
        read("../src/assets/css/team/snapshot/stat.less"),
        read("../src/components/team/snapshot/snapshotChart.vue"),
        read("../src/assets/data/team/snapshot_chart.json"),
    ]);

    assert.match(item, /v-for="group of 5"[\s\S]*\{\{ group \}\} 队/);
    assert.match(itemStyles, /\.m-snapshot-flags[\s\S]*grid-template-columns:\s*repeat\(5/);
    assert.match(itemStyles, /\.m-snapshot-dkp[\s\S]*grid-template-columns:\s*minmax\(160px/);
    assert.match(
        itemStyles,
        /\.u-delete\s*\{[\s\S]*&:hover,[\s\S]*background:\s*fade\(#ef4444, 6%\)[\s\S]*color:\s*#dc2626/
    );
    assert.match(bodyStyles, /&\.row-5\s*\{[\s\S]*border-radius:\s*0 0 12px 12px/);
    assert.match(bodyStyles, /@row-height:\s*48px/);
    assert.match(bodyStyles, /background:\s*@team-primary-soft/);
    assert.match(list, /aria-label="搜索快照"/);
    assert.match(listStyles, /\.m-snapshot-box > \.m-snapshot-search[\s\S]*background:\s*@team-surface-muted/);
    assert.match(listStyles, /\.el-input\s*\{[\s\S]*width:\s*420px[\s\S]*max-width:\s*100%/);
    assert.match(
        listStyles,
        /:deep\(\.el-input__wrapper\)[\s\S]*&:hover\s*\{[\s\S]*border-color:\s*@team-border-focus[\s\S]*&\.is-focus\s*\{[\s\S]*border-color:\s*@team-primary[\s\S]*box-shadow:\s*@team-shadow-focus/
    );
    assert.match(stat, /m-snapshot-search[\s\S]*m-snapshot-period[\s\S]*m-snapshot-date/);
    assert.match(stat, /class="u-count">\{\{ scope\.row\.count \}\} 次/);
    assert.match(statStyles, /\.m-snapshot-toolbar[\s\S]*background:\s*@team-surface-muted/);
    assert.match(statStyles, /\.m-snapshot-search[\s\S]*width:\s*320px/);
    assert.match(
        statStyles,
        /\.m-snapshot-date\s*\{[\s\S]*--el-date-editor-width:\s*250px[\s\S]*flex:\s*0 0 250px/
    );
    assert.match(statStyles, /--el-table-row-hover-bg-color:\s*fade\(@team-primary, 3%\)/);
    assert.match(statStyles, /\.u-view-snapshot[\s\S]*background:\s*@team-primary-soft/);
    assert.match(chart, /m-snapshot-chart-period[\s\S]*m-snapshot-chart-date/);
    assert.match(chart, /m-snapshot-chart-card m-chart-line/);
    assert.match(chart, /ref="lineChart" id="snapshot-line"/);
    assert.match(chart, /requestId !== this\.requestId/);
    assert.match(chart, /setOption\(option, \{ notMerge: true \}\)/);
    assert.match(chart, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
    assert.match(chart, /--el-date-editor-width:\s*250px/);
    assert.match(chartData, /"smooth":\s*true/);
    assert.match(chartData, /"radius":\s*\["40%", "66%"\]/);
});

test("team feature, other and advanced settings keep their business sections separate", async () => {
    const [
        workspace,
        config,
        password,
        banner,
        dkpRule,
        advanced,
        namespace,
        namespaceStyles,
        userpop,
        workspaceStyles,
        teamService,
    ] = await Promise.all([
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/views/team/org/EditOrgConfig.vue"),
        read("../src/views/team/snapshot/EditPassword.vue"),
        read("../src/components/team/org/team_banner.vue"),
        read("../src/views/team/dkp/EditDkpRule.vue"),
        read("../src/components/team/org/team_advanced_setting.vue"),
        read("../src/views/team/org/EditNamespace.vue"),
        read("../src/assets/css/team/org/edit_namespace.less"),
        read("../src/components/team/widget/userpop.vue"),
        read("../src/assets/css/team/org/view_my_org.less"),
        read("../src/service/team/team.js"),
    ]);

    assert.match(workspace, />\s*功能设置\s*<\/button>/);
    assert.match(workspace, />\s*其它设置\s*<\/button>/);
    assert.match(workspace, /archiveSection === 'feature'[\s\S]*?config-section="feature"/);
    assert.match(
        workspace,
        /archiveSection === 'other'[\s\S]*?class="m-archive-other"[\s\S]*?<EditNamespace variant="archive"[\s\S]*?config-section="other"/,
    );
    assert.match(workspace, /class="m-archive-advanced"[\s\S]*?<team-advanced-setting/);
    assert.doesNotMatch(workspace, /config-section="advanced"/);
    assert.match(workspace, /:key="`feature-\$\{id\}`"/);
    assert.match(workspace, /:key="`other-\$\{id\}`"/);
    assert.match(workspace, /:key="`advanced-\$\{id\}`"/);
    assert.match(workspace, /config: \{ mode: "manage", tab: "setting", section: "feature" \}/);
    assert.match(workspace, /other: \{ mode: "manage", tab: "setting", section: "other" \}/);
    assert.match(workspace, /\["basic", "verify", "permission", "feature", "other", "advanced"\]/);
    assert.match(workspace, /<team-advanced-setting[\s\S]*?variant="archive"/);
    assert.match(config, /class="v-team-config"[\s\S]*?'is-archive'/);
    assert.match(config, /\.v-team-config\.is-archive[\s\S]*display:\s*block/);
    assert.match(config, /<h2>快照设置<\/h2>/);
    assert.match(config, /<h2>DKP 设置<\/h2>/);
    assert.match(config, /<h2>外观设置<\/h2>/);
    assert.match(config, /showFeatureSettings[\s\S]*?<snapshot-password[\s\S]*?<dkp-rule/);
    assert.match(config, /showDisplaySettings[\s\S]*?<team-banner/);
    assert.match(config, /configSection:[\s\S]*?default:\s*"all"/);
    assert.match(config, /validator:[\s\S]*?\["all", "feature", "other"\]/);
    assert.doesNotMatch(config, /"advanced"/);
    assert.match(config, /showDisplaySettings:[\s\S]*?\["all", "other"\]/);
    assert.match(password, /m-archive-field-label">快照密码/);
    assert.match(password, /class="u-password-heading"/);
    assert.match(password, /class="u-password-notice"/);
    assert.match(password, /class="u-password-meta"/);
    assert.match(password, /\.u-password-box\s*\{[\s\S]*width:\s*680px[\s\S]*border-radius:\s*@team-radius-control/);
    assert.match(password, /:deep\(\.el-input__wrapper\)[\s\S]*&\.is-focus[\s\S]*box-shadow:\s*@team-shadow-focus/);
    assert.match(password, /\^\\d\{6\}\$/);
    assert.match(password, /@input="formatPassword"/);
    assert.match(banner, /m-archive-field-label">团队海报/);
    assert.match(banner, /\[320, 179\]/);
    assert.match(banner, /width:\s*320px[\s\S]*height:\s*179px/);
    assert.match(banner, /aspect-ratio:\s*1125 \/ 630/);
    assert.match(banner, /\.u-tip[\s\S]*display:\s*none/);
    assert.match(banner, /updateTeamInfo\(this\.id,\s*\{\s*banner:\s*this\.banner/);
    assert.match(teamService, /function updateTeamInfo\(team_id, data\)[\s\S]*?\.patch\(`\/api\/team\/my-team\/\$\{team_id\}`/);
    assert.match(dkpRule, /m-archive-field-label">DKP 制度/);
    assert.match(dkpRule, /class="m-dkp-rule__footer"/);
    assert.match(advanced, /<h2>团队操作<\/h2>/);
    assert.match(advanced, /class="m-team-operation-item is-danger"/);
    assert.match(advanced, /&\.is-danger[\s\S]*background:\s*transparent/);
    assert.doesNotMatch(advanced, /u-operation-icon|m-advanced-card__header/);
    assert.match(advanced, /cancelButtonText:\s*"取消"/);
    assert.match(advanced, /confirm-text="确认移交"/);
    assert.match(advanced, /class="u-transform" type="warning" @click="transformTeam"/);
    assert.match(advanced, /class="u-delete" type="danger" @click="deleteTeam"/);
    assert.match(advanced, /class="u-transform"[\s\S]*?<el-icon><Switch \/><\/el-icon>[\s\S]*?<span>发起移交<\/span>/);
    assert.match(advanced, /class="u-delete"[\s\S]*?<el-icon><Delete \/><\/el-icon>[\s\S]*?<span>删除团队<\/span>/);
    assert.match(advanced, /import \{ Delete, Switch \} from "@element-plus\/icons-vue"/);
    assert.doesNotMatch(advanced, /type="(?:warning|danger)" plain/);
    assert.match(advanced, /confirmTransform:[\s\S]*?this\.\$confirm\([\s\S]*?"确认移交团队"[\s\S]*?transformTeam\(this\.id, this\.to_uid\)/);
    assert.match(advanced, /deleteTeam:[\s\S]*?this\.\$confirm\([\s\S]*?"确认删除团队"[\s\S]*?this\.removeTeam\(\)/);
    assert.doesNotMatch(advanced, /<EditNamespace :variant="variant"/);
    assert.match(namespace, /<h2>团队铭牌<\/h2>/);
    assert.match(namespace, /v-if="variant !== 'archive'" class="u-desc"/);
    assert.match(namespace, /section:\s*"verify"/);
    assert.match(namespaceStyles, /\.m-team-namespace\.is-archive/);
    assert.match(namespaceStyles, /\.el-input-group__prepend[\s\S]*border-radius:\s*10px 0 0 10px/);
    assert.match(namespaceStyles, /\.el-input-group \.el-input__wrapper[\s\S]*border-radius:\s*0 10px 10px 0/);
    assert.match(userpop, /confirmText \|\| \(isArchive \? "确认添加"/);
    assert.match(
        workspaceStyles,
        /\.m-archive-feature,[\s\S]*\.m-archive-other,[\s\S]*\.m-archive-advanced[\s\S]*\.m-team-form-section[\s\S]*&::before/,
    );
    assert.match(workspaceStyles, /\.m-archive-other > \.v-team-config\.is-archive\s*\{\s*margin-top:\s*@team-space-4/);
    assert.doesNotMatch(workspaceStyles, /\.m-archive-advanced\s*\{[\s\S]{0,160}border:/);
});

test("team discovery filters stay available in embedded environments", async () => {
    const [list, miniProgramStyles] = await Promise.all([
        read("../src/components/team/org/team_list.vue"),
        read("../src/assets/css/team/miniprogram.less"),
    ]);

    assert.match(list, /v-for="item in tags"/);
    assert.doesNotMatch(miniProgramStyles, /el-checkbox-group/);
});

test("team discovery keeps two-column cards and exposes real totals in the hero", async () => {
    const [page, list, styles] = await Promise.all([
        read("../src/views/team/org/ListOrg.vue"),
        read("../src/components/team/org/team_list.vue"),
        read("../src/assets/css/team/modules/home-theme.less"),
    ]);

    assert.match(page, /@total-change="updateTeamTotal"/);
    assert.match(list, /this\.\$emit\("total-change", this\.total\)/);
    assert.match(list, /const TEAM_NAME_LIMIT = 12/);
    assert.match(list, /\{\{ formatTeamName\(item\.name\) \}\}/);
    assert.match(list, /characters\.slice\(0, TEAM_NAME_LIMIT\)\.join\(""\) \+ "…"/);
    assert.match(list, /:title="item\.name \|\| ''"/);
    assert.doesNotMatch(list, /m-team-results-header/);
    assert.doesNotMatch(list, /u-card-enter/);
    assert.match(list, /暂未发布招募公告/);
    assert.match(styles, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
    assert.match(
        styles,
        /@media screen and \(max-width: 820px\)[\s\S]*?> \.u-meta:not\(\.u-recruit\)[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)[\s\S]*?\.u-meta-item[\s\S]*?width:\s*100%/,
    );
});
