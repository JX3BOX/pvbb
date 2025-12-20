<template>
    <el-tabs class="m-tabs" v-model="view" @tab-click="changeView">
        <el-tab-pane label="心得" name="insights">
            <span slot="label">
                <img class="u-icon-img" svg-inline src="@/assets/img/community/category/labor.svg" alt="">
                <b>心得</b>
                <!-- <em class="u-secret">权威白皮书</em> -->
            </span>
        </el-tab-pane>

        <el-tab-pane label="故事" name="stories">
            <span slot="label">
                <img class="u-icon-img" svg-inline src="@/assets/img/community/category/write.svg" alt="">
                <b>故事</b>
            </span>
        </el-tab-pane>

        <el-tab-pane label="讨论" name="discussions">
            <span slot="label">
                <img class="u-icon-img" svg-inline src="@/assets/img/community/category/sns.svg" alt="">
                <b>讨论</b>
            </span>
        </el-tab-pane>

        <el-tab-pane label="求助" name="help">
            <span slot="label">
                <img class="u-icon-img" svg-inline src="@/assets/img/community/category/love.svg" alt="">
                <b>求助</b>
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
