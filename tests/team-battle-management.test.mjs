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
    assert.match(
        styles,
        /grid-template-columns:\s*minmax\(320px,\s*1fr\)\s*minmax\(280px,\s*0\.8fr\)/,
    );
    assert.match(styles, /\.u-battle-links[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
    assert.match(styles, /\.u-battle-link[\s\S]*background:\s*@team-surface/);
    assert.match(styles, /\.u-battle-fields[\s\S]*?dt \{[\s\S]*?font-weight:\s*500/);
    assert.match(styles, /\.u-battle-fields[\s\S]*?dd \{[\s\S]*?font-weight:\s*500/);
    assert.match(styles, /\.u-battle-link[\s\S]*?> span \{[\s\S]*?font-size:\s*12px/);
    assert.match(styles, /\.u-battle-link[\s\S]*?> span \{[\s\S]*?font-weight:\s*500/);
    assert.match(styles, /\.u-battle-link[\s\S]*?em,[\s\S]*?\.u-link \{[\s\S]*?font-size:\s*13px/);
    assert.match(styles, /\.u-battle-link[\s\S]*?em,[\s\S]*?\.u-link \{[\s\S]*?font-weight:\s*500/);
    assert.match(styles, /\.u-battle-fields[\s\S]*?> div \{[\s\S]*?height:\s*50px/);
    assert.match(styles, /\.u-battle-link[\s\S]*?height:\s*50px/);
    assert.match(styles, /\.u-team-op \{[\s\S]*?align-items:\s*center;[\s\S]*?padding-top:\s*12px/);
    assert.match(styles, /@media screen and \(max-width: 1240px\)[\s\S]*?\.u-team-op \{[\s\S]*?padding-top:\s*0/);
    assert.doesNotMatch(styles, /\.u-battle-data\s*\{[\s\S]*?min-width:\s*max-content/);
    assert.match(styles, /\.u-battle-meta[\s\S]*?dd \{[\s\S]*?font-weight:\s*400/);
    assert.match(styles, /\.u-battle-meta[\s\S]*?dd \{[\s\S]*?color:\s*@team-text-secondary/);
});

test("battle relevance dialog uses guided empty states and the team dialog design", async () => {
    const dialog = await read("../src/views/team/battle/relevance.vue");

    assert.match(dialog, /pages\.team\.battle\.linkDialog/);
    assert.match(dialog, /\{\{ subjectType \}\}：\{\{ subjectName \}\}/);
    assert.match(dialog, /:remote-method="loadBattle"/);
    assert.match(dialog, /:remote-method="loadJcl"/);
    assert.match(dialog, /normalizeRelationId\(value\)/);
    assert.match(dialog, /return value && value !== "0" \? value : null/);
    assert.match(dialog, /:loading="submitting"/);
    assert.match(dialog, /\.m-rank-relevance-dialog\.el-dialog/);
    assert.match(dialog, /@import \(reference\) "@\/assets\/css\/team\/design-system\/_tokens\.less"/);
});

test("personal battle records include both leaders and regular members", async () => {
    const page = await read("../src/views/team/battle/myBattle.vue");

    assert.match(page, /team_id:\s*this\.teamId/);
    assert.doesNotMatch(page, /is_leader/);
    assert.match(page, /personal-ranking/);
    assert.match(page, /changePage:\s*function \(page\) \{[\s\S]*?this\.page = page/);
});

test("personal battle ranking links target the DPS ladder for the record mount", async () => {
    const item = await read("../src/views/team/battle/battleItem.vue");

    assert.match(item, /personalRanking/);
    assert.match(item, /`\/rank\/#\/\$\{rankId\}\/dps\?mount=\$\{this\.mountId\}`/);
    assert.match(item, /\.find\(\(item\) => item\.Name === role\)/);
});

test("personal battle records can hide non-ranking records without removing pagination", async () => {
    const page = await read("../src/views/team/battle/myBattle.vue");

    assert.match(page, /v-model="filterRanking" :active-text="\$t\('pages\.team\.battle\.activityOnly'\)"/);
    assert.match(page, /m-battle-notice--filter"[^>]*:closable="false"/);
    assert.match(page, /v-for="item in displayList"/);
    assert.match(
        page,
        /item\.boss_info\?\.is_rank_boss > 0 \|\| Boolean\(item\.aid_info\?\.event_id\)/,
    );
    assert.match(page, /v-if="list\.length"[\s\S]*?class="m-archive-pages"/);
    assert.match(page, /const RANKING_FILTER_STORAGE_KEY = "team:my-battle:ranking-only"/);
    assert.match(page, /filterRanking: localStorage\.getItem\(RANKING_FILTER_STORAGE_KEY\) === "1"/);
    assert.match(page, /localStorage\.setItem\(RANKING_FILTER_STORAGE_KEY, value \? "1" : "0"\)/);
    assert.match(page, /pages\.team\.battle\.mySource/);
});

test("team battle management exposes the same persisted activity filter", async () => {
    const page = await read("../src/views/team/battle/index.vue");

    assert.match(page, /v-model="filterRanking" :active-text="\$t\('pages\.team\.battle\.activityOnly'\)"/);
    assert.match(page, /m-battle-notice--filter"[^>]*:closable="false"/);
    assert.match(page, /v-for="\(item, i\) in displayList"/);
    assert.match(page, /item\.boss_info\?\.is_rank_boss > 0 \|\| Boolean\(item\.aid_info\?\.event_id\)/);
    assert.match(page, /localStorage\.getItem\(RANKING_FILTER_STORAGE_KEY\) === "1"/);
    assert.match(page, /localStorage\.setItem\(RANKING_FILTER_STORAGE_KEY, value \? "1" : "0"\)/);
    assert.match(page, /pages\.team\.battle\.teamSource/);
});

test("battle notices link to the report guide in a new tab", async () => {
    const [personalPage, managementPage] = await Promise.all([
        read("../src/views/team/battle/myBattle.vue"),
        read("../src/views/team/battle/index.vue"),
    ]);

    for (const page of [personalPage, managementPage]) {
        assert.match(page, /class="u-notice-meta"/);
        assert.match(page, /class="u-battle-guide" href="\/tool\/109317" target="_blank" rel="noopener noreferrer"/);
        assert.match(page, /pages\.team\.battle\.reportGuide/);
    }
});

test("battle notice keeps its copy and activity filter in a compact responsive toolbar", async () => {
    const styles = await read("../src/assets/css/team/battle/index.less");

    assert.match(styles, /\.m-battle-notice__content[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto/);
    assert.match(styles, /\.u-notice-meta[\s\S]*?display:\s*flex[\s\S]*?flex-wrap:\s*wrap/);
    assert.match(styles, /max-width:\s*480px[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/);
    assert.doesNotMatch(styles, /\.m-battle-notice__content\s*\{[\s\S]{0,120}flex-direction:\s*column/);
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
