<template>
    <div class="v-org-view" v-if="id" v-loading="loading">
        <!-- 查看团队信息 -->
        <team-info :info="data" :team_id="id" />

        <!-- 团队内容TAB组 -->
        <el-tabs v-model="tab" type="card" class="m-team-view">
            <el-tab-pane label="团队概况" name="overview">
                <template #label> <i class="el-icon-date"></i> 团队概况 </template>
                <!-- 简介 -->
                <team-intro :intro="data" />
                <!-- 招募 -->
                <team-recruit :recruit="data.recruit" :tags="data.tags" />
                <!-- 勋章 -->
                <team-medals :medals="data.medals" />
                <!-- 成绩 -->
                <team-trophy :id="id" />
            </el-tab-pane>
            <el-tab-pane label="团队成员" name="member" lazy>
                <template #label> <i class="el-icon-user"></i> 团队成员 </template>
                <ViewMember :v="data.v_member" :super="data.super" :authority="authority" v-if="done" />
            </el-tab-pane>
            <!-- <el-tab-pane label="团队快照" name="snapshot" lazy>
                <span slot="label"> <i class="el-icon-camera"></i> 团队快照 </span>
                <ViewSnapshot :v="data.v_activity" :super="data.super" :authority="authority" v-if="done" />
            </el-tab-pane> -->
            <!-- <el-tab-pane label="DKP记录" name="dkp" lazy>
                <span slot="label"> <i class="el-icon-coin"></i> DKP记录 </span>
                <ViewDkp :v="data.v_dkp" :super="data.super" :authority="authority" v-if="done" />
            </el-tab-pane> -->
            <el-tab-pane label="通关视频" name="video" lazy>
                <template #label> <i class="el-icon-video-play"></i> 通关视频 </template>
                <ViewVideo :super="data.super" v-if="done" />
            </el-tab-pane>
            <el-tab-pane label="留言板" name="comment" lazy class="m-team-notes">
                <template #label> <i class="el-icon-chat-line-square"></i> 留言板 </template>
                <ViewComment :v="data.v_comment" :super="data.super" :authority="authority" v-if="done" />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import team_info from "@/components/team/org/team_info.vue";
import team_intro from "@/components/team/org/team_intro.vue";
import team_medals from "@/components/team/org/team_medals.vue";
import team_trophy from "@/components/team/org/team_trophy.vue";
import team_recruit from "@/components/team/org/team_recruit.vue";

import ViewMember from "@/views/team/member/ViewMember.vue";
import ViewComment from "@/views/team/org/ViewComment.vue";
import ViewVideo from "@/views/team/org/ViewVideo.vue";

import User from "@jx3box/jx3box-common/js/user.js";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import { getTeam } from "@/service/team/team.js";
import { checkMyAuthority } from "@/service/team/member.js";
export default {
    name: "ViewOrg",
    props: [],
    data: function () {
        return {
            tab: "overview",
            data: {
                status: 0,
                name: "团队名称",
                server: "服务器名称",
                logo: "",
                desc: "团队介绍",
                uid: 0,
                recruit: "",
                honors: [],
                medals: [],
                tags: ["可教学", "固定团"],
                v_member: 0,
                v_activity: 0,
                v_dkp: 0,
                v_comment: 0,
            },
            loading: false,
            authority: {
                authority: 0,
                r_dkp: 0,
                r_member: 0,
                r_audit: 0,
                r_plan: 0,
                r_snapshot: 0,
                r_drop: 0,
                r_raid: 0,
            },
            done: false,
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        query: function () {
            return this.$route.query.tab;
        },
    },
    methods: {
        getTeam: function () {
            return getTeam(this.id).then((res) => {
                this.data = res.data.data;
            });
        },
        loadData: function () {
            if (!this.id) return;
            this.getTeam().then(() => {
                postStat("team", this.id);
                this.done = true;
            });
        },
        checkAuthority: function () {
            User.isLogin() &&
                checkMyAuthority(this.id).then((res) => {
                    this.authority = res.data.data;
                });
        },
        checkTab: function () {
            if (this.$route.query.tab) {
                this.tab = this.$route.query.tab;
            }
        },
        init: function () {
            this.checkTab();
            this.loadData();
            User.isLogin() && this.checkAuthority();
        },
    },
    watch: {
        id: {
            immediate: true,
            handler: function (val) {
                val && this.init();
            },
        },
        query: {
            immediate: true,
            handler: function (val) {
                if (val) {
                    this.tab = val;
                }
            },
        },
        tab: function (val) {
            this.$router.push({
                query: {
                    tab: val,
                },
            });
        },
    },
    components: {
        "team-info": team_info,
        "team-intro": team_intro,
        "team-medals": team_medals,
        "team-trophy": team_trophy,
        "team-recruit": team_recruit,
        // "team-raid": TeamRaid,

        ViewMember,
        // ViewSnapshot,
        // ViewDkp,
        ViewComment,
        ViewVideo,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/view_org.less";
</style>
