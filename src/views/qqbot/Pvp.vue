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
                                    v-if="post.include_video"
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
                                <div v-if="post?.author_info?.is_super_author" class="u-info-tag u-super">签约作者</div>
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
                                    <div class="m-desc" v-if="item.desc">
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
            <QQBottom :type="post_type" :id="id"></QQBottom>
        </div>
    </div>
</template>

<script>
import { showAvatar, authorLink, iconLink, getAppIcon, getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { showTime } from "@jx3box/jx3box-common/js/moment";
import { getPost, getUserInfo, isSuperAuthor } from "@/service/qqbot";
import { getStat, postStat } from "@jx3box/jx3box-common/js/stat";
import JX3BOX from "@/utils/config";
import { markQQBotReady, resetQQBotReady, setQQBotDataReady } from "@/utils/qqbot-ready";
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

            imagesLoaded: false,
            loadRequestId: 0,
            loadError: "",
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
            return this.data?.post_meta?.data || [];
        },
        visible: function () {
            return !!this.post?._check;
        },
        null_tip: function () {
            if (this.loadError) return this.loadError;
            if (!this.id) return "缺少攻略 ID";
            let str = "作者设置了【";
            str += JX3BOX.__visibleMap[this.post?.visible] || "不可见";
            str += "】";
            return str;
        },
        post_client: function () {
            return this.post?.client || "all";
        },
    },
    beforeUnmount() {
        this.loadRequestId += 1;
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
        initImageLoader(requestId) {
            this.$nextTick(() => {
                if (requestId !== this.loadRequestId) return;
                this.setGlobalReady(requestId);
            });
        },

        // 设置全局就绪状态
        setGlobalReady(requestId) {
            if (requestId !== this.loadRequestId) return;
            if (this.imagesLoaded) return; // 避免重复设置

            this.imagesLoaded = true;
            markQQBotReady({ root: this.$el });
        },
        async loadData() {
            const requestId = ++this.loadRequestId;
            resetQQBotReady();
            this.imagesLoaded = false;
            this.loadError = "";
            this.post = {};
            this.stat = {};
            this.talentDriver = null;
            this.loading = true;
            const id = this.id;
            const authorTasks = [];
            try {
                if (!id) {
                    this.loadError = "缺少攻略 ID";
                    return;
                }

                const res = await getPost(id);
                if (requestId !== this.loadRequestId) return;
                this.post = res.data?.data || {};
                if (!this.post?.ID) this.loadError = "未找到对应攻略";

                if (this.post?.post_title) document.title = this.post.post_title;
                if (this.post?.post_author) {
                    const authorId = this.post.post_author;
                    authorTasks.push(
                        getUserInfo(authorId).then((authorRes) => {
                            if (requestId !== this.loadRequestId || !authorRes.data?.data) return;
                            this.post.author_info = {
                                ...(this.post.author_info || {}),
                                ...authorRes.data.data,
                            };
                            this.post.level = User.getLevel(this.post.author_info?.experience || 0);
                        })
                    );
                    authorTasks.push(
                        isSuperAuthor(authorId).then((authorRes) => {
                            if (requestId !== this.loadRequestId) return;
                            this.post.author_info = {
                                ...(this.post.author_info || {}),
                                is_super_author: !!authorRes.data?.data,
                            };
                        })
                    );
                }

                await Promise.allSettled([
                    getStat(appKey, id).then((statRes) => {
                        if (requestId === this.loadRequestId) this.stat = statRes.data;
                    }),
                    ...authorTasks,
                    postStat(appKey, id),
                ]);
                if (requestId !== this.loadRequestId) return;
                await this.$nextTick();
                if (this.visible) await this.installTalent(requestId);
            } catch (error) {
                if (requestId === this.loadRequestId) {
                    this.post = {};
                    this.loadError = "攻略加载失败，请稍后再试";
                }
            } finally {
                if (requestId === this.loadRequestId) {
                    this.loading = false;
                    setQQBotDataReady(true);

                    // 请注意，为防止QQBOT无法抓取完全，请不要删除
                    // 数据加载后启动图片检测
                    this.initImageLoader(requestId);
                }
            }
        },
        async installTalent(requestId) {
            if (!this.visible) return;
            if (!Object.keys(this.talent || {}).length) return;

            const containerSelector = `.m-qx-container-${this.data?.ID}`;
            if (!this.data?.ID || !document.querySelector(containerSelector)) return;

            try {
                const driver = await new JX3_QIXUE({
                    container: containerSelector,
                    version: this.talent.version,
                    xf: this.talent.xf,
                    editable: false,
                    sq: this.talent.sq,
                    client: this.talent.client || "std",
                });
                if (requestId === this.loadRequestId) this.talentDriver = driver;
            } catch (error) {
                if (requestId === this.loadRequestId) this.talentDriver = null;
            }
        },
        xficon: function (val) {
            return JX3BOX.__imgPath + "image/xf/" + val + ".png";
        },
        updateDirectory: function (val) {
            this.directory = val;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler() {
                this.loadData();
            },
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/qqbot/single_robot.less";
</style>
