<template>
    <div class="m-emotion-publish">
        <!-- <div class="u-title"><i class="el-icon-upload"></i>快速发布</div> -->
        <div class="m-emotion-upload">
            <div v-if="list && list.length && list[0] && list[0].url" class="u-emotion">
                <img :src="list[0].url" />
                <i class="u-emotion-mask"></i>
                <i class="u-emotion-delete el-icon-delete" title="移除" @click="handleRemove"></i>
                <span class="u-num">+ {{ list.length }} 张</span>
            </div>
            <div v-else class="u-upload el-upload el-upload--picture-card" @click="select">
                <i class="el-icon-plus"></i>
            </div>
            <input class="u-upload-input" type="file" multiple @change="upload" ref="uploadInput" :accept="imgTypes" />
        </div>
        <div class="u-emotion-form">
            <el-input
                v-model="content"
                type="textarea"
                :rows="4"
                :maxlength="128"
                id="textarea"
                show-word-limit
                placeholder="快速发布一张表情，再配句骚话？"
            ></el-input>
            <!-- 按钮 -->
            <div class="u-extend">
                <div class="u-extend-form">
                    <!-- <joke-emotion @emotion="insertVariable"></joke-emotion> -->
                    <el-switch
                        class="u-original"
                        v-model.number="data.original"
                        inactive-text="原创"
                        :active-value="1"
                        :inactive-value="0"
                    ></el-switch>
                    <!-- <el-input
                        class="u-author"
                        v-model="data.author"
                        placeholder="（非必填）"
                        v-if="!data.original"
                        size="mini"
                    >
                        <span slot="prepend">原作者</span>
                    </el-input> -->
                    <el-select v-model="type" size="small" placeholder="选择门派">
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
                        </el-option> </el-select
                    ><el-tooltip effect="dark" content="图片可选择批量上传，描述每次换行对应其中一条。" placement="top">
                        <i class="el-icon-info"></i>
                    </el-tooltip>
                </div>
                <el-button
                    class="u-action-btn"
                    type="primary"
                    @click="post"
                    :disabled="loading"
                    :loading="loading"
                    icon="el-icon-position"
                    size="small"
                    >提交</el-button
                >
            </div>
        </div>
    </div>
</template>

<script>
import joke_emotion from "@/components/joke/joke_emotion.vue";
import { uploadEmotion, postEmotion } from "@/service/emotion";
import schoolmap from "@jx3box/jx3box-data/data/xf/schoolid.json";
import { __imgPath, __cdn } from "@/utils/config";
import User from "@jx3box/jx3box-common/js/user";
import cloneDeep from "lodash/cloneDeep";
const imgTypes = ["image/png", "image/jpeg", "image/gif", "image/bmp"];
export default {
    name: "emotion_post",
    components: {
        // "joke-emotion": joke_emotion,
    },
    data() {
        return {
            content: "",
            type: "0",
            data: {
                url: "",
                desc: "",
                original: 0,
                author: "",
                type: "0",
            },
            loading: false,
            schoolmap,
            files: [],
            list: [],
            imgTypes,
        };
    },
    computed: {
        fileInput: function() {
            return this.$refs.uploadInput;
        },
        isLogin: function() {
            return User.isLogin();
        },
    },
    watch: {
        list: {
            deep: true,
            handler(list) {
                if (list.length) {
                    this.content = list.map((item) => item.desc).join("\n");
                }
            },
        },
        content(val) {
            this.contentChange(val);
        },
    },
    methods: {
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
        contentChange(val) {
            const descList = val.split("\n");
            this.list = this.list.map((item, index) => {
                item.desc = (descList.length === 1 ? descList[0] : descList?.[index]) || "";
                return item;
            });
        },
        select: function() {
            this.fileInput.dispatchEvent(new MouseEvent("click"));
        },
        async upload() {
            const files = Array.from(this.fileInput.files);
            for await (let file of files) {
                let formdata = new FormData();
                formdata.append("file", file);
                await uploadEmotion(formdata).then((res) => {
                    const data = {
                        ...this.data,
                        url: __cdn + res.data.data[0],
                        desc: file?.name || "无描述",
                    };
                    this.list.push(data);
                    this.$message({
                        message: "上传成功",
                        type: "success",
                    });
                });
            }
        },
        handleRemove() {
            this.list = [];
            this.fileInput.value = "";
            // this.data.url = "";
            // this.data.desc = "";
        },
        post: function() {
            if (!this.isLogin) {
                User.toLogin();
            } else {
                this.loading = true;
                let list = cloneDeep(this.list);
                list = list.map((item) => {
                    item.type = this.type;
                    return item;
                });

                const promises = list.map((item) => {
                    item.user_id = ~~User.getInfo().uid;
                    item.author = User.getInfo().name;
                    return postEmotion(item);
                });

                promises.length &&
                    Promise.all(promises).then(() => {
                        this.$message({
                            type: "success",
                            message: "表情发布成功",
                        });
                        this.fileInput.value = "";
                        this.loading = false;
                    });
            }
        },
    },
    filters: {
        showSchoolIcon: function(val) {
            return __imgPath + "image/school/" + val + ".png";
        },
    },
};
</script>

<style lang="less">
.m-emotion-publish {
    display: flex;

    .u-emotion-form {
        margin-left: 12px;
        flex: 2;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;

        .m-publish-buttons {
            margin-top: 10px;
        }

        .u-emotion-desc {
            margin-bottom: 10px;
        }
    }
    .u-extend-form {
        .flex;
        gap: 10px;
        align-items: center;
        .el-select {
            margin-top: 3px;
        }
        .el-icon-info {
            cursor: pointer;
        }
    }
}
.m-emotion-upload {
    .u-emotion {
        .pr;
        .size(148px);
        .u-num {
            position: absolute;
            right: 0;
            top: 0;
            color: #fff;
            background: rgba(0, 0, 0, 0.5);
            font-size: 12px;
            padding: 5px;
            border-bottom-left-radius: 5px;
        }

        img {
            .size(100%);
            .y(bottom);
        }

        .u-emotion-mask {
            .none;
            .pa;
            .lt(0);
            .size(100%);
            background-color: rgba(0, 0, 0, 0.6);
        }

        .u-emotion-delete {
            .pa;
            .lt(50%);
            .size(24px);
            .fz(24px);
            padding: 40px;
            transform: translate(-50%, -50%);
            color: #fff;
            .pointer;
            .none;
        }

        &:hover {
            .u-emotion-mask,
            .u-emotion-delete {
                .db;
            }
        }
    }

    .u-upload-input {
        .none;
    }
}
</style>
