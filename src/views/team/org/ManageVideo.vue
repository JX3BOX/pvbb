<template>
    <div class="m-team-play" v-loading="loading">
        <header class="m-team-play-header">
            <div class="u-header-copy">
                <span class="u-header-icon" aria-hidden="true"><el-icon><VideoCamera /></el-icon></span>
                <span>
                    <h2>{{ $t("team.video.title") }}</h2>
                    <p>{{ $t("team.video.description") }}</p>
                </span>
            </div>
            <el-button class="u-add" type="primary" v-if="canManage" @click="openDialog">
                <el-icon><Plus /></el-icon>
                <span>{{ $t("team.video.add") }}</span>
            </el-button>
        </header>

        <team-videos :data="videos" @toEmit="isEmit" :isMine="canManage" />

        <el-dialog
            class="m-rank-video-dialog"
            v-model="dialogVisible"
            :title="dialogTitle"
            width="640px"
            append-to-body
            destroy-on-close
        >
            <template #header>
                <div class="m-rank-video-dialog-header">
                    <span class="u-dialog-icon" aria-hidden="true">
                        <el-icon><Film /></el-icon>
                    </span>
                    <span class="u-dialog-copy">
                        <b>{{ dialogTitle }}</b>
                        <em>{{ $t("team.video.dialogHint") }}</em>
                    </span>
                </div>
            </template>

            <div class="m-rank-video-form">
                <div class="u-form-notice">
                    <el-icon aria-hidden="true"><WarningFilled /></el-icon>
                    <span>{{ $t("team.video.notice") }}</span>
                </div>

                <el-form ref="form" :model="video" label-position="top" :rules="rules">
                    <div class="u-form-grid">
                        <el-form-item :label="$t('team.video.event')" prop="event_id">
                            <el-select v-model.number="video.event_id" :placeholder="$t('team.video.selectEvent')">
                                <el-option
                                    v-for="item of eventsList"
                                    :key="item.ID"
                                    :label="item.name"
                                    :value="item.ID"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('team.video.boss')" prop="aid">
                            <el-select
                                v-model.number="video.aid"
                                :disabled="!video.event_id"
                                :placeholder="video.event_id ? $t('team.video.selectBoss') : $t('team.video.selectEventFirst')"
                            >
                                <el-option
                                    v-for="item of eventsBoss"
                                    :key="item.achievement_id"
                                    :label="item.name"
                                    :value="item.achievement_id"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    <el-form-item :label="$t('team.video.videoTitle')" prop="title">
                        <el-input v-model.trim="video.title" maxlength="80" show-word-limit :placeholder="$t('team.video.titlePlaceholder')" />
                    </el-form-item>
                    <el-form-item :label="$t('team.video.link')" prop="url">
                        <el-input v-model.trim="video.url" :placeholder="$t('team.video.linkPlaceholder')">
                            <template #prefix><el-icon><Link /></el-icon></template>
                        </el-input>
                    </el-form-item>
                    <el-form-item class="u-superstar-field" :label="$t('team.video.superstar')" prop="is_superstar">
                        <div class="u-switch-row">
                            <span>
                                <b>{{ $t("team.video.superstarLabel") }}</b>
                                <em>{{ $t("team.video.superstarHint") }}</em>
                            </span>
                            <el-switch
                                v-model="video.is_superstar"
                                :active-value="1"
                                :inactive-value="0"
                                inline-prompt
                                :active-text="$t('team.video.yes')"
                                :inactive-text="$t('team.video.no')"
                            />
                        </div>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <div class="m-rank-video-dialog-footer">
                    <el-button :disabled="submitting" @click="dialogVisible = false">{{ $t("team.video.cancel") }}</el-button>
                    <el-button type="primary" :loading="submitting" @click="submit">
                        {{ video.ID ? $t("team.video.save") : $t("team.video.submit") }}
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script>
import {
    getTeamsList,
    getVideos,
    getVideosMaster,
    updateVideo,
    deleteVideo,
    addVideo,
} from "@/service/team/team.js";
import team_videos from "@/components/team/org/team_videos.vue";
import { Film, Link, Plus, VideoCamera, WarningFilled } from "@element-plus/icons-vue";
export default {
    name: "ManageVideo",
    props: {
        teamId: {
            type: [Number, String],
            default: 0,
        },
        canManage: {
            type: Boolean,
            default: false,
        },
    },
    components: { Film, Link, Plus, VideoCamera, WarningFilled, "team-videos": team_videos },
    data: function () {
        return {
            loading: false,
            submitting: false,
            dialogVisible: false,
            page: 1,
            per: 16,
            total: 0,
            videos_list: [],

            video: {},
            eventsList: [],
            rules: {
                title: [{ required: true, message: this.$t("team.video.titleRequired"), trigger: "blur" }],
                url: [{ required: true, message: this.$t("team.video.linkRequired"), trigger: "blur" }],
                event_id: [{ required: true, message: this.$t("team.video.eventRequired"), trigger: "change" }],
                aid: [{ required: true, message: this.$t("team.video.bossRequired"), trigger: "change" }],
            },
        };
    },
    computed: {
        id: function () {
            return ~~this.teamId;
        },
        videos() {
            return {
                list: this.videos_list,
                page: this.page,
                per: this.per,
                total: this.total,
                isMaster: this.canManage,
            };
        },
        eventsBoss() {
            const event = this.eventsList.find((item) => this.video.event_id == item.ID);
            return event?.boss_map || [];
        },
        dialogTitle() {
            return this.video.ID ? this.$t("team.video.editTitle") : this.$t("team.video.addTitle");
        },
    },
    watch: {
        page() {
            this.loadVideos();
        },
        "video.event_id"(oldValue, newValue) {
            if (!this.video.ID && oldValue !== newValue) this.video.aid = "";
        },
    },
    methods: {
        // 加载视频列表，有管理权限时加载包含审核状态的完整列表
        loadVideos() {
            this.loading = true;
            const params = {
                pageIndex: this.page,
                pageSize: this.per,
            };
            const request = this.canManage ? getVideosMaster(this.id, params) : getVideos(this.id, params);

            return request
                .then((res) => {
                    this.videos_list = res.data.data.list || [];
                    this.total = res.data.data.page.total;
                })
                .catch(() => {
                    this.videos_list = [];
                    this.total = 0;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 加载赛事和 boss
        loadEvents() {
            return getTeamsList()
                .then((res) => {
                    this.eventsList = res.data.data.list;
                })
                .catch(() => {
                    this.eventsList = [];
                });
        },
        // 子组件提交数据
        isEmit(data) {
            if (data.page) this.page = data.page;
            if (data.item) {
                let { ID, event_id, aid, title, url, is_superstar, status } = data.item;
                this.restVideo(ID, event_id, aid, title, url, is_superstar, status);
                this.dialogVisible = true;
            }
            if (data.add) this.openDialog();
            if (data.del) this.del(data.del);
        },
        // 重置视频信息填写信息
        restVideo(ID, event_id, aid, title, url, is_superstar = 0, status = 0) {
            this.video = {
                team_id: ~~this.id,
                event_id,
                ID,
                aid,
                title,
                url,
                is_superstar,
                status,
            };
        },
        // 重置填写内容并打开弹窗
        openDialog() {
            this.restVideo();
            this.dialogVisible = true;
        },
        // 删除
        del(id) {
            this.$alert(this.$t("team.video.deleteConfirm"), this.$t("team.video.message"), {
                confirmButtonText: this.$t("team.video.confirm"),
                callback: (action) => {
                    if (action == "confirm") {
                        return deleteVideo(id)
                            .then(() => {
                                this.$message({
                                    type: "success",
                                    message: this.$t("team.video.deleted"),
                                });
                                this.videos_list = this.videos_list.filter((item) => item.ID !== id);
                            })
                            .catch(() => {
                                // 公共请求拦截器已展示业务错误，这里只消费拒绝，避免触发运行时遮罩。
                            });
                    }
                },
            });
        },
        // 提交
        submit: function () {
            this.$refs.form.validate((valid, fields) => {
                if (!valid) {
                    console.log("error submit!!!", fields);
                    return;
                }

                const isEditing = Boolean(this.video.ID);
                const request = isEditing ? updateVideo(this.video.ID, this.video) : addVideo(this.video);
                this.submitting = true;
                request
                    .then(() => {
                        this.$message.success(isEditing ? this.$t("team.video.updated") : this.$t("team.video.published"));
                        this.dialogVisible = false;
                        this.loadVideos();
                    })
                    .catch(() => {
                        // 公共请求拦截器已展示业务错误，这里只消费拒绝，避免触发运行时遮罩。
                    })
                    .finally(() => {
                        this.submitting = false;
                    });
            });
        },
    },
    mounted: function () {
        this.id && this.loadVideos();
        this.loadEvents();
    },
};
</script>
<style lang="less">
@import "@/assets/css/team/org/team_play.less";
</style>
