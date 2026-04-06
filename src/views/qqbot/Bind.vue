<template>
    <QQBotLayout>
        <div class="m-qqbot-bind">
            <div class="m-qqbot">
                <div class="m-qqbot-header">
                    <img class="u-icon" svg-inline :src="icon('qqbot')" />
                    <span class="u-icon-title"> QQ机器人绑定 </span>
                </div>
                <div class="m-qqbot-content">
                    <template v-if="!checkStatus">
                        <div class="u-top-tip">
                            请私聊QQ机器人 <b class="u-qq" @click="onCopy(qq)">QQ: {{ qq }}</b> 发送下方指令
                        </div>
                        <div class="u-token" title="点击复制" @click="onCopy(bindText)">
                            <i class="el-icon-document-copy"></i>
                            {{ bindText }}
                        </div>
                    </template>
                    <div class="u-actions">
                        <el-button class="u-btn" type="primary" round @click="onCopy(bindText)" v-if="!checkStatus">
                            {{ btnText }}
                        </el-button>
                        <button
                            v-else
                            class="el-button u-btn el-button--primary is-round"
                            :class="{ 'is-bind': checkStatus }"
                            @click="unbind"
                            @mouseover.prevent="btnText = '取消绑定'"
                            @mouseout.prevent="btnText = '已绑定'"
                        >
                            <span>{{ btnText }}</span>
                        </button>
                    </div>

                    <div class="u-bottom-tip">
                        魔盒机器人为玩家提供免费的PVE、PVP、PVX等多项查询功能，包括但不限于全门派宏、成就查询、任务攻略、剑三百科。
                    </div>
                </div>
            </div>
            <div class="m-qqbot m-qq-bind">
                <div class="m-qq-input-wrapper">
                    <el-input
                        v-model="userQQ"
                        placeholder="请输入你所绑定的QQ"
                        class="m-qq-input"
                        @keyup.enter="onConfirm"
                    >
                        <template #suffix>
                            <span class="u-confirm-button" @click="onConfirm">确定</span>
                        </template>
                    </el-input>
                </div>

                <div class="u-qq-tip">盒子娘温馨提醒：魔盒不会公开用户的QQ，仅为了方便用户自身进行信息识别区分~</div>
            </div>
            <Pin></Pin>
        </div>
    </QQBotLayout>
</template>

<script>
import QQBotLayout from "@/layouts/QQBotLayout.vue";
import { __cdn } from "@/utils/config";
import { getQQbotToken, unbindQQbot, checkOAuth, getProfile, setProfile } from "@/service/qqbot";
import Pin from "@/views/qqbot/components/Pin.vue";
import User from "@jx3box/jx3box-common/js/user";
export default {
    name: "qqbot",
    components: {
        Pin,
        QQBotLayout,
    },
    data: function () {
        return {
            showDialog: false,

            token: "",
            qq: "3889010020",

            isPhone: window.innerWidth < 768,

            data: {
                qqbot: 0, // 是否绑定QQ机器人
            },

            btnText: "复制指令",
            userInfo: {},
            userQQ: "",
        };
    },
    computed: {
        checkStatus: function () {
            return this.data.qqbot;
        },
        bindText() {
            return `绑定账号 ${this.token}`;
        },
        isLogin() {
            return User.isLogin();
        },
    },
    mounted() {
        this.loadProfile();
    },
    methods: {
        loadProfile: function () {
            if (!this.isLogin) {
                this.$message({
                    type: "warning",
                    message: "请先登录",
                });
                return;
            }
            checkOAuth().then((res) => {
                this.data = res.data.data;

                if (this.checkStatus) {
                    this.btnText = "已绑定";
                }

                if (!this.data.qqbot) this.bind();
            });

            getProfile().then((res) => {
                this.userInfo = res.data.data;
                this.userQQ = this.userInfo.qq_number || "";
            });
        },
        icon: function (type) {
            return __cdn + "design/user/" + "qqbot.png";
        },
        bind: function () {
            getQQbotToken().then((res) => {
                this.token = res.data.data.token;
                this.showDialog = true;
            });
        },
        unbind: function () {
            this.$confirm("确定要解绑【魔盒QQ机器人】吗？", "解绑", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    unbindQQbot().then((res) => {
                        this.$message({
                            type: "success",
                            message: "解绑成功",
                        });
                        window.location.reload();
                    });
                })
                .catch(() => {});
        },
        onCopy: function (val) {
            navigator.clipboard.writeText(val).then(() => {
                this.$notify({
                    title: "复制成功",
                    message: val,
                    type: "success",
                });
            });
        },
        onError: function () {
            this.$notify.error({
                title: "复制失败",
                message: "请手动复制",
            });
        },
        onMouseOver() {
            this.btnText = "取消绑定";
        },
        onConfirm() {
            if (!this.userQQ) {
                this.$message.warning("请输入你所绑定的QQ");
                return;
            }

            if (this.userQQ === this.userInfo.qq_number) {
                this.$message.warning("你已绑定该QQ，请勿重复绑定");
                return;
            }

            setProfile({ qq_number: this.userQQ }).then((res) => {
                if (res.data.code === 0) {
                    this.$message.success("绑定成功");
                    window.location.reload();
                } else {
                    this.$message.error(res.data.message || "绑定失败，请稍后再试");
                }
            });
        }
    },
};
</script>

<style lang="less">
.m-qqbot {
    width: 100%;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(56, 56, 56, 1) 0%, rgba(0, 0, 0, 1) 100%);
    border: 0.5px solid rgba(255, 255, 255, 1);
    box-shadow: 0px 20px 20px rgba(0, 0, 0, 0.25);
    padding: 48px;
    margin-top: 24px;
}

.m-qqbot-header {
    .flex;
    align-items: flex-end;
    justify-content: center;
    .u-icon {
        .size(60px);
    }
    .u-icon-title {
        font-size: 36px;
        color: #fff;
        font-weight: 700;
    }
}
.m-qqbot-content {
    margin-top: 24px;
    .u-top-tip {
        font-size: 16px;
        color: #fff;
        margin-bottom: 24px;
        .x;
    }
    .u-bottom-tip {
        font-size: 14px;
        color: #fff;
        margin-top: 64px;
        text-align: center;
        line-height: 20px;
    }
    .u-qq {
        border: 1px solid #fff;
        border-radius: 4px;
        padding: 2px 4px;
        .pointer;
    }
    .u-token {
        .fz(24px);
        background-color: #438235;
        border: 1px solid #69ff61;
        color: #69ff61;
        padding: 20px;
        margin: 0 auto;
        width: max-content;
        .r(4px);

        i {
            .fz(20px);
            .y;
        }
        .pointer;
    }

    .u-actions {
        .x;
        margin-top: 36px;
    }

    .u-btn {
        width: 240px;
        height: 50px;
        border-radius: 99px;
        background-color: #0099ff;
        font-size: 18px;
        color: #fff;
        font-weight: 700;

        &:hover {
            background-color: #fff;
            color: #000;
            border: #fff;
        }
    }

    .is-bind {
        background-color: #595959;
        border-color: #595959;

        &:hover {
            background-color: #d43030;
            border-color: #d43030;
            color: #fff;
        }
    }
}

.m-qq-bind {
    .x;

    .u-qq-tip {
        font-size: 14px;
        color: rgba(255, 133, 167, 1);
        margin: 24px auto 0;
        text-align: center;
        width: max-content;
        border: 1px solid rgba(255, 133, 167, 1);
        padding: 4px 12px;
        border-radius: 4px;
    }
}

.m-qq-input-wrapper {
    width: 420px;

    margin: 0 auto;
    .m-qq-input {
        .el-input__inner {
            background-color: #fff;
            color: #000;
            border: none;
            border-radius: 999px;
            padding-right: 60px; // 给 suffix 留出空间
            padding-left: 16px;
            height: 50px;
            line-height: 50px;
            font-size: 18px;
            .x;
        }

        .el-input__suffix {
            right: 10px;
            height: 100%;
            display: flex;
            align-items: center;

        }
        .u-confirm-button {
            color: #fff;
            background-color: #0099ff;
            font-weight: bold;
            cursor: pointer;
            padding: 0 10px;
            user-select: none;
            transition: color 0.2s;
            padding: 8px 16px;
            border-radius: 99px;

            &:hover {
                background-color: #007acc;
            }
        }
    }
}
</style>
