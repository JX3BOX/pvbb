import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(path) {
    return readFile(new URL(path, import.meta.url), "utf8");
}

test("the deprecated standalone team battle page redirects home and has no navigation entry", async () => {
    const [router, legacyNav, workspace] = await Promise.all([
        read("../src/pages/team/router.js"),
        read("../src/components/team/widget/Nav.vue"),
        read("../src/views/team/org/ViewMyOrg.vue"),
    ]);

    assert.doesNotMatch(router, /const Battle\s*=\s*\(\)\s*=>/);
    assert.match(router, /path:\s*["']\/battle["'][\s\S]*?redirect:\s*["']\/["']/);
    assert.doesNotMatch(router, /name:\s*["']Battle["']/);
    assert.doesNotMatch(legacyNav, /to=["']\/battle["']/);
    assert.match(workspace, /<ManageBattle[^>]*:team-id="id"/);
});

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
        /\.u-battle-content[\s\S]*?grid-template-columns:\s*minmax\(0,\s*720px\)\s*minmax\(0,\s*660px\)/,
    );
    assert.match(styles, /\.u-battle-links[\s\S]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
    assert.match(styles, /\.u-battle-link[\s\S]*background:\s*@team-surface-muted/);
    assert.match(styles, /\.u-battle-fields[\s\S]*?dt \{[\s\S]*?font-weight:\s*400/);
    assert.match(styles, /\.u-battle-fields[\s\S]*?dd \{[\s\S]*?font-weight:\s*500/);
    assert.match(styles, /\.u-battle-link[\s\S]*?> span \{[\s\S]*?font-size:\s*12px/);
    assert.match(styles, /\.u-battle-link[\s\S]*?> span \{[\s\S]*?font-weight:\s*400/);
    assert.match(styles, /\.u-battle-link[\s\S]*?em,[\s\S]*?\.u-link \{[\s\S]*?font-size:\s*12px/);
    assert.match(styles, /\.u-battle-link[\s\S]*?em,[\s\S]*?\.u-link \{[\s\S]*?font-weight:\s*500/);
    assert.match(styles, /\.u-battle-fields[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
    assert.match(styles, /\.u-battle-fields[\s\S]*?> div \{[\s\S]*?height:\s*54px/);
    assert.match(styles, /\.u-battle-fields[\s\S]*?> div \{[\s\S]*?border:\s*1px solid @team-border-light/);
    assert.match(styles, /\.u-battle-link[\s\S]*?height:\s*54px/);
    assert.match(styles, /grid-template-areas:\s*"summary action"\s*"content content"/);
    assert.doesNotMatch(styles, /\.u-battle-data\s*\{[\s\S]*?min-width:\s*max-content/);
    assert.doesNotMatch(item, /class="u-battle-meta"/);
    assert.doesNotMatch(item, /pages\.team\.battle\.team/);
    assert.doesNotMatch(item, /pages\.team\.battle\.leader/);
});

test("battle cards show achievement metadata instead of an unknown boss when aid info is absent", async () => {
    const [item, service, managementPage, personalPage] = await Promise.all([
        read("../src/views/team/battle/battleItem.vue"),
        read("../src/service/team/battle.js"),
        read("../src/views/team/battle/index.vue"),
        read("../src/views/team/battle/myBattle.vue"),
    ]);

    assert.match(item, /hasAidInfo \? \$t\("pages\.team\.battle\.boss"\) : \$t\("pages\.team\.battle\.achievementLabel"\)/);
    assert.match(item, /return Boolean\(aidInfo\?\.achievement_id \|\| aidInfo\?\.event_id \|\| aidInfo\?\.name\)/);
    assert.match(item, /item\.achievement_info\?\.Name/);
    assert.match(item, /item\.achievement_info\?\.Name \|\| item\.achieve_id \|\| \$t\("pages\.team\.battle\.unknown"\)/);
    assert.match(item, /iconLink\(this\.item\.achievement_info\.IconID\)/);
    assert.match(service, /post\(`\/api\/node\/achievement\/list`/);
    assert.match(service, /attributes: "ID,Name,IconID"/);
    for (const page of [managementPage, personalPage]) {
        assert.match(page, /getAchievementsByIds\(achievementIds\)/);
        assert.match(page, /item\["achievement_info"\] = achievements\[item\.achieve_id\] \|\| null/);
    }
});

test("expanded team details keep the leader on one line and use a responsive member grid", async () => {
    const [item, styles] = await Promise.all([
        read("../src/views/team/battle/teamItem.vue"),
        read("../src/assets/css/team/battle/item.less"),
    ]);

    assert.match(item, /<div class="u-teammates">/);
    assert.match(styles, /\.u-leader[\s\S]*?display:\s*inline-flex/);
    assert.match(styles, /\.u-leader[\s\S]*?\.u-username \{[\s\S]*?width:\s*auto/);
    assert.match(styles, /\.u-teammates \{[\s\S]*?grid-template-columns:\s*repeat\(6, minmax\(0, 1fr\)\)/);
    assert.doesNotMatch(styles, /white-space:\s*visible/);
});

test("battle title provides a dedicated details toggle using the card expand action", async () => {
    const [item, page, styles] = await Promise.all([
        read("../src/views/team/battle/battleItem.vue"),
        read("../src/views/team/battle/index.vue"),
        read("../src/assets/css/team/battle/battle-item.less"),
    ]);

    assert.match(item, /<el-button[\s\S]*?v-if="showDetailsToggle"[\s\S]*?plain[\s\S]*?class="u-detail-toggle"[\s\S]*?@click\.stop="\$emit\('toggleDetails'\)"/);
    assert.doesNotMatch(item, /v-if="showDetailsToggle"\s*type="primary"/);
    assert.match(page, /:class="\{ 'is-expanded': show\[i\] \}"/);
    assert.match(page, /:expanded="Boolean\(show\[i\]\)"/);
    assert.match(page, /show-details-toggle/);
    assert.match(page, /@toggleDetails="showItem\(i\)"/);
    assert.match(item, /<div class="u-team-op">[\s\S]*?class="u-detail-toggle"[\s\S]*?class="u-bind-battle"/);
    assert.match(item, /plain[\s\S]*?:icon="View"[\s\S]*?pages\.team\.battle\.viewDetails/);
    assert.match(item, /class="u-bind-battle" type="primary" :icon="Connection"/);
    assert.match(item, /return \{ Connection, View \}/);
    assert.match(styles, /\.u-team-op[\s\S]*?\.el-button \{[\s\S]*?min-height:\s*38px/);
    assert.doesNotMatch(styles, /\.el-icon \+ span \{[\s\S]*?margin-left:\s*0/);
});

test("expanded battle and team detail cards share one continuous container", async () => {
    const [pageStyles, detailStyles] = await Promise.all([
        read("../src/assets/css/team/battle/index.less"),
        read("../src/assets/css/team/battle/item.less"),
    ]);

    assert.match(pageStyles, /&\.is-expanded \{[\s\S]*?\.u-battle-team \{[\s\S]*?border-radius:\s*@team-radius-control @team-radius-control 0 0/);
    assert.match(pageStyles, /\.u-battle-team \{[\s\S]*?border-bottom:\s*1px dotted @team-border/);
    assert.match(pageStyles, /\.u-team-item \{[\s\S]*?margin-top:\s*0/);
    assert.match(pageStyles, /\.m-rank-top100-item \{[\s\S]*?border-color:\s*@team-border[\s\S]*?border-radius:\s*0 0 @team-radius-control @team-radius-control/);
    assert.match(detailStyles, /border-left:\s*1px solid @team-border/);
    assert.doesNotMatch(detailStyles, /border-left:\s*4px solid #615cf6/);
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
    assert.match(
        dialog,
        /@media screen and \(max-width: @phone\)[\s\S]*?\.m-rank-relevance-dialog\.el-dialog\s*\{[\s\S]*?width:\s*100vw !important;[\s\S]*?height:\s*100vh;[\s\S]*?max-height:\s*100vh;[\s\S]*?margin:\s*0;/
    );
    assert.match(dialog, /\.el-dialog__body\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?flex:\s*1;[\s\S]*?overflow-y:\s*auto/);
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

    assert.match(page, /class="u-notice-filter"[\s\S]*?pages\.team\.battle\.activityOnly[\s\S]*?v-model="filterRanking"/);
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

    assert.match(page, /class="u-notice-filter"[\s\S]*?pages\.team\.battle\.activityOnly[\s\S]*?v-model="filterRanking"/);
    assert.match(page, /m-battle-notice--filter"[^>]*:closable="false"/);
    assert.match(page, /v-for="\(item, i\) in displayList"/);
    assert.match(page, /item\.boss_info\?\.is_rank_boss > 0 \|\| Boolean\(item\.aid_info\?\.event_id\)/);
    assert.match(page, /localStorage\.getItem\(RANKING_FILTER_STORAGE_KEY\) === "1"/);
    assert.match(page, /localStorage\.setItem\(RANKING_FILTER_STORAGE_KEY, value \? "1" : "0"\)/);
    assert.match(page, /pages\.team\.battle\.teamSource/);
});

test("team battle management requests leader records for the current team with pagination", async () => {
    const page = await read("../src/views/team/battle/index.vue");

    assert.match(page, /team_id:\s*this\.teamId/);
    assert.match(page, /is_leader:\s*1/);
    assert.match(page, /pageIndex:\s*this\.page/);
    assert.match(page, /pageSize:\s*this\.per/);
    assert.match(page, /getMyTeamBattleList\(this\.params\)/);
    assert.match(page, /<el-pagination[\s\S]*?:total="total"[\s\S]*?@current-change="changePage"/);
    assert.doesNotMatch(page, /hide-on-single-page/);
    assert.match(page, /res\.page\?\.total \?\? res\.total \?\? list\.length/);
    assert.match(
        page,
        /changePage\(page\) \{[\s\S]*?this\.page = page;[\s\S]*?this\.getList\(\)/,
    );
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
    assert.match(styles, /\.u-notice-filter\s*\{[\s\S]*?justify-content:\s*space-between[\s\S]*?background:\s*fade\(#fff, 62%\)/);
    assert.match(styles, /max-width:\s*@phone[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)[\s\S]*?\.u-notice-filter\s*\{[\s\S]*?width:\s*100%/);
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
    assert.match(
        pageStyles,
        /@media screen and \(max-width: @phone\)[\s\S]*?\.m-rank-video-dialog\.el-dialog\s*\{[\s\S]*?width:\s*100vw !important;[\s\S]*?height:\s*100vh;[\s\S]*?max-height:\s*100vh;[\s\S]*?margin:\s*0;/
    );
    assert.match(
        pageStyles,
        /\.m-rank-video-dialog\.el-dialog\s*\{[\s\S]*?\.el-dialog__body\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?flex:\s*1;[\s\S]*?overflow-y:\s*auto;/
    );
    assert.match(videoStyles, /grid-template-columns:\s*repeat\(auto-fill,\s*minmax\(260px,\s*1fr\)\)/);
    assert.match(videoStyles, /\.m-team-videos-empty/);
});
