<template>
    <div
        class="m-content"
        :class="{
            start: addClass,
            over: isOver,
        }"
        :style="{
            zoom: contentZoom,
        }"
        v-if="userAchievement"
    >
        <img class="u-content__bg" :src="getCdnImgUrl('content_bg.png')" />
        <div class="m-left" :class="reelAddClass">
            <img class="u-left__img" :src="getCdnImgUrl('landscape/left.png')" />
        </div>
        <div class="m-right" :class="reelAddClass">
            <img class="u-right__img" :src="getCdnImgUrl('landscape/right.png')" />
        </div>
        <div class="m-qy-box">
            <!-- 普通奇遇 -->
            <div class="m-qy m-ordinary">
                <div class="m-qy-list" v-if="userAchievement.normal.length">
                    <div class="m-qy__row" v-for="(ele, eleIndex) in userAchievement.normal" :key="eleIndex">
                        <div class="m-qy__item" v-for="(item, index) in ele" :key="index">
                            <template v-if="[4, 118].indexOf(item.dwID) > -1">
                                <img
                                    v-show="currentCamp == 'hq'"
                                    class="u-qy__img"
                                    :src="getCdnImgUrl(`pt/${item.dwID}_hq.png`)"
                                />
                                <img
                                    v-show="currentCamp == 'er'"
                                    class="u-qy__img"
                                    :src="getCdnImgUrl(`pt/${item.dwID}_er.png`)"
                                />
                                <img
                                    v-show="!currentCamp"
                                    class="u-qy__img"
                                    :src="getCdnImgUrl(`pt/${item.dwID}.png`)"
                                />
                            </template>
                            <el-image v-else class="u-qy__img" :src="getCdnImgUrl(`pt/${item.dwID}.png`)">
                                <template #error>
                                    <img class="u-qy__img" :src="getCdnImgUrl(`pt/default.png`)" />
                                </template>
                            </el-image>
                            <div class="m-qy__text">
                                <img class="u-qy__bg" :src="getCdnImgUrl('pt/text_bg.png')" />
                                <span class="u-qy__text">{{ item.szName }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="u-no-qy" v-else>
                    <img :src="getCdnImgUrl('landscape/no_qy.png')" />
                </div>
                <div class="m-qy-count">
                    <img class="u-count__img" :src="getCdnImgUrl('landscape/pt_qy_bg.png')" />
                    <div class="m-count-info">
                        <div>{{ userAchievement.normalNowNum }}</div>
                        <div>/</div>
                        <div>{{ userAchievement.normalAllNum }}</div>
                    </div>
                </div>
            </div>
            <!-- 宠物奇遇 -->
            <div class="m-qy m-pet">
                <div class="m-qy-list" v-if="userAchievement.pet.length">
                    <div class="m-qy__row" v-for="(ele, eleIndex) in userAchievement.pet" :key="eleIndex">
                        <div class="m-qy__item" v-for="(item, index) in ele" :key="index">
                            <img class="u-qy__img" :src="getImgUrl(item)" />
                            <img class="u-qy__border" :src="getCdnImgUrl('pet_img_border.png')" />
                        </div>
                    </div>
                </div>
                <div class="u-no-qy" v-else>
                    <img :src="getCdnImgUrl('landscape/no_qy.png')" />
                </div>
                <div class="m-qy-count">
                    <img class="u-count__img" :src="getCdnImgUrl('landscape/pet_qy_bg.png')" />
                    <div class="m-count-info">
                        <div>{{ userAchievement.petNowNum }}</div>
                        <div>/</div>
                        <div>{{ userAchievement.petAllNum }}</div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 绝世奇遇 -->
        <div class="m-world" :style="worldStageStyle">
            <img class="u-world__bg" :src="getCdnImgUrl(perfectLayout.worldBackground.src)" :style="worldBgStyle" />
            <div class="m-world-count" :style="perfectCountStyle">
                <img class="u-count__img" :src="getCdnImgUrl(perfectLayout.countBadge)" :style="perfectCountImageStyle" />
                <div class="m-count-info" :style="perfectCountTextStyle">
                    <div>{{ userAchievement.perfectNowNum }}</div>
                    <div>/</div>
                    <div>{{ userAchievement.perfectAllNum }}</div>
                </div>
            </div>
            <template v-for="(item, index) in userAchievement.perfect" :key="`group-${item.dwID}-${index}`">
                <img
                    class="u-item__img"
                    :class="perfectItemClass(item)"
                    :style="perfectImageStyle(item)"
                    :src="getCdnImgUrl(perfectItemImage(item))"
                />
                <div class="m-item__text" :class="perfectItemClass(item)" :style="perfectLabelStyle(item)">
                    <img class="u-item__bg" :src="getCdnImgUrl(perfectTextBackground(item))" />
                    <span class="u-item__text">{{ item.szName }}</span>
                </div>
            </template>
        </div>
        <!-- 右侧内容 -->
        <div class="m-title">
            <img class="u-logo" :src="getCdnImgUrl('landscape/title_icon.png')" />
            <div class="m-title-info">
                <img class="m-tip" :src="getCdnImgUrl('poetry_lan.png')" />
                <div class="m-user">
                    <img v-if="roleInfo.mount" class="u-icon" :src="showSchoolIcon(roleInfo.mount)" />
                    <span class="u-name">{{ roleInfo.name }}</span>
                </div>
            </div>
        </div>
        <div class="m-producer">
            <img class="u-producer" :src="getCdnImgUrl('producer.png')" />
            <div class="u-producer__text">*剑网3魔盒提供技术支持，茗伊插件提供数据支持。</div>
        </div>
        <div class="m-qy-progress">
            <div class="u-progress">【奇遇进度】{{ userAchievement.progress }}%</div>
            <div class="u-time">【记录时间】{{ userAchievement.updated_at }}</div>
        </div>
    </div>
</template>

<script>
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";
import { __cdn } from "@/utils/config";
import { getPerfectItemLayout, getPerfectLayout, toCssStyle } from "@/assets/js/treasure-layout";
export default {
    name: "TreasureLandscapeContent",
    props: {
        layout: {
            type: Object,
            default: () => ({}),
        },
        userAchievement: {
            type: [Object, Boolean],
            default: () => {},
        },
        roleInfo: {
            type: Object,
            default: () => {},
        },
        __imgRoot: {
            type: String,
            required: true,
        },
        addClass: {
            type: Boolean,
            default: false,
        },
        isOver: {
            type: Boolean,
            default: false,
        },
        contentZoom: {
            type: [Number, String],
            default: "",
        },
        currentCamp: {
            type: String,
            default: "hq",
        },
        reelAddClass: {
            type: [Boolean, String],
            default: false,
        },
    },
    data() {
        return {};
    },
    computed: {
        perfectLayout() {
            return getPerfectLayout(this.layout, "landscape");
        },
        worldStageStyle() {
            return toCssStyle(this.perfectLayout.stage);
        },
        worldBgStyle() {
            return toCssStyle(this.perfectLayout.worldBackground.style);
        },
        perfectCountStyle() {
            return toCssStyle(this.perfectLayout.countStyle);
        },
        perfectCountImageStyle() {
            return toCssStyle(this.perfectLayout.countImageStyle);
        },
        perfectCountTextStyle() {
            return toCssStyle(this.perfectLayout.countTextStyle);
        },
    },
    methods: {
        showSchoolIcon,
        getCdnImgUrl(img) {
            if (/^https?:\/\//i.test(img)) return img;
            return `${__cdn}design/treasure/${img}`;
        },
        perfectItemLayout(item = {}) {
            return getPerfectItemLayout(item, "landscape");
        },
        perfectItemClass(item = {}) {
            return this.perfectItemLayout(item).key || item.hasClass || "";
        },
        perfectImageStyle(item = {}) {
            const layout = this.perfectItemLayout(item);
            return {
                ...toCssStyle(layout.imageStyle),
                zIndex: Number(layout.zIndex || item.zIndex || 1),
            };
        },
        perfectLabelStyle(item = {}) {
            return toCssStyle(this.perfectItemLayout(item).labelStyle);
        },
        perfectItemImage(item = {}) {
            const layout = this.perfectItemLayout(item);
            if (item.isAct) return layout.activeImage || `world/${item.dwID}_act.png`;
            return layout.image || `world/${item.dwID}.png`;
        },
        perfectTextBackground(item = {}) {
            return item.isAct ? this.perfectLayout.textActiveBackground : this.perfectLayout.textBackground;
        },
        getImgUrl(item) {
            const client = "std"; // 怀旧服的奇遇图片先取正式服的
            let tgaPath = item.szOpenRewardPath?.toLowerCase();
            if (!tgaPath) return "";
            tgaPath = tgaPath.replace(/\\/g, "/").replace("ui/image/adventure/", "");
            if (!item.szRewardType) {
                let pngPath = tgaPath.replace(/\.tga$/, ".png");
                return `${this.__imgRoot}adventure/${client}/${pngPath}`;
            }
            // 传给组件的数据是修改过的
            tgaPath = tgaPath.replace(/\/[^\/]+?\.tga$/, "");
            if (item.szRewardType === "camp") {
                return `${this.__imgRoot}adventure/${client}/${tgaPath}/camp_1_open.png`;
            }
            if (item.szRewardType === "school") {
                return `${this.__imgRoot}adventure/${client}/${tgaPath}/school_2_open.png`;
            }
            return "";
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/adventure/landscape.less";
</style>
