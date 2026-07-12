import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadJokeHelpers() {
    const source = await readFile(new URL("../src/utils/joke.js", import.meta.url), "utf8");
    const executable = source.replace(/export\s+function\s+/g, "function ");

    return Function(`${executable}\nreturn { isJokeListHistoryEntry, buildJokeDocumentTitle };`)();
}

const helpers = await loadJokeHelpers();

test("joke detail only returns through a joke list history entry", () => {
    assert.equal(helpers.isJokeListHistoryEntry("/joke"), true);
    assert.equal(helpers.isJokeListHistoryEntry("/joke?page=2&per=10"), true);
    assert.equal(helpers.isJokeListHistoryEntry("/joke#latest"), true);
    assert.equal(helpers.isJokeListHistoryEntry("/joke/86898"), false);
    assert.equal(helpers.isJokeListHistoryEntry("/community"), false);
    assert.equal(helpers.isJokeListHistoryEntry(), false);
});

test("joke detail title is plain, bounded and keeps the site suffix", () => {
    assert.equal(
        helpers.buildJokeDocumentTitle("<b>第一条</b>   骚话", "- 剑网3魔盒（JX3BOX）"),
        "第一条 骚话 - 剑网3魔盒（JX3BOX）"
    );
    assert.equal(helpers.buildJokeDocumentTitle("123456", "- JX3BOX", 4), "1234… - JX3BOX");
    assert.equal(helpers.buildJokeDocumentTitle("", "- JX3BOX"), "- JX3BOX");
});

test("joke page gates detail widgets behind loaded data and implements batch starring", async () => {
    const source = await readFile(new URL("../src/views/Joke/Joke.vue", import.meta.url), "utf8");

    assert.match(source, /<template v-if="joke\?\.id">/);
    assert.match(source, /v-else-if="singleError"/);
    assert.match(source, /Promise\.allSettled/);
    assert.match(source, /@click="starSelectedJokes"/);
    assert.doesNotMatch(source, /TODO:\s*实装/);
});

test("joke item restores copy state and the hidden emotion picker stays unmounted", async () => {
    const [itemSource, emotionSource] = await Promise.all([
        readFile(new URL("../src/components/joke/joke_item.vue", import.meta.url), "utf8"),
        readFile(new URL("../src/components/joke/joke_emotion.vue", import.meta.url), "utf8"),
    ]);

    assert.match(itemSource, /\{\{ copyLabel \}\}/);
    assert.match(itemSource, /catch \(_\)/);
    assert.match(itemSource, /this\.disabled = false/);
    assert.match(emotionSource, /:persistent="false"/);
    assert.match(emotionSource, /trigger="click"/);
});

test("list layout remounts route-derived public links when path changes", async () => {
    const source = await readFile(new URL("../src/layouts/ListLayout.vue", import.meta.url), "utf8");

    assert.match(source, /<CommonHeader :key="\$route\.path"/);
    assert.match(source, /<Breadcrumb\s+:key="\$route\.path"/);
});
