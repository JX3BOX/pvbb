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
                            @drop="drop('altetnateList')"
                            @dragend="dragEnd"
                            style="height: 66px"
                        >
                            <Card :item="item" :role="getRole(item?.mount)" @update="getRaidDetail"></Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
export default {
    name: "RaidDetail",
    components: {
        Card,
        ListStatistic,
        DetailHeader,
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
        };
    },
    created() {
        this.getRaidDetail();
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
    mounted() {
        this.$nextTick(() => {
            setTimeout(() => {
                window.__READY__ = true
            }, 2000);
        });
    },
    methods: {
        getRaidDetail() {
            getRaidDetail(this.$route.query.id).then((res) => {
                this.raidDetail = res.data.data;
            });
        },
        drag(event) {
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
        dragEnd() {
            if (!this.dragEle) return;
            document.body.removeChild(this.dragEle);
            this.dragEle = null;
            this.dragOffset = {
                x: 0,
                y: 0,
            };
            this.dragItem = null;
        },
        async drop(item, index, member) {
            if (this.dragEle) {
                document.body.removeChild(this.dragEle);
                this.dragEle = null;
                this.dragOffset = {
                    x: 0,
                    y: 0,
                };
            }
            if (member && member.id === this.dragItem.id) return;
            const dragIndex = this.raidDetail.members.findIndex((item) => item.id === this.dragItem.id);
            let dropIndex = null;
            if (member) {
                dropIndex = this.raidDetail.members.findIndex((item) => item.id === member.id);
            }

            if (
                (item === "queueList" && this.dragItem.identity_status !== 3) ||
                (item === "altetnateList" && this.dragItem.identity_status !== 2)
            ) {
                const newStatus = item === "queueList" ? 3 : 2;
                this.changeMembers([{ index: dragIndex, data: { ...this.dragItem, identity_status: newStatus } }]);
                await this.handleChangeStatus(newStatus, dragIndex);
            }
            if (item === "memberList") {
                if (this.dragItem.identity_status !== 1) {
                    if (member) {
                        this.$message.error("请拖动到无人的位置");
                        return (this.dragItem = null);
                    }
                    this.changeMembers([
                        {
                            index: dragIndex,
                            data: {
                                ...this.dragItem,
                                identity_status: 1,
                                group_x: Math.floor(index / 5),
                                group_y: index % 5,
                            },
                        },
                    ]);
                    const res = await this.handleChangeStatus(1, dragIndex);
                    if (res.data.code !== 0) return (this.dragItem = null);
                    await this.handleChangePosition(index, dragIndex);
                } else if (member) {
                    await this.handleSwitchPosition(member, dragIndex, dropIndex);
                } else {
                    this.changeMembers([
                        {
                            index: dragIndex,
                            data: { ...this.dragItem, group_x: Math.floor(index / 5), group_y: index % 5 },
                        },
                    ]);
                    await this.handleChangePosition(index, dragIndex);
                }
            }
            this.dragItem = null;
        },
        async handleSwitchPosition(member, dragIndex, dropIndex) {
            const new_x = this.dragItem.group_x;
            const new_y = this.dragItem.group_y;
            const old_x = member.group_x;
            const old_y = member.group_y;
            this.changeMembers([
                { index: dragIndex, data: { ...this.dragItem, group_x: old_x, group_y: old_y } },
                { index: dropIndex, data: { ...member, group_x: new_x, group_y: new_y } },
            ]);
            try {
                await switchPosition(this.$route.query.id, {
                    new_member_id: this.dragItem.id,
                    original_member_id: member.id,
                });
            } catch (error) {
                this.changeMembers([
                    { index: dragIndex, data: { ...this.dragItem, group_x: new_x, group_y: new_y } },
                    { index: dropIndex, data: { ...member, group_x: old_x, group_y: old_y } },
                ]);
            }
        },
        async handleChangeStatus(newStatus, dragIndex) {
            const status = this.dragItem.identity_status;
            try {
                const res = await updateMemberStatus(this.$route.query.id, this.dragItem.id, {
                    identity_status: newStatus,
                });
                return res;
            } catch (error) {
                this.changeMembers([{ index: dragIndex, data: { ...this.dragItem, identity_status: status } }]);
            }
        },
        async handleChangePosition(index, dragIndex) {
            const x = this.dragItem.group_x;
            const y = this.dragItem.group_y;
            try {
                await setMemberPosition(this.$route.query.id, {
                    member_id: this.dragItem.id,
                    group_x: Math.floor(index / 5),
                    group_y: index % 5,
                });
            } catch (error) {
                this.changeMembers([{ index: dragIndex, data: { ...this.dragItem, group_x: x, group_y: y } }]);
            }
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
        changeMembers(arr) {
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
    width: 1254px;
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
