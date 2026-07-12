<template>
    <div class="m-joke-item">
        <div class="u-content" @click="handleContent" :class="mode === 'single' ? 'on' : ''">
            <i class="u-star" :class="isStar ? 'on' : ''" v-if="isStar" :title="$t('pages.joke.featuredTitle')">★</i>
            <span class="u-sentence" v-html="content"></span>
        </div>
        <div class="u-misc">
            <div class="u-op">
                <!-- 作者 -->
                <span class="u-user">
                    <img width="24" height="24" :src="showAvatar(user_avatar)" />
                    <a :href="authorLink(joke.user_id)" target="_blank" v-if="joke.user_id">{{ user_name }}</a>
                    <span v-else>{{ joke.author || $t("pages.joke.anonymous") }}</span>
                </span>
                <!-- 复制 -->
                <el-link type="primary" class="u-copy" :disabled="disabled" @click="handleCopy(joke.content)">
                    <i class="el-icon-document-copy"></i> {{ copyLabel }}
                </el-link>
                <!-- 点赞 -->
                <a class="u-like" :class="{ on: isLike }" :title="$t('pages.joke.like')" @click="addLike">
                    <i class="like-icon">{{ isLike ? "♥" : "♡" }}</i
                    >{{ $t("pages.joke.like") }}
                    <span class="like-count" v-if="count">{{ count }}</span>
                </a>
                <!-- 编辑（管理&作者 - 单页） -->
                <a
                    v-if="mode === 'single' && (isAuthor || isEditor)"
                    class="u-edit el-link el-link--primary"
                    :href="editLink('joke', joke.id)"
                    target="_blank"
                >
                    <i class="el-icon-edit-outline"></i> {{ $t("pages.joke.edit") }}
                </a>
            </div>
            <div class="u-other">
                <template v-if="isEditor">
                    <!-- 精选 -->
                    <a class="u-op-item u-op-star el-link el-link--primary" :class="{'on': isStar}" @click="handleStar">
                        <i :class="isStar ? 'el-icon-star-off' : 'el-icon-star-on'"></i>
                        {{ isStar ? $t("pages.joke.cancelFeatured") : $t("pages.joke.markFeatured") }}
                    </a>
                    <!-- 删除 -->
                    <a class="u-op-item u-op-delete el-link el-link--primary" @click="handleDelete">
                        <i class="el-icon-delete"></i> {{ $t("pages.joke.delete") }}
                    </a>
                    <!-- 批量精选选择 -->
                    <el-checkbox
                        v-if="mode !== 'single'"
                        v-model="checked"
                        @change="toggleSelection"
                        class="u-op-item u-op-gift"
                        >{{ $t("pages.joke.selected") }}</el-checkbox
                    >
                </template>
                <!-- 时间 -->
                <span class="u-date">
                    <i class="el-icon-date"></i>&nbsp;
                    <time>{{ dateFormat(joke.created_at) }}</time>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import JX3_EMOTION from "@jx3box/jx3box-emotion";
import { dateFormat } from "@/utils/dateFormat";
import { showAvatar, authorLink, editLink } from "@jx3box/jx3box-common/js/utils";
import { starJoke, removeJoke, unstarJoke } from "@/service/joke";
import User from "@jx3box/jx3box-common/js/user";
import { postStat } from "@jx3box/jx3box-common/js/stat";
import { toggleStarWithAutoAppraise } from "@/utils/starAutoAppraise";
import { isJokeListHistoryEntry } from "@/utils/joke";

export default {
    name: "joke_item",
    props: {
        joke: {
            type: Object,
            default: () => ({}),
        },
        mode: {
            type: String,
            default: "list",
        },
        selectedIds: {
            type: Array,
            default: () => [],
        },
    },
    emits: ["update", "selection-change"],
    data() {
        return {
            disabled: false,
            copyLabel: this.$t("pages.joke.copy"),
            copyResetTimer: null,

            // 加星
            isStar: !!this.joke?.star,
            starLoading: false,

            // 点赞
            count: 0,
            isLike: false,
            checked: false,

            content: "",
        };
    },
    computed: {
        isEditor: function () {
            return User.isEditor();
        },
        user_avatar: function () {
            return this.joke?.user_info?.user_avatar;
        },
        user_name: function () {
            return this.joke?.user_info?.display_name;
        },
        isAuthor: function () {
            const user = User.getInfo();
            return user.uid === this.joke.user_id;
        },
    },
    watch: {
        joke: {
            handler: function (val) {
                if (!val) return;
                this.count = val.count;
                this.parse(val.content || "");
                // 同步 isStar 状态
                this.isStar = !!val.star;
            },
            deep: true,
            immediate: true,
        },
        selectedIds: {
            handler: function (val) {
                this.checked = val.map(String).includes(String(this.joke.id));
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        dateFormat: function (val) {
            return dateFormat(new Date(val));
        },
        showAvatar: function (val) {
            return showAvatar(val);
        },
        authorLink,
        async parse(str) {
            const ins = new JX3_EMOTION(str);
            const result = await ins._renderHTML();
            this.content = result;
        },
        // 复制
        async handleCopy(str) {
            if (this.disabled) return;
            this.disabled = true;
            try {
                await navigator.clipboard.writeText(str);
                this.copyLabel = this.$t("pages.joke.copied");
                this.copyResetTimer = window.setTimeout(() => {
                    this.copyLabel = this.$t("pages.joke.copy");
                    this.disabled = false;
                }, 3000);
            } catch (_) {
                this.copyLabel = this.$t("pages.joke.copy");
                this.disabled = false;
                this.$notify({
                    title: this.$t("pages.joke.copyFailed"),
                    message: this.$t("pages.joke.clipboardDenied"),
                    type: "warning",
                });
            }
        },
        // 编辑
        editLink,
        // 点赞
        addLike: function () {
            if (this.isLike) return;

            this.count++;
            if (!this.isLike) {
                postStat("joke", this.joke?.id, "likes");
            }
            this.isLike = true;
        },
        // 精选
        handleStar() {
            if (this.starLoading || !this.joke?.id) return;

            const isStar = !!this.isStar;
            this.starLoading = true;

            toggleStarWithAutoAppraise({
                postType: "joke",
                articleId: this.joke.id,
                userId: this.joke.user_id,
                isStar,
                starRequest: starJoke,
                unstarRequest: unstarJoke,
            })
                .then(({ nextStar, skippedAutoAppraise }) => {
                    this.$notify({
                        title: this.$t("pages.joke.success"),
                        message: isStar ? this.$t("pages.joke.cancelFeaturedSuccess") : this.$t("pages.joke.featuredSuccess"),
                        type: "success",
                    });
                    this.isStar = !!nextStar;

                    if (skippedAutoAppraise) {
                        this.$notify({
                            title: this.$t("pages.joke.notice"),
                            message: this.$t("pages.joke.noAuthorAutoAppraise"),
                            type: "warning",
                        });
                    }

                    this.$emit("update", { noCache: true });
                })
                .catch((error) => {
                    const rollbackFailed = !!error?.rollbackError;
                    this.$notify({
                        title: this.$t("pages.joke.failed"),
                        message: rollbackFailed
                            ? this.$t("pages.joke.autoAppraiseRollbackFailed")
                            : isStar
                              ? this.$t("pages.joke.cancelAutoAppraiseFailed")
                              : this.$t("pages.joke.autoAppraiseFailed"),
                        type: "error",
                    });
                })
                .finally(() => {
                    this.starLoading = false;
                });
        },
        // 删除
        handleDelete() {
            this.$confirm(this.$t("pages.joke.deleteConfirm"), this.$t("pages.joke.notice"), {
                confirmButtonText: this.$t("pages.joke.confirm"),
                cancelButtonText: this.$t("pages.joke.cancel"),
                type: "warning",
            })
                .then(() => {
                    return removeJoke(this.joke.id).then(() => {
                        this.$notify({
                            title: this.$t("pages.joke.success"),
                            message: this.$t("pages.joke.deleteSuccess"),
                            type: "success",
                        });
                        if (this.mode === "single") {
                            const back = window.history.state?.back;
                            isJokeListHistoryEntry(back)
                                ? this.$router.back()
                                : this.$router.push({ name: "joke", query: this.$route.query });
                        } else {
                            this.$emit("update");
                        }
                    });
                })
                .catch((error) => {
                    if (error === "cancel" || error === "close") return;
                    this.$notify({
                        title: this.$t("pages.joke.deleteFailed"),
                        message: this.$t("pages.joke.deleteUnavailable"),
                        type: "error",
                    });
                });
        },
        handleContent: function () {
            if (this.mode === "single" || !this.joke?.id) return;
            this.$router.push({ name: "joke", params: { id: this.joke.id }, query: this.$route.query });
        },
        toggleSelection() {
            this.$emit("selection-change", this.joke);
        },
    },
    beforeUnmount() {
        if (this.copyResetTimer) window.clearTimeout(this.copyResetTimer);
    },
};
</script>
