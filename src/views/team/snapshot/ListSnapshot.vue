<template>
    <div class="v-snapshot-list">
        <div class="m-snapshot-workspace">
            <nav class="m-snapshot-subnav" aria-label="快照管理功能">
                <button type="button" :class="{ 'is-active': tab === 'list' }" @click="tab = 'list'">全部快照</button>
                <button type="button" :class="{ 'is-active': tab === 'stat' }" @click="tab = 'stat'">团员印象</button>
                <button type="button" :class="{ 'is-active': tab === 'chart' }" @click="tab = 'chart'">快照统计</button>
                <button type="button" :class="{ 'is-active': tab === 'password' }" @click="tab = 'password'">密码配置</button>
            </nav>
            <keep-alive>
                <component :is="componentsMap[tab]" :org="org" />
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
export default {
    name: "ListSnapshot",
    props: [],
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
    computed: {},
    methods: {
        loadTeams() {
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
    }
}
</style>
