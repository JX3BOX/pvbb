<template>
    <QQBotLayout>
        <div class="m-qqbot-bind">
            <div class="m-qqbot">
                <div class="m-qqbot-header">
                    <div class="u-icon-box">
                        <img class="u-icon" src="@/assets/img/qqbot/qqbot.svg" alt="魔盒QQ机器人" />
                    </div>
                    <div>
                        <span class="u-kicker">JX3BOX QQ BOT</span>
                        <h1 class="u-icon-title">QQ机器人绑定</h1>
                        <p class="u-subtitle">连接魔盒账号，随时在 QQ 中查询你的游戏数据</p>
                    </div>
                    <div v-if="checkStatus" class="u-status-actions">
                        <div class="u-status-pill">
                            <i class="el-icon-success"></i>
                            <span>已绑定</span>
                        </div>
                        <button class="u-unbind-btn" type="button" @click="unbind">取消绑定</button>
                    </div>
                </div>
                <div class="m-qqbot-content" :class="{ 'is-bound-content': checkStatus }">
                    <template v-if="!checkStatus">
                        <div class="u-step">
                            <span class="u-step-index">1</span>
                            <div class="u-step-content">
                                <span class="u-step-label">添加并私聊魔盒机器人</span>
                                <button class="u-qq" type="button" title="点击复制QQ号" @click="onCopy(qq)">
                                    QQ {{ qq }}
                                    <i class="el-icon-document-copy"></i>
                                </button>
                            </div>
                        </div>
                        <div class="u-step">
                            <span class="u-step-index">2</span>
                            <div class="u-step-content">
                                <span class="u-step-label">向机器人发送绑定指令</span>
                                <div class="u-token" title="点击复制指令" @click="onCopy(bindText)">
                                    <code>{{ bindText }}</code>
                                    <i class="el-icon-document-copy"></i>
                                </div>
                            </div>
                        </div>
                    </template>
                    <div v-if="!checkStatus" class="u-actions">
                        <el-button class="u-btn" type="primary" round @click="onCopy(bindText)">
                            {{ btnText }}
                        </el-button>
                    </div>

                    <div class="u-bottom-tip">
                        <i class="el-icon-info"></i>
                        <span>绑定后可免费使用 PVE、PVP、PVX 查询，以及门派宏、成就、任务攻略与剑三百科等功能。</span>
                    </div>
                </div>
            </div>
            <div class="m-qqbot m-qq-bind">
                <div class="u-bind-heading">
                    <span class="u-bind-icon">
                        <img src="@/assets/img/qqbot/qq.svg" alt="QQ" />
                    </span>
                    <div>
                        <h2>补充绑定 QQ</h2>
                        <p>用于个人信息识别，不会在站内公开展示</p>
                    </div>
                </div>
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
                    <div class="u-qq-tip">
                        <i class="el-icon-lock"></i> 你的 QQ 号仅用于账号识别，我们会妥善保护个人信息
                    </div>
                </div>
            </div>
            <Pin></Pin>
        </div>
    </QQBotLayout>
</template>

<script>
import QQBotLayout from "@/layouts/QQBotLayout.vue";
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

                if (!this.data.qqbot) this.bind();
            });

            getProfile().then((res) => {
                this.userInfo = res.data.data;
                this.userQQ = this.userInfo.qq_number || "";
            });
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
.m-qqbot-bind {
    padding-bottom: 48px;
}

.m-qqbot {
    width: 100%;
    box-sizing: border-box;
    border-radius: 20px;
    background:
        radial-gradient(circle at 88% 0, rgba(64, 128, 255, 0.16), transparent 34%),
        linear-gradient(145deg, rgba(38, 42, 52, 0.96), rgba(10, 12, 18, 0.98));
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
    padding: 44px 56px;
    margin-top: 24px;
}

.m-qqbot-header {
    .flex;
    align-items: center;
    justify-content: flex-start;
    gap: 18px;
    max-width: 680px;
    margin: 0 auto;

    .u-icon-box {
        .size(72px);
        .flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border-radius: 20px;
        background: linear-gradient(145deg, rgba(64, 128, 255, 0.25), rgba(64, 128, 255, 0.08));
        border: 1px solid rgba(102, 169, 255, 0.3);
    }
    .u-icon {
        .size(48px);
    }
    .u-kicker {
        display: block;
        margin-bottom: 5px;
        color: #66a9ff;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 2px;
    }
    .u-icon-title {
        margin: 0;
        font-size: 30px;
        line-height: 1.2;
        color: #fff;
        font-weight: 700;
    }
    .u-subtitle {
        margin: 8px 0 0;
        color: rgba(255, 255, 255, 0.58);
        font-size: 14px;
    }
    .u-status-actions {
        .flex;
        align-items: center;
        gap: 10px;
        margin-left: auto;
    }
    .u-status-pill {
        .flex;
        align-items: center;
        gap: 7px;
        padding: 9px 15px;
        border: 1px solid rgba(93, 224, 151, 0.35);
        border-radius: 999px;
        background: rgba(56, 180, 112, 0.12);
        color: #68e39f;
        font-size: 14px;
        font-weight: 700;

        i {
            font-size: 16px;
        }
    }
    .u-unbind-btn {
        appearance: none;
        padding: 9px 15px;
        border: 1px solid rgba(255, 108, 116, 0.48);
        border-radius: 999px;
        background: rgba(218, 65, 74, 0.08);
        color: #ff8990;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: 0.2s ease;

        &:hover {
            background: #d94b54;
            border-color: #d94b54;
            color: #fff;
        }
    }
}
.m-qqbot-content {
    max-width: 680px;
    margin: 36px auto 0;

    .u-step {
        .flex;
        align-items: flex-start;
        gap: 16px;
        padding: 18px 20px;
        margin-top: 12px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.045);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .u-step-index {
        .size(28px);
        .flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border-radius: 50%;
        background: #4080ff;
        color: #fff;
        font-weight: 700;
        box-shadow: 0 0 0 5px rgba(64, 128, 255, 0.1);
    }
    .u-step-content {
        min-width: 0;
        flex: 1;
    }
    .u-step-label {
        display: block;
        margin-bottom: 10px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 13px;
    }
    .u-bottom-tip {
        .flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.5);
        margin-top: 28px;
        line-height: 1.7;

        i {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            line-height: 1;
        }
    }
    .u-qq {
        appearance: none;
        padding: 9px 13px;
        border: 1px solid rgba(102, 169, 255, 0.35);
        border-radius: 8px;
        background: rgba(64, 128, 255, 0.12);
        color: #8ebaff;
        font-size: 15px;
        font-weight: 700;
        .pointer;
        transition: 0.2s ease;

        &:hover {
            background: rgba(64, 128, 255, 0.22);
            border-color: #66a9ff;
        }
        i {
            margin-left: 8px;
        }
    }
    .u-token {
        .flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 14px;
        border: 1px solid rgba(104, 224, 153, 0.28);
        border-radius: 8px;
        background: rgba(72, 170, 112, 0.1);
        color: #78e6a5;
        .pointer;
        transition: 0.2s ease;

        code {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 16px;
        }

        i {
            .fz(18px);
        }
        &:hover {
            background: rgba(72, 170, 112, 0.18);
            border-color: rgba(120, 230, 165, 0.65);
        }
    }

    .u-actions {
        .x;
        margin-top: 24px;
    }

    .u-btn {
        min-width: 210px;
        height: 46px;
        border-radius: 99px;
        border-color: #4080ff;
        background: linear-gradient(90deg, #3478f6, #5598ff);
        box-shadow: 0 8px 22px rgba(64, 128, 255, 0.22);
        font-size: 16px;
        color: #fff;
        font-weight: 700;
        transition: 0.2s ease;

        &:hover {
            transform: translateY(-1px);
            border-color: #73b0ff;
            background: linear-gradient(90deg, #4080ff, #6aabff);
            color: #fff;
        }
    }

    &.is-bound-content {
        .u-bottom-tip {
            margin-top: 42px;
        }
    }
}

.m-qq-bind {
    .flex;
    align-items: center;
    gap: 48px;
    padding-top: 30px;
    padding-bottom: 30px;

    .u-bind-heading {
        .flex;
        align-items: center;
        gap: 14px;
        flex: 1;
        text-align: left;
    }
    .u-bind-icon {
        .size(48px);
        .flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border-radius: 14px;
        background: linear-gradient(145deg, #4389ff, #2e68d0);
        color: #fff;
        font-weight: 800;

        img {
            .size(30px);
            display: block;
        }
    }
    h2 {
        margin: 0 0 6px;
        color: #fff;
        font-size: 20px;
    }
    p {
        margin: 0;
        color: rgba(255, 255, 255, 0.48);
        font-size: 13px;
    }

    .u-qq-tip {
        width: 100%;
        margin-top: 12px;
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
        text-align: left;
    }
}

.m-qq-input-wrapper {
    width: 430px;
    flex-shrink: 0;

    .m-qq-input {
        .el-input__wrapper {
            min-height: 50px;
            padding: 0 3px 0 18px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.06);
            box-shadow: none;
            transition: 0.2s ease;

            &:hover {
                border-color: rgba(102, 169, 255, 0.55);
            }

            &.is-focus {
                border-color: #66a9ff;
                box-shadow: 0 0 0 3px rgba(64, 128, 255, 0.12);
            }
        }
        .el-input__inner {
            height: 48px;
            padding: 0;
            background: transparent;
            color: #fff;
            font-size: 15px;
            text-align: left;
        }

        .el-input__suffix {
            height: 100%;
            display: flex;
            align-items: center;
        }
        .u-confirm-button {
            min-width: 82px;
            height: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            color: #fff;
            background: linear-gradient(135deg, #3478f6, #5598ff);
            font-weight: bold;
            font-size: 15px;
            cursor: pointer;
            user-select: none;
            transition: 0.2s ease;
            padding: 0 20px;
            border-radius: 11px;
            box-shadow: 0 4px 12px rgba(64, 128, 255, 0.22);

            &:hover {
                background: linear-gradient(135deg, #4080ff, #6aabff);
                box-shadow: 0 6px 16px rgba(64, 128, 255, 0.32);
            }
        }
    }
}

@media screen and (max-width: 1500px) {
    .m-qqbot {
        padding: 36px 44px;
    }
    .m-qq-bind {
        gap: 32px;
    }
}
</style>
