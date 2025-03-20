<template>
    <div class="m-joke-item">
        <div class="u-content" @click="handleContent" :class="mode === 'single' ? 'on' : ''">
            <i class="u-star" :class="joke.star ? 'on' : ''" v-if="joke.star" title="精选">★</i>
            <span class="u-sentence" v-html="content"></span>
        </div>
        <div class="u-misc">
            <div class="u-op">
                <!-- 作者 -->
                <span class="u-user">
                    <img width="24" height="24" :src="user_avatar | showAvatar" />
                    <a :href="joke.user_id | authorLink" target="_blank" v-if="joke.user_id">{{ user_name }}</a>
                    <span v-else>{{ joke.author || "匿名" }}</span>
                </span>
                <!-- 复制 -->
                <el-link type="primary" class="u-copy" :disabled="disabled" @click="handleCopy(joke.content)">
                    <i class="el-icon-document-copy"></i> 复制
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
                    <span class="u-op-item u-op-star el-link el-link--primary is-underline" @click="handleStar">
                        <i :class="isStar ? 'el-icon-star-off' : 'el-icon-star-on'"></i>
                        {{ isStar ? "取消精选" : "设为精选" }}
                    </span>
                    <!-- 删除 -->
                    <span class="u-op-item u-op-delete el-link el-link--primary is-underline" @click="handleDelete">
                        <i class="el-icon-delete"></i> 删除
                    </span>
                    <!-- 打赏 -->
                    <el-checkbox
                        v-if="mode !== 'single'"
                        :disabled="!joke.user_id || isSelf"
                        v-model="checked"
                        @change="doReward"
                        class="u-op-item u-op-gift"
                        >打赏</el-checkbox
                    >
                </template>
                <!-- 时间 -->
                <span class="u-date">
                    <i class="el-icon-date"></i>&nbsp;
                    <time>{{ joke.created_at | dateFormat }}</time>
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
export default {
    name: "joke_item",
    props: ["joke", "mode", "jokeRewardArr"],
    data() {
        return {
            disabled: false,

            // 加星
            isStar: this.joke.star,

            // 点赞
            count: 0,
            isLike: false,
            checked: false,

            content: "",
        };
    },
    filters: {
        dateFormat: function (val) {
            return dateFormat(new Date(val));
        },
        showAvatar: function (val) {
            return showAvatar(val);
        },
        authorLink,
    },
    computed: {
        isSelf: function () {
            return this.joke.user_id == User.getInfo().uid;
        },
        isListPage: function () {
            return this.mode !== "single";
        },
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
                this.count = val.count;

                this.parse(val.content);
            },
            deep: true,
            immediate: true,
        },
        jokeRewardArr: {
            handler: function (val) {
                this.checked = !!val?.filter((item) => item.article_id == this.joke.id).length;
            },
            deep: true,
            immediate: true,
        },
    },
    methods: {
        async parse(str) {
            const ins = new JX3_EMOTION(str);
            const result = await ins._renderHTML();
            this.content = result;
        },
        // 复制
        handleCopy(str) {
            this.disabled = true;
            navigator.clipboard.writeText(str).then(() => {
                this.copyLabel = "已复制";

                setTimeout(() => {
                    this.copyLabel = "复制";
                    this.disabled = false;
                }, 3000);
            });
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
            if (!this.isStar) {
                starJoke(this.joke.id).then(() => {
                    this.$notify({
                        title: "成功",
                        message: "加精成功",
                        type: "success",
                    });
                    this.isStar = true;
                    this.joke.star = true;
                    this.$forceUpdate();
                    // this.$emit("update");
                });
            } else {
                this.unStar();
            }
        },
        unStar: function () {
            unstarJoke(this.joke.id).then(() => {
                this.$notify({
                    title: "成功",
                    message: "取消加精成功",
                    type: "success",
                });
                this.isStar = false;
                this.joke.star = false;
                this.$forceUpdate();
            });
        },
        // 删除
        handleDelete() {
            this.$confirm("此操作将会删除该表情，是否继续？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                removeJoke(this.joke.id).then(() => {
                    this.$notify({
                        title: "成功",
                        message: "删除成功",
                        type: "success",
                    });
                    if (this.mode === "single") {
                        this.$router.go(-1);
                    } else {
                        this.$emit("update");
                    }
                });
            });
        },
        handleContent: function () {
            this.$router.push(`/joke/${this.joke.id}`);
        },
        //确认批量打赏
        doReward() {
            this.$emit("doReward", this.joke);
        },
    },
};
</script>
