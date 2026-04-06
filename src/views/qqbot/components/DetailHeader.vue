<template>
    <div class="header">
        <div class="info">
            <div class="tittle">
                <div :class="['tag', raidDetail.status === 1 ? 'active' : '']">
                    {{ status[raidDetail.status] }}
                </div>
                <div class="activity-name">{{ raidDetail.game_activity_name }}</div>
            </div>
            <div class="detail">
                <div class="detail-item">
                    <div class="item-title">活动编号</div>
                    <div class="item-text">{{ raidDetail.game_activity_number }}</div>
                </div>
                <div class="detail-item">
                    <div class="item-title">发起时间</div>
                    <div class="item-text">{{ raidDetail.created_at }}</div>
                </div>
                <div class="detail-item">
                    <div class="item-title">发起人</div>
                    <div class="item-text">
                        <template v-if="raidDetail.user_id">
                            <a class="u-author" :href="`/author/${raidDetail.user_id}`" target="_blank">{{
                                raidDetail.create_user?.display_name
                            }}</a>
                        </template>
                        <template v-else> 未知 </template>
                    </div>
                </div>
            </div>
        </div>
        <div class="remark">
            <div class="remark-title">活动公告</div>
            <div class="remark-content">{{ raidDetail.remark }}</div>
        </div>
    </div>
</template>

<script>
export default {
    name: "DetailHeader",
    props: {
        raidDetail: {
            type: Object,
            default: () => {},
        },
    },
    data() {
        return {
            status: {
                0: "未开始",
                1: "招募中",
                "-1": "已结束",
            },
        };
    },
};
</script>

<style lang="less" scoped>
.header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .info {
        flex-grow: 1;
        height: 100%;
        border-radius: 12px;
        background: linear-gradient(90deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
        display: flex;
        flex-direction: column;
        gap: 4px;
        box-sizing: border-box;
        padding: 8px 12px 8px 12px;
        .tittle {
            height: 35px;
            display: flex;
            align-items: center;
            gap: 6px;
            .tag {
                width: 80px;
                height: 28px;
                border-radius: 4px;
                font-size: 16px;
                font-weight: 700;
                line-height: 26px;
                text-align: center;
                color: rgba(255, 255, 255, 1);
                border: 1px solid rgba(255, 255, 255, 0.75);
                box-sizing: border-box;
                &.active {
                    background: rgba(138, 214, 62, 1);
                    color: rgba(0, 0, 0, 1);
                    border: 1px solid transparent;
                }
            }
            .activity-name {
                flex: 1 0 0;
                height: 100%;
                font-size: 24px;
                font-weight: 700;
                line-height: 35px;
                color: rgba(255, 255, 255, 1);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
        .detail {
            padding: 2px;
            height: 36px;
            display: flex;
            align-items: center;
            gap: 24px;
            .detail-item {
                height: 100%;
                .item-title {
                    height: 18px;
                    font-size: 12px;
                    line-height: 18px;
                    color: rgba(255, 255, 255, 0.5);
                }
                .item-text {
                    height: 18px;
                    font-size: 12px;
                    line-height: 18px;
                    color: #ffffff;
                    padding: 0 1px;
                }
                .u-author {
                    color: #fff;
                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
        }
    }
    .remark {
        width: 280px;
        height: 100%;
        border-radius: 8px;
        background: linear-gradient(0deg, rgba(56, 56, 56, 1) 0%, rgba(0, 0, 0, 1) 100%);
        box-shadow: inset 0px 10px 5px rgba(0, 0, 0, 1);
        box-sizing: border-box;
        padding: 4px 12px 4px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        .remark-title {
            height: 21px;
            font-size: 14px;
            font-weight: 700;
            line-height: 21px;
            color: rgba(255, 195, 0, 1);
        }
        .remark-content {
            width: 256px;
            flex: 1 0 0;
            font-size: 12px;
            color: rgba(255, 255, 255, 1);
            word-wrap: break-word;
            overflow-y: auto;
            scrollbar-width: none;
        }
    }
}
</style>
