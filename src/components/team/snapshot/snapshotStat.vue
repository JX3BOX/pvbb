<template>
    <div class="m-snapshot-stat">
        <div class="m-snapshot-toolbar">
            <div class="m-spapshot-other">
                <el-button link :disabled="active === 0" @click="setDefault">默认</el-button>
                <el-divider direction="vertical"></el-divider>
                <el-button link :disabled="active === 7" @click="quickSelect(7)">7天</el-button>
                <el-divider direction="vertical"></el-divider>
                <el-button link :disabled="active === 30" @click="quickSelect(30)">30天</el-button>
                <el-divider direction="vertical"></el-divider>
                <el-date-picker
                    size="small"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    v-model="rangeDate"
                    style="width: 250px"
                    type="daterange"
                    :picker-options="pickerOptions"
                ></el-date-picker>
            </div>

            <div class="m-snapshot-search">
                <el-input placeholder="角色名.." v-model="search" size="small">
                    <template #prepend><i class="el-icon-search"></i> 搜索</template>
                    <template #append>
                        <el-button icon="Position"></el-button>
                    </template>
                </el-input>
            </div>
        </div>

        <div class="m-snapshot-content" v-loading="loading" v-if="data && data.length">
            <el-table
                class="m-snapshot-table"
                :data="data.filter((d) => !search || d.name.includes(search))"
                size="small"
            >
                <el-table-column label="角色" prop="name">
                    <template #default="scope">
                        <div class="u-item">
                            <img class="u-avatar" width="24" :src="showMountIcon(scope.row.mount)" alt="心法" />
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
                <el-table-column label="参团次数" prop="count" width="100"></el-table-column>
                <el-table-column label="操作" width="120">
                    <template #default="scope">
                        <el-button link @click="rowView(scope.row)" icon="Camera" size="small">相关快照</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-alert class="m-snapshot-null" v-else show-icon type="warning" title="该日期范围内不存在快照"></el-alert>

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
