<template>
    <div class="m-team-play" v-loading="loading">
        <header class="m-team-play-header">
            <div class="u-header-copy">
                <span class="u-header-icon" aria-hidden="true"><el-icon><VideoCamera /></el-icon></span>
                <span>
                    <h2>赛季视频</h2>
                    <p>管理团队在各赛季活动中的首领通关录像。</p>
                </span>
            </div>
            <el-button class="u-add" type="primary" v-if="isMaster" @click="openDialog">
                <el-icon><Plus /></el-icon>
                <span>添加通关视频</span>
            </el-button>
        </header>

        <team-videos :data="videos" @toEmit="isEmit" :isMine="true" />

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
                        <em>补充活动、首领和视频信息，提交后将进入审核。</em>
                    </span>
                </div>
            </template>

            <div class="m-rank-video-form">
                <div class="u-form-notice">
                    <el-icon aria-hidden="true"><WarningFilled /></el-icon>
                    <span>请填写与当前团队和首领对应的公开视频地址，避免提交无关内容。</span>
                </div>

                <el-form ref="form" :model="video" label-position="top" :rules="rules">
                    <div class="u-form-grid">
                        <el-form-item label="赛事活动" prop="event_id">
                            <el-select v-model.number="video.event_id" placeholder="请选择赛事活动">
                                <el-option
                                    v-for="item of eventsList"
                                    :key="item.ID"
                                    :label="item.name"
                                    :value="item.ID"
                                >
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="首领名称" prop="aid">
                            <el-select
                                v-model.number="video.aid"
                                :disabled="!video.event_id"
                                :placeholder="video.event_id ? '请选择首领' : '请先选择赛事活动'"
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
                    <el-form-item label="视频标题" prop="title">
                        <el-input v-model.trim="video.title" maxlength="80" show-word-limit placeholder="例如：XX 视角" />
                    </el-form-item>
                    <el-form-item label="视频链接" prop="url">
                        <el-input v-model.trim="video.url" placeholder="请输入完整视频网址">
                            <template #prefix><el-icon><Link /></el-icon></template>
                        </el-input>
                    </el-form-item>
                    <el-form-item class="u-superstar-field" label="门派天团" prop="is_superstar">
                        <div class="u-switch-row">
                            <span>
                                <b>标记为门派天团视频</b>
                                <em>开启后将在相关榜单中显示特殊标记。</em>
                            </span>
                            <el-switch
                                v-model="video.is_superstar"
                                :active-value="1"
                                :inactive-value="0"
                                inline-prompt
                                active-text="是"
                                inactive-text="否"
                            />
                        </div>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <div class="m-rank-video-dialog-footer">
                    <el-button :disabled="submitting" @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" :loading="submitting" @click="submit">
                        {{ video.ID ? "保存修改" : "提交视频" }}
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
import User from "@jx3box/jx3box-common/js/user";
import { Film, Link, Plus, VideoCamera, WarningFilled } from "@element-plus/icons-vue";
export default {
    name: "ManageVideo",
    props: {
        super: {
            type: [Number, String],
            default: 0,
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
                title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
                url: [{ required: true, message: "视频链接不能为空", trigger: "blur" }],
                event_id: [{ required: true, message: "请选择赛事", trigger: "change" }],
                aid: [{ required: true, message: "请选择首领", trigger: "change" }],
            },
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
        videos() {
            return {
                list: this.videos_list,
                page: this.page,
                per: this.per,
                total: this.total,
                isMaster: this.isMaster,
            };
        },
        isMaster() {
            return User.getInfo().uid == this.super;
        },
        eventsBoss() {
            const event = this.eventsList.find((item) => this.video.event_id == item.ID);
            return event?.boss_map || [];
        },
        dialogTitle() {
            return this.video.ID ? "编辑赛季视频" : "添加赛季视频";
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
        // 加载视频列表，团长显示可编辑删除等功能
        loadVideos() {
            this.loading = true;
            let _params = {
                pageIndex: this.page,
                pageSize: this.per,
            };
            this.isMaster
                ? getVideosMaster(this.id, _params)
                      .then((res) => {
                          this.videos_list = res.data.data.list || [];
                          this.total = res.data.data.page.total;
                      })
                      .finally(() => {
                          this.loading = false;
                      })
                : getVideos(this.id, _params)
                      .then((res) => {
                          this.videos_list = res.data.data.list || [];
                          this.total = res.data.data.page.total;
                      })
                      .finally(() => {
                          this.loading = false;
                      });
        },
        // 加载赛事和 boss
        loadEvents() {
            getTeamsList().then((res) => {
                this.eventsList = res.data.data.list;
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
            this.$alert("确认删除吗", "消息", {
                confirmButtonText: "确定",
                callback: (action) => {
                    if (action == "confirm") {
                        deleteVideo(id).then((res) => {
                            this.$message({
                                type: "success",
                                message: `删除成功`,
                            });
                            this.videos_list = this.videos_list.filter((item) => item.ID !== id);
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
                        this.$message.success(isEditing ? "更新成功" : "发布成功");
                        this.dialogVisible = false;
                        this.loadVideos();
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
