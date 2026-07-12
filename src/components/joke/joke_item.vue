<template>
    <div class="m-joke-item">
        <div class="u-content" @click="handleContent" :class="mode === 'single' ? 'on' : ''">
            <i class="u-star" :class="isStar ? 'on' : ''" v-if="isStar" title="精选">★</i>
            <span class="u-sentence" v-html="content"></span>
        </div>
        <div class="u-misc">
            <div class="u-op">
                <!-- 作者 -->
                <span class="u-user">
                    <img width="24" height="24" :src="showAvatar(user_avatar)" />
                    <a :href="authorLink(joke.user_id)" target="_blank" v-if="joke.user_id">{{ user_name }}</a>
                    <span v-else>{{ joke.author || "匿名" }}</span>
                </span>
                <!-- 复制 -->
                <el-link type="primary" class="u-copy" :disabled="disabled" @click="handleCopy(joke.content)">
                    <i class="el-icon-document-copy"></i> {{ copyLabel }}
                </el-link>
                <!-- 点赞 -->
                <a class="u-like" :class="{ on: isLike }" title="赞" @click="addLike">
                    <i class="like-icon">{{ isLike ? "♥" : "♡" }}</i
                    >Like
                    <span class="like-count" v-if="count">{{ count }}</span>
                </a>
                <!-- 编辑（管理&作者 - 单页） -->
                <a
                    v-if="mode === 'single' && (isAuthor || isEditor)"
                    class="u-edit el-link el-link--primary is-underline"
                    :href="editLink('joke', joke.id)"
                    target="_blank"
                >
                    <i class="el-icon-edit-outline"></i> 编辑
                </a>
            </div>
            <div class="u-other">
                <template v-if="isEditor">
                    <!-- 精选 -->
                    <a class="u-op-item u-op-star el-link el-link--primary" :class="{'on': isStar}" @click="handleStar">
                        <i :class="isStar ? 'el-icon-star-off' : 'el-icon-star-on'"></i>
                        {{ isStar ? "取消精选" : "设为精选" }}
                    </a>
                    <!-- 删除 -->
                    <a class="u-op-item u-op-delete el-link el-link--primary" @click="handleDelete">
                        <i class="el-icon-delete"></i> 删除
                    </a>
                    <!-- 批量精选选择 -->
                    <el-checkbox
                        v-if="mode !== 'single'"
                        v-model="checked"
                        @change="toggleSelection"
                        class="u-op-item u-op-gift"
                        >选中</el-checkbox
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
            copyLabel: "复制",
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
                this.copyLabel = "已复制";
                this.copyResetTimer = window.setTimeout(() => {
                    this.copyLabel = "复制";
                    this.disabled = false;
                }, 3000);
            } catch (_) {
                this.copyLabel = "复制";
                this.disabled = false;
                this.$notify({
                    title: "复制失败",
                    message: "浏览器未允许访问剪贴板，请手动复制内容",
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
                        title: "成功",
                        message: isStar ? "取消加精成功" : "加精成功",
                        type: "success",
                    });
                    this.isStar = !!nextStar;

                    if (skippedAutoAppraise) {
                        this.$notify({
                            title: "提示",
                            message: "该作品无作者ID，未执行自动品鉴",
                            type: "warning",
                        });
                    }

                    this.$emit("update", { noCache: true });
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
        // 删除
        handleDelete() {
            this.$confirm("此操作将会删除该条骚话，是否继续？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            })
                .then(() => {
                    return removeJoke(this.joke.id).then(() => {
                        this.$notify({
                            title: "成功",
                            message: "删除成功",
                            type: "success",
                        });
                        if (this.mode === "single") {
                            const back = window.history.state?.back;
                            isJokeListHistoryEntry(back) ? this.$router.back() : this.$router.push("/joke");
                        } else {
                            this.$emit("update");
                        }
                    });
                })
                .catch((error) => {
                    if (error === "cancel" || error === "close") return;
                    this.$notify({
                        title: "删除失败",
                        message: "该条骚话暂时无法删除，请稍后重试",
                        type: "error",
                    });
                });
        },
        handleContent: function () {
            if (this.mode === "single" || !this.joke?.id) return;
            this.$router.push(`/joke/${this.joke.id}`);
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
