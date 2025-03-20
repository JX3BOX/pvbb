<template>
    <a :href="`/collection/${data.id}`" target="_blank" class="m-collection-item_v2" @mousemove="handleMove">
        <div class="u-image" ref="bookRef">
            <el-image class="u-img u-cover" :src="resolveImagePath(data.image)" fit="cover">
                <img slot="error" :src="`${imgPath}cover-${randomNumber}.png`" />
            </el-image>
            <img class="u-img u-mark" :ref="`mark${data.id}`" :src="`${imgPath}light.png`" />
            <img />
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
                <el-button type="text" icon="el-icon-date">{{ showDate(data.created * 1000) }}</el-button>
                <el-button type="text" icon="el-icon-refresh">{{ showDate(data.updated * 1000) }}</el-button>
            </div>
        </div>
    </a>
</template>

<script>
import { showAvatar, resolveImagePath, authorLink } from "@jx3box/jx3box-common/js/utils";
import { showDate } from "@jx3box/jx3box-common/js/moment";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
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
    .mb(20px);
    .size(250px, 350px);
    min-width: 250px;
    flex-direction: column;
    background-color: #fff;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    padding: 5px;
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
        .bold;
        .db;
        .x;
        .w(100%);
        .fz(16px, 1.8);
        color: #000;
    }

    .u-info {
        .flex;
        .mt(5px);
        .clearfix;
        flex-direction: column;
    }

    .u-user {
        .flex;
        .fz(14px);
        .auto(x);
        gap: 5px;
        align-items: center;
        color: #666;
    }
    .u-avatar {
        .size(18px);
        .r(100%);
    }
    .u-time{
        .none;
    }

    &:hover {
        background-color: @bg-light;
        .u-image {
            transform: rotate(-14deg) translateY(-10px);
            box-shadow: 0 60px 30px rgba(36, 41, 46, 0.3);
            top: -10px;
            .u-mark {
                .db;
                .size(228px, 290px);
            }
        }
        .u-title {
            color: rgba(42, 130, 228, 1);
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
    }
}
</style>
