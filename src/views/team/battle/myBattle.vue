<template>
    <div class="v-battle">
        <el-alert class="m-battle-notice m-battle-notice--filter" type="warning" show-icon :closable="false">
            <template #title>
                <div class="m-battle-notice__content">
                    <span class="u-notice-copy">
                        <span>{{ $t("pages.team.battle.myNotice") }}</span>
                        <span class="u-notice-meta">
                            <small>{{ $t("pages.team.battle.mySource") }}</small>
                            <a class="u-battle-guide" href="/tool/109317" target="_blank" rel="noopener noreferrer">
                                {{ $t("pages.team.battle.reportGuide") }}
                            </a>
                        </span>
                    </span>
                    <el-switch v-model="filterRanking" :active-text="$t('pages.team.battle.activityOnly')" />
                </div>
            </template>
        </el-alert>

        <div class="m-battle-index" v-loading="loading">
            <div class="m-battle-list_null" v-if="list.length == 0">
                <el-alert :title="$t('pages.team.battle.noRecords')" type="info" show-icon></el-alert>
            </div>
            <div class="m-mybattle-list" v-else-if="displayList.length">
                <BattleItem
                    v-for="item in displayList"
                    :key="item.ID || item.id || item.created"
                    :item="item"
                    personal-ranking
                    @uploadBattle="uploadBattle"
                ></BattleItem>
            </div>
            <div class="m-battle-list_null" v-else>
                <el-alert :title="$t('pages.team.battle.noActivityRecordsOnPage')" type="info" show-icon></el-alert>
            </div>
            <el-pagination
                v-if="list.length"
                class="m-archive-pages"
                background
                layout="total, prev, pager, next,jumper"
                :hide-on-single-page="true"
                :page-size="per"
                :total="total"
                :current-page="page"
                @current-change="changePage"
            >
            </el-pagination>

            <!-- 绑定界面 -->
            <Relevance
                v-if="relevanceShow"
                v-model="relevanceShow"
                :role="true"
                :data="relevanceData"
                @update="onRelevanceUpdate"
            />
        </div>
    </div>
</template>

<script>
import { getMyBattleList, getBossConfig, getAchievementsByIds } from "@/service/team/battle.js";
import { uniq } from "lodash";
import Relevance from "./relevance.vue";
import BattleItem from "./battleItem.vue";

const RANKING_FILTER_STORAGE_KEY = "team:my-battle:ranking-only";

export default {
    components: { BattleItem, Relevance },
    props: {
        teamId: {
            type: [Number, String],
            default: 0,
        },
    },
    data() {
        return {
            list: [],
            relevanceShow: false,
            relevanceData: {},
            per: 10,
            page: 1,
            total: 1,
            loading: false,
            filterRanking: localStorage.getItem(RANKING_FILTER_STORAGE_KEY) === "1",
        };
    },
    computed: {
        displayList() {
            if (!this.filterRanking) return this.list;
            return this.list.filter((item) => item.boss_info?.is_rank_boss > 0 || Boolean(item.aid_info?.event_id));
        },
        params: function () {
            return {
                pageIndex: this.page,
                pageSize: this.per,
                team_id: this.teamId,
            };
        },
    },
    watch: {
        filterRanking(value) {
            localStorage.setItem(RANKING_FILTER_STORAGE_KEY, value ? "1" : "0");
        },
        params: {
            immediate: true,
            handler: function () {
                this.loadData();
            },
        },
    },
    methods: {
        goBack: function () {
            this.$router.push("/");
        },
        loadData() {
            this.loading = true;
            getMyBattleList(this.params)
                .then(async (data) => {
                    let res = data.data.data;
                    this.list = res.list || [];
                    this.total = res.page.total || 1;

                    const achievementIds = uniq(this.list.map((item) => item.achieve_id)).filter(Boolean);
                    const aids = achievementIds.join(",");
                    const [bossRes, achievementRes] = await Promise.all([
                        getBossConfig({ aids, per: 100 }),
                        getAchievementsByIds(achievementIds),
                    ]);
                    const boss_infos = bossRes.data?.data?.list.reduce((acc, cur) => {
                        acc[cur.aid] = cur;
                        return acc;
                    }, {});
                    const achievements = (achievementRes.data?.data || []).reduce((acc, cur) => {
                        acc[cur.ID] = cur;
                        return acc;
                    }, {});
                    this.list.forEach((item) => {
                        item["boss_info"] = boss_infos[item.achieve_id] || "";
                        item["achievement_info"] = achievements[item.achieve_id] || null;
                    });
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        uploadBattle(item) {
            this.relevanceData = item;
            this.relevanceShow = true;
        },

        changePage: function (page) {
            this.page = page;
            window.scrollTo(0, 0);
        },
        onRelevanceUpdate(val) {
            this.relevanceShow = val;
            this.loadData();
        },
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/battle/index.less";
</style>
