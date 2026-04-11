<template>
    <el-carousel trigger="click" height="110px" indicator-position="none" v-if="banners && banners.length">
        <el-carousel-item v-for="(item, i) in banners" :key="i">
            <a :href="item.link" target="_blank" class="u-item">
                <img :src="showBanner(item.img)" />
            </a>
        </el-carousel-item>
    </el-carousel>
</template>

<script>
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { getBanner } from "@/service/team/server.js";
export default {
    name: "IndexSlider",
    props: [],
    components: {},
    data: function() {
        return {
            banners: [],
        };
    },
    methods: {
        loadBanners: function() {
            getBanner().then((res) => {
                this.banners = res.data.data.list;
            });
        },
        showBanner: function(val) {
            return resolveImagePath(val);
        },
    },
    mounted: function() {
        this.loadBanners();
    },
};
</script>
