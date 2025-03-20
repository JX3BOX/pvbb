<template>
    <ListLayout>
        <div class="v-collection">
            <List v-if="mode == 'list'" />
            <Single v-else />
        </div>
    </ListLayout>
</template>

<script>
import ListLayout from "@/layouts/ListLayout.vue";
import List from "@/components/collection/collection_list.vue";
import Single from "@/components/collection/collection_single.vue";
export default {
    name: "Collection",
    props: [],
    components: {
        List,
        Single,
        ListLayout,
    },
    data: function () {
        return {};
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
