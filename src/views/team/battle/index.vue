<template>
    <div>
        <el-alert
            style="margin-bottom: 10px"
            title="本数据将同时会展示在秘境百强榜，请勿关联非正确数据"
            type="warning"
            show-icon
        ></el-alert>

        <div class="m-battle-index" v-loading="loading">
            <div class="m-battle-list_null" v-if="list.length == 0">
                <el-alert title="暂无团队成绩" type="info" show-icon></el-alert>
            </div>
            <div v-else>
                <div v-for="(item, i) in list" :key="i" class="u-team-collapse">
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
        };
    },
    watch: {
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
