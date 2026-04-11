<template>
    <div class="v-battle">
        <el-alert
            style="margin-bottom: 10px"
            title="本数据可能会展示在天梯榜，请勿关联非正确数据"
            type="warning"
            show-icon
        ></el-alert>

        <div class="m-battle-index" v-loading="loading">
            <div class="m-battle-list_null" v-if="list.length == 0">
                <el-alert title="暂无成绩" type="info" show-icon></el-alert>
            </div>
            <div class="m-mybattle-list" v-else>
                <BattleItem v-for="(item, i) in list" :key="i" :item="item" @uploadBattle="uploadBattle"></BattleItem>
                <el-pagination
                    class="m-archive-pages justify-center!"
                    background
                    layout="total, prev, pager, next,jumper"
                    :hide-on-single-page="true"
                    :page-size="per"
                    :total="total"
                    :current-page="page"
                    @current-change="changePage"
                >
                </el-pagination>
            </div>

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
import { getMyBattleList, getBossConfig } from "@/service/team/battle.js";
import { uniq } from "lodash";
import Relevance from "./relevance.vue";
import BattleItem from "./battleItem.vue";

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
        };
    },
    computed: {
        params: function () {
            return {
                pageIndex: this.page,
                pageSize: this.per,
                team_id: this.teamId,
                is_leader: 0, // 此处筛选非团长的成绩
            };
        },
    },
    watch: {
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

                    const aids = uniq(this.list.map((item) => item.achieve_id)).join(",");
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

        changePage: function () {
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
