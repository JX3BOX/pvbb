import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);

async function loadCommunityHelpers() {
    const source = await readFile(new URL("../src/utils/community.js", import.meta.url), "utf8");
    const executable = source
        .replace(/export\s+const\s+/g, "const ")
        .replace(/export\s+function\s+/g, "function ");

    return Function(`${executable}\nreturn { getCommunityReplyPageByFloor, enableLazyImages };`)();
}

const helpers = await loadCommunityHelpers();

async function loadReplySanitizer() {
    const source = await readFile(new URL("../src/utils/community-rich-text.js", import.meta.url), "utf8");
    const executable = source
        .replace('import sanitizeHtml from "sanitize-html";', "")
        .replace(/export\s+default\s+sanitizeCommunityReplyHtml\s*;?/, "")
        .replace(/export\s+function\s+/g, "function ");

    return Function(
        "sanitizeHtml",
        `${executable}\nreturn sanitizeCommunityReplyHtml;`
    )(require("sanitize-html"));
}

const sanitizeReply = await loadReplySanitizer();

test("community floor links account for the topic occupying the first floor", () => {
    assert.equal(helpers.getCommunityReplyPageByFloor(2, 10), 1);
    assert.equal(helpers.getCommunityReplyPageByFloor(11, 10), 1);
    assert.equal(helpers.getCommunityReplyPageByFloor(12, 10), 2);
    assert.equal(helpers.getCommunityReplyPageByFloor(21, 10), 2);
    assert.equal(helpers.getCommunityReplyPageByFloor(22, 10), 3);
});

test("community rich content normalizes images to native lazy loading", () => {
    assert.equal(
        helpers.enableLazyImages('<p><img src="a.png"><img loading="eager" src="b.png"></p>'),
        '<p><img loading="lazy" src="a.png"><img loading="lazy" src="b.png"></p>'
    );
});

test("community replies use a strict HTML allowlist while preserving mentions and emotions", () => {
    const html = sanitizeReply(`
        <style>.danger { position: fixed }</style>
        <p style="color:red" onclick="alert(1)">safe<script>alert(1)</script></p>
        <iframe src="https://evil.example/embed"></iframe>
        <a class="e-jx3-author w-jx3-element unknown" href="/author/42" target="_blank"
            rel="opener" data-type="author" data-mode="" data-id="42" onmouseover="alert(1)">@侠士</a>
        <a href="javascript:alert(1)">bad</a>
        <img src="https://img.jx3box.com/emotion/output/smile.gif" style="width:999px"
            onerror="alert(1)" alt="#笑" />
    `);

    assert.doesNotMatch(html, /<(?:style|script|iframe)\b/i);
    assert.doesNotMatch(html, /\s(?:style|on\w+)\s*=/i);
    assert.doesNotMatch(html, /javascript:/i);
    assert.match(html, /class="e-jx3-author w-jx3-element"/);
    assert.match(html, /href="\/author\/42"/);
    assert.match(html, /target="_blank"/);
    assert.match(html, /rel="noopener noreferrer"/);
    assert.match(html, /data-type="author"/);
    assert.match(html, /data-id="42"/);
    assert.match(html, /class="u-jx3-emo"/);
    assert.match(html, /loading="lazy"/);
    assert.match(html, /decoding="async"/);
});

test("community detail omits client meta and defers expensive per-floor widgets", async () => {
    const page = await readFile(new URL("../src/views/community/CommunitySingle.vue", import.meta.url), "utf8");
    const header = await readFile(
        new URL("../src/views/community/components/CommunityPostHeader.vue", import.meta.url),
        "utf8"
    );
    const reply = await readFile(new URL("../src/views/community/components/ReplyItem.vue", import.meta.url), "utf8");

    assert.doesNotMatch(header, /pages\.community\.single\.client/);
    assert.match(page, /footerEditorReady/);
    assert.match(page, /getCommentLikes/);
    assert.match(reply, /observeHomeworkBoxcoin/);
    assert.match(reply, /rootMargin: "600px 0px"/);
});

test("community detail header renders decoration_skin with the four image settings", async () => {
    const page = await readFile(new URL("../src/views/community/CommunitySingle.vue", import.meta.url), "utf8");

    assert.match(page, /resolveCommunitySkin\(this\.post\?\.decoration_skin\)/);
    assert.match(page, /config\.position/);
    assert.match(page, /config\.fit/);
    assert.match(page, /config\.opacity/);
    assert.match(page, /config\.fade/);
    assert.match(page, /m-community-header__skin/);
    assert.doesNotMatch(page, /community_skin\.json|community_topic_skin/);
});

test("community detail reloads safely across topic routes and gates restricted discussions", async () => {
    const page = await readFile(new URL("../src/views/community/CommunitySingle.vue", import.meta.url), "utf8");
    const service = await readFile(new URL("../src/service/community.js", import.meta.url), "utf8");
    const reply = await readFile(new URL("../src/views/community/components/ReplyItem.vue", import.meta.url), "utf8");

    assert.match(page, /"\$route\.params\.id"/);
    assert.match(page, /loadTopic\(\)/);
    assert.match(page, /v-if="canViewTopic" class="m-reply-box"/);
    assert.match(page, /v-if="canViewTopic" class="m-community-footer"/);
    assert.match(page, /getTopicPassword/);
    assert.match(service, /function replyTopic\(id, data, params\)/);
    assert.match(service, /function replyReply\(id, replyId, data, params\)/);
    assert.match(reply, /password: this\.getTopicPassword\(\) \|\| undefined/);
});
