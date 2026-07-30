import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
    return readFile(new URL(path, import.meta.url), "utf8");
}

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
    assert.match(app, /\["index", "view_my_org", "add_org"\]\.includes\(this\.\$route\.name\)/);
    assert.doesNotMatch(page, /TeamHomeSidebar/);
    assert.match(page, /class="u-team-home-action is-primary" to="\/org\/add"/);
    assert.match(sidebar, /getAllMyTeams\(\)/);
    assert.match(sidebar, /getMyManageTeams\(\)/);
    assert.match(sidebar, /User\.isLogin\(\)/);
    assert.match(sidebar, /<strong>我管理的团队<\/strong>/);
    assert.match(sidebar, /<strong>我的团队<\/strong>/);
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

    assert.match(app, /\["index", "view_my_org", "add_org"\]/);
    assert.match(page, /class="v-org-add p-team-create"/);
    assert.match(page, /class="m-team-create__hero"/);
    assert.match(page, /variant="archive"/);
    assert.match(page, /正在检查创建权限/);
    assert.match(page, /name:\s*"view_my_org"/);
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
    assert.match(sidebar, /mode,\s*tab:\s*mode === "manage" \? "manage-member" : "overview"/);
    assert.match(sidebar, /this\.workspaceMode === mode/);
});

test("team edit action opens the basic settings section in the workbench", async () => {
    const panel = await read("../src/components/team/org/team_panel.vue");

    assert.match(panel, /name:\s*"view_my_org"/);
    assert.match(panel, /mode:\s*"manage"/);
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
        "视频管理",
        "快照管理",
        "DKP管理",
        "RAID管理",
        "团队档案",
        "我的角色",
        "我的战绩",
        "我的DKP",
        "参与的RAID",
    ]);
    assert.doesNotMatch(managementTemplate, /我的角色|我的战绩|我的DKP|参与的RAID/);
    assert.doesNotMatch(memberTemplate, /成员管理|战绩管理|视频管理|快照管理|DKP管理|RAID管理|团队档案/);
    assert.match(workspace, /:show-manage-action="isManagementMode"/);
    assert.match(workspace, /switchWorkspaceMode/);
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
    assert.match(permission, /this\.\$confirm\([\s\S]*?确认删除[\s\S]*?cancelButtonText:\s*"取消"/);
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
    const [manager, managerStyles, list, logs, listStyles, logStyles] = await Promise.all([
        read("../src/views/team/dkp/ManageDkp.vue"),
        read("../src/assets/css/team/dkp/list_dkp.less"),
        read("../src/components/team/dkp/dkp_list.vue"),
        read("../src/components/team/dkp/dkp_logs.vue"),
        read("../src/assets/css/team/dkp/dkp_list.less"),
        read("../src/assets/css/team/dkp/dkp_logs.less"),
    ]);

    assert.match(manager, /class="m-dkp-manage-nav"/);
    assert.doesNotMatch(manager, /<el-tabs type="card"/);
    assert.match(managerStyles, /\.m-dkp-manage-nav[\s\S]*button[\s\S]*&\.is-active/);
    assert.doesNotMatch(list, /<el-table[\s\S]*?\sborder(?:\s|>)/);
    assert.match(list, /type="selection" width="52" align="center"/);
    assert.doesNotMatch(logs, /<el-table[\s\S]*?\sborder(?:\s|>)/);
    assert.match(listStyles, /\.m-dkp-list[\s\S]*border-radius:\s*12px/);
    assert.match(listStyles, /--el-table-border-color:\s*@team-border-light/);
    assert.match(logStyles, /\.m-dkp-logs-container[\s\S]*border-radius:\s*12px/);
    assert.match(logStyles, /--el-table-border-color:\s*@team-border-light/);
    assert.doesNotMatch(listStyles, /content:\s*"全选"/);
});

test("team archive advanced settings reuse the basic settings form language", async () => {
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
    ]);

    assert.match(workspace, /<EditOrgConfig variant="archive"/);
    assert.match(workspace, /<team-advanced-setting[\s\S]*?variant="archive"/);
    assert.match(config, /class="v-team-config"[\s\S]*?'is-archive'/);
    assert.match(config, /\.v-team-config\.is-archive[\s\S]*display:\s*block/);
    assert.match(config, /<h2>快照与展示<\/h2>/);
    assert.match(config, /<h2>DKP 设置<\/h2>/);
    assert.match(password, /m-archive-field-label">快照密码/);
    assert.match(password, /\^\\d\{6\}\$/);
    assert.match(password, /@input="formatPassword"/);
    assert.match(banner, /m-archive-field-label">团队海报/);
    assert.match(banner, /\[320, 179\]/);
    assert.match(banner, /width:\s*320px[\s\S]*height:\s*179px/);
    assert.match(banner, /aspect-ratio:\s*1125 \/ 630/);
    assert.match(banner, /\.u-tip[\s\S]*display:\s*none/);
    assert.match(dkpRule, /m-archive-field-label">DKP 制度/);
    assert.match(dkpRule, /class="m-dkp-rule__footer"/);
    assert.match(advanced, /<h2>团队操作<\/h2>/);
    assert.match(advanced, /class="m-team-operation-item is-danger"/);
    assert.match(advanced, /&\.is-danger[\s\S]*background:\s*transparent/);
    assert.doesNotMatch(advanced, /u-operation-icon|m-advanced-card__header/);
    assert.match(advanced, /cancelButtonText:\s*"取消"/);
    assert.match(advanced, /confirm-text="确认移交"/);
    assert.match(namespace, /<h2>团队铭牌<\/h2>/);
    assert.match(namespace, /v-if="variant !== 'archive'" class="u-desc"/);
    assert.match(namespace, /section:\s*"verify"/);
    assert.match(namespaceStyles, /\.m-team-namespace\.is-archive/);
    assert.match(namespaceStyles, /\.el-input-group__prepend[\s\S]*border-radius:\s*10px 0 0 10px/);
    assert.match(namespaceStyles, /\.el-input-group \.el-input__wrapper[\s\S]*border-radius:\s*0 10px 10px 0/);
    assert.match(userpop, /confirmText \|\| \(isArchive \? "确认添加"/);
    assert.match(workspaceStyles, /\.m-archive-advanced[\s\S]*\.m-team-form-section[\s\S]*&::before/);
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
    assert.doesNotMatch(list, /m-team-results-header/);
    assert.doesNotMatch(list, /u-card-enter/);
    assert.match(list, /暂未发布招募公告/);
    assert.match(styles, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
});
