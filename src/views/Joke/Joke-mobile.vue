<template>
    <div class="v-joke" v-loading="loading">
        <div class="m-chat-container" ref="chatContainer" @scroll="handleScroll">
            <!-- 聊天消息列表 -->
            <div class="m-chat-list" ref="chatList">
                <template v-for="(joke, index) in jokes">
                    <template v-if="joke.isDateMarker">
                        <div :key="joke.id || index" class="u-chat-date">{{ joke.date }}</div>
                    </template>
                    <template v-else>
                        <div :key="joke.id || index" class="m-chat-item">
                            <div class="m-message">
                                <div class="m-avatar">
                                    <img class="u-avatar" :src="joke.user_info?.user_avatar | showAvatar" />
                                </div>
                                <div class="m-content">
                                    <div class="m-header">
                                        <span class="u-author">{{ joke.user_info?.display_name || "匿名" }}</span>
                                    </div>
                                    <div class="m-body" @touchstart="jokeTouchStart(joke)" @touchend="jokeTouchEnd">
                                        <div class="u-text" v-html="joke.parsedContent"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </template>
                <div class="u-ent-time">
                    {{ `${userEntTime} 你已加入聊天室` }}
                </div>
            </div>
        </div>
        <div class="m-send">
            <!-- <div class="m-robot">
                <img class="u-icon" svg-inline src="@/assets/img/joke/robot-icon.svg" alt="" />
                <div class="u-tip">尚未开放发送功能，长按骚话复制</div>
            </div> -->
            <div class="m-input-container">
                <el-input
                    :autosize="{ minRows: 1, maxRows: 2 }"
                    class="u-input"
                    type="textarea"
                    placeholder=""
                    v-model="sendInputVal"
                    resize="none"
                ></el-input>
                <img
                    class="c-comment-emotion"
                    @click="showEmotionContainer = !showEmotionContainer"
                    v-if="!isDarkModeStatus"
                    src="@/assets/img/joke/mobile/emo-light.svg"
                />
                <img
                    class="c-comment-emotion"
                    @click="showEmotionContainer = !showEmotionContainer"
                    v-else
                    src="@/assets/img/joke/mobile/emo-dark.svg"
                    alt=""
                />
                <div class="u-btn" :class="{ disabled: !sendInputVal.length }" @click="publish">发布</div>
            </div>
            <div class="m-emotion-container" :class="{ show: showEmotionContainer }">
                <jokeEmotion @selected="handleEmotionSelected" :max="6"></jokeEmotion>
            </div>
        </div>

        <el-drawer :visible.sync="copyVisible" direction="btt" custom-class="m-joke-copy-drawer">
            <div class="m-copy-tip">
                <img class="u-icon" src="../../assets/img/joke/copy-icon.svg" alt="" />
                <div class="u-text">复制骚话</div>
            </div>
            <div class="u-content" v-html="copySelectJoke.parsedContent"></div>
            <div class="u-btn" @click="handleCopy">复制</div>
        </el-drawer>
    </div>
</template>

<script>
import emotion from "@jx3box/jx3box-emotion/data/default.json";
import JX3_EMOTION from "@jx3box/jx3box-emotion";
import { getJokes, postJoke } from "@/service/joke";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import jokeEmotion from "@/components/joke/joke_mobile_emotion.vue";

export default {
    name: "Joke",
    components: {
        jokeEmotion,
    },
    data: function () {
        return {
            loading: false,
            jokes: [],
            currentPage: 1,
            pageSize: 20,
            scrollToBottomFlag: true,

            userEntTime: "",
            copyVisible: false,
            copySelectJoke: {},
            longPressTimeOut: "",

            sendInputVal: "",

            isDarkModeStatus: window.matchMedia("(prefers-color-scheme: dark)").matches,
            showEmotionContainer: false,
        };
    },
    computed: {
        isLogin: function () {
            return User.isLogin();
        },
    },
    filters: {
        dateFormat: function (val) {
            return dateFormat(new Date(val));
        },
        showAvatar: function (val) {
            return showAvatar(val);
        },
    },
    mounted: function () {
        this.fetchJokes();
        // 获取当前时分秒
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        this.userEntTime = `${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
    },
    methods: {
        async parse(str) {
            const ins = new JX3_EMOTION(str);
            const result = await ins._renderHTML();
            return result;
        },
        // 获取笑话列表
        async fetchJokes() {
            if (this.loading) {
                return;
            }
            this.loading = true;
            const params = {
                page: this.currentPage,
                per: this.pageSize,
            };

            getJokes(params)
                .then(async (res) => {
                    let newJokes = res?.data?.data?.list || [];
                    newJokes.reverse();
                    const processedJokes = await Promise.all(
                        newJokes.map(async (joke) => {
                            const parsedContent = await this.parse(joke.content);
                            return { ...joke, parsedContent };
                        })
                    );
                    const allJokes = [...processedJokes, ...this.jokes];
                    allJokes.forEach((joke) => {
                        console.log(joke.created_at);
                    });

                    this.jokes = this.insertDateMarkers(allJokes);
                    this.currentPage++;
                    // 首次进入滚动到底部
                    if (this.scrollToBottomFlag) {
                        this.scrollToBottom();
                        this.scrollToBottomFlag = false;
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        insertDateMarkers(jokes) {
            if (!jokes.length) return [];
            const realJokes = jokes.filter((item) => !item.isDateMarker);
            const processedJokes = [];
            let lastDate = null;
            realJokes.forEach((joke) => {
                const currentDate = joke.created_at.split("T")[0];
                if (currentDate !== lastDate) {
                    const dateMarkerExists = jokes.some((item) => item.isDateMarker && item.date === currentDate);
                    if (!dateMarkerExists) {
                        processedJokes.push({
                            isDateMarker: true,
                            date: this.formatDateToChinese(currentDate),
                            created_at: currentDate + "T00:00:00.000Z",
                        });
                    }
                    lastDate = currentDate;
                }
                processedJokes.push(joke);
            });
            return processedJokes;
        },
        formatDateToChinese(isoDate) {
            const [year, month, day] = isoDate.split("-");
            return `${parseInt(month)}月${parseInt(day)}日`;
        },
        handleScroll() {
            const container = this.$refs.chatContainer;
            if (!container) return;

            // 检查是否滚动到顶部，加载更多历史数据
            if (container.scrollTop === 0) {
                this.fetchJokes();
            }
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.chatContainer;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            });
        },
        jokeTouchStart(joke) {
            this.copySelectJoke = joke;
            this.longPressTimeOut = setTimeout(() => {
                this.copyVisible = true;
            }, 500);
        },
        jokeTouchEnd() {
            clearTimeout(this.longPressTimeOut);
        },
        handleCopy() {
            navigator.clipboard.writeText(this.copySelectJoke.content).then(() => {
                this.$message({
                    message: "复制成功",
                    type: "success",
                });
                this.copyVisible = false;
            });
        },
        async handleEmotionSelected(emotion) {
            this.sendInputVal += emotion.key;
        },
        // 发布
        publish() {
            if (!this.isLogin) {
                User.toLogin();
            } else {
                if (!this.check()) return;

                postJoke({
                    type: "0",
                    content: this.sendInputVal,
                }).then((res) => {
                    this.$message({
                        message: "发布成功,请等待审核",
                        type: "success",
                    });
                    this.sendInputVal = "";
                });
            }
        },

        // 检查内容合法性
        // 纯数字 纯英文 纯汉字 纯符号长度均为128 表情个数限制在10个
        check: function () {
            // 表情 key
            const emotionKeys = Object.keys(emotion);

            let str = this.sendInputVal.trim();

            const regex_1 = /(#[\u4e00-\u9fa5]{1})/g;
            const regex_2 = /(#[\u4e00-\u9fa5]{2})/g;
            const regex_3 = /(#[\u4e00-\u9fa5]{3})/g;

            if (!str.length) {
                this.$notify({
                    title: "错误",
                    message: "内容不能为空",
                    type: "error",
                });
                return false;
            }

            /**
             * 依次判定表情字符为1，2，3个的情况
             */
            const emotion_1 = str.match(regex_1)
                ? str.match(regex_1).filter((emotion) => emotionKeys.includes(emotion))
                : [];

            // 替换表情，注意需要将结果赋值回str
            emotion_1.forEach((emotion) => {
                str = str.replace(emotion, "");
            });

            const emotion_2 = str.match(regex_2)
                ? str.match(regex_2).filter((emotion) => emotionKeys.includes(emotion))
                : [];

            emotion_2.forEach((emotion) => {
                str = str.replace(emotion, "");
            });

            const emotion_3 = str.match(regex_3)
                ? str.match(regex_3).filter((emotion) => emotionKeys.includes(emotion))
                : [];

            emotion_3.forEach((emotion) => {
                str = str.replace(emotion, "");
            });

            const emotionLength = emotion_1.length + emotion_2.length + emotion_3.length;

            this.contentLength = emotionLength;

            if (emotionLength > 10) {
                this.$notify({
                    title: "错误",
                    message: "表情个数不能超过10个",
                    type: "error",
                });
                return false;
            }

            // 计算中文字符数量
            const chineseLength = str.match(/[\u4e00-\u9fa5]/g)?.length || 0;

            // 计算总长度：中文字符算2个长度，其他字符算1个长度
            const totalLength = chineseLength * 2 + (str.length - chineseLength);

            // 判断是否是纯数字或纯字母
            const isPureDigit = /^\d+$/.test(str);
            const isPureAlpha = /^[a-zA-Z]+$/.test(str);

            // 如果是纯数字或纯字母，长度限制为128
            // 否则，中文字符不能超过64个（相当于总长度不超过128）
            if ((isPureDigit || isPureAlpha) && str.length > 128) {
                this.$notify({
                    title: "提示",
                    message: "纯数字或纯字母内容长度不能超过128个字符",
                    type: "warning",
                });
                return false;
            } else if (!isPureDigit && !isPureAlpha && chineseLength > 64) {
                this.$notify({
                    title: "提示",
                    message: "中文字符不能超过64个",
                    type: "warning",
                });
                return false;
            } else if (!isPureDigit && !isPureAlpha && totalLength > 128) {
                this.$notify({
                    title: "提示",
                    message: "内容长度不能超过128个字符",
                    type: "warning",
                });
                return false;
            }

            return true;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/joke/joke-mobile.less";
</style>
