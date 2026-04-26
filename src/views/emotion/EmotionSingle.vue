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
import { toggleStarWithAutoAppraise } from "@/utils/starAutoAppraise";

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
            starLoading: false,
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
            if (this.starLoading || !this.emotion?.id) return;

            const isStar = this.isStar;
            this.starLoading = true;

            toggleStarWithAutoAppraise({
                postType: "emotion",
                articleId: this.emotion.id,
                userId: this.emotion.user_id,
                isStar,
                starRequest: starEmotion,
                unstarRequest: unstarEmotion,
            })
                .then(({ nextStar, skippedAutoAppraise }) => {
                    this.emotion = {
                        ...this.emotion,
                        star: nextStar,
                    };
                    this.$notify({
                        title: "成功",
                        message: isStar ? "取消加精成功" : "加精成功",
                        type: "success",
                    });

                    if (skippedAutoAppraise) {
                        this.$notify({
                            title: "提示",
                            message: "该作品无作者ID，未执行自动品鉴",
                            type: "warning",
                        });
                    }
                })
                .catch((error) => {
                    const rollbackFailed = !!error?.rollbackError;
                    this.$notify({
                        title: "失败",
                        message: rollbackFailed
                            ? "自动品鉴失败，且回滚失败，请稍后重试"
                            : isStar
                              ? "自动取消品鉴失败，已回滚精选状态"
                              : "自动品鉴失败，已回滚精选状态",
                        type: "error",
                    });
                })
                .finally(() => {
                    this.starLoading = false;
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
