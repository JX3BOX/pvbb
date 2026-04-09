<template>
    <div class="m-qqbot-wiki-knowledge" v-loading="loading">
        <div class="m-robot-header">
            <div class="m-robot-header__left">
                <div class="u-title">{{ title }}</div>
                <div class="u-desc">剑网3魔盒通识百科 - 剑三世界概念全知道！</div>
            </div>
            <img class="u-robot-header__right" src="@/assets/img/knowledge/knowledge_robot.svg" />
        </div>

        <div class="m-wiki-post-panel is-robot" v-if="data && data.post">
            <div class="m-wiki-panel">
                <div class="m-wiki-panel__head">
                    <img class="u-icon" src="@/assets/img/knowledge/knowledge.svg" />
                    <span class="u-txt">通识攻略</span>
                </div>
                <div class="m-wiki-panel__body">
                    <Article id="wikiArticle" :content="content" />
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
            data: null,
            imageCount: 0,
            loadedImageCount: 0,
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
            return this.data?.source?.name || "";
        },
        content() {
            return this.data?.post?.content || "";
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
        async getData() {
            this.setNotReady();
            this.loading = true;
            try {
                const res = await wiki.get({ type: "knowledge", id: this.id }, { client: this.client });
                this.data = res?.data?.data || null;
                if (this.title) {
                    document.title = this.title + (this.$t ? this.$t("pages.common.appendTitle") : "");
                }
            } catch (e) {
                this.data = null;
            } finally {
                this.loading = false;
                this.initImageLoader();
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
        background: linear-gradient(to top, #383838 0%, #000000 100%);
        border: 1px solid #6e6e6e;
        box-shadow: inset 0px 10px 5px #000000;
        padding: 12px;

        .m-wiki-panel__head {
            .flex;
            align-items: center;
            .gap(4px);
            font-size: 16px;
            color: #ffc300;
            font-weight: 700;
            margin-bottom: 8px;

            .u-icon {
                .size(16px, auto);
            }
        }

        .m-wiki-panel__body {
            color: #fff;
            font-size: 12px;
            line-height: 18px;

            img {
                max-width: 100%;
                height: auto !important;
            }

            p,
            span,
            a,
            div {
                color: #fff !important;
                font-size: 12px !important;
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
