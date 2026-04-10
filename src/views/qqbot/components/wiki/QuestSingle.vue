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
                            <span class="u-endpoint-separate"> · </span>
                            <span class="u-endpoint-name">{{ quest.start.name || "未知" }}</span>
                            <span class="u-endpoint-id">
                                ({{ pointType(quest.start.type) }}ID: {{ idFilter(quest.start.id) }})
                            </span>
                        </p>
                        <span class="u-endpoint-arrow">▶</span>
                        <p class="u-endpoint">
                            <span class="u-endpoint-label">任务终点: </span>
                            <span class="u-endpoint-name">{{ quest.end.mapName }}</span>
                            <span class="u-endpoint-separate"> · </span>
                            <span class="u-endpoint-name">{{ quest.end.name || "未知" }}</span>
                            <span class="u-endpoint-id">
                                ({{ pointType(quest.end.type) }}ID: {{ idFilter(quest.end.id) }})
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            <div class="m-quest-desc">
                <div class="u-desc-title">
                    <img src="@/assets/img/quest/quest_desc_robot.svg" class="u-title-img" />
                    <span class="u-title">任务描述</span>
                </div>
                <div class="u-desc-content">
                    <div class="u-desc u-quest-desc" v-html="questDesc"></div>
                </div>
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
                            <QuestItemIcon :item-id="needItem.id" :size="14" />
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
                            <template v-if="reward.type === 'money'">
                                获得金钱：<GamePrice :price="reward.count" />
                            </template>
                            <template v-else-if="reward.type === 'exp'">
                                获得阅历：{{ reward.count }}
                            </template>
                            <template v-else-if="reward.type === 'affect'">
                                获得声望：{{ reward.force }}（{{ reward.count > 0 ? "+" + reward.count : reward.count }}）
                            </template>
                            <template v-else>
                                {{ rewardLabel(reward) }}
                            </template>
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
        <div class="m-wiki-post-empty is-robot-quest-empty" v-else-if="!loading">
            <span>暂无相关攻略，欢迎热心侠士前往补充！</span>
        </div>

        <WikiRobotBottom type="quest" :id="id" />
    </div>
</template>

<script>
import { showAvatar, ts2str } from "@jx3box/jx3box-common/js/utils";
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import GamePrice from "@jx3box/jx3box-ui/src/wiki/GamePrice.vue";
import { get_quest } from "@/service/qqbot-wiki";
import WikiRobotBottom from "./Bottom.vue";
import QuestItemIcon from "./QuestItemIcon.vue";

function questDescFormat(desc) {
    if (!desc) return "";
    return String(desc)
        .replace(/&emsp;/g, "")
        .replace(/\\n/g, "\n")
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => `<p>${line}</p>`)
        .join("");
}

export default {
    name: "QQBotWikiQuestSingle",
    components: {
        Article,
        GamePrice,
        QuestItemIcon,
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
                if (this.id) this.loadAll();
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
            const typeMap = {
                money: "金钱",
                exp: "阅历",
                train: "修为",
                tongFund: "帮会资金",
                tongResource: "载具资源",
                prestige: "威名点",
                vigor: "精力",
                justice: "侠行点",
                titlePoint: "战阶积分",
                achievement: "成就",
                skill: "技能",
            };
            if (reward.type === "affect") {
                const val = reward.count > 0 ? `+${reward.count}` : reward.count;
                return `声望：${reward.force || ""}（${val}）`;
            }
            if (reward.type === "item_group") {
                return reward.items?.map((item) => item.name || `物品#${item.id}`).join("、") || "物品奖励";
            }
            const name = typeMap[reward.type] || reward.name || reward.type || "未知奖励";
            if (reward.count != null) {
                return `${name} × ${reward.count}`;
            }
            return reward.name || name;
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
                    users: mixRes?.users || [],
                };
                if (this.quest?.name) {
                    document.title = this.quest.name + (this.$t ? this.$t("pages.common.appendTitle") : "");
                }
            } catch (e) {
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
.m-qqbot-wiki-quest {
    color: rgba(255, 255, 255, 0.75);

    .m-quest-top {
        .m-quest-header {
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
                justify-content: space-between;
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
                .flex;
                align-items: center;
                .gap(8px);

                .u-endpoint {
                    margin: 0;
                }

                .u-endpoint-arrow {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 10px;
                    flex: none;
                }

                .u-endpoint-label {
                    color: #F7EFB3;
                }

                .u-endpoint-id {
                    color: rgba(255, 255, 255, 0.5);
                }
            }

        }

        .m-quest-desc {
            margin-top: 10px;

            .u-desc-title {
                .flex;
                align-items: center;
                .gap(4px);
                margin-bottom: 10px;

                .u-title-img {
                    .size(16px, auto);
                }

                .u-title {
                    font-size: 14px;
                    .bold;
                    color: #F7EFB3;
                }
            }

            .u-desc-content {
                padding: 12px;
                border-radius: 8px;
                background: linear-gradient(to top, #383838 0%, #000000 100%);
                border: 1px solid #6e6e6e;
                box-shadow: inset 0px 10px 5px #000000;
            }

            .u-desc {
                font-size: 12px;
                color: #fff;
                line-height: 18px;

                p {
                    text-indent: 2em;
                    margin: 0;
                }
            }
        }

        .m-quest-target__reward {
            margin-top: 10px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;

            .m-quest-target,
            .m-quest-reward {
                min-height: 100px;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #6e6e6e;
                box-shadow: inset 0px 10px 5px #000000;
                font-size: 12px;
                color: #fff;
                overflow-y: auto;

                .u-title {
                    font-size: 14px;
                    .bold;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                }
            }

            .m-quest-target {
                background: linear-gradient(to top, #283d69 0%, #000000 100%);

                .u-title {
                    color: #3fc5f2;
                }

                .u-target-sub {
                    .flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 12px;
                    .bold;
                    color: #fff;
                    margin-bottom: 4px;
                }

                .u-need-item-icon {
                    width: 14px;
                    height: 14px;
                    border-radius: 2px;
                }

                .u-content {
                    margin-top: 8px;
                    font-size: 12px;
                    font-weight: normal;
                    color: rgba(255, 255, 255, 0.75);
                    line-height: 17px;
                    text-indent: 2em;
                }
            }

            .m-quest-reward {
                background: linear-gradient(to top, rgba(89, 66, 22, 1) 0%, #000000 100%);

                .u-title {
                    color: #ffc300;
                }

                .u-reward-list {
                    .flex;
                    flex-wrap: wrap;
                    gap: 4px 10px;

                    &.no-data {
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.5);
                    }
                }

                .u-reward {
                    font-size: 12px;
                    font-weight: normal;
                    color: #fff;
                    min-width: calc(50% - 5px);
                    position: relative;
                    padding-left: 15px;
                    .flex;
                    align-items: center;

                    &::before {
                        position: absolute;
                        content: "";
                        display: block;
                        width: 5px;
                        height: 5px;
                        border-radius: 50%;
                        background-color: #fff;
                        top: calc(50% - 2.5px);
                        left: 2.5px;
                    }

                    .c-game-price {
                        color: #fff;

                        span {
                            display: inline-flex;
                            align-items: center;
                        }

                        img {
                            width: 14px;
                            height: 14px;
                        }
                    }
                }
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
        font-size: 12px;
        text-align: center;
    }
}
</style>
