<template>
    <el-form ref="form" :model="newComment" class="c-comment-box m-comment-reply">
        <el-form-item>
            <el-input
                rows="6"
                type="textarea"
                :maxlength="maxLength"
                show-word-limit
                v-model="newComment.content"
                placeholder="参与讨论..."
                :id="inputId"
                ref="textarea"
                class="u-comment-editor"
                @paste.native="handlePaste"
                @keydown.delete.native="handleDel"
            ></el-input>
            <div class="c-comment-tools">
                <div class="u-tools">
                    <i class="el-icon-picture-outline u-upload-icon" @click="showUploader = !showUploader"></i>
                    <Emotion class="c-comment-emotion" @selected="handleEmotionSelected" type="pop" :max="6"></Emotion>
                    <quickReply @reply="onQuickReply"></quickReply>
                </div>
            </div>
            <div class="u-toolbar">
                <el-button type="primary" @click="onSubmit" class="u-publish" :disabled="disableSubmitBtn">
                    跟帖
                </el-button>
            </div>
            <Uploader
                class="u-uploader"
                ref="uploader"
                @onFinish="attachmentUploadFinish"
                @onError="attachmentUplodError"
                v-show="showUploader"
            />
        </el-form-item>
    </el-form>
</template>

<script>
import Uploader from "./upload.vue";
import Emotion from "@jx3box/jx3box-emotion/src/Emotion.vue";
import quickReply from "./quick-reply.vue";
import Tribute from "tributejs";
import { getUserList } from "@/service/cms";
import { throttle } from "lodash";

export default {
    name: "CommentInputForm",
    components: {
        Uploader,
        Emotion,
        quickReply,
    },
    props: {
        isBottom: {
            type: Boolean,
            default: false,
        },
    },
    mounted() {
        if (this.isBottom) this.inputId = "textarea-bottom";
        this.initTribute();
    },
    data() {
        return {
            selectedMentions: [],
            tribute: {
                trigger: "@",
                values: [],
            },
            maxLength: 500,
            showUploader: false,
            disableSubmitBtn: false,
            newComment: {
                content: "",
            },
            inputId: "textarea-top",
            is_secret: false,
        };
    },
    methods: {
        initTribute() {
            const textarea = this.$refs.textarea.$el.querySelector("textarea");
            this.tribute = new Tribute({
                trigger: "@",
                requireLeadingSpace: false,
                // 要在对象中搜索的列（接受函数或字符串）
                lookup: "display_name",
                // 默认情况下包含要插入内容的列
                fillAttr: "display_name",
                menuItemLimit: 5,
                values: throttle((text, cb) => {
                    if (text == "") {
                        return cb([]);
                    }
                    getUserList({ name: text }).then((res) => {
                        const users = res.data.data?.list || [];

                        return cb(users);
                    });
                }, 1000), // 节流,
                // 当你的 values 函数是异步时，显示的可选加载模板
                loadingItemTemplate: "<div>Loading...</div>",
                // 选择时调用的函数，返回要插入的内容
                selectTemplate: (item) => {
                    this.selectedMentions.push(item.original);
                    return "@" + item.original.display_name;
                },
                // 显示菜单中项目的模板
                menuItemTemplate: function (item) {
                    const avatarSrc = item.original.user_avatar || "https://img.jx3box.com/image/common/avatar.png";
                    return `
                        <img src="${avatarSrc}" alt="Avatar" style="width: 20px; height: 20px; border-radius: 50%;">
                        <span>${item.original.display_name}</span>
                        `;
                },
                noMatchTemplate: function () {
                    return "<li>请输入用户昵称</li>";
                },
            });
            this.tribute.attach(textarea);
        },
        // 退格触发@搜索
        handleDel(e) {
            const comment = e.target.value.slice(0, -1);
            const regex = /@([\s\S]+)?$/;
            const match = regex.test(comment);
            if (match) {
                const textarea = this.$refs.textarea.$el.querySelector("textarea");
                var event = new KeyboardEvent("keydown", {
                    key: "Meta",
                    code: "MetaLeft",
                    keyCode: 91,
                    which: 91,
                    bubbles: true,
                });

                textarea.dispatchEvent(event);
            }
        },
        onSubmit() {
            this.disableSubmitBtn = true;
            if (this.$refs.uploader) {
                this.$refs.uploader.upload();
            } else {
                this.attachmentUploadFinish([]);
            }
        },
        onQuickReply(item) {
            this.$emit("submit", {
                content: item,
                attachmentList: [],
                is_template: 1,
            });
        },
        attachmentUploadFinish(data) {
            let content = this.newComment.content?.replace(/\n/g, "<br>");
            // 去重
            let mentions = this.selectedMentions.reduce((acc, current) => {
                if (!acc.some((item) => item.ID === current.ID)) {
                    acc.push(current);
                }
                return acc;
            }, []);

            // 找出所有@的人
            mentions = mentions.filter((mention) => {
                return content.indexOf(mention.display_name + " ") > -1;
            });

            // at的内容 全部替换为a标签
            mentions.forEach((mention) => {
                content = content.replace(
                    new RegExp("@" + mention.display_name + " ", "g"),
                    `<a class="e-jx3-author w-jx3-element" href="/author/${mention.ID}"  target="_blank" rel="noopener" data-type="author"  data-mode="" data-id="${mention.ID}">@${mention.display_name} </a>`
                );
            });

            this.$emit("submit", {
                content: content,
                is_secret: this.is_secret ? 1 : 0,
                attachmentList: data,
                atUsers: mentions,
            });
            this.newComment = {
                content: "",
            };
            this.showUploader = false;
            this.disableSubmitBtn = false;
        },
        attachmentUplodError() {
            this.disableSubmitBtn = false;
        },
        handleEmotionSelected(key) {
            this.insertVariable(key);
        },
        async insertVariable(emotionVal) {
            const myField = this.$refs.textarea.$el.querySelector("textarea");
            const value = emotionVal.key;
            if (myField.selectionStart || myField.selectionStart === 0) {
                let startPos = myField.selectionStart;
                let endPos = myField.selectionEnd;

                this.newComment.content =
                    myField.value.substring(0, startPos) +
                    value +
                    myField.value.substring(endPos, myField.value.length);

                await this.$nextTick();

                myField.focus();
                myField.setSelectionRange(endPos + value.length, endPos + value.length);
            } else {
                this.newComment.content = value;
            }
        },
        handlePaste(event) {
            const clipboardItems = event.clipboardData.items;
            for (let i = 0; i < clipboardItems.length; i++) {
                const item = clipboardItems[i];
                if (item.type.indexOf("image") !== -1) {
                    // 阻止默认粘贴图片的名字
                    event.preventDefault();
                    const blob = item.getAsFile();
                    const file = new File([blob], new Date().getTime() + "-" + blob.name, { type: blob.type });
                    this.$refs.uploader.addFile(file);
                    if (!this.showUploader) {
                        this.showUploader = true;
                    }
                }
            }
        },
    },
};
</script>

<style lang="less">
.tribute-container {
    background: #fff;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    border-radius: 8px;
    margin-top: 15px;
    .highlight {
        background-color: #f0f0f0; /* 设置背景颜色 */
        color: red; /* 设置文字颜色 */
    }
    ul {
        list-style: none;
        margin: 0;
        padding: 8px 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    li {
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 4px 16px;
        gap: 4px;
    }
}
.m-comment-reply {
    position: relative;

    .u-tools {
        .flex;
        width: 100%;
        align-items: center;
        overflow: hidden;
        height: 48px;
    }
    .u-upload-icon {
        font-size: 24px;
        cursor: pointer;
        margin-right: 10px;
        color: #3d454d;
    }
    .c-comment-secret {
        margin-left: 15px;
        .u-secret {
            display: flex;
            align-items: center;
            .el-checkbox__inner {
                display: block;
            }
        }
    }
    .c-comment-emotion {
        margin: 0;
        position: relative;
        top: 7px;
    }
    .u-publish {
        margin-bottom: 4px;
        // background: #4080ff;
        // border: 1px solid #4080ff;
        &:hover {
            opacity: 0.9;
        }
        .size(180px,42px);
    }
}
@media screen and (max-width: @phone) {
    .u-comment-editor.el-textarea {
        .el-input__count {
            bottom: auto;
        }
    }
}
</style>
