<template>
    <button
        class="status-switch"
        :class="{ 'is-ended': isEnd }"
        type="button"
        :title="isEnd ? '点击重新开始招募' : '点击结束招募'"
        :disabled="disabled"
        @click.stop="handleStatus"
    >
        <span class="status-switch__dot"></span>
        <span>{{ isEnd ? "已结束" : "招募中" }}</span>
    </button>
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
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        isEnd() {
            return this.status !== 1;
        },
    },
    methods: {
        handleStatus: throttle(function () {
            if (this.disabled) return;
            this.$emit("handleStatus");
        }, 1000),
    },
};
</script>

<style lang="less" scoped>
.status-switch {
    width: 76px;
    height: 28px;
    padding: 0;
    border: 1px solid rgba(138, 214, 62, 0.34);
    border-radius: 14px;
    background: rgba(138, 214, 62, 0.12);
    color: #a7e86a;
    font-size: 12px;
    font-weight: 600;
    line-height: 26px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;

    &:disabled {
        cursor: wait;
        opacity: 0.58;
    }

    &__dot {
        width: 6px;
        height: 6px;
        flex-shrink: 0;
        border-radius: 50%;
        background: #8ad63e;
        box-shadow: 0 0 0 3px rgba(138, 214, 62, 0.12);
    }
    &:hover {
        border-color: rgba(138, 214, 62, 0.68);
        background: rgba(138, 214, 62, 0.2);
        color: #bcf383;
    }
    &.is-ended {
        border-color: rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.5);

        .status-switch__dot {
            background: rgba(255, 255, 255, 0.34);
            box-shadow: none;
        }
        &:hover {
            border-color: rgba(255, 255, 255, 0.26);
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.78);
        }
    }
}
</style>
