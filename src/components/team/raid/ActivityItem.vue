<template>
    <article v-if="variant === 'center'" class="m-activity-item is-center" @click="subscribe(activity.id)">
        <div class="u-center-date" aria-hidden="true">
            <strong>{{ showRaidDate(activity.start_time) }}</strong>
            <span>{{ showRaidMonth(activity.start_time) }}月</span>
        </div>
        <div class="u-center-content">
            <div class="u-center-heading">
                <div>
                    <span v-if="isToday(activity.start_time)" class="u-center-today">今天</span>
                    <h2>{{ activity.name || "团队活动" }}</h2>
                </div>
                <span class="u-center-time">{{ showRaidTime(activity.start_time) }}</span>
            </div>
            <p class="u-center-desc">{{ activity.title || "活动详情等待团队补充" }}</p>
            <div class="u-center-meta">
                <router-link class="u-center-team" :to="'/org/' + activity.team_id" @click.stop>
                    <img :src="getTeamLogo(activity.team_logo || teamInfo.logo)" alt="" />
                    <span>{{ activity.team_name || "团队" }}</span>
                </router-link>
                <span><el-icon><Location /></el-icon>{{ activity.server || "服务器待定" }}</span>
                <span><el-icon><Calendar /></el-icon>{{ showRaidWeek(activity.start_time) }}</span>
            </div>
        </div>
        <button class="u-center-action" type="button" @click.stop="subscribe(activity.id)">
            <span>查看活动</span>
            <el-icon><ArrowRight /></el-icon>
        </button>
    </article>
    <div v-else class="m-activity-item" @click="subscribe(activity.id)">
        <router-link v-if="!isHomePage" class="u-logo" :to="'/org/' + activity.team_id" target="_blank" @click.stop>
            <img class="u-team-logo" :src="getTeamLogo(activity.team_logo || teamInfo.logo)" alt="" />
        </router-link>
        <div class="u-content">
            <div class="u-header">
                <span class="u-title" :to="'/raid/' + activity.id" target="_blank"
                    >{{ activity.name }}
                    <!-- <span class="u-today" v-if="isToday(activity.start_time)">★ 今天</span> -->
                </span>
            </div>
            <div class="u-info">
                <span class="u-server"><em>服务器</em>{{ activity.server }} </span>
                <span
                    ><em>时间</em>
                    <span class="u-date"
                        >{{ showRaidMonth(activity.start_time) }}月{{ showRaidDate(activity.start_time) }}日</span
                    >
                    <span class="u-week">({{ showRaidWeek(activity.start_time) }})</span>
                    <!-- <span class="u-today" v-if="isToday(activity.start_time)">★ 今天</span> -->
                    <span class="u-time">{{ showRaidTime(activity.start_time) }}</span>
                </span>
            </div>
            <div>
                <span class="u-desc" :to="'/raid/' + activity.id" target="_blank">{{ activity.title }}</span>
            </div>
        </div>
        <div class="u-actions">
            <el-button type="primary" v-if="!canQuit" @click="subscribe(activity.id)" size="small" icon="Flag"
                >预约</el-button
            >
            <el-popconfirm v-else title="确定退出你在该活动的所有参与信息吗？" @click.stop @confirm="quit(activity.id)">
                <template #reference>
                    <el-button @click.stop type="info" size="small"><i class="el-icon-s-flag"></i>退出</el-button>
                </template>
            </el-popconfirm>
        </div>
    </div>
</template>

<script>
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import { moment } from "@jx3box/jx3box-common/js/moment";
import { quitRaid } from "@/service/team/raid.js";
export default {
    props: {
        activity: {
            type: Object,
            required: true,
        },
        canQuit: {
            type: Boolean,
            default: false,
        },
        teamInfo: {
            type: Object,
            default: () => {
                return {};
            },
        },
        isHomePage: {
            type: Boolean,
            default: false,
        },
        variant: {
            type: String,
            default: "default",
        },
    },
    name: "ActivityItem",
    methods: {
        getTeamLogo(val) {
            return showAvatar(val, 216);
        },
        subscribe(id) {
            this.$router.push("/raid/" + id);
        },
        isToday(d) {
            return moment(d).format("MM-DD") == moment(new Date()).format("MM-DD");
        },
        quit() {
            quitRaid(this.activity.id).then(() => {
                this.$emit("quit", this.activity.id);
                this.$notify({
                    title: "退出成功",
                    message: "您已成功退出活动",
                    type: "success",
                });
            });
        },
        showRaidTime(d) {
            return moment(d).format("HH:mm");
        },
        showRaidWeek(d) {
            return moment(d).format("dddd");
        },
        showRaidMonth(d) {
            return moment(d).format("MM");
        },
        showRaidDate(d) {
            return moment(d).format("DD");
        },
    },
};
</script>

<style lang="less" scoped>
@import "@/assets/css/team/raid/activity_item.less";
</style>
