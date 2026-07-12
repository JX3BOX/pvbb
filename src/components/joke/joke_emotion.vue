<template>
    <el-popover
        popper-class="m-joke-popover"
        placement="top"
        trigger="click"
        width="500"
        :offset="-200"
        :persistent="false"
        v-model:visible="showPop"
    >
        <Emotion class="m-publish-joke-emotion" @selected="handleEmotionSelect" />

        <template #reference>
            <span
                class="m-publish-joke-button"
                style="cursor: pointer"
                :title="$t('pages.joke.selectEmotion')"
            >😀{{ $t("pages.joke.insertEmotion") }}</span>
        </template>
    </el-popover>
</template>
<script>
import Emotion from "@jx3box/jx3box-emotion/src/Emotion2.vue";
export default {
    name: "joke_post",
    components: {
        Emotion,
    },
    data() {
        return {
            showPop: false,
        };
    },
    methods: {
        handleEmotionSelect(key) {
            this.$emit("emotion", key);
            this.showPop = false;
        },
    },
};
</script>

<style lang="less">
.m-joke-popover {
    padding:0 !important;
    .m-publish-joke-emotion {
        margin: 0;
        .c-jx3box-emotion-item {
            box-sizing: content-box;
        }
    }
}
.m-publish-joke-button {
    border: 1px solid #cfc2f0;
    .r(7px);
    padding: 5px 10px;
    .fz(14px);
    color: #6543bb;
    background-color: #faf8ff;
    box-shadow: 0 2px 6px rgba(86, 65, 153, 0.08);
    white-space: nowrap;

    &:hover {
        border-color: #9b83dd;
        background-color: #f3efff;
    }
}
</style>
