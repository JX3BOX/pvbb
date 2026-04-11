<template>
    <el-row class="m-items">
        <el-col
            v-if="JSON.stringify(item) !== '{}'"
            :key="item.id"
            :xs="24"
            :md="24"
            class="m-item-container"
        >
            <div class="m-left">
                <ItemIcon :item="item" />
            </div>
            <div class="m-right">
                <h6
                    class="u-name"
                    :class="{ white: item.Quality == 1 }"
                    v-text="item.Name"
                    :style="{
                        color: item_color(item.Quality),
                    }"
                ></h6>
            </div>
        </el-col>
    </el-row>
</template>

<script>
import ItemIcon from "@/components/team/widget/ItemIcon";
import { item_color } from "@/service/team/item.js"

export default {
    name: "Items",
    props: ["item"],
    methods: {
        url_filter: function(item_id) {
            return this.jump === true || typeof this.jump === "undefined"
                ? { name: "view", params: { item_id: item_id } }
                : {};
        },
        target_filter: function() {
            return this.target || typeof this.target !== "undefined"
                ? this.target
                : "";
        },
        item_color(quality) {
            return item_color(quality)
        }
    },
    components: {
        ItemIcon,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/widget/items.less";
</style>
