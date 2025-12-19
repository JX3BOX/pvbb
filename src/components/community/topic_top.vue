<template>
    <div>
        <div
            class="m-topic-hot m-topic-box"
            :class="skin.style"
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
                </div>
            </div>
            <div
                class="m-topic-box__content"
                :style="{
                    backgroundImage: `url(${skin.background})`,
                }"
            >
                <div class="m-topic-hot__left">
                    <a class="u-cover" :href="getPostUrl(data.id)">
                        <el-image :src="getBanner(data.banner_img)" alt="banner" srcset="" />
                    </a>
                    <div class="m-topic-imgs scrollbar">
                        <a
                            :href="getPostUrl(data.id)"
                            class="u-item"
                            v-for="(item, index) in data.extra_images"
                            :key="index"
                        >
                            <el-image :src="getSquareBanner(item)" />
                        </a>
                    </div>
                </div>
                <div class="m-topic-hot__right">
                    <a :style="hightStyle" :href="getPostUrl(data.id)" class="u-title" target="_blank">
                        <img svg-inline v-if="isTop" src="@/assets/img/community/is_top.svg" alt="" srcset="" />
                        <img svg-inline v-if="data.is_star" src="@/assets/img/community/is_star.svg" alt="" srcset="" />
                        <span>
                            {{ data.title }}
                        </span>
                    </a>
                    <div v-if="data.color_tag && data.color_tag.length" class="m-topic-tag">
                        <span v-for="(item, index) in data.color_tag" :key="index" :style="{ background: item.color }">
                            {{ item.label }}
                        </span>
                    </div>
                    <div
                        class="m-topic-collection"
                        v-if="data.collection_id && data.collection.id && data.collection.title"
                    >
                        <a :href="`/collection/${data.collection_id}`">
                            <span class="u-label">小册</span>
                            <span class="u-value">{{ data.collection.title }}</span>
                        </a>
                    </div>

                    <div class="m-topic-userInfo">
                        <a :href="authorLink(data.ext_user_info.id)" target="_blank" v-if="!data.anonymous">
                            <img class="m-topic-userInfo__avatar" :src="avatarUrl" alt="" srcset="" />
                            <span class="m-topic-userInfo__name">{{ data.ext_user_info.display_name }}</span>
                        </a>
                        <span v-else>
                            <img class="m-topic-userInfo__avatar" :src="avatarUrl" alt="" srcset="" />
                            <span class="m-topic-userInfo__name">神秘侠士</span>
                        </span>
                    </div>
                    <a :href="getPostUrl(data.id)" class="m-topic-content" target="_blank">
                        <div v-html="introduction"></div>
                    </a>
                </div>
            </div>
        </div>
        <!-- 移动端兼容置顶文章 -->
        <div class="m-topic-list m-topic-hot__mini">
            <TopicItem :data="data" />
        </div>
    </div>
</template>

<script>
import { getTimeAgo } from "@/utils/dateFormat";
import TopicItem from "@/components/community/topic_item.vue";
import { random } from "lodash";
import { __ossMirror, __cdn } from "@jx3box/jx3box-common/data/jx3box";
import { showAvatar, authorLink, getThumbnail } from "@jx3box/jx3box-common/js/utils";
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
    components: {
        TopicItem,
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
                        style: skinJson[val].style,
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
        hightStyle: function () {
            if (this.data.is_hight && this.data.hight_color) {
                return {
                    color: this.data.hight_color,
                };
            } else {
                return {};
            }
        },
        introduction: function () {
            const data = this.data;
            if (data.introduction) {
                if (data.introduction.length >= 200) {
                    return data.introduction + "...";
                } else if (data.introduction.length <= 0) {
                    return "......";
                } else {
                    return data.introduction;
                }
            } else {
                return "";
            }
        },
        styles: function () {
            return this.getCategoryStyle(this.data.category || "");
        },
        isTop: function () {
            return this.data.is_top || this.data.is_category_top;
        },
        avatarUrl: function () {
            return showAvatar(this.data?.ext_user_info?.avatar);
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
        getBanner: function (val) {
            if (val) {
                if (val.indexOf("jx3box.com") >= 0) {
                    return getThumbnail(val, [336 * 2, 176 * 2]);
                } else {
                    return val;
                }
            } else {
                // 从1-39中随机选一个
                const randomNum = random(1, 39);
                return __cdn + `design/random_cover/${randomNum}.jpg`;
            }
        },
        getPostUrl(id) {
            return `/community/${id}`;
        },
        getSquareBanner: function (val) {
            if (val.indexOf("jx3box.com") >= 0) {
                return getThumbnail(val, 48 * 2);
            }
            return val;
        },
    },
};
</script>

<style lang="less">
.m-topic-hot {
    margin: 0 24px 24px 24px;
    .m-topic-hot__left {
        min-width: 336px;
        width: 336px;
        padding-right: 24px;
        margin-right: 24px;
        border-right: 1px solid rgba(229, 229, 229, 1);
        display: flex;
        flex-direction: column;
        gap: 8px;
        .u-cover {
            cursor: pointer;
            width: 100%;
            height: 176px;
            overflow: hidden;
            border-radius: 8px;
            .el-image {
                width: 100%;
                height: 100%;
            }
            img {
                object-fit: cover;
            }
        }
    }
    .m-topic-hot__right {
        width: 100%;
        display: flex;
        flex-direction: column;
        .u-title {
            margin-bottom: 12px;
            font-size: 22px;
            cursor: pointer;
            line-height: 32px;
            color: var(--title-color);
            font-weight: bold;
            // &:hover {
            //     color: rgba(255, 64, 128, 1);
            // }
            > svg {
                position: relative;
                top: -1px;
                width: 24px;
                height: 24px;
                display: inline-block;
                vertical-align: middle;
            }
            > svg + svg {
                margin-left: 8px;
            }
            > span {
                margin-left: 4px;
            }
        }
        .m-topic-tag {
            margin-bottom: 12px;
        }
        .m-topic-collection {
            margin-bottom: 12px;
        }
        .m-topic-userInfo {
            margin-bottom: 28px;
            .m-topic-userInfo__avatar {
                width: 20px;
                height: 20px;
            }
            .m-topic-userInfo__name {
                font-size: 15px;
                color: var(--user-color);
            }
            :hover {
                .m-topic-userInfo__name {
                    color: var(--user-hover-color);
                }
            }
        }

        .m-topic-content {
            display: -webkit-box;
            -webkit-line-clamp: 4; /* 控制显示的行数 */
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            color: var(--desc-color);
        }
    }
    &.dark {
        .m-topic-collection {
            a {
                border: 1px solid #fff;
            }
            .u-value {
                color: #fff;
            }
        }
        .m-topic-hot__right {
            color: #fff;
            padding: 10px;
            border-radius: 8px;
            box-sizing: border-box;
            background-color: rgba(0, 0, 0, 0.6);
            .u-title {
                .color(#fff,#fff);
            }
        }
        .m-topic-userInfo {
            .m-topic-userInfo__name {
                .color(#fff,#fff);
            }
        }
    }
}
.m-topic-hot__mini {
    display: none;
}
@media screen and (max-width: @ipad) {
    .m-topic-hot {
        display: none;
    }
    .m-topic-hot__mini {
        display: block;
    }
}
</style>
