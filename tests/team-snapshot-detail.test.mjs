import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("related snapshots dialog uses the Vue 3 v-model contract", async () => {
    const detail = await readFile(
        new URL("../src/components/team/snapshot/snapshotDetail.vue", import.meta.url),
        "utf8"
    );

    assert.match(detail, /modelValue:\s*\{/);
    assert.match(detail, /emits:\s*\["update:modelValue"\]/);
    assert.match(detail, /this\.\$emit\("update:modelValue", value\)/);
    assert.match(detail, /v-for="\(item, index\) in pagedSnapshotList"/);
    assert.match(detail, /class="m-snapshot-detail__summary"/);
    assert.match(detail, /class="u-view-team" plain icon="Camera" @click="openRoster\(item\)">\{\{ \$t\("team\.snapshotEdit\.viewRoster"\) \}\}/);
    assert.match(detail, /v-model:current-page="currentPage"/);
    assert.match(detail, /snapshotList\.slice\(start, start \+ this\.pageSize\)/);
    assert.match(detail, /class="m-snapshot-roster-dialog"/);
    assert.match(detail, /<div class="m-snapshot-flags">/);
    assert.match(detail, /v-for="group of 5"[^>]*>\{\{ \$t\("team\.snapshotEdit\.group", \{ group \}\) \}\}/);
    assert.match(detail, /<snapshot-body :data="currentRoster" class="row-5"/);
    assert.doesNotMatch(detail, /currentGroups/);
    assert.doesNotMatch(detail, /<el-popover/);
    assert.doesNotMatch(detail, /props:\s*\["value"/);
    assert.doesNotMatch(detail, /this\.\$emit\("input"/);
});

test("snapshot supplement mount selector shows mount icons", async () => {
    const dialog = await readFile(
        new URL("../src/components/team/snapshot/EditSnapshotDialog.vue", import.meta.url),
        "utf8"
    );

    assert.match(dialog, /popper-class="m-snapshot-xf-select"/);
    assert.match(dialog, /class="u-selected-xf-icon"[\s\S]*?:src="showMountIcon\(roleForm\.xf\)"/);
    assert.match(dialog, /class="m-snapshot-xf-option"[\s\S]*?:src="showMountIcon\(item\.id\)"/);
});

test("snapshot supplement dialog becomes a scrollable full-screen mobile editor", async () => {
    const dialog = await readFile(
        new URL("../src/components/team/snapshot/EditSnapshotDialog.vue", import.meta.url),
        "utf8"
    );

    assert.match(dialog, /@media screen and \(max-width: 620px\)[\s\S]*?\.m-snapshot-edit-dialog\.el-dialog/);
    assert.match(dialog, /\.m-snapshot-edit-dialog\.el-dialog\s*\{[\s\S]*?width:\s*100% !important;[\s\S]*?height:\s*100dvh;[\s\S]*?margin:\s*0 !important;[\s\S]*?border-radius:\s*0/);
    assert.match(dialog, /\.el-dialog__body\s*\{[\s\S]*?flex:\s*1;[\s\S]*?overflow-y:\s*auto;[\s\S]*?overscroll-behavior:\s*contain/);
    assert.match(dialog, /\.el-dialog__footer\s*\{[\s\S]*?env\(safe-area-inset-bottom\)[\s\S]*?background:\s*@team-surface/);
    assert.match(dialog, /\.m-snapshot-edit__footer\s*\{[\s\S]*?\.el-button\s*\{[\s\S]*?flex:\s*1/);
});

test("snapshot title identifies the in-game uploader by jx3id", async () => {
    const item = await readFile(
        new URL("../src/components/team/snapshot/snapshotItem.vue", import.meta.url),
        "utf8"
    );

    assert.match(item, /if \(!this\.data\.cguid\) return this\.\$t\("team\.snapshot\.manualAdd"\)/);
    assert.match(item, /this\.list\.find\(\(item\) => String\(item\.jx3id\) === String\(this\.data\.jx3id\)\)/);
    assert.match(item, /name: uploader\?\.name \|\| this\.\$t\("team\.snapshot\.unknown"\)/);
    assert.doesNotMatch(item, /name: this\.data\.user_data\?\.display_name/);
});
