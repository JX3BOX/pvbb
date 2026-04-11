<template>
    <div class="w-drop-item">
        <a class="w-drop-item-link" :href="getDropLink(id)" target="_blank">
            <img class="w-drop-item-img" :src="iconLink(icon)" />
            <span class="w-drop-item-name">{{ name || "未知" }}</span>
        </a>
    </div>
</template>

<script>
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "DropItem",
    props: ["id", "name", "icon"],
    components: {},
    data: function () {
        return {};
    },
    methods: {
        getDropLink: function (id) {
            return getLink("item", id);
        },
        iconLink,
    },
    created: function () {},
    mounted: function () {},
};
</script>

<style scoped lang="less">
.w-drop-item-link {
    .db;
}
.w-drop-item-img {
    .size(28px);
    .y;
    .mr(5px);
    .r(2px);
}
.w-drop-item-name {
    .fz(12px,28px);
    color: #606266;
}
</style>
