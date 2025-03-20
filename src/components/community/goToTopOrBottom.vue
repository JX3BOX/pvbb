<template>
    <transition name="el-fade-in">
        <div
            v-if="visible"
            :style="{
                right: styleRight,
                bottom: styleBottom,
                zIndex: zIndex,
            }"
            class="c-toporbottom"
        >
            <div class="c-toporbottom-top" @click="scrollToTop">
                <i class="el-icon-caret-top"></i>
            </div>
            <div class="c-toporbottom-bottom" @click="scrollToBottom">
                <i class="el-icon-caret-bottom"></i>
            </div>
        </div>
    </transition>
</template>

<script>
import throttle from "lodash/throttle";

const cubic = (value) => Math.pow(value, 3);
const easeInOutCubic = (value) => (value < 0.5 ? cubic(value * 2) / 2 : 1 - cubic((1 - value) * 2) / 2);

export default {
    name: "GoToTopOrBottom",
    props: {
        visibilityHeight: {
            type: Number,
            default: 200,
        },
        right: {
            type: Number,
            default: 60,
        },
        bottom: {
            type: Number,
            default: 100,
        },
        zIndex: {
            type: Number,
            default: 999,
        },
    },

    data() {
        return {
            visible: false,
        };
    },

    computed: {
        styleBottom() {
            return `${this.bottom}px`;
        },
        styleRight() {
            return `${this.right}px`;
        },
    },

    mounted() {
        document.addEventListener("scroll", throttle(this.onScroll, 300));
    },

    methods: {
        onScroll() {
            const scrollTop = document.documentElement.scrollTop;
            this.visible = scrollTop >= this.visibilityHeight;
        },
        scrollToTop() {
            this.scrollTo(0);
        },
        scrollToBottom() {
            const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            this.scrollTo(scrollHeight);
        },
        scrollTo(position) {
            const start = document.documentElement.scrollTop || document.body.scrollTop;
            const change = position - start;
            const duration = 500;
            let currentTime = 0;
            const increment = 20;

            const animateScroll = () => {
                currentTime += increment;
                const val = easeInOutCubic(currentTime / duration);
                document.documentElement.scrollTop = document.body.scrollTop = start + change * val;
                if (currentTime < duration) {
                    requestAnimationFrame(animateScroll);
                }
            };

            animateScroll();
        },
    },

    beforeDestroy() {
        document.removeEventListener("scroll", this.throttledScrollHandler);
    },
};
</script>

<style lang="less">
.c-toporbottom {
    position: fixed;
    border-radius: 50%;
    cursor: pointer;
    z-index: 999;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.c-toporbottom-top,
.c-toporbottom-bottom {
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 50%;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    font-size: 20px;
    -webkit-box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
    font-size: 20px;
    -webkit-box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
    cursor: pointer;
    color: @color-link;
    &:hover {
        background: #000;
        background-color: #f2f6fc;
    }
}
</style>
