import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
    return readFile(new URL(path, import.meta.url), "utf8");
}

test("member management uses the current workspace tabs and compact account cards", async () => {
    const [memberList, userList, memberItem, pendingList, listStyles, itemStyles] = await Promise.all([
        read("../src/views/team/member/ListMember.vue"),
        read("../src/views/team/member/UserList.vue"),
        read("../src/views/team/member/MemberItem.vue"),
        read("../src/views/team/member/PendingList.vue"),
        read("../src/assets/css/team/member/list_member.less"),
        read("../src/assets/css/team/member/member_item.less"),
    ]);

    assert.match(memberList, /class="m-member-subnav"/);
    assert.match(memberList, /\{ label: "正式团员", value: "user" \}/);
    assert.match(memberList, /\{ label: "加入申请", value: "pending" \}/);
    assert.match(memberList, /class="u-subnav-count"/);
    assert.match(memberList, /pendingCount/);
    assert.match(memberList, /@pending-count-change="updatePendingCount"/);
    assert.doesNotMatch(memberList, /el-radio-group|el-radio-button|class="m-filter m-title"/);
    assert.match(userList, /class="m-member-card-grid"/);
    assert.match(userList, /<h2>正式团员<\/h2>/);
    assert.doesNotMatch(userList, /按账号查看成员及其所属角色/);
    assert.match(userList, /per:\s*12/);
    assert.match(memberItem, /class="u-member-card-trigger"/);
    assert.match(memberItem, /@click="roleDialogVisible = true"/);
    assert.match(memberItem, /class="u-role-count"/);
    assert.match(memberItem, /class="m-member-role-dialog"/);
    assert.match(memberItem, /v-model="roleDialogVisible"/);
    assert.match(memberItem, /append-to-body/);
    assert.match(memberItem, /class="u-remove-role"/);
    assert.match(memberItem, /class="u-dialog-member-link"/);
    assert.doesNotMatch(memberItem, />\s*查看账号主页\s*</);
    assert.doesNotMatch(memberItem, /TopRight/);
    assert.doesNotMatch(memberItem, /class="u-member-item-content"/);
    assert.doesNotMatch(memberItem, /height:\s*170px/);
    assert.match(pendingList, /class="m-pending-card-grid"/);
    assert.match(pendingList, /<h2>加入申请<\/h2>/);
    assert.match(pendingList, /class="u-btn u-pass"/);
    assert.match(pendingList, /this\.\$emit\("pending-count-change", this\.total\)/);
    assert.match(pendingList, /this\.\$confirm\("确定拒绝该角色的加入申请/);
    assert.match(pendingList, /confirmButtonText:\s*"确认拒绝"/);
    assert.match(pendingList, /per:\s*12/);
    assert.match(listStyles, /@import \(reference\) "\.\.\/design-system\/_tokens\.less"/);
    assert.match(listStyles, /\.m-member-subnav[\s\S]*background:\s*@team-surface-muted/);
    assert.match(listStyles, /\.u-subnav-count[\s\S]*background:\s*rgba\(239,\s*68,\s*68,\s*0\.1\)/);
    assert.match(listStyles, /\.m-member-card-grid[\s\S]*grid-template-columns:\s*repeat\(auto-fill/);
    assert.match(listStyles, /grid-auto-rows:\s*80px/);
    assert.match(listStyles, /@media screen and \(max-width:\s*620px\)[\s\S]*grid-auto-rows:\s*72px/);
    assert.doesNotMatch(listStyles, /grid-auto-rows:\s*(?:360|400)px/);
    assert.match(listStyles, /\.m-archive-pages\.el-pagination[\s\S]*border-radius:\s*@team-radius-control/);
    assert.match(itemStyles, /\.u-member-item[\s\S]*border-radius:\s*@team-radius-control/);
    assert.match(itemStyles, /background:\s*@team-surface-muted/);
    assert.match(
        itemStyles,
        /\.m-member-role-dialog\.el-dialog[\s\S]*min-height:\s*min\(440px,\s*calc\(100vh - 48px\)\)/
    );
    assert.match(
        itemStyles,
        /\.m-member-role-dialog\.el-dialog[\s\S]*max-height:\s*min\(600px,\s*calc\(100vh - 48px\)\)/
    );
    assert.match(itemStyles, /\.u-dialog-member-link[\s\S]*text-decoration:\s*none/);
    assert.match(itemStyles, /\.el-dialog__body[\s\S]*min-height:\s*0[\s\S]*overflow-y:\s*auto/);
    assert.doesNotMatch(itemStyles, /\.m-member-role-dialog-body\s*\{[\s\S]*?overflow-y:\s*auto/);
});
