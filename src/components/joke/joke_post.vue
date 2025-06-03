<template>
    <div class="m-joke-publish">
        <el-input
            v-model="content"
            type="textarea"
            :rows="4"
            placeholder="快速发布一条骚话"
            id="textarea"
            :minlength="1"
            show-word-limit
        ></el-input>
        <div class="u-actions">
            <div>
                <joke-emotion @emotion="insertVariable"></joke-emotion>
                <el-select class="u-type" v-model="type" size="small" placeholder="选择门派">
                    <el-option v-for="(school, i) in schoolmap" :key="i" :value="i" :label="school">
                        <div style="display: flex; align-items: center">
                            <img
                                class="u-icon"
                                style="margin-right: 5px"
                                width="24"
                                height="24"
                                :src="i | showSchoolIcon"
                                :alt="school"
                            />
                            {{ school }}
                        </div>
                    </el-option>
                </el-select>
            </div>
            <el-button
                type="primary"
                size="small"
                @click="publish"
                icon="el-icon-position"
                :loading="processing"
                :disabled="processing"
                >提交</el-button
            >
        </div>
    </div>
</template>

<script>
import joke_emotion from "@/components/joke/joke_emotion.vue";
import emotion from "@jx3box/jx3box-emotion/data/default.json";
import schoolmap from "@jx3box/jx3box-data/data/xf/schoolid.json";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import User from "@jx3box/jx3box-common/js/user";
import { postJoke } from "@/service/joke";
export default {
    components: {
        "joke-emotion": joke_emotion,
    },
    data: () => ({
        // 快捷发布
        content: "",
        type: "0",
        schoolmap,

        processing: false,
    }),
    computed: {
        isLogin: function () {
            return User.isLogin();
        },
    },
    methods: {
        /**
         * add emotion to textarea
         * @parma {string} value emotion key
         */
        async insertVariable(emotion) {
            const value = emotion.key;
            const myField = document.querySelector("#textarea");
            if (myField.selectionStart || myField.selectionStart === 0) {
                let startPos = myField.selectionStart;
                let endPos = myField.selectionEnd;

                this.content =
                    myField.value.substring(0, startPos) +
                    value +
                    myField.value.substring(endPos, myField.value.length);

                await this.$nextTick();

                myField.focus();
                myField.setSelectionRange(endPos + value.length, endPos + value.length);
            } else {
                this.content = value;
            }
        },
        // 快捷发布
        publish: function () {
            if (!this.isLogin) {
                User.toLogin();
            } else {
                if (!this.check()) return;

                this.processing = true;

                postJoke({
                    type: this.type === "all" ? "0" : this.type,
                    content: this.content,
                })
                    .then((res) => {
                        let data = res?.data?.data;
                        this.$message({
                            message: "发布成功,请等待审核",
                            type: "success",
                        });
                        this.content = "";
                    })
                    .finally(() => {
                        this.processing = false;
                    });
            }
        },
        // 检查内容合法性
        // 纯数字 纯英文 纯汉字 纯符号长度均为128 表情个数限制在10个
        check: function () {
            // 表情 key
            const emotionKeys = Object.keys(emotion);

            let str = this.content.trim();

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
    filters: {
        showSchoolIcon: function (val) {
            return __imgPath + "image/school/" + val + ".png";
        },
    },
};
</script>
