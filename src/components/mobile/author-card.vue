<template>
    <div class="m-author-card">
        <div class="u-title">关于作者</div>
        <div class="u-img-bg">
            <img :src="showAvatar(author?.user_avatar, 335)" />
        </div>
        <div class="m-author-box">
            <div class="u-info-box">
                <div class="u-author">
                    <div class="u-author_name">{{ author?.display_name }}</div>
                    <div class="u-author_fans">{{ fans }}个粉丝</div>
                </div>
                <template v-if="isLogin">
                    <div class="u-follow" @click="follow" v-if="!subscribed">关注TA</div>
                    <div class="u-follow" @click="unfollow" v-else>取消关注</div>
                </template>
            </div>
            <div class="u-author_introduce" v-if="userInfo?.user_bio">{{ userInfo?.user_bio }}</div>
        </div>
    </div>
</template>

<script>
import { showAvatar } from "@jx3box/jx3box-common/js/utils.js";
import { subscribeAuthor, unsubscribeAuthor } from "@jx3box/jx3box-common/js/rss";
import { getFans } from "@/service/next";
import { getUserInfo } from "@jx3box/jx3box-common-ui/service/author";
import User from "@jx3box/jx3box-common/js/user";

export default {
    name: "AuthorCard",
    props: {
        author: {
            type: Object,
            default: () => {},
        },
        uid: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            subscribed: false,
            fans: 0,
            userInfo: {},

            isLogin: User.isLogin(),
        };
    },
    watch: {
        uid: {
            handler(val) {
                if (val) {
                    this.getUserInfo();
                }
            },
            immediate: true,
            deep: true,
        },
    },
    methods: {
        showAvatar,
        getFans(uid) {
            getFans(uid).then((res) => {
                this.fans = res.data.data.total || 0;
                this.subscribed = res.data.data.subscribed || false;
            });
        },
        follow() {
            if (!User.isLogin()) {
                this.$message({
                    message: "请先登录",
                    type: "warning",
                });
                return;
            }
            subscribeAuthor({ id: this.uid }).then(() => {
                this.subscribed = true;
            });
        },
        unfollow() {
            if (!User.isLogin()) {
                this.$message({
                    message: "请先登录",
                    type: "warning",
                });
                return;
            }
            unsubscribeAuthor({ id: this.uid }).then((res) => {
                this.subscribed = false;
            });
        },
        getUserInfo() {
            getUserInfo(this.uid).then((res) => {
                this.userInfo = res?.data?.data;
                this.getFans(this.uid);
            });
        },
    },
};
</script>

<style lang="less">
.m-author-card {
    position: relative;
    display: flex;
    padding-bottom: 16px;
    flex-direction: column;
    gap: var(--12, 12px);
    align-self: stretch;
    align-items: center;
    margin-top: 20px;

    background: var(--primary-brand-4, #fff);

    &::before {
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
    }

    .u-title {
        position: absolute;
        left: 15px;
        top: 16px;
        color: var(--primary-white, #fff);
        font-size: 12px;
        font-style: normal;
        font-weight: 700;
        line-height: 18px; /* 150% */
    }

    .u-img-bg {
        .size(100%, 140px);
        img {
            .size(100%, 140px);
            object-fit: cover;
            opacity: 0.5;
        }
        background: black;
    }

    .m-author-box {
        width: 100%;

        .u-info-box {
            display: flex;
            padding: 0 16px;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
            .u-author_name {
                color: var(--black-80, rgba(28, 28, 28, 0.8));
                font-size: 14px;
                font-style: normal;
                font-weight: 700;
                line-height: 20px; /* 142.857% */
            }

            .u-author_fans {
                color: var(--black-40, rgba(28, 28, 28, 0.4));
                font-size: 10px;
                font-style: normal;
                font-weight: 400;
                line-height: 15px; /* 150% */
            }

            .u-follow {
                display: flex;
                padding: 4px 8px;
                justify-content: center;
                align-items: center;
                gap: 10px;

                color: var(--primary-brand-3, #fedaa3);

                /* 10 Regular */
                font-size: 10px;
                font-style: normal;
                font-weight: 400;
                line-height: 15px; /* 150% */

                border-radius: 8px;
                background: var(--primary-brand-2, #24292e);
            }
        }

        .u-author_introduce {
            color: var(--black-40, rgba(28, 28, 28, 0.4));
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 18px; /* 150% */
        }
    }
}
@media (prefers-color-scheme: dark) {
    .m-author-card {
        background: var(--black-5, rgba(28, 28, 28, 0.05));

        .m-author-box {
            width: 100%;

            .u-info-box {
                .u-author_name {
                    color: var(--black-80-dark, rgba(255, 255, 255, 0.8));
                }
                .u-author_fans {
                    color: var(--black-40-dark, rgba(255, 255, 255, 0.4));
                }
            }

            .u-author_introduce {
                color: var(--black-40-dark, rgba(255, 255, 255, 0.4));
            }
        }
    }
}
</style>
