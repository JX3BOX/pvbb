<template>
    <QQBotLayout>
        <div class="m-help-content">
            <div class="m-example-list">
                <div class="m-help-item" v-for="item in example_list" :key="item.category">
                    <div class="title">{{ item.category }}</div>
                    <HelpCard :obj="item.detail" />
                </div>
            </div>
            <div class="m-right">
                <HelpList />
                <Trial></Trial>
            </div>
            <Pin></Pin>
        </div>
    </QQBotLayout>
</template>

<script>
import QQBotLayout from "@/layouts/QQBotLayout.vue";
import HelpCard from "./components/HelpCard.vue";
import HelpList from "./components/HelpList.vue";
import Trial from "./components/Trial.vue";
import Pin from "./components/Pin.vue";
import { example_list } from "@/assets/data/qqbot/bot_example.js";
export default {
    name: "Help",
    components: {
        HelpCard,
        HelpList,
        Trial,
        Pin,
        QQBotLayout,
    },
    data() {
        return {
            example_list: example_list,
        };
    },
};
</script>

<style lang="less">
.m-help-content {
    display: flex;
    // height: 862px;
    .m-example-list{
        max-height: calc(100vh - @header-height);
        overflow: auto;
        &::-webkit-scrollbar{
            .none;
        }
    }
    .m-help-item {
        width: 640px;
        &:last-child{
            margin-bottom: 40px;
        }
        .title {
            margin: 24px 0;
            width: 100%;
            height: 53px;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 0px;
            line-height: 53px;
            color: rgba(255, 255, 255, 1);
            text-align: left;
        }
    }
    .m-right {
        margin-left: 48px;
        width: 360px;
        box-sizing: border-box;
    }

}
</style>
