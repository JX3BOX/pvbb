<template>
    <div class="m-extend-list">
        <!-- 其他链接 -->
        <div class="m-jx3dat-links m-side-links">
            <h3 class="m-side-title" style="border-bottom: none">
                <div class="u-title">
                    <!-- svg 图标 -->
                    <!-- <img class="u-icon" v-svg-inline src="" /> -->
                    魔盒文档
                </div>
            </h3>
            <el-collapse class="u-groups" v-model="activeDocGroup">
                <!-- <el-collapse-item title="发布指南" name="senior">
                    <div class="u-docs">
                        <a v-for="(item, i) in jx3dat_senior" :key="i" class="u-doc" :href="item.link" target="_blank">
                            <i class="el-icon-collection"></i>
                            {{ item.label }}
                        </a>
                    </div>
                </el-collapse-item> -->
                <!-- <el-collapse-item title="版规与要求" name="rule" class="m-tool-rule">
                    <div class="u-content" v-html="rules"></div>
                </el-collapse-item> -->
                <el-collapse-item title="入门指南" name="newbie">
                    <div class="u-docs">
                        <a v-for="(item, i) in jx3dat_newbie" :key="i" class="u-doc" :href="item.link" target="_blank">
                            <i class="el-icon-collection"></i>
                            {{ item.label }}
                        </a>
                    </div>
                </el-collapse-item>
                <el-collapse-item title="API文档" name="api" class="m-tool-api">
                    <div class="u-list" v-if="apis && apis.length">
                        <a
                            class="u-item"
                            v-for="(item, i) in apis"
                            :href="item.link"
                            target="_blank"
                            :style="highLight(item.color)"
                            :key="i"
                        >
                            <i :class="item.icon"></i> {{ item.label }}
                        </a>
                    </div>
                </el-collapse-item>
                <el-collapse-item title="热门搜索" name="tags" class="m-tool-rule">
                    <div class="m-nav-tags" v-if="tags && tags.length">
                        <!-- <h5 class="u-title"><i class="el-icon-collection-tag"></i> 热门搜索</h5> -->
                        <div class="u-list">
                            <a :href="item.link" target="_blank" v-for="(item, i) in tags" :key="i">{{ item.label }}</a>
                        </div>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>
        <!-- <Github_REPO REPO="fb" coder="8"></Github_REPO> -->
    </div>
</template>

<script>
export default {
    name: "list_side",
    props: [],
    data: function () {
        return {
            activeDocGroup: [],
            jx3dat_newbie: [
                {
                    icon: "",
                    link: "/tool/27691",
                    uuid: "82805f0a-d021-412a-806c-82c9dac1d6d0",
                    color: "",
                    label: "各类插件数据的导入与用途说明",
                    priority: 1,
                },
                {
                    icon: "",
                    link: "/collection/461",
                    uuid: "4fe8c177-b05e-4c2d-a30c-4361e6d01ad7",
                    color: "",
                    label: "客户端优化集合",
                    priority: 3,
                },
            ],
            jx3dat_senior: [
                {
                    icon: "",
                    link: "/tool/420",
                    color: "",
                    label: "团队监控插件教程",
                },
                {
                    icon: "",
                    link: "/tool/17340",
                    color: "",
                    label: "团队监控数据完全指南",
                },
                {
                    icon: "",
                    link: "/tool/46218",
                    color: "",
                    label: "剑三属性字段整理",
                },
            ],

            qq: "608303480",

            tags: [
                {
                    icon: "",
                    link: "/bps/dps",
                    color: "",
                    label: "计算器",
                },
                {
                    icon: "",
                    link: "/pz",
                    color: "",
                    label: "配装器",
                },
                {
                    icon: "",
                    link: "/bps/haste",
                    color: "",
                    label: "加速阈值",
                },
                {
                    icon: "",
                    link: "/team",
                    color: "",
                    label: "团队排表",
                },
                {
                    icon: "",
                    link: "/jcl",
                    color: "",
                    label: "战斗复盘",
                },
                {
                    icon: "",
                    link: "/battle",
                    color: "",
                    label: "战斗统计",
                },
                {
                    icon: "",
                    link: "/pvg/gonggao/server",
                    color: "",
                    label: "开服监控",
                },
                {
                    icon: "",
                    link: "/face/facedata",
                    color: "",
                    label: "脸型数据解析",
                },
                {
                    icon: "",
                    link: "https://j3cx.com/exam/",
                    color: "",
                    label: "科举题库",
                },
                {
                    icon: "",
                    link: "https://j3cx.com/serendipity",
                    color: "",
                    label: "奇遇查询",
                },
            ],
            rules: "",
            apis: [
                {
                    icon: "el-icon-collection",
                    link: "/tool/30423",
                    uuid: "f37cd244-3b1b-459c-92b6-e41234a8c3ea",
                    color: "",
                    label: "配装器开发者文档",
                    priority: 1,
                },
                {
                    icon: "el-icon-collection",
                    link: "/tool/17401",
                    uuid: "726803cd-bda0-4569-bb02-eda47d44ea18",
                    color: "",
                    label: "在线数据构建文档",
                    priority: 2,
                },
                {
                    icon: "el-icon-collection",
                    link: "/collection/215",
                    uuid: "1f503a0c-826d-47a8-9e76-5dbdbe45930d",
                    color: "",
                    label: "游戏数据API文档",
                    priority: 3,
                },
                {
                    icon: "el-icon-collection",
                    link: "/collection/235",
                    uuid: "eda994d3-54e9-4da9-a219-66551dcb559e",
                    color: "",
                    label: "战斗分析相关文档",
                    priority: 4,
                },
                {
                    icon: "el-icon-collection",
                    link: "/collection/243",
                    uuid: "d5cf1abb-c744-49fd-8bea-5e99d11314c3",
                    color: "",
                    label: "计算器开发者文档",
                    priority: 5,
                },
            ],
        };
    },
    methods: {
        onQQClick() {
            navigator.clipboard.writeText(this.qq).then(() => {
                this.$notify({
                    title: "复制成功",
                    message: "内容：" + this.qq,
                    type: "success",
                });
            });
        },
        highLight: function (val) {
            if (val) {
                return "color:" + val + ";font-weight:bold;";
            }
            return "";
        },
    },
    mounted: function () {},
    components: {},
};
</script>

<style lang="less">
.m-side-title {
    margin: 20px 0 10px 0;
}

.m-extend-list {
    .u-link {
        .pointer;
    }

    .c-sidebar-right-msg {
        margin-left: 0;
        margin-right: 0;
    }
}

.m-side-links {
    .u-title {
        .flex;
        align-items: center;
        gap: 10px;
        .fz(18px);
    }

    .u-icon {
        .size(20px);
    }

    .u-groups {
        padding: 0 5px;
    }
    .u-doc {
        .nobreak;
        .flex;
        align-items: center;
        .fz(12px, 34px);
        // border-bottom: 1px solid #eee;
        i {
            .fz(16px);
            color: #666;
            .mr(5px);
        }
        &:last-child {
            border-bottom: none;
        }
        &:hover {
            .bold;
            color: @pink;
        }
    }
}

.m-tool-api {
    .u-item {
        display: block;
        padding: 0 5px;
        font-size: 12px;
        line-height: 3;
        text-align: left;
        border-bottom: 1px dashed #eee;
        cursor: pointer;
        height: 32px;

        &:hover {
            color: @pink;
            font-weight: bold;
        }
    }
}

@media screen and (max-width: @phone) {
    .m-side-rank,
    .m-side-links {
        // .none;
    }
}

.c-sidebar-right-list {
    .u-item {
        i {
            .mr(5px);
        }
    }
}

.c-sidebar-right-title {
    font-weight: bold;
}
</style>
