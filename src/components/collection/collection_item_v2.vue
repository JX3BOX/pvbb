<template>
    <a :href="`/collection/${data.id}`" target="_blank" class="m-collection-item_v2" @mousemove="handleMove">
        <div class="u-image" ref="bookRef">
            <el-image class="u-img u-cover" :src="resolveImagePath(data.image)" fit="cover">
                <template #error>
                    <img :src="`${imgPath}cover-${randomNumber}.png`" />
                </template>
            </el-image>
            <img class="u-img u-mark" :ref="`mark${data.id}`" :src="`${imgPath}light.png`" />
            <el-image class="u-img u-box" :src="`${imgPath}box.svg`" fit="fill"> </el-image>
        </div>

        <div class="u-content">
            <div class="u-title" :title="data.title">{{ data.title }}</div>
            <div class="u-info" v-if="data.collection_user_info">
                <a :href="authorLink(data.user_id)" class="u-user" target="_blank">
                    <img class="u-avatar" :src="showAvatar(data.collection_user_info.user_avatar)" />
                    <span class="u-nickname" v-text="data.collection_user_info.display_name"></span>
                </a>
            </div>
            <div class="u-time">
                <el-button link icon="Date">{{ showDate(data.created * 1000) }}</el-button>
                <el-button link icon="Refresh">{{ showDate(data.updated * 1000) }}</el-button>
            </div>
        </div>
    </a>
</template>

<script>
import { showAvatar, resolveImagePath, authorLink } from "@jx3box/jx3box-common/js/utils";
import { showDate } from "@jx3box/jx3box-common/js/moment";
import { __imgPath } from "@/utils/config";
export default {
    name: "CollectionItemV2",
    props: {
        data: {
            type: Object,
            default: () => {},
        },
    },
    computed: {
        imgPath() {
            return `${__imgPath}topic/bbs/`;
        },
        randomNumber() {
            return Math.floor(Math.random() * 4) + 1;
        },
    },
    methods: {
        resolveImagePath,
        authorLink,
        showAvatar,
        showDate,
        handleMove(event) {
            let x = Math.floor(event.offsetX / 100);
            let y = -Math.floor(event.offsetX / 60);
            this.$refs[`mark${this.data.id}`].style.transform = `translate(${x}px, ${y}px)`;
        },
    },
};
</script>

<style lang="less">
.m-collection-item_v2 {
    .flex;
    .size(auto, 292px);
    min-width: 0;
    flex-direction: column;
    background-color: #fff;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    padding: 14px 12px;
    border: 1px solid #e8e7ef;
    border-radius: 10px;
    box-shadow: 0 2px 7px rgba(31, 29, 54, 0.035);
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    .u-content {
        .db;
        .w(100%);
        .flex;
        .mt(10px);
        flex-direction: column;
        align-items: center;
    }
    .u-image {
        position: relative;
        .pointer;
        .clip;
        .size(128px, 190px);
        transition: transform 0.5s, box-shadow 0.5s, top 0.5s;
        border-bottom-left-radius: 10px;

        .u-img {
            .pa;
            .rb(0);
            .size(128px, 190px);
            object-fit: contain;
            transition: transform 0.5s, box-shadow 0.5s;
            &.u-mark {
                .none;
                .lt(0, -58px);
                pointer-events: none;
            }
            &.u-cover {
                .size(111px, 161px);
                .lt(10px, 8px);
                background-color: #24292e;
            }
        }
    }

    .u-title {
        .nobreak;
        .db;
        .x;
        .w(100%);
        .fz(15px, 1.6);
        font-weight: 600;
        color: #2b2935;
    }

    .u-info {
        .flex;
        .mt(4px);
        .clearfix;
        flex-direction: column;
    }

    .u-user {
        .flex;
        .fz(13px);
        .auto(x);
        gap: 5px;
        align-items: center;
        color: #7c7988;
    }
    .u-avatar {
        .size(17px);
        .r(100%);
    }
    .u-time {
        .none;
    }

    &:hover {
        border-color: rgba(91, 78, 211, 0.34);
        background-color: #fff;
        box-shadow: 0 10px 22px rgba(53, 43, 125, 0.12);
        transform: translateY(-5px);
        .u-image {
            transform: rotate(-8deg) translateY(-7px);
            box-shadow: 0 28px 20px rgba(36, 41, 46, 0.22);
            top: -7px;
            .u-mark {
                .db;
                .size(228px, 290px);
            }
        }
        .u-title {
            color: @v4primary;
        }
    }
    .el-button--text,
    .el-button--text:focus,
    .el-button--text:hover {
        .fz(12px);
        font-weight: 400;
        color: rgba(0, 0, 0, 0.4);
    }
}
@media screen and (max-width: @phone) {
    .m-collection-item_v2 {
        .w(100%);
        .h(280px);
        padding: 14px 8px;
        .u-image { transform: scale(0.9); }
        &:hover .u-image { transform: scale(0.9) rotate(-5deg) translateY(-5px); }
    }
}
</style>
