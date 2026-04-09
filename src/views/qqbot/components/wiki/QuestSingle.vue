<template>
    <div class="m-qqbot-wiki-quest" v-loading="loading">
        <div class="m-quest-top" v-if="quest && quest.id !== -1">
            <div class="m-quest-header">
                <div class="m-quest-title">
                    <div class="m-title">
                        <div class="u-title">
                            <img class="u-title-img" src="@/assets/img/quest/quest_title_robot.svg" />
                            {{ quest.name }}
                        </div>
                        <span class="u-title-id"> (ID:{{ quest.id }})</span>
                    </div>

                    <div class="u-endpoint__wrapper">
                        <p class="u-endpoint" v-show="quest.start">
                            <span class="u-endpoint-label">任务起点: </span>
                            <span class="u-endpoint-name">{{ quest.start.mapName }}</span>
                            <span class="u-endpoint-separate"> - </span>
                            <span class="u-endpoint-name">{{ quest.start.name || "未知" }}</span>
                            <span class="u-endpoint-id"
                                >({{ pointType(quest.start.type) }}ID: {{ idFilter(quest.start.id) }})</span
                            >
                        </p>
                        <p class="u-endpoint">
                            <span class="u-endpoint-label">任务终点: </span>
                            <span class="u-endpoint-name">{{ quest.end.mapName }}</span>
                            <span class="u-endpoint-separate"> - </span>
                            <span class="u-endpoint-name">{{ quest.end.name || "未知" }}</span>
                            <span class="u-endpoint-id"
                                >({{ pointType(quest.end.type) }}ID: {{ idFilter(quest.end.id) }})</span
                            >
                        </p>
                    </div>
                </div>
                <img src="@/assets/img/quest/quest_robot.svg" class="u-item-img__right" />
            </div>
            <div class="m-quest-desc">
                <div class="u-desc-title">
                    <img src="@/assets/img/quest/quest_desc_robot.svg" class="u-title-img" />
                    <div class="u-title">任务描述</div>
                </div>
                <div class="u-desc u-quest-desc" v-html="questDesc"></div>
            </div>
            <div class="m-quest-target__reward">
                <div class="m-quest-target">
                    <div class="u-title">任务目标</div>
                    <template v-if="quest.killNpcs && quest.killNpcs.length > 0">
                        <div class="u-target-sub" v-for="(killNpc, i) in quest.killNpcs" :key="'kill-' + i">
                            <span>击杀</span>
                            <span>{{ killNpc.name }}</span>
                            <img
                                v-if="killNpc.share"
                                src="@/assets/img/quest/target-15.png"
                                style="width: 14px; height: 14px"
                                alt="可共享击杀"
                                title="该目标可共享击杀"
                            />
                            <span> × {{ killNpc.amount }}</span>
                        </div>
                    </template>
                    <template v-if="quest.needItems && quest.needItems.length > 0">
                        <div class="u-target-sub" v-for="(needItem, i) in quest.needItems" :key="'item-' + i">
                            <span>收集</span>
                            <span>{{ needItem.name || "#" + needItem.id }}</span>
                            <span>× {{ needItem.amount }}</span>
                        </div>
                    </template>
                    <div
                        class="u-target-sub"
                        v-for="(questValue, i) in quest.questValues"
                        :key="'value-' + i + '-' + questValue.str"
                    >
                        <span>{{ questValue.str }} × {{ questValue.value }}</span>
                    </div>
                    <p class="u-content" v-html="targetDesc"></p>
                </div>
                <div class="m-quest-reward">
                    <div class="u-title">任务奖励</div>
                    <div class="u-reward-list" v-if="quest.rewards && quest.rewards.length">
                        <div class="u-reward" v-for="(reward, i) in quest.rewards" :key="'reward-' + i">
                            {{ rewardLabel(reward) }}
                        </div>
                    </div>
                    <div class="u-reward-list no-data" v-else>该任务无奖励</div>
                </div>
            </div>
        </div>

        <div class="m-wiki-post-panel is-robot" v-if="wiki_post && wiki_post.post">
            <div class="m-wiki-panel">
                <div class="m-wiki-panel__head">
                    <img class="u-icon" src="@/assets/img/quest/quest.svg" />
                    <span class="u-txt">任务攻略</span>
                </div>
                <div class="m-wiki-panel__body">
                    <Article id="wikiArticle" :content="wiki_post.post.content" />
                </div>
            </div>
        </div>
        <div class="m-wiki-post-empty is-robot-quest-empty" v-else-if="!loading">
            <span>暂无相关攻略，欢迎热心侠士前往补充！</span>
        </div>

        <WikiRobotBottom type="quest" :id="id" />
    </div>
</template>

<script>
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import { get_quest } from "@/service/qqbot-wiki";
import WikiRobotBottom from "./Bottom.vue";

function questDescFormat(desc) {
    if (!desc) return "";
    return String(desc).replace(/&emsp;/g, "").replace(/\\n/g, "<br />");
}

export default {
    name: "QQBotWikiQuestSingle",
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
            wiki_post: null,
            quest: {
                id: -1,
                name: "",
                start: { type: "npc", id: -1, mapName: "", name: "" },
                end: { type: "npc", id: -1, mapName: "", name: "" },
                rewards: [],
                killNpcs: [],
                needItems: [],
                questValues: [],
                desc: null,
            },
            imagesLoaded: false,
        };
    },
    computed: {
        id() {
            return parseInt(this.sourceId) || parseInt(this.$route.query.id) || 0;
        },
        client() {
            return this.$store.state.client;
        },
        questDesc() {
            return questDescFormat(this.quest?.desc?.Description || "");
        },
        targetDesc() {
            return questDescFormat(this.quest?.desc?.Objective || "");
        },
    },
    watch: {
        id: {
            immediate: true,
            handler() {
                if (this.id) this.loadAll();
            },
        },
    },
    methods: {
        pointType(value) {
            if (value === "npc") return "NPC";
            if (value === "doodad") return "交互物品";
            if (value === "item") return "物品";
            return "";
        },
        idFilter(id) {
            if (Array.isArray(id)) return `${id[0]}_${id[1]}`;
            return id;
        },
        rewardLabel(reward) {
            if (!reward) return "";
            if (typeof reward === "string") return reward;
            return reward.name || reward.label || reward.type || JSON.stringify(reward);
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
        async loadAll() {
            this.setNotReady();
            this.loading = true;
            try {
                const [questRes, mixRes] = await Promise.all([
                    get_quest(this.id, this.client),
                    wiki.mix({ type: "quest", id: this.id, client: this.client }),
                ]);
                this.quest = {
                    id: -1,
                    name: "",
                    start: { type: "npc", id: -1, mapName: "", name: "" },
                    end: { type: "npc", id: -1, mapName: "", name: "" },
                    rewards: [],
                    killNpcs: [],
                    needItems: [],
                    questValues: [],
                    desc: null,
                    ...(questRes?.data || {}),
                };
                this.wiki_post = {
                    post: mixRes?.post || null,
                    source: mixRes?.source || null,
                };
                if (this.quest?.name) {
                    document.title = this.quest.name + (this.$t ? this.$t("pages.common.appendTitle") : "");
                }
            } catch (e) {
                this.wiki_post = null;
            } finally {
                this.loading = false;
                this.initImageLoader();
            }
        },
    },
};
</script>

<style lang="less">
.m-qqbot-wiki-quest {
    color: rgba(255, 255, 255, 0.75);

    .m-quest-top {
        .m-quest-header {
            .flex;
            justify-content: space-between;
            align-items: center;
            .gap(8px);
            padding: 12px;
            border-radius: 8px;
            background: linear-gradient(to top, #383838 0%, #000000 100%);
            border: 1px solid #6e6e6e;
            box-shadow: inset 0px 10px 5px #000000;

            .m-quest-title {
                flex: 1;
            }

            .m-title {
                .flex;
                align-items: center;
                .gap(4px);
                color: #fff;
            }

            .u-title {
                .flex;
                align-items: center;
                .gap(4px);
                font-size: 18px;
                .bold;
                color: #fff;
            }

            .u-title-img {
                .size(18px, auto);
            }

            .u-title-id {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.5);
            }

            .u-endpoint__wrapper {
                margin-top: 8px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.75);

                .u-endpoint {
                    margin: 2px 0;
                }

                .u-endpoint-label {
                    color: #ffc300;
                }

                .u-endpoint-id {
                    color: rgba(255, 255, 255, 0.5);
                }
            }

            .u-item-img__right {
                .size(56px, auto);
            }
        }

        .m-quest-desc {
            margin-top: 10px;
            padding: 12px;
            border-radius: 8px;
            background: linear-gradient(to top, #383838 0%, #000000 100%);
            border: 1px solid #6e6e6e;
            box-shadow: inset 0px 10px 5px #000000;

            .u-desc-title {
                .flex;
                align-items: center;
                .gap(4px);

                .u-title-img {
                    .size(16px, auto);
                }

                .u-title {
                    font-size: 14px;
                    .bold;
                    color: #ffc300;
                }
            }

            .u-desc {
                margin-top: 6px;
                font-size: 12px;
                color: #fff;
                line-height: 18px;
            }
        }

        .m-quest-target__reward {
            margin-top: 10px;
            .flex;
            .gap(10px);

            .m-quest-target,
            .m-quest-reward {
                flex: 1;
                padding: 12px;
                border-radius: 8px;
                background: linear-gradient(to top, #383838 0%, #000000 100%);
                border: 1px solid #6e6e6e;
                box-shadow: inset 0px 10px 5px #000000;
                font-size: 12px;
                color: #fff;

                .u-title {
                    font-size: 14px;
                    .bold;
                    color: #ffc300;
                    margin-bottom: 6px;
                }

                .u-target-sub {
                    .flex;
                    align-items: center;
                    .gap(4px);
                    margin-bottom: 4px;
                }

                .u-content {
                    margin-top: 6px;
                }

                .u-reward-list {
                    .flex;
                    flex-direction: column;
                    .gap(4px);

                    &.no-data {
                        color: rgba(255, 255, 255, 0.5);
                    }
                }
            }
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

    .m-wiki-post-empty.is-robot-quest-empty {
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
