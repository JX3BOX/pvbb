<template>
    <div class="m-qqbot-raid-list">
        <div class="raid-list-toolbar">
            <div class="raid-list-heading">
                <div class="raid-list-title">活动列表</div>
                <div class="raid-list-subtitle">管理我创建或加入的团队活动</div>
            </div>
            <div class="raid-list-actions">
                <el-select
                    v-model="search.status"
                    popper-class="search-select-popper"
                    :popper-append-to-body="false"
                    @change="handleStatusChange"
                    class="search-select"
                >
                    <template #prefix>
                        <img src="@/assets/img/qqbot/filter.svg" alt="" svg-inline />
                    </template>
                    <el-option label="我创建的活动" :value="1" />
                    <el-option label="我加入的活动" :value="0" />
                </el-select>
                <div class="search-input">
                    <el-input placeholder="搜索活动名称" v-model.trim="search.keyword" @keyup.enter="getList(1)">
                        <template #append>
                            <button type="button" @click="getList(1)" aria-label="搜索活动">
                                <i class="el-icon-search"></i>
                                <span>搜索</span>
                            </button>
                        </template>
                    </el-input>
                </div>
            </div>
        </div>
        <div class="raid-list-content" v-loading="loading">
            <div class="raid-list-header">
                <div class="raid-list-header-item time">活动日期</div>
                <div class="raid-list-header-item id">编号</div>
                <div class="raid-list-header-item name">名称</div>
                <div class="raid-list-header-item remark">说明</div>
                <div class="raid-list-header-item status">活动状态</div>
                <div class="raid-list-header-item action">操作</div>
            </div>
            <div class="raid-list-body" v-if="list.length">
                <div
                    class="raid-list-body-item"
                    v-for="item in list"
                    :key="item.id"
                    @click="$router.push({ name: 'raid-detail', query: { id: item.id } })"
                >
                    <div class="raid-list-body-item-item time">{{ formatTime(item.created_at) }}</div>
                    <div class="raid-list-body-item-item id" :title="item.game_activity_number">
                        {{ item.game_activity_number || "--" }}
                    </div>
                    <div class="raid-list-body-item-item name" :title="item.game_activity_name">
                        {{ item.game_activity_name || "未命名活动" }}
                    </div>
                    <div class="raid-list-body-item-item remark" :title="item.remark">{{ item.remark || "暂无说明" }}</div>
                    <div class="raid-list-body-item-item status">
                        <StatusSwitch
                            :status="item.status"
                            :disabled="!!statusUpdating[item.id]"
                            @handleStatus="handleStatus(item.id, item.status)"
                        />
                    </div>
                    <div class="raid-list-body-item-item action">
                        <div class="preview-button">查看</div>
                    </div>
                </div>
            </div>
            <el-empty v-else-if="!loading" description="暂无符合条件的活动" :image-size="96" />
        </div>
        <div class="raid-list-footer" v-if="total">
            <span class="raid-list-total">共 {{ total }} 条</span>
            <el-pagination
                layout="prev, pager, next"
                :total="total"
                :page-size="10"
                :current-page="page"
                @current-change="handleCurrentChange"
            />
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
            loading: false,
            statusUpdating: {},
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
            const request = this.search.status === 1 ? getRaidList : getMyAddRaidList;
            this.loading = true;
            request({
                index,
                pageSize: 10,
                name: this.search.keyword,
            })
                .then((res) => {
                    this.list = res.data.data.list;
                    this.total = res.data.data.page.total;
                    this.page = res.data.data.page.index;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        formatTime(time) {
            return moment(time).format("YYYY.MM.DD");
        },
        async handleStatus(id, status) {
            if (this.statusUpdating[id]) return;
            const nextStatus = Number(status) === -1 ? 1 : -1;
            this.statusUpdating[id] = true;
            try {
                await updateRaidStatus(id, { status: nextStatus });
                const item = this.list.find((item) => item.id === id);
                if (item) item.status = nextStatus;
                this.$message.success("修改成功");
            } catch (error) {
                this.$message.error("修改失败，请稍后再试");
            } finally {
                delete this.statusUpdating[id];
            }
        },
    },
};
</script>

<style lang="less">
.m-qqbot-raid-list {
    width: 100%;
    min-height: 733px;
    height: calc(100% - 64px);
    padding: 20px;
    margin: 24px 0 40px;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background:
        radial-gradient(circle at 90% 0, rgba(64, 128, 255, 0.12), transparent 30%),
        linear-gradient(145deg, rgba(43, 45, 52, 0.98), rgba(26, 28, 33, 0.98));
    display: flex;
    flex-direction: column;
    position: relative;
    gap: 18px;
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
    &::after {
        display: none;
    }
    .raid-list-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
    }
    .raid-list-heading {
        flex: 0 0 auto;
        margin-right: 8px;
    }
    .raid-list-subtitle {
        margin-top: 3px;
        color: rgba(255, 255, 255, 0.38);
        font-size: 12px;
        line-height: 18px;
    }
    .raid-list-actions {
        .flex;
        align-items: center;
        gap: 12px;
        margin-left: auto;
    }
    .raid-list-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.14);
        overflow: hidden;
        .raid-list-header {
            display: grid;
            grid-template-columns: 96px 84px minmax(160px, 1.3fr) minmax(180px, 1fr) 84px 84px;
            gap: 20px;
            padding: 13px 24px;
            background: rgba(0, 0, 0, 0.18);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            .raid-list-header-item {
                font-size: 13px;
                font-weight: 500;
                line-height: 20px;
                color: rgba(255, 255, 255, 0.38);
                text-align: left;
            }
        }
        .raid-list-body {
            flex: 1 0 0;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 8px;
            overflow-y: auto;
            scrollbar-width: none;
            .raid-list-body-item {
                cursor: pointer;
                min-height: 58px;
                border: 1px solid rgba(255, 255, 255, 0.07);
                border-radius: 10px;
                background: rgba(0, 0, 0, 0.2);
                display: grid;
                grid-template-columns: 96px 84px minmax(160px, 1.3fr) minmax(180px, 1fr) 84px 84px;
                align-items: center;
                gap: 20px;
                padding: 0 16px;
                transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
                .raid-list-body-item-item {
                    font-size: 14px;
                    font-weight: 400;
                    line-height: 20px;
                    color: rgba(255, 255, 255, 0.62);
                    text-align: left;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    .preview-button {
                        box-sizing: border-box;
                        width: 64px;
                        height: 28px;
                        border-radius: 7px;
                        border: 1px solid rgba(96, 151, 255, 0.26);
                        background: rgba(64, 128, 255, 0.07);
                        color: #83aaff;
                        text-align: center;
                        line-height: 26px;
                        cursor: pointer;
                        &:hover {
                            border-color: rgba(96, 151, 255, 0.5);
                            background: rgba(64, 128, 255, 0.16);
                            color: #afc8ff;
                        }
                    }
                }
                &.active,
                &:hover {
                    box-sizing: border-box;
                    border-color: rgba(69, 131, 255, 0.46);
                    background: rgba(69, 131, 255, 0.08);
                    transform: translateY(-1px);
                    .raid-list-body-item-item {
                        color: rgba(255, 255, 255, 1);
                    }
                }
            }
        }
    }
    .raid-list-title {
        font-size: 20px;
        font-weight: 700;
        line-height: 35px;
        color: rgba(255, 255, 255, 1);
    }
    .search-select {
        width: 168px;
        height: 40px;
        box-sizing: border-box;
        .el-select__wrapper {
            min-height: 40px;
            padding: 0 14px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.2);
            color: #fff;
            box-shadow: none;
            transition: border-color 0.2s ease, background-color 0.2s ease;
            &:hover {
                border-color: rgba(255, 255, 255, 0.22);
                background: rgba(255, 255, 255, 0.06);
            }
            &.is-focused {
                border-color: rgba(69, 131, 255, 0.75);
                box-shadow: 0 0 0 3px rgba(69, 131, 255, 0.1);
            }
        }
        .el-select__prefix svg {
            width: 16px;
            height: 16px;
            margin-right: 7px;
            opacity: 0.62;
        }
        .el-select__placeholder {
            color: rgba(255, 255, 255, 0.78);
            font-size: 14px;
        }
        .el-select__caret {
            color: rgba(255, 255, 255, 0.42);
        }
        .search-select-popper {
            left: -33px !important;
            .popper__arrow {
                left: 55px !important;
            }
        }
    }
    .search-input {
        width: 300px;
        .el-input {
            box-sizing: border-box;
            height: 40px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.2);
            align-items: center;
            overflow: hidden;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            &:focus-within {
                border-color: rgba(69, 131, 255, 0.75);
                box-shadow: 0 0 0 3px rgba(69, 131, 255, 0.1);
            }
            .el-input__wrapper {
                background-color: transparent;
                border: none;
                box-shadow: none;
                padding: 0 14px;
                box-sizing: border-box;
            }
            input {
                background: transparent;
                height: 38px;
                width: 100%;
                border: none;
                color: rgba(255, 255, 255, 1);
                font-size: 14px;
                &::placeholder {
                    color: rgba(255, 255, 255, 0.36);
                }
            }
            .el-input-group__append {
                padding: 0;
                width: auto;
                height: 38px;
                border-radius: 0;
                background: transparent;
                border: none;
                box-shadow: none;
                button {
                    height: 32px;
                    margin-right: 3px;
                    padding: 0 14px;
                    border: 1px solid rgba(96, 151, 255, 0.28);
                    border-radius: 6px;
                    background: rgba(64, 128, 255, 0.1);
                    color: #8bb2ff;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    i {
                        margin-right: 5px;
                    }
                    &:hover {
                        border-color: rgba(96, 151, 255, 0.52);
                        background: rgba(64, 128, 255, 0.18);
                        color: #b1caff;
                    }
                }
            }
        }
    }
    .raid-list-footer {
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
        color: rgba(255, 255, 255, 0.38);
        font-size: 13px;
        .raid-list-total {
            padding-right: 14px;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            white-space: nowrap;
        }
        .el-pagination {
            background-color: transparent;
            padding: 0;
            gap: 6px;
            button,
            .el-pager li {
                width: 30px;
                min-width: 30px;
                height: 30px;
                padding: 0;
                margin: 0 3px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                background-color: transparent;
                color: rgba(255, 255, 255, 0.58);
                line-height: 28px;
                transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
            }
            button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                line-height: 1;

                .el-icon,
                svg {
                    display: block;
                    width: 14px;
                    height: 14px;
                    margin: 0;
                    position: static;
                    transform: none;
                }
            }
            button,
            .el-pager li {
                &:not(:disabled):hover {
                    border-color: rgba(69, 131, 255, 0.6);
                    background: rgba(69, 131, 255, 0.12);
                    color: #79a8ff;
                }
            }
            button:disabled {
                border-color: rgba(255, 255, 255, 0.05);
                color: rgba(255, 255, 255, 0.18);
                cursor: not-allowed;
            }
            .el-pager li {
                &.active {
                    border-color: rgba(69, 131, 255, 0.72);
                    background: rgba(69, 131, 255, 0.16);
                    color: #8bb2ff;
                    font-weight: 700;
                }
            }
        }
    }
    .name {
        color: #fff !important;
        font-weight: 600 !important;
    }
    .remark {
        color: rgba(255, 255, 255, 0.38) !important;
    }
    .el-empty {
        flex: 1;
        justify-content: center;
        --el-empty-fill-color-0: rgba(255, 255, 255, 0.08);
        --el-empty-fill-color-1: rgba(255, 255, 255, 0.1);
        --el-empty-fill-color-2: rgba(255, 255, 255, 0.12);
        --el-empty-fill-color-3: rgba(255, 255, 255, 0.14);
        --el-empty-fill-color-4: rgba(255, 255, 255, 0.16);
        --el-empty-fill-color-5: rgba(255, 255, 255, 0.18);
        --el-empty-fill-color-6: rgba(255, 255, 255, 0.2);
        --el-empty-fill-color-7: rgba(255, 255, 255, 0.22);
        --el-empty-fill-color-8: rgba(255, 255, 255, 0.24);
        --el-empty-fill-color-9: rgba(255, 255, 255, 0.26);
        .el-empty__description p {
            color: rgba(255, 255, 255, 0.48);
        }
    }
}
</style>
