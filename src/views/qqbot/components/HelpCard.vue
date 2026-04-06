<template>
    <div class="m-help-card">
        <div class="u-card-title">{{ obj.title }}</div>
        <div class="content-container" v-for="(item, index) in obj.contents" :key="index">
            <div class="content">
                <div class="zhiling">
                    {{ item.zhiling }}
                </div>
                <div class="params">
                    <div class="param" v-for="param in item.params" :key="param">
                        {{ param }}
                    </div>
                </div>
            </div>
            <div class="buttons">
                <div class="copy-white button" @click="copyWhite(item.zhiling)" v-if="item.zhiling">复制白字</div>
                <div class="copy-all button" @click="copyAll(item)">复制全部</div>
            </div>
        </div>

        <div class="m-example">
            <div class="u-example-title" v-html="obj.example"></div>

            <ul class="m-example-tips">
                <li v-for="(tip, ti) in obj.tips" :key="ti" v-html="tip"></li>
            </ul>
        </div>

        <div class="m-simple-example" v-if="obj.simple && obj.simple.title">
            <div class="u-simple-title">{{ obj.simple.title }}</div>
            <div class="content-container" v-for="(item, index) in obj.simple.contents" :key="index">
            <div class="content">
                <div class="zhiling">
                    {{ item.zhiling }}
                </div>
                <div class="params">
                    <div class="param" v-for="param in item.params" :key="param">
                        {{ param }}
                    </div>
                </div>
            </div>
            <div class="buttons">
                <div class="copy-white button" @click="copyWhite(item.zhiling)" v-if="item.zhiling">复制白字</div>
                <div class="copy-all button" @click="copyAll(item)">复制全部</div>
            </div>
        </div>
        <div class="m-example">
            <div class="u-example-title" v-html="obj.simple.example"></div>

            <ul class="m-example-tips">
                <li v-for="(tip, ti) in obj.simple.tips" :key="ti" v-html="tip"></li>
            </ul>
        </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "HelpCard",
    props: {
        obj: {
            type: Object,
            default: () => {
                return {
                    title: "",
                    content: {},
                    example: "",
                    tips: [],
                    simple: {
                        title: "",
                        content: {},
                        example: "",
                        tips: [],
                    },
                };
            },
        },
    },
    methods: {
        async copyWhite(text) {
            try {
                await this.$copyText(text);
                this.$notify.success({
                    title: "复制成功",
                    message: text,
                });
            } catch (error) {
                this.$message.error("复制失败");
            }
        },
        async copyAll(item) {
            try {
                const text = item.zhiling + " " + item.params.join(" ");
                await this.$copyText(text);
                this.$notify.success({
                    title: "复制成功",
                    message: text,
                });
            } catch (error) {
                this.$message.error("复制失败");
            }
        },
    },
};
</script>

<style lang="less">
.m-help-card {
    width: 640px;
    padding: 24px;
    box-sizing: border-box;
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(64, 64, 64, 1) 0%, rgba(87, 87, 87, 1) 100%);
    font-size: 12px;
    color: rgba(166, 166, 166, 1);

    .u-card-title {
        font-size: 16px;
        font-weight: 700;
        color: #fff;
    }

    .content-container {
        margin-top: 12px;
        width: 592px;
        height: 50px;
        border-radius: 24px;
        background: rgba(0, 0, 0, 1);
        display: flex;
        justify-content: space-between;
        .content {
            display: flex;
            align-items: center;
            .zhiling {
                font-size: 12px;
                font-weight: 700;
                color: #fff;
                margin-right: 8px;
                margin-left: 16px;
            }
            .params {
                display: flex;
                .param {
                    border-radius: 4px;
                    background: rgba(64, 128, 255, 0.3);
                    font-size: 12px;
                    padding: 0px 4px 0px 4px;
                    font-weight: 400;
                    color: rgba(94, 180, 255, 1);
                    margin-right: 8px;
                }
            }
        }
        .buttons {
            display: flex;
            font-size: 12px;
            cursor: pointer;
            .button {
                width: 72px;
                height: 50px;
                color: #fff;
                text-align: center;
                line-height: 50px;
            }
            .copy-white {
                &:hover {
                    background: #fff;
                    border: 1px solid rgba(69, 131, 255, 1);
                    box-shadow: 0px 0px 15px rgba(69, 131, 255, 0.4) inset;
                    color: rgba(0, 0, 0, 1);
                }
            }
            .copy-all {
                box-sizing: border-box;
                width: 76px;
                text-align: left;
                padding-left: 12px;
                border-radius: 0 24px 24px 0;
                &:hover {
                    background: rgba(64, 128, 255, 1);
                }
            }
        }
    }

    .m-example {
        margin-top: 12px;
    }

    .m-example-tips {
        padding-left: 16px;
        line-height: 18px;
        a{
            color:#5cb1fb;
            &:hover{
                text-decoration: underline;
            }
        }
    }

    .u-simple-title {
        font-size: 14px;
        color: #fff;
    }
}
</style>
