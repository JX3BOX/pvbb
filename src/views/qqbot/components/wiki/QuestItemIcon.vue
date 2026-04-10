<template>
    <span class="m-quest-item-icon" v-if="source">
        <img class="u-icon" :src="icon_url(source.IconID)" :style="`width:${size}px;height:${size}px`" />
        <span class="u-name" v-if="hasTitle">{{ source.Name }}</span>
    </span>
</template>

<script>
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import { get_item } from "@/service/qqbot-wiki";

export default {
    name: "QuestItemIcon",
    props: {
        itemId: {
            type: [String, Number],
            default: null,
        },
        size: {
            type: Number,
            default: 14,
        },
        hasTitle: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            source: null,
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    watch: {
        itemId: {
            immediate: true,
            handler(val) {
                if (val) this.loadItem(val);
            },
        },
    },
    methods: {
        icon_url(id) {
            return iconLink(id, this.client);
        },
        loadItem(itemId) {
            if (!itemId) return;
            get_item(itemId, this.client)
                .then((res) => {
                    const item = res?.data?.data?.item || res?.data?.item;
                    if (item && Object.keys(item).length) {
                        this.source = item;
                    }
                })
                .catch(() => {});
        },
    },
};
</script>

<style lang="less" scoped>
.m-quest-item-icon {
    display: inline-flex;
    align-items: center;
    gap: 5px;

    .u-icon {
        border-radius: 2px;
        vertical-align: middle;
    }

    .u-name {
        color: #fff;
        font-weight: bold;
    }
}
</style>
