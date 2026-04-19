<template>
    <div class="m-emotion-single-container" v-loading="loading">
        <div class="m-emotion-goback">
            <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">返回列表</el-button>
            <div class="u-op" v-if="emotion?.id">
                <span v-if="isEditor" class="u-star el-link el-link--primary" @click="handleStar">
                    <i :class="isStar ? 'el-icon-star-off' : 'el-icon-star-on'"></i>
                    {{ isStar ? "取消精选" : "设为精选" }}
                </span>
                <span v-if="isAuthor || isEditor" class="u-delete el-link el-link--primary" @click="handleDelete">
                    <i class="el-icon-delete"></i>&nbsp;删除
                </span>
                <a
                    v-if="isAuthor || isEditor"
                    class="u-edit el-link el-link--primary"
                    :href="editLink('emotion', emotion.id)"
                    target="_blank"
                >
                    <i class="el-icon-edit-outline"></i>&nbsp;编辑
                </a>
            </div>
        </div>
        <emotion-item v-if="emotion?.id" :emotion="emotion" mode="single" />
    </div>
</template>

<script>
import emotion_item from "@/components/emotion/emotion_item";
import { editLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { getEmotion, removeEmotion, starEmotion, unstarEmotion } from "@/service/emotion";

export default {
    name: "EmotionSingle",
    components: {
        "emotion-item": emotion_item,
    },
    props: {
        id: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            loading: false,
            emotion: {},
        };
    },
    computed: {
        isEditor() {
            return User.isEditor();
        },
        isAuthor() {
            return this.emotion?.user_id == User.getInfo().uid;
        },
        isStar() {
            return !!this.emotion?.star;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler() {
                this.loadSingle();
            },
        },
    },
    methods: {
        editLink,
        goBack() {
            this.$router.push("/emotion");
        },
        loadSingle() {
            if (!this.id) return;

            this.loading = true;
            getEmotion(this.id)
                .then((res) => {
                    this.emotion = res?.data?.data || {};
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        handleStar() {
            const request = this.isStar ? unstarEmotion(this.emotion.id) : starEmotion(this.emotion.id);
            const message = this.isStar ? "取消加精成功" : "加精成功";
            const nextStar = this.isStar ? 0 : 1;

            request.then(() => {
                this.emotion = {
                    ...this.emotion,
                    star: nextStar,
                };
                this.$notify({
                    title: "成功",
                    message,
                    type: "success",
                });
            });
        },
        handleDelete() {
            this.$confirm("此操作将会删除该表情，是否继续？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    removeEmotion(this.emotion.id).then(() => {
                        this.$notify({
                            title: "成功",
                            message: "删除成功",
                            type: "success",
                        });
                        this.goBack();
                    });
                })
                .catch(() => {});
        },
    },
};
</script>
