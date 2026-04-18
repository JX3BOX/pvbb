<template>
    <el-dialog
        :model-value="modelValue"
        @close="onClose"
        title="打赏记录"
        width="1002px"
        append-to-body
        destroy-on-close
    >
        <Jx3BoxcoinRecords
            v-if="modelValue && postId"
            :key="`${postType}-${postId}`"
            :postType="postType"
            :postId="postId"
            :postClient="client"
            mode="normal"
        />
    </el-dialog>
</template>

<script>
import boxCoinRecords from "@jx3box/jx3box-ui/src/interact/BoxcoinRecords.vue";
import "@jx3box/jx3box-ui/assets/css/single/thx.less";
export default {
    name: "BoxcoinRecords",
    components: {
        Jx3BoxcoinRecords: boxCoinRecords,
    },
    props: {
        postType: String,
        postId: [String, Number],
        client: String,
        modelValue: Boolean,
    },
    emits: ["update:modelValue"],
    methods: {
        onClose() {
            this.$emit("update:modelValue", false);
        },
    },
};
</script>

<style lang="less">
// @import "@jx3box/jx3box-common-ui/assets/css/thx.less";
</style>
