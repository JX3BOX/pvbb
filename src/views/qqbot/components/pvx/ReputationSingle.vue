<template>
    <div class="m-qqbot-pvx-reputation" v-loading="loading">
        <div v-if="reputation && Object.keys(reputation).length">
            <div class="m-pvx__item m-robot__reputation-header">
                <div class="m-title">
                    <div class="u-title">{{ robotTitle }}</div>
                    <div class="m-meta">
                        <div v-if="reputation.szMapNames?.[0]" class="u-meta">{{ reputation.szMapNames[0] }}</div>
                        <div v-if="reputation.GroupName" class="u-meta">{{ reputation.GroupName }}</div>
                        <div class="u-meta">ID: {{ id }}</div>
                    </div>
                </div>
                <div class="u-right">
                    <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_reputation.svg" alt="" />
                </div>
            </div>

            <div class="m-pvx__item m-robot__reputation-info">
                <div class="u-reputation-logo">
                    <img v-if="getBotIcon(reputation.szIconPath)" :src="getBotIcon(reputation.szIconPath)" alt="" />
                </div>
                <div class="u-intro" v-html="reputation.szDesc"></div>
            </div>

            <div v-if="showPath" class="m-robot__reputation-reward">
                <div class="m-title">
                    <div class="u-title">声望奖励</div>
                    <span class="u-up">{{ getPath(reputation.szName) || "无法使用遗失的尊敬来提高该声望等级进度" }}</span>
                </div>
                <div class="m-pvx__item reward-content">
                    <div class="reward-desc-list">
                        <div class="m-pvx__item item" v-for="(item, index) in reputation.gainList" :key="index">
                            <div class="from-to">{{ item.to }}</div>
                            <div class="desc">
                                <div class="desc-title">提升方式：</div>
                                <div class="desc-content">{{ item.desc }}</div>
                            </div>
                            <div class="m-reward">
                                <div class="desc-title">阶段奖励：</div>
                                <div v-if="rewardItems(item.toID).length" class="list">
                                    <span
                                        class="u-reward-chip"
                                        :class="`u-reward-chip__q${reward.quality}`"
                                        v-for="reward in rewardDisplayItems(item.toID)"
                                        :key="reward.id"
                                    >
                                        {{ reward.name }}
                                    </span>
                                </div>
                                <div v-else class="no-data">无</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="m-pvx__item m-robot__reputation-servant">
                <div class="img-wrap">
                    <img
                        v-if="reputation.servant && reputation.servant.szImagePath"
                        :src="getIcon(reputation.servant.szImagePath, 'partner')"
                        alt=""
                        @error="hideBrokenImage"
                    />
                    <div v-else class="u-empty-servant">无知交形象</div>
                </div>
                <div class="detail-wrap" v-if="reputation.servant">
                    <div class="sub-title sub-name">{{ reputation.servant.szNpcName }}</div>
                    <div class="sub-title u-zf">
                        知交祝福
                        <span>{{ reputation.servant.szBuffName }}</span>
                        {{ (reputation.servant.szBuffDesc || "").replace("。", "") }}
                    </div>
                    <div class="u-desc" v-html="reputation.servant.szDescBrief"></div>
                    <div class="u-desc" v-html="(reputation.servant.szDescPersonality || '').replace(/\\n/g, '<br>')"></div>
                </div>
            </div>

            <div class="m-robot__reputation-strategy">
                <div class="m-title">
                    <div class="u-title">声望攻略</div>
                    <span>（以魔盒在线版本为准）</span>
                </div>
                <div class="w-pvx-user">
                    <div class="m-wiki-post-panel is-robot" v-if="wikiPost && wikiPost.post">
                        <WikiPanel :wiki-post="wikiPost" :showQR="false">
                            <template #body>
                                <Article id="pvxReputationWiki" :content="wikiPost.post.content" />
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
        <div v-else class="m-wiki-post-empty is-robot-empty">未找到对应声望数据</div>
    </div>
</template>

<script>
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import { ts2str } from "@jx3box/jx3box-common/js/utils";
import { get_item } from "@jx3box/jx3box-editor/src/service/item";
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import WikiPanel from "@jx3box/jx3box-ui/src/wiki/WikiPanel";
import { __imgPath } from "@/utils/config";
import paths from "@/assets/data/qqbot/pvx/reputation_exchange_path.json";
import levelList from "@/assets/data/qqbot/pvx/reputation_level.json";
import { getReputation } from "@/service/qqbot-pvx";

export default {
    name: "QQBotPvxReputationSingle",
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
            reputation: null,
            rewardMetaMap: {},
            wikiPost: null,
        };
    },
    computed: {
        id() {
            return this.sourceId || this.$route.query.id || "";
        },
        client() {
            return this.$store.state.client;
        },
        showPath() {
            return !!(this.reputation?.gainList?.length);
        },
        achievementId() {
            return this.reputation?.achievement?.[0]?.ID || "";
        },
        wikiUpdatedAt() {
            const updated = this.wikiPost?.post?.updated;
            if (!updated) return "-";
            return String(ts2str(updated)).split(" ")[0];
        },
        robotTitle() {
            return `声望 · ${this.reputation?.szName || ""}`;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler(id) {
                if (!id) return;
                this.fetchReputation(id);
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
        hideBrokenImage(e) {
            e.target.style.display = "none";
        },
        rewardItems(levelId) {
            return this.reputation?.RewardItems?.[levelId] || [];
        },
        rewardDisplayItems(levelId) {
            return this.rewardItems(levelId).map((itemId) => {
                const key = String(itemId);
                const meta = this.rewardMetaMap[key] || {};
                return {
                    id: key,
                    name: meta.name || key,
                    quality: Number(meta.quality) || 1,
                };
            });
        },
        getPath(name) {
            return paths.find((v) => v.reputations.includes(name))?.path || "";
        },
        getLevelDesc(level) {
            return levelList.find((v) => v.level === Number(level))?.name || "未知";
        },
        getIcon(iconPath, type = "icon") {
            const iconName = iconPath ? iconPath.split("\\").pop()?.split(".")[0] : "";
            return iconName ? `${__imgPath}reputation/reputation/std/${type}/${iconName.toLowerCase()}.png` : "";
        },
        getBotIcon(iconPath) {
            const normalized = iconPath ? iconPath.replace(/\//g, "\\") : "";
            const iconName = normalized ? normalized.split("\\").pop()?.toLowerCase().split(".tga")[0] : "";
            return iconName ? `${__imgPath}reputation/reputation/std/icon/${iconName}.png` : "";
        },
        getRewardCacheKey(itemId) {
            return `qqbot-pvx-item-${this.client}-${itemId}`;
        },
        parseItemPayload(res) {
            const payload = res?.data?.data?.item || res?.data?.item || res?.data || {};
            return payload && typeof payload === "object" ? payload : {};
        },
        async fetchRewardMeta(itemId) {
            const key = String(itemId);
            const cacheKey = this.getRewardCacheKey(key);
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
                return {
                    name: key,
                    quality: 1,
                };
            }
        },
        async loadRewardItemMap() {
            const rewardItems = this.reputation?.RewardItems || {};
            const ids = Array.from(new Set(Object.values(rewardItems).flat().map((itemId) => String(itemId || ""))))
                .filter(Boolean)
                .filter((itemId) => itemId !== "0");
            if (!ids.length) {
                this.rewardMetaMap = {};
                return;
            }
            const tupleList = await Promise.all(ids.map(async (itemId) => [itemId, await this.fetchRewardMeta(itemId)]));
            this.rewardMetaMap = Object.fromEntries(tupleList);
        },
        async loadStrategy() {
            this.wikiPost = null;
            if (!this.achievementId) return;
            try {
                const res = await wiki.mix({
                    type: "achievement",
                    id: this.achievementId,
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
        parseReputation(data) {
            const parsed = { ...(data || {}) };
            parsed.szDesc = (parsed.szDesc || "").replace(/\\n/g, "<br>");
            parsed.gainList = (parsed.GainDesc || []).map((item) => ({
                fromID: Number(item.from),
                toID: Number(item.to),
                from: this.getLevelDesc(item.from),
                to: this.getLevelDesc(item.to),
                desc: item.desc,
            }));
            return parsed;
        },
        async fetchReputation(id) {
            this.setNotReady();
            this.loading = true;
            try {
                const res = await getReputation(id, this.client);
                this.reputation = this.parseReputation(res?.data || {});
                await Promise.allSettled([this.loadRewardItemMap(), this.loadStrategy()]);
            } catch (e) {
                this.reputation = null;
                this.rewardMetaMap = {};
                this.wikiPost = null;
                this.$message?.error?.("加载声望详情失败");
            } finally {
                this.loading = false;
                this.setReady();
            }
        },
    },
};
</script>

<style lang="less">
.m-qqbot-pvx-reputation {
    .m-robot__reputation-header {
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
            }
        }
    }

    .m-robot__reputation-info {
        margin-top: 10px;
        .flex;
        gap: 12px;

        .u-reputation-logo {
            flex: none;
            width: 28px;
            height: 28px;

            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
        }
    }

    .m-robot__reputation-reward {
        margin-top: 10px;

        .m-title {
            .flex;
            justify-content: space-between;
            align-items: center;
            color: #fff;
            margin-bottom: 10px;
        }

        .u-title {
            font-size: 16px;
            .bold;
        }

        .u-up {
            font-size: 12px;
        }

        .reward-content {
            background: none !important;
            box-shadow: none !important;
            padding: 6px !important;
        }

        .item {
            background: rgba(28, 28, 28, 1) !important;
            box-shadow: none !important;
            margin-bottom: 8px;

            &:last-child {
                margin-bottom: 0;
            }
        }

        .from-to {
            color: rgba(255, 206, 92, 1);
            font-size: 12px;
            .bold;
            margin-bottom: 4px;
        }

        .m-reward {
            .flex;
            margin-top: 5px;
            gap: 6px;
            align-items: flex-start;

            .desc-title {
                flex: none;
                white-space: nowrap;
            }
        }

        .list {
            .flex;
            flex-wrap: wrap;
            gap: 4px;
        }

        .u-reward-chip {
            padding: 0;
            border-radius: 0;
            background: none;
            color: #fff;
            font-size: 10px;
            line-height: 1.5;
            .bold;

            &.u-reward-chip__q2 {
                color: rgba(13, 192, 63, 1);
            }
            &.u-reward-chip__q3 {
                color: rgba(0, 133, 255, 1);
            }
            &.u-reward-chip__q4 {
                color: rgba(204, 70, 237, 1);
            }
            &.u-reward-chip__q5 {
                color: rgba(255, 168, 17, 1);
            }
        }
    }

    .m-robot__reputation-servant {
        margin-top: 10px;
        .flex;
        gap: 10px;

        .img-wrap {
            flex: none;
            .size(80px, 140px);
            border-radius: 4px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .u-empty-servant {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.7);
            text-align: center;
            padding: 0 6px;
        }

        .sub-title.sub-name {
            font-size: 12px;
            .bold;
            color: #fff;
        }

        .u-zf {
            .dbi;
            color: rgba(255, 232, 23, 1);
            .r(2px);
            border: 1px solid rgba(255, 232, 23, 1);
            margin: 4px 0;
            padding: 0 4px;
        }

        .u-desc {
            color: rgba(#fff, 0.5);
        }
    }

    .m-robot__reputation-strategy {
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
            background: #f5f5f5 !important;
            color: #666 !important;
            border: 1px solid #d7d7d7 !important;
            box-shadow: none !important;
            border-radius: 8px;
        }
    }
}
</style>
