<template>
    <div class="c-emotion">
        <el-tabs class="u-tabs" type="card" tab-position="bottom" size="small">
            <el-tab-pane v-for="item in decorationEmotion" :key="item.group_id" :label="item.group_name">
                <template #label>
                    <img
                        :src="emotionLink(item.items[0].filename)"
                        :alt="item.items[0].key"
                        :title="item.group_name"
                        class="u-tab-label"
                    />
                </template>
                <div class="c-jx3box-emotion-list">
                    <span
                        v-for="emotion in item.items"
                        :key="emotion.emotion_id"
                        class="c-jx3box-emotion-item"
                        @click="handleEmotionClick(emotion)"
                    >
                        <img
                            class="u-emotion-item"
                            :src="emotionLink(emotion.filename)"
                            :alt="emotion.key"
                            :title="emotion.key"
                        />
                    </span>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
<script>
import { getDecoration } from "@/service/cms";
import { __imgPath, __dataPath } from "@/utils/config";
import User from "@jx3box/jx3box-common/js/user";

export default {
    data() {
        return {
            emotionList: [],
            decoration: [],

            EmojiPath: __imgPath + "emotion/output/",
        };
    },
    computed: {
        isLogin: function () {
            return User.isLogin();
        },
        decorationEmotion({ emotionList, decoration }) {
            // 默认表情
            const defaultEmo = emotionList.filter((item) => item.group_id === 0);
            if (decoration.length === 0) {
                console.log(defaultEmo);
                return defaultEmo;
            } else {
                // 购买的表情
                const arr = emotionList.filter((item) => decoration.includes(item.group_name));
                // 截取4个
                return [...defaultEmo, ...arr].slice(0, this.max);
            }
        },
    },
    mounted() {
        this.loadEmotionList();
        this.loadDecoration();
    },

    methods: {
        emotionLink(filename) {
            if (!filename) return "";
            if (filename.startsWith("http")) {
                return filename;
            }
            return `${this.EmojiPath}${filename}`;
        },
        // 获取全部表情
        loadEmotionList() {
            try {
                const emotionJson = sessionStorage.getItem("jx3_emotion");
                if (emotionJson) {
                    this.emotionList = JSON.parse(emotionJson);
                    return;
                } else {
                    fetch(`${__dataPath}emotion/output/catalog.json`)
                        .then((response) => response.json())
                        .then((data) => {
                            this.emotionList = data;
                            sessionStorage.setItem("jx3_emotion", JSON.stringify(data));
                        });
                }
            } catch (e) {
                fetch(`${__dataPath}emotion/output/catalog.json`)
                    .then((response) => response.json())
                    .then((data) => {
                        this.emotionList = data;
                        sessionStorage.setItem("jx3_emotion", JSON.stringify(data));
                    });
            }
        },
        // 获取虚拟资产
        loadDecoration() {
            if (!User.isLogin()) return;

            getDecoration({ using: 1, type: "emotion" }).then((res) => {
                this.decoration = res.data?.data?.map((item) => item?.val);
            });
        },
        handleEmotionClick(emotion) {
            this.$emit("selected", emotion);
        },
    },
};
</script>
<style scoped lang="less">
@black5: rgba(28, 28, 28, 0.05);
@black5-dark: rgba(255, 255, 255, 0.05);
.c-emotion {
    margin-top: 1rem;
    .u-tabs {
        .c-jx3box-emotion-list {
            background-color: @black5;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-content: flex-start;
            border-radius: 4px 4px 0 0px;
            max-height: 200px;
            overflow-y: scroll;
            .c-jx3box-emotion-item {
                position: relative;
                width: 11.111%;
                padding-bottom: 11.111%;

                .u-emotion-item {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }
            }
        }
        :deep(.el-tabs__header) {
            border: none;
            margin-top: 0;
            .el-tabs__nav {
                border: none;
                .el-tabs__item {
                    line-height: 1;
                    padding: 0;
                    .size(2.5rem);
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    &.is-active {
                        background-color: @black5;
                    }
                }
            }
        }
    }
}
@media (prefers-color-scheme: dark) {
    .c-emotion {
        .u-tabs {
            .c-jx3box-emotion-list {
                background-color: @black5-dark;
                .c-jx3box-emotion-item {
                    .u-emotion-item {
                    }
                }
            }
            :deep(.el-tabs__header) {
                .el-tabs__nav {
                    .el-tabs__item {
                        &.is-active {
                            background-color: @black5-dark;
                        }
                    }
                }
            }
        }
    }
}
</style>
