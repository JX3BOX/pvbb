<template>
    <div class="m-team-videos">
        <div class="m-team-videos-summary" v-if="isMaster">
            <span>视频列表</span>
            <em>共 {{ total }} 条</em>
        </div>

        <div class="u-list" v-if="list && list.length">
            <article class="u-video" v-for="item in list" :key="item.ID || item.url">
                <a class="u-video-link" :href="item.url" target="_blank" rel="noopener noreferrer">
                    <span class="u-cover">
                        <img :src="showVideoCover(item.aid)" :alt="item.title || '赛季视频封面'" loading="lazy" />
                        <span class="u-play" aria-hidden="true"><el-icon><VideoPlay /></el-icon></span>
                    </span>
                    <span class="u-title">{{ item.title || "未命名视频" }}</span>
                </a>

                <template v-if="data.isMaster">
                    <button
                        class="u-status"
                        :class="statusClass(item.status)"
                        type="button"
                        v-if="Number(item.status) !== 1"
                        :disabled="!isMine"
                        @click.stop="toEmit({ item })"
                    >
                        <el-icon v-if="item.status == '0'"><Clock /></el-icon>
                        <el-icon v-else><WarningFilled /></el-icon>
                        <span>{{ statusText(item.status) }}</span>
                    </button>
                    <div class="u-card-actions" v-if="isMine">
                        <button type="button" class="u-edit" :aria-label="`编辑视频 ${item.title}`" @click="toEmit({ item })">
                            <el-icon><Edit /></el-icon>
                            <span>编辑</span>
                        </button>
                        <button
                            type="button"
                            class="u-del"
                            :aria-label="`删除视频 ${item.title}`"
                            @click="toEmit({ del: item.ID })"
                        >
                            <el-icon><Delete /></el-icon>
                            <span>删除</span>
                        </button>
                    </div>
                </template>
            </article>
        </div>

        <div class="m-team-videos-empty" v-else>
            <span class="u-empty-icon" aria-hidden="true"><el-icon><VideoCamera /></el-icon></span>
            <h3>暂无赛季视频</h3>
            <p>{{ isMine ? "添加首条通关录像，沉淀团队的赛季历程。" : "该团队暂未发布赛季视频。" }}</p>
            <el-button v-if="isMine && isMaster" type="primary" @click="toEmit({ add: true })">
                <el-icon><Plus /></el-icon>
                添加通关视频
            </el-button>
        </div>

        <el-pagination
            class="m-archive-pages"
            background
            layout="total, prev, pager, next,jumper"
            :hide-on-single-page="true"
            :page-size="per"
            :total="total"
            v-model:current-page="page"
        >
        </el-pagination>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { Clock, Delete, Edit, Plus, VideoCamera, VideoPlay, WarningFilled } from "@element-plus/icons-vue";
export default {
    name: "team_videos",
    components: { Clock, Delete, Edit, Plus, VideoCamera, VideoPlay, WarningFilled },
    props: {
        data: {
            type: Object,
            default: () => ({
                list: [],
                page: 1,
                per: 16,
                total: 0,
                isMaster: false,
            }),
        },
        isMine: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {
            page: this.data.page,
        };
    },
    computed: {
        id() {
            return this.$route.params.id;
        },
        list() {
            return this.data.list;
        },
        per() {
            return this.data.per;
        },
        total() {
            return this.data.total;
        },
        isMaster() {
            return this.data.isMaster;
        },
    },
    watch: {
        page(val) {
            this.toEmit({ page: val });
        },
        "data.page"(val) {
            if (val !== this.page) this.page = val;
        },
    },
    methods: {
        toEmit(data) {
            this.$emit("toEmit", data);
        },
        showVideoCover(aid) {
            return __imgPath + "image/rank/videos/" + aid + ".png";
        },
        statusText(status) {
            return Number(status) === 2 ? "审核驳回" : "审核中";
        },
        statusClass(status) {
            return Number(status) === 2 ? "is-rejected" : "is-pending";
        },
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_videos.less";
</style>
