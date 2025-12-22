<template>
    <el-tabs class="m-tabs" v-model="view" @tab-click="changeView">
        <el-tab-pane label="全部" name="">
            <span slot="label">
                <img class="u-icon-img" svg-inline src="@/assets/img/community/category/all.png" alt="">
                <b>全部内容</b>
                <!-- <em class="u-secret">权威白皮书</em> -->
            </span>
        </el-tab-pane>

        <el-tab-pane label="攻略心得" name="guide">
            <span slot="label">
                <img class="u-icon-img" svg-inline src="@/assets/img/community/category/guide.png" alt="">
                <b>攻略心得</b>
                <!-- <em class="u-secret">权威白皮书</em> -->
            </span>
        </el-tab-pane>

        <el-tab-pane label="江湖故事" name="story">
            <span slot="label">
                <img class="u-icon-img" svg-inline src="@/assets/img/community/category/story.svg" alt="">
                <b>江湖故事</b>
            </span>
        </el-tab-pane>

        <el-tab-pane label="交流分享" name="discuz">
            <span slot="label">
                <img class="u-icon-img" svg-inline src="@/assets/img/community/category/conversation.svg" alt="">
                <b>交流分享</b>
            </span>
        </el-tab-pane>

        <el-tab-pane label="求助寻觅" name="help">
            <span slot="label">
                <img class="u-icon-img" svg-inline src="@/assets/img/community/category/request.svg" alt="">
                <b>求助寻觅</b>
            </span>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
const tabsMap = {
    insights: "心得",
    stories: "故事",
    discussions: "讨论",
    help: "求助",
}
// 反向映射：中文 -> 英文
const reversedTabsMap = {
    "心得": "insights",
    "故事": "stories",
    "讨论": "discussions",
    "求助": "help",
}
export default {
    name: "tabs",
    props: {
        value: {
            type: String,
            default: "心得",
        },
    },
    data: function () {
        return {
        };
    },
    computed: {
        view: {
            get() {
                // 将接收的中文转换为英文key用于内部绑定
                return reversedTabsMap[this.value] || "insights";
            },
            set(val) {
                // 将英文key转换为中文后传出
                this.$emit('input', tabsMap[val]);
            }
        },
        client: function () {
            return this.$store.state.client || "std";
        },
    },
    methods: {
        changeView(tab) {
            // el-tabs 的 tab-click 事件会传入 tab 对象
            this.view = tab.name;
        }
    },
    mounted: function () {
    },
};
</script>

<style lang="less">
@import "~@/assets/css/tabs.less";
</style>
