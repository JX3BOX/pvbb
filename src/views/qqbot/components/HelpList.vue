<template>
    <div class="m-help-list">
        <div class="m-nav-bar">
            <div
                v-for="type in types"
                :key="type.value"
                class="m-nav-bar-item"
                :class="[[type.value], { active: active === type.value }]"
                @click="onTypeChange(type.value)"
            >
                {{ type.name }}
            </div>
        </div>
        <div class="m-help-detail">
            <div
                class="m-help-detail-item"
                v-for="(item, index) in helpList"
                :key="index"
                @mouseenter="itemActive = item"
            >
                <div class="u-detail-title" :class="{ active: itemActive?.triggerKeyword === item.triggerKeyword }">
                    {{ item.remark || item.triggerKeyword }}
                </div>
                <div class="hr"></div>
                <div
                    class="u-detail-content"
                    :class="{ active: itemActive?.triggerKeyword === item.triggerKeyword }"
                    @click="copy(item)"
                >
                    {{ item.triggerKeyword }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getCommandList } from "@/service/qqbot";

export default {
    name: "HelpList",
    data() {
        return {
            active: "pve",
            itemActive: null,
            types: [
                { name: "PVE", value: "pve" },
                { name: "PVP", value: "pvp" },
                { name: "PVX", value: "pvx" },
                { name: "系统", value: "system" },
            ],
            helpList: [],
        };
    },
    mounted() {
        this.loadCommands();
    },
    methods: {
        loadCommands() {
            const type = this.active;
            getCommandList({ category: type }).then((res) => {
                this.helpList = res.data.data.list;
            });
        },
        onTypeChange(type) {
            this.active = type;
            this.loadCommands();
        },
        async copy(item) {
            try {
                await this.$copyText(item.triggerKeyword);
                this.$notify.success({
                    title: "复制成功",
                    message: item.triggerKeyword,
                });
            } catch (error) {
                console.error("复制失败:", error);
                this.$message.error("复制失败");
            }
        },
    },
};
</script>

<style lang="less" scoped>
.m-help-list {
    width: 100%;
    padding: 24px 0;
    .m-nav-bar {
        width: 100%;
        height: 44px;
        display: flex;
        justify-content: space-between;

        .active {
            color: rgba(255, 255, 255, 1);
        }
        .pve.active {
            background: linear-gradient(90deg, rgba(67, 207, 124, 1) 0%, rgba(67, 207, 124, 0) 100%);
        }
        .pvp.active {
            background: linear-gradient(270deg, rgba(227, 60, 100, 0) 0%, rgba(227, 60, 100, 1) 100%);
        }
        .pvx.active {
            background: linear-gradient(270deg, rgba(255, 141, 26, 0) 0%, rgba(255, 141, 26, 1) 100%);
        }
        .system.active {
            background: linear-gradient(270deg, rgba(121, 72, 234, 0) 0%, rgba(121, 72, 234, 1) 100%);
        }
    }
    .m-nav-bar-item {
        cursor: pointer;
        width: 81px;
        height: 44px;
        border-radius: 12px;
        font-size: 24px;
        font-weight: 400;
        letter-spacing: 0px;
        line-height: 44px;
        color: rgba(255, 255, 255, 0.5);
        text-align: center;
    }
    .m-help-detail {
        width: 100%;
        height: 400px;
        overflow-y: auto;
        scrollbar-width: none;
        box-sizing: border-box;
        padding: 12px 0;
    }
    .m-help-detail-item {
        height: 24px;
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        align-items: center;
        .u-detail-title {
            font-size: 14px;
            font-weight: 400;
            letter-spacing: 0px;
            line-height: 24px;
            color: rgba(255, 255, 255, 0.5);
            &.active {
                color: rgba(255, 255, 255, 1);
                font-weight: 700;
            }
        }
        .u-detail-content {
            cursor: pointer;
            border-radius: 12px;
            border: 1px solid rgba(64, 128, 255, 1);
            font-size: 14px;
            font-weight: 700;
            line-height: 24px;
            color: rgba(255, 255, 255, 1);
            padding: 0 8px;
            &.active {
                color: rgba(255, 255, 255, 1);
                background: rgba(64, 128, 255, 1);
            }
        }
        .hr {
            height: 0px;
            flex: 1;
            border: 1px dashed rgba(255, 255, 255, 0.5);
            margin: 0 12px;
        }
    }
}
</style>
