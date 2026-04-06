<template>
    <div class="p-qqbot-treasure" v-loading="loading">
        <div v-if="userAchievement" :class="isLandscape ? 'p-adventure-treasure-landscape' : 'p-adventure-treasure-portrait'">
            <div class="m-main">
                <div class="m-body">
                    <div id="capture" ref="capture">
                        <TreasureLandscapeContent
                            v-if="isLandscape"
                            :__img-root="imgRoot"
                            :user-achievement="userAchievement"
                            :role-info="roleInfo"
                            :add-class="addClass"
                            :is-over="isOver"
                            :content-zoom="contentZoom"
                            :current-camp="currentCamp"
                            :reel-add-class="reelAddClass"
                        />
                        <TreasurePortraitContent
                            v-else
                            :__img-root="imgRoot"
                            :user-achievement="userAchievement"
                            :role-info="roleInfo"
                            :add-class="addClass"
                            :is-over="isOver"
                            :content-zoom="contentZoom"
                            :current-camp="currentCamp"
                            :reel-add-class="reelAddClass"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
import getTreasureData from "@/assets/js/treasure";
import { getRoleGameAchievementsByRoleAndServer, getUserRoles } from "@/service/qqbot-pvx";
import TreasureLandscapeContent from "./TreasureLandscapeContent.vue";
import TreasurePortraitContent from "./TreasurePortraitContent.vue";

export default {
    name: "QQBotTreasure",
    components: {
        TreasureLandscapeContent,
        TreasurePortraitContent,
    },
    data() {
        return {
            loading: false,
            userAchievement: false,
            addClass: false,
            reelAddClass: false,
            contentZoom: "",
            currentCamp: "hq",
            isOver: false,
            imgRoot: __imgPath + "adventure/",
            mount: "",
            defaultRole: "",
        };
    },
    computed: {
        isLandscape() {
            return this.$route.query.mode === "landscape";
        },
        role() {
            return this.$route.query.role || "";
        },
        server() {
            return this.$route.query.server || "";
        },
        params() {
            return {
                role: this.role,
                server: this.server,
            };
        },
        roleInfo() {
            return {
                name: this.role || this.defaultRole,
                mount: this.mount || "",
            };
        },
    },
    watch: {
        params: {
            immediate: true,
            deep: true,
            handler(params) {
                this.loadByParams(params);
            },
        },
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.handleScreenWidthChange);
        window.removeEventListener("load", this.handleScreenWidthChange);
    },
    methods: {
        setDataNotReady() {
            window.__DATA_READY__ = false;
            window.__READY__ = false;
        },
        splitArrayIntoChunks(array, chunkSize) {
            const chunks = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                chunks.push(array.slice(i, i + chunkSize));
            }
            return chunks;
        },
        handlePortraitScreenWidthChange() {
            const screenWidth = window.innerWidth - 40;
            const boxWidth = 900;
            const scale = screenWidth / boxWidth;
            this.contentZoom = screenWidth <= boxWidth ? scale : 1;
        },
        handleLandscapeScreenWidthChange() {
            const screenWidth = window.innerWidth - 80;
            const boxWidth = 1920;
            const scale = screenWidth / boxWidth;
            this.contentZoom = screenWidth <= boxWidth ? scale : 1;
        },
        handleScreenWidthChange() {
            if (!this.isLandscape) {
                this.handlePortraitScreenWidthChange();
            } else {
                this.handleLandscapeScreenWidthChange();
            }
        },
        start() {
            this.addClass = true;
            this.reelAddClass = "start";
            setTimeout(() => {
                this.isOver = true;
                this.addClass = false;
                this.reelAddClass = "";
                window.__READY__ = true;
            }, 500);
            window.addEventListener("resize", this.handleScreenWidthChange);
            window.addEventListener("load", this.handleScreenWidthChange);
            this.handleScreenWidthChange();
        },
        async buildTreasureData(userJx3Id) {
            const data = await getTreasureData(userJx3Id);
            window.__DATA_READY__ = true;
            if (this.isLandscape) {
                data.pet = this.splitArrayIntoChunks(data.pet || [], 5);
                data.normal = this.splitArrayIntoChunks(data.normal || [], 3);
            }
            this.userAchievement = data;
            this.$nextTick(() => {
                this.addClass = false;
                this.reelAddClass = "";
                this.isOver = false;
                this.start();
            });
        },
        async getRoleGameAchievements(params) {
            try {
                const res = await getRoleGameAchievementsByRoleAndServer(params);
                const data = res?.data?.data || {};
                const userJx3Id = data.jx3id || "";
                this.mount = data.mount || "";
                if (!userJx3Id) {
                    this.setDataNotReady();
                    this.$message.warning("请先在游戏中同步数据");
                    return;
                }
                await this.buildTreasureData(userJx3Id);
            } catch (e) {
                this.setDataNotReady();
                this.$message.error("获取角色成就失败，请稍后再试");
            }
        },
        async loadByParams(params) {
            this.loading = true;
            this.setDataNotReady();
            try {
                if (params.role && params.server) {
                    await this.getRoleGameAchievements(params);
                    return;
                }

                const rolesRes = await getUserRoles();
                const roleList = (rolesRes?.data?.data?.list || []).filter((item) => !!item.player_id);
                if (!roleList.length) {
                    this.$message.error("未获取到角色信息");
                    return;
                }
                this.defaultRole = roleList[0].name;
                await this.getRoleGameAchievements({
                    role: roleList[0].name,
                    server: roleList[0].server,
                });
            } catch (e) {
                this.setDataNotReady();
                this.$message.error("加载奇遇卷轴失败，请稍后再试");
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style lang="less">
.p-qqbot-treasure {
    width: 100%;
    min-height: auto;
    text-align: left;
    margin: 0;

    #capture {
        padding: 0;
        width: max-content;
        margin: 0;
        user-select: none;
        overflow: hidden;
    }

    // 卷轴主体统一从左上角开始渲染（qqbot 专属覆盖）
    .p-adventure-treasure-portrait {
        padding: 0 !important;

        .m-main,
        .m-body {
            margin: 0 !important;
        }

        #capture {
            margin: 0 !important;
            // 保留左上锚点，同时给卷轴外扩边缘留出显示空间
            padding: 0 20px 20px 20px !important;
        }
    }

    .p-adventure-treasure-landscape {
        .m-body {
            min-width: 0 !important;
            min-height: auto !important;
            padding: 0 !important;
        }

        #capture {
            margin: 0 !important;
            // 横版卷轴顶部会有轻微外扩，补最小顶边距避免被裁切
            padding: 8px 60px 20px 60px !important;
        }

        .m-content {
            margin: 0 !important;
        }
    }
}
</style>
