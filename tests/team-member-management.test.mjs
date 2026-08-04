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
    assert.match(memberList, /\{ label: this\.\$t\("team\.member\.officialMembers"\), value: "user" \}/);
    assert.match(memberList, /\{ label: this\.\$t\("team\.member\.joinRequests"\), value: "pending" \}/);
    assert.match(memberList, /class="u-subnav-count"/);
    assert.match(memberList, /pendingCount/);
    assert.match(memberList, /@pending-count-change="updatePendingCount"/);
    assert.doesNotMatch(memberList, /el-radio-group|el-radio-button|class="m-filter m-title"/);
    assert.match(userList, /class="m-member-card-grid"/);
    assert.match(userList, /team\.member\.officialMembers/);
    assert.doesNotMatch(userList, /team\.member\.memberHint/);
    assert.doesNotMatch(userList, /v-loading/);
    assert.match(userList, /v-if="loading"/);
    assert.match(userList, /class="m-member-card-grid m-member-skeleton-grid"/);
    assert.match(userList, /v-for="index in per"/);
    assert.match(userList, /class="u-member-skeleton"/);
    assert.match(userList, /per:\s*20/);
    assert.match(memberItem, /class="u-member-card-trigger"/);
    assert.match(memberItem, /@click="roleDialogVisible = true"/);
    assert.match(memberItem, /class="u-role-count"/);
    assert.match(memberItem, /class="m-member-role-dialog"/);
    assert.match(memberItem, /v-model="roleDialogVisible"/);
    assert.match(memberItem, /append-to-body/);
    assert.match(memberItem, /class="u-remove-role"/);
    assert.match(memberItem, /class="u-dialog-member-link"/);
    assert.match(memberItem, /team\.memberDialog\.viewProfile/);
    assert.doesNotMatch(memberItem, /TopRight/);
    assert.doesNotMatch(memberItem, /class="u-member-item-content"/);
    assert.doesNotMatch(memberItem, /height:\s*170px/);
    assert.match(pendingList, /class="m-pending-card-grid"/);
    assert.match(pendingList, /team\.member\.joinRequests/);
    assert.doesNotMatch(pendingList, /v-loading/);
    assert.match(pendingList, /class="m-pending-card-grid m-pending-skeleton-grid"/);
    assert.match(pendingList, /v-for="index in per"/);
    assert.match(pendingList, /class="u-pending-skeleton"/);
    assert.match(pendingList, /class="u-btn u-pass"/);
    assert.match(pendingList, /this\.\$emit\("pending-count-change", this\.total\)/);
    assert.match(pendingList, /@click="checkRole\(item\.relation\.role_id\)"/);
    assert.match(pendingList, /@click="rejectRole\(item\.relation\.role_id\)"/);
    assert.match(pendingList, /const teamId = this\.team_id/);
    assert.match(pendingList, /checkRole\(teamId, role_id\)/);
    assert.match(pendingList, /deleteRole\(teamId, role_id\)/);
    assert.match(pendingList, /String\(this\.team_id\) !== String\(teamId\)/);
    assert.match(pendingList, /findIndex\(\(item\) => item\.relation\.role_id === role_id\)/);
    assert.doesNotMatch(pendingList, /checkRole\(item\.relation\.team_id/);
    assert.doesNotMatch(pendingList, /deleteRole\(this\.team_id, role_id\)/);
    assert.match(pendingList, /this\.\$confirm\(this\.\$t\("team\.member\.rejectConfirm"\)/);
    assert.match(pendingList, /confirmButtonText:\s*this\.\$t\("team\.member\.confirmReject"\)/);
    assert.match(pendingList, /per:\s*12/);
    assert.match(listStyles, /@import \(reference\) "\.\.\/design-system\/_tokens\.less"/);
    assert.match(listStyles, /\.m-member-subnav[\s\S]*background:\s*@team-surface-muted/);
    assert.match(listStyles, /\.u-subnav-count[\s\S]*background:\s*rgba\(239,\s*68,\s*68,\s*0\.1\)/);
    assert.match(listStyles, /\.m-member-card-grid[\s\S]*grid-template-columns:\s*repeat\(auto-fill/);
    assert.match(listStyles, /grid-auto-rows:\s*80px/);
    assert.match(listStyles, /\.u-member-total-skeleton\.el-skeleton__item/);
    assert.match(listStyles, /\.u-member-skeleton[\s\S]*height:\s*100%/);
    assert.match(listStyles, /\.u-skeleton-avatar\.el-skeleton__item[\s\S]*width:\s*46px/);
    assert.match(listStyles, /\.u-pending-skeleton[\s\S]*grid-template-columns:\s*60px minmax\(0,\s*1fr\)/);
    assert.match(listStyles, /\.u-skeleton-actions[\s\S]*grid-column:\s*1 \/ -1/);
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
