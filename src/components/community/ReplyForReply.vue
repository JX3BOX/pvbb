<template>
    <el-form ref="form" class="c-comment-subbox m-comment-editor" :class="{'m-comment-mask': commentStrict}">
        <div class="u-mask">
            参与评论，需先进行<a href="/dashboard/auth" class="u-link">账号认证</a>。
        </div>
        <div class="u-subbox-label">
            回复
            <el-link type="primary" target="_blank" :href="userHref">＠{{ username }}</el-link>
            ：
        </div>
        <el-form-item>
            <el-input type="textarea" v-model="content" :id="'id' + inputId" placeholder="输入回复..."></el-input>
        </el-form-item>
        <el-form-item>
            <div class="c-comment-tools">
                <Emotion class="c-comment-emotion" @selected="handleEmotionSelected" type="pop" :max="6"></Emotion>
                <el-button
                    class="u-publish"
                    size="mini"
                    type="primary"
                    @click="submintReply()"
                    :disabled="disableSubmitBtn"
                    >提交</el-button
                >
                <el-button size="mini" type="text" @click="hideForm()">收起</el-button>
            </div>
        </el-form-item>
    </el-form>
</template>

<script>
// import Uploader from "./upload.vue";
import Emotion from "@jx3box/jx3box-emotion/src/Emotion.vue";
export default {
    props: ["username", "userHref", "currentId", "commentStrict"],
    data: function () {
        return {
            content: "",
            showUploader: false,
            disableSubmitBtn: false,
            inputId: "",
        };
    },
    components: {
        // Uploader,
        Emotion,
    },
    mounted() {
        if (this.currentId) this.inputId = this.currentId;
    },
    methods: {
        submintReply() {
            this.disableSubmitBtn = true;
            if (this.$refs.uploader) {
                this.$refs.uploader.upload();
            } else {
                this.attachmentUploadFinish([]);
            }
        },
        hideForm() {
            this.$emit("hideForm");
        },
        attachmentUploadFinish(data) {
            this.disableSubmitBtn = false;
            this.$emit("doReply", {
                content: this.content,
                attachmentList: data,
            });
            this.content = "";
            this.showUploader = false;
        },
        attachmentUplodError() {
            this.disableSubmitBtn = false;
        },
        async handleEmotionSelected(emotion) {
            const myField = document.querySelector(`#id${this.inputId}`);
            const value = emotion.key;
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
    },
};
</script>

<style lang="less">
.m-comment-editor {
    margin-bottom: 10px;
    .u-subbox-label {
        margin-bottom: 10px;
        .fz(14px);
        .flex;
        gap: 3px;
    }
    .el-form-item {
        margin: 0;
    }

    // .u-publish {
        // margin-bottom: 4px;
        // background: #4080ff;
        // border:none;
        // &:hover {
        //     background-color:lighten(#4080ff, 2%);
        // }
    // }
    .c-comment-emotion {
        display: inline-block;
        height: 24px;
        margin: 0 10px 0 0;
        vertical-align: middle;
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
        color: @primary;
    }
}
.m-comment-mask {
    .pr;
    .u-mask {
        .db;
    }
}
</style>
