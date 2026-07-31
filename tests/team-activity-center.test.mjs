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
    assert.match(sidebar, /<strong>团队活动<\/strong>/);
    assert.match(page, /class="v-raid-list p-team-activity-center"/);
    assert.match(page, /searchRaids\(this\.params\)/);
    assert.match(page, /requestId !== this\.requestId/);
    assert.match(page, /<raid-list :data="data" :time="time" modern/);
    assert.match(page, />新建活动<\/span>/);
    assert.doesNotMatch(page, /场公开活动/);
    assert.match(page, /<RaidFormDialog v-model="formVisible" :teams="teams" @saved="handleCreated"/);
    assert.match(page, /getMyPowerTeams\("r_raid"\)/);
    assert.match(page, /User\.isLogin\(\)/);
    assert.match(list, /:variant="modern \? 'center' : 'default'"/);
    assert.match(item, /variant === 'center'/);
    assert.match(styles, /\.m-activity-center-hero/);
    assert.match(styles, /\.u-create-activity/);
    assert.match(styles, /\.m-activity-center-list \.m-activity-item\.is-center/);
});
