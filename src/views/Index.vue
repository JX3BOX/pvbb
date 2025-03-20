<template>
    <ListLayout>
        <div class="v-index">
            <joke />
            <!-- <emotion /> -->
            <list />
        </div>
    </ListLayout>
</template>

<script>
import ListLayout from "@/layouts/ListLayout.vue";
import list from "@/components/bbs/list_index.vue";
import joke from "@/components/joke/joke_index.vue";
export default {
    name: "Index",
    props: [],
    components: {
        list,
        joke,
        ListLayout,
    },
    data: function () {
        return {
        };
    },
    computed: {},
    watch: {},
    methods: {},
    filters: {},
    created: function () {},
    mounted: function () {
    },
};
</script>

<style lang="less">
@import "../assets/css/bbs/index.less";
</style>
