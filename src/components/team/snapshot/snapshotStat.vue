<template>
    <div class="m-snapshot-stat">
        <div class="m-snapshot-toolbar">
            <div class="m-snapshot-search">
                <el-input v-model.trim="search" :placeholder="$t('team.snapshot.searchRole')" clearable :aria-label="$t('team.snapshot.searchRole')">
                    <template #prefix><i class="el-icon-search"></i></template>
                </el-input>
            </div>

            <div class="m-snapshot-period" role="group" :aria-label="$t('team.snapshot.dateRangeAria')">
                <button type="button" :class="{ 'is-active': active === 0 }" @click="setDefault">{{ $t("team.snapshot.all") }}</button>
                <button type="button" :class="{ 'is-active': active === 7 }" @click="quickSelect(7)">{{ $t("team.snapshot.last7") }}</button>
                <button type="button" :class="{ 'is-active': active === 30 }" @click="quickSelect(30)">{{ $t("team.snapshot.last30") }}</button>
            </div>

            <el-date-picker
                class="m-snapshot-date"
                :start-placeholder="$t('team.snapshot.startDate')"
                :end-placeholder="$t('team.snapshot.endDate')"
                v-model="rangeDate"
                type="daterange"
                :range-separator="$t('team.snapshot.to')"
                :picker-options="pickerOptions"
            ></el-date-picker>
        </div>

        <div class="m-snapshot-content" v-loading="loading" v-if="data && data.length">
            <el-table
                class="m-snapshot-table"
                :data="data.filter((d) => !search || d.name.includes(search))"
                size="small"
            >
                <el-table-column :label="$t('team.snapshot.role')" prop="name">
                    <template #default="scope">
                        <div class="u-item">
                            <span class="u-avatar-frame">
                                <img class="u-avatar" :src="showMountIcon(scope.row.mount)" :alt="$t('team.snapshot.mountTitle')" />
                            </span>
                            <span class="u-name" :title="scope.row.name">{{ scope.row.name }}</span>
                            <div class="u-bar-box">
                                <div
                                    class="u-bar"
                                    :style="{
                                        background: mountColor(scope.row.mount),
                                        width: getBarWidth(scope.row.count),
                                    }"
                                ></div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('team.snapshot.attendance')" prop="count" width="120" align="center">
                    <template #default="scope">
                        <span class="u-count">{{ $t("team.snapshot.count", { count: scope.row.count }) }}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('team.snapshot.operation')" width="140" align="right" header-align="right">
                    <template #default="scope">
                        <el-button class="u-view-snapshot" plain @click="rowView(scope.row)" icon="Camera" size="small"
                            >{{ $t("team.snapshot.related") }}</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-alert class="m-snapshot-null" v-else show-icon type="warning" :title="$t('team.snapshot.noRangeData')"></el-alert>

        <snapshot-detail v-model="showDetail" :data="currentRow"></snapshot-detail>
    </div>
</template>

<script>
import { getSnapshotByTime } from "@/service/team/snapshot.js";
import { showMountIcon } from "@/utils/filters";

import moment from "moment";
import { mountColor } from "@/utils/commonFn";

// component
import snapshotDetail from "./snapshotDetail.vue";

export default {
    props: ["org"],
    data() {
        return {
            search: "",
            rangeDate: [],

            data: [],
            loading: false,
            showDetail: false,
            currentRow: "",
            active: 0,

            pickerMinDate: null,
            pickerMaxDate: null,
            day30: 30 * 24 * 3600 * 1000,
            // 日期使用
            pickerOptions: {
                onPick: ({ maxDate, minDate }) => {
                    if (minDate && this.pickerMinDate) {
                        this.pickerMinDate = null;
                    } else if (minDate) {
                        this.pickerMinDate = minDate.getTime();
                    }
                },
                disabledDate: (time) => {
                    if (this.pickerMinDate) {
                        return (
                            time.getTime() > this.pickerMinDate + this.day30 ||
                            time.getTime() < this.pickerMinDate - this.day30
                        );
                    }
                    return false;
                },
            },
        };
    },
    components: {
        snapshotDetail,
    },
    computed: {
        maxCount: function () {
            let count_bucket = this.data.map((item) => item.count || 1);

            return Math.max(...count_bucket);
        },
    },
    watch: {
        rangeDate: {
            deep: true,
            handler(val) {
                if (!val || !val.length) return;
                this.active = "";
                const [start, end] = this.rangeDate.length
                    ? this.rangeDate.map((item) => moment(item).format("YYYY-MM-DD"))
                    : [];
                this.loadSnapShot({ start, end });
            },
        },
        org: {
            immediate: true,
            handler(val) {
                if (val) this.setDefault();
            },
        },
    },
    methods: {
        quickSelect(val) {
            this.active = val;
            this.rangeDate = [];
            const end = moment().format("YYYY-MM-DD");
            const start = moment().subtract(val, "days").format("YYYY-MM-DD");

            this.loadSnapShot({ start, end });
        },
        setDefault() {
            this.active = 0;
            this.rangeDate = [];
            this.loadSnapShot();
        },
        loadSnapShot({ start = "", end = "" } = {}) {
            if (!this.org) return;
            this.loading = true;

            getSnapshotByTime(this.org, {
                start: start,
                end: end,
            }).then((res) => {
                const list = res.data.data.list || [];

                const data = [];

                list.forEach((item) => {
                    const teammate = item.teammate.split(";");

                    teammate.forEach((mate) => {
                        const [name, unknownId, guid, mount] = mate.split(",");

                        const role = data.find((d) => d?.guid === guid && d?.name === name);

                        if (role) {
                            role.count++;
                            role.data.push(item);
                        } else {
                            const _mate = {
                                name,
                                unknownId,
                                guid,
                                mount,
                                count: 1,
                                data: [],
                                show: true,
                            };

                            _mate.data.push(item);

                            data.push(_mate);
                        }
                    });
                });
                this.data = data.sort((prev, cur) => cur.count - prev.count);

                this.loading = false;
            });
        },
        mountColor,
        rowView(row) {
            this.currentRow = row;
            this.showDetail = true;
        },
        getBarWidth(count) {
            return (count / this.maxCount).toFixed(4) * 100 + "%";
        },
        showMountIcon,
    },
};
</script>
<style lang="less">
@import "@/assets/css/team/snapshot/stat.less";
</style>
