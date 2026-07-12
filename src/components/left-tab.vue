<template>
    <div class="m-left-tab">
        <el-tabs v-model="type" :tab-position="windowWidth < 900 ? 'top' : 'left'">
            <el-tab-pane name="all" :label="$t('pages.emotion.all')">
                <template #label>
                    <i class="u-icon el-icon-menu" style="vertical-align: 0"></i>
                </template>
            </el-tab-pane>
            <el-tab-pane v-for="(item, i) in schoolmap" :key="i" :name="i">
                <template #label>
                    <img class="u-icon" :src="showSchoolIcon(i)" :alt="item" :title="item" />
                </template>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import schoolmap from "@jx3box/jx3box-data/data/xf/schoolid.json";
import { __imgPath } from "@/utils/config";
export default {
    name: "LeftTab",
    props: {
        modelValue: {
            type: [String, Number],
            default: "all",
        },
    },
    emits: ["update:modelValue", "setType"],
    data() {
        return {
            type: this.modelValue,
            windowWidth: document.documentElement.clientWidth,
            schoolmap,
        };
    },
    watch: {
        modelValue(type) {
            if (type !== this.type) {
                this.type = type;
            }
        },
        type(type) {
            this.$emit("update:modelValue", type);
            this.$emit("setType", type);
        },
    },
    methods: {
        showSchoolIcon: function (val) {
            return __imgPath + "image/school/" + val + ".png";
        },
        updateWindowWidth() {
            this.windowWidth = document.documentElement.clientWidth;
        },
    },
    mounted() {
        window.addEventListener("resize", this.updateWindowWidth);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.updateWindowWidth);
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
            // background-color: @v4primary;
            color: @v4primary;
        }
        .el-icon-menu {
            line-height: 28px;
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
    @media screen and (max-width: 899px) {
        .el-tabs__item {
            flex-shrink: 0;
        }
    }
}
</style>
