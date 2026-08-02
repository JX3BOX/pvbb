<template>
    <article v-if="variant === 'center'" class="m-activity-item is-center" @click="subscribe(activity.id)">
        <div class="u-center-date">
            <strong>{{ showRaidDate(activity.start_time) }}</strong>
            <span>{{ $t("team.publicContent.month", { month: showRaidMonth(activity.start_time) }) }}</span>
            <time :datetime="activity.start_time">{{ showRaidTime(activity.start_time) }}</time>
        </div>
        <div class="u-center-content">
            <div class="u-center-heading">
                <span class="u-center-type">{{ activity.name || $t("team.publicContent.activityFallback") }}</span>
                <h2 class="u-center-title">{{ activity.title || $t("team.publicContent.activityPending") }}</h2>
                <span v-if="isToday(activity.start_time)" class="u-center-today">{{ $t("team.publicContent.today") }}</span>
            </div>
            <div class="u-center-meta">
                <router-link class="u-center-team" :to="'/org/' + activity.team_id" @click.stop>
                    <img :src="getTeamLogo(activity.team_logo || teamInfo.logo)" alt="" />
                    <span>{{ activity.team_name || $t("team.publicContent.teamFallback") }}</span>
                </router-link>
                <span><el-icon><Location /></el-icon>{{ activity.server || $t("team.publicContent.serverPending") }}</span>
                <span><el-icon><Calendar /></el-icon>{{ showRaidWeek(activity.start_time) }}</span>
            </div>
        </div>
        <div class="u-center-operation">
            <button class="u-center-action" type="button" @click.stop="subscribe(activity.id)">
                <span>{{ $t("team.publicContent.viewActivity") }}</span>
                <el-icon><ArrowRight /></el-icon>
            </button>
        </div>
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
                <span class="u-server"><em>{{ $t("team.raid.center.server") }}</em>{{ activity.server }} </span>
                <span
                    ><em>{{ $t("team.raid.form.time") }}</em>
                    <span class="u-date"
                        >{{ showRaidMonth(activity.start_time) }}/{{ showRaidDate(activity.start_time) }}</span
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
                >{{ $t("team.raid.view.reserve") }}</el-button
            >
            <el-popconfirm v-else :title="$t('team.raid.member.quitConfirm')" @click.stop @confirm="quit(activity.id)">
                <template #reference>
                    <el-button @click.stop type="info" size="small"><i class="el-icon-s-flag"></i>{{ $t("team.raid.member.quit") }}</el-button>
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
                    title: this.$t("team.raid.member.quitSuccess"),
                    message: this.$t("team.raid.member.quitMessage"),
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
