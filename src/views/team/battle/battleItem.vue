<template>
    <article class="u-battle-team">
        <div class="u-battle-summary">
            <img :src="showIcon" class="u-team-logo" alt="" />

            <div class="u-team-info">
                <div class="u-battle-title">
                    <span class="u-battle-kicker">{{ $t("pages.team.battle.boss") }}</span>
                    <strong>{{
                        item.boss_info?.name || item.aid_info?.name || $t("pages.team.battle.unknown")
                    }}</strong>
                </div>

                <div class="u-battle-badges">
                    <el-tag class="u-rank-tag" v-if="item.boss_info?.is_rank_boss === 0" type="info">{{
                        $t("pages.team.battle.nonEvent")
                    }}</el-tag>
                    <el-tag
                        class="u-rank-tag"
                        v-if="item.boss_info?.is_rank_boss === 1 || item.aid_info?.event_id"
                        type="success"
                        >{{
                            $t("pages.team.battle.eventEdition", {
                                number: item.boss_info?.rank_id || item.aid_info?.event_id,
                            })
                        }}</el-tag
                    >
                    <el-tag class="u-rank-tag" v-if="item.boss_info?.is_rank_boss === 2" type="warning">{{
                        $t("pages.team.battle.qualifier")
                    }}</el-tag>
                    <span
                        class="u-team-status"
                        v-if="item.status == 1"
                        :title="$t('pages.team.battle.verified')"
                    >
                        <img svg-inline src="@/assets/img/team/verify.svg" />
                        <span>{{ $t("pages.team.battle.verified") }}</span>
                    </span>
                </div>

                <dl class="u-battle-meta">
                    <div>
                        <dt>{{ $t("pages.team.battle.leader") }}</dt>
                        <dd>{{ item.leader || $t("pages.team.battle.unknown") }}</dd>
                    </div>
                    <div>
                        <dt>{{ $t("pages.team.battle.reportedAt") }}</dt>
                        <dd>{{ showTime(item.created) }}</dd>
                    </div>
                </dl>
            </div>
        </div>

        <div class="u-battle-content">
            <section class="u-team-setting" :aria-label="$t('pages.team.battle.combatInfo')">
                <h3>{{ $t("pages.team.battle.combatInfo") }}</h3>
                <dl class="u-battle-fields">
                    <div>
                        <dt>{{ $t("pages.team.battle.role") }}</dt>
                        <dd>
                            <img loading="lazy" width="18" :src="showLeaderMount()" alt="" />
                            {{ item.role || $t("pages.team.battle.unknown") }}
                        </dd>
                    </div>
                    <div>
                        <dt>{{ $t("pages.team.battle.server") }}</dt>
                        <dd>{{ item.team_info?.server || $t("pages.team.battle.unknown") }}</dd>
                    </div>
                    <div>
                        <dt>{{ $t("pages.team.battle.team") }}</dt>
                        <dd>{{ item.team_info?.name || $t("pages.team.battle.unknown") }}</dd>
                    </div>
                </dl>
            </section>

            <section class="u-battle-data" :aria-label="$t('pages.team.battle.linkedData')">
                <h3>{{ $t("pages.team.battle.linkedData") }}</h3>
                <div class="u-battle-links">
                    <div class="u-battle-link">
                        <span>{{ $t("pages.team.battle.statistics") }}</span>
                        <a
                            :href="getBattleLink(item.jx3box_battle_id)"
                            class="u-link"
                            v-if="item.jx3box_battle_id"
                            @click.stop
                            >{{ $t("pages.team.battle.linked") }} <i class="el-icon-arrow-right"></i
                        ></a>
                        <em v-else>{{ $t("pages.team.battle.unlinked") }}</em>
                    </div>
                    <div class="u-battle-link">
                        <span>{{ $t("pages.team.battle.logs") }}</span>
                        <a
                            :href="getJclLink(item.jx3box_jcl_id)"
                            class="u-link"
                            v-if="item.jx3box_jcl_id"
                            @click.stop
                            >{{ $t("pages.team.battle.linked") }} <i class="el-icon-arrow-right"></i
                        ></a>
                        <em v-else>{{ $t("pages.team.battle.unlinked") }}</em>
                    </div>
                    <div
                        class="u-battle-link"
                        v-if="item.boss_info?.is_rank_boss > 0 || item.aid_info?.event_id"
                    >
                        <span>{{ $t("pages.team.battle.ranking") }}</span>
                        <a :href="RankLink" class="u-link" @click.stop target="_blank" rel="noopener noreferrer"
                            >{{ $t("pages.team.battle.view") }} <i class="el-icon-arrow-right"></i
                        ></a>
                    </div>
                </div>
            </section>
        </div>

        <div class="u-team-op">
            <el-button type="primary" @click.stop="uploadBattle(item)"
                >{{ $t("pages.team.battle.linkBattle") }}<i class="el-icon-upload el-icon--right"></i
            ></el-button>
        </div>
    </article>
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
            return this.bossIcon(this.item.aid_info?.achievement_id);
        },
        RankLink() {
            const boss_info = this.item.boss_info;
            const aid_info = this.item.aid_info;
            if (boss_info) {
                return `/rank/#/${boss_info.rank_id}/rank?aid=${boss_info.aid}`;
            } else if (aid_info) {
                return `/rank/#/${aid_info.event_id}/rank?aid=${aid_info.achievement_id}`;
            }
            return "";
        },
    },
    methods: {
        showLeaderMount: function () {
            let xfid = 0,
                name = this.item.role;
            (this.item.team_members || []).forEach((item) => {
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
