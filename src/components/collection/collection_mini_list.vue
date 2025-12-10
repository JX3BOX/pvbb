<template>
    <div class="m-mini-collection-box" v-loading="loading">
        <div class="m-list" @scroll="handleScroll">
            <wc-waterfall gap="20" :cols="2" v-if="list.length">
                <router-link v-for="item in list" :key="item.id" class="m-item" :to="`/collection/${item.id}`">
                    <div class="u-time">{{ dateFormat(item.updated) }}</div>
                    <div class="m-img-box">
                        <el-image class="u-img" :src="resolveImagePath(item.image)" fit="cover">
                            <img slot="error" class="u-img" :src="`${imgPath}cover-${randomNumber()}.png`" />
                        </el-image>
                    </div>
                    <div class="u-content">
                        <div class="u-title">{{ item.title }}</div>
                        <div class="m-user">
                            <img class="u-avatar" :src="item.collection_user_info.user_avatar | showAvatar" />
                            <span class="u-nickname" v-text="item.collection_user_info.display_name"></span>
                        </div>
                    </div>
                </router-link>
            </wc-waterfall>
            <div class="m-empty" v-else>
                <el-empty description="暂无小册" :image-size="100"></el-empty>
            </div>
        </div>

        <SuspendCommon :btnOptions="{ showHome: true }" :drawerOptions="{ hideType: hideType }">
            <template #default>
                <div class="m-suspend-search" @click="showSearchForm = true">
                    <img class="u-icon" src="@/assets/img/collection/search.svg" alt="" />
                    <span class="u-text">搜索</span>
                </div>
            </template>
        </SuspendCommon>

        <el-drawer
            :visible.sync="showSearchForm"
            direction="btt"
            :with-header="false"
            custom-class="u-drawer"
            :modal-append-to-body="false"
            append-to-body
            class="p-drawer-suspend"
        >
            <div class="u-drawer-title">搜索</div>
            <div class="m-search-input">
                <input type="text" class="u-input" placeholder="请输入搜索内容" @input="onMiniSearch" />
            </div>
        </el-drawer>
    </div>
</template>

<script>
import { showAvatar, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { __imgPath } from "@/utils/config";
import { dateFormat } from "@/utils/dateFormat.js";
import { getCollections } from "@/service/collection.js";
import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon.vue";
import "wc-waterfall";
export default {
    name: "CollectionList",
    props: [],
    components: {
        SuspendCommon,
    },
    data: function () {
        return {
            loading: false, //加载状态

            hideType: ["collect", "rss", "laterOn", "pin", "user", "report", "search"],
            list: [], //数据列表
            page: 1, //当前页数
            search: "",

            showSearchForm: false,
        };
    },
    filters: {
        showAvatar: function (url) {
            return showAvatar(url);
        },
    },
    computed: {
        imgPath() {
            return `${__imgPath}topic/bbs/`;
        },
        params: function () {
            return {
                page: this.page,
                per: 20,
            };
        },
    },
    methods: {
        resolveImagePath,
        randomNumber() {
            return Math.floor(Math.random() * 4) + 1;
        },
        loadData: function () {
            this.loading = true;
            const params = {
                ...this.params,
                keyword: this.search,
            };
            getCollections(params)
                .then((res) => {
                    if (this.page == 1) {
                        this.list = res?.data?.data?.list;
                    } else {
                        this.list = [...this.list, ...res?.data?.data?.list];
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        dateFormat: function (timestamp) {
            return dateFormat(new Date(timestamp * 1000));
        },
        handleScroll(event) {
            const { target } = event;
            if (this.loading) return;
            if (target.scrollHeight - target.scrollTop - 60 < target.clientHeight) {
                this.page = this.page + 1;
            }
        },
        onMiniSearch(event) {
            this.search = event.target.value;
            this.page = 1;
            this.loadData();
        },
    },
    watch: {
        params: {
            immediate: true,
            deep: true,
            handler: function () {
                this.loadData();
            },
        },
        list: {
            handler: function (list) {
                if (list.length && this.$refs.waterfall) {
                    // 重新渲染瀑布流高度
                    this.$nextTick(() => {
                        this.$refs.waterfall.repaints();
                    });
                }
            },
            deep: true,
        },
    },
    mounted() {},
};
</script>
<style lang="less">
@black40: rgba(28, 28, 28, 0.4);
@black40-dark: rgba(255, 255, 255, 0.4);
@black80: rgba(28, 28, 28, 0.8);
@black80-dark: rgba(255, 255, 255, 0.8);
.m-mini-collection-box {
    &::after {
        content: "";
        display: block;
        position: fixed;
        z-index: -2;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #fafafa;
    }
    .m-list {
        height: 100vh;
        overflow-y: auto;
        padding: 0 1rem;
        padding-top: 1rem;
        box-sizing: border-box;
        .m-item {
            .u-time {
                text-align: right;
                font-size: 0.75rem;
                padding-bottom: 0.25rem;
                color: @black40;
            }
            .m-img-box {
                height: 5.25rem;
                position: relative;
                .u-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 0.5rem 0.5rem 0 0;
                }
                &::after {
                    content: "";
                    display: block;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0) 3.09%, #fff 100%);
                }
            }
            .u-content {
                background-color: white;
                border-radius: 0 0 0.25rem 0.25rem;
                .u-title {
                    padding: 0.5625rem 0.75rem;
                    font-size: 0.875rem;
                    line-height: 1.25rem;
                    word-break: break-all;
                    color: @black80;
                }
                .m-user {
                    padding: 0 0.75rem 0.75rem;
                    display: flex;
                    align-items: center;
                    .u-avatar {
                        border-radius: 50%;
                        .size(1rem);
                    }
                    .u-nickname {
                        font-size: 0.75rem;
                        margin-left: 0.25rem;
                        color: @black40;
                    }
                }
            }
        }

        .m-empty {
            display: flex;
            justify-content: center;
            padding-top: 1rem;
            color: @black40;
        }
    }

    .m-suspend-search {
        width: 7.5rem;
        display: flex;
        align-items: center;
        font-size: 1rem;
        gap: 0.25rem;
        .u-icon {
            width: 1.5rem;
        }
    }
}

.p-drawer-suspend {
    .u-drawer-title {
        .fz(18px,20px);
        .bold();
        color: rgba(255, 255, 255, 0.6);
    }
    .m-search-input {
        .mt(12px);
        .u-input {
            .fz(14px,20px);
            width: 100%;
            box-sizing: border-box;
            background-color: transparent;
            color: #fedaa3;
            background-color: rgba(255, 255, 255, 0.1);
            border: none;
            padding: 12px;
            border-radius: 6px;
        }
    }
}

@media (prefers-color-scheme: dark) {
    .m-mini-collection-box {
        &::after {
            background-color: #1c1c1c;
        }
        .m-list {
            .m-item {
                .u-time {
                    color: @black40-dark;
                }
                .m-img-box {
                    &::after {
                        background: linear-gradient(180deg, rgba(40, 40, 40, 0) 3.09%, #282828 100%);
                    }
                }
                .u-content {
                    background-color: #282828;
                    .u-title {
                        color: @black80-dark;
                    }
                    .m-user {
                        .u-nickname {
                            color: @black40-dark;
                        }
                    }
                }
            }

            .m-empty {
                color: @black40-dark;
            }
        }
    }
}
</style>
