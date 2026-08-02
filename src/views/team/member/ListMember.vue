<template>
    <div class="v-member-list">
        <nav class="m-member-subnav" :aria-label="$t('team.member.categories')">
            <button
                v-for="item in tabs"
                :key="item.value"
                type="button"
                :class="{ 'is-active': tab === item.value }"
                :aria-current="tab === item.value ? 'page' : undefined"
                @click="switchTab(item.value)"
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

const MEMBER_SUBTABS = ["user", "pending"];

export default {
    props: ["id"],
    data: function () {
        return {
            tab: "user",
        };
    },
    computed: {
        tabs() {
            return [
                { label: this.$t("team.member.officialMembers"), value: "user" },
                { label: this.$t("team.member.joinRequests"), value: "pending" },
            ];
        },
        activeComponent() {
            return this.tab === "pending" ? PendingList : UserList;
        },
        pendingCount: function () {
            const pending = this.$store.state.pendingList.find((item) => item.team_id == this.id);
            return pending ? Number(pending.pending) || 0 : 0;
        },
    },
    watch: {
        "$route.query.subtab": {
            immediate: true,
            handler: function (subtab) {
                this.tab = MEMBER_SUBTABS.includes(subtab) ? subtab : "user";
            },
        },
    },
    methods: {
        switchTab: function (tab) {
            if (!MEMBER_SUBTABS.includes(tab)) return;

            this.tab = tab;
            if (this.$route.query.subtab === tab) return;

            this.$router
                .replace({
                    query: {
                        ...this.$route.query,
                        subtab: tab,
                    },
                })
                .catch(() => {});
        },
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
