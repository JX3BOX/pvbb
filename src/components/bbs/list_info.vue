<template>
    <div class="m-bbs-top">
        <div class="m-bbs-top__header">
            <h3 class="u-title"><i class="el-icon-news"></i>官方资讯</h3>
            <a href="/notice" class="u-more" target="_blank">全部 &raquo;</a>
        </div>
        <div class="m-bbs-top__content">
            <div class="m-bbs-top__item" v-for="item in data" :key="item.id">
                <div class="m-item_left">
                    <span class="u-type" :style="itemTypeStyle(item)">{{ itemType(item, "label") }}</span>
                    <a class="u-title" :class="{ 'is-bold': item.color }" :href="postLink(item.ID)" target="_blank" :style="{color:item.color}">{{
                        item.post_title
                    }}</a>
                </div>
                <time class="u-time">{{ fromNow(item.post_modified) }}</time>
            </div>
        </div>
    </div>
</template>

<script>
import { getPosts } from "@/service/post";
import notice_types from "@/assets/data/notice_types.json";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
require("dayjs/locale/zh-cn");
dayjs.locale("zh-cn");
export default {
    name: "list_info",
    data() {
        return {
            data: [],
        };
    },
    mounted() {
        this.getNotice();
    },
    methods: {
        getNotice() {
            const query = {
                per: 3,
                page: 1,
                sticky: 1,
                type: "notice",
            };
            getPosts(query).then((res) => {
                this.data = res.data.data.list;
            });
        },
        itemType({ post_subtype }, key) {
            return notice_types?.[post_subtype]?.[key] || "";
        },
        itemTypeStyle(item) {
            return {};
            return {
                backgroundColor: this.itemType(item, "color"),
            };
        },
        postLink(val) {
            return location.origin + `/notice/` + val;
        },
        // 距离现在时间
        fromNow(time) {
            return dayjs(time).fromNow();
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/bbs/top.less";
</style>
