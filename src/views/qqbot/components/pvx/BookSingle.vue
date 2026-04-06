<template>
    <div class="m-qqbot-pvx-book" v-loading="loading">
        <div v-if="book && Object.keys(book).length">
            <div class="m-pvx__item m-robot__book-header">
                <div class="m-title">
                    <div class="u-title">书籍 · {{ book.Name || "" }}</div>
                    <div class="m-meta">
                        <div class="u-meta u-class" :class="`u-class-${book.ExtendProfessionID1}`">
                            {{ bookTypeMap[book.ExtendProfessionID1] || "" }}
                        </div>
                        <div class="book-desc" v-html="book.Desc"></div>
                    </div>
                </div>
                <div class="u-right">
                    <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_book.svg" alt="" />
                </div>
            </div>

            <div class="m-robot__book-info">
                <div class="m-pvx__item m-book-info">
                    <div class="u-title">书籍信息</div>
                    <div class="m-list">
                        <div class="u-info-item">
                            来源：<span :class="getOrigin(book) !== '其它' && 'book-special'">{{ getOrigin(book) }}</span>
                        </div>
                        <div class="u-info-item">
                            所属套书：{{ "【" + getProfessionType(book.ExtendProfessionID1) + "】" + book.BookName }}
                        </div>
                        <div class="u-info-item">阅读等级：{{ book.RequireLevel }}</div>
                    </div>
                </div>

                <div class="m-pvx__item m-book-write">
                    <div class="u-title">抄录要求</div>
                    <div class="m-list">
                        <div class="u-info-item">
                            <span>角色等级：</span>
                            <span>{{ book.copy?.RequirePlayerLevel || "-" }}</span>
                        </div>
                        <div class="u-info-item">
                            <span>阅读等级：</span>
                            <span>{{ book.copy?.RequireLevel || "-" }}</span>
                        </div>
                        <div class="u-info-item">
                            <span>{{ getProfessionType(book.ExtendProfessionID1) }}等级：</span>
                            <span>{{ book.copy?.RequireLevelExt || "-" }}</span>
                        </div>
                        <div class="u-info-item">
                            <span>精力消耗：</span>
                            <span>{{ book.copy?.CostVigor || "-" }}</span>
                        </div>
                    </div>
                    <div v-if="book.copyList?.length" class="u-info-item m-materials">
                        <span>所需材料：</span>
                        <div class="u-material" v-for="material in book.copyList" :key="material.item_id">
                            <span class="u-item-name" :class="`u-item-name__q${materialQuality(material.item_id)}`">
                                {{ materialName(material.item_id) }}
                            </span>
                            <span class="u-num" v-if="Number(material.count || 0) > 1">x {{ material.count }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="m-robot__book-pack">
                <div class="u-title">同套书籍 · {{ book.BookName }}</div>
                <div class="m-pvx__item m-book-pack">
                    <div
                        class="u-item"
                        :class="{ 'is-active': item.idKey === idKey }"
                        v-for="(item, index) in bookList"
                        :key="item.idKey + '-' + index"
                    >
                        {{ item.SegmentName }}
                    </div>
                </div>
            </div>

            <div class="m-robot__book-content">
                <div class="m-pvx-book-content">
                    <div class="u-content" v-for="(item, i) in contentList" :key="i">
                        <div class="u-title" v-if="!i">《{{ book.Name }}》</div>
                        <div v-html="item"></div>
                    </div>
                </div>
            </div>

            <div class="m-robot__book-strategy">
                <div class="m-title">
                    <div class="u-title">书籍攻略</div>
                    <span>（以魔盒在线版本为准）</span>
                </div>
                <div class="w-pvx-user">
                    <div class="m-wiki-post-panel is-robot" v-if="wikiPost && wikiPost.post">
                        <WikiPanel :wiki-post="wikiPost" :showQR="false">
                            <template #body>
                                <Article id="pvxBookWiki" :content="wikiPost.post.content" />
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
        <div v-else class="m-wiki-post-empty is-robot-empty">未找到对应书籍数据</div>
    </div>
</template>

<script>
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import { ts2str } from "@jx3box/jx3box-common/js/utils";
import { get_item } from "@jx3box/jx3box-editor/src/service/item";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import WikiPanel from "@jx3box/jx3box-ui/src/wiki/WikiPanel";
import professionMap from "@/assets/data/qqbot/pvx/book_profession.json";
import { getBook, getBookList } from "@/service/qqbot-pvx";

export default {
    name: "QQBotPvxBookSingle",
    components: {
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
            book: null,
            bookList: [],
            materialMetaMap: {},
            wikiPost: null,
            bookTypeMap: {
                11: "杂集",
                10: "道学",
                9: "佛学",
            },
        };
    },
    computed: {
        idKey() {
            return this.sourceId || this.$route.query.id || "";
        },
        client() {
            return this.$store.state.client;
        },
        itemId() {
            return this.book?.ItemID || "";
        },
        contentList() {
            return this.splitText(this.book?.contentInfo || "");
        },
        wikiUpdatedAt() {
            const updated = this.wikiPost?.post?.updated;
            if (!updated) return "-";
            return String(ts2str(updated)).split(" ")[0];
        },
    },
    watch: {
        idKey: {
            immediate: true,
            handler(id) {
                if (!id) return;
                this.fetchBook(id);
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
        getProfessionType(type) {
            return professionMap.find((v) => v.id === Number(type))?.name || "";
        },
        getOrigin(item) {
            const hasShop = !!item?.ShopNames;
            const hasDrops = !!item?.drops?.length;
            const hasQuest = !!item?.Quests;
            const hasStele = !!item?.DoodadTemplateID;
            let origin = "";
            if (hasStele) origin += (origin ? "/" : "") + "碑铭";
            if (hasShop) origin += (origin ? "/" : "") + "商店";
            if (hasDrops) origin += (origin ? "/" : "") + "秘境";
            if (hasQuest) origin += (origin ? "/" : "") + "任务";
            return origin || "其它";
        },
        getMaterialCacheKey(itemId) {
            return `qqbot-book-item-${this.client}-${itemId}`;
        },
        parseItemPayload(res) {
            const payload = res?.data?.data?.item || res?.data?.item || res?.data || {};
            return payload && typeof payload === "object" ? payload : {};
        },
        async fetchMaterialMeta(itemId) {
            const key = String(itemId || "");
            if (!key) return { name: "-", quality: 1 };
            const cacheKey = this.getMaterialCacheKey(key);
            if (typeof sessionStorage !== "undefined") {
                const cache = sessionStorage.getItem(cacheKey);
                if (cache) {
                    try {
                        return JSON.parse(cache);
                    } catch (e) {
                        sessionStorage.removeItem(cacheKey);
                    }
                }
            }
            try {
                const res = await get_item(key, this.client);
                const item = this.parseItemPayload(res);
                const meta = {
                    name: item?.Name || key,
                    quality: Number(item?.Quality) || 1,
                };
                if (typeof sessionStorage !== "undefined") {
                    sessionStorage.setItem(cacheKey, JSON.stringify(meta));
                }
                return meta;
            } catch (e) {
                return { name: key, quality: 1 };
            }
        },
        materialName(itemId) {
            return this.materialMetaMap[String(itemId || "")]?.name || String(itemId || "-");
        },
        materialQuality(itemId) {
            return Number(this.materialMetaMap[String(itemId || "")]?.quality) || 1;
        },
        async loadMaterialMap() {
            const materialIds = (this.book?.copyList || []).map((v) => String(v.item_id || "")).filter(Boolean);
            const ids = Array.from(new Set(materialIds));
            if (!ids.length) {
                this.materialMetaMap = {};
                return;
            }
            const tupleList = await Promise.all(ids.map(async (itemId) => [itemId, await this.fetchMaterialMeta(itemId)]));
            this.materialMetaMap = Object.fromEntries(tupleList);
        },
        getBookOrder(item) {
            const subId = Number(item?.SubID);
            if (Number.isFinite(subId) && subId > 0) return subId;
            const idKey = String(item?.idKey || "");
            const parts = idKey.split("_");
            const sub = Number(parts[1] || "");
            if (Number.isFinite(sub) && sub > 0) return sub;
            const sort = Number(item?.Sort);
            const subSort = Number(item?.SubSort);
            if (Number.isFinite(sort) && Number.isFinite(subSort)) {
                return sort * 1000 + subSort;
            }
            return Number.MAX_SAFE_INTEGER;
        },
        async loadStrategy() {
            this.wikiPost = null;
            if (!this.itemId) return;
            try {
                const res = await wiki.mix({
                    type: "item",
                    id: this.itemId,
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
        splitText(text, ratios = [3.2, 3.4, 3.4]) {
            if (!text) return [];
            const segments = [];
            const totalLength = text.length;
            const totalRatio = ratios.reduce((sum, ratio) => sum + ratio, 0);
            const segmentLengths = ratios.map((ratio) => Math.floor((totalLength * ratio) / totalRatio));

            let start = 0;
            for (let i = 0; i < ratios.length; i++) {
                let end = start + segmentLengths[i];
                if (i === ratios.length - 1) {
                    end = totalLength;
                } else {
                    const searchRange = Math.min(100, totalLength - end);
                    let found = false;
                    for (let j = end; j < end + searchRange; j++) {
                        if (text[j] === "\n" && j + 1 < totalLength && text[j + 1] === "\n") {
                            end = j + 2;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        const punctuation = [".", "。", ";", "；", "!", "！", "?", "？"];
                        for (let j = end; j < end + searchRange; j++) {
                            if (
                                punctuation.includes(text[j]) &&
                                (j + 1 >= totalLength || ["\n", " "].includes(text[j + 1]))
                            ) {
                                end = j + 1;
                                break;
                            }
                        }
                    }
                }
                segments.push(text.substring(start, end));
                start = end;
            }
            return segments;
        },
        parseCopyList(data) {
            const parsed = { ...data };
            parsed.contentInfo = (parsed.contents || []).map((v) => v.content.replace(/\\n/g, "<br>")).join("<br>");
            if (parsed?.copy?.ID) {
                const keys = Object.keys(parsed.copy).filter((key) => key.indexOf("RequireItem") > -1);
                const len = parseInt(keys.length / 3, 10);
                parsed.copyList = [];
                for (let i = 1; i <= len; i++) {
                    if (parsed.copy["RequireItemType" + i]) {
                        parsed.copyList.push({
                            item_id: `${parsed.copy["RequireItemType" + i]}_${parsed.copy["RequireItemIndex" + i]}`,
                            count: parsed.copy["RequireItemCount" + i],
                        });
                    }
                }
            } else {
                parsed.copyList = [];
            }
            return parsed;
        },
        async fetchBookList(keyword) {
            if (!keyword) {
                this.bookList = [];
                return;
            }
            const res = await getBookList(keyword, this.client, 1, 16);
            const list = res?.data?.list || [];
            const sameSetList = list.filter((item) => item?.BookName === keyword);
            const targetList = sameSetList.length ? sameSetList : list;
            this.bookList = [...targetList].sort((a, b) => this.getBookOrder(a) - this.getBookOrder(b));
        },
        async fetchBook(id) {
            this.setNotReady();
            this.loading = true;
            try {
                const res = await getBook(id, this.client);
                this.book = this.parseCopyList(res?.data || {});
                await Promise.all([this.fetchBookList(this.book?.BookName), this.loadMaterialMap(), this.loadStrategy()]);
            } catch (e) {
                this.book = null;
                this.bookList = [];
                this.materialMetaMap = {};
                this.wikiPost = null;
                this.$message?.error?.("加载书籍详情失败");
            } finally {
                this.loading = false;
                this.setReady();
            }
        },
    },
};
</script>

<style lang="less">
.m-qqbot-pvx-book {
    .m-robot__book-header {
        .flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        height: 75px;

        .u-title {
            font-size: 20px;
            .bold;
            color: #fff;
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

                &.u-class-11 {
                    background: rgba(50, 65, 72, 1);
                }
                &.u-class-10 {
                    background: rgba(25, 67, 114, 1);
                }
                &.u-class-9 {
                    background: rgba(148, 125, 46, 1);
                }
            }
        }
    }

    .m-robot__book-info {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-top: 10px;

        .u-title {
            .bold;
            color: rgba(255, 206, 92, 1);
            font-size: 12px;
        }

        .m-list {
            gap: 4px;
            margin-top: 4px;
            color: #fff;
        }

        .m-book-info .m-list {
            .flex;
            flex-direction: column;
        }

        .m-book-write {
            .m-list {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
            }

            .u-info-item,
            .u-material {
                .flex;
                align-items: center;
                flex-wrap: wrap;
                font-size: 10px;
                color: #fff;
            }

            .m-materials {
                margin-top: 4px;
            }

            .u-material {
                margin-right: 4px;

                .u-item-name {
                    padding: 1px 4px;
                    border-radius: 3px;
                    background: rgba(255, 255, 255, 0.15);
                    color: rgba(255, 195, 0, 1);
                    line-height: 1.4;

                    &.u-item-name__q2 {
                        color: rgba(79, 255, 138, 1);
                    }
                    &.u-item-name__q3 {
                        color: rgba(94, 199, 255, 1);
                    }
                    &.u-item-name__q4 {
                        color: rgba(185, 156, 255, 1);
                    }
                    &.u-item-name__q5 {
                        color: rgba(255, 195, 0, 1);
                    }
                }
            }

            .u-num {
                margin-left: 4px;
            }
        }
    }

    .m-robot__book-pack {
        margin-top: 10px;

        .u-title {
            .bold;
            color: #fff;
            font-size: 16px;
        }

        .m-book-pack {
            .flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px;
            margin-top: 10px;

            .u-item {
                background: rgba(148, 125, 46, 1);
                .r(4px);
                height: 18px;
                line-height: 18px;
                padding: 0 4px;
                color: #fff;

                &.is-active {
                    background: rgba(30, 30, 30, 1);
                    color: rgba(255, 195, 0, 1);
                    box-shadow: inset 0 0 0 1px rgba(255, 195, 0, 0.45);
                }
            }
        }
    }

    .m-robot__book-content {
        margin-top: 10px;
        width: 100%;
        box-sizing: border-box;
        background: linear-gradient(139.71deg, rgba(255, 245, 222, 1) 0%, rgba(242, 235, 225, 1) 99.31%);
        padding: 12px 0;
        color: rgba(69, 41, 30, 1);

        .u-title {
            font-size: 16px;
            .bold;
            text-align: center;
            margin-bottom: 10px;
        }

        .m-pvx-book-content {
            display: grid;
            align-items: flex-start;
            justify-content: center;
            grid-template-columns: repeat(3, 1fr);
        }

        .u-content {
            padding: 0 12px;
            box-sizing: border-box;
            font-size: 10px;

            &:nth-child(2) {
                border-left: 1px solid rgba(194, 187, 161, 1);
                border-right: 1px solid rgba(194, 187, 161, 1);
            }
        }
    }

    .m-robot__book-strategy {
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
