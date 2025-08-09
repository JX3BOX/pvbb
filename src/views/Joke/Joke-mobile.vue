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
            <div class="m-robot">
                <img class="u-icon" svg-inline src="@/assets/img/joke/robot-icon.svg" alt="" />
                <div class="u-tip">尚未开放发送功能，长按骚话复制</div>
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
import JX3_EMOTION from "@jx3box/jx3box-emotion";
import { getJokes } from "@/service/joke";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "Joke",
    components: {},
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
        };
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
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/joke/joke-mobile.less";
</style>
