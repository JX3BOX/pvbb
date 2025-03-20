<template>
    <div v-if="list.length" class="c-bbs-banner">
        <el-carousel class="m-carousel" autoplay indicator-position="none">
            <el-carousel-item v-for="(item, index) in list" :key="index">
                <a class="u-link" :href="item.link">
                    <el-image class="u-cover" :src="item.img" :alt="item.title" />
                </a>
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<script>
import { getConfigBanner } from "@/service/cms";
export default {
    name: "BBsBanner",
    props: {
        subtype: {
            type: String,
            default: "bbs",
        },
    },
    data() {
        return {
            list: [],
        };
    },
    computed: {
        client: function () {
            return this.$store.state.client || "std";
        },
    },
    methods: {
        loadData() {
            getConfigBanner({ client: this.client, status: 1, per: 10, type: "banner", subtype: this.subtype }).then(
                (res) => {
                    this.list = res.data.data?.list || [];
                }
            );
        },
    },
    mounted() {
        this.loadData();
    },
};
</script>

<style lang="less">
.c-bbs-banner {
    .mb(10px);
    overflow: hidden;
    .m-carousel .el-carousel__container {
        box-sizing: border-box;
        .size(100%, 300px);
    }
    .u-cover {
        overflow: hidden;
        width: 100%;
        text-align: center;

        img {
            height: 100%;
            width: 100%;
            object-fit: contain;
        }
    }
    .el-image__inner {
        width: auto;
    }
}
</style>
