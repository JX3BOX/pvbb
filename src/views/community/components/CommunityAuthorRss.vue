<template>
    <el-button
        class="u-btn c-author-rss"
        :class="{ 'u-fans-box': isSelf, 'is-subscribed': subscribed }"
        size="small"
        plain
        :loading="loading"
        :disabled="isSelf"
        @click="subscribe"
    >
        <img class="u-icon" svg-inline src="@jx3box/jx3box-ui/assets/img/author/rss.svg" />
        {{ btnText }}
    </el-button>
</template>

<script>
import { subscribeAuthor, unsubscribeAuthor } from "@jx3box/jx3box-common/js/rss";
import User from "@jx3box/jx3box-common/js/user";
import i18nMixin from "@jx3box/jx3box-ui/i18n/mixin";
import bus from "@/utils/bus";
import {
    getCommunityAuthorRss,
    clearCommunityAuthorRss,
    getCommunityViewerIdentity,
} from "@/service/community-author";

const RSS_STATE_CHANGE_EVENT = "community-author-rss-state-change";

export default {
    name: "CommunityAuthorRss",
    mixins: [i18nMixin],
    props: {
        uid: {
            type: [Number, String],
            default: 0,
        },
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            subscribed: false,
            rssLoading: false,
            submitting: false,
            rssRequestVersion: 0,
        };
    },
    computed: {
        loading() {
            return this.rssLoading || this.submitting;
        },
        isSelf() {
            return this.uid == User.getInfo().uid;
        },
        btnText() {
            return this.subscribed
                ? this.$jx3boxT("jx3boxUi.authorRss.followed", "已关注")
                : this.$jx3boxT("jx3boxUi.authorRss.follow", "关注");
        },
    },
    watch: {
        uid: {
            immediate: true,
            handler(uid) {
                ++this.rssRequestVersion;
                this.rssLoading = false;
                this.subscribed = false;
                if (uid) this.loadRss();
            },
        },
    },
    mounted() {
        bus.on(RSS_STATE_CHANGE_EVENT, this.syncRssState);
    },
    beforeUnmount() {
        ++this.rssRequestVersion;
        bus.off(RSS_STATE_CHANGE_EVENT, this.syncRssState);
    },
    methods: {
        loadRss() {
            const uid = String(this.uid);
            const viewerIdentity = getCommunityViewerIdentity();
            const requestVersion = ++this.rssRequestVersion;
            this.rssLoading = true;
            getCommunityAuthorRss(this.uid)
                .then((res) => {
                    if (
                        requestVersion !== this.rssRequestVersion ||
                        uid !== String(this.uid) ||
                        viewerIdentity !== getCommunityViewerIdentity()
                    ) {
                        return;
                    }
                    this.subscribed = !!res?.data?.data?.subscribed;
                })
                .catch(() => {})
                .finally(() => {
                    if (requestVersion === this.rssRequestVersion) {
                        this.rssLoading = false;
                    }
                });
        },
        syncRssState({ uid, viewerIdentity, subscribed } = {}) {
            if (
                String(uid) !== String(this.uid) ||
                viewerIdentity !== getCommunityViewerIdentity()
            ) {
                return;
            }

            // 关注操作完成后，以写操作结果为准，废弃可能仍在途中的旧概览请求。
            ++this.rssRequestVersion;
            this.rssLoading = false;
            this.subscribed = !!subscribed;
        },
        subscribe() {
            if (!User.isLogin()) {
                User.toLogin();
                return;
            }
            if (this.loading) return;

            const uid = this.uid;
            const viewerIdentity = getCommunityViewerIdentity();
            const nextSubscribed = !this.subscribed;

            this.submitting = true;
            Promise.resolve()
                .then(() =>
                    nextSubscribed
                        ? subscribeAuthor({ id: uid, data: { title: this.data?.display_name } })
                        : unsubscribeAuthor({ id: uid })
                )
                .then(() => {
                    clearCommunityAuthorRss(uid, viewerIdentity);
                    bus.emit(RSS_STATE_CHANGE_EVENT, {
                        uid,
                        viewerIdentity,
                        subscribed: nextSubscribed,
                    });
                    this.$message.success(this.$jx3boxT("jx3boxUi.authorRss.success", "操作成功"));
                })
                .catch((error) => {
                    this.$message({
                        message: error?.response?.data?.msg || error?.message || "操作失败，请稍后再试",
                        type: "error",
                    });
                })
                .finally(() => {
                    this.submitting = false;
                });
        },
    },
};
</script>

<style lang="less">
.c-author-rss.el-button {
    cursor: default;
    transition: all 0.18s ease;
    &:hover,
    &.is-plain:hover,
    &.is-plain:focus {
        cursor: pointer;
        background-color: rgba(255, 51, 153, 0.08);
        color: @v4primary;
        border-color: fade(@v4primary, 36%);
        box-shadow: 0 6px 14px rgba(255, 51, 153, 0.1);
    }
    .u-icon {
        .size(11px);
        fill: currentColor;
        margin-right: 4px;
    }
}
</style>
