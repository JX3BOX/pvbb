import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadRandomCoverHelpers() {
    const source = await readFile(new URL("../src/utils/random-cover.js", import.meta.url), "utf8");
    const executable = source
        .replace(/export\s+const\s+/g, "const ")
        .replace(/export\s+function\s+/g, "function ");

    return Function(
        `${executable}\nreturn { DEFAULT_RANDOM_COVER_MAX, normalizeRandomCoverMax, assignUniqueRandomCovers, getRandomCoverIndex };`
    )();
}

const helpers = await loadRandomCoverHelpers();

test("random cover max never falls below 49", () => {
    assert.equal(helpers.normalizeRandomCoverMax("49"), 49);
    assert.equal(helpers.normalizeRandomCoverMax(80), 80);
    assert.equal(helpers.normalizeRandomCoverMax(20), 49);
    assert.equal(helpers.normalizeRandomCoverMax(0), 49);
    assert.equal(helpers.normalizeRandomCoverMax("invalid"), 49);
    assert.equal(helpers.normalizeRandomCoverMax(80.5), 49);
});

test("all articles without banners in one response receive unique covers", () => {
    const responsePage = Array.from({ length: 49 }, (_, id) => ({ id }));
    responsePage[2].banner_img = "https://cdn.jx3box.com/upload/post/banner.jpg";

    const result = helpers.assignUniqueRandomCovers(responsePage, 49, () => 0);
    const indices = result.filter((item) => !item.banner_img).map((item) => item._random_cover_index);

    assert.equal(new Set(indices).size, indices.length);
    assert.ok(indices.every((index) => index >= 1 && index <= 49));
    assert.equal(result[2]._random_cover_index, undefined);
});

test("a larger CDN max extends the available random cover range", () => {
    const responsePage = Array.from({ length: 60 }, (_, id) => ({ id }));
    const result = helpers.assignUniqueRandomCovers(responsePage, "80", () => 0);
    const indices = result.map((item) => item._random_cover_index);

    assert.equal(new Set(indices).size, responsePage.length);
    assert.ok(indices.every((index) => index >= 1 && index <= 80));
    assert.ok(indices.some((index) => index > 49));
});

test("separate page responses use separate pools and may repeat covers", () => {
    const pageOne = helpers.assignUniqueRandomCovers([{ id: 1 }], 49, () => 0);
    const pageTwo = helpers.assignUniqueRandomCovers([{ id: 2 }], 49, () => 0);

    assert.equal(pageOne[0]._random_cover_index, pageTwo[0]._random_cover_index);
});

test("renderers prefer the cover assigned for the current response", () => {
    assert.equal(helpers.getRandomCoverIndex({ id: 1, _random_cover_index: 73 }), 73);
    assert.ok(helpers.getRandomCoverIndex({ id: 1 }) >= 1);
    assert.ok(helpers.getRandomCoverIndex({ id: 1 }) <= 49);
});
