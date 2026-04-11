<template>
    <div class="p-qqrobot-pvp-detail">
        <div class="m-pvp__container">
            <div class="m-robot-pvp-single">
                <div class="m-single-post" v-if="visible">
                    <div class="m-robot__pvp-header">
                        <div class="m-title">
                            <div class="u-info">
                                <div class="u-tag">{{ post.tags?.length ? post.tags[0] : "其他" }}</div>
                                <div class="u-header-title">{{ post.post_title }}</div>
                                <img
                                    v-if="!post.include_video"
                                    class="u-video"
                                    src="@/assets/img/qqbot/jx3box_qqbot_video.svg"
                                    alt=""
                                />
                            </div>
                            <img class="u-zlp" :src="imgLink(post)" alt="" />
                        </div>
                        <div class="u-content" v-html="nl2br(data?.post_meta?.content)"></div>
                        <div class="m-info">
                            <div class="u-info">
                                <img
                                    v-if="post?.author_info?.user_avatar"
                                    :src="post.author_info.user_avatar"
                                    class="u-avatar"
                                />
                                <div class="u-name">{{ post?.author_info?.display_name || "匿名" }}</div>
                                <div v-if="post?.is_super_author" class="u-info-tag u-super">签约作者</div>
                                <div class="u-info-tag u-level">Lv.{{ post?.level || 0 }}</div>
                                <div v-if="post?.is_pro" class="u-info-tag u-pro">PRO</div>
                            </div>
                            <div class="u-time">发布于：{{ showTime(new Date(post?.post_date)) }}</div>
                        </div>
                    </div>
                    <div id="pvpArticle">
                        <div class="m-pvp__item m-talent" v-if="Object.keys(talent).length">
                            <div class="u-pvp__title">
                                <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_qx.svg" alt="" />
                                <span>奇穴 · {{ talent.xf }}</span>
                            </div>
                            <div class="m-pvp__content">
                                <div class="m-talent-box-qqrobot" :class="`m-qx-container-${data?.ID}`"></div>
                                <div class="m-desc" v-if="data?.post_meta?.talent_desc">
                                    <div class="u-sub-title">奇穴讲解</div>
                                    <span class="u-desc" v-html="nl2br(data?.post_meta?.talent_desc)"></span>
                                </div>
                            </div>
                        </div>

                        <div class="m-skills">
                            <div class="m-pvp__item m-skill-item" v-for="(item, i) in skills" :key="i">
                                <div class="u-pvp__title">
                                    <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_lz.svg" alt="" />
                                    <span>连招{{ i + 1 }}：{{ item.name }}</span>
                                </div>
                                <div class="m-pvp__content is-normal">
                                    <div class="u-skills" v-if="item.sq">
                                        <span
                                            v-for="(skill, index) in item.sq"
                                            :key="skill.SkillID + '' + index"
                                            class="u-skill"
                                        >
                                            <img
                                                class="u-skill-icon"
                                                :src="iconLink(skill.IconID)"
                                                :alt="skill.IconID"
                                                :title="skill.Name"
                                            />
                                            <span class="u-skill-name">{{ skill.Name }}</span>
                                            <i class="u-gcd-icon" v-show="skill.WithoutGcd" title="无GCD技能">
                                                <el-icon><Clock /></el-icon>
                                            </i>
                                        </span>
                                    </div>
                                    <div class="m-desc" v-if="data?.post_meta?.talent_desc && item.desc">
                                        <div class="u-sub-title">连招说明</div>
                                        <span class="u-desc" v-html="item.desc"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="m-single-null" v-else>
                    <el-alert :title="null_tip" type="warning" :closable="false"></el-alert>
                </div>
            </div>
            <QQBottom :type="post_type" :id="sourceId"></QQBottom>
        </div>
    </div>
</template>

<script>
import { showAvatar, authorLink, iconLink, getAppIcon, getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { showTime } from "@jx3box/jx3box-common/js/moment";
import { getPost, getUserInfo, isSuperAuthor } from "@/service/qqbot";
import { getStat, postStat } from "@jx3box/jx3box-common/js/stat";
import JX3BOX from "@/utils/config";
import xfmap from "@jx3box/jx3box-data/data/xf/xf.json";
import zlp from "@jx3box/jx3box-common/data/jx3_zlp.json";
const appKey = "pvp";

import User from "@jx3box/jx3box-common/js/user";

// 奇穴
import JX3_QIXUE from "@jx3box/jx3box-talent";
import "@jx3box/jx3box-talent/talent.css";
import QQBottom from "./components/Bottom.vue";

export default {
    name: "PvpSingle",
    props: ["sourceId"],
    components: { QQBottom },
    data() {
        return {
            post: {},
            stat: {},
            loading: false,
            talentDriver: null,
            authors: [],
            directory: false,
            zlpList: zlp.all_map,

            imageCount: 0,
            loadedImageCount: 0,
            images: [],
            imagesLoaded: false,
        };
    },
    computed: {
        id() {
            return this.sourceId || this.$route.query.id;
        },
        post_type: function () {
            return this.post?.post_type;
        },
        post_title: function () {
            return this.post?.post_title;
        },
        post_content: function () {
            return this.post?.post_content;
        },
        author_id: function () {
            return this.post?.post_author;
        },
        post_subtype: function () {
            return this?.post?.post_subtype || "其它";
        },
        xf: function () {
            return this.post?.post_subtype;
        },
        xficon_id: function () {
            return this.xf && xfmap[this.xf]?.id;
        },
        zlp: function () {
            return this.post?.zlp || "未知";
        },
        data() {
            return this.post;
        },
        talent() {
            try {
                return JSON.parse(this.data?.post_meta?.talent);
            } catch (e) {
                return {};
            }
        },
        skills() {
            return this.data?.post_meta?.data;
        },
        visible: function () {
            return !!this.post?._check;
        },
        null_tip: function () {
            let str = "作者设置了【";
            str += JX3BOX.__visibleMap[this.post?.visible];
            str += "】";
            return str;
        },
        post_client: function () {
            return this.post?.client || "all";
        },
    },
    mounted() {
        this.loadData();
    },
    methods: {
        showTime,
        showAvatar(val) {
            return showAvatar(val, 88 * 3);
        },
        imgLink({ zlp }) {
            zlp = this.zlpList.find((item) => item.label === zlp)?.value || "other";
            return getThumbnail(`${JX3BOX.__imgPath}image/zlp/${zlp}.png`, [180, 86]);
        },
        authorLink,
        iconLink,
        getAppIcon,
        nl2br(str) {
            return str && str.replace(/\n/g, "<br/>");
        },
        initImageLoader() {
            // 在DOM更新后获取所有图片
            this.$nextTick(() => {
                const container = document.getElementById("pvpArticle");
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
            Array.from(images).forEach((img) => {
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
                    console.log(totalProcessed);

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
        checkImageLoadCompletion(images) {
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
        async loadData() {
            if (!this.id) {
                return;
            }
            this.loading = true;
            await getPost(this.id)
                .then((res) => {
                    this.post = res.data.data;

                    document.title = this.post?.post_title;
                    if (this.post?.post_author) {
                        getUserInfo(this.post.post_author).then((res) => {
                            if (res.data?.data) {
                                this.post.author_info = res.data.data;
                                this.post.level = User.getLevel(this.post.author_info?.experience || 0);
                            }
                        });
                        isSuperAuthor(this.post.post_author).then((res) => {
                            this.post.author_info.is_super_author = !!res.data?.data;
                        });
                    }
                    this.$nextTick(() => {
                        if (this.visible) this.installTalent();
                    });
                })
                .finally(() => {
                    this.loading = false;
                });

            await getStat(appKey, this.id).then((res) => {
                this.stat = res.data;
            });
            await postStat(appKey, this.id);

            // 请注意，为防止QQBOT无法抓取完全，请不要删除
            // 数据加载后启动奇遇流程中的图片检测
            this.initImageLoader();
        },
        installTalent() {
            if (!this.visible) return;
            if (!Object.keys(this.talent || {}).length) return;

            const containerSelector = `.m-qx-container-${this.data?.ID}`;
            if (!this.data?.ID || !document.querySelector(containerSelector)) return;

            this.talentDriver = new JX3_QIXUE({
                container: containerSelector,
                version: this.talent.version,
                xf: this.talent.xf,
                editable: false,
                sq: this.talent.sq,
                client: this.talent.client || "std",
            });
        },
        xficon: function (val) {
            return JX3BOX.__imgPath + "image/xf/" + val + ".png";
        },
        updateDirectory: function (val) {
            this.directory = val;
        },
    },
    watch: {
        community_id: {
            immediate: true,
            handler(val) {
                if (val && val != 0) {
                    // 防止死循环
                    if (location.href.includes(`/community/${val}`)) {
                        return;
                    }
                    location.href = `/community/${val}`;
                }
            },
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/qqbot/single_robot.less";
</style>
