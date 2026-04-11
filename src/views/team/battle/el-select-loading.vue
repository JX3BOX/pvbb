<!-- 监听 el-select 的滚动，并提供触底加载数据的回调 -->
<template>
    <el-option ref="el" class="el-select-loading" value=" ">
        <template v-if="hasMore">
            <el-icon class="el-select-loading__icon"><Loading /></el-icon>
            <span class="el-select-loading__tips">{{ loadingText }}</span>
        </template>
        <template v-else>{{ noMoreText }}</template>
    </el-option>
</template>

<script>
export default {
    name: "ElSelectLoading",
    props: {
        // 当前页码
        page: {
            type: Number,
            default: 1,
        },
        // 是否加载中，过滤重复的加载
        loading: {
            type: Boolean,
            default: false,
        },
        loadingText: {
            type: String,
            default: "加载中...",
        },
        // 是否有更多数据可加载
        hasMore: {
            type: Boolean,
            default: false,
        },
        noMoreText: {
            type: String,
            default: "没有更多了",
        },
    },
    data() {
        return {
            observer: null,
        };
    },
    computed: {
        el() {
            return this.$refs.el;
        },
        intersectionOption() {
            return {
                root: this.el.$el.parentElement?.parentElement,
                rootMargin: "0px 0px 0px 0px",
            };
        },
    },
    methods: {
        intersectionObserverCallback(entries) {
            if (this.loading || !this.hasMore || !entries[0].isIntersecting) {
                return;
            }
            this.$emit("loadMore", this.page + 1);
        },
    },
    mounted() {
        this.observer = new IntersectionObserver(this.intersectionObserverCallback, this.intersectionOption);
        this.observer.observe(this.el.$el);
    },
    unmounted() {
        if (!this.el) {
            return;
        }
        this.observer?.unobserve(this.el.$el);
        this.observer?.disconnect();
        this.observer = null;
    },
};
</script>

<style lang="less" scoped>
.el-select-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: initial;
    pointer-events: none;
    color: var(--el-color-info);
    font-size: 12px;

    &__icon {
        font-size: 16px;
        animation: rotate 1.5s linear infinite;
    }

    &__tips {
        margin-left: 6px;
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
}
</style>
