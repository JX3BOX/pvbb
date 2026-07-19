<template>
    <li class="u-item u-community-item" :class="{ hasMoka: skin.background }">
        <div v-if="skin.background" class="u-bg-art" :class="`is-fade-${skin.fade}`">
            <i class="u-bg-mask"></i>
            <img class="u-bg-image" :src="skin.background" :style="skin.imageStyle" alt="" />
        </div>
        <!-- Banner -->
        <a class="u-banner" :href="postLink(item.id)" :target="target">
            <img :src="getBanner(item.banner_img, item.post_subtype)" :key="item.id" />
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
                    >{{ $t("pages.community.list.pushedAt", { time: pushDate }) }}</time
                >
                <el-button
                    class="u-push__btn"
                    size="small"
                    type="warning"
                    :disabled="pushing"
                    @click="onPush"
                    icon="Promotion"
                    >{{ $t("pages.community.list.push") }}</el-button
                >
            </span>
        </h2>

        <!-- 字段 -->
        <div class="u-content u-desc">
            <div class="u-metalist u-collection">
                <strong>{{ $t("pages.community.list.summary") }}</strong>
                <em>
                    <span v-html="highlightText(item.introduction)"></span>
                </em>
            </div>
            <div class="u-metalist u-topics">
                <strong>{{ $t("pages.community.list.tags") }}</strong>
                <em>
                    <a class="u-topic" :href="`/community?category=${item.category}&page=1`" target="_blank">{{
                        showCategory(item.category)
                    }}</a>
                </em>
                <em v-if="~~item.collection_id && item.collection?.title">
                    <a class="u-topic u-collection" :href="`/collection/${item.collection_id}`" target="_blank">
                        {{
                            $t("pages.community.list.collectionTitle", {
                                title: item.collection.title.replace(/(^《|》$)/g, ""),
                            })
                        }}
                    </a>
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
                <span v-else>{{ $t("pages.community.common.mysteriousHero") }}</span>
            </div>
            <span class="u-date">
                {{ $t(`pages.community.list.${displayTimeKey}`, { date: dateFormat(displayTime) }) }}
            </span>
        </div>
    </li>
</template>

<script>
import { showAvatar, authorLink, showBanner, buildTarget, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { __cdn } from "@/utils/config";
import markMap from "@jx3box/jx3box-common/data/mark.json";
import { showDate } from "@jx3box/jx3box-common/js/moment.js";
import _bbsSubtypes from "@/assets/data/bbs_subtypes.json";
import User from "@jx3box/jx3box-common/js/user";
import dayjs from "dayjs";
import bus from "@/utils/bus";
import { resolveCommunitySkin } from "@/utils/community-skin";
const appKey = "community";
const positionMap = {
    lt: "left top",
    rt: "right top",
    rb: "right bottom",
    lb: "left bottom",
    ct: "center center",
    centop: "center top",
    cb: "center bottom",
    o: "right center",
};
import { tabsMap, designTaskCategoryMap } from "@/assets/data/community_category.js";
import { escapeHtml } from "@/utils/community";
import { getRandomCoverIndex } from "@/utils/random-cover";

export default {
    name: "ListItem",
    props: ["item", "order", "keyword"],
    components: {},
    data: function () {
        return {
            target: buildTarget(),
            pushing: false,
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
        displayTimeType() {
            if (Number(this.order) === 0) return "updated";
            if (Number(this.order) === 1) return "replied";

            const updatedAt = new Date(this.item?.updated_at).getTime() || 0;
            const repliedAt = new Date(this.item?.latest_reply_at).getTime() || 0;
            return updatedAt >= repliedAt ? "updated" : "replied";
        },
        displayTime() {
            return this.displayTimeType === "updated" ? this.item?.updated_at : this.item?.latest_reply_at;
        },
        displayTimeKey() {
            return this.displayTimeType === "updated" ? "lastUpdatedAt" : "lastRepliedAt";
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
            const config = resolveCommunitySkin(this.item.decoration_skin);
            if (config) {
                const fit = ["cover", "contain", "fill"].includes(config.fit) ? config.fit : "cover";
                const opacity = Math.min(1, Math.max(0, Number(config.opacity ?? 1)));
                const fade = ["none", "light", "soft", "strong"].includes(config.fade) ? config.fade : "soft";
                return {
                    background: __cdn + `design/decoration/palu/${config.name}.png`,
                    fade,
                    imageStyle: {
                        objectPosition: positionMap[config.position] || positionMap.rt,
                        objectFit: fit,
                        opacity,
                    },
                };
            }
            // 默认值 未设置返回默认值 实装要判断
            return {
                fade: "soft",
                imageStyle: {},
            };
        },
        tags: function () {
            return this.$store.state.tags;
        },
    },
    watch: {},
    methods: {
        showCategory: function (val) {
            if (tabsMap[val]) {
                return this.$t(`pages.community.categories.${val}`);
            }
            return val || this.$t("pages.community.common.uncategorized");
        },
        getBanner: function (val, subtype) {
            if (val) {
                return showBanner(resolveImagePath(val));
            } else {
                return __cdn + `design/random_cover/${getRandomCoverIndex(this.item)}.jpg`;
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
                author: this.item?.ext_user_info?.display_name || this.$t("pages.community.common.anonymous"),
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
        // 高亮搜索关键字
        highlightText(text) {
            const safeText = escapeHtml(text);
            if (!this.keyword) return safeText;
            const safeKeyword = escapeHtml(this.keyword).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`(${safeKeyword})`, "gi");
            return safeText.replace(regex, '<span class="u-highlight">$1</span>');
        },
        getLink(item) {
            // 往当前url上加上tag查询参数
            const url = new URL(window.location.href);
            url.searchParams.set("tag", item.label);
            return url.toString();
        },
        getBg(label) {
            const item = this.tags.find((tag) => tag.label === label);
            return (item?.icon && resolveImagePath(`${__cdn}${item.icon}`)) || "";
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
            return resolveImagePath(showAvatar(userinfo?.avatar));
        },
        showNickname: function (userinfo) {
            return userinfo?.display_name || this.$t("pages.community.common.anonymous");
        },
        dateFormat: function (gmt) {
            return showDate(new Date(gmt));
        },
    },
};
</script>

<style lang="less">
.u-community-item .u-highlight {
    background-color: #ffff00;
    color: #ff0000;
}
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

        &.is-fade-none .u-bg-mask {
            display: none;
        }

        &.is-fade-light .u-bg-mask {
            background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.38) 0%,
                rgba(255, 255, 255, 0.2) 28%,
                rgba(255, 255, 255, 0.06) 55%,
                rgba(255, 255, 255, 0) 78%
            );
        }

        &.is-fade-strong .u-bg-mask {
            background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 1) 0%,
                rgba(255, 255, 255, 0.96) 28%,
                rgba(255, 255, 255, 0.82) 52%,
                rgba(255, 255, 255, 0.48) 74%,
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

        &.is-fade-strong::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 2;
            background: rgba(255, 255, 255, 0.78);
            mask-image: linear-gradient(90deg, black 0%, black 38%, rgba(0, 0, 0, 0.7) 68%, transparent 100%);
            filter: blur(18px);
            transform: scale(1.06);
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
