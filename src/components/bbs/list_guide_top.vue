<template>
    <div class="m-index-rec">
        <h5 class="u-title">
            <span><i class="el-icon-star-off"></i>萌新完全指南</span>
        </h5>
        <div class="u-ac" v-html="ac"></div>
        <el-row>
            <template v-for="(subdata, index) in data">
                <el-col :span="8" :key="index">
                    <div class="m-header" :key="index + 'header'">{{ subdata.label }}</div>
                    <div class="u-rec" v-for="(item, i) in subdata.menus" :key="i">
                        <a
                            :href="item.link"
                            target="_blank"
                            :style="highLight(item.color)"
                            v-reporter="{
                                data: {
                                    href: bbsLink(item.link),
                                },
                                caller: 'bbs_suggest',
                            }"
                        >
                            <!-- <img :src="iconLink(item.icon)" v-if="item.icon" /> -->
                            {{ item.label }}
                        </a>
                    </div>
                </el-col>
            </template>
        </el-row>
    </div>
</template>

<script>
import { getBreadcrumb, getMenus } from "@jx3box/jx3box-common/js/api_misc.js";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
const empty_item = {
    color: "",
    label: "",
    link: "",
    icon: "",
};
export default {
    name: "rec_table",
    props: [],
    components: {},
    data: function () {
        return {
            data: [],
            ac: "",
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        bbsLink(link) {
            const prefix = this.client == "std" ? "www" : "origin";
            return `${prefix}:${link}`;
        },
        init: function () {
            getMenus({ key: "bbs_newbie_1,bbs_newbie_2,bbs_newbie_3" }).then((res) => {
                this.data = res || [];
            });
            getBreadcrumb("bbs_newbie").then((res) => {
                this.ac = res || "";
            });
        },
        highLight: function (val) {
            if (val) {
                return "color:" + val;
            }
            return "";
        },
        iconLink: function (val) {
            return __imgPath + "image/xf/" + val + ".png";
        },
    },
    mounted: function () {
        this.init();
    },
};
</script>

<style lang="less">
.m-index-rec {
    @border: #dfe6f7;

    background-color: #fafbfc;
    border: 1px solid @border;
    border-bottom: none;
    .r(4px);
    margin-bottom: 15px;

    .m-header {
        .x;
        border-right: 1px solid @border;
        border-bottom: 1px solid @border;
        padding: 10px;
        font-size: 13px;
    }

    .u-title {
        margin: 0;
        .x;
        .fz(12px, 2.5);
        border-bottom: 1px solid @border;
        span {
            color: #fff;
            background-color: #6f42c1;
            font-weight: normal;
            padding: 2px 5px;
            .r(2px);
        }
    }
    .u-ac {
        border-bottom: 1px solid @border;
        padding: 10px;
        .fz(12px,2);
        .x;
        white-space: pre-wrap;
    }
    .u-rec {
        img {
            .size(20px);
            .y;
        }
        border-right: 1px solid @border;
        border-bottom: 1px solid @border;

        a {
            .nobreak;
            .db;
            .fz(12px, 20px);
            padding: 8px 10px;
            &:hover {
                .bold;
                color: @pink;
                background-color: #fff;
            }
            .h(20px);
        }
    }
    .el-col:nth-child(3n) {
        .u-rec {
            border-right: 0;
        }
    }
}
@media screen and (max-width: @phone) {
    .m-index-rec .el-col {
        .w(100%);
    }
    .m-index-rec .el-col {
        .m-header,
        .u-rec {
            border-right: none;
        }
    }
}
</style>
