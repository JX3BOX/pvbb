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
                    <div class="u-title">
                        <i class="u-private el-icon-lock" v-if="!collection.public" title="仅自己可见"></i>
                        {{ collection.title }}
                    </div>
                    <div class="u-author">
                        <avatar
                            class="u-author-avatar"
                            :url="collection.collection_user_info?.user_avatar"
                            :uid="collection.collection_user_info?.user_id"
                        />
                        <div class="u-author-name">
                            {{ collection.collection_user_info?.display_name || "匿名" }}
                        </div>
                        <div class="u-created-at">发布于 {{ dateFormat(collection.created) }}</div>
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

                <author-card
                    v-if="collection.collection_user_info"
                    :author="collection.collection_user_info"
                    :uid="collection.collection_user_info?.user_id"
                />
            </div>
        </template>
    </div>
</template>

<script>
import CollectionPublish from "@jx3box/jx3box-editor/service/enum/CollectionPublic";
import { getCollection, removeCollection } from "@/service/collection";
import { dateFormat } from "@/utils/dateFormat";
import dayjs from "dayjs";
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
import AuthorCard from "@/components/mobile/author-card.vue";

export default {
    name: "CollectionSingle",
    props: [],
    components: {
        AuthorCard,
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
        dateFormat: function (timestamp) {
            return dateFormat(new Date(timestamp * 1000));
        },
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
        formatDate(date) {
            return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
        },
        iconUrl: function (icon) {
            const key = icon.replace("_", "/");
            return `${__imgPath}image/${key}.png`;
        },
    },
    filters: {
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
@black40: rgba(28, 28, 28, 0.4);
@black40-dark: rgba(255, 255, 255, 0.4);
@black80: rgba(28, 28, 28, 0.8);
@black80-dark: rgba(255, 255, 255, 0.8);
@black100: #1c1c1c;
@black100-dark: #fff;
.m-collection-mini-single {
    .m-collection-mini-single-content {
        .m-header {
            padding: 0.75rem 1.25rem 0;
            .u-title {
                color: @black100;
                font-size: 1.125rem;
                font-weight: bold;
                line-height: 1.75rem;
            }
            .u-author {
                display: flex;
                font-size: 0.75rem;
                color: @black40;
                margin-top: 0.5rem;
                .u-author-avatar {
                    margin-right: 0.25rem;
                    .c-avatar-pic {
                        .size(1rem);
                    }
                }
                .u-created-at {
                    margin-left: 0.75rem;
                }
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
            background-color: #282828;
        }
        .m-collection-mini-single-content {
            .m-header {
                .u-title {
                    color: @black100-dark;
                }
                .u-author {
                    color: @black40-dark;
                }
            }
            .el-divider {
                background-color: @black5-dark;
                .el-divider__text.is-left {
                    background-color: @black5-dark;
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
