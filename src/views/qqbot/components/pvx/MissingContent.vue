<template>
    <div class="m-wiki-post-empty is-robot-empty m-pvx-missing">
        <div class="u-title">PVX 模块待补充</div>
        <div class="u-desc">当前参数：type={{ type || "-" }}，id={{ id || "-" }}</div>
        <div class="u-desc">请补齐对应的单页组件与服务文件后再启用该类型渲染。</div>
    </div>
</template>

<script>
export default {
    name: "PvxMissingContent",
    props: {
        type: {
            type: String,
            default: "",
        },
        id: {
            type: [String, Number],
            default: "",
        },
    },
    mounted() {
        window.__READY__ = true;
    },
};
</script>

<style lang="less">
.m-pvx-missing {
    width: 100%;
    min-height: 96px;
    margin: 0 !important;
    gap: 6px;
    .u-title {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
    }
    .u-desc {
        font-size: 12px;
        line-height: 1.5;
    }
}
</style>
