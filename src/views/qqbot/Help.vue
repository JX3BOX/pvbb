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
    width: 100%;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 40px;
    // height: 862px;
    .m-example-list{
        min-width: 0;
        max-height: calc(100vh - @header-height);
        overflow: auto;
        padding-right: 8px;
        &::-webkit-scrollbar{
            .none;
        }
    }
    .m-help-item {
        width: 100%;
        &:last-child{
            margin-bottom: 40px;
        }
        .title {
            margin: 28px 0 18px;
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
        width: 100%;
        box-sizing: border-box;
        position: sticky;
        top: 20px;
        align-self: start;
    }

}

@media screen and (max-width: 1279px) {
    .m-help-content {
        grid-template-columns: minmax(0, 1fr) 300px;
        gap: 24px;
    }
}

@media screen and (max-width: 900px) {
    .m-help-content {
        display: block;

        .m-example-list {
            max-height: none;
            overflow: visible;
        }

        .m-right {
            margin-top: 24px;
            position: static;
        }
    }
}
</style>
