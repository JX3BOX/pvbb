<template>
    <ListLayout>
        <div class="v-emotion">
            <EmotionSingle v-if="id" :id="id" />
            <EmotionList v-else />
        </div>
    </ListLayout>
</template>

<script>
import ListLayout from "@/layouts/ListLayout.vue";
import EmotionSingle from "./EmotionSingle.vue";
import EmotionList from "./EmotionList.vue";

export default {
    name: "Emotion",
    components: {
        ListLayout,
        EmotionSingle,
        EmotionList,
    },
    computed: {
        id() {
            return ~~this.$route.params.id;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/emotion/emotion.less";
</style>
