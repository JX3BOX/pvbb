<template>
    <div class="v-org-list">
        <h1 class="m-title">
            <i class="el-icon-setting"></i><span class="u-txt">{{ $t("team.orgLegacy.management") }}</span>
            <div class="u-op">
                <a href="/tool/21789" class="u-help" target="_blank"> <i class="el-icon-info"></i> {{ $t("team.orgLegacy.help") }} </a>
                <router-link to="/org/add" class="el-button el-button--primary el-button--mini"
                    ><i class="el-icon-circle-plus-outline"></i>&nbsp;{{ $t("team.orgLegacy.create") }}</router-link
                >
            </div>
        </h1>
        <div class="m-team-manage" v-loading="loading">
            <template v-if="data && data.length">
                <div class="m-team-list">
                    <div class="u-team" v-for="(item, i) in data" :key="i">
                        <img v-if="item.logo" :src="showTeamLogo(item.logo)" class="u-team-logo" />
                        <img class="u-team-logo" src="@/assets/img/team/team_logo_null.svg" v-else />
                        <router-link class="u-team-name" :to="'/org/' + item.ID" target="_blank"
                            ><span class="el-icon-link"></span> {{ item.name }}
                            <i class="u-team-status" v-if="item.status == 1" :title="$t('team.orgLegacy.verified')"
                                ><img svg-inline src="@/assets/img/team/verify.svg" /></i
                        ></router-link>
                        <div class="u-team-info">
                            <span class="u-team-meta"><em>{{ $t("team.orgLegacy.server") }}</em> {{ item.server }}</span>
                        </div>
                        <div class="u-team-setting">
                            <span class="u-team-meta"><em>{{ $t("team.orgLegacy.members") }}</em> {{ showVisLabel(item.v_member) }}</span>
                            <span class="u-team-meta"><em>{{ $t("team.orgLegacy.dkp") }}</em> {{ showVisLabel(item.v_dkp) }}</span>
                            <span class="u-team-meta"><em>{{ $t("team.orgLegacy.activities") }}</em> {{ showVisLabel(item.v_activity) }}</span>
                            <span class="u-team-meta"><em>{{ $t("team.orgLegacy.comments") }}</em> {{ showVisLabel(item.v_comment) }}</span>
                        </div>
                        <div class="u-team-op">
                            <router-link
                                v-if="item.super == uid && !item.status"
                                :to="'/org/verify/' + item.ID"
                                class="u-verify el-button u-edit el-button--default el-button--mini"
                                ><i class="el-icon-position"></i>&nbsp;{{ $t("team.orgLegacy.verification") }}</router-link
                            >
                            <!-- <div
                                v-if="item.super == uid && item.status == 2"
                                class="u-verify el-button u-edit el-button--danger el-button--mini"
                                ><i class="el-icon-warning-outline"></i>
                                审核不通过</div> -->
                            <router-link
                                v-if="item.super == uid && item.status == 2"
                                :to="'/org/verify/' + item.ID"
                                class="u-verify el-button u-edit el-button--warning el-button--mini"
                                ><i class="el-icon-remove-outline"></i> {{ $t("team.orgLegacy.reviewing") }}</router-link
                            >
                            <router-link
                                v-if="item.super == uid"
                                :to="'/org/edit/' + item.ID"
                                class="u-edit el-button u-edit el-button--primary el-button--mini"
                                ><i class="el-icon-setting"></i>&nbsp;{{ $t("team.orgLegacy.manage") }}</router-link
                            >
                        </div>
                    </div>
                </div>
                <el-pagination
                    class="m-archive-pages"
                    background
                    layout="total, prev, pager, next,jumper"
                    :hide-on-single-page="true"
                    :page-size="per"
                    :total="total"
                    v-model:current-page="page"
                    @current-change="changePage"
                >
                </el-pagination>
            </template>
            <template v-else>
                <div class="m-team-list-null">
                    <el-alert class="m-archive-null" :title="$t('team.orgLegacy.empty')" type="info" center show-icon> </el-alert>
                    <router-link to="/org/add" class="u-add-team el-button u-edit el-button--primary"
                        ><i class="el-icon-circle-plus-outline"></i> {{ $t("team.orgLegacy.create") }}</router-link
                    >
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { getMyTeams, getMyManageTeams } from "@/service/team/team.js";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import vismap from "@/assets/data/team/vis.json";
import User from "@jx3box/jx3box-common/js/user";
export default {
    props: [],
    data: function () {
        return {
            data: [],
            per: 10,
            page: 1,
            total: 1,

            vismap,
            uid: User.getInfo().uid,
            loading: false,
        };
    },
    computed: {
        params: function () {
            return {
                pageIndex: this.page,
                pageSize: this.per,
            };
        },
    },
    methods: {
        loadData: function () {
            this.loading = true;
            getMyManageTeams(this.params)
                .then((res) => {
                    this.data = res.data.data.list || [];
                    this.total = res.data.data.page.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        changePage: function () {
            window.scrollTo(0, 0);
        },
        showTeamLogo: function (val) {
            return getThumbnail(val, 136, true);
        },
        getTeamLink: function (val) {
            return "/team/org/" + val;
        },
        showVisLabel: function (val) {
            if (!val) val = 0;
            const key = { 0: "public", 1: "loginOnly", 2: "membersOnly", 3: "adminsOnly", 99: "selfOnly" }[val];
            return this.$t(`team.visibility.${key || "private"}`);
            // return vismap[val] || "不公开";
        },
    },
    watch: {
        params: {
            immediate: true,
            handler: function () {
                this.loadData();
            },
        },
    },
    mounted: function () {},
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/org/list_org.less";
</style>
