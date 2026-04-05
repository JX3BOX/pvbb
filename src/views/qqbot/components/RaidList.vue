<template>
    <div class="m-raid-list">
        <div style="display: flex">
            <div class="raid-list-title">活动列表</div>
            <el-select
                v-model="search.status"
                popper-class="search-select-popper"
                :popper-append-to-body="false"
                @change="handleStatusChange"
                class="search-select"
                style="width: 190px;"
            >
                <template #prefix>
                    <img
                        src="@/assets/img/qqbot/filter.svg"
                        alt=""
                        svg-inline
                    />
                </template>
                <el-option label="仅看我创建的" :value="1">
                    <span>仅看我创建的</span>
                </el-option>
                <el-option label="仅看我加入的" :value="0">
                    <span>仅看我加入的</span>
                </el-option>
            </el-select>
            <div class="search-input">
                <el-input placeholder="请输入活动名称关键词" v-model="search.keyword">
                    <template #append>
                        <div @click="getList(1)">
                            <i class="el-icon-search" style="margin-right: 4px"></i>
                            搜索活动
                        </div>
                    </template>
                </el-input>
            </div>
        </div>
        <div class="raid-list-content">
            <div class="raid-list-header">
                <div class="raid-list-header-item time">活动日期</div>
                <div class="raid-list-header-item id">编号</div>
                <div class="raid-list-header-item name">名称</div>
                <div class="raid-list-header-item remark">说明</div>
                <div class="raid-list-header-item status">活动状态</div>
                <div class="raid-list-header-item action">操作</div>
            </div>
            <div class="raid-list-body">
                <div
                    class="raid-list-body-item"
                    v-for="item in list"
                    :key="item.id"
                    @click="$router.push({ name: 'raid-detail', query: { id: item.id } })"
                >
                    <div class="raid-list-body-item-item time">{{ formatTime(item.created_at) }}</div>
                    <div class="raid-list-body-item-item id">{{ item.game_activity_number }}</div>
                    <div class="raid-list-body-item-item name">{{ item.game_activity_name }}</div>
                    <div class="raid-list-body-item-item remark">{{ item.remark }}</div>
                    <div class="raid-list-body-item-item status">
                        <StatusSwitch :status="item.status" @handleStatus="handleStatus(item.id, item.status)" />
                    </div>
                    <div class="raid-list-body-item-item action">
                        <div class="preview-button">查看</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="raid-list-footer">
            <el-pagination
                layout="total,slot,pager"
                :total="total"
                :page-size="10"
                :current-page="page"
                ref="pagination"
                @current-change="handleCurrentChange"
            >
                <template>
                    <el-button @click="$refs.pagination.prev()">
                        <i class="el-icon-caret-left" style="font-size: 16px; line-height: 28px"
                    /></el-button>
                </template>
            </el-pagination>
            <el-link :underline="false" @click="$refs.pagination.next()">
                <i class="el-icon-caret-right" style="font-size: 16px"
            /></el-link>
        </div>
    </div>
</template>

<script>
import { getRaidList, updateRaidStatus, getMyAddRaidList } from "@/service/qqbot";
import moment from "moment";
import StatusSwitch from "./StatusSwitch.vue";
export default {
    name: "RaidList",
    components: {
        StatusSwitch,
    },
    data() {
        return {
            list: [],
            status: {
                0: "未开始",
                1: "招募中",
                "-1": "已结束",
            },
            page: 1,
            total: 0,
            search: {
                status: 1,
                keyword: "",
            },
        };
    },
    created() {
        this.getList(1);
    },
    methods: {
        handleStatusChange() {
            this.page = 1;
            this.getList(1);
        },
        handleCurrentChange(page) {
            this.getList(page);
        },
        getList(index = 1) {
            if (this.search.status === 1) {
                getRaidList({
                    index: index,
                    pageSize: 10,
                    name: this.search.keyword,
                }).then((res) => {
                    this.list = res.data.data.list;
                    this.total = res.data.data.page.total;
                    this.page = res.data.data.page.index;
                });
            } else {
                getMyAddRaidList({
                    index: index,
                    pageSize: 10,
                    name: this.search.keyword,
                }).then((res) => {
                    this.list = res.data.data.list;
                    this.total = res.data.data.page.total;
                    this.page = res.data.data.page.index;
                });
            }
        },
        formatTime(time) {
            return moment(time).format("YYYY.MM.DD");
        },
        handleStatus(id, status) {
            updateRaidStatus(id, {
                status: status === -1 ? 1 : -1,
            }).then((res) => {
                this.$message.success("修改成功");
                this.getList(this.page);
            });
        },
    },
};
</script>

<style lang="less">
.m-raid-list {
    width: 100%;
    height: calc(100% - 64px);
    padding: 24px;
    margin: 32px 0;
    box-sizing: border-box;
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(64, 64, 64, 1) 0%, rgba(87, 87, 87, 1) 100%);
    display: flex;
    flex-direction: column;
    position: relative;
    gap: 24px;
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
    .raid-list-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        .raid-list-header {
            display: flex;
            gap: 70px;
            padding: 0 24px;
            margin-bottom: 12px;
            .raid-list-header-item {
                height: 24px;
                font-size: 16px;
                font-weight: 700;
                line-height: 24px;
                color: rgba(255, 255, 255, 1);
                text-align: center;
            }
        }
        .raid-list-body {
            flex: 1 0 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
            overflow: scroll;
            scrollbar-width: none;
            .raid-list-body-item {
                cursor: pointer;
                height: 50px;
                border-radius: 25px;
                background: rgba(0, 0, 0, 1);
                display: flex;
                align-items: center;
                gap: 70px;
                padding: 0 24px;
                .raid-list-body-item-item {
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 50px;
                    color: rgba(255, 255, 255, 0.75);
                    text-align: center;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    .preview-button {
                        box-sizing: border-box;
                        margin: 0 auto;
                        width: 80px;
                        height: 24px;
                        border-radius: 4px;
                        border: 1px solid rgba(255, 255, 255, 0.75);
                        text-align: center;
                        line-height: 24px;
                        cursor: pointer;
                        &:hover {
                            background: rgba(64, 128, 255, 1);
                            border: 1px solid rgba(64, 128, 255, 1);
                            color: #fff;
                        }
                    }
                }
                &.active,
                &:hover {
                    box-sizing: border-box;
                    border: 1px solid rgba(69, 131, 255, 1);
                    box-shadow: inset 0px 0px 15px rgba(69, 131, 255, 1);
                    .raid-list-body-item-item {
                        color: rgba(255, 255, 255, 1);
                    }
                }
            }
        }
    }
    .raid-list-title {
        height: 35px;
        font-size: 24px;
        font-weight: 700;
        line-height: 35px;
        color: rgba(255, 255, 255, 1);
    }
    .search-select {
        margin-left: 24px;
        height: 35px;
        padding: 0 24px;
        box-sizing: border-box;
        .el-select__wrapper {
            background: transparent;
            color: #fff;
            box-shadow: none;
        }
        .el-select__prefix svg {
            color: #fff;
        }
        .el-select__placeholder {
            color: #fff;
        }
        .el-select__suffix {
            display: none;
        }
        .search-select-popper {
            left: -33px !important;
            .popper__arrow {
                left: 55px !important;
            }
        }
        &:hover {
            border-radius: 99px;
            background: rgba(36, 36, 36, 1);
        }
    }
    .search-input {
        margin-left: auto;
        .el-input {
            box-sizing: border-box;
            height: 36px;
            border: 1px solid transparent;
            align-items: center;
            &:focus-within {
                border-radius: 18px;
                border: 1px solid rgba(69, 131, 255, 1);
                box-shadow: inset 0px 0px 15px rgba(69, 131, 255, 1);
            }
            .el-input__wrapper {
                background-color: transparent;
                border: none;
                box-shadow: none;
                padding: 0;
                box-sizing: border-box;
            }
            input {
                background-color: rgba(36, 36, 36, 1);
                height: 36px;
                width: 380px;
                border: none;
                padding-left: 18px;
                border-radius: 18px 0 0 18px;
                color: rgba(255, 255, 255, 1);
                &::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }
            }
            .el-input-group__append {
                padding: 0;
                width: 100px;
                height: 36px;
                border-radius: 0 18px 18px 0;
                background: rgba(194, 194, 194, 1);
                font-size: 14px;
                line-height: 36px;
                color: rgba(0, 0, 0, 1);
                text-align: center;
                cursor: pointer;
                border: none;
                box-shadow: none;
                &:hover {
                    background: rgba(64, 128, 255, 1);
                    color: #fff;
                    font-weight: 700;
                }
                &:active {
                    background: rgba(255, 255, 255, 1);
                    font-weight: 700;
                    color: rgba(0, 0, 0, 1);
                }
            }
        }
    }
    .raid-list-footer {
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        .el-pagination {
            background-color: transparent;
            button,
            .el-pagination__total,
            .el-pager li {
                background-color: transparent;
                color: white;
            }
            button,
            .el-pager li {
                color: white;
                &:hover {
                    color: #5cb6ff;
                }
            }
            .el-pager li {
                &.active {
                    width: 24px;
                    height: 24px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.75);
                    color: #000;
                    padding: 0;
                    margin: 2px 4px;
                    min-width: 24px;
                    line-height: 24px;
                }
            }
        }
        .el-link {
            margin-left: 15px;
            color: white;
            &:hover {
                color: #5cb6ff;
            }
        }
    }
    .time {
        width: 80px;
    }
    .id {
        width: 70px;
    }
    .name {
        width: 240px;
    }
    .remark {
        width: 200px;
    }
    .status {
        width: 70px;
    }
    .action {
        width: 200px;
    }
}
</style>
