<!-- src/components/LottieAnimation.vue -->
<template>
    <div ref="lottieContainer" :style="{ width: width, height: height }"></div>
</template>

<script>
import lottie from "lottie-web";
const animations = require.context("../../assets/data/lottie", false, /\.json$/);

export default {
    props: {
        mark: {
            type: String,
            default: "test",
        },
        width: {
            type: String,
            default: "15px",
        },
        height: {
            type: String,
            default: "15px",
        },
    },
    mounted() {
        this.loadAnimation();
    },
    methods: {
        loadAnimation() {
            lottie.loadAnimation({
                container: this.$refs.lottieContainer,
                renderer: "svg",
                loop: true,
                autoplay: true,
                animationData: animations(`./${this.mark}.json`),
            });
        },
    },
};
</script>

<style scoped></style>
