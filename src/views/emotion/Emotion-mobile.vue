<template>
    <div class="v-emotion" v-loading="loading">
        <div class="m-chat-container" ref="chatContainer" @scroll="handleScroll">
            <!-- 聊天消息列表 -->
            <div class="m-chat-list" ref="chatList">
                <template v-for="(item, index) in list">
                    <template>
                        <div :key="item.id || index" class="m-chat-item">
                            <div class="m-message">
                                <div class="m-avatar">
                                    <img class="u-avatar" :src="item.user_info?.user_avatar | showAvatar" />
                                </div>
                                <div class="m-content">
                                    <div class="m-header">
                                        <span class="u-author">{{ item.user_info?.display_name || "匿名" }}</span>
                                    </div>
                                    <div class="m-body">
                                        <el-image class="u-img" :src="item.url" :preview-src-list="[item.url]">
                                        </el-image>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </template>
            </div>
        </div>
        <div class="m-send">
            <div
                class="m-robot"
                @click="
                    filterVisible = true;
                    drawerType = type;
                "
            >
                <template v-if="type == 'all'">
                    <img class="u-icon" svg-inline src="@/assets/img/emotion/filter_icon.svg" />
                    <div class="u-tip">筛选骚图</div>
                </template>
                <template v-else>
                    <img class="u-icon" svg-inline :src="showSchoolIcon(type)" />
                    <div class="u-tip">仅查看{{ schoolmap[type] }}</div>
                </template>
            </div>
        </div>

        <el-drawer :visible.sync="filterVisible" direction="btt" custom-class="m-filter-drawer">
            <div class="m-filter-all" @click="drawerType = 'all'" :class="{ active: drawerType == 'all' }">全部</div>
            <div class="m-filter-group">
                <div
                    class="m-filter-item"
                    @click="drawerType = i"
                    :class="{ active: drawerType == i }"
                    v-for="(item, i) in schoolmap"
                    :key="i"
                >
                    <img class="u-icon" :src="showSchoolIcon(i)" :alt="item" />
                    {{ item }}
                </div>
            </div>
            <div class="m-filter-btn">
                <div class="m-filter-btn-reset" @click="drawerType = 'all'">重置</div>
                <div
                    class="m-filter-btn-confirm"
                    @click="
                        filterVisible = false;
                        type = drawerType;
                        page = 1;
                        scrollToBottomFlag = true;
                    "
                >
                    确定
                </div>
            </div>
        </el-drawer>
    </div>
</template>

<script>
// 模块
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
// 分类
import schoolmap from "@jx3box/jx3box-data/data/xf/schoolid.json";
import { __imgPath } from "@/utils/config";

// 数据
import { getEmotions, getEmotion } from "@/service/emotion";

export default {
    name: "Emotion",
    components: {},
    data: function () {
        return {
            loading: false,

            // types
            schoolmap,

            // pagination
            drawerType: "all",
            type: "all",
            star: 0,
            original: 0,
            search: "",
            per: 50,
            page: 1,
            pages: 1,
            total: 0,
            emotions: [], //当前页面列表
            list: [], //合并列表

            emotion: "",
            scrollToBottomFlag: true,
            isDarkModeStatus: window.matchMedia("(prefers-color-scheme: dark)").matches,
            filterVisible: false,
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        params: function ({ search, per, page, star, original }) {
            return {
                per: ~~per,
                page: ~~page,
                type: this.type == "all" ? "" : this.type,
                search,
                star: !!this.star ? 1 : "",
                original: !!this.original ? 1 : "",
            };
        },
        keys: function () {
            return [this.id, this.type, this.star, this.original];
        },
    },
    filters: {
        showAvatar: function (val) {
            return showAvatar(val);
        },
    },
    methods: {
        loadList: function (appendMode = false) {
            this.loading = true;
            if (appendMode) {
                this.page++;
            }
            const params = {
                ...this.params,
            };
            return getEmotions(params)
                .then((res) => {
                    if (appendMode) {
                        this.list = [...(res.data?.data?.list || []), ...this.list];
                    } else {
                        this.list = res.data?.data?.list || [];
                    }
                    this.total = res.data.data.total;
                    this.pages = res.data.data.pages;
                    this.loading = false;

                    if (this.scrollToBottomFlag) {
                        this.scrollToBottom();
                        this.scrollToBottomFlag = false;
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadSingle() {
            this.loading = true;
            getEmotion(this.id)
                .then((res) => {
                    this.emotion = res?.data?.data;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 初始化
        init: function () {
            if (this.id) {
                this.loadSingle();
            } else {
                this.loadList();
            }
        },

        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.chatContainer;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        },
        handleScroll() {
            const container = this.$refs.chatContainer;
            if (!container) return;

            // 检查是否滚动到顶部，加载更多历史数据
            if (container.scrollTop === 0) {
                this.loadList(true);
            }
        },
        showSchoolIcon: function (val) {
            return __imgPath + "image/school/" + val + ".png";
        },
    },
    watch: {
        keys: {
            deep: true,
            handler: function () {
                this.init();
            },
            immediate: true,
        },
    },
    mounted: function () {},
    created: function () {},
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/emotion/emotion-mobile.less";
</style>
