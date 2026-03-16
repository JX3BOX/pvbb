<template>
    <div>
        <list-nav v-if="mode == 'list'" class="m-nav" />
        <single-nav v-if="mode == 'single'" />
    </div>
</template>

<script>
import ListNav from "@/components/nav/ListNav.vue";
import SingleNav from "@/components/nav/SingleNav.vue";
import settings from "@/settings.js";
export default {
    name: "Nav",
    props: [],
    components: {
        ListNav,
        SingleNav,
    },
    data: function () {
        return {
            mode: "",
        };
    },
    computed: {},
    watch: {},
    methods: {},
    created: function () {
        let id = location.pathname.split("/")[2];
        let type = location.pathname.split("/")[1];
        if (settings.single_types.includes(type) && id) {
            this.mode = "single";
        } else {
            this.mode = "list";
        }
    },
    mounted: function () {},
};
</script>
