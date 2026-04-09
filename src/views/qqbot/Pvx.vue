<template>
    <!-- <QQBotLayout> -->
    <div class="m-qqbot-pvx" :class="{ 'is-treasure': isTreasure }">
        <PvxDetail />
    </div>
    <!-- </QQBotLayout> -->
</template>

<script>
// import QQBotLayout from "@/layouts/QQBotLayout.vue";
import PvxDetail from "@/views/qqbot/components/pvx/Detail.vue";

export default {
    name: "QQBotPvx",
    components: {
        // QQBotLayout,
        PvxDetail,
    },
    computed: {
        isTreasure() {
            return this.$route.query.type === "treasure";
        },
    },
};
</script>

<style lang="less">
.m-qqbot-pvx {
    // display: flex;
    // justify-content: center;
    // padding: 24px 0 40px;
    min-height: 100vh;
    width: 560px;
    box-sizing: border-box;
    background-image: linear-gradient(to top, #404040, #575757),
        linear-gradient(to top, #000, rgba(255, 255, 255, 0.75));

    &.is-treasure {
        width: 100%;
        min-height: auto;
        background-image: none;
    }
}
</style>
