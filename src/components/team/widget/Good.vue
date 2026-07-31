<template>
    <button
        class="w-like-heart"
        type="button"
        :class="{ 'is-liked': liked, 'is-animating': animating }"
        :aria-label="`${liked ? '已' : ''}${txt || '喜欢'}，当前 ${total}`"
        :aria-pressed="liked ? 'true' : 'false'"
        :disabled="submitting"
        @click="blast"
    >
        <span class="w-heart" aria-hidden="true">
            <svg class="u-heart-icon" viewBox="0 0 24 24" focusable="false">
                <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
            </svg>
        </span>
        <span class="u-text">{{ txt || "喜欢" }}</span>
        <span v-if="showCount" class="u-count">{{ total }}</span>
        <span v-if="animating" class="u-like-feedback" aria-hidden="true">+1</span>
    </button>
</template>

<script>
import { addLike } from "@/service/team/team.js";

export default {
    name: "Good",
    props: {
        mode: {
            type: String,
            default: "heart",
        },
        txt: {
            type: String,
            default: "喜欢",
        },
        showCount: {
            type: Boolean,
            default: false,
        },
        count: {
            type: [Number, String],
            default: 0,
        },
        team_id: {
            type: [Number, String],
            default: 0,
        },
    },
    data: function () {
        return {
            liked: false,
            animating: false,
            submitting: false,
            total: Number(this.count || 0),
            animationTimer: null,
        };
    },
    computed: {
        id: function () {
            return this.team_id;
        },
    },
    watch: {
        count: {
            immediate: true,
            handler: function (val) {
                const nextTotal = Number(val || 0);
                this.total = this.liked ? Math.max(this.total, nextTotal + 1) : nextTotal;
            },
        },
    },
    methods: {
        triggerAnimation: function () {
            window.clearTimeout(this.animationTimer);
            this.animating = true;
            this.animationTimer = window.setTimeout(() => {
                this.animating = false;
                this.animationTimer = null;
            }, 760);
        },
        blast: async function () {
            if (!this.id || this.submitting || this.liked) return;

            this.submitting = true;
            this.liked = true;
            this.total = Number(this.total || 0) + 1;
            this.triggerAnimation();

            try {
                await addLike(this.id);
            } catch (error) {
                this.total = Math.max(Number(this.total || 1) - 1, 0);
                this.liked = false;
                this.$notify({
                    title: "好评失败",
                    message: error?.response?.data?.msg || "请稍后再试",
                    type: "error",
                });
            } finally {
                this.submitting = false;
            }
        },
    },
    beforeUnmount: function () {
        window.clearTimeout(this.animationTimer);
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/widget/good.less";
</style>
