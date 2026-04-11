<template>
    <el-popover
        v-if="source"
        placement="right-start"
        width="auto"
        :trigger="click_trigger ? 'click' : 'hover'"
        :disabled="dishoverable"
        popper-class="m-item-icon-popup"
        :visible-arrow="false"
        transition="none"
        :close-delay="0"
        @show="show"
    >
        <template #reference>
            <div class="m-item-icon">
                <div
                    class="u-border"
                    :style="{
                        backgroundImage: item_border(source),
                        opacity: source.Quality == 5 ? 0.9 : 1,
                    }"
                ></div>
                <div
                    class="u-border-quest"
                    :style="{
                        backgroundImage: item_border_quest(source),
                    }"
                ></div>
                <img class="u-item-icon" :src="icon_url(source.IconID)" />
            </div>
        </template>
        <jx3-item :item="source" />
    </el-popover>
</template>

<script>
import { get_item, item_border, item_border_quest, icon_url } from "@/service/team/item.js";
import Item from "@jx3box/jx3box-editor/src/Item";

export default {
    name: "ItemIcon",
    props: ["item", "item_id", "dishoverable", "click_trigger"],
    data() {
        return {
            source: null,
        };
    },
    components: {
        "jx3-item": Item,
    },
    methods: {
        get_data(item_id) {
            if (item_id) {
                get_item(item_id).then((res) => {
                    let data = res.data;
                    if (data.code === 200) {
                        let item = data.data.item;
                        if (JSON.stringify(item) !== "{}") this.source = item;
                    }
                });
            }
        },
        show() {
            if (!this.source || typeof this.source.Genre === "undefined") {
                this.get_data(this.source.id);
            }
        },
        item_border(source) {
            return item_border(source);
        },
        item_border_quest(source) {
            return item_border_quest(source);
        },
        icon_url(icon_id) {
            return icon_url(icon_id);
        },
    },
    watch: {
        item: {
            immediate: true,
            handler() {
                this.source = this.item;
            },
        },
        item_id: {
            immediate: true,
            handler() {
                this.get_data(this.item_id);
            },
        },
    },
};
</script>

<style lang="less">
.m-item-icon-popup {
    min-width: initial;
    padding: 0;
    border: none;
    box-shadow: none;
    background-color: transparent;
    transform: translateY(-10px);
}
</style>
<style lang="less" scoped>
@import "@/assets/css/team/widget/item_icon.less";
</style>
