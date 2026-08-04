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
