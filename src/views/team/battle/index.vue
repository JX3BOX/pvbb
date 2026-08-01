<template>
    <div>
        <el-alert class="m-battle-notice m-battle-notice--filter" type="warning" show-icon :closable="false">
            <template #title>
                <div class="m-battle-notice__content">
                    <span class="u-notice-copy">
                        <span>{{ $t("pages.team.battle.teamNotice") }}</span>
                        <small>{{ $t("pages.team.battle.teamSource") }}</small>
                        <a class="u-battle-guide" href="/tool/109317" target="_blank" rel="noopener noreferrer">
                            {{ $t("pages.team.battle.reportGuide") }}
                        </a>
                    </span>
                    <el-switch v-model="filterRanking" :active-text="$t('pages.team.battle.activityOnly')" />
                </div>
            </template>
        </el-alert>

        <div class="m-battle-index" v-loading="loading">
            <div class="m-battle-list_null" v-if="list.length == 0">
                <el-alert :title="$t('pages.team.battle.noTeamRecords')" type="info" show-icon></el-alert>
            </div>
            <div v-else-if="displayList.length">
                <div v-for="(item, i) in displayList" :key="item.ID || item.id || item.created" class="u-team-collapse">
                    <div @click="showItem(i)" class="u-team-title">
                        <BattleItem :item="item" @uploadBattle="uploadBattle"></BattleItem>
                    </div>
                    <collapse-transition>
                        <div class="u-team-item" v-show="show[i]">
                            <teamItem :item="item"></teamItem>
                        </div>
                    </collapse-transition>
                </div>
            </div>
            <div class="m-battle-list_null" v-else>
                <el-alert :title="$t('pages.team.battle.noActivityRecords')" type="info" show-icon></el-alert>
            </div>
            <!-- 绑定界面 -->
            <Relevance
                v-if="relevanceShow"
                v-model="relevanceShow"
                :data="relevanceData"
                @update="relevanceShow = false"
            />
        </div>
    </div>
</template>

<script>
import { getMyTeamBattleList, getBossConfig } from "@/service/team/battle.js";
import { uniq } from "lodash";
import CollapseTransition from "@/assets/js/collapse.js";
import Relevance from "./relevance.vue";
import teamItem from "./teamItem.vue";
import BattleItem from "./battleItem.vue";

const RANKING_FILTER_STORAGE_KEY = "team:my-battle:ranking-only";

export default {
    components: { Relevance, teamItem, BattleItem, "collapse-transition": CollapseTransition },
    props: {
        teamId: {
            type: [Number, String],
            default: 0,
        },
    },
    data() {
        return {
            activeNames: null,
            list: [],
            relevanceShow: false,
            relevanceData: {},
            loading: false,
            show: [],
            filterRanking: localStorage.getItem(RANKING_FILTER_STORAGE_KEY) === "1",
        };
    },
    computed: {
        displayList() {
            if (!this.filterRanking) return this.list;
            return this.list.filter((item) => item.boss_info?.is_rank_boss > 0 || Boolean(item.aid_info?.event_id));
        },
    },
    watch: {
        filterRanking(value) {
            localStorage.setItem(RANKING_FILTER_STORAGE_KEY, value ? "1" : "0");
        },
        teamId: {
            handler: function (val) {
                if (!val) return;
                this.getList();
            },
            immediate: true,
        },
    },
    methods: {
        goBack: function () {
            this.$router.push("/");
        },
        getList() {
            this.loading = true;
            getMyTeamBattleList({ team_id: this.teamId })
                .then(async (data) => {
                    let list = data.data.data.list || [];
                    list.forEach((team, i) => {
                        let leader_name = team.leader,
                            members = team.team_members;
                        let arr = [];
                        let leader_info = "";
                        members.forEach((member, j) => {
                            if (member.Name != leader_name) {
                                arr.push(member);
                            } else {
                                leader_info = member;
                            }
                        });
                        list[i]["members"] = arr;
                        list[i]["leaders"] = leader_info;
                    });
                    this.list = list;
                    const aids = uniq(list.map((item) => item.achieve_id)).join(",");
                    const boss_infos = (await getBossConfig({ aids, per: 100 })).data?.data?.list.reduce((acc, cur) => {
                        acc[cur.aid] = cur;
                        return acc;
                    }, {});
                    this.list.forEach((item) => {
                        item["boss_info"] = boss_infos[item.achieve_id] || "";
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
        showItem(i) {
            this.show[i] = !this.show[i];
        },
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/battle/index.less";
</style>
