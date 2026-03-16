<template>
    <div>
        <list_nav v-if="mode == 'list'" class="m-nav" />
        <single_nav v-if="mode == 'single'" />
    </div>
</template>

<script>
import ListNav from "./ListNav.vue";
import single_nav from "@/components/nav/SingleNav.vue";
import { single_types } from "../../../setting.json";
export default {
    name: "Nav",
    props: [],
    components: {
        ListNav,
        single_nav,
    },
    data: function () {
        return {
            mode: "",
        };
    },
    created: function () {
        let id = location.pathname.split("/")[2];
        let type = location.pathname.split("/")[1];
        if (single_types.includes(type) && id) {
            this.mode = "single";
        } else {
            this.mode = "list";
        }
    },
};
</script>
