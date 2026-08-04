<template>
    <div class="m-raid-detail">
        <div class="m-raid-detail__toolbar">
            <div class="back-button" @click="$router.push({ name: 'raid-list' })">
                <div class="back-button-icon">
                    <i class="el-icon-arrow-left"></i>
                </div>
                <div class="back-button-text">活动列表</div>
            </div>
        </div>
        <div class="raid-detail-content">
            <div class="left">
                <DetailHeader :raidDetail="raidDetail" />
                <div class="member-list">
                    <ListStatistic
                        :name="'正式编队'"
                        :list="memberList"
                        :clearable="false"
                        :count="raidDetail.members?.filter((item) => item.identity_status === 1)?.length || 0"
                    />
                    <div class="list-header">
                        <div class="list-header-item">1</div>
                        <div class="list-header-item">2</div>
                        <div class="list-header-item">3</div>
                        <div class="list-header-item">4</div>
                        <div class="list-header-item">5</div>
                    </div>
                    <div class="member-list-content">
                        <div
                            v-for="(item, index) in memberList"
                            :key="index"
                        >
                            <Card :item="item" :role="getRole(item?.mount)" readonly></Card>
                        </div>
                    </div>
                </div>
                <div class="altetnate-list">
                    <ListStatistic
                        :name="'替补编队'"
                        :list="altetnateList"
                        :clearable="false"
                        :count="altetnateList?.length || 0"
                    />
                    <div class="altetnate-list-content">
                        <div
                            v-for="item in altetnateList"
                            :key="item?.id"
                            style="height: 66px"
                        >
                            <Card :item="item" :role="getRole(item?.mount)" readonly></Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getRaidDetail } from "@/service/qqbot";
import typeMap from "@jx3box/jx3box-data/data/xf/mount_group.json";
import { markQQBotReady, resetQQBotReady, setQQBotDataReady } from "@/utils/qqbot-ready";
import Card from "./Card.vue";
import ListStatistic from "./ListStatistic.vue";
import DetailHeader from "./DetailHeader.vue";
export default {
    name: "RaidDetailNoAuth",
    components: {
        Card,
        ListStatistic,
        DetailHeader,
    },
    data() {
        return {
            raidDetail: {},
            loadRequestId: 0,
        };
    },
    computed: {
        altetnateList() {
            return this.raidDetail.members?.filter((item) => item.identity_status === 2);
        },
        memberList() {
            const list = Array(25).fill(null);
            this.raidDetail.members
                ?.filter((item) => item.identity_status === 1)
                ?.forEach((element) => {
                    const index = element.group_x * 5 + element.group_y;
                    list[index] = element;
                });
            return list;
        },
    },
    watch: {
        "$route.query.id": {
            immediate: true,
            handler(id) {
                this.getRaidDetail(id);
            },
        },
    },
    beforeUnmount() {
        this.loadRequestId += 1;
    },
    methods: {
        async getRaidDetail(id = this.$route.query.id) {
            const requestId = ++this.loadRequestId;
            resetQQBotReady();
            this.raidDetail = {};
            try {
                if (!id) return;
                const res = await getRaidDetail(id);
                if (requestId === this.loadRequestId) this.raidDetail = res.data?.data || {};
            } catch (error) {
                if (requestId === this.loadRequestId) this.raidDetail = {};
            } finally {
                if (requestId === this.loadRequestId) {
                    setQQBotDataReady(true);
                    this.$nextTick(() => {
                        if (requestId !== this.loadRequestId) return;
                        markQQBotReady({ root: this.$el || "#app" });
                    });
                }
            }
        },
        getRole(role) {
            if (typeMap.mount_group["治疗"].includes(role)) {
                return "HPS";
            } else if (typeMap.mount_group["坦克"].includes(role)) {
                return "T";
            } else if (typeMap.mount_group["外攻"].includes(role) || typeMap.mount_group["内攻"].includes(role)) {
                return "DPS";
            }
            return "other";
        },
    },
};
</script>

<style lang="less" scoped>
.m-raid-detail {
    width: 100%;
    min-width: 1254px;
    .m-raid-detail__toolbar {
        display: flex;
        margin: 12px 0;
        .back-button {
            width: 106px;
            height: 40px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 1);
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            &:hover {
                background-color: rgba(255, 255, 255, 0.8);
            }
            margin-right: auto;
        }
        .edit-button-group {
            display: flex;
            width: 230px;
            justify-content: space-between;
            .handle-button {
                height: 40px;
                width: 110px;
                border-radius: 12px;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 4px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 700;
                color: rgba(255, 255, 255, 1);
            }
            .edit-button {
                background: rgba(64, 128, 255, 1);
            }
            .delete-button {
                background: rgba(227, 60, 100, 1);
            }
        }
    }

    .raid-detail-content {
        height: calc(100% - 56px);
        display: flex;
        gap: 12px;
        .left {
            width: 1012px;
            height: 733px;
            border-radius: 12px;
            background: linear-gradient(180deg, rgba(64, 64, 64, 1) 0%, rgba(87, 87, 87, 1) 100%);
            box-sizing: border-box;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            position: relative;
            .member-list {
                display: flex;
                flex-direction: column;
                gap: 4px;
                .list-header {
                    display: flex;
                    align-items: center;
                    height: 12px;
                    gap: 18px;
                    .list-header-item {
                        flex: 0 0 180px;
                        height: 12px;
                        font-size: 12px;
                        line-height: 12px;
                        color: rgba(255, 255, 255, 0.75);
                        text-align: center;
                        border-radius: 8px;
                        background: rgba(0, 0, 0, 1);
                    }
                }
                .member-list-content {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px 18px;
                    .active {
                        transform: scale(1.5);
                    }
                }
            }
            .altetnate-list {
                display: flex;
                flex-direction: column;
                gap: 4px;
                .altetnate-list-content {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px 12px;
                    border-radius: 8px;
                    background: linear-gradient(0deg, rgba(56, 56, 56, 1) 0%, rgba(0, 0, 0, 1) 100%);
                    border: 1px solid rgba(110, 110, 110, 1);
                    box-shadow: inset 0px 10px 5px rgba(0, 0, 0, 1);
                    padding: 10px;
                    height: 160px;
                    overflow: scroll;
                    scrollbar-width: none;
                    box-sizing: border-box;
                }
            }
            &::after {
                content: "";
                display: block;
                position: absolute;
                left: 0;
                top: 0;
                box-sizing: border-box;
                width: 200%;
                height: 200%;
                border: 1px solid rgba(255, 255, 255, 1);
                border-radius: 24px;
                -webkit-transform: scale(0.5);
                transform: scale(0.5);
                transform-origin: 0 0;
                pointer-events: none;
            }
        }
        .right {
            flex-shrink: 0;
            width: 230px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            .queue-list {
                width: 100%;
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 12px;
                background: rgba(112, 88, 46, 0.2);
                padding: 20px 10px 0 20px;
                box-sizing: border-box;
                position: relative;
                border-radius: 12px;
                .queue-list-header {
                    width: 100%;
                    height: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    .queue-list-title {
                        font-size: 16px;
                        font-weight: 700;
                        line-height: 24px;
                        color: rgba(255, 195, 0, 1);
                    }
                    .clear-button-queue {
                        width: 40px;
                        height: 22px;
                        border-radius: 2px;
                        border: 1px solid rgba(255, 255, 255, 0.5);
                        font-size: 12px;
                        line-height: 20px;
                        color: rgba(255, 255, 255, 0.5);
                        text-align: center;
                        cursor: pointer;
                        &:hover {
                            color: rgba(255, 255, 255, 0.8);
                            border-color: rgba(255, 255, 255, 0.8);
                        }
                    }
                }
                .queue-list-content {
                    width: 100%;
                    flex: 1 0 0;
                    display: flex;
                    flex-wrap: wrap;
                    align-content: flex-start;
                    gap: 4px;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255, 195, 0, 0.75) transparent;
                }
                &::after {
                    content: "";
                    display: block;
                    position: absolute;
                    left: 0;
                    top: 0;
                    box-sizing: border-box;
                    width: 200%;
                    height: 200%;
                    border: 1px solid rgba(255, 195, 0, 1);
                    border-radius: 24px;
                    -webkit-transform: scale(0.5);
                    transform: scale(0.5);
                    transform-origin: 0 0;
                    pointer-events: none;
                }
            }
        }
    }
}
</style>
