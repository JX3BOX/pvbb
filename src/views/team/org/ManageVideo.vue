<template>
    <div class="m-team-play" v-loading="loading">
        <div class="u-add" @click="openDialog" v-if="isMaster">
            <i class="el-icon-video-camera-solid"></i> 添加赛季通关视频
        </div>
        <!-- 视频 -->
        <team-videos :data="videos" @toEmit="isEmit" :isMine="true" />
        <!-- 添加视频表单 -->
        <el-dialog class="m-rank-video-dialog" title="添加/编辑视频" v-model="dialogVisible" :append-to-body="true">
            <div class="m-rank-video-form">
                <el-form ref="form" :model="video" label-width="80px" :rules="rules">
                    <el-form-item label="赛事活动" prop="event_id">
                        <el-select v-model.number="video.event_id" placeholder="请选择">
                            <el-option v-for="(item, key) of eventsList" :key="key" :label="item.name" :value="item.ID">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="门派天团" prop="is_superstar">
                        <el-checkbox v-model="video.is_superstar" :true-value="1" :false-value="0"></el-checkbox>
                    </el-form-item>
                    <el-form-item label="首领名称" v-if="video.event_id" prop="aid">
                        <el-select v-model.number="video.aid" placeholder="请选择">
                            <el-option
                                v-for="(item, key) of eventsBoss"
                                :key="key"
                                :label="item.name"
                                :value="item.achievement_id"
                            >
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="视频链接" prop="url">
                        <el-input v-model="video.url" placeholder="请输入视频网址"></el-input>
                    </el-form-item>
                    <el-form-item label="视频标题" prop="title">
                        <el-input v-model="video.title" placeholder="请注明XX视角"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="submit">确 定</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script>
import {
    getBoss,
    getTeamsList,
    getVideos,
    getVideosMaster,
    updateVideo,
    deleteVideo,
    addVideo,
} from "@/service/team/team.js";
import team_videos from "@/components/team/org/team_videos.vue";
import rank_event_boss from "@/assets/data/team/rank_event_boss.json";
import User from "@jx3box/jx3box-common/js/user";
export default {
    name: "ViewVideo",
    props: ["super"],
    components: { "team-videos": team_videos },
    data: function () {
        return {
            loading: false,
            dialogVisible: false,
            bossList: [],
            page: 1,
            per: 16,
            total: 0,
            videos_list: [],

            video: {},
            eventsList: [],
            rules: {
                title: [{ required: true, message: "标题不能为空", trigger: "blur" }],
                url: [{ required: true, message: "视频链接不能为空", trigger: "blur" }],
                event_id: [{ required: true, message: "请选择赛事", trigger: " change" }],
                aid: [{ required: true, message: "请选择BOSS", trigger: " change" }],
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
        rank_event_boss() {
            return rank_event_boss;
        },
        eventsBoss() {
            const index = this.eventsList.findIndex((item) => this.video.event_id == item.ID);
            return this.eventsList[index].boss_map || [];
        },
    },
    watch: {
        dialogVisible(val) {
            val && !this.bossList.length ? this.getBossList() : "";
        },
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
        // 获取boss列表
        getBossList() {
            getBoss().then((res) => {
                this.bossList = res.data.data.list.reverse();
            });
        },
        // 子组件提交数据
        isEmit(data) {
            if (data.page) this.page = data.page;
            if (data.item) {
                let { ID, event_id, aid, title, url } = data.item;
                this.restVideo(ID, event_id, aid, title, url);
                this.dialogVisible = true;
            }
            if (data.del) this.del(data.del);
        },
        // 重置视频信息填写信息
        restVideo(ID, event_id, aid, title, url, status = 0) {
            this.video = {
                team_id: ~~this.id,
                event_id,
                ID,
                aid,
                title,
                url,
                status,
            };
        },
        // 获取对应活动id
        eventID(id, str = "") {
            if (!id) return str;
            const _obj = this.rank_event_boss;
            for (const key in _obj) {
                if (_obj[key].indexOf(id) !== -1) str = key;
            }
            return str;
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
                if (valid) {
                    if (this.video.ID) {
                        updateVideo(this.video.ID, this.video).then((res) => {
                            this.$message({
                                type: "success",
                                message: `更新成功`,
                            });
                            this.dialogVisible = false;
                            this.videos_list.forEach((item, key) => {
                                if (this.video.ID == item.ID) {
                                    item = this.video;
                                    this.videos_list[key] = item;
                                }
                            });
                        });
                    } else {
                        addVideo(this.video).then((res) => {
                            this.$message({
                                type: "success",
                                message: `发布成功`,
                            });
                            this.dialogVisible = false;
                            location.reload();
                        });
                    }
                } else {
                    console.log("error submit!!!", fields);
                }
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
