import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function read(path) {
    return readFile(new URL(path, import.meta.url), "utf8");
}

test("activity center restores the public raid list inside the modern team shell", async () => {
    const [router, app, sidebar, page, list, item, styles] = await Promise.all([
        read("../src/pages/team/router.js"),
        read("../src/pages/team/App.vue"),
        read("../src/components/team/org/team_home_sidebar.vue"),
        read("../src/views/team/raid/ListRaid.vue"),
        read("../src/components/team/raid/RaidList.vue"),
        read("../src/components/team/raid/ActivityItem.vue"),
        read("../src/assets/css/team/raid/list_raid.less"),
    ]);

    assert.match(router, /name: "list_raid",[\s\S]*path: "\/raid\/list"[\s\S]*isPublic: true/);
    assert.match(app, /"list_raid"/);
    assert.match(sidebar, /isTeamActivity[\s\S]*to="\/raid\/list"/);
    assert.match(sidebar, /<strong>{{ \$t\("team\.sidebar\.activity"\) }}<\/strong>/);
    assert.match(page, /class="v-raid-list p-team-activity-center"/);
    assert.match(page, /searchRaids\(this\.params\)/);
    assert.match(page, /requestId !== this\.requestId/);
    assert.match(page, /<raid-list :data="data" :time="time" modern/);
    assert.match(page, /team\.raid\.center\.newActivity/);
    assert.match(page, /team\.raid\.center\.resultCount/);
    assert.match(
        page,
        /team\.raid\.center\.searchActivity[\s\S]*team\.raid\.center\.server[\s\S]*team\.raid\.center\.activityName[\s\S]*team\.raid\.center\.date/
    );
    assert.match(page, /<RaidFormDialog v-model="formVisible" :teams="teams" @saved="handleCreated"/);
    assert.match(page, /getMyPowerTeams\("r_raid"\)/);
    assert.match(page, /User\.isLogin\(\)/);
    assert.match(list, /:variant="modern \? 'center' : 'default'"/);
    assert.match(item, /variant === 'center'/);
    assert.match(item, /class="u-center-operation"/);
    assert.match(item, /v-if="joined" class="u-joined"/);
    assert.match(item, /class="u-center-date"[\s\S]*<time :datetime="activity\.start_time"/);
    assert.doesNotMatch(item, /class="u-center-time"/);
    assert.match(item, /class="u-center-type">{{ activity\.name[\s\S]*class="u-center-title">{{ activity\.title/);
    assert.match(styles, /\.m-activity-center-hero/);
    assert.match(styles, /\.u-create-activity/);
    assert.match(styles, /\.m-activity-center-list \.m-activity-item\.is-center/);
    assert.match(styles, /grid-template-columns: 58px minmax\(0, 1fr\) auto/);
    assert.match(styles, /\.u-center-operation/);
    assert.match(styles, /\.u-center-type/);
    assert.match(styles, /\.u-center-title/);
    assert.match(styles, /\.m-activity-center-actions\s*\{[\s\S]*width: 100%;[\s\S]*justify-content: stretch;[\s\S]*grid-area: actions;/);
    assert.match(styles, /\.u-create-activity\s*\{[\s\S]*width: 100%;[\s\S]*min-height: 44px;/);
    assert.match(styles, /grid-template-areas:[\s\S]*"icon eyebrow"[\s\S]*"description description"[\s\S]*"actions actions"/);
    assert.match(styles, /\.m-activity-center-heading\s*\{[\s\S]*display: contents;/);
    assert.match(styles, /grid-area: description/);
});

test("activity center weekdays follow the active i18n locale", async () => {
    const [activityItem, listRaid] = await Promise.all([
        read("../src/components/team/raid/ActivityItem.vue"),
        read("../src/views/team/raid/ListRaid.vue"),
    ]);

    for (const source of [activityItem, listRaid]) {
        assert.match(source, /Intl\.DateTimeFormat\(this\.\$i18n\?\.locale \|\| "zh-CN"/);
        assert.doesNotMatch(source, /showRaidWeek[^}]+moment\(d\)\.format\("dddd"\)/);
    }
});
