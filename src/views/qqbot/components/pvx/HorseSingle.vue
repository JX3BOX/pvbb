<template>
    <div class="m-qqbot-pvx-horse" v-loading="loading">
        <div v-if="item && Object.keys(item).length">
            <div class="m-pvx__item m-robot__horse-header">
                <div class="m-title">
                    <div class="u-title" :class="`u-title__level-${item.Quality}`">{{ robotTitle }}</div>
                    <div class="m-meta">
                        <div class="u-meta">{{ displayType }}</div>
                        <div class="u-meta">品质: {{ item.Level }}</div>
                    </div>
                </div>
                <div class="u-right">
                    <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_horse.svg" alt="" />
                </div>
            </div>

            <div class="m-robot__horse-info">
                <div class="m-left">
                    <div class="m-left-card">
                        <div class="img-wrap">
                            <img class="u-image" :src="horseImage" alt="" />
                        </div>
                        <div class="m-pvx__item m-id">
                            <div class="u-id">ID: {{ item.ID }}</div>
                            <div v-if="type !== '2'" class="u-meta">跑速: {{ speedName }}</div>
                            <div v-if="type !== '2'" class="u-meta">饲料: {{ feedName }}</div>
                        </div>
                    </div>
                </div>
                <div class="m-right">
                    <div class="m-pvx__item m-attr m-basic-attr">
                        <div class="u-title">基础属性</div>
                        <div v-if="basicAttrs.length" class="u-list">
                            <div class="u-attr" v-for="attr in basicAttrs" :key="attr.id + attr.level">
                                <img class="u-attr-icon" :src="attr.iconUrl" :alt="attr.name" />
                                <div class="u-attr-info">
                                    <div class="u-attr-name">{{ attr.name || "-" }}</div>
                                    <div class="u-attr-desc">{{ attr.desc }}</div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-data">无</div>
                    </div>
                    <div class="m-pvx__item m-attr m-special-attr">
                        <div class="u-title">特殊属性</div>
                        <div v-if="magicAttrs.length" class="u-list">
                            <div class="u-attr" v-for="attr in magicAttrs" :key="attr.id + attr.level">
                                <img class="u-attr-icon" :src="attr.iconUrl" :alt="attr.name" />
                                <div class="u-attr-info">
                                    <div class="u-attr-name">{{ attr.name || "-" }}</div>
                                    <div class="u-attr-desc">{{ attr.desc }}</div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-data">无</div>
                    </div>
                </div>
            </div>

            <div v-if="originDatas.length" class="m-catch-container">
                <div class="u-title">捕获地图</div>
                <div class="m-catch-map">
                    <HorseMap :name="item.Name || ''" :list="originDatas"></HorseMap>
                </div>
            </div>

            <div class="m-horse-strategy">
                <div v-if="wikiPost && wikiPost.post" class="m-title">
                    <div class="u-title">坐骑攻略</div>
                    <span>（以魔盒在线版本为准）</span>
                </div>
                <div class="w-pvx-user">
                    <div class="m-wiki-post-panel is-robot" v-if="wikiPost && wikiPost.post">
                        <WikiPanel :wiki-post="wikiPost" :showQR="false">
                            <template #body>
                                <Article id="pvxHorseWiki" :content="wikiPost.post.content" />
                                <div class="m-wiki-signature">
                                    <i class="el-icon-edit"></i>
                                    本次修订由 <b>{{ wikiPost.post.user_nickname || "-" }}</b> 提交于{{ wikiUpdatedAt }}
                                </div>
                            </template>
                        </WikiPanel>
                    </div>
                    <div class="m-wiki-post-empty is-robot-empty" v-else>暂无相关攻略，欢迎热心侠士前往补充！</div>
                </div>
            </div>
        </div>
        <div v-else class="m-wiki-post-empty is-robot-empty">未找到对应坐骑数据</div>
    </div>
</template>

<script>
import { __imgPath, __cdn } from "@/utils/config";
import { iconLink, ts2str } from "@jx3box/jx3box-common/js/utils";
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import WikiPanel from "@jx3box/jx3box-ui/src/wiki/WikiPanel";
import horseMapList from "@/assets/data/qqbot/pvx/horse_map.json";
import horseSites from "@/assets/data/qqbot/pvx/horse_sites.json";
import { getHorse } from "@/service/qqbot-pvx";
import HorseMap from "./HorseMap.vue";

export default {
    name: "QQBotPvxHorseSingle",
    components: {
        HorseMap,
        WikiPanel,
        Article,
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
            item: null,
            wikiPost: null,
        };
    },
    computed: {
        id() {
            return this.sourceId || this.$route.query.id || "";
        },
        type() {
            return this.$route.query.type || "";
        },
        client() {
            return this.$store.state.client;
        },
        wikiUpdatedAt() {
            const updated = this.wikiPost?.post?.updated;
            if (!updated) return "-";
            return String(ts2str(updated)).split(" ")[0];
        },
        originDatas() {
            const name = this.item?.Name;
            if (!name) return [];
            const mapList = horseMapList.find((v) => name.indexOf(v.name) > -1)?.mapList || [];
            return mapList
                .map((mapId) => ({
                    mapId,
                    mapName: horseSites?.[mapId]?.mapName || `地图${mapId}`,
                    coordinates: horseSites?.[mapId]?.coordinates || [],
                }))
                .filter((v) => v.mapId);
        },
        basicAttrs() {
            const attrs = this.item?.MagicAttributes || [];
            return attrs
                .filter((v) => !v.level || v.level === "0")
                .map((v) => ({
                    ...v,
                    iconUrl: iconLink(v.icon),
                }));
        },
        magicAttrs() {
            const attrs = this.item?.MagicAttributes || [];
            return attrs
                .filter((v) => v.icon && v.level !== "0")
                .map((v) => ({
                    ...v,
                    iconUrl: iconLink(v.icon),
                }));
        },
        typeName() {
            if (!this.item) return "";
            if (this.item.SubType === 15) {
                return this.item.DetailType === 0 ? "普通坐骑" : "奇趣坐骑";
            }
            if (this.item.SubType === 23) {
                const map = {
                    0: "头饰",
                    1: "鞍饰",
                    2: "足饰",
                    3: "马饰",
                };
                return map[this.item.DetailType] || "马具";
            }
            return "";
        },
        modeName() {
            if (this.item?.SubType !== 15) return "";
            const attr = (this.item.MagicAttributes || []).find((v) => v.id === "15650");
            return attr?.name || "单骑";
        },
        feedName() {
            const feedTip = this.item?.Feed?.FeedTip || "";
            const start = feedTip.indexOf("【");
            const end = feedTip.indexOf("】");
            if (start === -1 || end === -1) return "";
            return feedTip.slice(start + 1, end);
        },
        speedName() {
            const desc = this.item?.MoveSpeedDesc || "";
            return desc.split("移动速度提高")[1] || "";
        },
        displayType() {
            let text = this.typeName;
            if (this.type !== "2" && text) {
                text += ` · ${this.modeName}`;
                if (this.item?.GetType) text += ` · ${this.item.GetType}`;
            }
            return text;
        },
        robotTitle() {
            const prefix = this.item?.SubType === 15 ? "坐骑" : "马具";
            return `${prefix} · ${this.item?.Name || ""}`;
        },
        horseImage() {
            if (!this.item) return "";
            if (this.item.SubType === 15) return `${__cdn}design/horse/std/${this.item.ID}.png`;
            const path = this.item.ImgPath;
            if (path) {
                const img = path.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/);
                const name = img?.[1]?.replace(/\\/g, "/");
                if (name) return `${__imgPath}homeland/homeland/${this.client}${name}.png`;
            }
            return `${__imgPath}horse/${this.client}/${this.item.ID}.png`;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler(id) {
                if (!id) return;
                this.fetchHorse(id);
            },
        },
    },
    methods: {
        setNotReady() {
            window.__READY__ = false;
        },
        setReady() {
            window.__READY__ = true;
        },
        async loadStrategy() {
            this.wikiPost = null;
            if (!this.id) return;
            try {
                const res = await wiki.mix({
                    type: "item",
                    id: this.id,
                    client: this.client,
                });
                this.wikiPost = {
                    post: res?.post || null,
                    source: res?.source || {},
                    users: res?.users || [],
                };
            } catch (e) {
                this.wikiPost = null;
            }
        },
        async fetchHorse(id) {
            this.setNotReady();
            this.loading = true;
            try {
                const res = await getHorse(id, this.client, this.type === "2" ? 2 : "");
                this.item = res?.data || {};
                await this.loadStrategy();
            } catch (e) {
                this.item = null;
                this.wikiPost = null;
                this.$message?.error?.("加载坐骑详情失败");
            } finally {
                this.loading = false;
                this.setReady();
            }
        },
    },
};
</script>

<style lang="less">
.m-qqbot-pvx-horse {
    .m-robot__horse-header {
        .flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 75px;

        .u-title {
            font-size: 20px;
            .bold;
            color: #fff;
            .flex;
            align-items: center;
            gap: 5px;

            &.u-title__level-2 {
                color: rgba(13, 192, 63, 1);
            }
            &.u-title__level-3 {
                color: rgba(0, 133, 255, 1);
            }
            &.u-title__level-4 {
                color: rgba(204, 70, 237, 1);
            }
            &.u-title__level-5 {
                color: rgba(255, 168, 17, 1);
            }
        }

        .m-meta {
            margin-top: 4px;
            .flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 4px;

            .u-meta {
                .r(4px);
                background: rgba(89, 89, 89, 1);
                padding: 0 4px;
                font-size: 10px;
                color: #fff;
                height: 15px;
                line-height: 15px;
                box-sizing: border-box;
            }
        }
    }

    .m-robot__horse-info {
        .flex;
        justify-content: space-between;
        gap: 10px;
        margin-top: 12px;

        .m-left {
            width: 190px;
        }

        .m-left-card {
            .r(8px);
            padding: 8px;
            box-sizing: border-box;
            background: linear-gradient(to top, rgba(56, 56, 56, 1) 0%, rgba(0, 0, 0, 1) 100%);
            border: 1px solid rgba(110, 110, 110, 1);

            .img-wrap {
                .size(100%, 190px);
                .r(4px);
                overflow: hidden;
                box-sizing: border-box;
                background: url("~@/assets/img/horse/horse_item_bg_sm.jpg") no-repeat center center;
                background-size: cover;

                .u-image {
                    .size(100%);
                    object-fit: contain;
                }
            }

            .m-id {
                margin-top: 8px;
                min-height: 84px;
            }
        }

        .m-id .u-id {
            color: rgba(255, 168, 17, 1);
        }

        .m-right {
            flex: 1;
            display: grid;
            gap: 10px;
            grid-template-columns: repeat(2, 1fr);

            .m-attr {
                min-width: 175px;

                .u-title {
                    font-size: 12px;
                }

                &.m-basic-attr .u-title {
                    color: rgba(255, 168, 17, 1);
                }

                &.m-special-attr .u-title {
                    color: rgba(204, 70, 237, 1);
                }

                .u-attr {
                    .flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: 4px;
                    width: 100%;
                }

                .u-attr-icon {
                    .size(24px);
                }

                .u-attr-name {
                    color: #fff;
                }

                .u-attr-desc {
                    color: rgba(255, 255, 255, 0.5);
                    .dbi;
                    width: 135px;
                    .nobreak;
                }
            }
        }
    }

    .m-catch-container {
        margin-top: 10px;

        .u-title {
            font-size: 14px;
            color: #fff;
            .bold;
            margin-bottom: 6px;
        }
    }

    .m-catch-map {
        .r(8px);
        overflow: hidden;
        border: 1px solid rgba(110, 110, 110, 1);
        background: transparent;

        padding-bottom: 8px;
    }

    .m-horse-strategy {
        margin-top: 10px;

        .m-title {
            .flex;
            align-items: center;
            gap: 4px;
            color: rgba(#fff, 0.6);
            margin-bottom: 10px;

            > span {
                font-size: 12px;
                color: rgba(#fff, 0.55);
                line-height: 1;
            }
        }

        .u-title {
            color: #fff;
            .bold;
            font-size: 16px;
        }

        .w-pvx-user {
            .m-wiki-post-panel.is-robot {
                .m-panel-head {
                    .none;
                }

                .c-wiki-panel {
                    margin: 0 !important;
                    border-radius: 8px;
                    overflow: hidden;
                }
            }
        }

        .m-wiki-signature {
            text-align: right;
            color: #999;
            font-size: 12px;
            line-height: 2;
            border-top: 1px dashed #ddd;
            margin-top: 8px;
            padding-top: 5px;
        }

        .m-wiki-post-empty.is-robot-empty {
            width: 100%;
            min-height: 50px;
            .flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
    }
}
</style>
