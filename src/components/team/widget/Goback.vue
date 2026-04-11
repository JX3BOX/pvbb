<template>
    <el-button class="u-btn-goback" plain icon="ArrowLeft" size="small" @click="goback">返回</el-button>
</template>

<script>
export default {
    methods: {
        goback: function () {
            // this.$router.go(-1)
            this.$router.push({ name: "index" });
        },
    },
};
</script>

<style lang="less">
.u-btn-goback {
    .ml(10px);
}
</style>
