import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("community exposes default, reply and publish sort options", async () => {
    const source = await readFile(new URL("../src/views/community/components/ReplyOrderBy.vue", import.meta.url), "utf8");

    assert.match(source, /filter\(['"]default['"]\)/);
    assert.match(source, /filter\(['"]reply['"]\)/);
    assert.match(source, /filter\(['"]publish['"]\)/);
    assert.match(source, /<Edit\s*\/>/);
    assert.match(source, /pages\.community\.sort\.latestUpdate/);
    assert.match(source, /key === "reply" \? 1 : key === "publish" \? 0 : -1/);
});

test("community omits default order and sends explicit reply or publish order", async () => {
    const source = await readFile(new URL("../src/views/community/Community.vue", import.meta.url), "utf8");

    assert.match(source, /order_by_last_reply: -1/);
    assert.match(source, /\[0, 1\]\.includes\(this\.order_by_last_reply\)/);
    assert.match(source, /_query\.order_by_last_reply = this\.order_by_last_reply/);
});

test("community list item displays the timestamp selected by the current order", async () => {
    const page = await readFile(new URL("../src/views/community/Community.vue", import.meta.url), "utf8");
    const item = await readFile(new URL("../src/views/community/components/ListItem.vue", import.meta.url), "utf8");

    assert.match(page, /:order="order_by_last_reply"/);
    assert.match(item, /Number\(this\.order\) === 0/);
    assert.match(item, /Number\(this\.order\) === 1/);
    assert.match(item, /updatedAt >= repliedAt \? "updated" : "replied"/);
});
