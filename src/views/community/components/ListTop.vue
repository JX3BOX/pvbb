<template>
    <div class="m-community-top" v-if="data.length">
        <div class="m-community-top__header">
            <h3 class="u-title"><i class="el-icon-news"></i>{{ $t("pages.community.list.notice") }}</h3>
            <!-- <a href="/notice" class="u-more" target="_blank">全部 &raquo;</a> -->
        </div>
        <div class="m-community-top__content">
            <div class="m-community-top__item" v-for="item in data" :key="item.id">
                <div class="m-item_left">
                    <div class="u-title" v-html="renderNotice(item)"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getBreadcrumb } from "@jx3box/jx3box-common/js/system";
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import sanitizeRichText from "@jx3box/jx3box-editor/src/assets/js/xss";
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
        renderNotice(item) {
            return resolveImagePath(sanitizeRichText(item));
        },
        getBreadcrumb() {
            try {
                const data = sessionStorage.getItem("bbs_ac");

                if (data) {
                    this.data = JSON.parse(data);
                } else {
                    getBreadcrumb('bbs_ac').then(res => {
                        this.data = res && res.split('\n') || [];

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
@import "~@/assets/css/community/list_top.less";
</style>
