<template>
    <div class="m-comment-user c-author m-theme" :style="decorationStyles">
        <CommentUserInfo
            :uid="uid"
            :honor="activeHonor"
            @ready="installModules"
            :isAnonymous="anonymous"
        />
        <template v-if="data && !anonymous">
            <div class="u-interact">
                <CommunityAuthorRss :uid="uid" :data="data" />
                <el-button icon="Message" class="u-btn" size="small" @click="onMessage">{{
                    $t("pages.community.reply.privateMessage")
                }}</el-button>
            </div>
            <AuthorMedals class="u-block u-trophy" :medals="activeMedals" />
            <slot></slot>
        </template>

        <AuthorCommunity v-if="isMaster && !anonymous" :uid="uid"></AuthorCommunity>
    </div>
</template>

<script>
import CommentUserInfo from "./CommentUserInfo.vue";
import AuthorMedals from "@jx3box/jx3box-ui/src/author/AuthorMedals.vue";
import CommunityAuthorRss from "./CommunityAuthorRss.vue";
import AuthorCommunity from "./AuthorCommunity.vue";
import "@jx3box/jx3box-ui/assets/css/single/author.less";

import { getCommunityUserSkin } from "@/service/community-author";
import { __cdn } from "@/utils/config";
import User from "@jx3box/jx3box-common/js/user";
const SKIN_POSITION_MAP = {
    lt: "left top",
    ct: "center top",
    mt: "center top",
    rt: "right top",
    lc: "left center",
    ml: "left center",
    cc: "center center",
    cm: "center center",
    mm: "center center",
    o: "center center",
    rc: "right center",
    mr: "right center",
    lb: "left bottom",
    cb: "center bottom",
    mb: "center bottom",
    rb: "right bottom",
};
export default {
    props: ["uid", "isMaster", "isAnonymous"],
    data: function () {
        return {
            data: "",

            sidebarSkin: "",
            sidebarSkinPosition: "",
            activeHonor: null,
            activeMedals: [],
            skinRequestVersion: 0,
        };
    },
    computed: {
        anonymous() {
            if (typeof this.isAnonymous === "string") {
                return !["", "0", "false", "null", "undefined"].includes(this.isAnonymous.toLowerCase());
            }
            return Boolean(this.isAnonymous);
        },
        identityKey() {
            return `${this.uid || 0}:${this.anonymous ? 1 : 0}`;
        },
        decorationStyles() {
            return this.sidebarSkin
                ? {
                      backgroundImage: `url(${this.sidebarSkin})`,
                      backgroundPosition: this.sidebarSkinPosition,
                  }
                : null;
        },
    },
    watch: {
        identityKey: {
            handler: function () {
                this.loadUserSkin();
            },
            immediate: true,
        },
    },
    methods: {
        installModules: function (data) {
            if (this.anonymous) {
                this.data = "";
                return;
            }
            this.data = data;
        },
        onMessage: function () {
            if (!User.isLogin()) {
                this.$message.warning(this.$t("pages.community.messages.loginRequired"));
                return;
            }
            window.open("/dashboard/letter?receiver=" + this.uid, "_blank");
        },
        resolveSkinDetail(record) {
            const skins = Array.isArray(record?.skins) ? record.skins : [];
            return skins.find((item) => item?.subtype === "pc_sidebar" && item.image) || null;
        },
        normalizeSkinImage(image) {
            const url = String(image || "").trim();
            if (!url) return "";
            return /^(https?:)?\/\//.test(url) ? url : __cdn + url.replace(/^\/+/, "");
        },
        loadUserSkin() {
            const requestVersion = ++this.skinRequestVersion;
            this.sidebarSkin = "";
            this.sidebarSkinPosition = "";
            this.activeHonor = null;
            this.activeMedals = [];
            this.data = "";
            if (!this.uid || this.anonymous) return;

            const uid = this.uid;

            return getCommunityUserSkin(uid)
                .then((res) => {
                    if (
                        requestVersion !== this.skinRequestVersion ||
                        this.anonymous ||
                        String(uid) !== String(this.uid)
                    )
                        return;
                    const records = res.data.data || [];
                    this.activeHonor = records.find((item) => item?.type === "honor")?.honor || null;
                    this.activeMedals = records.find((item) => item?.type === "medals")?.medals || [];
                    const detail = records.map(this.resolveSkinDetail).find(Boolean);
                    this.sidebarSkin = this.normalizeSkinImage(detail?.image);
                    this.sidebarSkinPosition = SKIN_POSITION_MAP[detail?.position] || detail?.position || "";
                })
                .catch(() => {});
        },
    },
    components: {
        CommentUserInfo,
        AuthorMedals,
        CommunityAuthorRss,
        AuthorCommunity,
    },
};
</script>

<style lang="less">
.m-comment-user {
    position: sticky;
    top: 108px;
    box-sizing: content-box;
}

@media screen and (max-width: @ipad) {
    .m-comment-user {
        box-sizing: content-box;
        position: unset;
        .c-author-honor,
        .u-bio,
        .c-author-medals,
        .u-interact {
            display: none;
        }
        .u-info {
            height: 48px;
        }
        .c-avatar.s {
            .c-avatar-pic {
                width: 48px;
                height: 48px;
            }
            .c-avatar-frame {
                width: 58px;
                height: 58px;
                left: 40px;
                top: 40px;
            }
        }

        .u-avatar {
            width: 48px;
            height: 48px;
        }
    }
}
</style>
