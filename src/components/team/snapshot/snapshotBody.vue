<template>
    <div class="m-snapshot-body" v-if="data && data.length">
        <div class="u-col" v-for="item in data" :key="item.name">
            <div class="u-item" @click="onCopy(item.name)">
                <img class="u-icon" :src="showMountIcon(item.mount)" />
                <span class="u-name">{{ item.name }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { showMountIcon } from "@/utils/filters";
import { copyText } from "@/utils/common";
export default {
    name: "SnapshotBody",
    props: ["data"],
    components: {},
    data: function () {
        return {};
    },
    computed: {},
    watch: {},
    methods: {
        onCopy: function (val) {
            copyText(val);
            this.$notify({
                title: "复制成功",
                message: "复制内容 : " + val,
                type: "success",
            });
        },
        showMountIcon,
    },
    created: function () {},
    mounted: function () {},
};
</script>
<style lang="less">
@import "@/assets/css/team/snapshot/body.less";
</style>
