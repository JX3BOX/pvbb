<template>
    <div class="v-member-list">
        <nav class="m-member-subnav" aria-label="成员管理分类">
            <button
                v-for="item in tabs"
                :key="item.value"
                type="button"
                :class="{ 'is-active': tab === item.value }"
                :aria-current="tab === item.value ? 'page' : undefined"
                @click="tab = item.value"
            >
                <span>{{ item.label }}</span>
                <i v-if="item.value === 'pending' && pendingCount" class="u-subnav-count">{{ pendingCount }}</i>
            </button>
        </nav>
        <component :is="activeComponent" :id="id" @pending-count-change="updatePendingCount" />
    </div>
</template>

<script>
import PendingList from "./PendingList.vue";
import UserList from "./UserList.vue";
export default {
    props: ["id"],
    data: function () {
        return {
            tab: "user",
            tabs: [
                { label: "正式团员", value: "user" },
                { label: "加入申请", value: "pending" },
            ],
        };
    },
    computed: {
        activeComponent() {
            return this.tab === "pending" ? PendingList : UserList;
        },
        pendingCount: function () {
            const pending = this.$store.state.pendingList.find((item) => item.team_id == this.id);
            return pending ? Number(pending.pending) || 0 : 0;
        },
    },
    methods: {
        updatePendingCount: function (count) {
            const pendingList = [...this.$store.state.pendingList];
            const index = pendingList.findIndex((item) => item.team_id == this.id);
            const pending = Math.max(0, Number(count) || 0);

            if (index === -1) {
                pendingList.push({ team_id: this.id, pending });
            } else {
                pendingList.splice(index, 1, { ...pendingList[index], pending });
            }
            this.$store.commit("SET_PENDING_LIST", pendingList);
        },
    },
    components: {
        PendingList,
        UserList,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/member/list_member.less";
</style>
