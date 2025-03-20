<template>
    <el-dialog class="m-emotion-preview-dialog" :visible.sync="show" :close-on-click-modal="false">
        <div class="u-close" @click="close"><i class="el-icon-close"></i></div>
        <a class="m-emotion" :href="getLink('emotion', emotion.id)" target="_blank">
            <!-- <div class="u-img" :style="{ backgroundImage: `url(${showEmotion(emotion.url)})` }"></div> -->
            <!-- <img
                class="u-pic u-emotion-pic waterfall-img"
                :src="showEmotion(emotion.url)"
                :alt="emotion.desc"
                :key="emotion.url"
            /> -->
            <img class="u-img" :src="showEmotion(emotion.url)" />
            <!-- <i class="u-star" v-if="emotion.star"
                ><i class="el-icon-star-off"></i><i class="u-original" v-if="emotion.original"></i
            ></i> -->
        </a>
        <div class="m-emotion-info">
            <div class="u-info-op">
                <div class="u-info-user">
                    <img class="u-user-avatar waterfall-img" :src="user_avatar | showAvatar" :key="user_avatar" />
                    <a
                        class="u-user-name"
                        :href="emotion.user_id | authorLink"
                        target="_blank"
                        v-if="emotion.user_id"
                        >{{ emotion | showUserName }}</a
                    >
                    <span class="u-user-name" v-else>
                        {{ emotion.author || "匿名" }}
                    </span>
                    <time class="u-time">{{ emotion.updated_at | showTime }}</time>
                </div>
                <div class="u-comment-editor">
                    <div class="u-op">
                        <template v-if="isEditor">
                            <span class="u-op-star el-link el-link--primary" @click="handleStar">
                                <i :class="isStar ? 'el-icon-star-off' : 'el-icon-star-on'"></i>
                                {{ isStar ? "取消精选" : "设为精选" }}
                            </span>
                            <span class="u-delete el-link el-link--primary" @click="handleDelete">
                                <i class="el-icon-delete"></i> 删除
                            </span>
                        </template>
                        <a
                            v-if="isAuthor"
                            class="u-edit el-link el-link--primary"
                            target="_blank"
                            :href="editLink('emotion', emotion.id)"
                        >
                            <i class="el-icon-edit-outline"></i> 编辑
                        </a>
                        <a
                            class="u-edit el-link el-link--primary"
                            :href="getLink('emotion', emotion.id)"
                            target="_blank"
                        >
                            <i class="el-icon-chat-dot-round"></i> 评论
                        </a>
                    </div>
                </div>
            </div>
            <Thx
                class="m-thx"
                :postId="emotion.id"
                postType="emotion"
                :postTitle="title"
                :userId="emotion.user_id"
                :adminBoxcoinEnable="true"
                :userBoxcoinEnable="true"
                client="all"
                v-if="isEditor"
            />
        </div>
    </el-dialog>
</template>
<script>
import { showAvatar, authorLink, editLink,getLink, getThumbnail, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { getRelativeTime } from "@/utils/dateFormat.js";
import { postStat } from "@jx3box/jx3box-common/js/stat";
import User from "@jx3box/jx3box-common/js/user";
import { starEmotion, unstarEmotion, removeEmotion } from "@/service/emotion";
import Comment from "@jx3box/jx3box-comment-ui/src/Comment.vue";
export default {
    name: "EmotionPreview",
    emits: ["close"],
    props: ["visible", "data"],
    data: function () {
        return {
            show: false,
            isLike: false,
            isStar: false,
            ext: "gif",
            types: [],
        };
    },
    computed: {
        emotion() {
            return this.data;
        },
        user_avatar: function () {
            return this.data?.user_info?.user_avatar;
        },
        isEditor: function () {
            return User.isEditor();
        },
        isAuthor: function () {
            return this.data.user_id == User.getInfo().uid;
        },
        title: function () {
            return this.emotion?.desc || "";
        },
    },
    watch: {
        visible: {
            handler: function (val) {
                this.show = val;
            },
            immediate: true,
        },
        emotion: {
            deep: true,
            immediate: true,
            handler(val) {
                this.count = val.count || 0;
                this.isStar = this.emotion.star;
            },
        },
    },
    filters: {
        showAvatar: function (val) {
            return showAvatar(val);
        },
        authorLink,
        showThumbnail: function (url) {
            return getThumbnail(url, "emotion_thumbnail");
        },
        showListDesc: function (str) {
            return str ? str.slice(0, 120) : "未命名";
        },
        showTime: function (gmt) {
            return getRelativeTime(new Date(gmt));
        },
        showUserName: function (emotion) {
            return emotion?.user_info?.display_name.slice(0, 12) || "匿名";
        },
    },
    mounted() {
        // console.log(document.documentElement.clientWidth);
    },
    methods: {
        close() {
            this.show = false;
            this.$emit("close");
        },
        editLink,
        getLink,
        // 点赞
        addLike: function () {
            if (this.isLike) return;

            this.count++;
            if (!this.isLike) {
                postStat("emotion", this.emotion?.id, "likes");
            }
            this.isLike = true;
        },
        // 精选
        handleStar() {
            if (!this.isStar) {
                starEmotion(this.emotion.id).then(() => {
                    this.$notify({
                        title: "成功",
                        message: "加精成功",
                        type: "success",
                    });
                    this.isStar = true;
                    this.emotion.star = true;
                    this.$forceUpdate();
                });
            } else {
                this.unStar();
            }
        },
        unStar: function () {
            unstarEmotion(this.emotion.id).then(() => {
                this.$notify({
                    title: "成功",
                    message: "取消加精成功",
                    type: "success",
                });
                this.isStar = false;
                this.emotion.star = false;
                this.$forceUpdate();
            });
        },
        // 删除
        handleDelete: function () {
            this.$confirm("此操作将会删除该表情，是否继续？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                removeEmotion(this.emotion.id).then(() => {
                    this.$notify({
                        title: "成功",
                        message: "删除成功",
                        type: "success",
                    });
                    this.$emit("del");
                    this.close();
                });
            });
        },

        // 图片格式
        checkImageExt: function () {
            let ext = this.emotion?.url?.split(".").pop().toLowerCase();
            if (ext && ext != "gif") {
                this.types.push(ext, "gif");
                this.ext = ext;
            }
        },
        checkIsGif: function (url) {
            return url?.split(".").pop().toLowerCase() == "gif";
        },
        showEmotion: function (url) {
            if (this.checkIsGif(url)) {
                return resolveImagePath(url);
            } else {
                return getThumbnail(url, "emotion_thumbnail");
            }
        },
    },
};
</script>
<style lang="less">
.m-emotion-preview-dialog {
    .el-dialog {
        background: transparent;
        height: auto !important;
        box-shadow: none !important;
        .flex;
        justify-content: center;
        .el-dialog__header{
            .none;
        }
        .el-dialog__body {
            padding: 0;
            .flex;
            flex-direction: column;

            .pr;

            .u-close {
                .pointer;
                .pa;
                .lt(100%,0);
                .size(50px);
                .flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                background-color: rgba(0,0,0,.5);
                color:#fff;

                i{
                    transition: all 0.3s ease;
                }
                &:hover i{
                    transform: rotate(180deg);
                }
            }
        }
    }
    .m-emotion {
        .pr;
        // border: 1px dashed #666;
        .r(4px);
        height: 60vh;
        width: 100%;
        .db;
    }
    .u-img {
        .db;
        .x;
        .auto(x);
        cursor: pointer;
        // max-height: 60vh;
        overflow: hidden;
        flex: none;
        // max-width: 90vw;
        height: 100%;
        min-width: 320px;
        // background-repeat: no-repeat;
        // background-size: auto 100%;
        // background-position: center bottom;
    }
    .m-emotion-info {
        max-width: 100%;
        background-color: #303133;
    }
    .u-info-meta {
        .mt(5px);
    }
    .u-star {
        .pointer;
        .pa;
        .rt(8px);
        font-style: normal;
        border-radius: 2px;
        color: #fff;
        // .mr(5px);
        font-size: 12px;
        padding: 3px;
    }
    .u-original {
        // background-color: #6f42c1;
        font-style: normal;
        padding: 0 2px;
        line-height: 12px;
    }
    .u-star {
        background-color: #6f42c1;
        i {
            margin: 0;
        }
        display: inline-flex;
        align-items: center;
    }
    .u-desc {
        .fz(12px, 16px);
        white-space: pre-wrap;
        word-wrap: break-word;
        word-break: break-all;
    }
    a.u-desc {
        &:hover {
            box-shadow: 0 1px 0 @color-link;
        }
    }
    .m-emotion-info {
        padding: 0 10px 10px;
        .m-thx{
            padding-bottom: 20px;
            max-width: 700px;
            .auto(x);
            .w-thx-copyright{
                .none;
            }
        }
    }
    .u-info-op {
        .flex;
        justify-content: space-between;
        align-items: center;
    }
    .u-info-user {
        display: flex;
        align-items: center;
        .mt(10px);
        .fz(12px);
    }
    .u-user-avatar {
        .size(20px);
        .r(100%);
        .y;
        .mr(5px);
    }
    .u-user-name {
        color: #eee;
        &:hover {
            color: #fff;
        }
    }
    .u-time {
        color: #999;
        .ml(5px);
    }

    .u-like {
        .pr;
        top: -4px;
        .fr;

        cursor: pointer;
        user-select: none;
        &.disabled {
            // .tm(0.5);
            cursor: default;
        }

        .like-icon {
            .fz(20px, 1);
            .h(16px);
            .y(-3px);
            color: #f39;
        }

        .like-text {
            color: #888;
            .ml(5px);
        }

        .like-count {
            color: #888;
            .ml(6px);
        }

        &:hover {
            .like-icon,
            .like-text {
                color: #f00;
            }
        }

        &.on .like-icon {
            color: #f00;
        }
    }
    .u-op {
        .x;
        .mt(10px);
        background-color: #0366d6;
        .r(3px);
        a,
        span {
            color: #eee;
            padding: 5px 10px;
            .r(3px);
        }
        i {
            .mr(3px);
            .pr;
            color: #eee;
            // top: 1px;
        }
        .el-link {
            .fz(12px);
        }
        .el-link.el-link--primary:hover {
            color: #fff;
            text-decoration: none;
            background-color: #3f9eff;
        }
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .m-thx {
        margin-top: 20px;
        .w-thx-copyright {
            background-color: #333;
            border-color: #666;
            color: #ddd;
        }
    }
    .w-boxcoin-records-list {
        background-color: #333;
        border-color: #666;
        .u-head {
            background-color: #444;
            border-color: #666;
        }
        .u-item {
            color: #eee;
        }
    }
}
</style>
