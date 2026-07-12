<template>
    <CollectionLayout :has-right="false" :post="collection || {}">
        <div class="m-collection-single" v-loading="loading">
            <el-alert
                v-if="loadError"
                :title="loadErrorTitle"
                :type="loadError === 'not-found' ? 'info' : 'error'"
                center
                show-icon
                :closable="false"
            ></el-alert>

            <template v-else-if="collection">
                <div class="m-collection-detail-content">
                    <div class="m-collection-detail-header">
                        <header class="m-single-header">
                            <!-- 标题 -->
                            <div class="m-single-title">
                                <span class="u-title u-sub-block" :href="url" :title="collection.title">
                                    <i class="u-private el-icon-lock" v-if="!collection.public" title="仅自己可见"></i>
                                    <span class="u-title-text">{{ collection.title }}</span>
                                </span>
                            </div>

                            <!-- 信息 -->
                            <div class="m-single-info">
                                <!-- 用户名 -->
                                <div class="u-author u-sub-block">
                                    <i class="u-author-icon">
                                        <img svg-inline src="@/assets/img/common/author.svg" />
                                    </i>
                                    <a class="u-name" :href="authorLink(collection.user_id)">{{
                                        collection.collection_user_info && collection.collection_user_info.display_name
                                    }}</a>
                                </div>

                                <!-- 发布日期 -->
                                <span class="u-podate u-sub-block" title="发布日期">
                                    <i class="u-icon el-icon-date"></i>
                                    <time>{{ dateFormat(collection.created) }}</time>
                                </span>

                                <!-- 最后更新 -->
                                <span class="u-modate u-sub-block" title="最后更新">
                                    <i class="u-icon el-icon-refresh"></i>
                                    <time>{{ dateFormat(collection.updated) }}</time>
                                </span>

                                <!-- 查看次数 -->
                                <span class="u-views u-sub-block">
                                    <i class="u-icon el-icon-view"></i>
                                    {{ views }}
                                </span>

                                <!-- 编辑 -->
                                <a class="u-edit u-sub-block" :href="edit_link" v-if="canEdit">
                                    <i class="u-icon-edit el-icon-edit-outline"></i>
                                    <span>编辑</span>
                                </a>

                                <!-- 删除 -->
                                <a
                                    href="javascript:void(0)"
                                    class="u-delete u-sub-block"
                                    @click="delete_handle($event, collection.id)"
                                    v-if="canEdit"
                                >
                                    <i class="u-icon-remove el-icon-delete"></i>
                                    <span>删除</span>
                                </a>
                            </div>
                        </header>
                    </div>

                    <template v-if="collection.description">
                        <el-divider content-position="left">
                            <i class="el-icon-collection"></i>
                            小册简介
                        </el-divider>
                        <div class="u-description">
                            <p v-html="resolveImagePath(collection.description)"></p>
                        </div>
                    </template>

                    <template v-if="collection.posts && collection.posts.length">
                        <el-divider content-position="left">
                            <i class="el-icon-folder"></i>
                            小册文章
                        </el-divider>
                        <ul class="u-list">
                            <li class="u-item" v-for="(post, key) in collection.posts" :key="key">
                                <span class="u-item-order">{{ key + 1 }}.</span>
                                <img class="u-item-icon" :src="iconUrl(post.icon)" v-if="post.icon" />
                                <span class="u-item-link" v-if="post.type === 'custom'">
                                    <i class="el-icon-link"></i>站外链接
                                </span>
                                <a
                                    class="u-item-author"
                                    v-if="post.type !== 'custom' && post.user_id"
                                    target="_blank"
                                    :href="authorLink(post.user_id)"
                                >
                                    <img class="u-avatar" :src="showAvatar(post.user_avatar)" />
                                    <span class="u-nickname" v-text="post.user_nickname"></span>
                                    <span class="u-div">/</span>
                                </a>
                                <a
                                    class="u-item-title"
                                    target="_blank"
                                    :href="
                                        post.type === 'custom'
                                            ? post.url
                                            : getLink(post.post_type || post.type, post.id)
                                    "
                                    >{{ post.custom_title || post.title }}</a
                                >
                                <time
                                    class="u-updated"
                                    v-if="post.updated"
                                    v-text="'最后更新于 ' + formatDate(post.updated)"
                                ></time>
                            </li>
                        </ul>
                    </template>
                </div>

                <!-- <div class="m-tags" v-if="collection.tags && collection.tags.length">
                <div class="u-tags-title">
                    <i class="el-icon-price-tag"></i>
                    <span>标签</span>
                </div>
                <ul class="u-tags">
                    <li v-for="(tag, key) in collection.tags" :key="key" v-text="tag" class="u-tag"></li>
                </ul>
            </div>-->

                <CollectionThx
                    class="m-thx"
                    :postId="id"
                    postType="collection"
                    :postTitle="title"
                    :userId="author_id"
                    :author-id="author_id"
                    :adminBoxcoinEnable="false"
                    :userBoxcoinEnable="true"
                    client="all"
                    @stat-loaded="updateStat"
                />

                <div class="m-comments" v-if="id">
                    <el-divider content-position="left">
                        <span style="color: #999999"> <i class="el-icon-chat-line-square"></i> 讨论 </span>
                    </el-divider>
                    <CommonComment :id="id" category="collection" />
                </div>
            </template>
        </div>
    </CollectionLayout>
</template>

<script>
import CollectionPublish from "@jx3box/jx3box-editor/src/service/enum/CollectionPublic";
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
import { postStat, postHistory } from "@jx3box/jx3box-common/js/stat";
import { __imgPath } from "@/utils/config";
import { getCollectionLoadError } from "@/utils/collection";

import CollectionLayout from "@/layouts/CollectionLayout.vue";
import CommonComment from "@jx3box/jx3box-ui/src/single/Comment.vue";
import CollectionThx from "./collection_thx.vue";
export default {
    name: "CollectionSingle",
    props: [],
    components: {
        CollectionLayout,
        CommonComment,
        CollectionThx,
    },
    data: function () {
        return {
            collection: null,
            publish: CollectionPublish,
            url: location.href,
            views: 0,
            loading: false,
            loadError: "",
            requestId: 0,
            updateCollectionHandler: null,
        };
    },
    computed: {
        edit_link: function () {
            return editLink("collection", this.collection?.id);
        },
        id: function () {
            return this.collection?.id;
        },
        author_id: function () {
            return this.collection?.user_id || 0;
        },
        canEdit: function () {
            return this.author_id == User.getInfo().uid || User.isEditor();
        },
        title: function () {
            return this.collection?.title || "";
        },
        loadErrorTitle() {
            return this.loadError === "not-found"
                ? "该剑三小册不存在或已被删除"
                : "小册加载失败，请稍后重试";
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
            const requestId = ++this.requestId;
            this.loading = true;
            this.collection = null;
            this.loadError = "";
            this.$store.state.user_id = 0;
            getCollection(id)
                .then((res) => {
                    if (requestId !== this.requestId) return;
                    const collection = res?.data?.data;
                    if (!collection) {
                        this.loadError = "not-found";
                        return;
                    }
                    this.collection = collection;
                    this.$store.state.user_id = this.collection.user_id;

                    document.title = this.title + this.$t("pages.common.appendTitle");

                    User.isLogin() &&
                        postHistory({
                            source_type: "collection",
                            source_id: ~~id,
                            link: location.href,
                            title: this.title,
                        });
                })
                .catch((error) => {
                    if (requestId !== this.requestId) return;
                    this.loadError = getCollectionLoadError(error);
                })
                .finally(() => {
                    if (requestId !== this.requestId) return;
                    this.loading = false;
                });
        },
        execStat: function (id) {
            postStat("collection", id);
        },
        updateStat(stat) {
            this.views = stat?.views || 0;
        },
        formatDate(date) {
            return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
        },
        iconUrl: function (icon) {
            const key = icon.replace("_", "/");
            return `${__imgPath}image/${key}.png`;
        },
        authorLink,
    },
    created: function () {},
    mounted: function () {
        this.updateCollectionHandler = () => {
            location.reload();
        };
        Bus.$on("updateCollection", this.updateCollectionHandler);
    },
    beforeUnmount() {
        if (this.updateCollectionHandler) {
            Bus.$off("updateCollection", this.updateCollectionHandler);
        }
    },
};
</script>

<style lang="less">
@import "~@/assets/css/collection/collection.less";
.m-single-header {
    padding-top: 0;
}
.m-collection-single {
    min-height: 200px;
}
</style>
