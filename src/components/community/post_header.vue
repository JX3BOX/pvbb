<template>
    <header class="m-single-header" v-if="post">
        <!-- 标题 -->
        <div class="m-single-title">
            <span class="u-title u-sub-block">
                <slot name="title_before"></slot>
                <!-- <div class="m-topic-category-box" v-if="styles">
                    <a
                        :href="`/community?category=${post.category}`"
                        :class="`m-topic-category`"
                        :style="`background-color: ${styles.hoverColor};color:${styles.color};`"
                    >
                        <img
                            v-svg-inline
                            class="u-icon"
                            :src="require(`@/assets/img/community/category/${styles.icon}.svg`)"
                        />
                        <div>{{ post.category }}</div>
                    </a>
                </div> -->

                <!-- 可视状态 -->
                <i class="u-status u-status-private" v-if="post.status != 1 || post.visible != 0">
                    <i class="el-icon-lock" style="color: #fb9b24"></i>
                </i>

                <i class="u-status u-status-deleted" v-if="post.is_deleted">
                    <i class="el-icon-delete" style="color: #c00"></i>
                </i>

                <!-- 标题与高亮 -->
                <i v-if="isTop" class="u-status u-status-top">
                    <img svg-inline src="@/assets/img/community/is_top.svg" alt="" />
                </i>

                <i v-if="isStar" class="u-status u-status-star">
                    <img svg-inline src="@/assets/img/community/is_star.svg" alt="" />
                </i>

                <span :style="hightStyle" class="u-title-text">{{ title }}</span>
            </span>
        </div>

        <!-- 信息 -->
        <div class="m-single-info">
            <slot></slot>

            <div class="u-meta u-sub-block">
                <em class="u-label">分类</em>
                <span class="u-value">{{ showPostTypeLabel(post.category) }}</span>
            </div>

            <div class="u-meta u-sub-block">
                <em class="u-label">适用客户端</em>
                <span class="u-value u-client" :class="'i-client-' + client">{{ showClientLabel(client) }}</span>
            </div>

            <div class="u-meta u-sub-block">
                <em class="u-label">标签</em>
                <span class="u-value">
                    <span
                        v-for="(item, index) in tags"
                        :key="index"
                        class="u-tag"
                        :style="{ backgroundColor: item.color }"
                    >
                        {{ item.label }}
                    </span>
                </span>
            </div>

            <!-- 发布日期 -->
            <span class="u-sub-block" :title="'发布日期:' + post_time">
                <i class="u-icon-podate">
                    <img svg-inline src="@jx3box/jx3box-common-ui/assets/img/single/podate.svg" />
                </i>
                <time>{{ post_date }}</time>
            </span>

            <span class="u-sub-block" :title="'发布日期:' + post_time">
                <i class="u-icon-modate">
                    <img svg-inline src="@jx3box/jx3box-common-ui/assets/img/single/modate.svg" />
                </i>
                <time>{{ update_date }}</time>
            </span>

            <!-- 查看次数 -->
            <span class="u-views u-sub-block">
                <i class="el-icon-view"></i>
                {{ views }}
            </span>

            <span class="u-word-count u-sub-block" v-if="wordCount" title="累计字数">
                <i class="el-icon-sunny"></i>
                {{ wordCount }}
            </span>

            <!-- 编辑 -->
            <!-- <a class="u-edit u-sub-block" :href="edit_link" v-if="canEdit">
                <i class="u-icon-edit el-icon-edit-outline"></i>
                <span>编辑</span>
            </a> -->

            <slot name="append"></slot>
        </div>

        <!-- <div class="u-title-toolbar u-phone-show">
        <el-button size="small" @click="onEditClick" v-if="isPostOwner" type="warning" icon="el-icon-edit"
            >编辑</el-button
        >
        <el-button
            size="small"
            :class="`u-only-btn ${onlyAuthor && 'u-unset'}`"
            type="primary"
            @click="setOnlyAuthor(!onlyAuthor)"
        >
            <img svg-inline v-show="!onlyAuthor" src="@/assets/img/community/only-author.svg" />
            {{ onlyAuthor ? "取消只看楼主" : "只看楼主" }}
        </el-button>
    </div> -->

        <div class="m-single-toolbar">
            <!-- <el-button size="small" @click="onEditClick" v-if="isPostOwner" type="warning" icon="el-icon-edit"
                        >编辑</el-button
                    > -->
            <el-button
                size="small"
                :class="`u-only-btn ${onlyAuthor && 'u-unset'}`"
                type="primary"
                @click="setOnlyAuthor(!onlyAuthor)"
            >
                <img svg-inline v-show="!onlyAuthor" src="@/assets/img/community/only-author.svg" />
                {{ onlyAuthor ? "取消只看楼主" : "只看楼主" }}
            </el-button>
        </div>
    </header>
</template>

<script>
import { __Root, __clients } from "@/utils/config";
import { showDate, showTime } from "@jx3box/jx3box-common/js/moment";
import { editLink } from "@jx3box/jx3box-common/js/utils.js";
import User from "@jx3box/jx3box-common/js/user.js";
import $ from "jquery";
import { formatCategoryList } from "@/utils/community";
import { getTopicBucket } from "@/service/cms";
import { tabsMap } from "@/assets/data/community_category";
export default {
    name: "single-header",
    props: ["post", "stat"],
    inject: ["setOnlyAuthor"],
    data: function () {
        return {
            categoryList: [],
            wordCount: 0,
            postTypes: tabsMap,
        };
    },
    computed: {
        hightStyle: function () {
            if (this.post.is_hight && this.post.hight_color) {
                return {
                    color: this.post.hight_color,
                };
            } else {
                return {};
            }
        },
        onlyAuthor: function () {
            const v = this.$route.query.onlyAuthor;
            return (v == true || v == "true") && true;
        },
        // 是否为拥有者
        isPostOwner() {
            return this.post?.user_id == User.getInfo()?.uid;
        },
        collection: function () {
            if (this.post.collection && this.post.collection.title) {
                return {
                    name: this.post.collection.title,
                    url: `/collection/${this.post.collection_id}`,
                };
            }
            return null;
        },
        tags: function () {
            return this.post?.color_tag || [];
        },
        isStar: function () {
            return this.post?.is_star;
        },
        isTop: function () {
            return this.post?.is_top || this.post?.is_category_top;
        },
        title: function () {
            return this.post?.title || "无标题";
        },
        post_date: function () {
            return showDate(new Date(this.post?.created_at));
        },
        update_date: function () {
            return showDate(new Date(this.post?.updated_at));
        },
        post_time: function () {
            return showTime(new Date(this.post?.created_at));
        },
        update_time: function () {
            return showTime(new Date(this.post?.updated_at));
        },
        views: function () {
            return this.stat?.views || "-";
        },
        edit_link: function () {
            return editLink(this.post?.post_type, this.post?.ID);
        },
        canEdit: function () {
            return this.post?.user_id == User.getInfo().uid || User.isEditor();
        },
        styles: function () {
            let item = this.categoryList.find((item) => item.value === this.post.category);
            if (item) {
                return item;
            }
            return null;
        },
        client: function () {
            return this.post?.client || "std";
        },
    },
    watch: {
        post: {
            deep: true,
            handler: function (val) {
                this.countWords();
            },
        },
    },
    methods: {
        showPostTypeLabel(type) {
            return tabsMap[type] || type;
        },
        showClientLabel: function (val) {
            return __clients[val];
        },
        countWords: function () {
            this.$nextTick(() => {
                // 需要去除空格 \n \g
                const text = $(".c-article")
                    .text()
                    ?.replace(
                        /[\s|\n|\r|\t|\g|\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|\，|\。|\？|\：|\；|\‘|\’|\”|\“|\、|\·|\！|\（|\）|\》|\《|\『|\』]/g,
                        ""
                    );

                this.wordCount = text?.length || 0;
            });
        },
        getCategoryList() {
            getTopicBucket({ type: "community", search: this.post.category }).then((res) => {
                this.categoryList = formatCategoryList(res.data.data);
            });
        },
        onEditClick() {
            window.location.href = editLink("community", this.post?.id);
        },
    },
    mounted: function () {
        this.getCategoryList();
    },
};
</script>

<style lang="less">
.i-client-all {
    border: 1px solid #a26ef7;
    color: #a26ef7;
}
.i-client-std {
    border: 1px solid #f0b400;
    color: #f0b400;
}
.i-client-origin {
    border: 1px solid #0eb7ce;
    color: #0eb7ce;
}
.i-client-wujie {
    border: 1px solid #fc79bf;
    color: #fc79bf;
}

.m-single-header {
    padding-top: 20px;
    padding-bottom: 20px;
    // padding-right: 280px;
    .pr;
    .u-sub-block {
        .dbi;
        .y(top);
    }
}
@media screen and (max-width: @phone) {
    .m-single-header {
        padding-right: 0;
    }
}
@media print {
    .m-single-header {
        padding-right: 0;
    }
}

.m-single-title {
    .fz(32px);
    padding: 1px 0;
    max-width: calc(100vw - 350px);

    .u-title {
        color: @color;
        // &:hover {
        //     color: @primary;
        // }
        letter-spacing: 0.5px;
        font-weight: 300;
        .db;
        .nobreak;
    }
    .u-author {
        .pr;
    }

    .u-status {
        .size(20px);
        margin-right: 5px;
        svg,i{
            .size(20px);
        }
    }

    .u-original {
        background-color: #6f42c1;
        color: #fff;
        .fz(14px, 20px);
        font-style: normal;
        font-weight: normal;
        padding: 2px 5px;
        .mr(5px);
        // .fl;
    }

    .u-private {
        .y(-2px);
        margin-right: 5px;
        color: #111;
    }
}

.expanding-right {
    .m-single-title {
        // .u-title {
        max-width: calc(100vw - 80px);
        // }
    }
}

// .u-title-toolbar.u-phone-show {
//     display: none;
//     align-items: center;
//     .el-button--small,
//     .el-button--small.is-round {
//         padding: 0 10px;
//         height: 25px;
//         box-sizing: border-box;
//         overflow: hidden;
//     }
// }
.m-single-toolbar {
    .pa;.rt(0,20px);
    // .fr;
    .u-only-btn {
        top:10px;
        position: relative;
        // background: @color-link;
        // border: 1px solid rgba(64, 128, 255, 1);
        display: inline-block;
        height: 32px;
        &.u-unset {
            background: rgba(212, 48, 48, 1);
            border-color: rgba(212, 48, 48, 1);
        }
        &:hover {
            opacity: 0.8;
        }
        svg {
            vertical-align: middle;
            position: relative;
            top: -1px;
            width: 12px;
            height: 12px;
        }
    }
}
@media screen and (max-width: @phone) {
    .m-single-title {
        .fz(1rem, 1.8);
        max-width: unset;
        .u-title {
            word-break: break-all;
            white-space: normal;
            font-weight: normal;
        }
        .u-status {
            .size(16px);
            svg,i{
                .size(16px);
            }
        }
    }
    .m-single-header{
        padding-top:0;
    }
    .m-single-toolbar{
        .ps;
    }

    .expanding-right {
        .m-single-title {
            max-width: unset;
        }
    }
}
@media print {
    .m-single-title {
        .x;
    }
}

.m-single-info {
    margin-top: 10px;
    .clearfix;
    .fz(12px, 22px);
    color: #666;
    .pr;

    .u-client {
        // .fl;
        font-style: normal;
        .fz(12px,20px);
        padding: 0px 5px;
        .r(3px);
        // .mr(10px);
    }

    * {
        .dbi;
    }

    svg {
        fill: #666;
        .size(14px);
        .y;
        .mr(3px);
    }

    .u-sub-block {
        .mr(12px);
        .fl;
    }

    .u-status {
        .flex;
        gap: 1px;
        align-items: center;
        color: white;
        height: 22px;
        padding: 4px 6px;
        border-radius: 4px;
        box-sizing: border-box;
        user-select: none;
        margin-right: 6px;
        &.top {
            background: rgba(255, 105, 105, 1);
        }
        &.star {
            background: rgba(255, 187, 105, 1);
        }
    }
    .u-tag {
        margin-right: 6px;
        padding: 0 6px;
        border-radius: 4px;
        background: @color;
        color: #fff;
    }
    .u-podate {
        margin-left: 10px;
    }
    .u-book {
        .fz(12px,22px);
        height: 22px;
        box-sizing: border-box;
        position: relative;
        padding-left: 27px;
        padding-right: 8px;
        border-radius: 4px;
        border: 1px solid rgba(146, 148, 151, 1);
        color: rgba(146, 148, 151, 1);

        svg {
            position: absolute;
            left: 12px;
            top: 0;
            width: 11px;
            height: 16px;
            margin-right: 0;
        }
    }

    .u-author {
        a:hover {
            box-shadow: 0 1px 0 @color-link;
        }
        i {
            .pr;
            top: -2px;
        }
    }

    .u-label {
        .mr(5px);
        background-color: #eee;
        padding: 0 5px;
        .r(2px);
        font-style: normal;
    }

    .u-views {
        i {
            .fz(15px);
            .y;
        }
    }

    .u-edit {
        i {
            &:before {
                font-size: 16px;
            }
            .pr;
            top: 2px;
            .mr(3px);
        }
        &:hover {
            box-shadow: 0 1px 0 @color-link;
        }
    }
}
@media screen and (max-width: @ipad) {
    .m-single-info {
        .u-meta {
            .none;
        }
    }
}
@media screen and (max-width: @phone) {
    .u-title {
        .u-title-toolbar {
            display: none;
        }
    }
    .u-title-toolbar.u-phone-show {
        display: flex;
        float: unset;
        padding: 0;
    }
    .m-single-info {
        .u-podate {
            .none;
        }
        & > * {
            margin-bottom: 8px;
        }
    }
}
@media print {
    .m-single-info {
        .u-meta,
        .u-views,
        .u-edit {
            .none;
        }
        .x;
        .u-sub-block {
            float: none;
        }
        .u-name {
            color: @color;
        }
    }
}
</style>
