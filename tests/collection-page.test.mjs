import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
    return readFile(new URL(path, import.meta.url), "utf8");
}

async function loadCollectionHelpers() {
    const source = await read("../src/utils/collection.js");
    const executable = source.replace(/export\s+function\s+/g, "function ");
    return Function(`${executable}\nreturn { getCollectionLoadError };`)();
}

test("collection errors distinguish missing content from request failures", async () => {
    const { getCollectionLoadError } = await loadCollectionHelpers();

    assert.equal(getCollectionLoadError({ data: { code: 59101 } }), "not-found");
    assert.equal(getCollectionLoadError({ response: { data: { code: 59101 } } }), "not-found");
    assert.equal(getCollectionLoadError(new Error("network failed")), "load-failed");
});

test("collection list loads once after sizing and ignores stale responses", async () => {
    const source = await read("../src/components/collection/collection_list.vue");

    assert.match(source, /watch:\s*\{\s*page:/);
    assert.doesNotMatch(source, /immediate:\s*true/);
    assert.match(source, /mounted\(\)\s*\{\s*this\.showCount\(\);\s*this\.loadData\(\);/);
    assert.match(source, /const requestId = \+\+this\.requestId/);
    assert.match(source, /if \(requestId !== this\.requestId\) return/);
    assert.match(source, /小册列表加载失败，请稍后重试/);
});

test("collection detail gates content by loading result and cleans the bus listener", async () => {
    const [desktop, mini] = await Promise.all([
        read("../src/components/collection/collection_single.vue"),
        read("../src/components/collection/collection_mini_single.vue"),
    ]);

    for (const source of [desktop, mini]) {
        assert.match(source, /v-loading="loading"/);
        assert.match(source, /v-if="loadError"/);
        assert.match(source, /v-else-if="collection"/);
        assert.match(source, /getCollectionLoadError\(error\)/);
        assert.match(source, /beforeUnmount\(\)/);
        assert.match(source, /Bus\.\$off\("updateCollection", this\.updateCollectionHandler\)/);
    }
});

test("collection shares one stat request between its header and like control", async () => {
    const [single, thx, like] = await Promise.all([
        read("../src/components/collection/collection_single.vue"),
        read("../src/components/collection/collection_thx.vue"),
        read("../src/components/collection/collection_like.vue"),
    ]);

    assert.match(single, /<CollectionThx/);
    assert.match(single, /@stat-loaded="updateStat"/);
    assert.doesNotMatch(single, /\bgetStat\b/);
    assert.match(thx, /Like:\s*CollectionLike/);
    assert.match(like, /onCollectionStatLoaded\?\.\(res\.data\)/);
});

test("collection skips hidden side content and empty image nodes", async () => {
    const [layout, item] = await Promise.all([
        read("../src/layouts/CollectionLayout.vue"),
        read("../src/components/collection/collection_item_v2.vue"),
    ]);

    assert.match(layout, /<RightSidebar v-if="hasRight">/);
    assert.doesNotMatch(item, /<img\s*\/>/);
});
