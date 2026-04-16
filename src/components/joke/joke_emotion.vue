<template>
    <el-popover popper-class="m-joke-popover" placement="top" width="500" :offset="-200" v-model:visible="showPop">
        <Emotion class="m-publish-joke-emotion" @selected="handleEmotionSelect" />

        <template #reference>
            <span class="m-publish-joke-button" style="cursor: pointer" title="选择表情">😀插入表情</span>
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
    .m-publish-joke-emotion {
        margin: 0;
        .c-jx3box-emotion-item {
            box-sizing: content-box;
        }
    }
}
.m-publish-joke-button {
    border: 1px solid #3585de;
    .r(3px);
    padding: 5px 10px;
    .fz(14px);
    background-color: #f3f9ff;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
}
</style>
