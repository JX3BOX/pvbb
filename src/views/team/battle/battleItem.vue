<template>
    <div class="u-battle-team">
        <img :src="showIcon" class="u-team-logo" />

        <div class="u-team-info">
            <span class="u-team-meta"><em>首领</em> {{ item.boss_info?.name || item.aid_info.name || "未知" }}</span>
            <span class="u-team-meta"><em>团长</em> {{ item.leader || "未知" }}</span>
            <span class="u-team-meta"><em>上报时间</em> {{ showTime(item.created) }}</span>

            <el-tag class="u-rank-tag" v-if="item.boss_info?.is_rank_boss === 0" type="info">非赛事</el-tag>
            <el-tag class="u-rank-tag" v-if="item.boss_info?.is_rank_boss === 1 || item.aid_info?.event_id" type="success"
                >第 {{ item.boss_info?.rank_id || item.aid_info?.event_id}} 届</el-tag
            >
            <el-tag class="u-rank-tag" v-if="item.boss_info?.is_rank_boss === 2" type="warning">预选赛</el-tag>
            <i class="u-team-status" v-if="item.status == 1" title="成绩正常"
                ><img svg-inline src="@/assets/img/team/verify.svg"
            /></i>
        </div>
        <div class="u-team-setting">
            <span class="u-team-meta"
                ><em>角色</em> <img loading="lazy" width="16" :src="showLeaderMount()" /> {{ item.role }}</span
            >
            <span class="u-team-meta"><em>服务器</em> {{ item.team_info.server }}</span>
            <span class="u-team-meta"
                ><em>团队</em> <b>{{ item.team_info.name }}</b></span
            >
            <span class="u-team-meta">
                <em>统计</em>
                <a :href="getBattleLink(item.jx3box_battle_id)" class="u-link" v-if="item.jx3box_battle_id" @click.stop
                    >已绑定</a
                >
                <span v-else>-</span>
            </span>
            <span class="u-team-meta">
                <em>日志</em>
                <a :href="getJclLink(item.jx3box_jcl_id)" class="u-link" v-if="item.jx3box_jcl_id" @click.stop
                    >已绑定</a
                >
                <span v-else>-</span>
            </span>
            <span class="u-team-meta" v-if="item.boss_info?.is_rank_boss > 0 || item.aid_info?.event_id">
                <em>榜单</em>
                <a :href="RankLink" class="u-link" @click.stop target="_blank">点击查看</a>
            </span>
        </div>
        <div class="u-team-op">
            <el-button type="primary" size="small" @click.stop="uploadBattle(item)"
                >关联战斗<i class="el-icon-upload el-icon--right"></i
            ></el-button>
        </div>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { getThumbnail, getLink } from "@jx3box/jx3box-common/js/utils";
import { showTime } from "@jx3box/jx3box-common/js/moment";
export default {
    components: {},
    props: {
        item: {
            type: Object,
            default: () => {},
        },
    },
    computed: {
        showIcon() {
            if (this.item.boss_info?.img && Number.isInteger(Number(this.item.boss_info?.img))) {
                return this.bossIcon(Number(this.item.boss_info?.img));
            } else if (this.item.boss_info?.img) {
                return this.item.boss_info?.img;
            }
            return this.bossIcon(this.item.aid_info.achievement_id);
        },
        RankLink() {
            const boss_info = this.item.boss_info;
            const aid_info = this.item.aid_info;
            if(boss_info){
                return `/rank/#/${boss_info.rank_id}/rank?aid=${boss_info.aid}`;
            }else if(aid_info){
                return `/rank/#/${aid_info.event_id}/rank?aid=${aid_info.achievement_id}`;
            }{
                return ''
            }
        },
    },
    methods: {
        showLeaderMount: function () {
            let xfid = 0,
                name = this.item.role;
            this.item.team_members.forEach((item) => {
                if (item.Name == name) xfid = item.XFId;
                // if (item.name == name) xfid = item.xfid;
            });
            let mountIcon = __imgPath + "image/xf/" + xfid + ".png";
            return mountIcon;
        },
        bossIcon: function (id) {
            return __imgPath + `image/rank/boss/${id}.png`;
        },
        teamLogo: function (val) {
            return getThumbnail(val, 108, true);
        },
        teamLink: function (val) {
            return getLink("org", val);
        },
        showTime: function (val) {
            return showTime(new Date(val * 1000));
        },
        showTC: function (val) {
            let s = val / 1000;
            return ~~(s / 60) + "分" + ~~(s % 60) + "秒";
        },
        uploadBattle(item) {
            this.$emit("uploadBattle", item);
        },
        getBattleLink(id) {
            return `/battle/#/combat/${id}`;
        },
        getJclLink(id) {
            return `/jcl/view?id=${id}`;
        },
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/battle/battle-item.less";
</style>
