<template>
    <div class="m-trial">
        <div class="m-trial-header">
            <div class="u-title">试用</div>
        </div>

        <template v-if="isLogin">
            <div class="m-trial-content">
                <div class="m-trial-input-wrapper">
                    <el-input
                        v-model="command"
                        placeholder="输入指令"
                        class="m-trial-input"
                        :disabled="loading"
                        @keyup.enter="handleSend"
                    >
                        <template #suffix>
                            <span class="send-button" @click="handleSend">发送</span>
                        </template>
                    </el-input>
                </div>

                <pre class="m-trial-response" v-if="response">{{ text }}</pre>
            </div>
        </template>
        <template v-else>
            <div class="m-trial-content">
                <div class="m-trial-input-wrapper">
                    <el-input v-model="command" placeholder="请先登录" class="m-trial-input" disabled>
                        <template #suffix>
                            <span class="send-button" @click="toLogin">登录</span>
                        </template>
                    </el-input>
                </div>

                <pre class="m-trial-response">请先登录后再试用指令</pre>
            </div>
        </template>
    </div>
</template>

<script>
import { postCommandTrial } from "@/service/qqbot";
import User from "@jx3box/jx3box-common/js/user";
export default {
    name: "Trial",
    data() {
        return {
            command: "",
            text: "",
            response: "",
            index: 0,
            timer: null,
            loading: false,
        };
    },
    computed: {
        isLogin() {
            return User.isLogin();
        },
    },
    watch: {
        response(newVal) {
            this.handleText(newVal);
        },
    },
    beforeUnmount() {
        this.clearTextTimer();
    },
    methods: {
        async handleSend() {
            if (this.loading || !this.command.trim()) return;
            this.loading = true;
            try {
                const res = await postCommandTrial({
                    command: this.command.trim(),
                    scope: "c2c",
                });
                this.response = String(res.data?.data?.content || "");
            } catch (error) {
                this.$message.error("发送失败，请稍后再试");
            } finally {
                this.loading = false;
            }
        },
        toLogin() {
            User.toLogin();
        },
        clearTextTimer() {
            if (this.timer) clearTimeout(this.timer);
            this.timer = null;
        },
        handleText(value = "") {
            this.clearTextTimer();
            const response = String(value || "");
            this.index = 0;
            this.text = "";

            const renderNextCharacter = () => {
                if (this.index >= response.length) {
                    this.timer = null;
                    return;
                }
                this.index += 1;
                this.text = response.slice(0, this.index);
                this.timer = setTimeout(renderNextCharacter, 20);
            };
            renderNextCharacter();
        },
    },
};
</script>

<style lang="less">
.m-trial {
    width: 100%;
    padding: 12px;
    box-sizing: border-box;
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(64, 64, 64, 1) 0%, rgba(87, 87, 87, 1) 100%);
    font-size: 12px;
    color: rgba(166, 166, 166, 1);
    .m-trial-response {
        color: #fff;
    }
}
.m-trial-header {
    width: 100%;
    height: 44px;

    .u-title {
        font-size: 24px;
        font-weight: 700;
        color: #fff;
    }
}

.m-trial-input-wrapper {
    max-width: 336px;

    .m-trial-input {
        .el-input__wrapper {
            background-color: #000;
            border: none;
            border-radius: 999px;
            box-shadow: none;
        }
        .el-input__inner {
            color: #fff;
            padding-right: 60px; // 给 suffix 留出空间
            padding-left: 16px;
            height: 50px;
            line-height: 50px;
            font-size: 14px;
        }

        .el-input__suffix {
            right: 10px;
            height: 100%;
            display: flex;
            align-items: center;

            .send-button {
                color: #fff;
                font-weight: bold;
                cursor: pointer;
                padding: 0 10px;
                user-select: none;
                transition: color 0.2s;

                &:hover {
                    color: #ccc;
                }
            }
        }
    }
}

.m-trial-response {
    padding: 16px;
    width: 100%;
    box-sizing: border-box;
    font-size: 12px;
    color: rgba(110, 110, 110, 1);
    max-height: 200px;
    overflow: auto;
    &::-webkit-scrollbar {
        .none;
    }

    border-radius: 12px;
    background: linear-gradient(0deg, rgba(56, 56, 56, 1) 0%, rgba(0, 0, 0, 1) 100%);

    border: 1px solid rgba(110, 110, 110, 1);

    white-space: pre-wrap;
    word-wrap: break-word;
}
</style>
