<template>
    <div v-if="ids && ids.length" class="m-archive-list">
        <ul class="u-list">
            <li class="u-item">
                <!-- Banner -->
                <a class="u-banner" :href="getLink(item)" :target="target"
                    ><img :src="getBanner(item.post_banner, item.post_subtype)" :key="item.ID"
                /></a>

                <!-- 标题 -->
                <h2 class="u-post" :class="{ isSticky: item.sticky }">
                    <!-- 图标 -->
                    <img class="u-icon" svg-inline src="../../assets/img/list/post.svg" />

                    <!-- 资料片 -->
                    <span class="u-label u-zlp">置顶</span>

                    <!-- 标题文字 -->
                    <a class="u-title" :style="item.color | showHighlight" :href="getLink(item)" :target="target">{{
                        item.post_title || "无标题"
                    }}</a>

                    <!-- 角标 -->
                    <span class="u-marks" v-if="item.mark && item.mark.length">
                        <i v-for="mark in item.mark" class="u-mark" :key="mark">{{ mark | showMark }}</i>
                    </span>
                </h2>

                <!-- 字段 -->
                <div class="u-content u-desc">
                    {{ item.post_excerpt || item.post_title || "这个作者很懒,什么都没有留下" }}
                </div>

                <!-- 字段 -->
                <!-- <div class="u-content u-desc">
                    <div class="u-metalist u-collection">
                        <strong>小册</strong>
                        <em>
                            <template v-if="~~item.post_collection">
                                <a :href="`/collection/${item.post_collection}`" target="_blank"
                                    >《{{ item.collection_info && item.collection_info.title }}》</a
                                >
                            </template>
                            <template v-else>-</template>
                        </em>
                    </div>
                    <div class="u-metalist u-topics">
                        <strong>主题</strong>
                        <em>
                            <template v-if="item.topics && item.topics.length">
                                <a class="u-topic" :href="`/bbs?tag=${topic}`" v-for="topic in item.topics" :key="topic">{{
                                    topic
                                }}</a>
                            </template>
                            <template v-else>-</template>
                        </em>
                    </div>
                </div> -->

                <!-- 作者 -->
                <div class="u-misc">
                    <div class="u-ids">
                        <div class="u-id" @click.stop="onTopIdClick(_id)" v-for="(_id, index) in ids" :key="_id" :class="{ 'active': current == _id }">
                            {{ index+1 }}
                        </div>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { appKey } from "@/../setting.json";
import { showAvatar, authorLink, showBanner, buildTarget, getLink } from "@jx3box/jx3box-common/js/utils";
import { __ossMirror, __imgPath } from "@jx3box/jx3box-common/data/jx3box";
import { cms as mark_map } from "@jx3box/jx3box-common/data/mark.json";
import { showDate } from "@jx3box/jx3box-common/js/moment.js";
import _bbsSubtypes from "@/assets/data/bbs_subtypes.json";
import { getBreadcrumb } from "@jx3box/jx3box-common/js/api_misc";
import { getPosts } from "@/service/post"
export default {
    name: "list_top",
    data() {
        return {
            ids: [],

            item: {},

            current: "",

            target: buildTarget(),
        };
    },
    mounted() {
        this.loadBreadcrumb();
    },
    methods: {
        loadBreadcrumb() {
            getBreadcrumb("bbs_top").then((res) => {
                this.ids = res ? res?.split(",") : [];

                if (this.ids.length) {
                    this.current = this.ids[0];

                    this.loadPost();
                }
            });
        },
        getBanner: function(val, subtype) {
            if (val) {
                return showBanner(val);
            } else {
                return __imgPath + `image/banner/${appKey}${subtype}` + ".png";
            }
        },
        showSubtype: function(val) {
            return _bbsSubtypes[val]?.label || "";
        },
        loadPost() {
            const params = {
                list: this.current,
            }
            getPosts(params).then((res) => {
                this.item = res.data.data.list[0];
            });
        },
        onTopIdClick(id) {
            this.current = id;
            this.loadPost();
        },
        getLink(item) {
            return getLink(item.post_type, item.ID)
        }
    },
    filters: {
        authorLink,
        postLink: function(val) {
            return location.origin + `/${appKey}/` + val;
        },
        showHighlight: function(val) {
            return val ? `color:${val};font-weight:600;` : "";
        },
        showMark: function(val) {
            return mark_map[val] || val;
        },
        showAvatar: function(userinfo) {
            return showAvatar(userinfo?.user_avatar);
        },
        showNickname: function(userinfo) {
            return userinfo?.display_name || "匿名";
        },
        dateFormat: function(gmt) {
            return showDate(new Date(gmt));
        },
    },
};
</script>

<style lang="less">
.u-misc {
    .u-ids {
        .flex;
    }
    .u-id {
        margin: 0 5px;
        background-color: #f4f4f5;
        color: #606266;
        min-width: 30px;
        border-radius: 2px;

        font-size: 13px;
        height: 28px;
        line-height: 28px;
        box-sizing: border-box;
        text-align: center;

        .pointer;

        &.active {
            background-color: @color-link;
            color: #fff;
            cursor: default;
        }
    }
}
</style>
