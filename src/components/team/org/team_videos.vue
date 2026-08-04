<template>
    <div class="m-team-videos">
        <div class="m-team-videos-summary" v-if="isMaster">
            <span>{{ $t("team.video.list") }}</span>
            <em>{{ $t("team.video.total", { count: total }) }}</em>
        </div>

        <div class="u-list" v-if="list && list.length">
            <article class="u-video" v-for="item in list" :key="item.ID || item.url">
                <a class="u-video-link" :href="item.url" target="_blank" rel="noopener noreferrer">
                    <span class="u-cover">
                        <img :src="showVideoCover(item.aid)" :alt="item.title || $t('team.video.coverAlt')" loading="lazy" />
                        <span class="u-play" aria-hidden="true"><el-icon><VideoPlay /></el-icon></span>
                    </span>
                    <span class="u-title">{{ item.title || $t("team.video.untitled") }}</span>
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
                        <button type="button" class="u-edit" :aria-label="$t('team.video.editAria', { title: item.title })" @click="toEmit({ item })">
                            <el-icon><Edit /></el-icon>
                            <span>{{ $t("team.video.edit") }}</span>
                        </button>
                        <button
                            type="button"
                            class="u-del"
                            :aria-label="$t('team.video.deleteAria', { title: item.title })"
                            @click="toEmit({ del: item.ID })"
                        >
                            <el-icon><Delete /></el-icon>
                            <span>{{ $t("team.video.delete") }}</span>
                        </button>
                    </div>
                </template>
            </article>
        </div>

        <div class="m-team-videos-empty" v-else>
            <span class="u-empty-icon" aria-hidden="true"><el-icon><VideoCamera /></el-icon></span>
            <h3>{{ $t("team.video.empty") }}</h3>
            <p>{{ isMine ? $t("team.video.emptyMine") : $t("team.video.emptyPublic") }}</p>
            <el-button v-if="isMine && isMaster" type="primary" @click="toEmit({ add: true })">
                <el-icon><Plus /></el-icon>
                {{ $t("team.video.add") }}
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
            return "https://img.jx3box.com/image/rank/videos/" + aid + ".png";
        },
        statusText(status) {
            return Number(status) === 2 ? this.$t("team.video.rejected") : this.$t("team.video.pending");
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
