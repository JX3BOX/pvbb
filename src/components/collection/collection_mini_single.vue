<template>
    <div class="m-collection-mini-single">
        <el-alert
            v-if="!collection"
            title="该剑三小册不存在或已被删除"
            type="info"
            center
            show-icon
            :closable="false"
        ></el-alert>

        <template v-else>
            <div class="m-collection-mini-single-content">
                <div class="m-header">
                    <div class="m-author">
                        <CommonAuthor
                            :uid="author_id"
                            :author="collection.collection_user_info"
                            :date="authorDate"
                            :title="collection.title"
                        />
                    </div>
                    <div class="u-title">
                        <i class="u-private el-icon-lock" v-if="!collection.public" title="仅自己可见"></i>
                        {{ collection.title }}
                    </div>
                </div>

                <div class="m-description" v-if="collection.description">
                    <el-divider content-position="left">
                        <i class="el-icon-collection"></i>
                        小册简介
                    </el-divider>
                    <div class="u-description">
                        <p v-html="resolveImagePath(collection.description)"></p>
                    </div>
                </div>

                <template v-if="collection.posts && collection.posts.length">
                    <el-divider content-position="left">
                        <i class="el-icon-folder"></i>
                        小册文章
                    </el-divider>
                    <ul class="m-list">
                        <li class="u-item" v-for="(post, key) in collection.posts" :key="key">
                            <img class="u-item-icon" :src="iconUrl(post.icon)" v-if="post.icon" />
                            <a
                                class="u-item-title"
                                target="_blank"
                                :href="
                                    post.type === 'custom' ? post.url : getLink(post.post_type || post.type, post.id)
                                "
                                >{{ post.custom_title || post.title }}</a
                            >
                        </li>
                    </ul>
                </template>
            </div>
        </template>
    </div>
</template>

<script>
import CollectionPublish from "@jx3box/jx3box-editor/src/service/enum/CollectionPublic";
import { getCollection, removeCollection } from "@/service/collection";
import { dateFormat } from "@/utils/dateFormat";
import Bus from "@/store/bus";
import {
    getThumbnail,
    getLink,
    getTypeLabel,
    authorLink,
    editLink,
    showAvatar,
    resolveImagePath,
} from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user.js";
import { getStat, postStat, postHistory } from "@jx3box/jx3box-common/js/stat";
import { __imgPath } from "@/utils/config";
import CommonAuthor from "@/components/CommonAuthor.vue";

export default {
    name: "CollectionSingle",
    props: [],
    components: {
        CommonAuthor,
    },
    data: function () {
        return {
            collection: "",
            publish: CollectionPublish,
            url: location.href,
            views: 0,
            loading: false,
        };
    },
    computed: {
        edit_link: function () {
            return editLink("collection", this.collection.id);
        },
        id: function () {
            return this.collection?.id;
        },
        author_id: function () {
            return this.collection?.user_id || 0;
        },
        canEdit: function () {
            return true;
        },
        title: function () {
            return this.collection.title;
        },
        authorDate() {
            return this.collection?.created ? `发布于 ${dateFormat(new Date(this.collection.created * 1000))}` : "";
        },
    },
    watch: {
        "$route.params.id": {
            immediate: true,
            handler(id) {
                if (id) {
                    this.loadData(id);
                    this.execStat(id);
                }
            },
        },
    },
    methods: {
        getThumbnail,
        getLink(type, id) {
            return getLink(type, id);
        },
        getTypeLabel,
        showAvatar,
        resolveImagePath,
        delete_handle($event, collection_id) {
            $event.preventDefault();
            this.$confirm("确认是否删除该剑三小册？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                removeCollection(collection_id).then((data) => {
                    this.$message.success("删除成功");
                    this.$router.push({ name: "collection" });
                });
            });
        },
        loadData: function (id) {
            this.loading = true;
            getCollection(id)
                .then((res) => {
                    this.collection = res?.data?.data || {};
                    this.$store.state.user_id = this.collection.user_id;

                    User.isLogin() &&
                        postHistory({
                            source_type: "collection",
                            source_id: ~~id,
                            link: location.href,
                            title: this.title,
                        });
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        execStat: function (id) {
            postStat("collection", id);
            getStat("collection", id).then((res) => {
                this.views = res.data.views || 0;
            });
        },
        iconUrl: function (icon) {
            const key = icon.replace("_", "/");
            return `${__imgPath}image/${key}.png`;
        },
        authorLink,
    },
    created: function () {},
    mounted: function () {
        Bus.$on("updateCollection", () => {
            location.reload();
        });
    },
};
</script>

<style lang="less">
@black5: rgba(28, 28, 28, 0.05);
@black5-dark: rgba(255, 255, 255, 0.05);
@black80: rgba(28, 28, 28, 0.8);
@black80-dark: rgba(255, 255, 255, 0.8);
@black100: #1c1c1c;
@black100-dark: #fff;
.m-collection-mini-single {
    padding: 1.11rem 0.75rem;
    .m-collection-mini-single-content {
        .m-header {
            .u-title {
                color: @black100;
                font-size: 1.125rem;
                font-weight: bold;
                line-height: 1.75rem;
            }
            .m-author {
                margin-bottom: 0.5rem;
            }
        }
        .m-description {
            .u-description {
                padding: 0 1.25rem;
                .fz(0.75rem,2);
                color: @black100;
            }
        }
        .m-list {
            list-style: none;
            padding: 0 0.75rem;
            .u-item {
                background-color: @black5;
                border-radius: 0.5rem;
                padding: 0.75rem;
                display: flex;
                .u-item-icon {
                    flex-shrink: 0;
                    .size(1.5rem);
                    margin-right: 0.625rem;
                }
                .u-item-title {
                    font-size: 0.875rem;
                    color: @black80;
                    line-height: 1.25rem;
                }
                &:not(:last-child) {
                    margin-bottom: 1.25rem;
                }
            }
        }
    }
}
html.dark {
    .m-collection-mini-single {
        &::after {
            content: "";
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            background-color: #16181d;
        }
        .m-collection-mini-single-content {
            .m-header {
                .u-title {
                    color: @black100-dark;
                }
            }
            .el-divider {
                background-color: @black5-dark;
                .el-divider__text.is-left {
                    background-color: #16181d;
                    color: @black80-dark;
                }
            }
            .m-description {
                .u-description {
                    color: @black100-dark;
                }
            }
            .m-list {
                .u-item {
                    background-color: @black5-dark;
                    .u-item-title {
                        color: @black80-dark;
                    }
                }
            }
        }
    }
}
@media (prefers-color-scheme: dark) {
    .m-collection-mini-single {
        &::after {
            content: "";
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            background-color: #16181d;
        }
        .m-collection-mini-single-content {
            .m-header {
                .u-title {
                    color: @black100-dark;
                }
            }
            .el-divider {
                background-color: @black5-dark;
                .el-divider__text.is-left {
                    background-color: #16181d;
                    color: @black80-dark;
                }
            }
            .m-description {
                .u-description {
                    color: @black100-dark;
                }
            }
            .m-list {
                .u-item {
                    background-color: @black5-dark;
                    .u-item-title {
                        color: @black80-dark;
                    }
                }
            }
        }
    }
}
</style>
