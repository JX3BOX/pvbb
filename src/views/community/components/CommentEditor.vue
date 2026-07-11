<template>
    <el-form ref="form" :model="newComment" class="c-comment-box m-comment-reply">
        <div class="u-mask">
            {{ $t("pages.community.reply.authRequiredPrefix")
            }}<a href="/dashboard/auth" target="_blank" class="u-link">{{
                $t("pages.community.reply.accountVerification")
            }}</a
            >{{ $t("pages.community.reply.authRequiredSuffix") }}
        </div>
        <el-form-item>
            <el-input
                :rows="6"
                type="textarea"
                :maxlength="maxLength"
                show-word-limit
                v-model="newComment.content"
                :placeholder="$t('pages.community.reply.discussionPlaceholder')"
                :id="inputId"
                ref="textarea"
                class="u-comment-editor"
                @paste="handlePaste"
                @keydown.delete="handleDel"
            ></el-input>
            <div class="c-comment-tools">
                <div class="u-tools">
                    <i
                        v-if="isLogin"
                        class="el-icon-picture-outline u-upload-icon"
                        @click="showUploader = !showUploader"
                    ></i>
                    <Emotion class="c-comment-emotion" @selected="handleEmotionSelected" type="pop" :max="6"></Emotion>
                    <quickReply @reply="onQuickReply"></quickReply>
                </div>
            </div>
            <div class="u-toolbar">
                <el-button
                    type="primary"
                    @click="onSubmit"
                    class="u-publish"
                    :disabled="disableSubmitBtn || submitting"
                    :loading="submitting"
                >
                    {{ $t("pages.community.reply.followup") }}
                </el-button>
            </div>
            <Uploader
                v-if="isLogin"
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
import Uploader from "./Uploader.vue";
import Emotion from "@jx3box/jx3box-emotion/src/Emotion2.vue";
import QuickReply from "./QuickReply.vue";
import Tribute from "tributejs";
import { getUserList } from "@/service/cms";
import { debounce } from "lodash";
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { escapeHtml } from "@/utils/community";

export default {
    name: "CommentInputForm",
    components: {
        Uploader,
        Emotion,
        QuickReply,
    },
    props: {
        isBottom: {
            type: Boolean,
            default: false,
        },
        submitting: {
            type: Boolean,
            default: false,
        },
        isLogin: {
            type: Boolean,
            default: false,
        },
        initialContent: {
            type: String,
            default: "",
        },
        initialMentions: {
            type: Array,
            default: () => [],
        },
    },
    mounted() {
        if (this.isBottom) this.inputId = "textarea-bottom";
        this.initTribute();
    },
    beforeUnmount() {
        ++this.mentionRequestVersion;
        this.mentionSearch?.cancel?.();
        if (this.tribute && this.tributeTextarea) {
            this.tribute.detach(this.tributeTextarea);
        }
        this.tribute = null;
        this.tributeTextarea = null;
    },
    data() {
        return {
            selectedMentions: this.initialMentions.map((item) => ({ ...item })),
            tribute: null,
            tributeTextarea: null,
            mentionSearch: null,
            mentionRequestVersion: 0,
            maxLength: 500,
            showUploader: false,
            disableSubmitBtn: false,
            newComment: {
                content: this.initialContent,
            },
            inputId: "textarea-top",
            is_secret: false,
        };
    },
    watch: {
        submitting(val, oldVal) {
            if (oldVal && !val) {
                this.disableSubmitBtn = false;
            }
        },
        initialContent(value) {
            this.newComment.content = value || "";
        },
        initialMentions: {
            deep: true,
            handler(value) {
                this.selectedMentions = Array.isArray(value) ? value.map((item) => ({ ...item })) : [];
            },
        },
    },
    methods: {
        initTribute() {
            const textarea = this.$refs.textarea.$el.querySelector("textarea");
            const loadingText = escapeHtml(this.$t("pages.community.reply.mentionLoading"));
            const avatarAlt = escapeHtml(this.$t("pages.community.common.avatarAlt"));
            const searchTip = escapeHtml(this.$t("pages.community.reply.mentionSearchTip"));
            const runMentionSearch = debounce((text, cb, requestVersion) => {
                getUserList({ name: text })
                    .then((res) => {
                        if (!this.tribute || requestVersion !== this.mentionRequestVersion) return;
                        cb(res.data.data?.list || []);
                    })
                    .catch(() => {
                        if (this.tribute && requestVersion === this.mentionRequestVersion) cb([]);
                    });
            }, 300);
            this.mentionSearch = (text, cb) => {
                const requestVersion = ++this.mentionRequestVersion;
                if (text == "") {
                    runMentionSearch.cancel();
                    return cb([]);
                }
                runMentionSearch(text, cb, requestVersion);
            };
            this.mentionSearch.cancel = () => runMentionSearch.cancel();
            this.tribute = new Tribute({
                trigger: "@",
                requireLeadingSpace: false,
                // 要在对象中搜索的列（接受函数或字符串）
                lookup: "display_name",
                // 默认情况下包含要插入内容的列
                fillAttr: "display_name",
                menuItemLimit: 5,
                values: this.mentionSearch,
                // 当你的 values 函数是异步时，显示的可选加载模板
                loadingItemTemplate: `<div>${loadingText}</div>`,
                // 选择时调用的函数，返回要插入的内容
                selectTemplate: (item) => {
                    this.selectedMentions.push(item.original);
                    return "@" + String(item.original.display_name || "");
                },
                // 显示菜单中项目的模板
                menuItemTemplate: (item) => {
                    const avatarSrc = escapeHtml(this.getSafeAvatarUrl(item.original.user_avatar));
                    const displayName = escapeHtml(String(item.original.display_name || ""));
                    return `
                        <img src="${avatarSrc}" alt="${avatarAlt}" style="width: 20px; height: 20px; border-radius: 50%;">
                        <span>${displayName}</span>
                        `;
                },
                noMatchTemplate: function () {
                    return `<li>${searchTip}</li>`;
                },
            });
            this.tribute.attach(textarea);
            this.tributeTextarea = textarea;
        },
        getSafeAvatarUrl(value) {
            const fallback = "https://img.jx3box.com/image/common/avatar.png";
            const image = resolveImagePath(value || fallback);
            try {
                const url = new URL(image, window.location.origin);
                return ["http:", "https:"].includes(url.protocol) ? url.href : fallback;
            } catch (_) {
                return fallback;
            }
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
            if (this.submitting || this.disableSubmitBtn) return;
            this.disableSubmitBtn = true;
            if (this.$refs.uploader) {
                this.$refs.uploader.upload();
            } else {
                this.attachmentUploadFinish([]);
            }
        },
        onQuickReply(item) {
            if (this.submitting || this.disableSubmitBtn) return;
            this.disableSubmitBtn = true;
            this.$emit("submit", {
                content: item,
                draftContent: item,
                draftMentions: [],
                attachmentList: [],
                is_template: 1,
            });
        },
        attachmentUploadFinish(data) {
            let content = String(this.newComment.content || "").replace(/\n/g, "<br>");
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
                const id = Number(mention.ID);
                if (!Number.isInteger(id) || id <= 0) return;
                const displayName = String(mention.display_name || "");
                const namePattern = displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const safeDisplayName = escapeHtml(displayName);
                content = content.replace(
                    new RegExp("@" + namePattern + " ", "g"),
                    () =>
                        `<a class="e-jx3-author w-jx3-element" href="/author/${id}" target="_blank" rel="noopener" data-type="author" data-mode="" data-id="${id}">@${safeDisplayName} </a>`
                );
            });

            this.$emit("submit", {
                content: content,
                draftContent: String(this.newComment.content || ""),
                draftMentions: this.selectedMentions,
                is_secret: this.is_secret ? 1 : 0,
                attachmentList: data,
                atUsers: mentions,
            });
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
            if (!this.isLogin) return;
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
        reset() {
            this.newComment = { content: "" };
            this.selectedMentions = [];
            this.showUploader = false;
            this.disableSubmitBtn = false;
        },
        unlock() {
            this.disableSubmitBtn = false;
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
    }
    .u-publish {
        // margin-bottom: 4px;
        // background: #4080ff;
        // border: 1px solid #4080ff;
        &:hover {
            opacity: 0.9;
        }
        .size(180px,42px);
    }

    .pr;

    .u-mask {
        .pa;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.8);
        z-index: 10;
        display: none;
        text-align: center;
        align-content: center;
    }

    .u-link {
        color: @v4primary;
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
