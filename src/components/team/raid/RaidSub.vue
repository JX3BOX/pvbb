<template>
    <div class="m-raid-tobebox m-raid-subbox">
        <h5 class="u-title">
            <span>
                <i class="el-icon-first-aid-kit"></i>
                {{ header || $t("team.raid.board.substitute") }}
                <span class="u-count">({{ count }})</span>
            </span>
            <el-button size="small" type="primary" icon="CirclePlus" @click="handleButtonAdd('add')" v-if="canManage"
                >{{ $t("team.raid.member.addSubstitute") }}</el-button
            >
        </h5>
        <div class="m-raid-corebox" v-if="data && data.length">
            <ul class="m-raid-members">
                <div
                    class="u-member"
                    v-for="(member, i) in data"
                    :key="i"
                    @contextmenu.prevent="(event) => handleContextMenuOpen(event, { member, i })"
                >
                    <el-popover
                        placement="top-start"
                        width="200"
                        trigger="hover"
                        popper-class="m-raid-members__sub-item"
                    >
                        <!-- POP -->
                        <member-pop :member="member" />

                        <!-- 格子 -->
                        <template #reference>
                            <span class="u-member-primary">
                                <img
                                    class="u-member-icon"
                                    :src="showMountIcon(member['mount'])"
                                    :alt="showMountName(member['mount'])"
                                />
                                <span class="u-member-role">
                                    <button
                                        class="u-member-role-trigger"
                                        type="button"
                                        v-if="member.role_id && linkVisible"
                                        :aria-label="$t('team.raid.board.viewRole', { name: showMemberName(member['name']) })"
                                        @mousedown.stop
                                        @click.stop="openRoleDialog(member)"
                                    >
                                        <i class="el-icon-link"></i>
                                        <span>{{ showMemberName(member["name"]) }}</span>
                                    </button>
                                    <span v-else class="u-member-name">{{ showMemberName(member["name"]) }}</span>
                                </span>
                                <span class="u-member-remark" v-if="member['remark']">[{{ member["remark"] }}]</span>
                            </span>
                        </template>
                    </el-popover>
                    <span class="u-member-op" v-if="canManage">
                        <el-tooltip class="item" effect="dark" :content="$t('team.raid.member.settings')" placement="top-start">
                            <i class="u-member-setting el-icon-setting" @click="handleSetting(member, i)"></i>
                        </el-tooltip>
                        <el-tooltip clss="item" effect="dark" :content="$t('team.raid.member.toNormal')" placement="top-start">
                            <span>
                                <el-popconfirm :title="$t('team.raid.member.toNormalConfirm')" @confirm="pass(member, i)">
                                    <template #reference>
                                        <i class="u-member-reset el-icon-check"></i>
                                    </template>
                                </el-popconfirm>
                            </span>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" :content="$t('team.raid.member.remove')" placement="top-start">
                            <span>
                                <el-popconfirm :title="$t('team.raid.member.removeConfirm')" @confirm="remove(member, i)">
                                    <template #reference>
                                        <i class="u-member-delete el-icon-delete"></i>
                                    </template>
                                </el-popconfirm>
                            </span>
                        </el-tooltip>
                    </span>
                </div>
            </ul>
        </div>
        <div class="m-raid-null" v-else><i class="el-icon-warning-outline"></i> {{ $t("team.raid.board.empty") }}</div>

        <member-setting
            :title="title"
            :visible="visible"
            :data="selectedMember"
            :teamId="teamId"
            mode="sub"
            @close="handleDialogCancel"
            @updateRole="handleSave"
        />
        <raid-role-dialog
            v-model="roleDialogVisible"
            :role-id="roleDialogMember && roleDialogMember.role_id"
            :member="roleDialogMember || {}"
        />
    </div>
</template>

<script>
import { addSubMember, covertSub2Normal, removeMember } from "@/service/team/raid.js";
import MemberSetting from "@/components/team/raid/RaidMemberSetting.vue";
import RaidRoleDialog from "@/components/team/raid/RaidRoleDialog.vue";
import xf_map from "@jx3box/jx3box-data/data/xf/xf.json";
import cloneDeep from "lodash/cloneDeep";
import ContextMenu from "@imengyu/vue3-context-menu";
import { getRoles } from "@/service/team/raid.js";
import MemberPop from "./MemberPop.vue";
import { showMountIcon, showMountName } from "@/utils/filters";
import bus from "@/utils/bus";
export default {
    name: "RaidSub",
    props: ["id", "teamId", "isForceMatch", "canAdd", "canReplace", "header"],
    emits: ["pass"],
    components: {
        MemberSetting,
        RaidRoleDialog,
        "member-pop": MemberPop,
    },
    data() {
        return {
            data: [],
            // 弹层
            visible: false,
            title: "",
            roleDialogVisible: false,
            roleDialogMember: null,

            // 右键菜单
            selectedMember: null,
            selectedIndex: undefined,
            action: "",

            // 可选名单列表（用于快速选择）
            roles: [],

            // 快速编辑
            editing: {},
            tempMember: {
                name: "",
                mount: "",
                is_core: false,
                pending: [],
                remark: "",
                role_id: 0,
            },

            // 预设、杂项
            xf_map,
            loading: false,
            isMax: false,
        };
    },
    computed: {
        raid_id() {
            return this.id;
        },
        canManage() {
            return this.$store.state.canManage;
        },
        linkVisible() {
            return this.$store.state.isTeammate;
        },
        isEditing() {
            return Object.values(this.editing).some((e) => e);
        },
        allRoles() {
            return this.$store.state.roles;
        },
        members() {
            return this.$store.state.subMembers;
        },
        normalMembers() {
            return this.$store.state.normalMembers;
        },
        count() {
            return this.members.length;
        },
    },
    watch: {
        allRoles: {
            deep: true,
            handler(val) {
                if (val) {
                    this.roles = cloneDeep(val);
                }
            },
        },
        members: {
            deep: true,
            immediate: true,
            handler(val) {
                this.data = val;
            },
        },
    },
    methods: {
        openRoleDialog(member) {
            this.roleDialogMember = member;
            this.roleDialogVisible = true;
        },
        // 单项
        // ===============================
        // 设置
        handleSetting(member, index) {
            this.title = this.$t("team.raid.board.roleSettings");
            this.selectedMember = member;
            this.selectedIndex = index;
            this.visible = true;
        },
        handleDialogCancel() {
            this.visible = false;
            this.selectedMember = null;
            this.action = "";
        },
        // 设为正式
        async pass(member, i) {
            const { canAdd, canReplace } = this;
            const apply_id = member?.id;

            try {
                /**
                 * 逻辑梳理
                 * 1. 如果可以添加 canAdd = true
                 *   1.1 如果可以替换 canReplace = true
                 *      1.1.1 能找到指定心法且is_valid为false，则替换 targetMember存在
                 *      1.1.2 没有指定心法，则添加
                 *   1.2 如果不能替换，则添加
                 * 2. 如果不能添加，则提示
                 */
                if (canAdd) {
                    if (canReplace) {
                        let targetMember = this.isForceMatch
                            ? this.normalMembers.find((m) => m.mount == member.mount && !m.is_valid)
                            : this.normalMembers.find((m) => m.mount == member.mount && !m.is_valid) ||
                              this.normalMembers.find((m) => !m.is_valid);

                        if (targetMember) {
                            let replaceId = targetMember?.id;
                            await covertSub2Normal(this.raid_id, apply_id, replaceId);
                            this.data.splice(i, 1);
                            this.$emit("pass", { member, from: "sub", isReplace: true });
                        } else {
                            await covertSub2Normal(this.raid_id, apply_id);
                            this.data.splice(i, 1);
                            this.$emit("pass", { member, from: "sub", isReplace: false });
                        }
                    } else {
                        await covertSub2Normal(this.raid_id, apply_id);
                        this.data.splice(i, 1);
                        this.$emit("pass", { member, from: "sub" });
                    }
                } else {
                    this.$notify({
                        type: "warning",
                        title: this.$t("team.raid.common.tip"),
                        message: this.$t("team.raid.member.teamFull"),
                    });
                }
            } catch (e) {
                console.log("covertSub2Normal", e);
            }
        },
        // 删除
        remove(member, i) {
            removeMember(this.raid_id, member?.id).then(() => {
                this.$notify({
                    title: this.$t("team.raid.member.operationSuccess"),
                    message: this.$t("team.raid.common.deleted"),
                    type: "success",
                });
                this.data.splice(i, 1);
            });
        },

        // 列表
        // ===============================
        // 添加替补
        handleButtonAdd(action) {
            this.title = this.$t("team.raid.member.addSubstitute");
            this.action = action;
            this.selectedMember = null;
            this.visible = true;
            // this.members.push(cloneDeep(item_demo));
        },
        add: function (member) {
            addSubMember(this.id, {
                /* role_id: 1, //是否是选择的，自定义的是空
                type: "sub", //不变
                name: "", //需要设置
                server: "", //如果是自定义的可能没有
                mount: "", //需要设置
                remark: "", //自行选择是否会设置 */
                ...member,
                type: "sub",
            }).then((res) => {
                // 前端需要直接添加项
                this.data.push(res.data.data);
            });
        },

        // 右键设置
        // ===============================
        handleContextMenuOpen(event, obj) {
            if (!this.isEditing && this.canManage) {
                const { member, i } = obj;
                this.selectedMember = member;
                this.selectedIndex = i;

                ContextMenu.showContextMenu({
                    x: event.x,
                    y: event.y,
                    customClass: "m-raid-contextmenu",
                    items: [
                        {
                            label: this.$t("team.raid.item.edit"),
                            customClass: "item",
                            onClick: () => this.setEdit(),
                        },
                        {
                            label: this.$t("team.raid.member.toNormal"),
                            customClass: "item",
                            onClick: () => this.setPass(),
                        },
                        {
                            label: this.$t("team.raid.member.remove"),
                            customClass: "item",
                            onClick: () => this.remove(this.selectedMember, this.selectedIndex),
                        },
                    ],
                });
            }
        },
        // 右键编辑
        setEdit() {
            this.title = this.$t("team.raid.board.roleSettings");
            this.visible = true;
        },
        // 右键转正
        setPass() {
            this.pass(this.selectedMember, this.selectedIndex);
        },
        // 设置备注
        setRemark() {
            this.$prompt(this.$t("team.raid.board.remarkPrompt"), "", {
                confirmButtonText: this.$t("team.raid.common.confirm"),
                cancelButtonText: this.$t("team.raid.common.cancel"),
                inputValue: this.selectedMember.remark,
                inputValidator: (val) => {
                    if (val.length > 20) {
                        return this.$t("team.raid.board.remarkTooLong");
                    }
                },
            }).then(({ value }) => {
                this.selectedMember.remark = value;
                this.data[this.selectedIndex] = this.selectedMember;
                this.remark(this.selectedMember);
                this.selectedMember = null;
            });
        },
        remark: function ({ id: apply_id, remark }) {
            updateRaidApply(apply_id, {
                remark: remark,
            });
        },

        // 选项加载
        // ===============================
        // 远程获取角色
        remoteMethod(query) {
            if (query !== "") {
                this.loading = true;
                getRoles(this.teamId, query).then((res) => {
                    this.roles = res.data.data.list;
                    this.loading = false;
                });
            } else {
                this.roles = cloneDeep(this.copy_roles);
            }
        },
        showMemberName: function (name) {
            if (this.linkVisible) {
                return name;
            } else {
                return name.slice(0, 1) + "******";
            }
        },

        // 发布|保存
        // ===============================
        // 编辑替补
        edit: function ({ member, index }) {
            const apply_id = member?.id;
            updateRaidApply(apply_id, {
                ...member,
                type: "sub",
            }).then((res) => {
                this.data[index] = member;
            });
        },
        // 弹层修改
        handleSave(member) {
            const action = this.action;
            // 当路由为查看排表且表为替补队员时，需要请求额外的接口增加队员，此处 emit 上去
            if (action === "add") {
                this.data.push(member);
            }
            if (!action) {
                this.members[this.selectedIndex] = member;
            }
            this.selectedMember = null;
            this.visible = false;
        },
        showMountIcon,
        showMountName,
        handleWithoutPos(from) {
            if (from !== "sub") return;
            this.$notify({
                type: "warning",
                title: this.$t("team.raid.common.tip"),
                message: this.$t("team.raid.member.teamFull"),
            });
            this.isMax = true;
        },
        handlePending(data) {
            this.data = [...this.data, data];
        },
    },
    mounted: function () {
        bus.on("withoutPos", this.handleWithoutPos);
        bus.on("pending", this.handlePending);
    },
    beforeUnmount() {
        bus.off("withoutPos", this.handleWithoutPos);
        bus.off("pending", this.handlePending);
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/sub.less";
</style>
