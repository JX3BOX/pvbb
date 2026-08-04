<template>
    <div class="v-raid-list" :class="{ 'is-embedded': embedded }">
        <h1 v-if="!embedded" class="m-title">
            <i class="el-icon-date"></i>
            <span class="u-txt">{{ $t("team.raid.common.activities") }}</span>
            <div class="u-op">
                <a href="/tool/23805" class="u-help" target="_blank"> <i class="el-icon-info"></i> {{ $t("team.raid.common.help") }} </a>
                <el-button type="primary" size="small" v-if="orgs.length" @click="openCreateDialog">
                    <i class="el-icon-circle-plus-outline"></i>
                    {{ $t("team.raid.common.create") }}
                </el-button>
            </div>
        </h1>
        <div class="m-raid-box" v-if="orgs.length">
            <div v-if="!embedded && orgs.length > 1" class="m-raid-tab">
                <el-tabs v-model="team_id" type="card" class="m-raid-card-tabs">
                    <el-tab-pane :name="String(item.ID)" v-for="(item, i) in orgs" :key="i">
                        <template #label>
                            <img class="u-org-logo" :src="getThumbnail(item.logo, 84)" v-if="item.logo" />
                            <img class="u-org-logo" src="@/assets/img/team/null.png" v-else />
                            <span class="u-org-name">{{ item.name || $t("team.raid.manage.unknownTeam") }}</span>
                        </template>
                    </el-tab-pane>
                </el-tabs>
            </div>

            <div class="m-raid-toolbar">
                <el-button v-if="embedded" class="u-create" type="primary" icon="Plus" @click="openCreateDialog">
                    {{ $t("team.raid.common.create") }}
                </el-button>
                <el-input
                    v-model="searchDraft"
                    :placeholder="$t('team.raid.manage.searchPlaceholder')"
                    clearable
                    :aria-label="$t('team.raid.manage.searchAria')"
                ></el-input>
                <span class="u-raid-total">{{ $t("team.raid.manage.total", { count: total }) }}</span>
            </div>

            <div class="m-raid-container" v-loading="loading">
                <div class="m-raid-list" v-if="list && list.length">
                    <raid-item
                        v-for="(item, i) in list"
                        :data="item"
                        :key="item.id"
                        :team_id="team_id"
                        @dropItem="deleteItem(i)"
                        @sticky="setSticky"
                        @edit="openEditDialog"
                    />
                    <el-pagination
                        class="m-raid-pages"
                        background
                        layout="total, prev, pager, next,jumper"
                        :hide-on-single-page="true"
                        :page-size="per"
                        :total="total"
                        v-model:current-page="page"
                        @current-change="changePage"
                    ></el-pagination>
                </div>

                <div class="m-raid-empty" v-else-if="!loading">
                    <span class="u-empty-icon" aria-hidden="true"><i class="el-icon-date"></i></span>
                    <h3>{{ $t(search ? "team.raid.manage.emptySearch" : "team.raid.manage.empty") }}</h3>
                    <p>{{ $t(search ? "team.raid.manage.retrySearch" : "team.raid.manage.emptyHint") }}</p>
                    <el-button v-if="!search" type="primary" @click="openCreateDialog">{{ $t("team.raid.manage.createFirst") }}</el-button>
                </div>
            </div>
        </div>
        <el-alert v-else :title="$t('team.raid.manage.noPermission')" type="info" show-icon></el-alert>
        <RaidFormDialog
            v-model="formVisible"
            :raid-id="editingId"
            :teams="orgs"
            :default-team-id="team_id"
            @saved="handleSaved"
        />
    </div>
</template>

<script>
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import { manageRaid } from "@/service/team/raid.js";
import { getMyPowerTeams } from "@/service/team/team.js";
import RaidItem from "@/components/team/raid/RaidItem.vue";
import RaidFormDialog from "@/components/team/raid/RaidFormDialog.vue";

import localforage from "localforage";
import debounce from "lodash/debounce";

export default {
    name: "ManageRaid",
    props: {
        teamId: {
            type: [Number, String],
            default: 0,
        },
        embedded: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {
            team_id: "",
            orgs: [],

            list: [],
            page: 1,
            per: 10,
            total: 1,
            loading: false,

            search: "",
            searchDraft: "",
            formVisible: false,
            editingId: "",
        };
    },
    computed: {
        params: function () {
            return {
                page: this.page,
                per: this.per,
                search: this.search,
            };
        },
    },
    methods: {
        loadTeams() {
            return getMyPowerTeams("r_raid").then(async (res) => {
                const orgs = res.data.data.list || [];
                if (~~this.teamId) {
                    const current = orgs.find((item) => ~~item.ID === ~~this.teamId);
                    this.orgs = current ? [current] : [];
                    this.team_id = current ? String(current.ID) : "";
                    return;
                }
                this.orgs = orgs;
                this.team_id = this.orgs[0]?.ID ? String(this.orgs[0].ID) : "";
            });
        },
        loadData() {
            this.loading = true;
            return manageRaid(this.team_id, this.params)
                .then((res) => {
                    this.list = res.data.data.list || [];
                    this.total = res.data.data.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        deleteItem: function (i) {
            this.list.splice(i, 1);
            this.total = Math.max(0, this.total - 1);
        },
        openCreateDialog() {
            this.editingId = "";
            this.formVisible = true;
        },
        openEditDialog(id) {
            this.editingId = id;
            this.formVisible = true;
        },
        handleSaved() {
            this.loadData();
        },
        submitSearch() {
            const value = this.searchDraft.trim();
            if (this.page !== 1) this.page = 1;
            if (this.search === value) this.loadData();
            else this.search = value;
        },
        changeTeam: function () {
            // 将当前团队的信息保存在localStorage
            const currentTeam = this.orgs.find((org) => String(org.ID) === String(this.team_id));
            if (currentTeam) {
                // Vue 3 的响应式对象是 Proxy，IndexedDB 无法直接进行结构化克隆。
                const cachedTeam = {
                    ID: currentTeam.ID,
                    name: currentTeam.name,
                    server: currentTeam.server,
                    status: currentTeam.status,
                    logo: currentTeam.logo,
                };
                localforage.setItem("currentTeam", cachedTeam).catch(() => {});
            }
        },
        changePage: function () {
            window.scrollTo(0, 0);
        },
        init() {
            this.loadTeams();
        },
        setSticky() {
            if (this.page !== 1) {
                this.page = 1;
            } else {
                this.loadData();
            }
        },
        showTeamLogo: function (val) {
            return getThumbnail(val, 84);
        },
    },
    mounted: function () {
        this.init();
    },
    created: function () {
        this.submitSearchDebounced = debounce(this.submitSearch, 300);
    },
    beforeUnmount: function () {
        this.submitSearchDebounced.cancel();
    },
    watch: {
        searchDraft: function () {
            this.submitSearchDebounced();
        },
        teamId: function (value) {
            if (~~value) this.loadTeams();
        },
        params: {
            deep: true,
            handler: function () {
                this.loadData();
            },
        },
        team_id: {
            handler: function (val) {
                if (val) {
                    this.changeTeam();
                    if (this.page !== 1) this.page = 1;
                    else this.loadData();
                }
            },
        },
    },
    components: {
        RaidItem,
        RaidFormDialog,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/manage_raid.less";
</style>
