<template>
    <div class="status-switch">
        <div class="status-switch-scroll" :class="isEnd ? 'isEnd' : ''" @click.stop="handleStatus">
            {{ !isEnd ? "招募中" : "已结束" }}
        </div>
    </div>
</template>

<script>
import { throttle } from "lodash";
export default {
    name: "StatusSwitch",
    props: {
        status: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            isEnd: this.status !== 1,
        };
    },
    methods: {
        handleStatus: throttle(function () {
            this.isEnd = !this.isEnd;
            this.$emit("handleStatus");
        }, 1000),
    },
};
</script>

<style lang="less" scoped>
.status-switch {
    width: 64px;
    height: 22px;
    border-radius: 14px;
    background: rgba(56, 56, 56, 1);
    padding: 1px 0px 1px 0px;
    .status-switch-scroll {
        width: 52px;
        height: 22px;
        border-radius: 14px;
        background: rgba(138, 214, 62, 1);
        font-size: 12px;
        font-weight: 700;
        line-height: 22px;
        color: rgba(0, 0, 0, 1);
        text-align: center;
        transform: translateX(0px);
        transition: all 0.2s linear;
        &.isEnd {
            transform: translateX(12px);
            background: rgba(38, 38, 38, 1);
            color: rgba(255, 255, 255, 1);
        }
    }
}
</style>
