<template>
    <div class="m-qqbot-pvx-adventure" v-loading="loading">
        <div v-if="adventure && Object.keys(adventure).length">
            <div class="m-robot__adventure-header" :class="{ 'is-perfect': isPerfect }">
                <div class="m-left">
                    <div class="m-title">
                        <img :src="robotIconSrc" alt="" />
                        <div class="u-title">{{ robotTitle }}</div>
                    </div>
                    <div class="m-reward">
                        <div class="u-reward" v-html="rewardContent"></div>
                    </div>
                </div>
                <img class="u-right-icon" src="@/assets/img/qqbot/jx3box_qqbot_adventure.svg" alt="" />
            </div>

            <div class="m-robot-item m-robot__adventure-condition">
                <img class="u-pvx-logo" :src="imgUrl" alt="" />
                <div class="m-condition">
                    <div class="m-title">
                        <img src="@/assets/img/qqbot/jx3box_qqbot_adventure_item.svg" alt="" />
                        <div class="u-title">触发前置</div>
                        <span>（需全部满足）</span>
                    </div>
                    <div class="m-pvx-adventure-content">
                        <div class="u-content" v-html="conditionContent"></div>
                    </div>
                </div>
            </div>

            <div class="m-robot-item m-robot__adventure-method">
                <div class="m-title">
                    <img src="@/assets/img/qqbot/jx3box_qqbot_adventure_item.svg" alt="" />
                    <div class="u-title">触发方式</div>
                    <span>（完成任一均有可能触发奇遇）</span>
                </div>
                <div class="m-pvx-adventure-content">
                    <div class="u-content" v-html="methodContent"></div>
                </div>
            </div>

            <div class="m-robot-item m-robot__adventure-method">
                <div class="m-title">
                    <img src="@/assets/img/qqbot/jx3box_qqbot_adventure_item.svg" alt="" />
                    <div class="u-title">奇遇流程</div>
                    <span>（以魔盒在线版本为准）</span>
                </div>
                <div class="m-pvx-adventure-content">
                    <div id="adventureProcessContent" class="u-content" v-html="processContent"></div>
                </div>
            </div>
        </div>
        <div v-else class="m-wiki-post-empty is-robot-empty">未找到对应奇遇数据</div>
    </div>
</template>

<script>
import { wiki } from "@jx3box/jx3box-common/js/wiki";
import { __imgPath } from "@/utils/config";
import { getAdventure, getSerendipityAchievementId } from "@/service/qqbot-pvx";
import adventureNormalIcon from "@/assets/img/qqbot/jx3box_qqbot_adventure_normal.svg";
import adventurePerfectIcon from "@/assets/img/qqbot/jx3box_qqbot_adventure_perfect.svg";
import adventurePetIcon from "@/assets/img/qqbot/jx3box_qqbot_adventure_pet.svg";

export default {
    name: "QQBotPvxAdventureSingle",
    props: {
        sourceId: {
            type: [String, Number],
            default: "",
        },
    },
    data() {
        return {
            loading: false,
            adventure: null,
            achievementId: "",
            conditionContent: "",
            methodContent: "",
            processContent: "",
            rewardContent: "",
            camp: 1,
            force: 2,
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
        isPerfect() {
            return !!this.adventure?.bPerfect;
        },
        robotIcon() {
            if (this.adventure?.nClassify === 1) return "pet";
            if (this.isPerfect) return "perfect";
            return "normal";
        },
        robotIconSrc() {
            const iconMap = {
                normal: adventureNormalIcon,
                perfect: adventurePerfectIcon,
                pet: adventurePetIcon,
            };
            return iconMap[this.robotIcon];
        },
        robotTitle() {
            let titlePrefix = "奇遇";
            if (this.isPerfect) titlePrefix = "绝世奇遇";
            if (this.adventure?.nClassify === 1) titlePrefix = "宠物奇遇";
            return `${titlePrefix} · ${this.adventure?.szName || ""}`;
        },
        imgUrl() {
            const tgaPath = this.adventure?.szOpenRewardPath?.toLowerCase();
            if (!tgaPath) return "";
            const normalized = tgaPath.replace(/\\/g, "/").replace("ui/image/adventure/", "");
            if (!this.adventure?.szRewardType) {
                return `${__imgPath}adventure/adventure/${this.client}/${normalized.replace(/\.tga$/, ".png")}`;
            }
            const dirPath = normalized.replace(/\/[^\/]+?\.tga$/, "");
            if (this.adventure.szRewardType === "camp") {
                return `${__imgPath}adventure/adventure/${this.client}/${dirPath}/camp_${this.camp}_open.png`;
            }
            if (this.adventure.szRewardType === "school") {
                return `${__imgPath}adventure/adventure/${this.client}/${dirPath}/school_${this.force}_open.png`;
            }
            return `${__imgPath}image/pvx/bg.png`;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler(id) {
                if (!id) return;
                this.fetchAdventure(id);
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
        preloadImagesInProcess() {
            this.$nextTick(() => {
                const container = document.getElementById("adventureProcessContent");
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
        splitWikiContent(content = "") {
            const parts = String(content || "").split("<p>◆◆◆◆◆◆</p>");
            this.conditionContent = (parts[0] || "").replaceAll("&nbsp;", "");
            this.methodContent = (parts[1] || "").replaceAll("&nbsp;", "");
            this.processContent = (parts[2] || "").replaceAll("&nbsp;", "");
            this.rewardContent = (parts[3] || "").replaceAll("&nbsp;", "");
        },
        async loadWikiData() {
            if (!this.achievementId) {
                this.setReady();
                return;
            }
            try {
                const res = await wiki.mix({
                    type: "achievement",
                    id: this.achievementId,
                    client: this.client,
                });
                this.splitWikiContent(res?.post?.content || "");
            } catch (e) {
                this.conditionContent = "";
                this.methodContent = "";
                this.processContent = "";
                this.rewardContent = "";
            } finally {
                this.preloadImagesInProcess();
            }
        },
        async fetchAdventure(id) {
            this.setNotReady();
            this.loading = true;
            try {
                const [adventureRes, achievementRes] = await Promise.all([
                    getAdventure(id, this.client),
                    getSerendipityAchievementId(id, this.client),
                ]);
                this.adventure = adventureRes?.data || {};
                this.achievementId = achievementRes?.data?.achievement_id || "";
                await this.loadWikiData();
            } catch (e) {
                this.adventure = null;
                this.$message?.error?.("加载奇遇详情失败");
                this.setReady();
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style lang="less">
.m-qqbot-pvx-adventure {
    .m-robot__adventure-header {
        .flex;
        justify-content: space-between;
        align-items: center;
        gap: 5px;
        padding: 12px 20px 12px 12px;
        width: 100%;
        min-height: 75px;
        border-radius: 8px;
        box-sizing: border-box;
        background: linear-gradient(to top, rgba(56, 56, 56, 1) 0%, rgba(0, 0, 0, 1) 100%);
        border: 1px solid rgba(110, 110, 110, 1);

        &.is-perfect {
            background: linear-gradient(to top, rgba(82, 44, 11, 1) 0%, rgba(0, 0, 0, 1) 100%);
            border: 1px solid rgba(255, 195, 0, 1);
        }

        .m-left {
            flex: 1;
        }

        .m-title {
            .flex;
            align-items: center;
            gap: 5px;
        }

        .u-title {
            font-size: 20px;
            .bold;
            color: #fff;
        }

        .m-reward {
            margin-top: 4px;
            .flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #ffeb3b;
            width: 100%;

            .u-reward {
                .flex;
                align-items: center;
                flex-wrap: wrap;
                width: 460px;
            }

            p,
            a,
            span,
            div {
                color: #ffeb3b !important;
                font-size: 12px !important;
                margin: 0;
                padding: 0;
            }

            img,
            h1 {
                .none;
            }
        }
    }

    .m-robot__adventure-condition {
        .flex;
        gap: 5px;

        .u-pvx-logo {
            .size(180px);
            border-radius: 4px;
        }

        .m-condition {
            flex: 1;
            .u-content {
                min-height: 100px;
            }
        }
    }

    .m-robot-item {
        margin-top: 10px;

        .m-title {
            .flex;
            align-items: center;
            gap: 4px;

            span {
                font-size: 12px;
                font-weight: 400;
                color: rgba(#ffffff, 0.5);
            }
        }

        .u-title {
            font-size: 16px;
            color: #ffc300;
            font-weight: 700;
        }

        .m-pvx-adventure-content {
            margin-top: 10px;
            border-radius: 4px;
            background: linear-gradient(to top, #383838 0%, #000000 100%);
            border: 1px solid #6e6e6e;
            box-shadow: inset 0px 10px 5px #000000;
            padding: 12px;
            font-size: 10px;
            color: #fff;
        }

        .u-content {
            width: 100%;
            line-height: 18px;

            p {
                margin: 0 0 5px;
            }

            img {
                margin: 5px 0;
                width: 100%;
                height: auto !important;
            }

            p,
            span,
            a,
            div {
                font-size: 12px !important;
                color: #fff !important;
            }
        }
    }
}
</style>
