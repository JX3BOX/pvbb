<template>
    <div class="m-rank-top100-item">
        <!-- 队徽 -->
        <a class="u-logo" :href="teamLink(item.team_info.id)" target="_blank">
            <el-image v-if="item.team_info.logo" :src="teamLogo(item.team_info.logo, false)" fit="fill"></el-image>
            <div class="el-image" v-else>
                <img loading="lazy" src="@/assets/img/team/null.png" />
            </div>
        </a>
        <!-- 名称 -->
        <div class="u-title">
            <a class="u-teamname" :href="teamLink(item.team_info.id)" target="_blank" v-if="item.team_info.id">
                <i class="el-icon-link"></i>
                {{ item.team_info.name && item.team_info.name.slice(0, 6) }}
            </a>
            <span class="u-teamname u-teamname-null" v-else>{{ $t("pages.team.battle.unknown") }}</span>
            <span class="u-server">{{ item.team_info.server }}</span>
        </div>
        <!-- 时间 -->
        <div class="u-time" @click="copy(showTime(item.created))">
            <span class="u-time-fight">
                {{ $t("pages.team.battle.durationLabel") }}
                <b>{{ showTC(item.fight_time) }}</b>
            </span>
            <span class="u-time-finish">{{ showTime(item.created) }}</span>
        </div>
        <!-- 队长 -->
        <div class="u-leader" v-if="item.leaders">
            <span class="u-leader-label">{{ $t("pages.team.battle.leader") }} :</span>
            <img loading="lazy" class="u-mount" :src="showMount(item.leaders.XFId)" v-if="item.leaders.XFId" />
            <span class="u-username">
                {{ item.leaders.Name || $t("pages.team.battle.unknown") }}
            </span>
        </div>
        <!-- 队员 -->
        <el-row class="u-teammates" :gutter="10">
            <el-col class="u-member" :span="4" v-for="(member, j) in item.members" :key="j">
                <div class="u-member-content">
                    <img loading="lazy" class="u-mount" :src="showMount(member.XFId)" />
                    <span class="u-username" :title="member.Name">{{
                        member.Name || $t("pages.team.battle.unknown")
                    }}</span>
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { __cdn } from "@/utils/config";
import { getThumbnail, getLink } from "@jx3box/jx3box-common/js/utils";
import { showTime } from "@jx3box/jx3box-common/js/moment";
export default {
    name: "team-item",
    props: {
        item: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {};
    },
    created() {},
    methods: {
        getRankImg: function (num) {
            return __cdn + "image/rank/common/rank_" + num + ".png";
        },
        teamLogo: function (val, mode) {
            if (!val) return "";
            return mode ? getThumbnail(val, 240, true) : getThumbnail(val, 176, true);
        },
        teamLink: function (val) {
            return getLink("org", val);
        },
        showTime: function (val) {
            return showTime(new Date(val * 1000));
        },
        showTC: function (val) {
            let s = val / 1000;
            return this.$t("pages.team.battle.duration", { minutes: ~~(s / 60), seconds: ~~(s % 60) });
        },
        showMount: function (member) {
            let mountIcon = __cdn + "image/xf/" + member + ".png";
            return mountIcon;
        },
        copy(text) {
            navigator.clipboard.writeText(text);
        },
    },
};
</script>
<style lang="less">
@import "@/assets/css/team/battle/item.less";
</style>
