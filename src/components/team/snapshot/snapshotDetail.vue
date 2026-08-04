<template>
    <div class="m-snapshot-detail">
        <el-dialog v-model="visible" width="760px" class="m-snapshot-detail-dialog" destroy-on-close>
            <template #header>
                <div class="m-snapshot-detail__header">
                    <span class="u-header-icon"><Camera /></span>
                    <div>
                        <h2>{{ $t("team.snapshotEdit.related") }}</h2>
                        <p>{{ $t("team.snapshotEdit.relatedHint") }}</p>
                    </div>
                </div>
            </template>

            <div class="m-snapshot-detail__summary">
                <div class="u-role">
                    <span class="u-role-label">{{ $t("team.snapshotEdit.currentRole") }}</span>
                    <strong>{{ data.name || $t("team.snapshotEdit.unknownRole") }}</strong>
                </div>
                <span class="u-total">{{ $t("team.snapshotEdit.total", { count: snapshotList.length }) }}</span>
            </div>

            <div v-if="snapshotList.length" class="m-snapshot-detail__list">
                <article v-for="(item, index) in pagedSnapshotList" :key="item.ID || item.id || index" class="u-record">
                    <div class="u-record-index">{{ recordIndex(index) }}</div>
                    <div class="u-record-content">
                        <strong class="u-record-title">{{ autoname(item) }}</strong>
                        <div class="u-record-meta">
                            <span><Clock />{{ showTime(item.created_at) }}</span>
                            <span><User />{{ uploaderName(item) }}</span>
                            <span><UserFilled />{{ $t("team.snapshotEdit.people", { count: formatTeammate(item.teammate).filter((member) => member.name).length }) }}</span>
                        </div>
                    </div>
                    <el-button class="u-view-team" plain icon="Camera" @click="openRoster(item)">{{ $t("team.snapshotEdit.viewRoster") }}</el-button>
                </article>
            </div>
            <el-empty v-else :description="$t('team.snapshotEdit.empty')" :image-size="96" />

            <el-pagination
                v-if="snapshotList.length > pageSize"
                v-model:current-page="currentPage"
                class="m-snapshot-detail__pagination"
                background
                layout="prev, pager, next"
                :page-size="pageSize"
                :total="snapshotList.length"
            />
        </el-dialog>

        <el-dialog
            v-model="rosterVisible"
            width="880px"
            class="m-snapshot-roster-dialog"
            append-to-body
            destroy-on-close
        >
            <template #header>
                <div class="m-snapshot-detail__header">
                    <span class="u-header-icon"><UserFilled /></span>
                    <div>
                        <h2>{{ $t("team.snapshotEdit.teamRoster") }}</h2>
                        <p>{{ autoname(currentSnapshot) }}</p>
                    </div>
                </div>
            </template>

            <div class="m-snapshot-roster__meta">
                <span><Clock />{{ showTime(currentSnapshot.created_at) }}</span>
                <span><User />{{ uploaderName(currentSnapshot) }}</span>
                <strong>{{ $t("team.snapshotEdit.people", { count: currentRoster.length }) }}</strong>
            </div>
            <div class="m-snapshot-roster__body">
                <div class="m-snapshot-flags">
                    <i v-for="group of 5" :key="group">{{ $t("team.snapshotEdit.group", { group }) }}</i>
                </div>
                <snapshot-body :data="currentRoster" class="row-5" />
            </div>
            <p class="m-snapshot-roster__hint">{{ $t("team.snapshotEdit.copyHint") }}</p>

            <template #footer>
                <el-button class="u-roster-close" @click="rosterVisible = false">{{ $t("team.snapshotEdit.close") }}</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { showTime } from "@jx3box/jx3box-common/js/moment";

import snapshotBody from "./snapshotBody.vue";
export default {
    name: "snapshotDetail",
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    emits: ["update:modelValue"],
    components: {
        snapshotBody,
    },
    data() {
        return {
            currentPage: 1,
            pageSize: 5,
            rosterVisible: false,
            currentSnapshot: {},
        };
    },
    computed: {
        visible: {
            get() {
                return this.modelValue;
            },
            set(value) {
                if (!value) this.rosterVisible = false;
                this.$emit("update:modelValue", value);
            },
        },
        snapshotList() {
            return Array.isArray(this.data?.data) ? this.data.data : [];
        },
        pagedSnapshotList() {
            const start = (this.currentPage - 1) * this.pageSize;
            return this.snapshotList.slice(start, start + this.pageSize);
        },
        currentRoster() {
            return this.formatTeammate(this.currentSnapshot.teammate);
        },
    },
    watch: {
        modelValue(value) {
            if (value) this.currentPage = 1;
        },
        snapshotList() {
            this.currentPage = 1;
        },
    },
    methods: {
        showTime(val) {
            return showTime(val);
        },
        autoname(row) {
            return row.title || this.$t("team.snapshotEdit.gameUpload");
        },
        uploaderName(row) {
            return row.user_data?.display_name || this.$t("team.snapshotEdit.unknownUploader");
        },
        recordIndex(index) {
            return String((this.currentPage - 1) * this.pageSize + index + 1).padStart(2, "0");
        },
        openRoster(snapshot) {
            this.currentSnapshot = snapshot;
            this.rosterVisible = true;
        },
        formatTeammate(teammate) {
            if (!teammate) return [];
            return teammate.split(";").map((item) => {
                const [name, , , mount] = item.split(",");

                return {
                    name,
                    mount,
                };
            });
        },
    },
};
</script>

<style lang="less">
@import (reference) "@/assets/css/team/design-system/_tokens.less";

.m-snapshot-detail-dialog.el-dialog {
    max-width: calc(100vw - 32px);
    overflow: hidden;
    border-radius: @team-radius-control;
    box-shadow: 0 24px 64px rgba(15, 23, 42, 0.18);

    .el-dialog__header {
        margin-right: 0;
        padding: @team-space-4 @team-space-5;
        border-bottom: 1px solid @team-border-light;
    }

    .el-dialog__headerbtn {
        top: 22px;
        right: 22px;
        width: 36px;
        height: 36px;
        border-radius: 10px;

        &:hover {
            background: @team-surface-muted;
        }
    }

    .el-dialog__body {
        padding: @team-space-4 @team-space-5 @team-space-5;
        background: @team-surface-muted;
    }
}

.m-snapshot-detail__header {
    display: flex;
    align-items: center;
    gap: @team-space-2;

    .u-header-icon {
        display: inline-flex;
        width: 42px;
        height: 42px;
        align-items: center;
        justify-content: center;
        flex: none;
        border-radius: 12px;
        background: @team-primary-soft;
        color: @team-primary;

        svg {
            width: 21px;
        }
    }

    h2,
    p {
        margin: 0;
    }

    h2 {
        color: @team-text-primary;
        font-size: 18px;
        line-height: 26px;
    }

    p {
        margin-top: 2px;
        color: @team-text-muted;
        font-size: 12px;
    }
}

.m-snapshot-detail__summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: @team-space-3;
    padding: @team-space-2 @team-space-3;
    border: 1px solid fade(@team-primary, 14%);
    border-radius: 12px;
    background: linear-gradient(135deg, @team-surface 0%, @team-primary-soft 100%);

    .u-role {
        display: flex;
        align-items: center;
        gap: 10px;

        strong {
            color: @team-text-primary;
            font-size: 14px;
        }
    }

    .u-role-label,
    .u-total {
        color: @team-text-secondary;
        font-size: 12px;
    }

    .u-role-label {
        padding: 4px 8px;
        border-radius: 6px;
        background: @team-surface;
    }

    .u-total {
        font-weight: 600;
    }
}

.m-snapshot-detail__list {
    display: grid;
    max-height: min(520px, 60vh);
    overflow-y: auto;
    gap: @team-space-2;
}

.m-snapshot-detail__list .u-record {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) auto;
    min-height: 76px;
    align-items: center;
    padding: @team-space-2 @team-space-3;
    border: 1px solid @team-border;
    border-radius: 12px;
    background: @team-surface;
    box-shadow: @team-shadow-xs;
    gap: @team-space-2;
    transition: border-color @team-duration-fast @team-ease-standard,
        box-shadow @team-duration-fast @team-ease-standard;

    &:hover {
        border-color: @team-border-focus;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    }

    .u-record-index {
        display: inline-flex;
        width: 36px;
        height: 36px;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: @team-primary-soft;
        color: @team-primary;
        font-size: 12px;
        font-weight: 700;
    }

    .u-record-content {
        min-width: 0;
    }

    .u-record-title {
        display: block;
        overflow: hidden;
        color: @team-text-primary;
        font-size: 14px;
        line-height: 22px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .u-record-meta {
        display: flex;
        flex-wrap: wrap;
        margin-top: 6px;
        color: @team-text-muted;
        font-size: 12px;
        gap: 6px @team-space-3;

        span {
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        svg {
            width: 13px;
        }
    }

    .u-view-team {
        min-height: 34px;
        border-color: fade(@team-primary, 24%);
        border-radius: 9px;
        color: @team-primary;
        font-weight: 600;

        &:hover,
        &:focus {
            border-color: @team-primary;
            background: @team-primary-soft;
            color: @team-primary-hover;
        }
    }
}

.m-snapshot-detail__pagination {
    justify-content: center;
    margin-top: @team-space-4;
    --el-pagination-button-bg-color: @team-surface;
    --el-pagination-hover-color: @team-primary;

    &.is-background .el-pager li.is-active {
        background: @team-primary;
    }
}

.m-snapshot-roster-dialog.el-dialog {
    max-width: calc(100vw - 32px);
    overflow: hidden;
    border-radius: @team-radius-control;
    box-shadow: 0 28px 72px rgba(15, 23, 42, 0.24);

    .el-dialog__header {
        margin-right: 0;
        padding: @team-space-4 @team-space-5;
        border-bottom: 1px solid @team-border-light;
    }

    .el-dialog__headerbtn {
        top: 22px;
        right: 22px;
        width: 36px;
        height: 36px;
        border-radius: 10px;

        &:hover {
            background: @team-surface-muted;
        }
    }

    .el-dialog__body {
        padding: @team-space-4 @team-space-5;
        background: @team-surface-muted;
    }

    .el-dialog__footer {
        padding: @team-space-3 @team-space-5;
        border-top: 1px solid @team-border-light;
    }
}

.m-snapshot-roster__meta {
    display: flex;
    align-items: center;
    margin-bottom: @team-space-3;
    color: @team-text-secondary;
    font-size: 12px;
    gap: @team-space-3;

    span {
        display: inline-flex;
        align-items: center;
        gap: 5px;
    }

    svg {
        width: 14px;
    }

    strong {
        margin-left: auto;
        padding: 5px 10px;
        border-radius: 999px;
        background: @team-primary-soft;
        color: @team-primary;
    }
}

.m-snapshot-roster__body {
    overflow-x: auto;
    padding: @team-space-4;
    border: 1px solid @team-border-light;
    border-radius: @team-radius-control;
    background: @team-surface-muted;

    .m-snapshot-body {
        min-width: 720px;
    }

    .m-snapshot-flags {
        min-width: 720px;
    }
}

.m-snapshot-roster__body .m-snapshot-flags {
    display: grid;
    width: 100%;
    overflow: hidden;
    border: 1px solid fade(@team-primary, 18%);
    border-bottom: 0;
    border-radius: 12px 12px 0 0;
    background: @team-primary-soft;
    grid-template-columns: repeat(5, minmax(0, 1fr));

    i {
        height: 36px;
        border-right: 1px solid fade(@team-primary, 18%);
        background: linear-gradient(180deg, #f5f3ff 0%, @team-primary-soft 100%);
        color: @team-primary;
        font-size: 12px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 1px;
        line-height: 36px;
        text-align: center;

        &:last-child {
            border-right: 0;
        }
    }
}

.m-snapshot-roster__hint {
    margin: @team-space-2 0 0;
    color: @team-text-muted;
    font-size: 12px;
    text-align: right;
}

.u-roster-close {
    min-width: 88px;
    border-radius: 9px;
}

@media screen and (max-width: 640px) {
    .m-snapshot-detail-dialog.el-dialog {
        .el-dialog__header,
        .el-dialog__body {
            padding-right: @team-space-3;
            padding-left: @team-space-3;
        }
    }

    .m-snapshot-detail__summary {
        align-items: flex-start;
        flex-direction: column;
        gap: @team-space-1;
    }

    .m-snapshot-detail__list .u-record {
        grid-template-columns: 36px minmax(0, 1fr);

        .u-view-team {
            grid-column: 1 / -1;
            width: 100%;
        }
    }

    .m-snapshot-roster-dialog.el-dialog {
        .el-dialog__header,
        .el-dialog__body,
        .el-dialog__footer {
            padding-right: @team-space-3;
            padding-left: @team-space-3;
        }
    }

    .m-snapshot-roster__meta {
        align-items: flex-start;
        flex-direction: column;
        gap: 6px;

        strong {
            margin-left: 0;
        }
    }

    .m-snapshot-roster__body {
        padding: @team-space-2;

        .m-snapshot-flags {
            display: none;
        }
    }
}
</style>
