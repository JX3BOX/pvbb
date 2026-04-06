<template>
    <div class="p-qqbot">
        <component :is="componentId" :source-id="id"></component>
    </div>
</template>

<script>
import { defineAsyncComponent } from "vue";

// 各栏目组件映射
const componentMap = {
    "pvp": defineAsyncComponent(() => import("@/views/qqbot/Pvp.vue")),
    "baizhan": defineAsyncComponent(() => import("@/views/qqbot/Pve.vue")),
    "pvx": defineAsyncComponent(() => import("@/views/qqbot/Pvx.vue")),
}
export default {
    name: "QQBot",
    data() {
        return {};
    },
    computed: {
        type() {
            return this.$route.query.type;
        },
        id() {
            return this.$route.query.id;
        },
        componentId() {
            return componentMap[this.type] ? componentMap[this.type] : null;
        }
    },
};
</script>
