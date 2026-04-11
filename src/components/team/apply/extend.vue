<template>
    <div class="m-extend">
        <span v-for="(item,key) in data" :key="key">{{ key }}: {{ item }}</span>
    </div>

</template>
<script>
export default {
    name: "extend",
    props: ["data"]
};
</script>
<style lang='less' scoped>
    .m-extend {
        .flex;
        flex-direction: column;
    }
</style>
