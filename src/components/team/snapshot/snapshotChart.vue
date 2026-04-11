<template>
    <div class="m-snapshot-chart">
        <div class="m-snapshot-chart-search">
            <el-button link :disabled="active === 0" @click="setDefault">默认</el-button>
            <el-divider direction="vertical"></el-divider>
            <el-button link :disabled="active === 7" @click="quickSelect(7)">7天</el-button>
            <el-divider direction="vertical"></el-divider>
            <el-button link :disabled="active === 30" @click="quickSelect(30)">30天</el-button>
            <el-divider direction="vertical"></el-divider>
            <el-date-picker
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                v-model="rangeDate"
                style="width: 250px"
                type="daterange"
                size="small"
                :picker-options="pickerOptions"
            ></el-date-picker>
        </div>

        <div class="m-snapshot-chart-content" v-show="hasSnapshot" v-loading="loading">
            <div class="m-chart-line">
                <div id="snapshot-line"></div>
            </div>
            <div class="m-chart-pie">
                <div id="snapshot-pie"></div>
            </div>
            <div class="m-chart-bar">
                <div id="snapshot-bar"></div>
            </div>
        </div>
        <el-alert
            class="u-alert"
            v-show="!hasSnapshot"
            show-icon
            type="warning"
            title="该日期范围内不存在快照"
        ></el-alert>
    </div>
</template>

<script>
import { getSnapshotByTime } from "@/service/team/snapshot";
import { mountColor } from "@/utils/commonFn";
import mount_equip from "@jx3box/jx3box-data/data/xf/mount_equip.json";
import snapshotChartData from "@/assets/data/team/snapshot_chart.json";
const { lineOptions, pieOptions, barOptions } = snapshotChartData;

import * as echarts from "echarts";
import cloneDeep from "lodash/cloneDeep";
import moment from "moment";

export default {
    name: "snapshotChart",
    props: ["org"],
    data() {
        return {
            rangeDate: [],
            hasSnapshot: true,
            loading: false,

            active: 0,

            charts: {
                line: "",
                pie: "",
                bar: "",
            },

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
                if (val) {
                    this.setDefault();
                }
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
                let list = res.data.data.list || [];

                list = list.reverse();

                this.hasSnapshot = !!list.length;

                const lineData = {};

                const pieData = {};

                const barData = {};

                list.forEach((item) => {
                    // 统计每日开团次数
                    const time = moment(item.created_at).format("YYYY-MM-DD");
                    if (!lineData[time]) {
                        lineData[time] = 1;
                    } else {
                        lineData[time]++;
                    }

                    const teammate = item.teammate.split(";");

                    teammate.forEach((mate) => {
                        const [name, , , mount] = mate.split(",");
                        // 统计心法次数
                        if (!pieData[mount]) {
                            pieData[mount] = 1;
                        } else {
                            pieData[mount]++;
                        }

                        // 统计角色出勤次数
                        if (!barData[name]) {
                            barData[name] = 1;
                        } else {
                            barData[name]++;
                        }
                    });
                });

                this.drawLine(lineData);

                this.drawPie(pieData);

                this.drawBar(barData);

                this.loading = false;
            });
        },
        drawLine(data) {
            const dom = document.querySelector("#snapshot-line");
            const option = cloneDeep(lineOptions);

            option.xAxis.data = Object.keys(data);
            option.series[0].data = Object.values(data);

            this.drawChart(dom, option, "line");
        },
        drawPie(data) {
            const dom = document.querySelector("#snapshot-pie");
            const pieData = [];
            Object.entries(data).forEach(([key, value]) => {
                const item = {
                    value,
                    name: (mount_equip[key] && mount_equip[key].name) || "未知",
                    itemStyle: {
                        color: mountColor(key),
                    },
                };
                pieData.push(item);
            });
            const option = cloneDeep(pieOptions);
            option.series[0].data = pieData;

            this.drawChart(dom, option, "pie");
        },
        drawBar(data) {
            const dom = document.querySelector("#snapshot-bar");
            const option = cloneDeep(barOptions);
            option.xAxis.data = Object.keys(data);
            option.series[0].data = Object.values(data);

            this.drawChart(dom, option, "bar");
        },
        drawChart(dom, option, type) {
            if (!this.charts[type]) {
                this.charts[type] = echarts.init(dom);
            }

            option && this.charts[type].setOption(option);
        },
    },
};
</script>

<style lang="less">
.m-snapshot-chart {
    .m-chart-line {
        margin-top: 20px;
        width: 100%;
        height: 400px;
        #snapshot-line {
            width: 100%;
            height: 100%;
        }
    }
    .m-chart-pie {
        margin-top: 20px;
        width: 100%;
        height: 400px;
        #snapshot-pie {
            width: 100%;
            height: 100%;
        }
    }
    .m-chart-bar {
        margin-top: 20px;
        width: 100%;
        height: 400px;
        #snapshot-bar {
            width: 100%;
            height: 100%;
        }
    }

    .u-alert {
        margin-top: 20px;
    }
}
@media screen and (max-width: @phone) {
    .m-chart-pie {
        overflow-x: auto;
    }
    #snapshot-pie {
        min-width: 1000px;
    }
}
</style>
