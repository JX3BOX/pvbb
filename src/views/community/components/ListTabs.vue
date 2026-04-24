<template>
    <el-tabs class="m-tabs" v-model="view" @tab-change="changeView">
        <el-tab-pane label="全部内容" name="all">
            <template #label>
                <!-- <img class="u-icon-img" src="@/assets/img/community/category/all.svg" alt="" /> -->
                <el-icon class="u-icon-img"><Menu /></el-icon>
                <b>全部内容</b>
                <!-- <em class="u-secret">权威白皮书</em> -->
            </template>
        </el-tab-pane>

        <el-tab-pane label="攻略心得" name="guide">
            <template #label>
                <!-- <img class="u-icon-img" src="@/assets/img/community/category/guide.png" alt="" /> -->
                <el-icon class="u-icon-img"><Notebook /></el-icon>
                <b>攻略心得</b>
                <!-- <em class="u-secret">权威白皮书</em> -->
            </template>
        </el-tab-pane>

        <el-tab-pane label="江湖故事" name="story">
            <template #label>
                <!-- <img class="u-icon-img" svg-inline src="@/assets/img/community/category/story.svg" alt="" /> -->
                <el-icon class="u-icon-img"><Reading /></el-icon>
                <b>江湖故事</b>
            </template>
        </el-tab-pane>

        <el-tab-pane label="交流分享" name="discuz">
            <template #label>
                <!-- <img class="u-icon-img" svg-inline src="@/assets/img/community/category/conversation.svg" alt="" /> -->
                <el-icon class="u-icon-img"><ChatLineSquare /></el-icon>
                <b>交流分享</b>
            </template>
        </el-tab-pane>

        <el-tab-pane label="求助寻觅" name="help">
            <template #label>
                <!-- <img class="u-icon-img" svg-inline src="@/assets/img/community/category/request.svg" alt="" /> -->
                <el-icon class="u-icon-img"><Warning /></el-icon>
                <b>求助寻觅</b>
            </template>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import { tabsMap, reversedTabsMap } from "@/assets/data/community_category.js";

export default {
    name: "tabs",
    emits: ["update:modelValue", "input"],
    props: {
        modelValue: {
            type: String,
            default: "",
        },
        value: {
            type: String,
            default: "all",
        },
    },
    data: function () {
        return {};
    },
    computed: {
        view: {
            get() {
                // 将接收的中文转换为英文key用于内部绑定
                return this.modelValue || this.value;
            },
            set(val) {
                // 将英文key转换为中文后传出
                this.$emit("update:modelValue", val);
                this.$emit("input", val);
            },
        },
        client: function () {
            return this.$store.state.client || "std";
        },
    },
    methods: {
        changeView(name) {
            this.view = name;
        },
    },
    mounted: function () {},
};
</script>

<style lang="less">
@import "~@/assets/css/community/tabs.less";
</style>
