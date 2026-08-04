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
    assert.match(sidebar, /team\.sidebar\.management/);
    assert.match(sidebar, /team\.sidebar\.myTeams/);
    assert.match(sidebar, /team\.common\.founder/);
    assert.match(sidebar, /team\.common\.administrator/);
    assert.match(sidebar, /team\.super == uid \? 'is-founder' : 'is-admin'/);
    assert.doesNotMatch(sidebar, />团长<\/span>/);
    assert.match(sidebar, /class="u-sidebar-group-icon is-member"[\s\S]*?<School \/>/);
    assert.match(sidebar, /to="\/raid\/list"/);
    assert.match(sidebar, /team\.sidebar\.activity/);
    assert.match(sidebar, /team\.common\.platform/);
    assert.doesNotMatch(sidebar, /<strong>团队中心<\/strong>/);
    assert.match(sidebar, /teamLogo:\s*__cdn \+ "logo\/logo-light\/team\.svg"/);
    assert.match(page, /teamLogo:\s*__cdn \+ "logo\/logo-light\/team\.svg"/);
    assert.match(sidebar, /team\.sidebar\.myRoles/);
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
    assert.match(page, /team\.orgLegacy\.createDescription/);
    assert.doesNotMatch(page, /<OfficeBuilding \/>/);
    assert.match(page, /variant="archive"/);
    assert.match(page, /team\.orgLegacy\.checking/);
    assert.match(page, /name:\s*"manage_my_org"/);
    assert.match(page, /v_member:\s*0/);
    assert.match(page, /v_dkp:\s*2/);
    assert.match(page, /v_activity:\s*0/);
    assert.match(page, /v_comment:\s*0/);
    assert.match(page, /team\.orgLegacy\.fillHint/);
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

test("team workspace uses a shared mobile navigation trigger and side drawer", async () => {
    const [sidebar, shell, styles, guide] = await Promise.all([
        read("../src/components/team/org/team_home_sidebar.vue"),
        read("../src/assets/css/team/app.less"),
        read("../src/assets/css/team/modules/home-theme.less"),
        read("../docs/design/TEAM_MOBILE_NAVIGATION_GUIDE.md"),
    ]);

    assert.match(sidebar, /class="u-team-mobile-navigation-trigger"/);
    assert.match(sidebar, /<el-icon><ArrowRight \/><\/el-icon>/);
    assert.doesNotMatch(sidebar, /mobileTriggerLogo|mobileTriggerTitle/);
    assert.match(sidebar, /'is-mobile-drawer-open': mobileDrawerOpen/);
    assert.match(sidebar, /team\.sidebar\.mobileOpen/);
    assert.match(sidebar, /aria-controls="team-mobile-navigation-drawer"/);
    assert.match(sidebar, /:aria-expanded="mobileDrawerOpen"/);
    assert.match(sidebar, /class="m-team-home-sidebar__drawer"/);
    assert.match(sidebar, /class="u-team-mobile-navigation-mask"/);
    assert.match(sidebar, /"\$route\.fullPath": function \(\)/);
    assert.match(sidebar, /event\.key === "Escape"/);
    assert.match(sidebar, /document\.body\.classList\.remove\("is-team-navigation-open"\)/);
    assert.match(shell, /body\.is-team-navigation-open\s*\{\s*overflow:\s*hidden/);
    assert.match(shell, /m-team-modern-shell__sidebar[\s\S]*?order:\s*1/);
    assert.match(shell, /m-team-modern-shell__sidebar[\s\S]*?position:\s*absolute[\s\S]*?width:\s*0/);
    assert.match(shell, /m-team-modern-shell__content[\s\S]*?order:\s*2/);
    assert.match(styles, /@media screen and \(max-width:\s*820px\)[\s\S]*?\.u-team-mobile-navigation-trigger[\s\S]*?position:\s*fixed/);
    assert.match(styles, /\.u-team-mobile-navigation-trigger[\s\S]*?border-radius:\s*0 12px 12px 0/);
    assert.match(styles, /&\.is-mobile-drawer-open\s*\{\s*z-index:\s*1001/);
    assert.match(styles, /left:\s*0/);
    assert.match(styles, /transform:\s*translateX\(-104%\)/);
    assert.match(styles, /&\.is-open[\s\S]*?transform:\s*translateX\(0\)/);
    assert.match(styles, /prefers-reduced-motion:\s*reduce[\s\S]*?m-team-home-sidebar__drawer/);
    assert.match(guide, /左侧悬浮触发按钮 \+ 左侧侧滑抽屉/);
    assert.match(guide, /只显示团队导航图标，不展示当前团队 Logo、名称/);
    assert.match(guide, /禁止复制一份独立的移动团队列表/);
});

test("team workspace uses the persistent sidebar as its only team switcher", async () => {
    const [router, workspace, sidebar] = await Promise.all([
        read("../src/pages/team/router.js"),
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/components/team/org/team_home_sidebar.vue"),
    ]);

    assert.match(router, /name:\s*"view_my_org"[\s\S]*?path:\s*"\/my\/org\/:id\?"/);
    assert.doesNotMatch(workspace, /selectedTeamId|switchTeam|u-team-switcher|m-team-switch/);
    assert.doesNotMatch(workspace, /openFirstTeam|getAllMyTeams/);
    assert.match(sidebar, /teamRoute:\s*function \(team, mode\)/);
    assert.match(sidebar, /this\.expandedGroups\[mode\] = true/);
    assert.match(sidebar, /openFirstMemberTeam/);
    assert.match(sidebar, /this\.\$router\.replace\(this\.teamRoute\(this\.teams\[0\], "member"\)\)/);
    assert.match(sidebar, /name:\s*mode === "manage" \? "manage_my_org" : "view_my_org"/);
    assert.doesNotMatch(sidebar, /query:\s*\{\s*mode/);
    assert.match(sidebar, /this\.workspaceMode === mode/);
});

test("team member workspace redirects non-members to the public team page", async () => {
    const workspace = await read("../src/views/team/org/ViewMyOrg.vue");

    assert.match(workspace, /import \{ checkMyAuthority, getPendingCount \}/);
    assert.match(workspace, /v-if="id && accessGranted"/);
    assert.match(workspace, /checkMyAuthority\(requestedId\)/);
    assert.match(workspace, /authority\.authority < 2/);
    assert.match(workspace, /name: "view_org",[\s\S]*?params: \{ id: requestedId \}/);
    assert.match(workspace, /\["view_my_org", "manage_my_org"\]\.includes\(this\.\$route\.name\)/);
    assert.match(workspace, /if \(!this\.isCurrentLoad\(requestedId, version\)\) return/);
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

    assert.match(app, /"index",[\s\S]*?"list_org",[\s\S]*?"view_org"/);
    assert.match(sidebar, /\["index", "list_org", "view_org"\]\.includes\(this\.\$route\.name\)/);
    assert.match(router, /name:\s*"view_org"[\s\S]*?path:\s*"\/org\/:id"[\s\S]*?isPublic:\s*true/);
    assert.match(page, /class="v-org-view p-team-public"/);
    assert.match(page, /class="m-public-org__hero"/);
    assert.match(page, /'has-banner': publicBanner/);
    assert.match(page, /--team-banner-image/);
    assert.match(page, /publicBanner:[\s\S]*?resolveImagePath\(this\.data\.banner\)/);
    assert.match(page, /class="m-public-org__workspace"/);
    assert.match(page, /<team-info[\s\S]*?:info="data"[\s\S]*?:team_id="id"/);
    assert.match(page, /<team-info[\s\S]*?:show-manage-action="false"/);
    assert.match(page, /class="m-team-view m-public-org__tabs"/);
    assert.doesNotMatch(page, /<el-tabs[^>]*type="card"/);
    for (const tab of ["overview", "members", "activities", "videos", "comments"]) {
        assert.match(page, new RegExp(`team\\.public\\.${tab}`));
    }
    assert.doesNotMatch(page, /DKP记录|ViewDkp|name="dkp"/);
    for (const component of ["team-intro", "team-recruit", "team-medals", "team-trophy", "ViewMember", "TeamRaid", "ViewVideo", "ViewComment"]) {
        assert.match(page, new RegExp(`<${component}\\b`));
    }
    assert.match(page, /const PUBLIC_TABS = \["overview", "member", "raid", "video", "comment"\]/);
    assert.match(page, /:label="\$t\('team\.public\.activities'\)" name="raid"[\s\S]*?:v="data\.v_activity"[\s\S]*?:authority="authority"/);
    assert.match(page, /const query = \{ \.\.\.this\.\$route\.query \}/);
    assert.match(page, /Promise\.all\(\[this\.loadTeamInfo\(id\), this\.loadAuthority\(id\)\]\)/);
    assert.match(page, /version !== this\.loadVersion \|\| id !== this\.id/);
    assert.match(page, /:key="`public-team-tabs-\$\{id\}`"/);
    assert.match(page, /class="m-public-org__error"/);
    assert.match(shellStyles, /> \.p-team-public/);
    assert.match(pageStyles, /\.p-team-public[\s\S]*\.m-public-org__hero[\s\S]*border-radius:\s*@team-radius-control/);
    assert.match(pageStyles, /background-image:\s*var\(--team-banner-image\)/);
    assert.match(pageStyles, /background-position:\s*right center/);
    assert.match(pageStyles, /background-size:\s*cover/);
    assert.match(pageStyles, /width:\s*min\(920px, 100%\)[\s\S]*height:\s*120px/);
    assert.match(pageStyles, /linear-gradient\(90deg,[\s\S]*fade\(#fff, 92%\)[\s\S]*transparent 28%/);
    assert.match(pageStyles, /max-width:\s*700px[\s\S]*fade\(#fff, 94%\)[\s\S]*transparent 72%/);
    assert.match(pageStyles, /max-width:\s*520px[\s\S]*&::before,[\s\S]*display:\s*none !important/);
    assert.match(pageStyles, /max-width:\s*520px[\s\S]*> \.u-logo[\s\S]*grid-row:\s*1/);
    assert.match(pageStyles, /max-width:\s*520px[\s\S]*\.u-title[\s\S]*align-self:\s*center[\s\S]*grid-row:\s*1[\s\S]*flex-direction:\s*row/);
    assert.match(pageStyles, /max-width:\s*520px[\s\S]*\.u-meta[\s\S]*background:\s*transparent/);
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
    assert.match(page, /<h2 id="team-leaders-title">\{\{ \$t\("team\.publicContent\.leaders"\) \}\}<\/h2>/);
    assert.match(page, /team\.publicContent\.roleCount/);
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
    assert.match(member, /this\.\$confirm\(this\.\$t\("team\.memberDialog\.accountConfirm"\)/);
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

test("team DKP records use a segmented switch", async () => {
    const [dkp, styles] = await Promise.all([
        read("../src/views/team/dkp/ViewDkp.vue"),
        read("../src/assets/css/team/dkp/view_dkp.less"),
    ]);

    assert.match(dkp, /<el-segmented v-model="tab" :options="tabs" class="m-dkp-segmented">/);
    assert.match(dkp, /\{ label: this\.\$t\("team\.raid\.misc\.currentScore"\), value: "list", icon: "el-icon-tickets" \}/);
    assert.match(dkp, /\{ label: this\.\$t\("team\.raid\.misc\.history"\), value: "logs", icon: "el-icon-time" \}/);
    assert.match(dkp, /<dkp-list v-if="tab === 'list' && data\.length > 0"/);
    assert.match(dkp, /<dkp-logs v-if="tab === 'logs'"/);
    assert.match(styles, /\.m-dkp-segmented\s*\{[\s\S]*?margin-bottom:\s*16px/);
});

test("r_video administrators receive the complete video management workspace", async () => {
    const [workspace, manager, publicPage, publicVideo, service] = await Promise.all([
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/views/team/org/ManageVideo.vue"),
        read("../src/views/team/org/ViewOrg.vue"),
        read("../src/views/team/org/ViewVideo.vue"),
        read("../src/service/team/team.js"),
    ]);

    assert.match(workspace, /canManageVideo:[\s\S]*?this\.isSuper \|\| Number\(this\.permissions\.r_video\) === 1/);
    assert.match(workspace, /<el-tab-pane :label="\$t\('team\.workspace\.videoManagement'\)"[^>]*v-if="canManageVideo"/);
    assert.match(workspace, /<ManageVideo[\s\S]*?:key="`manage-video-\$\{id\}`"[\s\S]*?:team-id="id"[\s\S]*?:can-manage="canManageVideo"/);
    assert.match(workspace, /if \(this\.canManageVideo\) tabs\.push\("video"\)/);

    assert.match(manager, /teamId:[\s\S]*?canManage:/);
    assert.match(manager, /return ~~this\.teamId/);
    assert.match(manager, /v-if="canManage" @click="openDialog"/);
    assert.match(manager, /:isMine="canManage"/);
    assert.match(manager, /isMaster:\s*this\.canManage/);
    assert.match(manager, /this\.canManage \? getVideosMaster\(this\.id, params\) : getVideos\(this\.id, params\)/);
    assert.match(manager, /return request[\s\S]*?\.catch\(\(\) => \{[\s\S]*?this\.videos_list = \[\];[\s\S]*?this\.total = 0/);
    assert.match(manager, /return getTeamsList\(\)[\s\S]*?\.catch\(\(\) => \{[\s\S]*?this\.eventsList = \[\]/);
    assert.match(manager, /deleteVideo\(id\)[\s\S]*?\.catch\(\(\) => \{/);
    assert.match(manager, /const request = isEditing[\s\S]*?\.catch\(\(\) => \{[\s\S]*?\.finally\(\(\) => \{/);
    assert.doesNotMatch(manager, /User\.getInfo\(\)\.uid == this\.super/);

    assert.match(publicPage, /<ViewVideo v-if="done" \/>/);
    assert.match(publicVideo, /<team-videos :data="videos" @toEmit="isEmit" \/>/);
    assert.match(publicVideo, /return getVideos\(this\.id, params\)/);
    assert.doesNotMatch(publicVideo, /getVideosMaster/);
    assert.doesNotMatch(publicVideo, /User\.getInfo\(\)\.uid == this\.super/);
    assert.match(service, /get\(`\/api\/team\/video\/team\/\$\{id\}\/all`/);
});

test("team edit action opens the basic settings section in the workbench", async () => {
    const panel = await read("../src/components/team/org/team_panel.vue");

    assert.match(panel, /name:\s*"manage_my_org"/);
    assert.doesNotMatch(panel, /mode:\s*"manage"/);
    assert.match(panel, /tab:\s*"setting"/);
    assert.match(panel, /subtab:\s*"basic"/);
    assert.match(panel, /this\.showManageAction && \(this\.isLeader \|\| this\.isSuperAdmin\)/);
});

test("team header actions follow management, member, and public route modes", async () => {
    const [workspace, publicPage, info, panel] = await Promise.all([
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/views/team/org/ViewOrg.vue"),
        read("../src/components/team/org/team_info.vue"),
        read("../src/components/team/org/team_panel.vue"),
    ]);

    assert.match(workspace, /:show-public-actions="false"/);
    assert.match(workspace, /:show-home-action="true"/);
    assert.doesNotMatch(workspace, /:always-show-join-action="!isManagementMode"/);
    assert.match(publicPage, /:always-show-join-action="true"/);
    assert.match(info, /v-if="\(showPublicActions \|\| showHomeAction\) && \(!isRaid \|\| !isTeamSuper\)"/);
    assert.match(info, /:show-home-action="showHomeAction"/);
    assert.match(info, /:always-show-join-action="alwaysShowJoinAction"/);
    assert.match(panel, /v-if="showHomeAction"[\s\S]*?:to="`\/org\/\$\{team_id\}`"[\s\S]*?team\.publicActions\.homepage/);
    assert.match(panel, /v-if="showPublicActions && !isRaid"/);
    assert.match(panel, /v-if="showPublicActions && showJoinAction"/);
    assert.match(panel, /return this\.alwaysShowJoinAction \|\| \(!this\.isMine && !this\.isLeader\)/);
});

test("team workspace separates management tools from the member view", async () => {
    const [workspace, raidManager, myRaid, publicRaid] = await Promise.all([
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/views/team/raid/ManageRaid.vue"),
        read("../src/views/team/raid/MyTeamRaid.vue"),
        read("../src/views/team/raid/TeamRaid.vue"),
    ]);
    const topLevelLabels = [...workspace.matchAll(/<el-tab-pane :label="\$t\('([^']+)'\)"/g)].map((match) => match[1]);
    const managementStart = workspace.indexOf('<template v-if="isManagementMode">');
    const memberStart = workspace.indexOf("<template v-else>", managementStart);
    const managementTemplate = workspace.slice(managementStart, memberStart);
    const memberTemplate = workspace.slice(memberStart);

    assert.deepEqual(topLevelLabels, [
        "team.workspace.memberManagement",
        "team.workspace.battleManagement",
        "team.workspace.activityManagement",
        "team.workspace.snapshotManagement",
        "team.workspace.dkpManagement",
        "team.workspace.videoManagement",
        "team.workspace.teamSettings",
        "team.workspace.myRoles",
        "team.workspace.myBattles",
        "team.workspace.teamActivities",
        "team.workspace.teamSnapshots",
        "team.workspace.teamDkp",
        "team.workspace.videos",
        "team.workspace.comments",
    ]);
    assert.doesNotMatch(managementTemplate, /team\.workspace\.(myRoles|myBattles|teamDkp|teamActivities)/);
    assert.doesNotMatch(memberTemplate, /team\.workspace\.(memberManagement|battleManagement|videoManagement|snapshotManagement|dkpManagement|activityManagement|teamSettings)/);
    assert.match(managementTemplate, /<Setting \/>[\s\S]*?team\.workspace\.teamSettings/);
    assert.match(workspace, /class="p-team-my-org p-team-public"/);
    assert.match(workspace, /class="m-public-org__hero"/);
    assert.match(workspace, /'has-banner': publicBanner/);
    assert.match(workspace, /<team-info[\s\S]*?:info="data"[\s\S]*?:team_id="id"/);
    assert.match(workspace, /<team-info[\s\S]*?:show-manage-action="false"/);
    assert.match(workspace, /publicBanner:[\s\S]*?resolveImagePath\(this\.data\.banner\)/);
    assert.doesNotMatch(workspace, /switchWorkspaceMode|专注成员、内容、团队数据与基础设置/);
    assert.match(workspace, /const LEGACY_TAB_MAP = \{/);
    assert.match(workspace, /"battle-record": \{ mode: "manage", tab: "manage-battle" \}/);
    assert.match(raidManager, /teamId:/);
    assert.match(raidManager, /'is-embedded': embedded/);
    assert.match(myRaid, /teamId:/);
    assert.match(myRaid, /displayData:\s*function/);
    assert.match(myRaid, /String\(teamId\) === String\(this\.teamId\)/);
    assert.match(memberTemplate, /<MyTeamRaid :key="`member-raids-\$\{id\}`" :team-id="id" embedded show-all \/>/);
    assert.match(myRaid, /getMemberTeamRaids\(teamId\)/);
    assert.match(myRaid, /joinedMap\.get\(String\(activity\.id\)\)/);
    assert.match(myRaid, /return \(this\.raids \|\| \[\]\)\.map/);
    assert.doesNotMatch(myRaid, /isUnfinished|is_public/);
    assert.doesNotMatch(publicRaid, /is_public/);
    assert.match(myRaid, /class="m-public-raid-toolbar"/);
    assert.match(myRaid, /v-model="search"/);
    assert.match(myRaid, /filteredDisplayData\.length/);
    assert.match(myRaid, /\[activity\.name, activity\.title, activity\.server\]/);
    assert.match(myRaid, /:joined="item\.joined"/);
    assert.match(myRaid, /:can-quit="item\.joined"/);
    assert.match(memberTemplate, /name="comment"[\s\S]*?<ViewComment/);
    assert.match(memberTemplate, /name="video"[\s\S]*?<ViewVideo/);
    assert.match(workspace, /if \(!mode\) mode = routeMode \|\| \(MANAGEMENT_TAB_NAMES\.includes\(tab\) \? "manage" : "member"\)/);
    assert.match(
        workspace,
        /const MEMBER_TABS = \["overview", "battle", "my-raid", "snapshot", "my-dkp", "video", "comment"\]/,
    );
    assert.match(workspace, /:v="data\.v_comment"[\s\S]*?:authority="authority"/);
});

test("team archive uses a grouped basic settings form without changing other form entries", async () => {
    const [workspace, form, styles] = await Promise.all([
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/components/team/org/teamform.vue"),
        read("../src/assets/css/team/org/teamform.less"),
    ]);

    assert.match(workspace, /variant="archive"/);
    assert.match(form, /<h2>\{\{ \$t\("team\.settings\.identity"\) \}\}<\/h2>/);
    assert.match(form, /<h2>\{\{ \$t\("team\.settings\.publicDisplay"\) \}\}<\/h2>/);
    assert.match(form, /<h2>\{\{ \$t\("team\.settings\.contact"\) \}\}<\/h2>/);
    assert.match(form, /<h2>\{\{ \$t\("team\.settings\.visibility"\) \}\}<\/h2>/);
    assert.doesNotMatch(form, /label="团队DKP"/);
    assert.match(form, /this\.form\.v_dkp = 2;[\s\S]*?this\.\$emit\("submit"\)/);
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
    assert.match(page, /team\.verification\.notice/);
    assert.match(page, /team\.verification\.process/);
    assert.match(page, /team\.verification\.application/);
    assert.match(form, /class="m-team-verify-summary"/);
    assert.match(form, /:label="\$t\('team\.verification\.contactQq'\)"/);
    assert.match(form, /'is-editable': canApply/);
    assert.match(form, /:placeholder="\$t\('team\.verification\.contactPlaceholder'\)"/);
    assert.match(form, /immediate:\s*true/);
    assert.match(logs, /team\.verification\.recent/);
    assert.match(logs, /props:\s*\["teamId"\]/);
    assert.match(logs, /<el-empty v-else/);
    assert.match(styles, /\.v-org-verify\.is-archive/);
    assert.match(styles, /&\.is-editable[\s\S]*&\.is-focus/);
    assert.match(workspace, /<EditPermission[\s\S]*?variant="archive"[\s\S]*?:team-id="id"/);
    assert.match(permission, /team\.permissions\.title/);
    assert.match(permission, /this\.variant === "archive"/);
    assert.match(permissionStyles, /\.m-permission-panel\.is-archive/);
    assert.match(permissionStyles, /position:\s*sticky/);
    assert.match(permissionStyles, /\.el-checkbox__input\.is-disabled\.is-checked/);
    assert.match(permissionStyles, /cursor:\s*not-allowed/);
    assert.match(permission, /:variant="variant"/);
    assert.match(permission, /team\.permissions\.remove/);
    assert.match(permission, /this\.\$confirm\([\s\S]*?team\.permissions\.confirmRemove[\s\S]*?team\.permissions\.cancel/);
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
    assert.match(userpop, /team\.raid\.misc\.waitingUser/);
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
    assert.doesNotMatch(manager, /class="m-dkp-embedded-header"/);
    assert.match(manager, /v-if="isSuperLeader"[\s\S]*?activeTab === 'advanced'[\s\S]*?team\.dkp\.advanced/);
    assert.match(manager, /@click="switchTab\('score'\)"/);
    assert.match(manager, /@click="switchTab\('advanced'\)"/);
    assert.match(manager, /"\$route\.query\.subtab":\s*\{[\s\S]*?immediate:\s*true/);
    assert.match(manager, /subtab:\s*tab/);
    assert.match(manager, /if \(subtab === "advanced" && !this\.leaderChecked\) return/);
    assert.match(manager, /class="u-dkp-help" href="\/tool\/23786" target="_blank" rel="noopener noreferrer"/);
    assert.match(manager, /v-if="activeTab === 'advanced'" class="m-dkp-advanced"/);
    assert.match(manager, /team\.dkp\.resetTitle[\s\S]*?team\.dkp\.reset/);
    assert.match(manager, /if \(!this\.isSuperLeader\)[\s\S]*?team\.dkp\.founderOnly/);
    assert.doesNotMatch(manager, /<el-tabs type="card"/);
    assert.doesNotMatch(manager, /<keep-alive>/);
    assert.match(managerStyles, /\.m-dkp-manage-nav[\s\S]*button[\s\S]*&\.is-active/);
    assert.match(managerStyles, /\.u-dkp-help\s*\{[\s\S]*?margin-left:\s*auto/);
    assert.match(managerStyles, /\.m-dkp-danger-card\s*\{[\s\S]*?fade\(#ef4444, 24%\)/);
    assert.doesNotMatch(list, /<el-table[\s\S]*?\sborder(?:\s|>)/);
    assert.match(list, /type="selection" width="52" align="center"/);
    assert.match(list, /:label="\$t\('team\.dkp\.operation'\)" width="120" v-if="!readOnly"/);
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
    assert.match(dialog, /:value="role\.relation\.role_id"/);
    assert.match(dialog, /error\?\.response\?\.data\?\.msg[\s\S]*?team\.dkpDialog\.failed/);
    assert.match(dialog, /this\.\$emit\("updateRows"\)/);
    assert.match(dialog, /const createDefaultForm = \(\) => \(\{/);
    assert.match(dialog, /form:\s*createDefaultForm\(\)/);
    assert.match(dialog, /this\.form = createDefaultForm\(\)/);
    assert.doesNotMatch(dialog, /this\.\$options\.data\(\)/);
    assert.match(list, /updateRows:\s*function \(\)[\s\S]*?clearSelection\(\)[\s\S]*?return this\.loadDkpList\(\)/);
    assert.doesNotMatch(list, /const _score = action/);
    assert.match(dialogStyles, /\.m-dkp-dialog-modify\.el-dialog/);
    assert.match(dialogStyles, /\.m-dkp-dialog-form__row[\s\S]*grid-template-columns:\s*repeat\(2/);
});

test("DKP snapshot association reuses the five-team roster styling", async () => {
    const [item, itemStyles, bodyStyles, list, listStyles, stat, statStyles, chart, chartData, zhCn, zhTw] = await Promise.all([
        read("../src/components/team/snapshot/snapshotItem.vue"),
        read("../src/assets/css/team/snapshot/item.less"),
        read("../src/assets/css/team/snapshot/body.less"),
        read("../src/components/team/snapshot/snapshotList.vue"),
        read("../src/assets/css/team/snapshot/list.less"),
        read("../src/components/team/snapshot/snapshotStat.vue"),
        read("../src/assets/css/team/snapshot/stat.less"),
        read("../src/components/team/snapshot/snapshotChart.vue"),
        read("../src/assets/data/team/snapshot_chart.json"),
        read("../src/locale/zh-CN/team.js"),
        read("../src/locale/zh-TW/team.js"),
    ]);

    assert.match(item, /v-for="group of 5"[\s\S]*?team\.snapshot\.group/);
    assert.match(zhCn, /uploadedInGame: "\{time\}\{'@'\}\{name\} 游戏内上传"/);
    assert.match(zhTw, /uploadedInGame: "\{time\}\{'@'\}\{name\} 遊戲內上傳"/);
    assert.match(item, /v-if="supportDkpSync && data\.dkp"[\s\S]*?el-icon-check[\s\S]*?team\.snapshot\.dkpSynced/);
    assert.match(item, /:loading="syncingDkp"[\s\S]*?:disabled="syncingDkp"/);
    assert.match(item, /if \(!Number\.isInteger\(score\)\)/);
    assert.match(item, /syncSnapshotDkp\(this\.team_id, data\.id,[\s\S]*?\.catch\(\(error\) => \{/);
    assert.match(item, /result\.matched[\s\S]*?team\.snapshot\.dkpSkipped/);
    assert.match(item, /team\.snapshot\.dkpNoMatch/);
    assert.match(item, /error\?\.response\?\.data\?\.msg[\s\S]*?team\.snapshot\.submitFailed/);
    assert.match(item, /\.finally\(\(\) => \{[\s\S]*?this\.syncingDkp = false/);
    assert.match(itemStyles, /\.m-snapshot-flags[\s\S]*grid-template-columns:\s*repeat\(5/);
    assert.match(itemStyles, /\.u-dkp-status\s*\{[\s\S]*?border-radius:\s*999px[\s\S]*?color:\s*#15803d/);
    assert.match(itemStyles, /\.m-snapshot-dkp[\s\S]*grid-template-columns:\s*minmax\(160px/);
    assert.match(bodyStyles, /&\.row-5\s*\{[\s\S]*border-radius:\s*0 0 12px 12px/);
    assert.match(bodyStyles, /@row-height:\s*50px/);
    assert.match(list, /:aria-label="\$t\('team\.snapshot\.searchAria'\)"/);
    assert.match(list, /v-if="supportDkpSync" class="m-snapshot-dkp-guide"/);
    assert.match(list, /team\.snapshotGuide\.title[\s\S]*?team\.snapshotGuide\.step3/);
    assert.match(listStyles, /\.m-snapshot-dkp-guide\s*\{[\s\S]*?fade\(@team-primary, 18%\)/);
    assert.match(listStyles, /\.m-snapshot-box > \.m-snapshot-search[\s\S]*background:\s*@team-surface-muted/);
    assert.match(listStyles, /\.el-input\s*\{[\s\S]*width:\s*420px[\s\S]*max-width:\s*100%/);
    assert.match(
        listStyles,
        /:deep\(\.el-input__wrapper\)[\s\S]*&:hover\s*\{[\s\S]*border-color:\s*@team-border-focus[\s\S]*&\.is-focus\s*\{[\s\S]*border-color:\s*@team-primary[\s\S]*box-shadow:\s*@team-shadow-focus/
    );
    assert.match(stat, /m-snapshot-search[\s\S]*m-snapshot-period[\s\S]*m-snapshot-date/);
    assert.match(stat, /team\.snapshot\.count/);
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
    assert.match(chart, /import \{ markRaw \} from "vue"/);
    assert.match(chart, /this\.charts\[type\] = markRaw\(echarts\.getInstanceByDom\(dom\) \|\| echarts\.init\(dom\)\)/);
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

    assert.match(workspace, /team\.workspace\.featureSettings/);
    assert.match(workspace, /team\.workspace\.otherSettings/);
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
    assert.match(workspace, /rawSubtab = this\.\$route\.query\.subtab \|\| ""/);
    assert.match(workspace, /if \(tab === "setting"\) query\.subtab = section/);
    assert.match(workspace, /delete query\.section/);
    assert.match(workspace, /\["basic", "verify", "permission", "feature", "other", "advanced"\]/);
    assert.match(workspace, /<team-advanced-setting[\s\S]*?variant="archive"/);
    assert.match(config, /class="v-team-config"[\s\S]*?'is-archive'/);
    assert.match(config, /\.v-team-config\.is-archive[\s\S]*display:\s*block/);
    assert.match(config, /team\.settingSections\.snapshot/);
    assert.match(config, /team\.settingSections\.dkp/);
    assert.match(config, /team\.settingSections\.appearance/);
    assert.match(config, /showFeatureSettings[\s\S]*?<snapshot-password[\s\S]*?<dkp-rule/);
    assert.match(config, /showDisplaySettings[\s\S]*?<team-banner/);
    assert.match(config, /configSection:[\s\S]*?default:\s*"all"/);
    assert.match(config, /validator:[\s\S]*?\["all", "feature", "other"\]/);
    assert.doesNotMatch(config, /"advanced"/);
    assert.match(config, /showDisplaySettings:[\s\S]*?\["all", "other"\]/);
    assert.match(password, /m-archive-field-label">\{\{ \$t\("team\.snapshotPassword\.title"\) \}\}/);
    assert.match(password, /class="u-password-heading"/);
    assert.match(password, /class="u-password-notice"/);
    assert.match(password, /class="u-password-meta"/);
    assert.match(password, /\.u-password-box\s*\{[\s\S]*width:\s*680px[\s\S]*border-radius:\s*@team-radius-control/);
    assert.match(password, /:deep\(\.el-input__wrapper\)[\s\S]*&\.is-focus[\s\S]*box-shadow:\s*@team-shadow-focus/);
    assert.match(password, /\^\\d\{6\}\$/);
    assert.match(password, /@input="formatPassword"/);
    assert.match(banner, /team\.settingSections\.banner/);
    assert.match(banner, /\[920, 120\]/);
    assert.match(banner, /team\.settingSections\.bannerHint/);
    assert.match(banner, /width:\s*920px[\s\S]*aspect-ratio:\s*920 \/ 120/);
    assert.match(banner, /object-position:\s*right center/);
    assert.match(banner, /\.u-tip[\s\S]*display:\s*none/);
    assert.match(banner, /updateTeamInfo\(this\.id,\s*\{\s*banner:\s*this\.banner/);
    assert.match(teamService, /function updateTeamInfo\(team_id, data\)[\s\S]*?\.patch\(`\/api\/team\/my-team\/\$\{team_id\}`/);
    assert.match(dkpRule, /team\.settingSections\.dkpRule/);
    assert.match(dkpRule, /class="m-dkp-rule__footer"/);
    assert.match(advanced, /team\.advanced\.actions/);
    assert.match(advanced, /class="m-team-operation-item is-danger"/);
    assert.match(advanced, /&\.is-danger[\s\S]*background:\s*transparent/);
    assert.doesNotMatch(advanced, /u-operation-icon|m-advanced-card__header/);
    assert.match(advanced, /cancelButtonText:\s*this\.\$t\("team\.advanced\.cancel"\)/);
    assert.match(advanced, /:confirm-text="\$t\('team\.advanced\.confirmTransfer'\)"/);
    assert.match(advanced, /class="u-transform" type="warning" @click="transformTeam"/);
    assert.match(advanced, /class="u-delete" type="danger" @click="deleteTeam"/);
    assert.match(advanced, /class="u-transform"[\s\S]*?<el-icon><Switch \/><\/el-icon>[\s\S]*?team\.advanced\.startTransfer/);
    assert.match(advanced, /class="u-delete"[\s\S]*?<el-icon><Delete \/><\/el-icon>[\s\S]*?team\.advanced\.deleteTeam/);
    assert.match(advanced, /import \{ Delete, Switch \} from "@element-plus\/icons-vue"/);
    assert.doesNotMatch(advanced, /type="(?:warning|danger)" plain/);
    assert.match(advanced, /confirmTransform:[\s\S]*?this\.\$confirm\([\s\S]*?team\.advanced\.transferTitle[\s\S]*?transformTeam\(this\.id, this\.to_uid\)/);
    assert.match(advanced, /deleteTeam:[\s\S]*?this\.\$confirm\([\s\S]*?team\.advanced\.deleteTitle[\s\S]*?this\.removeTeam\(\)/);
    assert.doesNotMatch(advanced, /<EditNamespace :variant="variant"/);
    assert.match(namespace, /team\.namespace\.title/);
    assert.match(namespace, /v-if="variant !== 'archive'" class="u-desc"/);
    assert.match(namespace, /subtab:\s*"verify"/);
    assert.match(namespaceStyles, /\.m-team-namespace\.is-archive/);
    assert.match(namespaceStyles, /\.el-input-group__prepend[\s\S]*border-radius:\s*10px 0 0 10px/);
    assert.match(namespaceStyles, /\.el-input-group \.el-input__wrapper[\s\S]*border-radius:\s*0 10px 10px 0/);
    assert.match(userpop, /confirmText \|\| \(isArchive \? \$t\("team\.raid\.misc\.addUser"\)/);
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

test("snapshot subtabs stay synchronized with the subtab query", async () => {
    const [snapshot, snapshotService] = await Promise.all([
        read("../src/views/team/snapshot/ListSnapshot.vue"),
        read("../src/service/team/snapshot.js"),
    ]);

    assert.match(snapshot, /@click="switchTab\('list'\)"[\s\S]*?team\.snapshot\.teamSnapshots/);
    assert.match(snapshot, /@click="switchTab\('stat'\)"[\s\S]*?team\.snapshot\.memberStats/);
    assert.match(snapshot, /const MANAGE_SNAPSHOT_TABS = \["list", "stat", "chart", "password"\]/);
    assert.match(snapshot, /const MEMBER_SNAPSHOT_TABS = \["list", "stat", "chart"\]/);
    assert.match(snapshot, /"\$route\.query\.subtab":\s*\{[\s\S]*?immediate:\s*true/);
    assert.match(snapshot, /this\.tab = this\.allowedTabs\.includes\(subtab\) \? subtab : "list"/);
    assert.match(snapshot, /@click="switchTab\('list'\)"/);
    assert.match(snapshot, /@click="switchTab\('password'\)"/);
    assert.match(snapshot, /v-if="canConfigurePassword"[^>]*@click="switchTab\('password'\)"/);
    assert.match(snapshot, /return this\.canConfigurePassword \? MANAGE_SNAPSHOT_TABS : MEMBER_SNAPSHOT_TABS/);
    assert.match(snapshot, /canConfigurePassword:\s*function \(\)[\s\S]*?this\.tab = this\.allowedTabs\.includes\(subtab\) \? subtab : "list"/);
    assert.match(snapshot, /query:\s*\{[\s\S]*?\.\.\.this\.\$route\.query,[\s\S]*?subtab:\s*tab/);
    assert.match(snapshot, /class="u-snapshot-help" href="\/tool\/23783" target="_blank" rel="noopener noreferrer"/);
    assert.match(snapshot, /\.u-snapshot-help\s*\{[\s\S]*?margin-left:\s*auto/);
    assert.match(snapshotService, /import \{ \$cms \} from "@jx3box\/jx3box-common\/js\/api"/);
    assert.match(snapshotService, /\/api\/cms\/team\/snapshot\/team\/\$\{team_id\}/);
    assert.doesNotMatch(snapshotService, /\$team\(\)/);
});

test("member workspace exposes team snapshots as a read-only tab before videos", async () => {
    const [workspace, snapshot] = await Promise.all([
        read("../src/views/team/org/ViewMyOrg.vue"),
        read("../src/views/team/snapshot/ListSnapshot.vue"),
    ]);

    assert.match(workspace, /const MEMBER_TABS = \["overview", "battle", "my-raid", "snapshot", "my-dkp", "video", "comment"\]/);
    assert.match(
        workspace,
        /:label="\$t\('team\.workspace\.teamSnapshots'\)" name="snapshot"[\s\S]*?<SnapshotList :key="`member-snapshots-\$\{id\}`" :team-id="id" read-only \/>[\s\S]*?:label="\$t\('team\.workspace\.teamDkp'\)" name="my-dkp"[\s\S]*?<MyDkp :key="`member-dkp-\$\{id\}`" :team-id="id" \/>[\s\S]*?:label="\$t\('team\.workspace\.videos'\)" name="video"/,
    );
    assert.match(workspace, /<SnapshotList[\s\S]*?:key="`snapshot-management-\$\{id\}`"[\s\S]*?:team-id="id"[\s\S]*?:can-configure-password="isSuper"/);
    assert.match(snapshot, /:read-only="readOnly"/);
    assert.match(snapshot, /:support-dkp-sync="false"/);
});

test("member management subtabs stay synchronized with the subtab query", async () => {
    const members = await read("../src/views/team/member/ListMember.vue");

    assert.match(members, /const MEMBER_SUBTABS = \["user", "pending"\]/);
    assert.match(members, /"\$route\.query\.subtab":\s*\{[\s\S]*?immediate:\s*true/);
    assert.match(members, /this\.tab = MEMBER_SUBTABS\.includes\(subtab\) \? subtab : "user"/);
    assert.match(members, /@click="switchTab\(item\.value\)"/);
    assert.match(members, /query:\s*\{[\s\S]*?\.\.\.this\.\$route\.query,[\s\S]*?subtab:\s*tab/);
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
    assert.match(list, /team\.homeFilters\.noRecruitment/);
    assert.match(list, /:pager-count="isMobilePagination \? 5 : 7"/);
    assert.match(list, /:small="isMobilePagination"/);
    assert.match(list, /window\.matchMedia\("\(max-width: 560px\)"\)/);
    assert.match(list, /removeEventListener\("change", this\.updatePaginationViewport\)/);
    assert.match(styles, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
    assert.match(
        styles,
        /@media screen and \(max-width: 820px\)[\s\S]*?> \.u-meta:not\(\.u-recruit\)[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)[\s\S]*?\.u-meta-item[\s\S]*?display:\s*flex[\s\S]*?width:\s*100%/,
    );
    assert.match(styles, /> \.u-super\s*\{[\s\S]*?min-width:\s*0[\s\S]*?white-space:\s*nowrap/);
    assert.match(styles, /\.m-team-list-pages[\s\S]*?overflow:\s*hidden[\s\S]*?min-width:\s*32px/);
    assert.match(styles, /@media screen and \(max-width: 360px\)[\s\S]*?min-width:\s*28px/);
});
