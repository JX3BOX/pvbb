<template>
    <transition name="slide-fade">
        <div v-show="show" class="m-sticky-info">
            <h2 :style="hightStyle" class="u-title">{{ title }}</h2>
            <div class="u-infos">
                <span v-if="isTop" class="u-status u-sub-block top">
                    <img svg-inline src="@/assets/img/community/is_top.svg" alt="" />
                </span>

                <span v-if="isStar" class="u-status u-sub-block star">
                    <img svg-inline src="@/assets/img/community/is_star_inline.svg" alt="" />
                </span>

                <span
                    v-for="(item, index) in tags"
                    :key="index"
                    class="u-tag u-meta u-sub-block"
                    :style="{ backgroundColor: item.color }"
                >
                    {{ item.label }}
                </span>

                <a v-if="collection" class="u-book u-sub-block u-meta" :href="collection.url" target="_blank">
                    <img svg-inline src="@/assets/img/community/bookmark.svg" alt="小册" />
                    {{ collection.name }}
                </a>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    props: ["post"],
    data() {
        return {
            show: false,
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
            return this.post?.color_tag;
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
    },
    mounted() {
        document.addEventListener("scroll", this.handleScroll);
    },
    beforeDestroy() {
        document.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        handleScroll() {
            const dom = document.getElementsByClassName("m-single-header");
            if (dom.length) {
                const rect = dom[0].getBoundingClientRect();
                if (document.documentElement.scrollTop > rect.y + rect.height) {
                    this.show = true;
                } else {
                    this.show = false;
                }
            }
        },
    },
};
</script>

<style lang="less" scoped>
.m-sticky-info {
    display: flex;
    gap: 8px;
    // opacity: 0;
    // transition: 0.5s;
    // &.active {
    //     opacity: 1;
    // }
    .u-title {
        .bold;
        .fz(16px,28px);
        margin: 0;
        display: inline-block;
        color: #3d454d;

        white-space: nowrap; /* 保持文本在一行显示 */
        overflow: hidden;
        text-overflow: ellipsis; /* 超出部分用省略号表示 */
    }
    .u-infos {
        .flex;
        gap: 8px;
        align-items: center;

        .u-status {
            .flex;
            gap: 1px;
            align-items: center;
            color: white;
            height: 22px;
            width: 22px;
            border-radius: 4px;
            box-sizing: border-box;
            user-select: none;
            justify-content: center;
            &.top {
                background: rgba(255, 105, 105, 1);
            }
            &.star {
                background: rgba(255, 187, 105, 1);
            }
        }
        .u-tag {
            .fz(14px,22px);
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
            position: relative;
            padding-left: 27px;
            padding-right: 8px;
            border-radius: 4px;
            border: 1px solid rgba(146, 148, 151, 1);
            color: rgba(146, 148, 151, 1);
            box-sizing: border-box;
            svg {
                position: absolute;
                left: 12px;
                top: 0;
                width: 11px;
                height: 16px;
                margin-right: 0;
            }
        }
    }
}
@media screen and (max-width: @ipad) {
    .u-meta {
        display: none;
    }
}
@media screen and (max-width: @phone) {
    .u-podate {
        display: none;
    }
}

.slide-fade-enter-active {
    transition: all 0.3s ease;
}
.slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
    transform: translateX(10px);
    opacity: 0;
}
</style>
