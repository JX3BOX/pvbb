<template>
    <div class="m-bbs-top">
        <div class="m-bbs-top__header">
            <h3 class="u-title"><i class="el-icon-news"></i>公告</h3>
            <!-- <a href="/notice" class="u-more" target="_blank">全部 &raquo;</a> -->
        </div>
        <div class="m-bbs-top__content">
            <div class="m-bbs-top__item" v-for="item in data" :key="item.id">
                <div class="m-item_left">
                    <div class="u-title" v-html="item"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getBreadcrumb } from "@jx3box/jx3box-common/js/api_misc";
export default {
    data() {
        return {
            data: [],
        };
    },
    mounted() {
        this.getBreadcrumb();
    },
    methods: {
        getBreadcrumb() {
            try {
                const data = sessionStorage.getItem("bbs_ac");

                if (data) {
                    this.data = JSON.parse(data);
                } else {
                    getBreadcrumb('bbs_ac').then(res => {
                        this.data = res.split('\n');

                        sessionStorage.setItem("bbs_ac", JSON.stringify(this.data));
                    })
                }
            } catch (e) {
                this.data = [];
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/bbs/top.less";
</style>
