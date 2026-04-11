<template>
    <div class="m-raid-tobebox m-raid-subbox">
        <h5 class="u-title">
            <span>
                <i class="el-icon-first-aid-kit"></i>
                替补队员
                <span class="u-count">({{ count }})</span>
            </span>
            <el-button size="small" type="primary" icon="CirclePlus" @click="handleButtonAdd('add')" v-if="canManage"
                >添加替补</el-button
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
                                    <router-link
                                        class="u-member-name-link"
                                        target="_blank"
                                        v-if="member.role_id && linkVisible"
                                        :to="`/role/${member.role_id}`"
                                    >
                                        <i class="el-icon-link"></i>
                                    </router-link>
                                    <span class="u-member-name">{{ showMemberName(member["name"]) }}</span>
                                </span>
                                <span class="u-member-remark" v-if="member['remark']">[{{ member["remark"] }}]</span>
                            </span>
                        </template>
                    </el-popover>
                    <span class="u-member-op" v-if="canManage">
                        <el-tooltip class="item" effect="dark" content="设置" placement="top-start">
                            <i class="u-member-setting el-icon-setting" @click="handleSetting(member, i)"></i>
                        </el-tooltip>
                        <el-tooltip clss="item" effect="dark" content="转为正式成员" placement="top-start">
                            <el-popconfirm title="是否将该角色转为正式成员？" @confirm="pass(member, i)">
                                <template #reference>
                                    <i class="u-member-reset el-icon-check"></i>
                                </template>
                            </el-popconfirm>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
                            <el-popconfirm title="是否删除该角色？" @confirm="remove(member, i)">
                                <template #reference>
                                    <i class="u-member-delete el-icon-delete"></i>
                                </template>
                            </el-popconfirm>
                        </el-tooltip>
                    </span>
                </div>
            </ul>
        </div>
        <div class="m-raid-null" v-else><i class="el-icon-warning-outline"></i> 当前没有任何名单</div>

        <member-setting
            :title="title"
            :visible="visible"
            :data="selectedMember"
            :teamId="teamId"
            mode="sub"
            @close="handleDialogCancel"
            @updateRole="handleSave"
        />
    </div>
</template>

<script>
import { addSubMember, covertSub2Normal, removeMember } from "@/service/team/raid.js";
import MemberSetting from "@/components/team/raid/RaidMemberSetting.vue";
import xf_map from "@jx3box/jx3box-data/data/xf/xf.json";
import cloneDeep from "lodash/cloneDeep";
import ContextMenu from "@imengyu/vue3-context-menu";
import { getRoles } from "@/service/team/raid.js";
import MemberPop from "./MemberPop.vue";
import { showMountIcon, showMountName } from "@/utils/filters";
export default {
    name: "RaidSub",
    props: ["id", "teamId", "isForceMatch", "canAdd", "canReplace"],
    components: {
        MemberSetting,
        "member-pop": MemberPop,
    },
    data() {
        return {
            data: [],
            // 弹层
            visible: false,
            title: "新增替补",

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
        // 单项
        // ===============================
        // 设置
        handleSetting(member, index) {
            this.title = "角色设置";
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
                            this.$emit("pass", { member, from: "sub", isReplace: true });
                            await covertSub2Normal(this.raid_id, apply_id, replaceId);
                            this.data.splice(i, 1);
                        } else {
                            this.$emit("pass", { member, from: "sub", isReplace: false });
                            await covertSub2Normal(this.raid_id, apply_id);
                            this.data.splice(i, 1);
                        }
                    } else {
                        this.$emit("pass", { member, from: "sub" });
                        await covertSub2Normal(this.raid_id, apply_id);
                        this.data.splice(i, 1);
                    }
                } else {
                    this.$notify({
                        type: "warning",
                        title: "提示",
                        message: "当前团队人数已满或无匹配职责空位",
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
                    title: "操作成功",
                    message: `删除成功`,
                    type: "success",
                });
                this.data.splice(i, 1);
            });
        },

        // 列表
        // ===============================
        // 添加替补
        handleButtonAdd(action) {
            this.title = "新增替补";
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
                            label: "编辑",
                            customClass: "item",
                            onClick: () => this.setEdit(),
                        },
                        {
                            label: "转正",
                            customClass: "item",
                            onClick: () => this.setPass(),
                        },
                        {
                            label: "删除",
                            customClass: "item",
                            onClick: () => this.remove(this.selectedMember, this.selectedIndex),
                        },
                    ],
                });
            }
        },
        // 右键编辑
        setEdit() {
            this.title = "角色设置";
            this.visible = true;
        },
        // 右键转正
        setPass() {
            this.pass(this.selectedMember, this.selectedIndex);
        },
        // 设置备注
        setRemark() {
            this.$prompt("请输入备注", "", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputValue: this.selectedMember.remark,
                inputValidator: (val) => {
                    if (val.length > 20) {
                        return "备注内容应不超过20个字符";
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
    },
    mounted: function () {
        this.$bus.$on("withoutPos", (from) => {
            if (from !== "sub") return;
            this.$notify({
                type: "warning",
                title: "提醒",
                message: "此角色职能位已不足，请检查后再试",
            });
            // 职能已满
            this.isMax = true;
        });
        this.$bus.$on("pending", (data) => {
            this.data = [...this.data, data];
        });
    },
    beforeUnmount() {
        this.$bus.$off("withoutPos");
        this.$bus.$off("pending");
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/sub.less";
</style>
