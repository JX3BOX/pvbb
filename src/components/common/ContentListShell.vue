<template>
    <div class="m-content-list-shell" v-loading="loading">
        <header class="m-content-page-heading">
            <div class="u-heading-icon"><i :class="icon"></i></div>
            <div>
                <h1>{{ title }}</h1>
                <p>{{ description }}</p>
            </div>
        </header>

        <slot name="publish"></slot>

        <div class="m-content-list-main">
            <LeftTab class="m-content-list-types" :model-value="type" @setType="$emit('set-type', $event)" />
            <div class="m-content-list-content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
import LeftTab from "@/components/left-tab.vue";

export default {
    name: "ContentListShell",
    components: {
        LeftTab,
    },
    props: {
        title: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        icon: {
            type: String,
            default: "",
        },
        loading: {
            type: Boolean,
            default: false,
        },
        type: {
            type: [String, Number],
            default: "all",
        },
    },
    emits: ["set-type"],
};
</script>
