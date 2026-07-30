import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
    return readFile(new URL(path, import.meta.url), "utf8");
}

test("battle cards keep combat and linked data columns aligned when ranking data is absent", async () => {
    const [item, styles] = await Promise.all([
        read("../src/views/team/battle/battleItem.vue"),
        read("../src/assets/css/team/battle/battle-item.less"),
    ]);

    assert.match(item, /<div class="u-battle-link">\s*<span>\{\{ \$t\("pages\.team\.battle\.ranking"\) \}\}<\/span>/);
    assert.match(item, /v-if="hasRanking"/);
    assert.match(item, /<em v-else aria-hidden="true">—<\/em>/);
    assert.match(item, /hasRanking\(\)/);
    assert.match(styles, /grid-template-columns:\s*minmax\(320px,\s*1fr\)\s*252px/);
    assert.match(styles, /\.u-battle-links[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
    assert.doesNotMatch(styles, /\.u-battle-data\s*\{[\s\S]*?min-width:\s*max-content/);
});

test("battle relevance dialog uses guided empty states and the team dialog design", async () => {
    const dialog = await read("../src/views/team/battle/relevance.vue");

    assert.match(dialog, /<b>关联战斗数据<\/b>/);
    assert.match(dialog, /\{\{ subjectType \}\}：\{\{ subjectName \}\}/);
    assert.match(dialog, /:remote-method="loadBattle"/);
    assert.match(dialog, /:remote-method="loadJcl"/);
    assert.match(dialog, /normalizeRelationId\(value\)/);
    assert.match(dialog, /return value && value !== "0" \? value : null/);
    assert.match(dialog, /:loading="submitting"/);
    assert.match(dialog, /\.m-rank-relevance-dialog\.el-dialog/);
    assert.match(dialog, /@import \(reference\) "@\/assets\/css\/team\/design-system\/_tokens\.less"/);
});

test("season video management uses the modern workspace, cards, empty state and dialog", async () => {
    const [page, videos, pageStyles, videoStyles] = await Promise.all([
        read("../src/views/team/org/ManageVideo.vue"),
        read("../src/components/team/org/team_videos.vue"),
        read("../src/assets/css/team/org/team_play.less"),
        read("../src/assets/css/team/org/team_videos.less"),
    ]);

    assert.match(page, /class="m-team-play-header"/);
    assert.match(page, /class="m-rank-video-dialog-header"/);
    assert.match(page, /class="u-form-grid"/);
    assert.match(page, /:loading="submitting"/);
    assert.match(page, /return event\?\.boss_map \|\| \[\]/);
    assert.doesNotMatch(page, /location\.reload\(\)/);
    assert.match(videos, /class="m-team-videos-empty"/);
    assert.match(videos, /class="u-card-actions"/);
    assert.match(videos, /rel="noopener noreferrer"/);
    assert.match(pageStyles, /@import \(reference\) "\.\.\/design-system\/_tokens\.less"/);
    assert.match(pageStyles, /\.m-rank-video-dialog\.el-dialog/);
    assert.match(videoStyles, /grid-template-columns:\s*repeat\(auto-fill,\s*minmax\(260px,\s*1fr\)\)/);
    assert.match(videoStyles, /\.m-team-videos-empty/);
});
