<template>
    <!-- 搜索展示 -->
    <div class="m-search_all">
        <div class="m-search-toolbar" ref="toolbar">
            <el-radio-group v-model="filter_name" size="small">
                <el-radio-button label="community_discussion_topic,community_discussion_topic_reply"
                    >全部</el-radio-button
                >
                <el-radio-button label="community_discussion_topic">帖子</el-radio-button>
                <el-radio-button label="community_discussion_topic_reply">回帖</el-radio-button>
            </el-radio-group>
            <el-button size="small" class="u-close-btn" type="info" @click="closeSearch" icon="el-icon-close"
                >关闭搜索</el-button
            >
        </div>
        <ul class="m-result m-post" v-if="list.length">
            <li class="u-item" v-for="(item, i) in list" :key="i">
                <div class="u-info">
                    <a class="u-title" :href="resultLink(item)" target="_blank">
                        <!-- <i class="u-client" v-if="item.client" :class="`i-client-${item.client}`">{{ clientKey(item.client) }}</i> -->
                        <el-tag
                            type="warning"
                            class="u-type"
                            size="small"
                            v-if="item.name === 'community_discussion_topic'"
                        >
                            <i class="el-icon-collection-tag"></i> 帖子
                        </el-tag>
                        <el-tag
                            class="u-type"
                            type="info"
                            size="small"
                            v-if="item.name === 'community_discussion_topic_reply'"
                        >
                            <i class="el-icon-chat-line-round"></i> 回帖
                        </el-tag>

                        <span class="u-text" v-html="highlightText(item.title || item.content || '无内容')"></span>
                    </a>
                    <span class="u-link">
                        <span class="u-date"><i class="el-icon-time"></i> {{ item.updated_at }}</span>
                        <i class="el-icon-user"></i> {{ item.author }}
                    </span>
                </div>
            </li>
        </ul>
        <div v-else>
            <el-alert class="m-null" title="没有搜索到相关数据" type="info" show-icon></el-alert>
        </div>
        <slot></slot>
    </div>
</template>

<script>
import { __clients, __Root } from "@jx3box/jx3box-common/data/jx3box.json";

export default {
    name: "CommunitySearchList",
    props: {
        keyword: {
            type: String,
            default: "",
        },
        list: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            filter_name: "community_discussion_topic,community_discussion_topic_reply",
        };
    },
    watch: {
        filter_name() {
            this.$emit("search", {
                filter_name: this.filter_name,
            });
        },
    },
    methods: {
        closeSearch() {
            this.filter_name = "community_discussion_topic,community_discussion_topic_reply";
            this.$emit("close");
        },
        resultLink({ link }) {
            return link;
        },
        clientKey(val) {
            return __clients[val];
        },
        // 高亮搜索关键字
        highlightText(text) {
            const regex = new RegExp(`(${this.keyword})`, "gi");
            text = text.replace(regex, '<span style="background-color: #ffff00; color: #ff0000;">$1</span>');
            return text;
        },
    },
};
</script>

<style lang="less" scoped>
@bg: #f6f8fa;
@visited: #05037b;
@pink: #f39;
@desc: #888;
@gray: #888;
@space: 20px;
@ipad: 1024px;
@ipad-y: 767px;
.u-close-btn {
    margin-left: 12px;
}
.m-search_all {
    .r(4px);
    .mb(32px);
    background-color: #fff;
    .m-result {
        padding: 0 30px 30px;
        margin: 0;
        .u-item {
            .w(100%);
            .flex;
            .mb(20px);
            gap: 10px;
            justify-content: space-between;
            .u-img {
                .r(10px);
                .h(48px);
                max-width: 120px;
            }
            .u-info {
                .flex;
                flex-direction: column;
            }
        }
    }
    .m-null {
        margin-top: 12px;
    }
}

// --item
.m-post {
    a {
        color: @color-link;
    }
    .u-list {
        padding: 0;
        margin: 0;
    }

    .u-item {
        margin-bottom: @space;
        list-style: none;
        *zoom: 1;
    }

    .u-link {
        .mt(5px);
        display: block;
    }

    .u-title {
        font-size: 16px;
        line-height: 1.5;
        letter-spacing: 0.6px;
        b {
            color: @pink;
        }
        &:hover .u-text {
            box-shadow: 0 1px 0 @color-link;
        }
    }
    .u-link {
        font-size: 12px;
        line-height: 2;
        color: @gray;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .u-date {
        // background-color: @bg;
        // color: @pink;
        border-radius: 2px;
        padding: 2px 5px;
        // font-weight: 600;
    }

    .u-pic {
        float: left;
        margin-right: 10px;
    }

    .u-desc {
        font-size: 13px;
        line-height: 1.6;
        color: @desc;
        letter-spacing: 0.6px;
        b {
            color: @pink;
        }
    }
    .u-client {
        font-style: normal;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 3px;
        margin-right: 5px;
    }

    .u-type {
        margin-right: 10px;
    }
}

.m-search-toolbar {
    .flex;
    padding: 15px 30px;
    margin: 0 0 20px;
    // background: white;
    backdrop-filter: blur(10px);
    position: sticky;
    top: 170px;
    justify-content: space-between;
    border-bottom: 1px solid #eee;
}
</style>
