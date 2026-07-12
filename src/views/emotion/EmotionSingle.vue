<template>
    <div class="m-emotion-single-container" v-loading="loading">
        <div class="m-emotion-goback m-content-goback">
            <el-button class="u-back" size="default" icon="ArrowLeft" @click="goBack">{{ $t("pages.emotion.backToList") }}</el-button>
            <div class="u-op" v-if="emotion?.id">
                <span v-if="isEditor" class="u-star el-link el-link--primary" @click="handleStar">
                    <i :class="isStar ? 'el-icon-star-off' : 'el-icon-star-on'"></i>
                    {{ isStar ? $t("pages.emotion.cancelFeatured") : $t("pages.emotion.setFeatured") }}
                </span>
                <span v-if="isAuthor || isEditor" class="u-delete el-link el-link--primary" @click="handleDelete">
                    <i class="el-icon-delete"></i>&nbsp;{{ $t("pages.emotion.delete") }}
                </span>
                <a
                    v-if="isAuthor || isEditor"
                    class="u-edit el-link el-link--primary"
                    :href="editLink('emotion', emotion.id)"
                    target="_blank"
                >
                    <i class="el-icon-edit-outline"></i>&nbsp;{{ $t("pages.emotion.edit") }}
                </a>
            </div>
        </div>
        <el-alert
            v-if="loadError"
            :title="loadError"
            type="error"
            show-icon
            :closable="false"
        />
        <emotion-item v-else-if="emotion?.id" :emotion="emotion" mode="single" />
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
            loadError: "",
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
            this.$router.push({ name: "emotion", query: this.$route.query });
        },
        loadSingle() {
            if (!this.id) return;

            this.loading = true;
            this.loadError = "";
            this.emotion = {};
            getEmotion(this.id)
                .then((res) => {
                    this.emotion = res?.data?.data || {};
                    if (!this.emotion.id) {
                        this.loadError = this.$t("pages.emotion.notFound");
                    }
                })
                .catch(() => {
                    this.loadError = this.$t("pages.emotion.unavailable");
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
                        title: this.$t("pages.emotion.success"),
                        message: this.$t(isStar ? "pages.emotion.cancelFeaturedSuccess" : "pages.emotion.setFeaturedSuccess"),
                        type: "success",
                    });

                    if (skippedAutoAppraise) {
                        this.$notify({
                            title: this.$t("pages.emotion.notice"),
                            message: this.$t("pages.emotion.autoAppraiseSkipped"),
                            type: "warning",
                        });
                    }
                })
                .catch((error) => {
                    const rollbackFailed = !!error?.rollbackError;
                    this.$notify({
                        title: this.$t("pages.emotion.failure"),
                        message: rollbackFailed
                            ? this.$t("pages.emotion.autoAppraiseRollbackFailed")
                            : isStar
                              ? this.$t("pages.emotion.cancelAutoAppraiseFailed")
                              : this.$t("pages.emotion.autoAppraiseFailed"),
                        type: "error",
                    });
                })
                .finally(() => {
                    this.starLoading = false;
                });
        },
        handleDelete() {
            this.$confirm(this.$t("pages.emotion.deleteConfirm"), this.$t("pages.emotion.notice"), {
                confirmButtonText: this.$t("pages.emotion.confirm"),
                cancelButtonText: this.$t("pages.emotion.cancel"),
                type: "warning",
            })
                .then(() => {
                    removeEmotion(this.emotion.id).then(() => {
                        this.$notify({
                            title: this.$t("pages.emotion.success"),
                            message: this.$t("pages.emotion.deleteSuccess"),
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
