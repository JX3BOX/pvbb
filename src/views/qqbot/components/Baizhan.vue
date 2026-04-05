<template>
    <div class="m-qqbot__baizhan">
        <div class="m-header">
            <div class="m-header__left">
                <img class="u-logo" src="@/assets/img/qqbot/jx3box_qqbot_baizhan.svg" alt="" />
                <span class="u-title">百战异闻录</span>
            </div>
            <div class="m-header__right">
                <div class="u-date__range">{{ duration.start }} - {{ duration.end }}</div>
                <div class="u-time">更新时间：{{ update_time }}</div>
            </div>
        </div>
        <div class="m-qqbot__map" id="baizhanProcessContent">
            <div class="m-boss-list" :class="list.length % 2 ? 'is-odd' : 'is-even'" ref="map">
                <div class="u-step" v-for="(item, stepIndex) in list" :key="stepIndex">
                    <div
                        class="u-floor"
                        :class="[
                            floor.nEffectID ? 'is-effect' : '',
                            getCurrentStyle(floor, stepIndex * row + index + 1),
                        ]"
                        v-for="(floor, index) in item"
                        :key="index"
                    >
                        <div class="u-floor-content">
                            <div class="u-index" :class="floor.nEffectID && 'u-effect'">
                                {{ stepIndex * row + index + 1 }}
                            </div>
                            <div class="u-img">
                                <img :src="getBossAvatar(floor.dwBossID)" :alt="floor.bossName || '未知'" />
                            </div>
                            <div class="u-name">
                                {{ floor.bossName }}
                            </div>
                            <div
                                v-if="
                                    getEffectInfo(effects, floor.nEffectID, 'tags').length ||
                                    getEffectInfo(effects, floor.nEffectID, 'reward')
                                "
                                class="u-desc"
                            >
                                <div v-if="getEffectInfo(effects, floor.nEffectID, 'tags').length" class="u-sketch">
                                    <div
                                        class="u-sketch-info"
                                        v-for="(tag, si) in getEffectInfo(effects, floor.nEffectID, 'tags')"
                                        :key="si"
                                    >
                                        {{ tag }}
                                    </div>
                                </div>
                                <div v-if="getEffectInfo(effects, floor.nEffectID, 'reward')" class="u-coin">
                                    <img class="u-coin-img" src="@/assets/img/qqbot/baizhan/coin.svg" svg-inline />
                                    <span>{{ getEffectInfo(effects, floor.nEffectID, "reward") }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { getEffectInfo } from "@/utils/baizhan";
import { getMap, getEffects, getBosses } from "@/service/qqbot";
import { cloneDeep, chunk } from "lodash";
import { effects as baizhanEffects, effectsFilter } from "@/assets/data/qqbot/baizhan_effects.js";

import { moment } from "@jx3box/jx3box-common/js/moment";
export default {
    name: "QQbotBaizhan",
    props: ["id"],
    components: {},
    data() {
        return {
            step: 6,
            row: 10,
            map: {},
            maps: [],
            imgRoot: __imgPath + "pve/baizhan/",
            effects: [],
            bosses: [],

            imageCount: 0,
            loadedImageCount: 0,
            images: [],
            imagesLoaded: false,
        };
    },
    computed: {
        update_moment() {
            return moment(this.map.updated_at);
        },
        update_time() {
            return this.update_moment.format("YYYY/MM/DD HH:mm:ss");
        },
        duration() {
            return {
                start: this.update_moment.startOf("week").add(1, "day").format("MM/DD"),
                end: this.update_moment.endOf("week").add(1, "day").format("MM/DD"),
            };
        },
        list() {
            const data = cloneDeep(this.maps);
            return chunk(data, this.row);
        },
    },
    watch: {
        id: {
            immediate: true,
            handler(id) {
                this.load();
            },
        },
    },
    unmounted() {
        window.removeEventListener("load", this.initImageLoader);
    },
    methods: {
        load() {
            const bossPro = this.loadBosses();
            const effectPro = this.loadEffects();
            Promise.allSettled([bossPro, effectPro]).then((res) => {
                this.loadMap();
            });
        },
        initImageLoader() {
            // 在DOM更新后获取所有图片
            this.$nextTick(() => {
                const container = document.getElementById("baizhanProcessContent");
                if (!container) {
                    this.setGlobalReady();
                    return;
                }

                const images = container.querySelectorAll("img");
                this.images = images;
                this.imageCount = images.length;

                if (this.imageCount === 0) {
                    this.setGlobalReady();
                    return;
                }

                // 手动预加载所有图片
                this.preloadAllImages(images);
            });
        },

        // 手动预加载所有图片
        preloadAllImages(images) {
            let loadedInThisBatch = 0;
            let totalProcessed = 0;
            Array.from(images).forEach((img, index) => {
                // 记录原始src
                const originalSrc = img.src;

                // 如果图片未加载
                if (!img.complete) {
                    // 创建一个Image对象来预加载
                    const tempImg = new Image();

                    tempImg.onload = () => {
                        loadedInThisBatch++;

                        // 在临时图片加载完成后，设置原始图片的src
                        img.src = originalSrc;

                        // 检查是否所有图片都已处理
                        this.checkImageLoadCompletion(images, loadedInThisBatch);
                    };

                    tempImg.onerror = () => {
                        console.error(`图片加载失败: ${originalSrc}`);
                        totalProcessed++;

                        // 即使加载失败，也要设置原始图片的src
                        img.src = originalSrc;

                        // 标记原始图片为已加载（错误情况）
                        this.handleImageLoad();
                    };

                    // 开始预加载
                    tempImg.src = originalSrc;
                } else {
                    // 图片已经加载完成
                    this.handleImageLoad();
                    totalProcessed++;
                }
            });
        },

        // 检查图片加载状态
        checkImageLoadCompletion(images, loadedCount) {
            if (images.length === this.loadedImageCount) {
                this.setGlobalReady();
                return;
            }

            // 设置超时检查，防止意外情况
            setTimeout(() => {
                const allLoaded = Array.from(images).every((img) => img.complete);

                if (allLoaded) {
                    this.setGlobalReady();
                } else if (this.loadedImageCount === images.length) {
                    this.setGlobalReady();
                }
            }, 3000);
        },

        // 判断是否全部完成
        handleImageLoad() {
            this.loadedImageCount++;
            if (this.loadedImageCount === this.imageCount) {
                this.setGlobalReady();
            }
        },

        // 设置全局就绪状态
        setGlobalReady() {
            if (this.imagesLoaded) return; // 避免重复设置

            this.imagesLoaded = true;
            window.__READY__ = true;
            console.log("全局状态设置成功: __READY__ = ", window.__READY__);
        },
        getCurrentStyle(floor, index) {
            const indexes = [10, 20, 30, 40, 50, 60];
            return indexes.includes(index) || effectsFilter[0].ids.includes(floor.nEffectID) ? "is-current" : "";
        },
        getEffectInfo,
        getBossAvatar(id) {
            const avatar = this.bosses.find((item) => item.id === id)?.avatar || `${this.imgRoot}fbcdpanel02_51.png`;
            return avatar;
        },
        async loadBosses() {
            await getBosses().then((res) => {
                let list = res.data?.data || [];
                list = list
                    .filter((item) => item.dwNpcID)
                    .map((item) => {
                        return {
                            id: item.dwNpcID,
                            avatar: item.ImagePath
                                ? `${__imgPath}pve/baizhan/${item.ImagePath.match(/\\([^\\]*)\./)[1].toLowerCase()}_${
                                      item.ImageFrame
                                  }.png`
                                : `${__imgPath}pve/baizhan/fbcdpanel02_51.png`,
                            name: item.szName,
                            skills: item.szSkill,
                        };
                    });
                this.bosses = list;
            });
        },
        async loadEffects() {
            await getEffects().then((res) => {
                const list = res.data?.data || [];
                list.unshift({
                    nID: 0,
                    dwIconID: 18505,
                    szName: "无",
                    szDescription: "",
                    reward: 0,
                    tags: "",
                    buffID: 24848,
                });
                const effects = list.map((item) => {
                    const effect = baizhanEffects.find((effect) => effect.id === item.nID) || {};
                    let reward = effect.reward;
                    if (effect.rewardRegexp) {
                        const matches = item.szDescription.match(effect.rewardRegexp);
                        if (matches?.[1]) {
                            reward = Number(matches[1]);
                        }
                    }
                    return {
                        ...item,
                        reward: reward || 0,
                        tags: effect?.tags || [],
                        buffID: effect?.buffID || 24848,
                        buffLevel: effect?.buffLevel || 1,
                    };
                });
                this.effects = effects;
            });
        },
        async loadMap() {
            const params = {};
            if (this.id) {
                params.id = ~~this.id;
            }
            await getMap(params).then((res) => {
                if (res.data?.code !== 0) {
                    return;
                }
                this.map = res.data?.data || "";
                const bosses = this.bosses;
                const effects = this.effects;
                const data = res.data?.data?.data || [];
                const list = data.map((item) => {
                    return {
                        ...item,
                        boss: bosses.find((boss) => boss.id === item.dwBossID),
                        bossName: bosses.find((boss) => boss.id === item.dwBossID)?.name,
                        bossLink: bosses.find((boss) => boss.id === item.dwBossID)?.link,
                        bossAvatar: bosses.find((boss) => boss.id === item.dwBossID)?.avatar,
                        effect: effects.find((effect) => effect.nID === item.nEffectID),
                    };
                });
                this.maps = list;
                this.initImageLoader();
            });
        },
    },
};
</script>

<style lang="less">
@baizhan_bg: #1f2937;
@baizhan_active: #7879d0;
@baizhan_tab_bg: #111827;
@baizhan_color: #c8c8c8;
@baizhan_left: 333px;
@baizhan_right: 312px;
@baizhan_map_bg: #373f5f;
@baizhan_map_color: #c2c3ff;
@baizhan_map_select_color: #deddd3;
.m-qqbot__baizhan {
    color: #fff;
    .m-header {
        .flex;
        justify-content: space-between;
        align-items: center;
        font-size: 40px;
        font-weight: 700;
        padding: 10px 0 20px;
    }
    .u-logo {
        .size(64px);
    }
    .m-header__left {
        .flex;
        align-items: center;
        gap: 8px;
    }
    .m-header__right {
        text-align: right;
    }
    .u-time {
        color: rgba(255, 255, 255, 0.5);
        font-size: 22px;
        font-weight: 400;
    }
    .m-qqbot__map {
        width: 1112px;
        // min-height: 1112px;
        opacity: 1;
        border-radius: 16px;
        background: rgba(31, 41, 55, 1);

        border: 1px solid rgba(110, 110, 110, 1);

        padding: 20px;
        box-sizing: border-box;
    }

    .m-boss-list {
        position: relative;
        box-sizing: border-box;
        .flex;
        flex-direction: column;
        box-sizing: border-box;
        transition: transform 0.2s ease-out;
        background-color: @baizhan_bg;
        user-select: none;
        .u-watermark {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            .u-title {
                .flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                color: @baizhan_map_select_color;
                margin: 0;
                padding-top: 5px;
                font-size: 18px;
                svg {
                    width: 30px;
                    height: 30px;
                }
            }
            .u-bottom-title {
                position: absolute;
                bottom: 10px;
                width: 100%;
                text-align: center;
            }
            .u-watermark-content {
                position: absolute;
                top: 10%;
                left: 10%;
                width: 90%;
                height: 80%;
                box-sizing: border-box;
                z-index: 0;
                overflow: hidden;
                .flex;
                flex-wrap: wrap;
                gap: 100px;
                .u-title {
                    opacity: 0.1;
                    color: @baizhan_map_select_color;
                    transform: rotate(30deg);
                }
            }
        }
        .u-download {
            position: absolute;
            right: -30px;
            top: 55px;
            display: none;
            z-index: 2;
        }
        &:hover {
            .u-download {
                display: block;
            }
        }
        .u-floor {
            position: relative;
            flex: none;
            width: 100px;
            height: 100px;
            border-radius: 10px;
            background: @baizhan_map_bg;
            .flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            z-index: 2;
            transition: height 0.2s ease-out;
            color: @baizhan_map_color;
            .u-floor-content {
                .flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 4px;
                width: 100%;
                height: 100%;
            }
            .u-info-icon {
                .none;
                position: absolute;
                transform: rotate(134deg);
                color: @baizhan_active;
                font-weight: bold;
            }
            .el-icon-arrow-down {
                top: -10px;
                left: -10px;
            }
            .el-icon-arrow-up {
                bottom: -10px;
                right: -10px;
            }
            .u-img {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                user-select: none;
                img {
                    user-select: none;
                }
            }
            .u-index {
                position: absolute;
                left: 4px;
                top: 4px;
                font-size: 12px;
                color: #fff;
                font-weight: bold;
                color: @baizhan_active;
            }
            .u-name {
                color: @baizhan_active;
                font-size: 14px;
                font-weight: bold;
                width: 80px;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .u-desc {
                .size(80px, 52px);
                .flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: @baizhan_active;
                .u-coin {
                    .flex;
                    justify-content: center;
                    align-items: center;
                    gap: 2px;
                }
            }
            .u-icon {
                position: absolute;
                bottom: 4px;
                right: 4px;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                    .size(100%, 100%);
                    border-radius: 50%;
                    transform: scale(1.2);
                    user-select: none;
                }
            }
            &::after {
                position: absolute;
                right: -8px;
                width: 8px;
                height: 4px;
                display: block;
                background-color: @baizhan_map_bg;
                content: "";
            }
            &.is-effect {
                // background-color: @baizhan_active;
                // color: @baizhan_map_select_color;
                .u-floor-content {
                    justify-content: flex-start;
                }
                .u-img {
                    position: absolute;
                    top: -20px;
                    border: 2px solid @baizhan_map_bg;
                    box-sizing: border-box;
                    user-select: none;
                }
                .u-name {
                    margin-top: 20px;
                    font-size: 16px;
                }
                .u-desc {
                    font-size: 12px;
                    text-align: center;
                    .u-coin-img {
                        filter: invert(50%) sepia(74%) saturate(353%) hue-rotate(201deg) brightness(86%) contrast(92%);
                    }
                }
            }
            &.is-gray {
                // opacity: 0.3;
                background-color: @baizhan_map_bg;
                color: @baizhan_map_color;
            }
            &.is-current {
                // height: 110px;
                // opacity: 1;
                background-color: @baizhan_active !important;
                color: @baizhan_map_select_color !important;
                .u-name,
                .u-index {
                    color: @baizhan_map_select_color;
                }
                &.is-effect {
                    .u-img {
                        border-color: @baizhan_active;
                    }
                    .u-desc {
                        color: @baizhan_map_select_color;
                        .u-coin-img {
                            filter: none;
                        }
                    }
                }
            }
            &.is-info {
                background-color: @baizhan_active !important;
                color: @baizhan_map_select_color !important;
                .u-name,
                .u-index {
                    color: @baizhan_map_select_color;
                }
                .u-img {
                    border-color: @baizhan_active;
                }
                .u-desc {
                    color: @baizhan_map_select_color;
                    .u-coin-img {
                        filter: none;
                    }
                }
                .u-info-icon {
                    .db;
                }
            }
            &:nth-of-type(10n),
            &:nth-of-type(10n).is-effect {
                height: 150px;
                // background-color: @baizhan_active;
                // &.is-current {
                //     height: 160px !important;
                // }
                .u-floor-content {
                    justify-content: center;
                }
                .u-name {
                    margin-top: 0;
                }
                .u-img {
                    position: relative !important;
                    top: unset !important;
                    box-sizing: border-box;
                    border: 4px solid @baizhan_map_select_color;
                    width: 50px;
                    height: 50px;
                    user-select: none;
                }
                &::after {
                    right: unset;
                    bottom: -25px;
                    width: 4px;
                    height: 25px;
                }
            }
        }
        .u-step {
            .flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            height: 150px;
            color: @baizhan_map_color;
            &.has-info {
                .u-floor {
                    opacity: 0.2;
                    &.is-info {
                        opacity: 1;
                    }
                }
            }
            &:nth-of-type(even) {
                flex-direction: row-reverse;
                .u-floor {
                    &::after {
                        position: absolute;
                        right: unset;
                        left: -8px;
                        width: 8px;
                        height: 4px;
                        display: block;
                        background-color: @baizhan_map_bg;
                        content: "";
                    }
                    &:nth-of-type(10n),
                    &:nth-of-type(10n).is-effect {
                        height: 150px;
                        // background-color: @baizhan_active;
                        .u-floor-content {
                            justify-content: center;
                        }
                        .u-name {
                            margin-top: 0;
                        }
                        .u-img {
                            position: relative !important;
                            top: unset !important;
                            box-sizing: border-box;
                            border: 4px solid @baizhan_map_select_color;
                            width: 50px;
                            height: 50px;
                        }
                        &::after {
                            left: unset;
                            bottom: -25px;
                            width: 4px;
                            height: 25px;
                        }
                    }
                }
            }
            &:last-of-type {
                .u-floor {
                    &:last-of-type {
                        &::after {
                            display: none;
                        }
                    }
                }
            }
        }
    }
}
</style>
