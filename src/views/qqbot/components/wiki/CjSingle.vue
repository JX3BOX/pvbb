<template>
    <div class="m-qqbot-wiki-cj" v-loading="loading">
        <div class="m-achievement-single__robot" v-if="achievement && Object.keys(achievement).length">
            <div class="u-top">
                <div class="u-top__left">
                    <img
                        class="u-icon"
                        :src="icon_url(achievement.IconID)"
                        @error.once="
                            () => {
                                $event.target.src = icon_url();
                            }
                        "
                    />
                    <div class="u-title">{{ achievement.Name }}</div>
                </div>
                <div class="u-top__right">
                    <img class="u-point-icon" src="@/assets/img/cj/point.svg" />
                    <div class="u-point" v-text="achievement.Point ? achievement.Point : 0"></div>
                </div>
            </div>
            <div class="u-bottom">
                <span>成就描述：</span>
                <span class="u-desc" v-html="achievementDesc"></span>
            </div>
        </div>

        <div class="m-wiki-post-panel is-robot" v-if="wiki_post && wiki_post.post">
            <div class="m-wiki-panel">
                <div class="m-wiki-panel__head">
                    <img class="u-icon" src="@/assets/img/cj/achievement.svg" />
                    <span class="u-txt">成就攻略</span>
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

        <WikiRobotBottom type="achievement" :id="id" />
    </div>
</template>

<script>
import { iconLink, showAvatar, ts2str } from "@jx3box/jx3box-common/js/utils";
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import { get_achievement } from "@/service/qqbot-wiki";
import WikiRobotBottom from "./Bottom.vue";

export default {
    name: "QQBotWikiCjSingle",
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
            achievement: null,
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
        achievementDesc() {
            return (this.achievement?.Desc || "").replace(/\\n/g, "<br />");
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
                if (this.id) this.loadData();
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
        icon_url(id) {
            return iconLink(id, this.client);
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
        neutralizeFoldBlocks(container) {
            // 机器人截图无交互：移除 .e-summary 的点击事件（通过 clone 替换），并强制展开 .e-details
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
            // Article 已完成 doDOM（含 renderFoldBlock 绑定），此时再剥离事件才有效
            const container = document.getElementById("wikiArticle");
            if (container) this.neutralizeFoldBlocks(container);
            this.initImageLoader();
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
        async loadData() {
            this.setNotReady();
            this.loading = true;
            try {
                const [achievementRes, mixRes] = await Promise.all([
                    get_achievement(this.id, { client: this.client }),
                    wiki.mix({ type: "achievement", id: this.id, client: this.client }),
                ]);
                this.achievement = achievementRes?.data?.data?.achievement || {};
                this.wiki_post = {
                    post: mixRes?.post || null,
                    source: mixRes?.source || null,
                    users: mixRes?.users || [],
                };
                if (this.wiki_post?.source?.Name) {
                    document.title = this.wiki_post.source.Name + (this.$t ? this.$t("pages.common.appendTitle") : "");
                }
            } catch (e) {
                this.achievement = null;
                this.wiki_post = null;
            } finally {
                this.loading = false;
                // 有攻略内容时由 Article @contentRendered 驱动 neutralize + 图片等待；
                // 无内容时直接 ready，避免截图挂起
                if (!this.wiki_post?.post) {
                    this.setReady();
                }
            }
        },
    },
};
</script>

<style lang="less">
.m-qqbot-wiki-cj {
    color: rgba(255, 255, 255, 0.75);

    .m-achievement-single__robot {
        width: 100%;
        border-radius: 8px;
        background: linear-gradient(to top, #383838 0%, #000000 100%);
        border: 1px solid #6e6e6e;
        box-shadow: inset 0px 10px 5px #000000;
        padding: 12px;
        box-sizing: border-box;
        color: #fff;

        .u-top {
            .flex;
            justify-content: space-between;
            align-items: center;
            .gap(8px);

            .u-top__left {
                .flex;
                align-items: center;
                .gap(8px);
                flex: 1;
                min-width: 0;
            }

            .u-icon {
                .size(36px);
                border-radius: 4px;
                flex: none;
            }

            .u-title {
                font-size: 18px;
                .bold;
                color: #fff;
            }

            .u-top__right {
                .flex;
                align-items: center;
                .gap(4px);
                flex: none;
            }

            .u-point-icon {
                .size(24px);
            }

            .u-point {
                color: #fff;
                font-size: 16px;
                .bold;
            }
        }

        .u-bottom {
            margin-top: 10px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.75);
            line-height: 18px;

            .u-desc {
                color: #fff;
            }
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

            // 折叠块：机器人截图无交互，默认展开且禁止点击
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
    }
}
</style>
