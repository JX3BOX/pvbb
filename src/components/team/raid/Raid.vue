<template>
    <div class="m-raid-core" v-loading="loading">
        <el-alert
            v-if="!isPublic && !isTeammate"
            title="当前活动为私有活动，仅团队成员可见"
            type="warning"
            center
            show-icon>
        </el-alert>
        <template v-else>
            <!-- 正式队员 -->
            <raid-normal-v1
                class="m-raid-normal"
                v-if="content"
                header="正式队员"
                mode="normal"
                v-model="members"
                :teamId="teamId"
                :leader="leader"
                :row="row"
                :col="col"
                @updateMembers="updateMembers"
            />

            <raid-normal-v2
                v-else
                header="正式队员"
                mode="normal"
                v-model="members"
                :teamId="teamId"
                :leader="leader"
                :row="row"
                :col="col"
                :id="id"
                @update="loadMembers"
                @updateMembers="updateMembers"
            />

            <!-- 替补队员 -->
            <raid-sub
                v-if="id && !content"
                ref="subRaid"
                class="m-raid-sub"
                header="替补队员"
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
                header="候选名单"
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

export default {
    name: "Raid",
    props: ["preset", "count", "teamId", "leader", "templateId", "content", "row", "col", "isPublic", "isForceMatch"],
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
            loading : false,
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
        canAdd() {
            return this.members.length <= this.row * this.col;
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
        handlePass({ member, from, isReplace }) {
            const { canAdd, canReplace } = this;
            /**
             * 逻辑梳理
             * 1. 如果可以添加 canAdd=true
             *     1.1 如果可以替补 canReplace=true
             *        1.1.1 如果是替补 from=sub
             *          1.1.1.1 是替换模式，则替换正式队伍里的人 isReplace=true
             *          1.1.1.2 是添加模式，则添加到正式队伍里
             *       1.1.2 如果是申请 from=tobe
             *          1.1.2.1 是替换模式，则替换正式队伍里的人 isReplace=true
             *          1.1.2.2 是添加模式，则添加到正式队伍里
             *    1.2 如果不能替补 canReplace=false
             *      1.2.1 是替换模式，则替换正式队伍里的人
             *      1.2.2 是添加模式，则添加到正式队伍里
             * 2. 如果不能添加，提示 canAdd=false
             *
             */
            if (canAdd) {
                if (canReplace) {
                    if (from === "sub") {
                        this.subMembers = this.subMembers.filter(m => m.id !== member.id);
                        if (isReplace) {
                            this.handleReplace(member)
                        } else {
                            this.members.push(member);
                            this.notify(`【${member.name}】已成为正式队员`)
                        }
                    } else if (from === "tobe") {
                        this.tobeMembers = this.tobeMembers.filter(m => m.id !== member.id);
                        if (isReplace) {
                            this.handleReplace(member)
                        } else {
                            this.members.push(member);
                            this.notify(`【${member.name}】已成为正式队员`)
                        }
                    }
                } else {
                    if (from === "sub") {
                        this.subMembers = this.subMembers.filter(m => m.id !== member.id);
                        this.members.push(member);
                        this.notify(`【${member.name}】已成为正式队员`)
                    } else if (from === "tobe") {
                        this.tobeMembers = this.tobeMembers.filter(m => m.id !== member.id);
                        this.members.push(member);
                        this.notify(`【${member.name}】已成为正式队员`)
                    }
                }
            } else {
                this.$notify({
                    title: "提示",
                    message: "正式队员已满",
                    type: "warning",
                });
            }
        },
        handleReplace(member) {
            const index = this.members.findIndex(m => m.mount == member.mount && !m.is_valid);
            if (index > -1) {
                this.members[index] = member;
                this.notify(`【${member.name}】已成为正式队员`)
            } else {
                const _index = this.members.findIndex(m => !m.is_valid);
                if (_index) {
                    this.members[_index] = member;
                    this.notify(`【${member.name}】已成为正式队员`)
                }
            }
        },
        notify(message) {
            this.$notify({
                title: "提示",
                message,
                type: "success",
            });
        },
        /**
         * 候补人员转为替补人员
         * @param {Object} val 选择的队员
         */
        handlePending(val) {
            const subRaid = this.$refs.subRaid;
            const copy_members = lodash.cloneDeep(subRaid.data);

            copy_members.push(val);

            subRaid.data = copy_members;
        },
        loadMembers() {
            // 兼容旧版数据
            if (!this.content) {
                this.loading = true
                getRaidMembers(this.id).then((res) => {
                    const { data = [] } = res.data;
                    this.members = data.filter((member) => member.type === "normal").sort((a, b) => a.order - b.order);
                    this.$store.commit("SET_NORMAL_MEMBERS", this.members)
                    // 保存初始排序信息
                    this.$store.commit("SET_MEMBER_ORDER", this.members.map((member) => {
                        return {
                            id: member.id,
                            order: member.order,
                        };
                    }));
                    this.subMembers = data.filter((member) => member.type === "sub")
                    this.$store.commit("SET_SUB_MEMBERS", this.subMembers)
                    this.tobeMembers = data.filter((member) => member.type === "tobe")
                    this.$store.commit("SET_TOBE_MEMBERS", this.tobeMembers)
                }).finally(() => {
                    this.loading = false
                });
            }
        },
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/raid.less";
</style>
