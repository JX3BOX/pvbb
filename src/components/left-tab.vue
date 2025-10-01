<template>
    <div class="m-left-tab">
        <el-tabs v-model="type" :tab-position="windowWidth <= 768 ? 'top' : 'left'">
            <el-tab-pane name="all" label="全部">
                <span slot="label"> <i class="u-icon el-icon-menu" style="vertical-align: 0"></i> </span>
            </el-tab-pane>
            <el-tab-pane v-for="(item, i) in schoolmap" :key="i" :name="i">
                <div slot="label">
                    <img class="u-icon" :src="showSchoolIcon(i)" :alt="item" :title="item" />
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import schoolmap from "@jx3box/jx3box-data/data/xf/schoolid.json";
import { __imgPath } from "@/utils/config";
export default {
    name: "LeftTab",
    data() {
        return {
            type: "all",
            windowWidth: document.documentElement.clientWidth,
            schoolmap,
        };
    },
    watch: {
        type(type) {
            this.$emit("setType", type);
        },
    },
    methods: {
        showSchoolIcon: function (val) {
            return __imgPath + "image/school/" + val + ".png";
        },
    },
    mounted: function () {
        const that = this;
        window.onresize = () => {
            that.windowWidth = document.documentElement.clientWidth;
        };
    },
};
</script>

<style lang="less">
.m-left-tab {
    position: sticky;
    top: 112px;
    margin-bottom: 10px;
    background-color: #fff;
    z-index: 100;
    .el-tabs__item {
        padding: 0 10px;
        &.is-active {
            background-color: rgba(#0366d6, 0.1);
            color: #0366d6;
        }
    }
    .u-icon {
        .size(24px);
        font-size: 20px;
        line-height: 40px;
        text-align: center;
    }
    .el-tabs--top .el-tabs__item.is-top:nth-child(2) {
        padding-left: 10px;
    }
}
</style>
