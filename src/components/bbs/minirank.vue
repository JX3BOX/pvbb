<template>
    <div class="m-jx3dat-rank-mini m-jx3dat-rank">
        <h3 class="c-sidebar-right-title">
            <img class="u-icon" svg-inline src="@/assets/img/rank.svg" />剑三年度大事件
            <!-- <span class="u-more" @click="viewRank">查看更多 &raquo;</span> -->
        </h3>
        <el-tabs v-model="active" @tab-click="handleClick">
            <el-tab-pane v-for="tab in tabs" :label="tab" :key="tab" :name="`bbs_rank_${tab}`"></el-tab-pane>
        </el-tabs>
        <ul class="u-list" v-loading="loading">
            <template v-if="data && data.length">
                <li v-for="(item, k) in data" :key="k">
                    <a class="u-link" :href="item.link" target="_blank">
                        <span class="u-order" :class="highlight(k)">{{ k + 1 }}</span>
                        <!-- <Avatar class="u-avatar" :url="item.ext_user_info.avatar" :size="14"> </Avatar> -->
                        <!-- <span class="u-tag" :class="item.client">{{ item.client === "std" ? "重制" : "缘起" }}</span> -->
                        <span class="u-name"> {{ item.label }} </span>
                    </a>
                </li>
            </template>
            <el-alert v-else title="暂无事件" type="info" show-icon></el-alert>
        </ul>
    </div>
</template>

<script>
import { postLink } from "@jx3box/jx3box-common/js/utils";
import { __Root, __OriginRoot } from "@/utils/config";
import { getMenu } from "@jx3box/jx3box-common/js/api_misc";
export default {
    name: "rank",
    data: function () {
        return {
            loading: false,
            data: [],
            active: "bbs_rank_2025",

            tabs: ["2025", "2024", "2023", "2022"],
        };
    },
    computed: {
        client: function () {
            return this.$store.state.client;
        },
    },
    methods: {
        postLink,
        handleClick() {
            this.loadData();
        },
        viewRank: function () {
            const root = this.client === "std" ? __Root : __OriginRoot;
            window.open(`${root}dbm/pkg/rank`, "_blank");
        },
        highlight: function (i) {
            if (i == 0) {
                return "t1";
            } else if (i == 1) {
                return "t2";
            } else if (i == 2) {
                return "t3";
            }
        },
        loadData() {
            this.loading = true;
            getMenu(this.active)
                .then((res) => {
                    this.data = res;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
    mounted: function () {
        this.loadData();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/rank.less";
</style>
