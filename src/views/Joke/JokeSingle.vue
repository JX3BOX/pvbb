<template>
    <div class="m-joke-single-container" v-loading="loading">
        <div class="m-joke-goback m-content-goback">
            <el-button class="u-back" size="default" icon="ArrowLeft" @click="goBack">
                {{ $t("pages.joke.backToList") }}
            </el-button>
            <a class="u-doc" href="/tool/23239" target="_blank">
                <i class="el-icon-info"></i>{{ $t("pages.joke.gameGuide") }}
            </a>
        </div>

        <template v-if="joke?.id">
            <div class="m-joke-list">
                <joke-item :joke="joke" mode="single" @update="loadSingle" />
            </div>
            <Thx
                class="m-thx m-content-thx"
                :postId="postId"
                postType="joke"
                :postTitle="title"
                :userId="userId"
                :author-id="userId"
                :adminBoxcoinEnable="true"
                :userBoxcoinEnable="true"
                client="all"
            />
            <div class="m-single-comment m-content-comment">
                <div class="m-single-comment-title">{{ $t("pages.joke.comments") }}</div>
                <CommonComment :id="id" category="joke" />
            </div>
        </template>

        <el-result v-else-if="singleError" icon="warning" :title="$t('pages.joke.notFound')" :sub-title="singleError">
            <template #extra>
                <el-button type="primary" @click="goBack">{{ $t("pages.joke.returnToList") }}</el-button>
            </template>
        </el-result>
    </div>
</template>

<script>
import joke_item from "@/components/joke/joke_item";
import { getJoke } from "@/service/joke";
import CommonComment from "@jx3box/jx3box-ui/src/single/Comment.vue";
import { buildJokeDocumentTitle, isJokeListHistoryEntry } from "@/utils/joke";

export default {
    name: "JokeSingle",
    components: {
        "joke-item": joke_item,
        CommonComment,
    },
    props: {
        id: {
            type: [String, Number],
            default: "",
        },
    },
    data() {
        return {
            loading: false,
            singleError: "",
            joke: {},
        };
    },
    computed: {
        userId() {
            return this.joke?.user_id || 0;
        },
        postId() {
            return ~~this.id;
        },
        title() {
            return this.joke?.content;
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
        loadSingle() {
            if (!this.id) return;

            this.loading = true;
            this.joke = {};
            this.singleError = "";
            return getJoke(this.id)
                .then((res) => {
                    const joke = res?.data?.data;
                    if (!joke?.id) throw new Error(this.$t("pages.joke.notFound"));
                    this.joke = joke;
                    document.title = buildJokeDocumentTitle(joke.content, this.$t("pages.common.appendTitle"));
                })
                .catch((error) => {
                    this.singleError = this.getRequestErrorMessage(error, this.$t("pages.joke.retryFromList"));
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        goBack() {
            const back = window.history.state?.back;
            if (isJokeListHistoryEntry(back)) {
                this.$router.back();
                return;
            }
            this.$router.push({ name: "joke", query: this.$route.query });
        },
        getRequestErrorMessage(error, fallback) {
            const message =
                error?.response?.data?.msg || error?.response?.data?.message || error?.data?.msg || error?.message;
            return typeof message === "string" && message.trim() ? message : fallback;
        },
    },
};
</script>
