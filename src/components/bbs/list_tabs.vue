<template>
    <el-tabs class="m-tabs" v-model="view" @tab-click="changeView">
        <el-tab-pane label="全部作品" name="all">
            <span slot="label">
                <img class="u-icon-img" src="@/assets/img/nav/all.png" alt="">
                <b>全部作品</b>
            </span>
        </el-tab-pane>

        <el-tab-pane label="攻略心得" name="index">
            <span slot="label">
                <img class="u-icon-img" src="@/assets/img/nav/game.png" alt="">
                <b>攻略心得</b>
                <!-- <em class="u-secret">权威白皮书</em> -->
            </span>
        </el-tab-pane>

        <el-tab-pane label="萌新指南" name="guide">
            <span slot="label">
                <img class="u-icon-img" src="@/assets/img/nav/book.svg" alt="">
                <b>萌新指南</b>
                <!-- <em class="u-secret">优质作品</em> -->
            </span>
        </el-tab-pane>

        <el-tab-pane label="江湖故事" name="news">
            <span slot="label">
                <img class="u-icon-img" src="@/assets/img/nav/story.svg" alt="">
                <b>江湖故事</b>
                <!-- <em class="u-ready">签约</em> -->
            </span>
        </el-tab-pane>

        <el-tab-pane label="煮酒论剑" name="fiction">
            <span slot="label">
                <img class="u-icon-img" src="@/assets/img/nav/fiction.svg" alt="">
                <b>煮酒论剑</b>
            </span>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
const subtypes = {
    all: "",
    index: 1,
    guide: 2,
    news: 3,
    fiction: 4,
}
const _subtypes = {
    1: "index",
    2: "guide",
    3: "news",
    4: "fiction",
}
export default {
    name: "tabs",
    props: [],
    data: function () {
        return {
            view: "all",
        };
    },
    watch: {
        $route: {
            handler: function (_route) {
                const subtype = _route.query.subtype;
                if (_route.name === 'bbs') {
                    if (subtype) {
                        this.view = _subtypes[subtype] || "bbs";
                    } else {
                        this.view = "all";
                    }
                } else {
                    this.view = _route.name;
                }
            },
            immediate: true,
            deep: true,
        },
    },
    computed: {
        client: function () {
            return this.$store.state.client || "std";
        },
        isSuperAuthor: function () {
            return this.$store.state.isSuperAuthor || false;
        },
    },
    methods: {
        changeView: function () {
            const name = this.view === 'all' ? 'index' : (subtypes[this.view] ? 'index' : this.view);
            this.$router.push({
                name: name,
                query: {
                    subtype: subtypes[this.view],
                },
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/tabs.less";
</style>
