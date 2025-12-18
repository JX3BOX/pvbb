<template>
    <div
        class="m-topic-box"
        :style="{
            '--title-color': skin.titleColor,
            '--title-hover-color': skin.titleHoverColor,
            '--border-hover-color': skin.borderHoverColor,
        }"
    >
        <div class="m-topic-top">
            <div class="m-topic-top__time">
                <i :class="getTimeAgo(data.created_at).icon"></i>
                <span>{{ getTimeAgo(data.created_at).text }} </span>
            </div>
            <div class="m-topic-top_right">
                <div class="u-item">
                    <img svg-inline src="@/assets/img/community/talk.svg" alt="" />
                    {{ data.reply_count || 0 }}
                </div>
                <div class="u-item">
                    <img svg-inline src="@/assets/img/community/like.svg" alt="" />
                    {{ data.agree_count || 0 }}
                </div>
                <div
                    @click="onCategoryChange(data.category)"
                    :class="`m-topic-category`"
                    :style="`background-color: ${styles.hoverColor};color:${styles.color};`"
                >
                    <img
                        v-svg-inline
                        class="u-icon"
                        :src="require(`@/assets/img/community/category/${styles.icon}.svg`)"
                    />
                    <div>{{ data.category }}</div>
                </div>
                <img svg-inline class="u-mocha" src="@/assets/img/community/mocha.svg" alt="" />
            </div>
        </div>
        <div
            class="u-box m-topic-box__content"
            :class="[{ withSkin: skin.background }, skin.style]"
            :style="{
                backgroundImage: `url(${skin.background})`,
            }"
        >
            <div class="u-content-aside">
                <a class="m-topic-title" :href="getPostUrl(data.id)" target="_blank" :style="hightStyle">
                    <img svg-inline v-if="isTop" src="@/assets/img/community/is_top.svg" alt="" srcset="" />
                    <img svg-inline v-if="data.is_star" src="@/assets/img/community/is_star.svg" alt="" srcset="" />
                    {{ data.title }}
                </a>
                <a class="u-cover" :href="getPostUrl(data.id)" target="_blank">
                    <el-image :src="getBanner(data)" alt="banner" srcset="" />
                </a>

                <div v-if="data.color_tag && data.color_tag.length" class="m-topic-tag">
                    <span v-for="(item, index) in data.color_tag" :key="index" :style="{ backgroundColor: item.color }">
                        {{ item.label }}
                    </span>
                </div>
                <div
                    class="m-topic-collection"
                    v-if="data.collection_id && data.collection.id && data.collection.title"
                >
                    <a :href="`/collection/${data.collection_id}`" target="_blank">
                        <span class="u-label">小册</span>
                        <span class="u-value">{{ data.collection.title }}</span>
                    </a>
                </div>

                <div class="m-topic-userInfo">
                    <a :href="authorLink(data.ext_user_info.id)" target="_blank" v-if="!data.anonymous">
                        <img class="m-topic-userInfo__avatar" :src="showAvatar()" alt="" srcset="" />
                        <span class="m-topic-userInfo__name">{{ data.ext_user_info.display_name }}</span>
                    </a>
                    <span v-else>
                        <img class="m-topic-userInfo__avatar" :src="showAvatar(true)" alt="" srcset="" />
                        <span class="m-topic-userInfo__name">神秘侠士</span>
                    </span>
                </div>
            </div>

            <a class="u-box-content" :href="getPostUrl(data.id)" target="_blank">
                <a :href="getPostUrl(data.id)" class="m-topic-content" target="_blank">
                    <span class="m-topic-title" target="_blank" :style="hightStyle">
                        <img svg-inline v-if="isTop" src="@/assets/img/community/is_top.svg" alt="" srcset="" />
                        <img svg-inline v-if="data.is_star" src="@/assets/img/community/is_star.svg" alt="" srcset="" />
                        {{ data.title }}
                    </span>
                    <div class="u-introduction" v-html="introduction"></div>
                </a>
                <div v-if="data.extra_images && data.extra_images.length" class="m-topic-imgs scrollbar">
                    <a class="u-item" v-for="(item, index) in data.extra_images" :key="index">
                        <el-image :src="getSquareBanner(item)" fit="fill" />
                    </a>
                </div>
            </a>
        </div>
    </div>
</template>

<script>
import { showAvatar, authorLink, getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { __ossMirror, __cdn } from "@jx3box/jx3box-common/data/jx3box";
import { random } from "lodash";
import { getTimeAgo } from "@/utils/dateFormat";
import { getSkinJson } from "@/service/community";
const skinKey = "community_topic_skin";

export default {
    props: ["data"],
    inject: ["getCategoryStyle", "onCategoryChange"],
    data() {
        return {
            skinJson: {},
        };
    },
    computed: {
        // 卡片皮肤
        skin() {
            if (this.data.decoration_id && this.data.decoration.val) {
                const skinJson = this.skinJson;
                const val = this.data.decoration.val;
                if (skinJson[val]) {
                    return {
                        background: __cdn + `design/decoration/palu/${val}.png`,
                        titleColor: skinJson[val].titleColor,
                        titleHoverColor: skinJson[val].titleHoverColor,
                        borderHoverColor: skinJson[val].borderHoverColor,
                        style: skinJson[val].style || "",
                    };
                }
            }
            // 默认值 未设置返回默认值 实装要判断
            return {
                titleColor: "#0366d6",
                titleHoverColor: "rgba(255, 64, 128, 1)",
                borderHoverColor: "#0366d6",
                style: "",
            };
        },
        hightStyle: function () {
            if (this.data.is_hight && this.data.hight_color) {
                return {
                    color: this.data.hight_color,
                };
            } else {
                return {};
            }
        },
        styles: function () {
            return this.getCategoryStyle(this.data.category || "");
        },
        introduction: function () {
            const data = this.data;
            let introduction = data.introduction;
            // 去掉信封样式的css代码
            introduction = introduction.replace(/\.letter--[\s\S]*$/, "");
            if (introduction) {
                if (introduction.length >= 200) {
                    return introduction + "...";
                } else if (introduction.length <= 0) {
                    return "......";
                } else {
                    return introduction;
                }
            } else {
                return "";
            }
        },
        isTop: function () {
            return this.data.is_top || this.data.is_category_top;
        },
    },
    mounted() {
        this.getSkinJson();
    },
    methods: {
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
        getTimeAgo,
        authorLink,
        getBanner: function (data) {
            if (data.banner_img) {
                if (data.banner_img.indexOf("jx3box.com") >= 0) {
                    if (data.banner_img.indexOf(".webp") > -1) return data.banner_img;
                    return getThumbnail(data.banner_img, [168 * 2, 88 * 2]);
                } else {
                    return data.banner_img;
                }
            } else if (data.extra_images && data.extra_images.length) {
                if (data.extra_images[0].indexOf("jx3box.com") >= 0) {
                    return getThumbnail(data.extra_images[0], [168 * 2, 88 * 2]);
                } else {
                    return data.extra_images[0];
                }
            } else {
                // 从1-39中随机选一个
                const randomNum = random(1, 39);
                return __cdn + `design/random_cover/${randomNum}.jpg`;
            }
        },
        getSquareBanner: function (val) {
            if (val.indexOf("jx3box.com") >= 0) {
                return getThumbnail(val, 48 * 2);
            }
            return val;
        },
        showAvatar: function (isDefault = false) {
            // return showAvatar(this.data?.ext_user_info?.avatar);
            return isDefault ? showAvatar(`${__cdn}/design/avatar/xisai/0-1.png`) : showAvatar(this.data?.ext_user_info?.avatar);
        },
        getPostUrl(id) {
            return `/community/${id}`;
        },
    },
};
</script>
