<template>
    <div class="member">
        <div class="member-header">
            <div class="member-header-item">1</div>
            <div class="member-header-item">2</div>
            <div class="member-header-item">3</div>
            <div class="member-header-item">4</div>
            <div class="member-header-item">5</div>
        </div>
        <div class="member-list">
            <div
                class="member-list-item"
                v-for="member in members"
                :key="member?.id"
                draggable="true"
                @dragstart="handleDragStart($event, member)"
                @drop="handleDrop($event, member)"
                @dragover.prevent
                :id="`item-${member?.id}`"
            >
                <Card :item="member" />
            </div>
        </div>
    </div>
</template>

<script>
import Card from "./Card.vue";
import { updateMemberInfo } from "@/service/qqbot";
export default {
    name: "Member",
    components: {
        Card,
    },
    data() {
        return {
            dragMember: null,
        };
    },
    props: {
        members: {
            type: Array,
            default: () => [],
        },
        changeMember: {
            type: Function,
            default: () => {},
        },
    },
    methods: {
        handleDragStart(event, member) {
            console.log(event)
            this.dragMember = member;
            let ele = document.getElementById(`item-${member.id}`);
            let clone = ele.cloneNode(true);
            clone.classList.add("dragElement");
            let faElement = document.querySelector(".member");
            faElement.appendChild(clone);
            event.dataTransfer.setDragImage(faElement, event.offsetX, event.offsetY);
            requestAnimationFrame(() => {
                document.body.removeChild(clone);
            });
        },
        handleDrop(member) {
            let handelDragMember;
            let handelDropMember;
            if (this.dragMember) {
                handelDropMember = updateMemberInfo.bind(null, this.$route.query.id, member.id, {
                    remark: this.dragMember.remark,
                    game_role: this.dragMember.game_role,
                    serial_no: this.dragMember.serial_no,
                });
            }
            if (member) {
                handelDragMember = updateMemberInfo.bind(null, this.$route.query.id, this.dragMember.id, {
                    remark: member.remark,
                    game_role: member.game_role,
                    serial_no: member.serial_no,
                });
            }
            Promise.all([handelDropMember(), handelDragMember()]).then(() => {
                this.$emit("changeMember",this.dragMember,member);
                this.dragMember = null;
            });
        },
    },
};
</script>

<style lang="less" scoped>
.member {
    width: 862px;
    .member-header {
        height: 12px;
        width: 100%;
        margin: 4px 0;
        display: flex;
        justify-content: space-between;
        .member-header-item {
            height: 100%;
            width: 150px;
            font-size: 12px;
            font-weight: 400;
            line-height: 12px;
            color: rgba(255, 255, 255, 0.75);
            text-align: center;
            border-radius: 8px;
            background: rgba(0, 0, 0, 1);
        }
    }
    .member-list {
        height: 346px;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: space-between;
        align-content: space-between;
        .member-list-item {
            width: 150px;
            cursor: grab;
            user-select: none;
        }
    }
    .dragElement {
        width: 150px;
        transform: rotate(3deg);
        box-shadow: 0px 20px 20px;
        position: absolute;
        top: -1000px;
    }
}
</style>
