<template>
    <div class="m-emotion-item" :class="isSingle ? 'single' : 'list'">
        <div class="u-emotion">
            <div class="u-img" @click="preview">
                <img
                    class="u-pic u-emotion-pic waterfall-img"
                    :src="showEmotion(emotion.url)"
                    :alt="emotion.desc"
                    :key="emotion.url"
                />
            </div>
            <i class="u-star" v-if="emotion.star">
                <i class="el-icon-star-off"></i>
                <i class="u-original" v-if="emotion.original">{{ $t("pages.emotion.original") }}</i>
            </i>
        </div>

        <div class="u-info" v-if="isSingle">
            <div class="u-info-user">
                <div class="u-info-user-left">
                    <img class="u-user-avatar waterfall-img" :src="userAvatar" :key="userAvatar" />
                    <a class="u-user-name" :href="userLink" target="_blank" v-if="emotion.user_id">{{ userName }}</a>
                    <span class="u-user-name" v-else>{{ emotion.author || $t("pages.emotion.anonymous") }}</span>
                </div>
                <time class="u-time">{{ updatedAt }}</time>
            </div>
            <div class="u-info-thx">
                <Thx
                    class="m-thx m-content-thx"
                    :postId="emotion.id"
                    postType="emotion"
                    :postTitle="title"
                    :userId="emotion.user_id"
                    :author-id="emotion.user_id"
                    :adminBoxcoinEnable="true"
                    :userBoxcoinEnable="true"
                    client="all"
                />
                <div class="m-single-comment m-content-comment">
                    <div class="m-single-comment-title">{{ $t("pages.emotion.comments") }}</div>
                    <CommonComment :id="emotion.id" category="emotion" />
                </div>
            </div>
        </div>

        <div class="u-item-bottom" v-else>
            <div class="u-info-user">
                <a class="u-user-name" :href="userLink" target="_blank" v-if="emotion.user_id">
                    <img class="u-user-avatar waterfall-img" :src="userAvatar" :key="userAvatar" />
                    {{ userName }}
                </a>
                <span class="u-user-name" v-else>
                    <img class="u-user-avatar waterfall-img" :src="userAvatar" :key="userAvatar" />
                    {{ emotion.author || $t("pages.emotion.anonymous") }}
                </span>
            </div>
            <div class="u-info-misc">
                <time class="u-time">{{ updatedAt }}</time>
                <span
                    v-if="isEditor"
                    class="u-op-item u-op-star el-link el-link--primary"
                    :class="{ 'is-disabled': starLoading, on: emotion.star }"
                    @click="$emit('star', emotion)"
                >
                    <i :class="emotion.star ? 'el-icon-star-off' : 'el-icon-star-on'"></i>
                    {{ emotion.star ? $t("pages.emotion.cancelFeatured") : $t("pages.emotion.setFeatured") }}
                </span>
                <a
                    v-else
                    class="u-like"
                    :class="{ on: emotion.isLike }"
                    :title="$t('pages.emotion.like')"
                    @click="$emit('like', emotion)"
                >
                    <i class="like-icon">{{ emotion.isLike ? "♥ " : "♡ " }}</i>
                    <span class="like-text">Like</span>
                    <span class="like-count" v-if="emotion.count">{{ emotion.count }}</span>
                </a>
            </div>
        </div>
    </div>
</template>

<script>
import { authorLink, getThumbnail, resolveImagePath, showAvatar } from "@jx3box/jx3box-common/js/utils";
import { getRelativeTime } from "@/utils/dateFormat.js";
import CommonComment from "@jx3box/jx3box-ui/src/single/Comment.vue";

export default {
    name: "EmotionItem",
    components: {
        CommonComment,
    },
    props: {
        emotion: {
            type: Object,
            default: () => ({}),
        },
        mode: {
            type: String,
            default: "list",
        },
        isEditor: {
            type: Boolean,
            default: false,
        },
        starLoading: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["preview", "star", "like"],
    computed: {
        isSingle() {
            return this.mode === "single";
        },
        title() {
            return this.emotion?.desc || this.$t("pages.emotion.untitled");
        },
        userAvatar() {
            return showAvatar(this.emotion?.user_info?.user_avatar);
        },
        userLink() {
            return authorLink(this.emotion?.user_id) || "";
        },
        userName() {
            return this.emotion?.user_info?.display_name?.slice(0, 12) || this.$t("pages.emotion.anonymous");
        },
        updatedAt() {
            return getRelativeTime(new Date(this.emotion?.updated_at)) || "";
        },
    },
    methods: {
        preview() {
            if (!this.isSingle) {
                this.$emit("preview", this.emotion);
            }
        },
        showEmotion(url) {
            if (this.isSingle || this.isGif(url)) {
                return resolveImagePath(url);
            }
            return getThumbnail(url, "emotion_thumbnail");
        },
        isGif(url) {
            return url?.split(".").pop().toLowerCase() === "gif";
        },
    },
};
</script>

<style lang="less">
@media screen and (max-width: @phone) {
    .el-radio-button--mini .el-radio-button__inner {
        padding: 7px;
    }
}
</style>
