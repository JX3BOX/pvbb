<template>
    <div class="m-jx3dat-rank-mini m-jx3dat-rank">
        <h3 class="c-sidebar-right-title">
            <img class="u-icon" svg-inline src="../../assets/img/rank.svg" />排行榜
            <span class="u-more" @click="viewRank">查看更多 &raquo;</span>
        </h3>
        <el-tabs v-model="active" @tab-click="handleClick">
            <el-tab-pane label="综合" name="mix"></el-tab-pane>
            <el-tab-pane label="下载" name="download"></el-tab-pane>
            <el-tab-pane label="订阅" name="subscribers"></el-tab-pane>
            <el-tab-pane label="收藏" name="favorite"></el-tab-pane>
        </el-tabs>
        <ul class="u-list" v-loading="loading">
            <li v-for="(item, k) in data" :key="k">
                <a class="u-link" :href="postLink('dbm/pkg', item.id)">
                    <span class="u-order" :class="highlight(k)">{{ k + 1 }}</span>
                    <Avatar class="u-avatar" :url="item.ext_user_info.avatar" :size="14"> </Avatar>
                    <!-- <span class="u-tag" :class="item.client">{{ item.client === "std" ? "重制" : "缘起" }}</span> -->
                    <span class="u-name"> {{ item.key }} </span>
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
import { postLink } from "@jx3box/jx3box-common/js/utils";
import { __Root, __OriginRoot } from "@/utils/config";
export default {
    name: "rank",
    data: function () {
        return {
            loading: false,
            data: [],
            active: "mix",
        };
    },
    computed: {
        client: function () {
            return this.$store.state.client;
        },
    },
    methods: {
        postLink,
        handleClick() {
            this.loadData();
        },
        viewRank: function () {
            const root = this.client === "std" ? __Root : __OriginRoot;
            window.open(`${root}dbm/pkg/rank`, "_blank");
        },
        highlight: function (i) {
            if (i == 0) {
                return "t1";
            } else if (i == 1) {
                return "t2";
            } else if (i == 2) {
                return "t3";
            }
        },
        loadData() {
            this.loading = true;
            this.data = [
                {
                    id: 142,
                    user_id: 81,
                    key: "kaixinyike#默认版",
                    client: "std",
                    lang: "cn",
                    title: "【浅歌】开心一刻的PVE数据（041502版）25人冷龙峰已更新",
                    created_at: "2023-11-08 09:20:18",
                    head: "2aeba703-736e-410d-8d2f-e2b7486ce1b6",
                    ts: "1713185708142",
                    favorite: 0,
                    subscribers: 97883995,
                    last_7day: 2198964,
                    ext_user_info: {
                        id: 81,
                        display_name: "kaixinyike",
                        avatar: "https://oss.jx3box.com/upload/avatar/2021/4/6/3830723.jpg",
                        user_avatar_frame: "",
                        wechat_unionid: "oc6dC0ZAKE99pTq7ZD9G5pGPT-zY",
                    },
                },
                {
                    id: 354,
                    user_id: 2,
                    key: "南宫伯#默认版",
                    client: "std",
                    lang: "cn",
                    title: "【南宫伯】PVE数据（24041201版）25冷龙峰1-5已完成",
                    created_at: "2023-11-09 10:12:10",
                    head: "09b4d9bc-9173-498d-9b4c-5fc279ad6c8d",
                    ts: "1712927901546",
                    favorite: 0,
                    subscribers: 13955962,
                    last_7day: 651214,
                    ext_user_info: {
                        id: 2,
                        display_name: "南宫伯",
                        avatar: "https://oss.jx3box.com/2019/09/QQ图片20190806162038.jpg",
                        user_avatar_frame: "",
                        wechat_unionid: "oc6dC0a7T7_nX-ozdV7UkFnQuSeE",
                    },
                },
                {
                    id: 434,
                    user_id: 53684,
                    key: "PVP#默认版",
                    client: "std",
                    lang: "cn",
                    title: "【小蜜蜂】定制数据·洛蕾塔",
                    created_at: "2023-11-12 13:15:38",
                    head: "affa74a0-05ce-423e-b81e-230d0f583422",
                    ts: "1712690176231",
                    favorite: 0,
                    subscribers: 2448033,
                    last_7day: 37097,
                    ext_user_info: {
                        id: 53684,
                        display_name: "PVP",
                        avatar: "https://cdn.jx3box.com/upload/avatar/2024/3/18/53684_839918.png",
                        user_avatar_frame: "",
                        wechat_unionid: "oc6dC0eaMuzhJ1QbDLd9pRh1RE9Y",
                    },
                },
                {
                    id: 489,
                    user_id: 9637,
                    key: "七海海#默认版",
                    client: "std",
                    lang: "cn",
                    title: "【七海海】成就监控／10人及红尘本语音数据（1月12日更新）",
                    created_at: "2023-11-18 13:45:18",
                    head: "f7d5205c-b3a7-4fdb-956e-f6528785edbe",
                    ts: "1704992316260",
                    favorite: 0,
                    subscribers: 1789836,
                    last_7day: 82233,
                    ext_user_info: {
                        id: 9637,
                        display_name: "七海海",
                        avatar: "https://oss.jx3box.com/upload/avatar/2021/4/16/9318704.jpg",
                        user_avatar_frame: "",
                        wechat_unionid: "",
                    },
                },
                {
                    id: 442,
                    user_id: 8601,
                    key: "言无瑕#dbm",
                    client: "std",
                    lang: "cn",
                    title: "【杯酒】副本/百战，更新25冷龙峰，4.13",
                    created_at: "2023-11-13 12:13:21",
                    head: "fa054111-2578-43f7-b8af-eb71acda7dfb",
                    ts: "1713018828585",
                    favorite: 0,
                    subscribers: 1720146,
                    last_7day: 77509,
                    ext_user_info: {
                        id: 8601,
                        display_name: "言无瑕",
                        avatar: "https://oss.jx3box.com/upload/avatar/2020/6/1/-6e2c4aa0b690d9d776.jpg",
                        user_avatar_frame: "leaf_1",
                        wechat_unionid: "oc6dC0W663YpJQZkGb-vF1bQoKjs",
                    },
                },
                {
                    id: 385,
                    user_id: 11166,
                    key: "南宮伯#默认版",
                    client: "std",
                    lang: "tr",
                    title: "【南宮伯】國際版PVE數據（24031901版）反饋Q群：739388505",
                    created_at: "2023-11-09 17:37:32",
                    head: "dee56ec8-5fce-470f-8458-ca4f1b595409",
                    ts: "1710900406007",
                    favorite: 0,
                    subscribers: 1501439,
                    last_7day: 55969,
                    ext_user_info: {
                        id: 11166,
                        display_name: "南宮伯",
                        avatar: "https://oss.jx3box.com/upload/avatar/2020/6/9/1953796.jpg",
                        user_avatar_frame: "",
                        wechat_unionid: "",
                    },
                },
                {
                    id: 672,
                    user_id: 12367,
                    key: "任盈盈#默认版",
                    client: "std",
                    lang: "cn",
                    title: "【任盈盈】PVP攻防数据。移除部分计时条。(2024/04/07)",
                    created_at: "2023-11-26 02:44:59",
                    head: "a045d34e-b376-4f7b-a3e3-9ddddb0749e1",
                    ts: "1712469029867",
                    favorite: 0,
                    subscribers: 1475616,
                    last_7day: 77038,
                    ext_user_info: {
                        id: 12367,
                        display_name: "任盈盈",
                        avatar: "https://oss.jx3box.com/upload/avatar/2020/11/8/975631.JPG",
                        user_avatar_frame: "",
                        wechat_unionid: "",
                    },
                },
                {
                    id: 455,
                    user_id: 5293,
                    key: "星洲炒米粉#默认",
                    client: "std",
                    lang: "cn",
                    title: "【星洲炒米粉】摸宠/抓马/日常/周常/前尘/名望 20240325",
                    created_at: "2023-11-13 19:00:36",
                    head: "bf6f12b4-fb4c-4247-bccd-0ee7906eef84",
                    ts: "1711363465202",
                    favorite: 0,
                    subscribers: 1285149,
                    last_7day: 74134,
                    ext_user_info: {
                        id: 5293,
                        display_name: "星洲炒米粉",
                        avatar: "https://oss.jx3box.com/upload/avatar/2023/2/5/5293_1181804.jpg",
                        user_avatar_frame: "",
                        wechat_unionid: "",
                    },
                },
                {
                    id: 705,
                    user_id: 174288,
                    key: "千山踏雪#搬運PVE",
                    client: "std",
                    lang: "tr",
                    title: "（搬運）【淺歌】開心一刻的PVE數據（041201版）25人冷龍峰已更新",
                    created_at: "2023-11-27 09:58:42",
                    head: "7b0d8fde-12eb-4704-b2c7-4de0bfeb1826",
                    ts: "1712977704836",
                    favorite: 0,
                    subscribers: 640413,
                    last_7day: 39073,
                    ext_user_info: {
                        id: 174288,
                        display_name: "千山踏雪",
                        avatar: "https://cdn.jx3box.com/upload/avatar/2024/1/16/174288_5889538.jpg",
                        user_avatar_frame: "long_1",
                        wechat_unionid: "",
                    },
                },
                {
                    id: 114,
                    user_id: 55200,
                    key: "苏素衣#默认版",
                    client: "std",
                    lang: "cn",
                    title: "【弑血倾城】PVP/抓马/宠物/常用秘境(更新的卢数据）",
                    created_at: "2023-11-06 14:28:46",
                    head: "bcfdcac7-0220-4404-bb73-51ae890c5078",
                    ts: "1705854614531",
                    favorite: 0,
                    subscribers: 582169,
                    last_7day: 28819,
                    ext_user_info: {
                        id: 55200,
                        display_name: "苏素衣",
                        avatar: "https://oss.jx3box.com/upload/avatar/2021/5/10/55200_8465262.jpg",
                        user_avatar_frame: "flower_2",
                        wechat_unionid: "",
                    },
                },
            ];
            this.loading = false;
        },
    },
    mounted: function () {
        this.loadData();
    },
};
</script>

<style lang="less">
@import "../../assets/css/rank.less";
</style>
