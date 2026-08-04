import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("qqbot bootstrap avoids duplicate plugin and component registration", async () => {
    const source = await read("../src/pages/qqbot/index.js");

    assert.equal(source.match(/app\.use\(VueSvgInlinePlugin/g)?.length, 1);
    assert.match(source, /if \(!app\.component\(key\)\) app\.component\(key, component\)/);
});

test("qqbot shell uses real class names and stays within narrow viewports", async () => {
    const [layout, pin] = await Promise.all([
        read("../src/layouts/QQBotLayout.vue"),
        read("../src/views/qqbot/components/Pin.vue"),
    ]);

    assert.doesNotMatch(layout, /min-width:\s*1420px/);
    assert.match(layout, /\.p-qqbot\.onlyTable[\s\S]*\.u-girl/);
    assert.match(layout, /\.m-create-team[\s\S]*\.m-content/);
    assert.match(layout, /@media screen and \(max-width:\s*900px\)/);
    assert.match(pin, /max-width:\s*\d+px[\s\S]*\.m-join[\s\S]*display:\s*none/);
});

test("team gate does not mount protected routes before binding is known", async () => {
    const source = await read("../src/views/qqbot/Team.vue");

    assert.match(source, /checking:\s*User\.isLogin\(\)/);
    assert.match(source, /hasBind:\s*null/);
    assert.match(source, /if \(this\.isLogin\) this\.check\(\)/);
    assert.match(source, /v-else-if="checking"/);
    assert.match(source, /overflow-x:\s*auto/);
});

test("pvp detail follows id changes and finishes ready on empty or failed data", async () => {
    const source = await read("../src/views/qqbot/Pvp.vue");

    assert.match(source, /v-if="post\.include_video"/);
    assert.match(source, /post\?\.author_info\?\.is_super_author/);
    assert.match(source, /class="m-desc" v-if="item\.desc"/);
    assert.match(source, /watch:[\s\S]*id:[\s\S]*immediate:\s*true/);
    assert.match(source, /if \(this\.visible\) await this\.installTalent\(requestId\)/);
    assert.match(source, /if \(requestId !== this\.loadRequestId\) return;[\s\S]*this\.setGlobalReady\(requestId\)/);
    assert.match(source, /finally[\s\S]*setQQBotDataReady\(true\)[\s\S]*initImageLoader\(requestId\)/);
});

test("treasure mode changes reload data and empty states finish ready", async () => {
    const source = await read("../src/views/qqbot/components/pvx/Treasure.vue");

    assert.match(source, /mode:\s*this\.isLandscape \? "landscape" : "portrait"/);
    assert.match(source, /const requestId = \+\+this\.loadRequestId/);
    assert.match(source, /\(params\.role \|\| params\.server\) && !\(params\.role && params\.server\)/);
    assert.match(source, /splitArrayIntoChunks\(\[\.\.\.\(data\.pet \|\| \[\]\)\], 5\)/);
    assert.match(source, /finally[\s\S]*finishWithoutContent\(requestId\)/);
});

test("baizhan preserves its update time and always resolves ready", async () => {
    const source = await read("../src/views/qqbot/components/Baizhan.vue");

    assert.match(source, /updatedAt\.clone\(\)\.startOf/);
    assert.match(source, /updatedAt\.clone\(\)\.endOf/);
    assert.match(source, /catch \(error\)[\s\S]*finally[\s\S]*setQQBotDataReady\(true\)/);
    assert.match(source, /initImageLoader\(requestId\)[\s\S]*requestId !== this\.loadRequestId/);
});

test("raid drop handlers fire once and the public detail is read-only", async () => {
    const [detail, publicDetail, card, switchSource, list] = await Promise.all([
        read("../src/views/qqbot/components/RaidDetail.vue"),
        read("../src/views/qqbot/components/RaidDetailNoAuth.vue"),
        read("../src/views/qqbot/components/Card.vue"),
        read("../src/views/qqbot/components/StatusSwitch.vue"),
        read("../src/views/qqbot/components/RaidList.vue"),
    ]);

    assert.match(detail, /@drop\.stop="drop\('altetnateList'\)"/);
    assert.match(detail, /@drop\.stop="drop\('queueList'\)"/);
    assert.match(detail, /return true;[\s\S]*return false;/);
    assert.match(detail, /const dragItem = this\.dragItem/);
    assert.match(detail, /const raidId = this\.\$route\.query\.id/);
    assert.match(detail, /setMemberPosition\(raidId/);
    assert.match(detail, /isCurrentRaid\(raidId\)/);
    assert.match(detail, /await this\.getRaidDetail\(raidId\)/);
    assert.match(publicDetail, /name:\s*"RaidDetailNoAuth"/);
    assert.match(publicDetail, /<Card[^>]*readonly/);
    assert.doesNotMatch(publicDetail, /updateMemberStatus|setMemberPosition|switchPosition|clearList/);
    assert.match(card, /if \(!this\.readonly\) this\.dialogVisible = true/);
    assert.match(switchSource, /isEnd\(\)[\s\S]*return this\.status !== 1/);
    assert.doesNotMatch(switchSource, /this\.isEnd = !this\.isEnd/);
    assert.match(list, /statusUpdating/);
    assert.match(list, /if \(item\) item\.status = nextStatus/);
});

test("trial output is escaped and its typewriter timer is cancellable", async () => {
    const source = await read("../src/views/qqbot/components/Trial.vue");

    assert.match(source, /<pre class="m-trial-response" v-if="response">\{\{ text \}\}<\/pre>/);
    assert.doesNotMatch(source, /v-html="text"/);
    assert.match(source, /if \(this\.loading \|\| !this\.command\.trim\(\)\) return/);
    assert.match(source, /beforeUnmount\(\)[\s\S]*this\.clearTextTimer\(\)/);
});

test("unsupported qqbot targets also complete the screenshot ready contract", async () => {
    const [pve, wiki, missing] = await Promise.all([
        read("../src/views/qqbot/Pve.vue"),
        read("../src/views/qqbot/components/wiki/Detail.vue"),
        read("../src/views/qqbot/components/pvx/MissingContent.vue"),
    ]);

    for (const source of [pve, wiki, missing]) {
        assert.match(source, /resetQQBotReady\(\)/);
        assert.match(source, /setQQBotDataReady\(true\)/);
        assert.match(source, /markQQBotReady/);
    }
});
