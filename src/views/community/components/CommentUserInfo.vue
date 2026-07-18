<template>
    <div class="c-author-info">
        <div class="u-author">
            <Avatar
                class="u-avatar"
                :uid="anonymous ? 0 : uid"
                :url="anonymous ? anonymousAvatar : resolveImagePath(data.user_avatar)"
                size="s"
                :frame="anonymous ? '' : data.user_avatar_frame"
            />
            <div class="u-info">
                <div class="u-name">
                    <el-tooltip
                        class="item"
                        effect="dark"
                        :content="$t('pages.community.single.contractedAuthor')"
                        placement="top"
                        v-if="!anonymous && isSuperAuthor"
                    >
                        <a class="u-superauthor" href="/about/superauthor" target="_blank">
                            <img :src="super_author_icon" :alt="$t('pages.community.single.contractedAuthor')" />
                        </a>
                    </el-tooltip>
                    <a class="u-displayname" :href="authorLink(uid)" target="_blank" v-if="!anonymous">
                        {{ data.display_name || $t("pages.community.common.unknownUser") }}
                    </a>
                    <span class="u-displayname u-anonymous" v-else>{{
                        $t("pages.community.single.mysteriousUser")
                    }}</span>
                </div>
                <div class="u-extend" v-if="!anonymous">
                    <el-tooltip class="item" effect="dark" placement="top">
                        <template #content>
                            <span class="u-tips">{{
                                $t("pages.community.single.experience", { value: data.experience })
                            }}</span>
                        </template>
                        <a
                            class="u-level"
                            :class="'lv-' + level"
                            :style="{ backgroundColor: showLevelColor(level) }"
                            href="/about/incentives"
                            target="_blank"
                            >Lv.{{ level }}</a
                        >
                    </el-tooltip>
                    <el-tooltip
                        class="item"
                        effect="dark"
                        :content="vipTypeTitle"
                        placement="top"
                        v-if="isVip"
                    >
                        <a class="u-vip" href="/vip/premium?from=sidebar_author" target="_blank">
                            <i class="i-icon-vip on">{{ vipType }}</i>
                        </a>
                    </el-tooltip>
                </div>
            </div>
        </div>
        <Honor v-if="!anonymous && honor" :honor="honor"></Honor>
        <div class="u-bio" v-if="!anonymous && data.user_bio">{{ data.user_bio }}</div>
    </div>
</template>

<script>
import jx3box from "@jx3box/jx3box-common/data/jx3box.json";
const { __imgPath, __userLevelColor, default_avatar: DEFAULT_AVATAR } = jx3box;
import { authorLink, resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { getCommunityUserInfo } from "@/service/community-author";
import Avatar from "@jx3box/jx3box-ui/src/author/Avatar.vue";
import Honor from "@jx3box/jx3box-ui/src/author/AuthorHonor.vue";
export default {
    name: "AuthorInfo",
    props: {
        uid: [Number, String],
        isAnonymous: [Boolean, Number, String],
        honor: {
            type: Object,
            default: null,
        },
    },
    components: {
        Avatar,
        Honor,
    },
    data: function () {
        return {
            data: {},
            isVIP: false,
            super_author_icon: __imgPath + "image/user/" + "superauthor.svg",
            anonymousAvatar: DEFAULT_AVATAR,
            userRequestVersion: 0,
        };
    },
    computed: {
        anonymous: function () {
            if (typeof this.isAnonymous === "string") {
                return !["", "0", "false", "null", "undefined"].includes(this.isAnonymous.toLowerCase());
            }
            return Boolean(this.isAnonymous);
        },
        identityKey: function () {
            return `${this.uid || 0}:${this.anonymous ? 1 : 0}`;
        },
        // level
        level: function () {
            return User.getLevel(this.data?.experience);
        },

        // vip
        vipType: function () {
            return this.data?.is_pro ? "PRO" : "PRE";
        },
        vipTypeTitle: function () {
            return this.data?.is_pro
                ? this.$t("pages.community.single.proMembership")
                : this.$t("pages.community.single.premiumMembership");
        },
        isVip: function () {
            return this.data?.is_pro || this.data?.is_pre;
        },

        // sign
        isSuperAuthor: function () {
            return !this.anonymous && this.data?.sign;
        },
    },
    watch: {
        identityKey: {
            immediate: true,
            handler: function () {
                this.loadData();
            },
        },
    },
    methods: {
        loadData: function () {
            const requestVersion = ++this.userRequestVersion;
            const uid = this.uid;
            this.data = {};
            if (!uid || this.anonymous) return Promise.resolve();

            return getCommunityUserInfo(uid)
                .then((data) => {
                    if (
                        requestVersion !== this.userRequestVersion ||
                        this.anonymous ||
                        String(uid) !== String(this.uid)
                    )
                        return;
                    if (data) {
                        this.data = data;
                        this.$emit("ready", this.data);
                    }
                })
                .catch(() => {});
        },
        authorLink,
        resolveImagePath,
        showLevelColor: function (level) {
            return __userLevelColor[level];
        },
    },
    created: function () {},
    mounted: function () {},
};
</script>

<style lang="less">
.c-author-info {
    .u-author {
        .clearfix;
        .db;
        .mb(10px);
        .pr;
    }
    .u-avatar {
        .fl;
        .mr(15px);
        .size(68px);
    }
    .u-name {
        .flex;
        align-items: center;
    }
    .u-displayname {
        .lh(2.2);
        .bold;
        color: #24292e;
        .nobreak;
        &:hover {
            color: @pink;
        }
    }
    .u-anonymous {
        color: #888;
        &:hover {
            color: #888;
        }
    }
    .u-superauthor {
        // margin-left: 4px;
        // display: inline-block;
        // vertical-align: -2px;
        .fz(12px);
        flex-shrink: 0;
        img {
            .size(16px);
        }
    }

    .u-info {
        .pr;
        top: -4px;
        .h(68px);
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .u-bio {
        .fz(12px, 2);
        .break(4);
        color: #888;
        padding: 0 5px;
        white-space: pre-line;
    }
    .u-extend {
        display: flex;
        align-items: center;
    }
    .u-level {
        padding: 2px 8px;
        .fz(12px, 14px);
        color: #fff;
        background-color: #aaa;
        border-radius: 2px;

        &.lv-1 {
            background-color: #32d3c4;
        }
        &.lv-2 {
            background-color: #86c0fb;
        }
        &.lv-3 {
            background-color: #33d9ff;
        }
        &.lv-4 {
            background-color: #ffdb2a;
        }
        &.lv-5 {
            background-color: #ffa739;
        }
        &.lv-6 {
            background-color: #ff70b2;
        }
        &.lv-7 {
            background-color: #ff3399;
        }
        &.lv-8 {
            background-color: #f93c3c;
        }
    }
    .u-vip {
        .ml(5px);
        .i-icon-vip {
            .db;
            padding: 2px 6px;
            .fz(12px, 14px);
            font-style: normal;
            border-radius: 2px;
            background-color: #ddd;
            color: #fff;
            &.on {
                background-color: #6f42c1;
            }
        }
    }
    .u-honor {
        .dbi;
        text-align: center;
        .mb(10px);
        .size(220px,45px);
        // background-color: #494038;
        color: #ffffff;
        .fz(10px,45px);
        .r(2px);
    }
}
</style>
