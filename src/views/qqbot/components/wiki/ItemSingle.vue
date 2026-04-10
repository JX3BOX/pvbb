<template>
    <div class="m-qqbot-wiki-item" v-loading="loading">
        <div class="m-item-detail" v-if="source && Object.keys(source).length">
            <div class="m-item-header">
                <img
                    v-if="source.IconID"
                    class="u-item-icon"
                    :src="iconLink(source.IconID, client)"
                    :style="{ borderColor: item_color(source.Quality) }"
                />
                <div class="m-item-header__left">
                    <div class="u-top">
                        <div
                            class="u-name"
                            :class="{ white: source.Quality == 1 }"
                            v-text="source.Name"
                            :style="{
                                color: item_color(source.Quality),
                            }"
                        ></div>
                        <template v-if="source.MaxStrengthLevel">
                            <img
                                src="@/assets/img/item/star.svg"
                                class="u-star"
                                v-for="i in source.MaxStrengthLevel"
                                :key="'star-' + i"
                            />
                        </template>
                    </div>
                    <div class="u-bottom">
                        <div class="u-usage" v-if="show_equip_usage">
                            <template v-if="source.EquipUsage == 1">
                                <img class="u-label-icon" src="@/assets/img/item/pve.png" alt="" />
                                <span>秘境挑战(PVE)</span>
                            </template>
                            <template v-if="source.EquipUsage == 2">
                                <img class="u-label-icon" src="@/assets/img/item/pvp.png" alt="" />
                                <span>竞技对抗(PVP)</span>
                            </template>
                            <template v-if="source.EquipUsage == 3">
                                <img class="u-label-icon" src="@/assets/img/item/pvx.png" alt="" />
                                <span>休闲(PVX)</span>
                            </template>
                        </div>
                        <div v-if="source.AucGenre == 1" class="u-weapon-type-label">武器</div>
                        <div v-if="source.AucGenre == 2" class="u-weapon-type-label">暗器</div>
                        <div v-if="source.TypeLabel" class="u-type-label" v-text="source.TypeLabel"></div>
                        <span class="u-from" v-if="source.GetType">获得途径: {{ source.GetType }}</span>
                    </div>
                </div>
                <img src="@/assets/img/item/item_robot.svg" class="u-item-img__right" />
            </div>
        </div>
        <div class="m-item-content" v-if="source && Object.keys(source).length">
                <div class="u-line">
                    <div v-if="source.Level" class="u-level u-yellow" v-text="'品质等级' + source.Level"></div>
                    <div
                        v-if="Number(source.EquipmentRating)"
                        class="u-equipment-rating u-orange"
                        v-text="'装备分数' + source.EquipmentRating"
                    ></div>
                </div>
                <div class="u-line">
                    <div
                        v-if="source.Requires && source.Requires[5]"
                        class="u-require-level"
                        v-text="source.Requires[5]"
                    ></div>
                    <div
                        v-if="source.Recommend"
                        class="u-equipment-recommend"
                        v-text="'推荐门派：' + source.Recommend"
                    ></div>
                </div>
                <div class="m-attributes" v-if="source.attributes && source.attributes.length">
                    <div
                        class="u-attributes"
                        v-if="white_attributes.length"
                    >
                        <div
                            v-for="(attribute, key) in white_attributes"
                            :key="'white-' + key"
                            class="u-field"
                            :class="[`u-${attribute.color}`]"
                        >
                            <span class="u-value">
                                <GameText :text="attribute.label"></GameText>
                            </span>
                        </div>
                    </div>
                    <div
                        class="u-attributes"
                        v-if="green_attributes.length"
                    >
                        <div
                            v-for="(attribute, key) in green_attributes"
                            :key="'green-' + key"
                            class="u-field"
                            :class="[`u-${attribute.color}`]"
                        >
                            <span class="u-value">
                                <GameText :text="attribute.label"></GameText>
                            </span>
                        </div>
                    </div>
                </div>
                <div class="m-spec-wrapper" v-if="orange_std_attribute.length > 0 || orange_wujie_attribute.length > 0">
                    <div class="m-client-spec" v-if="orange_std_attribute.length > 0">
                        <div class="u-spec-attribute-title u-yellow">
                            <span>特殊属性效果 - <span class="u-client">旗舰</span></span>
                        </div>
                        <div
                            class="u-value u-spec-attribute"
                            v-for="(attribute, key) in orange_std_attribute"
                            :key="'std-' + key"
                        >
                            <GameText :text="attribute.label"></GameText>
                        </div>
                    </div>
                    <div class="m-client-spec" v-if="orange_wujie_attribute.length > 0">
                        <div class="u-spec-attribute-title u-yellow">
                            <span>特殊属性效果 - <span class="u-client">无界</span></span>
                        </div>
                        <div
                            class="u-value u-spec-attribute"
                            v-for="(attribute, key) in orange_wujie_attribute"
                            :key="'wujie-' + key"
                        >
                            <GameText :text="attribute.label"></GameText>
                        </div>
                        <div class="u-value u-spec-attribute u-orange">属性效果双端一致</div>
                    </div>
                </div>

                <div v-if="source.Set" class="u-set">
                    <div
                        class="u-yellow u-set-title"
                        v-html="`套装属性效果-<span>${source.Set.name}(1/${source.Set.siblings.length})</span>`"
                    ></div>
                    <ul class="u-set-siblings u-gray">
                        <li
                            v-for="(sibling, key) in source.Set.siblings"
                            :key="'sib-' + key"
                            :class="{
                                'u-yellow': sibling && (sibling == source.Name || sibling.includes(source.Name)),
                            }"
                        >
                            {{
                                sibling
                                    .split("/")
                                    .map((s) => s.trim())
                                    .sort((a, b) => a.localeCompare(b))
                                    .join(" / ")
                            }}
                        </li>
                    </ul>
                    <ul class="u-set-attributes u-orange">
                        <li v-for="(attribute, key) in source.Set.attributes" :key="'set-' + key">
                            <span>{{ `[${key}]` }}</span>
                            <GameText :client="client" :text="attribute" :ignore-color="true"></GameText>
                        </li>
                    </ul>
                </div>

                <p v-if="source.Desc" class="u-desc">
                    <GameText :client="client" :text="source.Desc"></GameText>
                </p>

                <div class="m-attributes m-wucai-attributes" v-if="source.WuCaiHtml" v-html="source.WuCaiHtml"></div>
        </div>

        <div class="m-wiki-post-panel is-robot" v-if="wiki_post && wiki_post.post">
            <div class="m-wiki-panel">
                <div class="m-wiki-panel__head">
                    <img class="u-icon" src="@/assets/img/item/item.svg" />
                    <span class="u-txt">物品攻略</span>
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

        <WikiRobotBottom type="item" :id="id" />
    </div>
</template>

<script>
import { showAvatar, ts2str, iconLink } from "@jx3box/jx3box-common/js/utils";
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import GameText from "@jx3box/jx3box-editor/src/GameText.vue";
import { get_item } from "@/service/qqbot-wiki";
import WikiRobotBottom from "./Bottom.vue";

function item_color(quality) {
    const map = {
        0: "rgb(167,167,167)",
        1: "rgb(255,255,255)",
        2: "rgb(0,210,75)",
        3: "rgb(0,126,255)",
        4: "rgb(254,45,254)",
        5: "rgb(255,165,0)",
    };
    return map[quality] || "rgb(255,255,255)";
}

export default {
    name: "QQBotWikiItemSingle",
    components: {
        Article,
        GameText,
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
            source: {},
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
        show_equip_usage() {
            if (Number(this.source?.AucGenre) === 1 && this.source.Quality > 4) return false;
            if ([1, 2, 3].includes(Number(this.source?.AucGenre))) return true;
            if (this.source?.AucGenre == 4 && this.source?.AucSubType < 4) return true;
            return false;
        },
        common_attributes() {
            return this.source?.attributes?.filter((item) => item.color != "orange") || [];
        },
        white_attributes() {
            return this.common_attributes.filter((item) => item.color === "white") || [];
        },
        green_attributes() {
            return this.common_attributes.filter((item) => item.color === "green") || [];
        },
        orange_std_attribute() {
            return this.source?.attributes?.filter((item) => item.color == "orange" && !item.is_mobile) || [];
        },
        orange_wujie_attribute() {
            return this.source?.attributes?.filter((item) => item.color == "orange" && item.is_mobile) || [];
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
        item_color,
        iconLink,
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
        async loadData() {
            this.setNotReady();
            this.loading = true;
            try {
                const [itemRes, mixRes] = await Promise.all([
                    get_item(this.id, this.client),
                    wiki.mix({ type: "item", id: this.id, client: this.client }),
                ]);
                this.source = itemRes?.data?.data?.item || itemRes?.data || {};
                this.wiki_post = {
                    post: mixRes?.post || null,
                    source: mixRes?.source || null,
                    users: mixRes?.users || [],
                };
                if (this.source?.Name) {
                    document.title = this.source.Name + (this.$t ? this.$t("pages.common.appendTitle") : "");
                }
            } catch (e) {
                this.source = {};
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
.m-qqbot-wiki-item {
    color: rgba(255, 255, 255, 0.75);

    .m-item-detail {
        width: 100%;
        border-radius: 8px;
        background: linear-gradient(to top, #383838 0%, #000000 100%);
        border: 1px solid #6e6e6e;
        box-shadow: inset 0px 10px 5px #000000;
        padding: 12px;
        box-sizing: border-box;
        color: #fff;

        .m-item-header {
            .flex;
            justify-content: space-between;
            align-items: center;
            .gap(8px);

            .u-item-icon {
                .size(48px);
                border-radius: 4px;
                border: 2px solid #808080;
                flex: none;
            }

            .m-item-header__left {
                flex: 1;
            }

            .u-top {
                .flex;
                align-items: center;
                .gap(6px);
                flex-wrap: wrap;

                .u-name {
                    font-size: 16px;
                    .bold;
                }

                .u-id {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .u-star {
                    .size(12px);
                }
            }

            .u-bottom {
                margin-top: 6px;
                .flex;
                align-items: center;
                .gap(8px);
                flex-wrap: wrap;
                font-size: 12px;

                .u-usage {
                    .flex;
                    align-items: center;
                    .gap(4px);

                    .u-label-icon {
                        .size(14px);
                    }
                }

                .u-weapon-type-label {
                    color: #ffc300;
                }

                .u-type-label {
                    color: rgba(255, 255, 255, 0.75);
                }

                .u-from {
                    color: rgba(255, 255, 255, 0.5);
                }
            }

            .u-item-img__right {
                .size(56px, auto);
            }
        }

    }

    .m-item-content {
        margin-top: 10px;
        width: 100%;
        border-radius: 8px;
        background: linear-gradient(to top, #383838 0%, #000000 100%);
        border: 1px solid #6e6e6e;
        box-shadow: inset 0px 10px 5px #000000;
        padding: 12px;
        box-sizing: border-box;
        color: #fff;
        font-size: 12px;
        line-height: 18px;

            .u-line {
                .flex;
                .gap(10px);
                flex-wrap: wrap;
                margin-bottom: 4px;
            }

            .u-yellow,
            .u-orange {
                color: #ffc300;
            }

            .u-gray {
                color: rgba(255, 255, 255, 0.5);
            }

            .m-attributes {
                margin-top: 6px;

                .u-attributes {
                    .flex;
                    flex-direction: column;
                    .gap(2px);
                }

                .u-white {
                    color: #ffffff;
                }

                .u-green {
                    color: #1eff00;
                }
            }

            .m-spec-wrapper {
                margin-top: 6px;

                .m-client-spec {
                    margin-top: 6px;

                    .u-spec-attribute-title {
                        font-weight: 700;

                        .u-client {
                            color: #fff;
                        }
                    }

                    .u-spec-attribute {
                        margin-top: 2px;
                        color: #ffc300;
                    }
                }
            }

            .u-set {
                margin-top: 8px;

                .u-set-title {
                    .bold;
                }

                .u-set-siblings,
                .u-set-attributes {
                    margin: 4px 0 0;
                    padding-left: 14px;

                    li {
                        margin: 2px 0;
                    }
                }
            }

        .u-desc {
            font-style: italic;
            color: rgba(255, 255, 255, 0.75);
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
