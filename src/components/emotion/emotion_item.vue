<template>
    <div class="m-emotion-item" :class="mode || 'list'">
        <div class="u-emotion">
            <div class="u-img" @click="preview">
                <img
                    class="u-pic u-emotion-pic waterfall-img"
                    :src="showEmotion(emotion.url)"
                    :alt="emotion.desc"
                    :key="emotion.url"
                />
            </div>
            <i class="u-star" v-if="emotion.star"
                ><i class="el-icon-star-off"></i><i class="u-original" v-if="emotion.original">原创</i></i
            >
        </div>
        <div class="u-info">
            <div class="u-info-user">
                <div class="u-info-user-left">
                    <img class="u-user-avatar waterfall-img" :src="showAvatar(user_avatar)" :key="user_avatar" />
                    <a class="u-user-name" :href="authorLink(emotion.user_id)" target="_blank" v-if="emotion.user_id">{{
                        showUserName(emotion)
                    }}</a>
                    <span class="u-user-name" v-else>
                        {{ emotion.author || "匿名" }}
                    </span>
                </div>
                <div class="u-info-user-right">
                    <time class="u-time">{{ showTime(emotion.updated_at) }}</time>
                </div>
            </div>
            <div class="u-info-thx" v-if="mode && emotion">
                <Thx
                    class="m-thx"
                    :postId="emotion.id"
                    postType="emotion"
                    :postTitle="title"
                    :userId="emotion.user_id"
                    :adminBoxcoinEnable="true"
                    :userBoxcoinEnable="true"
                    client="all"
                />
                <div class="m-single-comment">
                    <el-divider content-position="left">评论</el-divider>
                    <CommonComment :id="emotion.id" category="emotion" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { showAvatar, authorLink, getThumbnail, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { getRelativeTime } from "@/utils/dateFormat.js";
import CommonComment from "@jx3box/jx3box-ui/src/single/Comment.vue";

export default {
    name: "emotion_item",
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
            default: "",
        },
        index: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        user_avatar() {
            return this.emotion?.user_info?.user_avatar;
        },
        title() {
            return this.emotion?.desc || "无标题";
        },
    },
    methods: {
        showAvatar(val) {
            return showAvatar(val);
        },
        authorLink,
        showThumbnail(url) {
            return getThumbnail(url, "emotion_thumbnail");
        },
        showTime(gmt) {
            return getRelativeTime(new Date(gmt));
        },
        showUserName(emotion) {
            return emotion?.user_info?.display_name.slice(0, 12) || "匿名";
        },
        preview() {
            if (this.mode !== "single") {
                this.$emit("preview", this.emotion);
            }
        },
        checkIsGif(url) {
            return url?.split(".").pop().toLowerCase() == "gif";
        },
        showEmotion(url) {
            if (this.mode === "single") {
                return resolveImagePath(url);
            }

            return this.checkIsGif(url) ? resolveImagePath(url) : getThumbnail(url, "emotion_thumbnail");
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
