<template>
    <li class="u-item u-community-item" :class="{ hasMoka: skin.background }">
        <div v-if="skin.background" class="u-bg-art">
            <i class="u-bg-mask"></i>
            <img class="u-bg-image" :src="skin.background" alt="" />
        </div>
        <!-- Banner -->
        <a class="u-banner" :href="postLink(item.id)" :target="target">
            <img :src="getBanner(item.banner_img, item.post_subtype)" :key="item.ID" />
        </a>
        <!-- 标题 -->
        <h2 class="u-post" :class="{ isSticky: item.sticky }">
            <!-- 资料片 -->
            <!-- <span class="u-label u-zlp" v-if="item.post_subtype && showSubtype(item.post_subtype)">{{ showSubtype(item.post_subtype) }}</span> -->

            <img svg-inline class="u-icon" v-if="isTop" src="@/assets/img/community/is_top.svg" alt="" srcset="" />
            <img
                svg-inline
                class="u-icon"
                v-if="item.is_star"
                src="@/assets/img/community/is_star.svg"
                alt=""
                srcset=""
            />

            <template v-if="item.color_tag">
                <template v-for="(_item, index) in item.color_tag" :key="index">
                    <a
                        class="u-label"
                        target="_blank"
                        :href="getLink(_item)"
                        :class="_item.label == '已解决' ? 'is-help' : ''"
                    >
                        {{ _item.label }}
                    </a>
                </template>
            </template>

            <!-- 标题文字 -->
            <a
                class="u-title"
                :style="hightStyle"
                :href="postLink(item.id)"
                :target="target"
                v-html="highlightText(item.title)"
            >
            </a>

            <!-- 角标 -->
            <!-- <span class="u-marks" v-if="item.mark && item.mark.length">
showMark(<i v-for="mark in item.mark" class="u-mark" :key="mark">{{ mark) }}</i>
            </span> -->

            <span class="u-push" v-if="hasPermission">
                <time v-if="showPushDate" class="u-push__time" :class="{ 'is-recent': isRecent() }"
                    >{{ pushDate }} 已推送</time
                >
                <el-button
                    class="u-push__btn"
                    size="small"
                    type="warning"
                    :disabled="pushing"
                    @click="onPush"
                    icon="Promotion"
                    >推送</el-button
                >
            </span>
        </h2>

        <!-- 字段 -->
        <div class="u-content u-desc">
            <div class="u-metalist u-collection">
                <strong>摘要</strong>
                <em>
                    <span v-html="highlightText(item.introduction)"></span>
                </em>
            </div>
            <div class="u-metalist u-topics">
                <strong>标签</strong>
                <em>
                    <a class="u-topic" :href="`/community?category=${item.category}&page=1`" target="_blank">{{
                        showCategory(item.category)
                    }}</a>
                </em>
                <em v-if="~~item.collection_id">
                    <a class="u-topic u-collection" :href="`/collection/${item.collection_id}`" target="_blank"
                        >《{{ item.collection && item.collection.title.replace(/(^《|》$)/g, "") }}》</a
                    >
                </em>
            </div>
        </div>

        <!-- 作者 -->
        <div class="u-misc">
            <div class="u-misc__author">
                <img
                    class="u-author-avatar"
                    :src="showAvatar(item.ext_user_info)"
                    :alt="showNickname(item.ext_user_info)"
                />
                <a class="u-author-name" :href="authorLink(item.user_id)" target="_blank" v-if="!item.anonymous">{{
                    showNickname(item.ext_user_info)
                }}</a>
                <span v-else>神秘侠士</span>
            </div>
            <span class="u-date">
                <!-- Updated on
                <time v-if="order == 'update'">{{ dateFormat(item.post_modified) }}</time>
                <time v-else>{{ dateFormat(item.updated_at) }}</time> -->

                Last replied on
                <time>{{ dateFormat(item.latest_reply_at) }}</time>
            </span>
        </div>
    </li>
</template>

<script>
import { showAvatar, authorLink, showBanner, buildTarget, postLink } from "@jx3box/jx3box-common/js/utils";
import { __cdn } from "@/utils/config";
import markMap from "@jx3box/jx3box-common/data/mark.json";
import { showDate } from "@jx3box/jx3box-common/js/moment.js";
import _bbsSubtypes from "@/assets/data/bbs_subtypes.json";
import { random } from "lodash";
import User from "@jx3box/jx3box-common/js/user";
import dayjs from "dayjs";
import bus from "@/utils/bus";
import { getSkinJson } from "@/service/community";
const appKey = "community";
const skinKey = "community_topic_skin";
import { tabsMap, designTaskCategoryMap } from "@/assets/data/community_category.js";

export default {
    name: "ListItem",
    props: ["item", "order", "keyword"],
    components: {},
    data: function () {
        return {
            target: buildTarget(),

            start: 1,
            end: 39,
            pushing: false,

            skinJson: {},
        };
    },
    computed: {
        client() {
            return this.item?.client;
        },
        hasPermission() {
            return User.hasPermission("push_banner");
        },
        pushDate() {
            const date = this.item?.log?.push_at;
            return date ? showDate(new Date(date)) : "";
        },
        showPushDate() {
            return Boolean(this.item?.log?.push_at);
        },
        isTop: function () {
            return this.item.is_top || this.item.is_category_top;
        },
        hightStyle: function () {
            if (this.item.is_hight && this.item.hight_color) {
                return {
                    color: this.item.hight_color,
                };
            } else {
                return {};
            }
        },
        // 卡片皮肤
        skin() {
            if (this.item.decoration_id && this.item.decoration.val) {
                const skinJson = this.skinJson;
                const val = this.item.decoration.val;
                if (skinJson[val]) {
                    return {
                        background: __cdn + `design/decoration/palu/${val}.png`,
                        titleColor: skinJson[val].titleColor,
                        titleHoverColor: skinJson[val].titleHoverColor,
                        borderHoverColor: skinJson[val].borderHoverColor,
                    };
                }
            }
            // 默认值 未设置返回默认值 实装要判断
            return {
                titleColor: "#0366d6",
                titleHoverColor: "rgba(255, 64, 128, 1)",
                borderHoverColor: "#0366d6",
            };
        },
        tags: function () {
            return this.$store.state.tags;
        },
    },
    watch: {},
    methods: {
        showCategory: function (val) {
            return tabsMap[val] || val || "未分类";
        },
        getBanner: function (val, subtype) {
            if (val) {
                return showBanner(val);
            } else {
                // 从1-39中随机选一个
                const randomNum = random(this.start, this.end);
                return __cdn + `design/random_cover/${randomNum}.jpg`;
            }
        },
        reporterLink: function (val) {
            const prefix = this.client === "std" ? "www" : "origin";
            return `${prefix}:/${appKey}/` + val;
        },
        showSubtype: function (val) {
            return _bbsSubtypes[val]?.label || "";
        },
        showDate,
        // 是否为30天内
        isRecent: function () {
            const date = this.item?.log?.push_at;
            return dayjs().diff(dayjs(date), "day") < 30;
        },
        onPush() {
            if (this.pushing) return;
            this.pushing = true;
            const data = {
                post_type: "community",
                post_title: this.item.title,
                ID: this.item.id,
                author: this.item?.ext_user_info?.display_name || "匿名",
                client: this.item.client,

                subtype: designTaskCategoryMap[this.item.category] || "",
            };
            bus.emit("design-task", data);
            setTimeout(() => {
                this.pushing = false;
            }, 300);
        },
        postLink: function (val) {
            return location.origin + `/${appKey}/` + val;
        },
        getSkinJson() {
            const skinJson = sessionStorage.getItem(skinKey);
            if (skinJson) {
                this.skinJson = JSON.parse(skinJson);
            } else {
                getSkinJson().then((res) => {
                    this.skinJson = res.data;
                    sessionStorage.setItem(skinKey, JSON.stringify(res.data));
                });
            }
        },
        // 高亮搜索关键字
        highlightText(text) {
            if (!this.keyword) return text;
            const regex = new RegExp(`(${this.keyword})`, "gi");
            text = text.replace(regex, '<span style="background-color: #ffff00; color: #ff0000;">$1</span>');
            return text;
        },
        getLink(item) {
            // 往当前url上加上tag查询参数
            const url = new URL(window.location.href);
            url.searchParams.set("tag", item.label);
            return url.toString();
        },
        getBg(label) {
            const item = this.tags.find((tag) => tag.label === label);
            return (item?.icon && `${__cdn}${item.icon}`) || "";
        },
        getBgStyle(item) {
            return {
                backgroundColor: item.color,
                backgroundImage: this.getBg(item.label) ? `url(${this.getBg(item.label)})` : "none",
            };
        },
        authorLink,
        showHighlight: function (val) {
            return val ? `color:${val};font-weight:600;` : "";
        },
        showMark: function (val) {
            return (markMap.cms && markMap.cms[val]) || val;
        },
        showAvatar: function (userinfo) {
            return showAvatar(userinfo?.avatar);
        },
        showNickname: function (userinfo) {
            return userinfo?.display_name || "匿名";
        },
        dateFormat: function (gmt) {
            return showDate(new Date(gmt));
        },
    },
    mounted: function () {
        this.getSkinJson();
    },
};
</script>

<style lang="less">
.u-community-item {
    .pr;
    overflow: hidden;
    padding-top: 20px;
    // border-radius: 4px;
    padding-left: 10px;
    transition: border-color 0.2s ease;

    .u-bg-art {
        .pa;
        inset: 0;
        left: auto;
        width: 50%;
        z-index: 0;
        pointer-events: none;

        .u-bg-mask,
        .u-bg-image {
            .pa;
            inset: 0;
        }

        .u-bg-mask {
            z-index: 1;
            background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.9) 0%,
                rgba(255, 255, 255, 0.82) 18%,
                rgba(255, 255, 255, 0.6) 40%,
                rgba(255, 255, 255, 0.3) 62%,
                rgba(255, 255, 255, 0.08) 82%,
                rgba(255, 255, 255, 0) 100%
            );
        }

        .u-bg-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: right center;

            // mask-image: linear-gradient(
            //     to right,
            //     black 0%,
            //     black 20%,
            //     rgba(0, 0, 0, 0.6) 40%,
            //     rgba(0, 0, 0, 0.2) 60%,
            //     transparent 100%
            // );
        }

        &::after {
            content: "";
            position: absolute;
            inset: 0;

            background: white;
            mask-image: linear-gradient(to right, black, transparent);
            filter: blur(30px);
        }
    }

    // &:hover {
    //     border: 1px solid @v4primary !important;
    // }

    > *:not(.u-bg-art) {
        .pr;
        z-index: 1;
    }

    .u-metalist {
        .nobreak;
        .db;
        .fz(12px, 25px);
        .mb(4px);
        strong {
            .dbi;
            .y(top);
            padding: 0 10px;
            .mr(10px);
            .r(4px);
            background-color: #f1f8ff;
            color: @v4primary;
            font-weight: normal;
        }
        em {
            font-style: normal;
        }
        b {
            font-weight: normal;
        }
        a {
            color: #333;
            &:hover {
                color: @v4primary;
                box-shadow: 0 1px 0 @v4primary;
            }
        }
    }

    .u-post {
        .flex(y);
        .pr;
        align-items: center;
        .nobreak;

        .u-label {
            font-size: 12px;
            line-height: 1.2;
            height: auto;
            border-radius: 3px;
            margin-right: 5px;
            padding: 2px 5px;
            border: 1px solid #fa80a2;
            color: #fa80a2;
            white-space: nowrap;
        }
        .u-title {
            .nobreak;
        }
    }
    .u-post-icon {
        width: 18px;
        height: 18px;
        margin-right: 5px;
        flex-shrink: 0;
    }
    .u-topic {
        // background-color: @bg-gray;
        // padding: 3px 5px;
        // .r(2px);
        .mr(5px);
        box-shadow: none !important;
        // &:hover {
        //     box-shadow: none !important;
        //     // background-color: #def;
        // }
    }

    .u-label.is-help {
        border: 1px solid #58cb49;
        color: #42bf32;
        background: #f6fff2;
    }
}
</style>
