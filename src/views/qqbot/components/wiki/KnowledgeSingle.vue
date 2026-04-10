<template>
    <div class="m-qqbot-wiki-knowledge" v-loading="loading">
        <div class="m-robot-header">
            <div class="m-robot-header__left">
                <div class="u-title">{{ title }}</div>
                <div class="u-desc">剑网3魔盒通识百科 - 剑三世界概念全知道！</div>
            </div>
            <img class="u-robot-header__right" src="@/assets/img/knowledge/knowledge_robot.svg" />
        </div>

        <div class="m-wiki-post-panel is-robot" v-if="wiki_post && wiki_post.post">
            <div class="m-wiki-panel">
                <div class="m-wiki-panel__head">
                    <img class="u-icon" src="@/assets/img/knowledge/knowledge.svg" />
                    <span class="u-txt">通识攻略</span>
                </div>
                <div class="m-wiki-panel__body">
                    <div class="m-wiki-metas">
                        <div class="u-meta">
                            <em class="u-label">参与贡献</em>
                            <div class="u-avatars" v-if="users.length">
                                <img
                                    v-for="(user, index) in displayUsers"
                                    :key="user.id || index"
                                    class="u-avatar"
                                    :src="showAvatar(user.avatar)"
                                    :alt="user.nickname || ''"
                                    @error.once="onAvatarError"
                                />
                                <span v-if="extraUsersCount > 0" class="u-extra">+{{ extraUsersCount }}人</span>
                            </div>
                            <span class="u-empty" v-else>暂无</span>
                        </div>
                        <div class="u-meta" v-if="updatedAt">
                            <em class="u-label">更新时间</em>
                            <span class="u-value">{{ updatedAt }}</span>
                        </div>
                    </div>
                    <Article id="wikiArticle" :content="wiki_post.post.content" @contentRendered="onContentRendered" />
                </div>
            </div>
        </div>
        <div class="m-wiki-post-empty is-robot-empty" v-else-if="!loading">
            <span>暂无相关攻略，欢迎热心侠士前往补充！</span>
        </div>

        <WikiRobotBottom type="knowledge" :id="id" />
    </div>
</template>

<script>
import { showAvatar, ts2str } from "@jx3box/jx3box-common/js/utils";
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import WikiRobotBottom from "./Bottom.vue";

export default {
    name: "QQBotWikiKnowledgeSingle",
    components: {
        Article,
        WikiRobotBottom,
    },
    props: {
        sourceId: {
            type: [String, Number],
            default: "",
        },
    },
    data() {
        return {
            loading: false,
            source: null,
            wiki_post: null,
            imagesLoaded: false,
        };
    },
    computed: {
        id() {
            return this.sourceId || this.$route.query.id || "";
        },
        client() {
            return this.$store.state.client;
        },
        title() {
            return this.source?.name || "";
        },
        users() {
            return this.wiki_post?.users || [];
        },
        displayUsers() {
            return this.users.slice(0, 5);
        },
        extraUsersCount() {
            return Math.max(this.users.length - this.displayUsers.length, 0);
        },
        updatedAt() {
            const updated = this.wiki_post?.post?.updated || this.wiki_post?.post?.post_modified;
            if (!updated) return "";
            if (typeof updated === "number" || /^\d+$/.test(String(updated))) {
                return ts2str(updated);
            }
            const dt = new Date(updated);
            if (isNaN(dt.getTime())) return "";
            const pad = (v) => (v < 10 ? "0" + v : v);
            return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler() {
                if (this.id) this.getData();
            },
        },
    },
    methods: {
        showAvatar(url) {
            return showAvatar(url, 36);
        },
        onAvatarError(e) {
            e.target.src = showAvatar("", 36);
        },
        setNotReady() {
            this.imagesLoaded = false;
            window.__READY__ = false;
        },
        setReady() {
            if (this.imagesLoaded) return;
            this.imagesLoaded = true;
            window.__READY__ = true;
        },
        initImageLoader() {
            this.$nextTick(() => {
                const container = document.getElementById("wikiArticle");
                if (!container) {
                    this.setReady();
                    return;
                }
                const images = Array.from(container.querySelectorAll("img"));
                if (!images.length) {
                    this.setReady();
                    return;
                }
                let finished = 0;
                const done = () => {
                    finished += 1;
                    if (finished >= images.length) this.setReady();
                };
                images.forEach((img) => {
                    if (img.complete) {
                        done();
                    } else {
                        img.addEventListener("load", done, { once: true });
                        img.addEventListener("error", done, { once: true });
                    }
                });
                setTimeout(() => this.setReady(), 5000);
            });
        },
        neutralizeFoldBlocks(container) {
            container.querySelectorAll(".e-summary").forEach((el) => {
                const clone = el.cloneNode(true);
                el.parentNode.replaceChild(clone, el);
            });
            container.querySelectorAll(".e-details").forEach((el) => {
                el.style.display = "block";
                el.style.height = "auto";
                el.style.overflow = "visible";
            });
        },
        onContentRendered() {
            const container = document.getElementById("wikiArticle");
            if (container) this.neutralizeFoldBlocks(container);
            this.initImageLoader();
        },
        async getData() {
            this.setNotReady();
            this.loading = true;
            try {
                const mixRes = await wiki.mix({ type: "knowledge", id: this.id, client: this.client });
                this.source = mixRes?.source || null;
                this.wiki_post = {
                    post: mixRes?.post || null,
                    source: mixRes?.source || null,
                    users: mixRes?.users || [],
                };
                if (this.title) {
                    document.title = this.title + (this.$t ? this.$t("pages.common.appendTitle") : "");
                }
            } catch (e) {
                this.source = null;
                this.wiki_post = null;
            } finally {
                this.loading = false;
                if (!this.wiki_post?.post) {
                    this.setReady();
                }
            }
        },
    },
};
</script>

<style lang="less">
.m-qqbot-wiki-knowledge {
    color: rgba(255, 255, 255, 0.75);

    .m-robot-header {
        .flex;
        justify-content: space-between;
        align-items: center;
        .gap(8px);
        padding: 12px;
        border-radius: 8px;
        background: linear-gradient(to top, #383838 0%, #000000 100%);
        border: 1px solid #6e6e6e;
        box-shadow: inset 0px 10px 5px #000000;

        .m-robot-header__left {
            flex: 1;
        }

        .u-title {
            font-size: 20px;
            .bold;
            color: #fff;
        }

        .u-desc {
            margin-top: 4px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
        }

        .u-robot-header__right {
            .size(56px, auto);
        }
    }

    .m-wiki-post-panel {
        margin-top: 10px;
        border-radius: 8px;
        background: #ffffff;
        border: 1px solid #e4e4e4;
        box-shadow: none;
        padding: 14px 16px;
        color: #333;

        .m-wiki-panel__head {
            .flex;
            align-items: center;
            .gap(6px);
            line-height: 1.2;

            .u-icon {
                .size(28px);
                flex: none;
                filter: brightness(0) saturate(100%) invert(32%) sepia(87%) saturate(3656%) hue-rotate(260deg)
                    brightness(92%) contrast(97%);
            }

            .u-txt {
                font-size: 18px;
                font-weight: 400;
                color: #222;
            }
        }

        .m-wiki-metas {
            .flex;
            flex-direction: column;
            .gap(6px);
            margin-bottom: 10px;

            .u-meta {
                .flex;
                align-items: center;
                .gap(10px);
                font-size: 13px;
            }

            .u-label {
                flex: none;
                width: 60px;
                font-style: normal;
                color: #999;
                font-size: 12px;
                background: #f5f5f5;
                border-radius: 4px;
                padding: 2px 6px;
            }

            .u-value {
                color: #333;
            }

            .u-avatars {
                .flex;
                align-items: center;
                .gap(4px);
            }

            .u-avatar {
                .size(22px);
                border-radius: 50%;
                border: 1px solid #e4e4e4;
                background-color: #f5f5f5;
                object-fit: cover;
            }

            .u-extra {
                margin-left: 4px;
                color: #666;
            }

            .u-empty {
                color: #999;
            }
        }

        .m-wiki-panel__body {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #eee;
            color: #333;
            font-size: 14px;
            line-height: 1.7;

            .c-article-tinymce {
                .e-summary {
                    pointer-events: none;
                }

                .e-details {
                    display: block !important;
                }
            }

            img {
                max-width: 100%;
                height: auto !important;
            }
        }
    }

    .m-wiki-post-empty.is-robot-empty {
        margin-top: 10px;
        width: 100%;
        border-radius: 8px;
        box-sizing: border-box;
        background: linear-gradient(to top, #383838 0%, #000000 100%);
        border: 1px solid #6e6e6e;
        box-shadow: inset 0px 10px 5px #000000;
        padding: 12px;
        color: rgba(255, 255, 255, 0.75);
        font-size: 12px;
        text-align: center;
    }
}
</style>
