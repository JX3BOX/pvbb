<template>
    <div class="v-snapshot-list">
        <div class="m-snapshot-workspace">
            <nav class="m-snapshot-subnav" aria-label="快照管理功能">
                <button type="button" :class="{ 'is-active': tab === 'list' }" @click="switchTab('list')">
                    团队快照
                </button>
                <button type="button" :class="{ 'is-active': tab === 'stat' }" @click="switchTab('stat')">团员印象</button>
                <button type="button" :class="{ 'is-active': tab === 'chart' }" @click="switchTab('chart')">快照统计</button>
                <button v-if="canConfigurePassword" type="button" :class="{ 'is-active': tab === 'password' }" @click="switchTab('password')">密码配置</button>
                <a class="u-snapshot-help" href="/tool/23783" target="_blank" rel="noopener noreferrer">
                    <i class="el-icon-document" aria-hidden="true"></i>
                    <span>帮助文档</span>
                </a>
            </nav>
            <keep-alive>
                <component
                    :is="componentsMap[tab]"
                    :key="tab"
                    :org="org"
                    :read-only="readOnly"
                    :support-dkp-sync="false"
                />
            </keep-alive>
        </div>
    </div>
</template>
<script>
import snapshotList from "@/components/team/snapshot/snapshotList.vue";
import snapshotStat from "@/components/team/snapshot/snapshotStat.vue";
import snapshotChart from "@/components/team/snapshot/snapshotChart.vue";
import EditPassword from "./EditPassword.vue";

import { getMyPowerTeams } from "@/service/team/team.js";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";

const MANAGE_SNAPSHOT_TABS = ["list", "stat", "chart", "password"];
const MEMBER_SNAPSHOT_TABS = ["list", "stat", "chart"];

export default {
    name: "ListSnapshot",
    props: {
        teamId: {
            type: [Number, String],
            default: null,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
        canConfigurePassword: {
            type: Boolean,
            default: false,
        },
    },
    data: function () {
        return {
            tab: "list",

            org: "",
            orgs: [],

            componentsMap: {
                list: "snapshot-list",
                stat: "snapshot-stat",
                chart: "snapshot-chart",
                password: "edit-password",
            },
        };
    },
    computed: {
        allowedTabs() {
            return this.canConfigurePassword ? MANAGE_SNAPSHOT_TABS : MEMBER_SNAPSHOT_TABS;
        },
    },
    watch: {
        teamId: {
            immediate: true,
            handler: function (teamId) {
                if (teamId) this.org = Number(teamId);
            },
        },
        "$route.query.subtab": {
            immediate: true,
            handler: function (subtab) {
                this.tab = this.allowedTabs.includes(subtab) ? subtab : "list";
            },
        },
        canConfigurePassword: function () {
            const subtab = this.$route.query.subtab;
            this.tab = this.allowedTabs.includes(subtab) ? subtab : "list";
        },
    },
    methods: {
        switchTab(tab) {
            if (!this.allowedTabs.includes(tab)) return;

            this.tab = tab;
            if (this.$route.query.subtab === tab) return;

            this.$router
                .replace({
                    query: {
                        ...this.$route.query,
                        subtab: tab,
                    },
                })
                .catch(() => {});
        },
        loadTeams() {
            if (this.teamId) {
                this.org = Number(this.teamId);
                return Promise.resolve();
            }
            return getMyPowerTeams("r_snapshot").then((res) => {
                this.orgs = res.data.data.list || [];
                this.org = this.orgs.length && this.orgs[0]["ID"];
            });
        },
        init() {
            this.loadTeams();
        },
    },
    mounted: function () {
        this.init();
    },
    filters: {
        showTeamLogo: function (val) {
            return getThumbnail(val, 84);
        },
    },
    components: {
        "snapshot-list": snapshotList,
        "snapshot-stat": snapshotStat,
        "snapshot-chart": snapshotChart,
        "edit-password": EditPassword,
    },
};
</script>

<style lang="less">
@import (reference) "@/assets/css/team/design-system/_tokens.less";

.v-snapshot-list {
    min-width: 0;

    .m-snapshot-workspace {
        min-width: 0;
    }

    .m-snapshot-subnav {
        display: flex;
        min-width: 0;
        align-items: center;
        margin-bottom: @team-space-4;
        padding: 4px;
        overflow-x: auto;
        border: 1px solid @team-border-light;
        border-radius: 12px;
        background: @team-surface-muted;
        gap: 4px;
        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }

        button {
            min-width: max-content;
            min-height: 34px;
            padding: 0 @team-space-3;
            border: 0;
            border-radius: 9px;
            background: transparent;
            color: @team-text-secondary;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
            transition: color @team-duration-fast @team-ease-standard,
                background-color @team-duration-fast @team-ease-standard,
                box-shadow @team-duration-fast @team-ease-standard;

            &:hover {
                color: @team-primary;
            }

            &:focus-visible {
                outline: none;
                box-shadow: @team-shadow-focus;
            }

            &.is-active {
                background: @team-surface;
                color: @team-primary;
                box-shadow: @team-shadow-xs;
            }
        }

        .u-snapshot-help {
            display: inline-flex;
            min-width: max-content;
            min-height: 34px;
            align-items: center;
            justify-content: center;
            gap: 5px;
            margin-left: auto;
            padding: 0 @team-space-3;
            border-radius: 9px;
            color: @team-text-muted;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            transition: color @team-duration-fast @team-ease-standard,
                background-color @team-duration-fast @team-ease-standard;

            &:hover {
                background: fade(@team-primary, 8%);
                color: @team-primary;
            }

            &:focus-visible {
                outline: none;
                box-shadow: @team-shadow-focus;
            }
        }
    }
}
</style>
