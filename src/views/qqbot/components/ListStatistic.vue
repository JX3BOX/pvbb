<template>
    <div class="member-statistics">
        <div class="member-statistics-left">{{ name }}（{{ count }}）</div>
        <div class="member-statistics-right">
            <div class="member-statistics-right-item">
                <div class="count T">{{ TCount?.length || 0 }}</div>
                <div class="role-name">坦克</div>
            </div>
            <div class="member-statistics-right-item">
                <div class="count HPS">{{ HPSCount?.length || 0 }}</div>
                <div class="role-name">治疗</div>
            </div>
            <div class="member-statistics-right-item">
                <div class="count DPS">{{ DPSCount?.length || 0 }}</div>
                <div class="role-name">DPS</div>
            </div>
            <div class="member-statistics-right-item">
                <div class="count">{{ otherCount || 0 }}</div>
                <div class="role-name">待定</div>
            </div>
            <div class="clear-button" @click="$emit('clear')">清空</div>
        </div>
    </div>
</template>

<script>
import typeMap from "@jx3box/jx3box-data/data/xf/mount_group.json";
export default {
    name: "ListStatistic",
    props: {
        name: {
            type: String,
            default: "",
        },
        list: {
            type: Array,
            default: () => [],
        },
        count: {
            type: Number,
            default: 0,
        },
    },
    computed: {
        DPSCount() {
            return this.list?.filter(
                (item) =>
                    item &&
                    (typeMap.mount_group["外攻"].includes(item.mount) ||
                        typeMap.mount_group["内攻"].includes(item.mount))
            );
        },
        HPSCount() {
            return this.list?.filter((item) => item && typeMap.mount_group["治疗"].includes(item.mount));
        },
        TCount() {
            return this.list?.filter((item) => item && typeMap.mount_group["坦克"].includes(item.mount));
        },
        otherCount() {
            return (
                this.list?.filter((item) => item)?.length -
                this.DPSCount?.length -
                this.HPSCount?.length -
                this.TCount?.length
            );
        },
    },
};
</script>

<style lang="less" scoped>
.member-statistics {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 24px;
    .member-statistics-left {
        height: 100%;
        font-size: 16px;
        font-weight: 700;
        line-height: 24px;
        color: rgba(255, 255, 255, 1);
    }
    .member-statistics-right {
        height: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        .clear-button {
            width: 40px;
            height: 22px;
            border-radius: 2px;
            border: 1px solid rgba(255, 255, 255, 0.5);
            font-size: 12px;
            line-height: 20px;
            color: rgba(255, 255, 255, 0.5);
            text-align: center;
            cursor: pointer;
            &:hover{
                color: rgba(255, 255, 255, 0.8);
                border-color: rgba(255, 255, 255, 0.8);
            }
        }
        .member-statistics-right-item {
            display: flex;
            gap: 4px;
            font-size: 12px;
            line-height: 16px;
            color: rgba(255, 255, 255, 1);
            .count {
                width: 16px;
                height: 16px;
                border-radius: 4px;
                background: linear-gradient(180deg, rgba(120, 120, 120, 1) 0%, rgba(0, 0, 0, 1) 100%);
                text-align: center;
                &.T {
                    background: linear-gradient(180deg, rgba(140, 91, 63, 1) 0%, rgba(0, 0, 0, 1) 100%);
                }
                &.HPS {
                    background: linear-gradient(180deg, rgba(68, 130, 93, 1) 0%, rgba(0, 0, 0, 1) 100%);
                }
                &.DPS {
                    background: linear-gradient(180deg, rgba(60, 98, 140, 1) 0%, rgba(0, 0, 0, 1) 100%);
                }
            }
            .role-name {
                height: 16px;
            }
        }
    }
}
</style>
