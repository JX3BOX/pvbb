<template>
    <div class="m-common-author">
        <button class="m-common-author-main" type="button" @click="openAuthor">
            <div class="u-avatar-wrap">
                <img class="u-avatar" :src="authorAvatar" alt="avatar" />
                <img v-if="authorAvatarFrame" class="u-avatar-frame" :src="authorAvatarFrame" alt="frame" />
            </div>
            <div class="m-author-text">
                <div class="u-name-row">
                    <div class="u-name">{{ authorName }}</div>
                    <img v-if="isSuperAuthor" class="u-sign" :src="signAuthorIcon" alt="sign" />
                </div>
                <div class="u-time">{{ date }}</div>
            </div>
        </button>

        <button class="u-follow" :class="{ 'is-followed': isFollowed }" type="button" @click="toggleFollow">
            {{ isFollowed ? "已关注" : "关注" }}
        </button>
    </div>
</template>

<script>
import jx3box from "@jx3box/jx3box-common/data/jx3box.json";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import { subscribeAuthor, unsubscribeAuthor } from "@jx3box/jx3box-common/js/rss";
import User from "@jx3box/jx3box-common/js/user";
import { getFans } from "@/service/next";
import signAuthorIcon from "@/assets/img/publish/sign-author.svg";

const { __imgPath, default_avatar: DEFAULT_AVATAR } = jx3box;

export default {
    name: "CommonAuthor",
    props: {
        uid: {
            type: [Number, String],
            default: 0,
        },
        author: {
            type: Object,
            default: () => ({}),
        },
        date: {
            type: String,
            default: "",
        },
        title: {
            type: String,
            default: "",
        },
    },
    emits: ["open-author"],
    data() {
        return {
            isFollowed: false,
            signAuthorIcon,
        };
    },
    computed: {
        authorId() {
            return Number(
                this.uid || this.author?.id || this.author?.ID || this.author?.uid || this.author?.author_id || 0
            );
        },
        authorName() {
            return this.author?.display_name || this.author?.name || "匿名";
        },
        authorAvatar() {
            return showAvatar(this.author?.user_avatar || this.author?.avatar || DEFAULT_AVATAR);
        },
        authorAvatarFrame() {
            const frame = this.author?.user_avatar_frame || this.author?.avatar_frame || "";
            if (!frame) return "";
            if (/^https?:\/\//i.test(frame)) return frame;
            return `${__imgPath}avatar/images/${frame}/${frame}.svg`;
        },
        isSuperAuthor() {
            return !!this.author?.sign;
        },
    },
    watch: {
        authorId: {
            handler() {
                this.syncFollowState();
            },
            immediate: true,
        },
    },
    methods: {
        ensureLogin() {
            if (User.isLogin()) return true;

            this.$message({
                message: "请先登录",
                type: "warning",
            });
            return false;
        },
        openAuthor() {
            if (!this.authorId) return;
            location.href = `/author/${this.authorId}`;
            // this.$emit("open-author", this.authorId);
        },
        async syncFollowState() {
            if (!this.authorId) {
                this.isFollowed = false;
                return;
            }

            try {
                const res = await getFans(this.authorId);
                this.isFollowed = !!res?.data?.data?.subscribed;
            } catch (e) {
                this.isFollowed = false;
            }
        },
        async toggleFollow() {
            if (!this.ensureLogin() || !this.authorId) return;

            try {
                if (this.isFollowed) {
                    await unsubscribeAuthor({ id: this.authorId });
                    this.isFollowed = false;
                    return;
                }

                await subscribeAuthor({ id: this.authorId, title: this.title });
                this.isFollowed = true;
            } catch (e) {
                this.$message({
                    message: e?.response?.data?.msg || e?.message || "操作失败，请稍后再试",
                    type: "error",
                });
            }
        },
    },
};
</script>

<style lang="less">
.m-common-author {
    display: flex;
    align-items: center;
    gap: 0.44rem;
    min-width: 0;
    padding: 1.11rem;
    border-radius: 28px;
    background: #fff;
    border: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);

    html.dark & {
        background: #20232b;
        border-color: transparent;
        box-shadow: none;
    }

    @media (prefers-color-scheme: dark) {
        background: #20232b;
        border-color: transparent;
        box-shadow: none;
    }

    .m-common-author-main {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 0.56rem;
        padding: 0;
        border: none;
        background: transparent;
        text-align: left;
    }

    .u-avatar-wrap {
        position: relative;
        width: 2.78rem;
        height: 2.78rem;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .u-avatar {
        width: 2.17rem;
        height: 2.17rem;
        border-radius: 999px;
        object-fit: cover;
        flex-shrink: 0;
    }

    .u-avatar-frame {
        position: absolute;
        inset: 0;
        width: 2.78rem;
        height: 2.78rem;
        pointer-events: none;
    }

    .m-author-text {
        min-width: 0;
    }

    .u-name-row {
        display: flex;
        align-items: center;
        min-width: 0;
    }

    .u-name {
        max-width: 100%;
        overflow: hidden;
        color: #0f172a;
        font-size: 0.89rem;
        font-weight: 700;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;

        html.dark & {
            color: #f8fafc;
        }

        @media (prefers-color-scheme: dark) {
            color: #f8fafc;
        }
    }

    .u-sign {
        width: 0.85rem;
        height: 0.85rem;
        margin-left: 0.22rem;
        flex-shrink: 0;
    }

    .u-time {
        margin-top: 0.17rem;
        color: #64748b;
        font-size: 0.72rem;
        line-height: 1.35;

        html.dark & {
            color: rgba(255, 255, 255, 0.42);
        }

        @media (prefers-color-scheme: dark) {
            color: rgba(255, 255, 255, 0.42);
        }
    }

    .u-follow {
        min-width: 4rem;
        height: 1.78rem;
        padding: 0 0.67rem;
        border: none;
        border-radius: 999px;
        background: var(--primary-brand-2, #24292e);
        color: var(--primary-brand-3, #fedaa3);
        font-size: 0.72rem;
        font-weight: 600;
        flex-shrink: 0;

        html.dark & {
            background: #fedaa3;
            color: #111827;
        }

        @media (prefers-color-scheme: dark) {
            background: #fedaa3;
            color: #111827;
        }

        &.is-followed {
            opacity: 0.58;
        }
    }
}
</style>
