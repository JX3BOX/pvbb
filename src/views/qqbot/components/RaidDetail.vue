<template>
    <div class="m-raid-detail">
        <div class="m-raid-detail__toolbar">
            <div class="back-button" @click="$router.push({ name: 'raid-list' })">
                <div class="back-button-icon">
                    <i class="el-icon-arrow-left"></i>
                </div>
                <div class="back-button-text">活动列表</div>
            </div>
            <div class="edit-button-group">
                <div class="edit-button handle-button" @click="editDialogVisible = true">
                    <i class="el-icon-edit-outline"></i>
                    编辑活动
                </div>
                <div class="delete-button handle-button" @click="handleDelete">
                    <i class="el-icon-delete"></i>
                    删除活动
                </div>
            </div>
        </div>
        <div class="raid-detail-content">
            <div class="left">
                <DetailHeader :raidDetail="raidDetail" />
                <div class="member-list">
                    <ListStatistic
                        :name="'正式编队'"
                        :list="memberList"
                        @clear="handleClear('memberList')"
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
                            :draggable="item"
                            @dragstart="dragStart($event, item)"
                            @drag="drag($event)"
                            @dragover.prevent
                            @drop="drop('memberList', index, item)"
                            @dragend="dragEnd"
                        >
                            <Card :item="item" :role="getRole(item?.mount)" @update="getRaidDetail"></Card>
                        </div>
                    </div>
                </div>
                <div class="altetnate-list">
                    <ListStatistic
                        :name="'替补编队'"
                        :list="altetnateList"
                        @clear="handleClear('altetnateList')"
                        :count="altetnateList?.length || 0"
                    />
                    <div class="altetnate-list-content" @dragover.prevent @drop="drop('altetnateList')">
                        <div
                            v-for="item in altetnateList"
                            :key="item?.id"
                            :draggable="item"
                            @dragstart="dragStart($event, item)"
                            @drag="drag($event)"
                            @dragover.prevent
                            @drop.stop="drop('altetnateList')"
                            @dragend="dragEnd"
                            style="height: 66px"
                        >
                            <Card :item="item" :role="getRole(item?.mount)" @update="getRaidDetail"></Card>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right">
                <div class="queue-list">
                    <div class="queue-list-header">
                        <div class="queue-list-title">排队名单（{{ queueList?.length || 0 }}）</div>
                        <div class="clear-button-queue" @click="handleClear('queueList')">清空</div>
                    </div>
                    <div class="queue-list-content" @dragover.prevent @drop="drop('queueList')">
                        <div
                            v-for="item in queueList"
                            :key="item?.id"
                            draggable="true"
                            @dragstart="dragStart($event, item)"
                            @drag="drag($event)"
                            @dragover.prevent
                            @drop.stop="drop('queueList')"
                            @dragend="dragEnd"
                            :id="`item-${item?.id}`"
                        >
                            <Card :item="item" :role="getRole(item?.mount)" @update="getRaidDetail"></Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <EditDialog
            :editDialogVisible="editDialogVisible"
            :raidDetail="raidDetail"
            @success="getRaidDetail"
            @close="editDialogVisible = false"
        />
    </div>
</template>

<script>
import {
    getRaidDetail,
    clearList,
    updateMemberStatus,
    setMemberPosition,
    switchPosition,
    deleteActivity,
} from "@/service/qqbot";
import typeMap from "@jx3box/jx3box-data/data/xf/mount_group.json";
import Card from "./Card.vue";
import ListStatistic from "./ListStatistic.vue";
import DetailHeader from "./DetailHeader.vue";
import EditDialog from "./EditDialog.vue";
export default {
    name: "RaidDetail",
    components: {
        Card,
        ListStatistic,
        DetailHeader,
        EditDialog,
    },
    data() {
        return {
            raidDetail: {},
            dragItem: null,
            editDialogVisible: false,
            dragEle: null,
            dragOffset: {
                x: 0,
                y: 0,
            },
            loadRequestId: 0,
        };
    },
    computed: {
        queueList() {
            return this.raidDetail.members?.filter((item) => item.identity_status === 3);
        },
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
        this.clearDragPreview();
    },
    methods: {
        async getRaidDetail(id = this.$route.query.id) {
            const requestId = ++this.loadRequestId;
            this.raidDetail = {};
            if (!id) return;
            try {
                const res = await getRaidDetail(id);
                if (requestId === this.loadRequestId) this.raidDetail = res.data?.data || {};
            } catch (error) {
                if (requestId === this.loadRequestId) this.raidDetail = {};
            }
        },
        drag(event) {
            if (!this.dragEle) return;
            const last = !event.clientX && !event.clientY;
            this.dragEle.style.transform = `translate(${last ? 0 : event.clientX - this.dragOffset.x}px, ${
                last ? 0 : event.clientY - this.dragOffset.y
            }px) rotate(${last ? 0 : 3}deg)`;
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
        dragStart(event, member) {
            this.dragItem = member;
            this.dragOffset.x = event.clientX;
            this.dragOffset.y = event.clientY;
            const img = new Image();
            img.src = "";
            event.dataTransfer.setDragImage(img, 10, 10);
            const ele = event.target.cloneNode(true);
            ele.style.position = "fixed";
            ele.style.top = `${event.clientY - event.offsetY}px`;
            ele.style.left = `${event.clientX - event.offsetX}px`;
            ele.style.zIndex = "1000";
            ele.style.transform = `rotate(3deg)`;
            ele.style.pointerEvents = "none";
            ele.children[0].classList.add("active");
            this.dragEle = ele;
            document.body.appendChild(ele);
        },
        clearDragPreview() {
            if (this.dragEle?.parentNode) this.dragEle.parentNode.removeChild(this.dragEle);
            this.dragEle = null;
            this.dragOffset = {
                x: 0,
                y: 0,
            };
        },
        dragEnd() {
            this.clearDragPreview();
            this.dragItem = null;
        },
        async drop(item, index, member) {
            this.clearDragPreview();
            if (!this.dragItem) return;
            const dragItem = this.dragItem;
            const raidId = this.$route.query.id;
            if (member && member.id === dragItem.id) {
                this.dragItem = null;
                return;
            }
            const dragIndex = this.raidDetail.members.findIndex((item) => item.id === dragItem.id);
            let dropIndex = null;
            if (member) {
                dropIndex = this.raidDetail.members.findIndex((item) => item.id === member.id);
            }

            if (
                (item === "queueList" && dragItem.identity_status !== 3) ||
                (item === "altetnateList" && dragItem.identity_status !== 2)
            ) {
                const newStatus = item === "queueList" ? 3 : 2;
                this.changgeMembers([{ index: dragIndex, data: { ...dragItem, identity_status: newStatus } }]);
                await this.handleChangeStatus(newStatus, dragIndex, dragItem, raidId);
            }
            if (item === "memberList") {
                if (dragItem.identity_status !== 1) {
                    if (member) {
                        this.$message.error("请拖动到无人的位置");
                        return (this.dragItem = null);
                    }
                    this.changgeMembers([
                        {
                            index: dragIndex,
                            data: {
                                ...dragItem,
                                identity_status: 1,
                                group_x: Math.floor(index / 5),
                                group_y: index % 5,
                            },
                        },
                    ]);
                    const statusChanged = await this.handleChangeStatus(1, dragIndex, dragItem, raidId);
                    if (!statusChanged) {
                        if (this.dragItem === dragItem) this.dragItem = null;
                        return;
                    }
                    await this.handleChangePosition(
                        index,
                        { ...dragItem, identity_status: 1 },
                        raidId
                    );
                } else if (member) {
                    await this.handleSwitchPosition(member, dragIndex, dropIndex, dragItem, raidId);
                } else {
                    this.changgeMembers([
                        {
                            index: dragIndex,
                            data: { ...dragItem, group_x: Math.floor(index / 5), group_y: index % 5 },
                        },
                    ]);
                    await this.handleChangePosition(index, dragItem, raidId);
                }
            }
            if (this.dragItem === dragItem) this.dragItem = null;
        },
        async handleSwitchPosition(member, dragIndex, dropIndex, dragItem, raidId) {
            const new_x = dragItem.group_x;
            const new_y = dragItem.group_y;
            const old_x = member.group_x;
            const old_y = member.group_y;
            this.changgeMembers([
                { index: dragIndex, data: { ...dragItem, group_x: old_x, group_y: old_y } },
                { index: dropIndex, data: { ...member, group_x: new_x, group_y: new_y } },
            ]);
            try {
                await switchPosition(raidId, {
                    new_member_id: dragItem.id,
                    original_member_id: member.id,
                });
            } catch (error) {
                if (this.isCurrentRaid(raidId)) {
                    this.changgeMembers([
                        { index: dragIndex, data: { ...dragItem, group_x: new_x, group_y: new_y } },
                        { index: dropIndex, data: { ...member, group_x: old_x, group_y: old_y } },
                    ]);
                }
            }
        },
        async handleChangeStatus(newStatus, dragIndex, dragItem, raidId) {
            const status = dragItem.identity_status;
            try {
                await updateMemberStatus(raidId, dragItem.id, {
                    identity_status: newStatus,
                });
                return true;
            } catch (error) {
                if (this.isCurrentRaid(raidId)) {
                    this.changgeMembers([{ index: dragIndex, data: { ...dragItem, identity_status: status } }]);
                }
                return false;
            }
        },
        async handleChangePosition(index, dragItem, raidId) {
            try {
                await setMemberPosition(raidId, {
                    member_id: dragItem.id,
                    group_x: Math.floor(index / 5),
                    group_y: index % 5,
                });
            } catch (error) {
                if (this.isCurrentRaid(raidId)) {
                    await this.getRaidDetail(raidId);
                }
            }
        },
        isCurrentRaid(raidId) {
            return String(this.$route.query.id || "") === String(raidId || "");
        },
        handleClear(list) {
            if (this[list]?.length === 0) return;
            this.$confirm("确定清空吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                const member_id_list = [];
                this[list]?.forEach((item) => item && member_id_list.push(item.id));
                clearList(this.$route.query.id, { member_id_list }).then((res) => {
                    this.$message.success("清空成功");
                    this.getRaidDetail();
                });
            });
        },
        changgeMembers(arr) {
            if (!Array.isArray(this.raidDetail.members)) return;
            arr.forEach((item) => {
                this.raidDetail.members.splice(item.index, 1, item.data);
            });
        },
        handleDelete() {
            this.$confirm("确定删除吗？", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
            }).then(() => {
                deleteActivity(this.$route.query.id).then((res) => {
                    this.$message.success("删除成功");
                    this.$router.push({ name: "raid-list" });
                });
            });
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

// 详情页使用 QQBotLayout 的实际内容宽度，避免固定宽度将右侧名单推出视口。
.m-raid-detail {
    min-width: 0;
    padding: 24px 0 40px;
    box-sizing: border-box;

    .m-raid-detail__toolbar {
        align-items: center;
        margin: 0 0 16px;

        .back-button {
            width: auto;
            height: 36px;
            padding: 0 14px;
            margin-right: auto;
            gap: 6px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.06);
            color: rgba(255, 255, 255, 0.72);
            transition: 0.2s ease;

            &:hover {
                border-color: rgba(255, 255, 255, 0.24);
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }
        }
        .edit-button-group {
            width: auto;
            gap: 10px;

            .handle-button {
                width: auto;
                height: 36px;
                padding: 0 14px;
                border-radius: 8px;
                gap: 6px;
                font-size: 14px;
                font-weight: 600;
                transition: 0.2s ease;
            }
            .edit-button {
                border: 1px solid rgba(96, 151, 255, 0.34);
                background: rgba(64, 128, 255, 0.1);
                color: #8bb2ff;
                &:hover {
                    border-color: rgba(96, 151, 255, 0.58);
                    background: rgba(64, 128, 255, 0.18);
                    color: #b1caff;
                }
            }
            .delete-button {
                border: 1px solid rgba(255, 107, 135, 0.3);
                background: rgba(227, 60, 100, 0.1);
                color: #ff8aa2;
                &:hover {
                    background: rgba(227, 60, 100, 0.18);
                }
            }
        }
    }

    .raid-detail-content {
        height: auto;
        display: grid;
        grid-template-columns: minmax(0, 1fr) 220px;
        align-items: stretch;
        gap: 16px;

        .left {
            width: auto;
            min-width: 0;
            height: auto;
            min-height: 733px;
            padding: 20px;
            gap: 18px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 16px;
            background:
                radial-gradient(circle at 90% 0, rgba(64, 128, 255, 0.12), transparent 30%),
                linear-gradient(145deg, rgba(43, 45, 52, 0.98), rgba(26, 28, 33, 0.98));
            box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);

            &::after {
                display: none;
            }
            .member-list,
            .altetnate-list {
                gap: 8px;
            }
            .member-list .list-header {
                display: grid;
                grid-template-columns: repeat(5, minmax(0, 1fr));
                height: 20px;
                gap: 8px;

                .list-header-item {
                    width: auto;
                    height: 20px;
                    line-height: 20px;
                    color: rgba(255, 255, 255, 0.38);
                    border-radius: 6px;
                    background: rgba(0, 0, 0, 0.24);
                }
            }
            .member-list .member-list-content {
                display: grid;
                grid-template-columns: repeat(5, minmax(0, 1fr));
                gap: 8px;

                > div {
                    min-width: 0;
                }
                .active {
                    transform: scale(1.08);
                }
            }
            .altetnate-list .altetnate-list-content {
                display: grid;
                grid-template-columns: repeat(5, minmax(0, 1fr));
                align-content: flex-start;
                gap: 8px;
                padding: 10px;
                border: 1px dashed rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                background: rgba(0, 0, 0, 0.2);
                box-shadow: none;
                overflow-y: auto;

                > div {
                    min-width: 0;
                }
            }
            :deep(.member-list-content .card),
            :deep(.altetnate-list-content .card),
            :deep(.member-list-content .card-fotter),
            :deep(.altetnate-list-content .card-fotter) {
                width: 100%;
            }
        }

        .right {
            width: auto;
            min-width: 0;
            gap: 0;

            .queue-list {
                padding: 18px 12px;
                gap: 12px;
                border: 1px solid rgba(255, 195, 0, 0.24);
                border-radius: 16px;
                background: linear-gradient(145deg, rgba(52, 45, 30, 0.78), rgba(29, 27, 24, 0.92));

                &::after {
                    display: none;
                }
                .queue-list-header {
                    min-height: 28px;
                    height: auto;

                    .queue-list-title {
                        font-size: 14px;
                        line-height: 20px;
                        color: #ffd15a;
                    }
                    .clear-button-queue {
                        width: auto;
                        height: 24px;
                        padding: 0 8px;
                        border-color: rgba(255, 255, 255, 0.12);
                        border-radius: 6px;
                        line-height: 22px;
                        color: rgba(255, 255, 255, 0.42);
                    }
                }
                .queue-list-content {
                    > div,
                    :deep(.card),
                    :deep(.card-fotter) {
                        width: 100%;
                    }
                }
            }
        }
    }
}
</style>
