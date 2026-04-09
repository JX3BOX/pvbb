<template>
    <div class="v-index">
        <el-input class="m-index-search" v-model="search" placeholder="请输入关键词">
            <span slot="prepend"> <i class="el-icon-search"></i> 搜索 </span>
            <span slot="append">
                <i class="el-icon-position"></i>
            </span>
        </el-input>
        <div class="m-index-posts" v-loading="loading">
            <ul class="u-list" v-if="posts && posts.length">
                <li class="u-item" v-for="(item, i) in posts" :key="i">
                    <a class="u-post" :href="postLink(item.ID)" :target="target">
                        <!-- <i class="u-icon">{{showIcon(item.post_subtype)}}</i> -->
                        <span class="u-prefix" :class="'isType-' + item.post_subtype">
                            <i class="u-icon" :class="showTypeIcon(item.post_subtype)"></i>
                            <span class="u-type">[{{ showTypeLabel(item.post_subtype) }}]</span>
                        </span>
                        <span class="u-title" :style="isHighlight(item.color)">{{ item.post_title || "无标题" }}</span>
                        <span class="u-marks" v-if="item.mark && item.mark.length">
                            <i v-for="mark in item.mark" class="u-mark" :class="markcls(mark)" :key="mark">{{
                                showMark(mark)
                            }}</i>
                        </span>
                    </a>
                    <span class="u-misc">
                        <span class="u-author">
                            <a class="u-author-name" :href="authorLink(item.post_author)" target="_blank">{{
                                item.author_info.display_name
                            }}</a>
                            <img
                                class="u-author-avatar"
                                :src="showAvatar(item.author_info.user_avatar)"
                                :alt="item.author_info.display_name"
                            />
                        </span>
                        <span class="u-date">
                            <time>{{ dateFormat(item.post_modified) }}</time>
                        </span>
                    </span>
                </li>
            </ul>
            <el-alert v-else title="没有找到相关条目" type="info" show-icon></el-alert>
            <!-- 分页 -->
            <el-pagination
                class="m-pagination"
                background
                :page-size="per"
                :hide-on-single-page="true"
                v-model:current-page="page"
                layout="total, prev, pager, next, jumper"
                :total="total"
                @current-change="skipTop"
            ></el-pagination>
        </div>
    </div>
</template>

<script>
import { authorLink, showAvatar, buildTarget } from "@jx3box/jx3box-common/js/utils";
import { cms as mark_map } from "@jx3box/jx3box-common/data/mark.json";
import { dateFormat } from "@/utils/dateFormat";
import types from "@/assets/data/bbs_types.json";

import { getPosts } from "@/service/post";

export default {
    name: "Index",
    props: [],
    data: function () {
        return {
            loading: false,
            search: "",
            posts: [],
            per: 20,
            page: 1,
            total: 1,
            icon_map: {
                1: "🔮",
                2: "❤️",
                3: "🎬",
                4: "📄",
            },
            types,
        };
    },
    computed: {
        client: function () {
            return this.$store.state.client;
        },
        params: function () {
            let _ = {
                per: this.per,
                page: ~~this.page || 1,
                sticky: 1,
                client: this.client,
                type: "bbs",
            };
            if (this.search) {
                _.search = this.search;
            }
            return _;
        },
        target: function () {
            return buildTarget();
        },
    },
    methods: {
        showIcon: function (subtype) {
            return this.icon_map[subtype];
        },
        skipTop: function () {
            window.scrollTo(0, 0);
        },
        loadPosts: function () {
            this.loading = true;
            getPosts(this.params, this)
                .then((res) => {
                    this.posts = res.data.data.list;
                    this.total = res.data.data.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        getIconClass: function (subtype) {
            return types[subtype]["icon"] + " " + `u-icon-${subtype}`;
        },
        dateFormat: function (val) {
            return dateFormat(new Date(val));
        },
        showAvatar,
        authorLink,
        postLink: function (val) {
            return location.origin + "/bbs/" + val;
        },
        isHighlight: function (val) {
            return val ? `color:${val};font-weight:600;` : "";
        },
        showMark: function (val) {
            return mark_map[val];
        },
        markcls: function (val) {
            return "u-mark-" + val;
        },
        showTypeLabel: function (val) {
            return types?.[val]?.["label"];
        },
        showTypeIcon: function (val) {
            return types?.[val]?.["icon"];
        },
    },
    watch: {
        search: function () {
            this.page = 1;
        },
        params: {
            immediate: true,
            deep: true,
            handler: function () {
                this.loadPosts();
            },
        },
    },
};
</script>
