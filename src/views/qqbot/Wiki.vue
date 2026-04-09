<template>
    <div class="m-qqbot-wiki">
        <WikiDetail />
    </div>
</template>

<script>
import WikiDetail from "@/views/qqbot/components/wiki/Detail.vue";

export default {
    name: "QQBotWiki",
    components: {
        WikiDetail,
    },
};
</script>

<style lang="less">
.m-qqbot-wiki {
    min-height: 100vh;
    width: 560px;
    box-sizing: border-box;
    background-image: linear-gradient(to top, #404040, #575757),
        linear-gradient(to top, #000, rgba(255, 255, 255, 0.75));
}
</style>
