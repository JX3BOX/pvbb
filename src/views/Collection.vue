<template>
    <div>
        <div v-if="isMiniProgram">
            <MiniList v-if="mode == 'list'" />
            <MiniSingle v-else />
        </div>
        <ListLayout v-else>
            <div class="v-collection">
                <List v-if="mode == 'list'" />
                <Single v-else />
            </div>
        </ListLayout>
    </div>
</template>

<script>
import ListLayout from "@/layouts/ListLayout.vue";
import List from "@/components/collection/collection_list.vue";
import MiniList from "@/components/collection/collection_mini_list.vue";
import Single from "@/components/collection/collection_single.vue";
import MiniSingle from "@/components/collection/collection_mini_single.vue";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "Collection",
    props: [],
    components: {
        List,
        MiniList,
        Single,
        MiniSingle,
        ListLayout,
    },
    data: function () {
        return {
            isMiniProgram: isMiniProgram(),
        };
    },
    computed: {
        mode: function () {
            return this.$route?.params.id ? "single" : "list";
        },
    },
    watch: {},
    methods: {},
    filters: {},
    created: function () {},
    mounted: function () {},
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/collection/collection.less";
</style>
