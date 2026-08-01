<template>
    <div class="m-snapshot-chart">
        <div class="m-snapshot-chart-search">
            <div class="m-snapshot-chart-period" role="group" aria-label="快照统计日期范围">
                <button type="button" :class="{ 'is-active': active === 0 }" @click="setDefault">全部</button>
                <button type="button" :class="{ 'is-active': active === 7 }" @click="quickSelect(7)">近 7 天</button>
                <button type="button" :class="{ 'is-active': active === 30 }" @click="quickSelect(30)">近 30 天</button>
            </div>
            <el-date-picker
                class="m-snapshot-chart-date"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                v-model="rangeDate"
                type="daterange"
                range-separator="至"
                :picker-options="pickerOptions"
            ></el-date-picker>
        </div>

        <div class="m-snapshot-chart-content" v-show="hasSnapshot" v-loading="loading">
            <section class="m-snapshot-chart-card m-chart-line">
                <header class="u-chart-heading">
                    <h3>每日开团次数</h3>
                    <p>查看所选日期范围内每天创建的团队快照数量</p>
                </header>
                <div ref="lineChart" id="snapshot-line"></div>
            </section>
            <section class="m-snapshot-chart-card m-chart-pie">
                <header class="u-chart-heading">
                    <h3>心法比例</h3>
                    <p>统计所有参团记录中的心法构成</p>
                </header>
                <div ref="pieChart" id="snapshot-pie"></div>
            </section>
            <section class="m-snapshot-chart-card m-chart-bar">
                <header class="u-chart-heading">
                    <h3>角色出勤次数</h3>
                    <p>对比各角色在所选范围内的参团次数</p>
                </header>
                <div ref="barChart" id="snapshot-bar"></div>
            </section>
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
import { markRaw } from "vue";

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
            requestId: 0,

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
        async loadSnapShot({ start = "", end = "" } = {}) {
            if (!this.org) return;
            const requestId = ++this.requestId;
            this.loading = true;

            try {
                const res = await getSnapshotByTime(this.org, {
                    start: start,
                    end: end,
                });
                if (requestId !== this.requestId) return;

                const list = [...(res.data.data.list || [])].reverse();

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

                if (!this.hasSnapshot) return;

                await this.$nextTick();
                if (requestId !== this.requestId) return;

                this.drawLine(lineData);
                this.drawPie(pieData);
                this.drawBar(barData);
            } finally {
                if (requestId === this.requestId) {
                    this.loading = false;
                }
            }
        },
        drawLine(data) {
            const option = cloneDeep(lineOptions);

            option.xAxis.data = Object.keys(data);
            option.series[0].data = Object.values(data);

            this.drawChart(this.$refs.lineChart, option, "line");
        },
        drawPie(data) {
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

            this.drawChart(this.$refs.pieChart, option, "pie");
        },
        drawBar(data) {
            const option = cloneDeep(barOptions);
            option.xAxis.data = Object.keys(data);
            option.series[0].data = Object.values(data);

            this.drawChart(this.$refs.barChart, option, "bar");
        },
        drawChart(dom, option, type) {
            if (!dom || !dom.isConnected) return;

            if (!this.charts[type]) {
                // ECharts 实例依赖内部对象身份，不能被 Vue 3 深度响应式代理。
                this.charts[type] = markRaw(echarts.getInstanceByDom(dom) || echarts.init(dom));
            }

            option && this.charts[type].setOption(option, { notMerge: true });
        },
        resizeCharts() {
            Object.values(this.charts).forEach((chart) => chart && chart.resize());
        },
        disposeCharts() {
            Object.values(this.charts).forEach((chart) => chart && chart.dispose());
            this.charts = {
                line: "",
                pie: "",
                bar: "",
            };
        },
    },
    mounted() {
        window.addEventListener("resize", this.resizeCharts);
    },
    activated() {
        window.addEventListener("resize", this.resizeCharts);
        this.$nextTick(this.resizeCharts);
    },
    deactivated() {
        window.removeEventListener("resize", this.resizeCharts);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.resizeCharts);
        this.disposeCharts();
    },
};
</script>

<style lang="less">
@import (reference) "@/assets/css/team/design-system/_tokens.less";

.m-snapshot-chart {
    min-width: 0;

    .m-snapshot-chart-search {
        display: flex;
        min-width: 0;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: @team-space-4;
        padding: @team-space-2;
        border: 1px solid @team-border-light;
        border-radius: 12px;
        background: @team-surface-muted;
        gap: @team-space-2;
    }

    .m-snapshot-chart-period {
        display: inline-flex;
        min-width: max-content;
        align-items: center;
        padding: 3px;
        border: 1px solid @team-border;
        border-radius: @team-radius-small;
        background: @team-surface;
        gap: 2px;

        button {
            min-height: 32px;
            padding: 0 @team-space-2;
            border: 0;
            border-radius: 7px;
            background: transparent;
            color: @team-text-secondary;
            cursor: pointer;
            font: inherit;
            font-size: 12px;
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
                background: @team-primary-soft;
                color: @team-primary;
            }
        }
    }

    .m-snapshot-chart-date {
        --el-date-editor-width: 250px;
        width: 250px !important;
        max-width: 250px;
        min-height: 40px;
        flex: 0 0 250px;
        padding: 0 @team-space-2;
        border: 1px solid @team-border;
        border-radius: @team-radius-small;
        background: @team-surface;
        box-shadow: none;
        transition: border-color @team-duration-fast @team-ease-standard,
            box-shadow @team-duration-fast @team-ease-standard;

        &:hover {
            border-color: @team-border-focus;
        }

        &.is-active,
        &.is-focus {
            border-color: @team-primary;
            box-shadow: @team-shadow-focus;
        }
    }

    .m-snapshot-chart-content {
        display: grid;
        min-width: 0;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: @team-space-4;
    }

    .m-snapshot-chart-card {
        min-width: 0;
        overflow: hidden;
        border: 1px solid @team-border-light;
        border-radius: @team-radius-control;
        background: @team-surface;
        box-shadow: @team-shadow-xs;
    }

    .m-chart-line {
        grid-column: 1 / -1;
    }

    .u-chart-heading {
        padding: @team-space-3 @team-space-4 0;

        h3 {
            margin: 0;
            color: @team-text-primary;
            font-size: 15px;
            font-weight: 700;
            line-height: 22px;
        }

        p {
            margin: 4px 0 0;
            color: @team-text-muted;
            font-size: 12px;
            line-height: 18px;
        }
    }

    #snapshot-line,
    #snapshot-pie,
    #snapshot-bar {
        width: 100%;
        height: 360px;
    }

    .u-alert {
        margin-top: 0;
        border: 1px solid @team-border-light;
        border-radius: @team-radius-control;
    }
}

@media screen and (max-width: 1100px) {
    .m-snapshot-chart {
        .m-snapshot-chart-content {
            grid-template-columns: minmax(0, 1fr);
        }

        .m-chart-line {
            grid-column: auto;
        }
    }
}

@media screen and (max-width: 760px) {
    .m-snapshot-chart {
        .m-snapshot-chart-search {
            align-items: stretch;
        }

        .m-snapshot-chart-period {
            width: 100%;

            button {
                flex: 1;
            }
        }

        .m-snapshot-chart-date {
            --el-date-editor-width: 100%;
            width: 100% !important;
            max-width: 100%;
            flex-basis: 100%;
        }

        #snapshot-line,
        #snapshot-pie,
        #snapshot-bar {
            height: 320px;
        }
    }
}
</style>
