<template>
    <div class="m-team-list" :class="{ isIndex }" :aria-busy="loading">
        <div class="m-team-list-header">
            <div class="m-filter">
                <router-link v-if="!homeMode" to="/org/add" class="el-button el-button--primary el-button--large"
                    ><i class="el-icon-circle-plus-outline"></i>&nbsp; {{ $t("team.homeFilters.createTeam") }}</router-link
                >
                <el-select
                    v-if="homeMode"
                    class="u-home-server u-filter"
                    v-model="server"
                    :placeholder="$t('team.homeFilters.selectServer')"
                    filterable
                    @change="changeServer"
                >
                    <el-option key="all" :label="$t('team.homeFilters.allServers')" value=""></el-option>
                    <el-option
                        v-for="(item, i) in serversWithClient"
                        :key="item + i"
                        :label="item"
                        :value="item"
                    ></el-option>
                </el-select>
                <el-input
                    class="u-name u-filter"
                    v-model="name"
                    :placeholder="$t('team.homeFilters.searchTeams')"
                    size="large"
                    @change="searchTeam"
                    style="width: 100%"
                >
                    <template #prepend v-if="!homeMode">
                        <el-select
                            style="width: 120px"
                            v-model="server"
                            :placeholder="$t('team.homeFilters.selectServer')"
                            filterable
                            @change="changeServer"
                        >
                            <el-option key="all" :label="$t('team.homeFilters.allServers')" value=""></el-option>
                            <el-option
                                v-for="(item, i) in serversWithClient"
                                :key="item + i"
                                :label="item"
                                :value="item"
                            ></el-option>
                        </el-select>
                    </template>
                    <template #suffix>
                        <i class="el-icon-search" @click="loadData"></i>
                    </template>
                </el-input>
            </div>
            <div class="m-filter__sub">
                <template v-if="!isIndex">
                    <el-checkbox
                        class="u-isVerified u-filter"
                        v-model="isVerified"
                    >
                        {{ $t("team.homeFilters.verifiedOnly") }}
                    </el-checkbox>
                    <el-checkbox-group v-model="tag">
                        <el-checkbox v-for="item in tags" :key="item" :label="tagLabel(item)" :value="item"></el-checkbox>
                    </el-checkbox-group>
                    <button v-if="hasActiveFilters" class="u-filter-clear" type="button" @click="clearFilters">
                        {{ $t("team.homeFilters.clear") }}
                    </button>
                </template>
                <router-link
                    class="u-more el-button el-button--primary is-plain el-button--mini"
                    to="/org/list"
                    v-if="isIndex"
                    >{{ $t("team.homeFilters.more") }}&raquo;</router-link
                >
            </div>
        </div>
        <div v-if="loading" class="u-list m-team-list-skeleton" :aria-label="$t('team.homeFilters.loading')">
            <div class="u-item u-skeleton-item" v-for="index in skeletonCount" :key="index" aria-hidden="true">
                <span class="u-skeleton-block u-skeleton-logo"></span>
                <span class="u-skeleton-content">
                    <span class="u-skeleton-block u-skeleton-title"></span>
                    <span class="u-skeleton-meta">
                        <span class="u-skeleton-block"></span>
                        <span class="u-skeleton-block"></span>
                        <span class="u-skeleton-block"></span>
                    </span>
                    <span class="u-skeleton-notice">
                        <span class="u-skeleton-block u-skeleton-label"></span>
                        <span class="u-skeleton-block u-skeleton-text"></span>
                    </span>
                </span>
            </div>
        </div>
        <div class="u-list" v-else-if="data && data.length">
            <router-link
                class="u-item"
                :to="'/org/' + item.ID"
                v-for="item in data"
                :key="item.ID"
                :aria-label="$t('team.homeFilters.viewTeam', { name: item.name })"
                target="_blank"
            >
                <span class="u-pic">
                    <img :src="showLogo(item.logo)" v-if="item.logo" @error="useDefaultLogo" />
                    <img src="@/assets/img/team/team_logo_null.svg" v-else />
                </span>
                <span class="u-name">
                    <span class="u-name-text" :title="item.name || ''">{{ formatTeamName(item.name) }}</span>
                    <i class="u-status" v-if="item.status == 1" :title="$t('team.homeFilters.verified')">
                        <img svg-inline src="@/assets/img/team/verify.svg" />
                    </i>
                    <span class="u-medals">
                        <img
                            class="u-medal-icon"
                            :src="showTeamMedal(medal.icon)"
                            v-for="(medal, x) in item.medals"
                            :key="x"
                            :title="medal.name"
                        />
                    </span>
                </span>
                <span class="u-meta">
                    <span class="u-meta-item u-server">
                        <em>{{ $t("team.homeFilters.server") }}</em>
                        {{ item.server }}
                    </span>
                    <span class="u-meta-item u-leader">
                        <em>{{ $t("team.homeFilters.leader") }}</em>
                        <a class="u-super" :href="authorLink(item.super)" target="_blank">
                            <img
                                class="u-user-avatar"
                                :src="showAvatar(item.super_user_info && item.super_user_info.avatar)"
                            />
                            {{ item.super_user_info && item.super_user_info.display_name }}
                        </a>
                    </span>
                </span>
                <span class="u-tag-list" :class="{ 'is-empty': !item.tags || !item.tags.length }">
                    <span
                        class="u-tag-item"
                        :class="{ love: tag == '\u53ef\u6559\u5b66' }"
                        v-for="(tag, i) in item.tags"
                        :key="i"
                        >{{ tagLabel(tag) }}</span
                    >
                    <span v-if="!item.tags || !item.tags.length" class="u-tag-item">{{ $t("team.homeFilters.typePending") }}</span>
                </span>
                <span class="u-recruit u-meta">
                    <div class="u-meta-item">
                        <em>{{ $t("team.homeFilters.recruitment") }}</em>
                        <span
                            :class="{ 'is-empty': !item.recruit && !item.desc }"
                            :title="item.recruit || item.desc || $t('team.homeFilters.noRecruitment')"
                            >{{ item.recruit || item.desc || $t("team.homeFilters.noRecruitment") }}</span
                        >
                    </div>
                </span>
            </router-link>
        </div>
        <el-alert v-else class="m-team-list-null" :title="$t('team.homeFilters.empty')" type="info" center show-icon></el-alert>
        <div
            v-if="!isIndex && loading"
            class="m-team-pagination-skeleton"
            aria-hidden="true"
        >
            <span class="u-skeleton-page u-skeleton-page-total"></span>
            <span class="u-skeleton-page u-skeleton-page-button"></span>
            <span class="u-skeleton-page u-skeleton-page-button is-active"></span>
            <span class="u-skeleton-page u-skeleton-page-button"></span>
            <span class="u-skeleton-page u-skeleton-page-button"></span>
            <span class="u-skeleton-page u-skeleton-page-button"></span>
            <span class="u-skeleton-page u-skeleton-page-jump"></span>
        </div>
        <el-pagination
            v-if="!isIndex && !loading"
            class="m-team-list-pages"
            background
            :layout="homeMode ? 'prev, pager, next, jumper' : 'total, prev, pager, next, jumper'"
            :hide-on-single-page="true"
            :page-size="per"
            :total="total"
            :pager-count="isMobilePagination ? 5 : 7"
            :small="isMobilePagination"
            v-model:current-page="page"
            @current-change="changePage"
        ></el-pagination>
    </div>
</template>

<script>
import servers from "@jx3box/jx3box-data/data/server/server_list.json";
import serverMap from "@jx3box/jx3box-data/data/server/server_map.json";
import server_std from "@jx3box/jx3box-data/data/server/server_std.json";
import server_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import tags from "@/assets/data/team/tags.json";
import { getThumbnail, showAvatar, authorLink } from "@jx3box/jx3box-common/js/utils";
import { __ossMirror, __cdn } from "@/utils/config";
import { getTeams } from "@/service/team/team.js";
import { uniq } from "lodash";

const TEAM_NAME_LIMIT = 12;

export default {
    name: "TeamList",
    props: ["limit", "isIndex", "homeMode"],
    emits: ["changePage", "total-change"],
    components: {},
    data: function () {
        return {
            per: this.limit || 10,
            page: 1,
            total: 1,
            pages: 1,
            data: [],
            loading: true,
            name: "",
            server: "",
            servers,
            isVerified: false,
            tags,
            tag: [],
            isMobilePagination: false,
            paginationMediaQuery: null,
        };
    },
    computed: {
        params: function () {
            let params = {
                pageIndex: this.page,
                pageSize: this.per,
                // recruit: 1,
                server: this.server,
                name: this.name,
                tag: this.tag && this.tag.length ? this.tag.join(",") : "",
                client: this.client,
            };
            if (this.isVerified) {
                params.status = 1;
            }
            return params;
        },
        client: function () {
            return this.$store.state.client;
        },
        serversWithClient: function () {
            return uniq(this.client == "std" ? server_std : server_origin);
        },
        skeletonCount: function () {
            return Math.min(this.per, this.isIndex ? 8 : 10);
        },
        hasActiveFilters: function () {
            return this.isVerified || this.tag.length > 0;
        },
    },
    methods: {
        showAvatar,
        authorLink,
        tagLabel: function (tag) {
            const keys = {
                "\u53ef\u6559\u5b66": "teachable",
                "\u56fa\u5b9a\u56e2": "fixed",
                "\u6210\u5c31\u56e2": "achievement",
                "\u5b66\u751f\u515a": "student",
                "\u4e0a\u73ed\u515a": "worker",
                "\u7206\u809d\u5e1d": "hardcore",
                "\u65f6\u5dee\u515a": "timezone",
            };
            return keys[tag] ? this.$t(`team.teamTags.${keys[tag]}`) : tag;
        },
        formatTeamName: function (value) {
            const name = String(value || "");
            const characters = Array.from(name);

            return characters.length > TEAM_NAME_LIMIT
                ? characters.slice(0, TEAM_NAME_LIMIT).join("") + "…"
                : name;
        },
        loadData: function () {
            this.loading = true;
            getTeams(this.params)
                .then((res) => {
                    this.total = res.data.data.page.total;
                    this.pages = res.data.data.page.pageTotal;
                    this.data = res.data.data.list || [];
                    this.$emit("total-change", this.total);
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        changePage: function (val) {
            this.page = val;
            this.$emit("changePage", this.page);
        },
        changeServer: function () {
            this.page = 1;
        },
        searchTeam: function () {},
        clearFilters: function () {
            this.isVerified = false;
            this.tag = [];
            this.page = 1;
        },
        updatePaginationViewport: function (event) {
            this.isMobilePagination = event.matches;
        },
        showLogo: function (val) {
            return getThumbnail(val, 204, true);
        },
        useDefaultLogo: function (event) {
            const image = event.currentTarget;
            if (image.dataset.fallbackApplied) return;

            image.dataset.fallbackApplied = "true";
            image.src = require("@/assets/img/team/team_logo_null.svg");
        },
        showTeamMedal: function (val) {
            return __cdn + "design/medals/team/" + val + ".webp";
        },
    },
    watch: {
        params: function (newparams) {
            this.loadData();
        },
    },
    created: function () {},
    mounted: function () {
        this.paginationMediaQuery = window.matchMedia("(max-width: 560px)");
        this.updatePaginationViewport(this.paginationMediaQuery);
        this.paginationMediaQuery.addEventListener("change", this.updatePaginationViewport);
        this.loadData();
    },
    beforeUnmount: function () {
        this.paginationMediaQuery?.removeEventListener("change", this.updatePaginationViewport);
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_list.less";
</style>
