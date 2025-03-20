<template>
    <div class="m-comment-user c-author m-theme" :style="{ backgroundImage: `url(${bg})` }">
        <AuthorInfo :uid="uid" @ready="installModules" />
        <template v-if="data">
            <div class="u-interact">
                <AuthorFollow v-if="!isMaster" style="margin-right: 8px" :uid="uid" />
                <AuthorRss v-else style="margin-right: 8px" :uid="uid" />
                <el-button icon="el-icon-message" class="u-btn" size="mini" @click="onMessage">私信</el-button>
            </div>
            <AuthorMedals class="u-block u-trophy" :uid="uid" />
            <slot></slot>
        </template>

        <AuthorCommunity v-if="isMaster" :uid="uid"></AuthorCommunity>
    </div>
</template>

<script>
import AuthorInfo from "@jx3box/jx3box-common-ui/src/author/AuthorInfo.vue";
import AuthorFollow from "@jx3box/jx3box-common-ui/src/author/AuthorFollow.vue";
import AuthorMedals from "@jx3box/jx3box-common-ui/src/author/AuthorMedals.vue";
import AuthorRss from "@jx3box/jx3box-common-ui/src/author/AuthorRss.vue";
import AuthorCommunity from "./author_community.vue";

import { getDecoration } from "@/service/cms";
import { __cdn } from "@jx3box/jx3box-common/data/jx3box.json";
const DECORATION_SIDEBAR = "decoration_sidebar";
export default {
    props: ["uid", "isMaster"],
    data: function () {
        return {
            data: "",

            bg: "",
            user_id: "",
        };
    },
    watch: {
        uid: {
            handler: function () {
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key && key.startsWith("honor_img")) {
                        sessionStorage.removeItem(key);
                        i--;
                    }
                }
                this.user_id = this.uid;
                this.getDecoration();
            },
            immediate: true,
        }
    },
    methods: {
        installModules: function (data) {
            this.data = data;
        },
        onMessage: function () {
            window.open("/dashboard/letter?receiver=" + this.uid, "_blank");
        },
        showDecoration: function (val, type) {
            return __cdn + `design/decoration/images/${val}/${type}.png`;
        },
        getDecoration() {
            if (!this.user_id) {
                return;
            }
            let decoration_sidebar = sessionStorage.getItem(DECORATION_SIDEBAR + this.user_id) || "";
            if (decoration_sidebar == "no") return;
            //已有缓存，读取解析
            try {
                let sidebar = JSON.parse(decoration_sidebar);
                this.bg = this.showDecoration(sidebar.val, "sidebar");
            } catch (err) {
                getDecoration({ using: 1, user_id: this.user_id, type: "sidebar" }).then((data) => {
                    let res = data.data.data || [];
                    if (res.length == 0) {
                        //空 则为无主题，不再加载接口，界面设No
                        sessionStorage.setItem(DECORATION_SIDEBAR + this.user_id, "no");
                        return;
                    }
                    let sidebar = res[0];
                    this.bg = this.showDecoration(sidebar.val, "sidebar");
                    sessionStorage.setItem(DECORATION_SIDEBAR + this.user_id, JSON.stringify(sidebar));
                });
            }
        },
    },
    components: {
        AuthorInfo,
        AuthorFollow,
        AuthorMedals,
        AuthorRss,
        AuthorCommunity,
    },
};
</script>

<style lang="less">
.m-comment-user {
    position: sticky;
    top: 110px;
}

@media screen and (max-width: @ipad) {
    .m-comment-user {
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
