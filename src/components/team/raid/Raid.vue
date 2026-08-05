<template>
    <div class="m-raid-core" v-loading="loading">
        <el-alert
            v-if="!isPublic && !isTeammate"
            :title="$t('team.raid.board.private')"
            type="warning"
            center
            show-icon>
        </el-alert>
        <template v-else>
            <!-- 正式队员 -->
            <raid-normal-v1
                class="m-raid-normal"
                v-if="content"
                :header="$t('team.raid.board.normal')"
                mode="normal"
                :data="members"
                :teamId="teamId"
                :leader="leader"
                :row="row"
                :col="col"
                @updateMembers="updateMembers"
            />

            <raid-normal-v2
                v-else
                :header="$t('team.raid.board.normal')"
                mode="normal"
                :data="members"
                :teamId="teamId"
                :leader="leader"
                :row="row"
                :col="col"
                :capacity="capacity"
                :id="id"
                @update="loadMembers"
                @updateMembers="updateMembers"
            />

            <!-- 替补队员 -->
            <raid-sub
                v-if="id && !content"
                ref="subRaid"
                class="m-raid-sub"
                :header="$t('team.raid.board.substitute')"
                mode="sub"
                :teamId="teamId"
                :id="id"
                :isForceMatch="isForceMatch"
                :canAdd="canAdd"
                :canReplace="canReplace"
                @pass="handlePass"
            />

            <!-- 候选名单 -->
            <raid-tobe
                v-if="id && !content"
                class="m-raid-tobe"
                :header="$t('team.raid.board.candidates')"
                mode="tobe"
                :teamId="teamId"
                :id="id"
                :isForceMatch="isForceMatch"
                :canAdd="canAdd"
                :canReplace="canReplace"
                @pass="handlePass"
                @pending="handlePending"
            />
        </template>
    </div>
</template>

<script>
import lodash from "lodash";
import samples from "@/assets/data/team/team_templates.json";
import sample from "@/assets/data/team/team_template_item.json";
import RaidNormalV1 from "@/components/team/raid/RaidNormal_v1.vue";
import RaidNormalV2 from "@/components/team/raid/RaidNormal_v2.vue";
import RaidSub from "@/components/team/raid/RaidSub.vue";
import RaidTobe from "@/components/team/raid/RaidTobe.vue";
import { getRaidMembers } from "@/service/team/raid.js";
import { getRequestErrorMessage } from "@/utils/common";

export default {
    name: "Raid",
    props: ["preset", "count", "teamId", "leader", "templateId", "content", "row", "col", "isPublic", "isForceMatch"],
    emits: ["updateMembers"],
    components: {
        "raid-normal-v1": RaidNormalV1,
        "raid-normal-v2": RaidNormalV2,
        RaidSub,
        RaidTobe,
    },
    data: function () {
        return {
            members: [],
            subMembers: [], // 替补队员
            tobeMembers: [], // 候选名单
            substitutes: [],
            drag_options: {
                handle: ".u-member-icon",
            },
            action: "",
            loading: false,
            memberLoadVersion: 0,
        };
    },
    watch: {
        preset: {
            immediate: true,
            handler: function (val) {
                // 首次初始化
                if (!this.id) {
                    this.members = samples[val]["data"] || [];
                }
            },
        },
        count: function (n) {
            if (!this.id && this.preset == "custom") {
                this.fulfill(n);
            }
        },
        members: {
            deep: true,
            handler: function (val) {
                this.$emit("updateMembers", val);
            },
        },
        content: {
            immediate: true,
            deep: true,
            handler(val) {
                if (val?.length) this.members = val || [];
            },
        },
        teamId: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.$store.dispatch("loadAllRoles", { teamId: this.teamId });
                }
            },
        },
        isPublic: {
            immediate: true,
            handler() {
                if (this.isPublic || (!this.isPublic && this.isTeammate)) this.loadMembers();
            },
        },
        isTeammate: {
            immediate: true,
            handler() {
                // if (this.isPublic || (!this.isPublic && this.isTeammate)) this.loadMembers();
            },
        },
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
        isTeammate() {
            return this.$store.state.isTeammate;
        },
        capacity() {
            const configuredCount = Number(this.count);
            if (configuredCount > 0) return configuredCount;

            return Number(this.row || 0) * Number(this.col || 0);
        },
        normalMemberCount() {
            return this.members.filter((item) => Number(item?.is_valid) === 1).length;
        },
        canAdd() {
            return this.normalMemberCount < this.capacity;
        },
        canReplace() {
            return this.members.filter(item => !item.is_valid).length > 0;
        },
    },
    methods: {
        fulfill: function (n) {
            let list = [];
            for (let i = 0; i < this.count; i++) {
                list.push(lodash.cloneDeep(sample));
            }
            this.members = list;
        },
        updateMembers(val) {
            this.members = val;
        },
        /**
         * 替补人员和候补人员转为正式队员
         * @param {Object} member 选择的队员
         * @param from
         * @param isReplace
         */
        handlePass({ member }) {
            this.loadMembers();
            this.notify(this.$t("team.raid.board.promoted", { name: member.name }));
        },
        handleReplace(member) {
            const index = this.members.findIndex(m => m.mount == member.mount && !m.is_valid);
            if (index > -1) {
                this.members[index] = member;
                this.notify(this.$t("team.raid.board.promoted", { name: member.name }));
            } else {
                const _index = this.members.findIndex(m => !m.is_valid);
                if (_index > -1) {
                    this.members[_index] = member;
                    this.notify(this.$t("team.raid.board.promoted", { name: member.name }));
                }
            }
        },
        notify(message) {
            this.$notify({
                title: this.$t("team.raid.common.tip"),
                message,
                type: "success",
            });
        },
        /**
         * 候补人员转为替补人员
         */
        handlePending() {
            this.loadMembers();
        },
        isCurrentMemberLoad(raidId, version) {
            return version === this.memberLoadVersion && String(raidId) === String(this.id);
        },
        applyMemberLists(data = []) {
            this.members = data.filter((member) => member.type === "normal").sort((a, b) => a.order - b.order);
            this.subMembers = data.filter((member) => member.type === "sub");
            this.tobeMembers = data.filter((member) => member.type === "tobe");

            this.$store.commit("SET_NORMAL_MEMBERS", this.members);
            this.$store.commit(
                "SET_MEMBER_ORDER",
                this.members.map((member) => ({
                    id: member.id,
                    order: member.order,
                })),
            );
            this.$store.commit("SET_SUB_MEMBERS", this.subMembers);
            this.$store.commit("SET_TOBE_MEMBERS", this.tobeMembers);
        },
        async loadMembers() {
            // 兼容旧版数据
            if (this.content) return;

            const raidId = this.id;
            const version = ++this.memberLoadVersion;
            this.loading = true;
            try {
                const res = await getRaidMembers(raidId);
                if (!this.isCurrentMemberLoad(raidId, version)) return;
                this.applyMemberLists(res?.data?.data || []);
            } catch (error) {
                if (!this.isCurrentMemberLoad(raidId, version)) return;
                this.applyMemberLists([]);
                this.$notify({
                    type: "error",
                    title: this.$t("team.raid.common.tip"),
                    message: getRequestErrorMessage(error, this.$t("team.raid.view.loadFailed")),
                });
            } finally {
                if (this.isCurrentMemberLoad(raidId, version)) this.loading = false;
            }
        },
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/raid.less";
</style>
