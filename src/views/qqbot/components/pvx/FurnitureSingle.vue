<template>
    <div class="m-qqbot-pvx-furniture" v-loading="loading">
        <div v-if="furniture && Object.keys(furniture).length">
            <div class="m-pvx__item m-pvx-furniture__header">
                <div class="m-title">
                    <div class="u-title" :class="'quality_' + furniture.Quality">
                        家具 · {{ furniture.szName || id }}
                    </div>
                    <div class="m-meta">
                        <span class="u-meta" v-if="furniture.LevelLimit">Lv.{{ furniture.LevelLimit }}</span>
                        <span class="u-meta" v-if="furnitureType">{{ furnitureType }}</span>
                        <span class="u-meta" v-if="furniture.szSource">{{ furniture.szSource }}</span>
                    </div>
                </div>
                <div class="u-cover">
                    <img class="u-item-img__right" src="@/assets/img/qqbot/jx3box_qqbot_furniture.svg" alt="" />
                </div>
            </div>

            <div class="m-pvx-furniture__body">
                <div class="m-pvx__item m-pvx-furniture__attrs">
                    <div class="u-title">家具属性</div>
                    <div class="u-attrs" v-if="furnitureAttrs.length">
                        <span class="u-attr" v-for="item in furnitureAttrs" :key="item.key">
                            <span class="u-label" :class="item.className">{{ item.label }}</span>
                            {{ item.value }}
                        </span>
                    </div>
                    <div class="u-empty" v-else>暂无属性</div>
                </div>

                <div class="m-pvx__item m-pvx-furniture__info">
                    <div class="u-title">摆放信息</div>
                    <div class="u-list">
                        <div class="u-item" v-if="furniture.MaxAmountPerLand">
                            摆放上限：{{ furniture.MaxAmountPerLand }}
                            <span v-if="furniture.bInteract" class="u-interact">可交互家具</span>
                        </div>
                        <div class="u-item" v-if="furniture.szScaleRange">
                            缩放大小：
                            <span class="u-scale">
                                <b v-for="(item, index) in scaleRange(furniture.szScaleRange)" :key="index">
                                    {{ item }}
                                </b>
                            </span>
                        </div>
                        <div class="u-item" v-if="colorList.length">
                            染色选项：
                            <span class="u-dyes">
                                <i
                                    v-for="item in colorList"
                                    :key="item"
                                    class="u-dye"
                                    :style="{ backgroundColor: `rgb(${item})` }"
                                ></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="m-pvx__item m-pvx-furniture__set" v-if="setData">
                <div class="u-title">套组 · {{ setData.szName }}</div>
                <div class="u-desc" v-if="furniture.szTip" v-html="descriptionFilter(furniture.szTip)"></div>
                <div class="u-set-list" v-if="setFurnitures.length">
                    <div
                        class="u-set-item"
                        :class="{ 'is-current': String(item.dwID) === String(id) }"
                        v-for="item in setFurnitures"
                        :key="item.ID || item.dwID"
                    >
                        <div class="u-set-img">
                            <img
                                v-if="getFurnitureImg(item)"
                                :src="getFurnitureImg(item)"
                                :alt="item.szName"
                                @error="replaceByIcon($event, item)"
                            />
                        </div>
                        <div class="u-set-name">{{ item.szName }}</div>
                        <div class="u-set-type">{{ getType(item) }}</div>
                    </div>
                </div>
            </div>
            <div class="m-pvx__item m-pvx-furniture__set" v-else-if="furniture.szTip">
                <div class="u-title">家具说明</div>
                <div class="u-desc" v-html="descriptionFilter(furniture.szTip)"></div>
            </div>

            <div class="m-pvx-furniture__wiki">
                <div class="m-title">
                    <div class="u-title">家具攻略</div>
                    <span>（以魔盒在线版本为准）</span>
                </div>
                <div class="w-pvx-user">
                    <div class="m-wiki-post-panel is-robot" v-if="wikiPost && wikiPost.post">
                        <WikiPanel :wiki-post="wikiPost" :showQR="false">
                            <template #body>
                                <Article id="pvxFurnitureWiki" :content="wikiPost.post.content" />
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
        <div v-else class="m-wiki-post-empty is-robot-empty">未找到对应家具数据</div>
    </div>
</template>

<script>
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import { iconLink, ts2str } from "@jx3box/jx3box-common/js/utils";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import WikiPanel from "@jx3box/jx3box-ui/src/wiki/WikiPanel";
import { __imgPath } from "@/utils/config";
import { markQQBotReady, resetQQBotReady, setQQBotDataReady } from "@/utils/qqbot-ready";
import { getFurnitureCategory, getFurnitureColor, getFurnitureDetail, getFurnitureSet } from "@/service/qqbot-pvx";

export default {
    name: "QQBotPvxFurnitureSingle",
    components: {
        Article,
        WikiPanel,
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
            furniture: null,
            setData: null,
            colorData: null,
            category: {},
            wikiPost: null,
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
        representId() {
            return this.furniture?.nRepresentID || "";
        },
        setId() {
            return this.furniture?.SetID || "";
        },
        itemId() {
            return this.furniture?.__manufactureID ? `10_${this.furniture.__manufactureID}` : "";
        },
        achievementId() {
            return this.setData?.dwAchievementID || "";
        },
        wikiSourceType() {
            if (this.itemId) return "item";
            if (this.achievementId) return "achievement";
            return "";
        },
        wikiSourceId() {
            if (this.itemId) return this.itemId;
            if (this.achievementId) return this.achievementId;
            return "";
        },
        wikiUpdatedAt() {
            const updated = this.wikiPost?.post?.updated;
            if (!updated) return "-";
            return String(ts2str(updated)).split(" ")[0];
        },
        furnitureType() {
            if (!this.furniture || !Object.keys(this.category).length) return "";
            return this.getType(this.furniture);
        },
        furnitureAttrs() {
            return [
                // { key: "view", label: "观赏", value: this.furniture?.Attribute1, className: "blue" },
                // { key: "practical", label: "实用", value: this.furniture?.Attribute2, className: "pink" },
                // { key: "strong", label: "坚固", value: this.furniture?.Attribute3, className: "yellow" },
                // { key: "fengshui", label: "风水", value: this.furniture?.Attribute4, className: "green" },
                // { key: "interest", label: "趣味", value: this.furniture?.Attribute5, className: "purple" },
                { key: "record", label: "装修评分", value: this.furniture?.Record, className: "green" },
            ].filter((item) => item.value !== undefined && item.value !== null && item.value !== "");
        },
        colorList() {
            const list = [];
            if (!this.colorData) return list;
            for (const key in this.colorData) {
                if (key.startsWith("szDetailIndex") && this.colorData[key]) {
                    list.push(this.colorData[key].replace(/;/g, ","));
                }
            }
            return list;
        },
        setFurnitures() {
            return this.setData?.furnitures || [];
        },
    },
    watch: {
        id: {
            immediate: true,
            handler(id) {
                if (!id) return;
                this.fetchFurniture(id);
            },
        },
    },
    created() {
        this.fetchCategory();
    },
    methods: {
        setNotReady() {
            this.imagesLoaded = false;
            resetQQBotReady();
        },
        setReady() {
            if (this.imagesLoaded) return;
            this.imagesLoaded = true;
            markQQBotReady({ root: this.$el });
        },
        async fetchCategory() {
            try {
                const res = await getFurnitureCategory();
                this.category = res?.data || {};
            } catch (e) {
                this.category = {};
            }
        },
        async fetchFurniture(id) {
            this.setNotReady();
            this.loading = true;
            this.furniture = null;
            this.setData = null;
            this.colorData = null;
            this.wikiPost = null;
            try {
                const res = await getFurnitureDetail(id);
                this.furniture = res?.data || {};
                document.title = `${this.furniture.szName || "家具"} ${this.$t("pages.common.appendTitle")}`;

                const tasks = [];
                if (this.representId) tasks.push(this.fetchColor(this.representId));
                if (this.setId) tasks.push(this.fetchSet(this.setId));
                await Promise.all(tasks);
                await this.loadStrategy();
            } catch (e) {
                this.furniture = null;
                this.$message?.error?.("加载家具详情失败");
            } finally {
                this.loading = false;
                setQQBotDataReady(true);
                this.preloadImages();
            }
        },
        async fetchColor(id) {
            try {
                const res = await getFurnitureColor(id);
                this.colorData = res?.data || null;
            } catch (e) {
                this.colorData = null;
            }
        },
        async fetchSet(id) {
            try {
                const res = await getFurnitureSet(id);
                this.setData = res?.data || null;
            } catch (e) {
                this.setData = null;
            }
        },
        async loadStrategy() {
            this.wikiPost = null;
            if (!this.wikiSourceType || !this.wikiSourceId) return;
            try {
                const res = await wiki.mix({
                    type: this.wikiSourceType,
                    id: this.wikiSourceId,
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
        descriptionFilter(value) {
            let content = value || "";
            const matches = /text="(.*?)(\\\\\\n)?"/.exec(content);
            if (matches && matches.length > 1) content = matches[1].trim();
            return content.replace(/\\n/g, "<br>");
        },
        formatFurnitureImg(link) {
            if (!link) return "";
            const img = String(link)
                .toLowerCase()
                .match(/.*[\/,\\]homeland(.*?).tga/);
            const name = img?.[1]?.replace(/\\/g, "/");
            if (!name) return "";
            if (img?.[1] === "default") return `${__imgPath}homeland/${this.client}/default/default.png`;
            return `${__imgPath}homeland/${this.client}${name}.png`;
        },
        getFurnitureImg(data) {
            return this.formatFurnitureImg(data?.Path) || iconLink(data?.nRepresentID, this.client);
        },
        replaceByIcon(e, data) {
            const fallback = iconLink(data?.nRepresentID, this.client);
            if (fallback && e.target.src !== fallback) {
                e.target.src = fallback;
                return;
            }
            e.target.style.display = "none";
        },
        getType(data) {
            const category1 = data?.nCatag1Index;
            const category2 = data?.nCatag2Index;
            const name1 = this.category?.[category1]?.name || "";
            const list = this.category?.[category1]?.children || [];
            const name2 = list.find((item) => Number(item.nCatag2Index) === Number(category2))?.szName || "";
            return [name1, name2].filter(Boolean).join("-");
        },
        scaleRange(str) {
            return String(str || "")
                .split(";")
                .filter(Boolean);
        },
        preloadImages() {
            this.$nextTick(() => {
                const images = Array.from(this.$el?.querySelectorAll("img") || []);
                if (!images.length) {
                    this.setReady();
                    return;
                }

                Promise.all(
                    images.map((img) => {
                        if (img.complete) return Promise.resolve();
                        return new Promise((resolve) => {
                            img.onload = img.onerror = resolve;
                        });
                    })
                ).then(() => this.setReady());
                setTimeout(() => this.setReady(), 5000);
            });
        },
    },
};
</script>

<style lang="less">
.m-qqbot-pvx-furniture {
    .m-pvx-furniture__header {
        .flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        min-height: 72px;

        .m-title {
            min-width: 0;
            flex: 1;
        }

        .u-title {
            .bold;
            font-size: 22px;
            line-height: 1.35;
            color: #fff;
            word-break: break-all;

            &.quality_2 {
                color: #00d24b;
            }

            &.quality_3 {
                color: #007eff;
            }

            &.quality_4 {
                color: #ff2dff;
            }

            &.quality_5 {
                color: #ffa500;
            }
        }

        .m-meta {
            .flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 10px;
        }

        .u-meta {
            .dbi;
            border: 1px solid rgba(255, 255, 255, 0.16);
            background: rgba(255, 255, 255, 0.06);
            border-radius: 4px;
            padding: 3px 6px;
            color: rgba(255, 255, 255, 0.72);
            font-size: 11px;
            line-height: 16px;
        }

        .u-cover {
            .size(64px);
            .flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;

            .u-item-img__right {
                display: block;
                .size(56px, auto);
            }
        }
    }

    .m-pvx-furniture__body {
        .flex;
        gap: 10px;
        margin-top: 10px;

        .m-pvx__item {
            flex: 1;
            min-width: 0;
        }
    }

    .m-pvx-furniture__attrs,
    .m-pvx-furniture__info,
    .m-pvx-furniture__set {
        .u-title {
            .bold;
            margin-bottom: 8px;
            color: #fff;
            font-size: 14px;
            line-height: 20px;
        }
    }

    .m-pvx-furniture__attrs {
        .u-attrs {
            .flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .u-attr {
            .dbi;
            min-width: 64px;
            color: rgba(255, 255, 255, 0.78);
            font-size: 12px;
            line-height: 20px;
        }

        .u-label {
            .dbi;
            .r(3px);
            min-width: 30px;
            margin-right: 5px;
            padding: 1px 4px;
            color: #fff;
            font-size: 11px;
            line-height: 18px;
            text-align: center;
        }

        .blue {
            background: #4f8cab;
        }

        .pink {
            background: #b85a78;
        }

        .yellow {
            background: #a98250;
        }

        .green {
            background: #4a9a82;
        }

        .purple {
            background: #8d5aaa;
        }
    }

    .m-pvx-furniture__info {
        .u-list {
            .flex;
            flex-wrap: wrap;
            gap: 8px 14px;
            align-items: center;
        }

        .u-item {
            flex: 0 1 auto;
            min-width: calc(50% - 7px);
            color: rgba(255, 255, 255, 0.78);
            font-size: 12px;
            line-height: 20px;
            white-space: nowrap;
        }

        .u-interact {
            margin-left: 10px;
        }

        .u-scale {
            b::after {
                content: "~";
            }

            b:last-child::after {
                content: "";
            }
        }

        .u-dyes {
            .dbi;
            vertical-align: -3px;
        }

        .u-dye {
            .dbi;
            .size(14px);
            .r(50%);
            margin-right: 5px;
            border: 1px solid rgba(255, 255, 255, 0.7);
        }
    }

    .m-pvx-furniture__set {
        margin-top: 10px;

        .u-desc {
            color: rgba(255, 255, 255, 0.78);
            font-size: 12px;
            line-height: 1.7;
        }

        .u-set-list {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 8px;
            margin-top: 10px;
        }

        .u-set-item {
            .r(6px);
            padding: 8px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(255, 255, 255, 0.04);
            box-sizing: border-box;

            &.is-current {
                border-color: rgba(255, 168, 0, 0.7);
                background: rgba(255, 168, 0, 0.12);
            }
        }

        .u-set-img {
            .size(56px);
            .flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 6px;

            img {
                .r(4px);
                max-width: 50px;
                max-height: 50px;
                border: 2px solid rgba(255, 255, 255, 0.16);
                display: block;
                box-sizing: border-box;
            }
        }

        .u-set-name {
            .nobreak;
            color: rgba(255, 255, 255, 0.86);
            font-size: 11px;
            line-height: 16px;
            text-align: center;
        }

        .u-set-type {
            .nobreak;
            margin-top: 2px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 10px;
            line-height: 14px;
            text-align: center;
        }
    }

    .m-pvx-furniture__wiki {
        margin-top: 10px;

        > .m-title {
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

        > .m-title .u-title {
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

    .u-empty {
        color: rgba(255, 255, 255, 0.48);
        font-size: 12px;
        line-height: 20px;
    }
}
@import "~@/assets/css/qqbot/wiki_panel.less";
</style>
