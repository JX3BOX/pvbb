import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadCommunityHelpers() {
    const source = await readFile(new URL("../src/utils/community.js", import.meta.url), "utf8");
    const executable = source
        .replace(/export\s+const\s+/g, "const ")
        .replace(/export\s+function\s+/g, "function ");

    return Function(
        `${executable}\nreturn { DEFAULT_COMMUNITY_CLIENT, normalizeCommunityClient, isExplicitCommunityClient };`
    )();
}

const helpers = await loadCommunityHelpers();

test("community defaults missing, all and invalid client values to all", () => {
    assert.equal(helpers.DEFAULT_COMMUNITY_CLIENT, "all");
    assert.equal(helpers.normalizeCommunityClient(), "all");
    assert.equal(helpers.normalizeCommunityClient("all"), "all");
    assert.equal(helpers.normalizeCommunityClient("invalid"), "all");
    assert.equal(helpers.normalizeCommunityClient(["origin"]), "all");
});

test("community keeps explicit std and origin URL filters", () => {
    assert.equal(helpers.normalizeCommunityClient("std"), "std");
    assert.equal(helpers.normalizeCommunityClient("origin"), "origin");
    assert.equal(helpers.isExplicitCommunityClient("std"), true);
    assert.equal(helpers.isExplicitCommunityClient("origin"), true);
    assert.equal(helpers.isExplicitCommunityClient("all"), false);
    assert.equal(helpers.isExplicitCommunityClient("invalid"), false);
});

test("community list uses public clientBy in controlled mode", async () => {
    const source = await readFile(new URL("../src/views/community/Community.vue", import.meta.url), "utf8");

    assert.match(source, /<ClientBy[^>]+:auto-detect="false"/);
    assert.match(source, /@jx3box\/jx3box-ui\/src\/filters\/clientBy\.vue/);
    assert.doesNotMatch(source, /CommunityClientFilter/);
});
