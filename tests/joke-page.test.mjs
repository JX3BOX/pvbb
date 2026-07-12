import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function loadJokeHelpers() {
    const source = await readFile(new URL("../src/utils/joke.js", import.meta.url), "utf8");
    const executable = source.replace(/export\s+function\s+/g, "function ");

    return Function(`${executable}\nreturn { isJokeListHistoryEntry, buildJokeDocumentTitle };`)();
}

async function loadListQueryHelpers() {
    const source = await readFile(new URL("../src/utils/listQuery.js", import.meta.url), "utf8");
    const executable = source.replace(/export\s+function\s+/g, "function ");

    return Function(
        `${executable}\nreturn { normalizePositiveInteger, getPaginationFromQuery, shouldReplacePaginationQuery, isSameRouteQuery };`
    )();
}

const helpers = await loadJokeHelpers();
const listQueryHelpers = await loadListQueryHelpers();

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
    const [listSource, singleSource, shellSource] = await Promise.all([
        readFile(new URL("../src/views/Joke/JokeList.vue", import.meta.url), "utf8"),
        readFile(new URL("../src/views/Joke/JokeSingle.vue", import.meta.url), "utf8"),
        readFile(new URL("../src/views/Joke/Joke.vue", import.meta.url), "utf8"),
    ]);

    assert.match(singleSource, /<template v-if="joke\?\.id">/);
    assert.match(singleSource, /v-else-if="singleError"/);
    assert.match(listSource, /Promise\.allSettled/);
    assert.match(listSource, /@click="starSelectedJokes"/);
    assert.match(listSource, /if \(this\.type && this\.type !== "all"\) query\.type = this\.type/);
    assert.match(listSource, /if \(this\.search\) query\.search = this\.search/);
    assert.match(shellSource, /<JokeSingle v-if="id"/);
    assert.match(shellSource, /<JokeList v-else/);
    assert.doesNotMatch(`${listSource}\n${singleSource}`, /TODO:\s*实装/);
});

test("shared list query helpers normalize pagination without mutating route state", () => {
    assert.deepEqual(listQueryHelpers.getPaginationFromQuery({ page: "2", per: "30" }, 10), { page: 2, per: 30 });
    assert.deepEqual(listQueryHelpers.getPaginationFromQuery({ page: "0", per: "bad" }, 50), { page: 1, per: 50 });
    assert.equal(listQueryHelpers.shouldReplacePaginationQuery({ page: "2" }, 1, 10), true);
    assert.equal(listQueryHelpers.shouldReplacePaginationQuery({}, 1, 10), false);
    assert.equal(listQueryHelpers.isSameRouteQuery({ page: "1", per: "10" }, { per: 10, page: 1 }), true);
});

test("joke item restores copy state and the hidden emotion picker stays unmounted", async () => {
    const [itemSource, emotionSource] = await Promise.all([
        readFile(new URL("../src/components/joke/joke_item.vue", import.meta.url), "utf8"),
        readFile(new URL("../src/components/joke/joke_emotion.vue", import.meta.url), "utf8"),
    ]);

    assert.match(itemSource, /\{\{ copyLabel \}\}/);
    assert.match(itemSource, /catch \(_\)/);
    assert.match(itemSource, /this\.disabled = false/);
    assert.match(itemSource, /query: this\.\$route\.query/);
    assert.match(emotionSource, /:persistent="false"/);
    assert.match(emotionSource, /trigger="click"/);
});

test("list layout remounts route-derived public links when path changes", async () => {
    const source = await readFile(new URL("../src/layouts/ListLayout.vue", import.meta.url), "utf8");

    assert.match(source, /<CommonHeader :key="\$route\.path"/);
    assert.match(source, /<Breadcrumb\s+:key="\$route\.path"/);
});
