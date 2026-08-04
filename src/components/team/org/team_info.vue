<template>
    <div class="m-team-info" v-if="data">
        <router-link class="u-logo" :to="'/org/' + id" target="_blank">
            <template v-if="!isRaid">
                <img :src="showTeamLogo(data.logo)" :alt="data.name" v-if="data.logo" />
                <img src="@/assets/img/team/team_logo_null.svg" v-else />
            </template>
            <template v-else>
                <router-link :to="'/org/' + id" target="_blank">
                    <img :src="showTeamLogo(data.logo)" :alt="data.name" v-if="data.logo" />
                    <img src="@/assets/img/team/team_logo_null.svg" v-else />
                </router-link>
            </template>
            <span class="u-id">ID : {{ info.ID }}</span>
        </router-link>
        <h1 class="u-title">
            <!-- <template v-if="!isRaid">{{ limitName(data.name) }}</template> -->
            <!-- <template v-else> -->
            <router-link class="u-team-name" :to="'/org/' + id" target="_blank">
                <!-- <i class="el-icon-link"></i> -->
                {{ limitName(data.name) }}
            </router-link>
            <!-- </template> -->
            <i class="u-icons">
                <i class="u-status isVerified" v-if="data.status == 1" :title="$t('team.header.verified')">
                    <img svg-inline src="@/assets/img/team/verify.svg" /> {{ $t("team.header.verified") }}
                </i>
                <template v-else>
                    <router-link
                        v-if="isTeamSuper && showManageAction !== false"
                        class="u-status isNotVerified"
                        :title="$t('team.header.verifyAction')"
                        :to="verifyLink"
                    >
                        <img svg-inline src="@/assets/img/team/notverify.svg" /> {{ $t("team.header.unverified") }}
                    </router-link>
                    <i v-else class="u-status isNotVerified">
                        <img svg-inline src="@/assets/img/team/notverify.svg" /> {{ $t("team.header.unverified") }}
                    </i>
                </template>
            </i>
        </h1>
        <div class="u-meta">
            <span class="u-meta-item">
                <em>{{ $t("team.header.server") }}</em>
                {{ data.server }}
            </span>
            <span class="u-meta-item">
                <em>{{ $t("team.header.leader") }}</em>
                <a :href="authorLink(data.super)" target="_blank">
                    {{ leaderName }}
                </a>
            </span>
            <span class="u-meta-item" v-if="data.wiki">
                <em>{{ $t("team.header.wiki") }}</em>
                <a :href="wikiLink(data.wiki)" target="_blank"> <i class="el-icon-link"></i> {{ $t("team.header.view") }} </a>
            </span>
            <span class="u-meta-item" v-if="namespace">
                <em>{{ $t("team.header.namespace") }}</em>
                <a class="u-namespace" :href="namespaceLink(namespace)" target="_blank">{{ $t("team.namespaceLink.domain") }}/{{ namespace }}</a>
            </span>
        </div>
        <div class="u-meta">
            <span class="u-meta-item" v-if="tv">
                <em><i class="el-icon-video-camera"></i> {{ $t("team.header.live") }} </em>
                <a :href="tv" target="_blank">
                    {{ tvmap[data.tv_type] + "·" + data.tv }}
                </a>
            </span>
            <span class="u-meta-item u-meta-yy" @click="handleCopy(data.yy_channel)" v-if="data.yy_channel">
                <em><i class="el-icon-document-copy"></i> {{ $t("team.header.yy") }}</em>
                {{ data.yy_channel }}
            </span>
            <span class="u-meta-item u-meta-qq" @click="handleCopy(data.qq_group)" v-if="data.qq_group">
                <em><i class="el-icon-document-copy"></i> {{ $t("team.header.qq") }}</em>
                {{ data.qq_group }}
            </span>
        </div>

        <team-panel
            v-if="(showPublicActions || showHomeAction) && (!isRaid || !isTeamSuper)"
            :team="info"
            :isRaid="isRaid"
            :team_id="id"
            :isMine="isMine"
            :showManageAction="showManageAction !== false"
            :show-public-actions="showPublicActions"
            :show-home-action="showHomeAction"
            :always-show-join-action="alwaysShowJoinAction"
        />
    </div>
</template>

<script>
import tv_link from "@/assets/js/tv.js";
import tvmap from "@/assets/data/team/tv.json";

import { default_avatar } from "@/utils/config";
import { authorLink, getThumbnail, getLink } from "@jx3box/jx3box-common/js/utils";

import team_panel from "@/components/team/org/team_panel.vue";

import { getUserInfo } from "@/service/team/server.js";
import User from "@jx3box/jx3box-common/js/user";

export default {
    name: "team_info",
    props: {
        info: {
            type: Object,
            default: () => ({}),
        },
        isRaid: {
            type: Boolean,
            default: false,
        },
        team_id: {
            type: [Number, String],
            default: 0,
        },
        isMine: {
            type: Boolean,
            default: false,
        },
        showManageAction: {
            type: Boolean,
            default: true,
        },
        showPublicActions: {
            type: Boolean,
            default: true,
        },
        showHomeAction: {
            type: Boolean,
            default: false,
        },
        alwaysShowJoinAction: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {
            tvmap,
            leader: {
                avatar: default_avatar,
                name: this.$t("team.header.leaderFallback"),
                uid: "",
            },
            namespace: "",
            logo: "",
        };
    },
    computed: {
        id: function () {
            return this.team_id || 0;
        },
        data: function () {
            return this.info;
        },
        tv: function () {
            if (this.data.tv_type && this.data.tv) {
                return tv_link[this.data.tv_type](this.data.tv);
            }
            return "";
        },
        isTeamSuper: function () {
            return User.getInfo().uid == this.data.super;
        },
        leaderName: function () {
            return this.data?.super_info?.display_name || this.$t("team.header.unknown");
        },
        verifyLink: function () {
            return {
                name: "manage_my_org",
                params: { id: this.id },
                query: { tab: "setting", subtab: "verify" },
            };
        },
    },
    methods: {
        handleCopy: function (text) {
            this.$copyText(text)
                .then(() => {
                    this.onCopy(text);
                })
                .catch(() => {
                    this.onError();
                });
        },
        onCopy: function (text) {
            this.$notify({
                title: this.$t("team.header.copySuccess"),
                message: this.$t("team.header.copied", { text }),
                type: "success",
            });
        },
        onError: function () {
            this.$notify.error({
                title: this.$t("team.header.copyFailed"),
                message: this.$t("team.header.copyManually"),
            });
        },
        getLeader: function (uid) {
            uid &&
                getUserInfo(uid).then((res) => {
                    this.leader = res.data.data;
                });
        },

        limitName: function (name) {
            return name.slice(0, 12);
        },
        authorLink,
        wikiLink: function (val) {
            return getLink("knowledge", val);
        },
        namespaceLink: function (val) {
            return this.$t("team.namespaceLink.base") + val;
        },
        showTeamLogo: function (val) {
            return getThumbnail(val, 324);
        },
    },
    components: {
        "team-panel": team_panel,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_info.less";
</style>
