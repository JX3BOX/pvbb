<template>
    <div class="m-raid-tobebox m-raid-normalbox" @blur.capture="spanBlur">
        <h5 class="u-title">
            <span>
                <i class="el-icon-s-flag"></i>
                正式队员
                <span class="u-count">({{ count }})</span>
                <!-- 职能统计 -->
                <span class="u-mount-group">
                    <span v-for="(value, key) in raidMountGroup" :key="key" class="u-count u-item"
                        >{{ key }}：{{ value.length || 0 }}</span
                    >
                </span>
            </span>
            <div>
                <el-button
                    size="small"
                    type="primary"
                    icon="CirclePlusFilled"
                    @click="handleButtonAdd('add')"
                    v-if="canManage"
                    >添加队员</el-button
                >
            </div>
        </h5>
        <div class="m-raid-corebox m-raid-normal" :class="{ qkmode: canManage }" v-if="members && members.length">
            <div class="m-raid-flag">
                <i class="i-flag" v-for="f in col" :key="f">{{ f }}</i>
            </div>
            <VueDraggable
                tag="div"
                class="m-raid-members"
                v-model="members"
                v-bind="{ ...drag_options, sort: canManage, draggable: '.u-member-draggable' }"
                handle=".u-member"
                :animation="100"
                :class="'row-' + row"
            >
                <div
                    v-for="(member, i) in members"
                    :key="dragKey(member, 'raid-normal-v2')"
                    class="u-member u-member-draggable"
                    :class="{ 'is-group-start': isGroupStart(i) }"
                    @contextmenu.prevent="(event) => handleContextMenuOpen(event, { member, i })"
                >
                    <!-- <i class="u-group-start" v-if="isGroupStart(i,row)">{{isGroupStart(i,row)}}</i> -->

                    <span class="u-member-func">{{ roleFunc(member.role_func) }}</span>

                    <img
                        class="u-member-leader"
                        v-if="isLeader(member) || (!leader && i === 0)"
                        src="@/assets/img/team/raid/leader.png"
                        alt="leader"
                        title="队长"
                    />
                    <img
                        class="u-member-core"
                        v-if="isCore(member)"
                        src="@/assets/img/team/raid/core.png"
                        alt="core"
                        title="阵眼"
                    />
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
                                v-if="member.role_id && !editing[i] && linkVisible"
                                :to="`/role/${member.role_id}`"
                            >
                                <i class="el-icon-link"></i>
                            </router-link>
                            <span class="u-member-name" v-if="!editing[i]">{{ showMemberName(member["name"]) }}</span>

                            <el-select
                                v-show="editing[i]"
                                placeholder="请选择或输入团员名"
                                v-model="tempMember.name"
                                allow-create
                                filterable
                                remote
                                clearable
                                size="small"
                                style="width: 160px"
                                :remote-method="remoteMethod"
                                :loading="loading"
                                :ref="'name' + i"
                                @change="handleMemberChange"
                            >
                                <el-option
                                    v-for="(role, index) in roles"
                                    :key="index"
                                    :label="role.name"
                                    :value="role.ID"
                                >
                                    <div style="display: inline-flex; align-items: center">
                                        <img
                                            style="margin-right: 8px"
                                            width="24"
                                            height="24"
                                            :src="showSchoolIcon(role.mount)"
                                        />
                                        <span>{{ role.name }}</span>
                                    </div>
                                </el-option>
                            </el-select>
                        </span>
                        <span class="u-member-remark" v-if="member['remark'] && !editing[i]"
                            >[{{ member["remark"] }}]</span
                        >
                    </span>
                    <span class="u-member-op" v-if="canManage">
                        <el-tooltip class="item" effect="dark" content="设置" placement="top-start">
                            <i class="u-member-setting el-icon-setting" @click="handleSetting(member, i)"></i>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="设为替补队员" placement="top-start">
                            <el-popconfirm title="是否将该角色转为替补成员？" @confirm="pending(member, i)">
                                <template #reference>
                                    <i class="u-member-reset el-icon-first-aid-kit"></i>
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
                <div
                    v-if="members.length > 0 && members.length < row * col"
                    title="新增队员"
                    @click="handleAdd('add')"
                    class="u-member u-member-add"
                >
                    <i class="el-icon-plus u-member-add-icon"></i>
                </div>
            </VueDraggable>
        </div>
        <div class="m-raid-null" v-else><i class="el-icon-warning-outline"></i> 当前没有任何名单</div>

        <member-setting
            :title="title"
            :visible="visible"
            :data="selectedMember"
            :teamId="teamId"
            :members="members"
            :max="col * row"
            mode="normal"
            @close="handleDialogCancel"
            @updateRole="handleSave"
        />
    </div>
</template>

<script>
// api
import { getRoles, covertNormal2Sub, removeMember, sortMember } from "@/service/team/raid.js";

import xf_map from "@jx3box/jx3box-data/data/xf/xf.json";
import school_mount from "@jx3box/jx3box-data/data/xf/schoolid.json";
import { VueDraggable } from "vue-draggable-plus";
import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import mountData from "@jx3box/jx3box-data/data/xf/mount_group.json";
const { mount_group } = mountData;
import { ensureDragKey } from "@/utils/draggable";
import { showMountIcon, showMountName, showSchoolIcon } from "@/utils/filters";

// components
import MemberSetting from "@/components/team/raid/RaidMemberSetting.vue";
import ContextMenu from "@imengyu/vue3-context-menu";
const item_demo = {
    role_func: "",
    name: "",
    mount: "",
    remark: "",
    role_id: null,
    order: 0,
    is_virtual: true,
    is_member_request: 0,
};

export default {
    name: "RaidNormal",
    props: ["data", "teamId", "leader", "row", "col", "id"],
    components: {
        MemberSetting,
        VueDraggable,
    },
    data() {
        return {
            members: [],

            // 弹层
            visible: false,
            title: "新增队员",

            // 右键菜单
            selectedMember: null,
            selectedIndex: undefined,
            action: "",

            // 拖拽
            drag_options: {
                handle: ".u-member",
            },
            // 排序
            order: [],

            // 可选名单列表（用于快速选择）
            roles: [],

            // 快速设置
            editing: {},
            tempMember: {
                role_func: "",
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
            canDrag: false,
        };
    },
    computed: {
        raid_id() {
            return this.id;
        },
        isEditing() {
            return Object.values(this.editing).some((e) => e);
        },
        routerName() {
            return this.$route.name;
        },
        canManage() {
            return this.$store.state.canManage;
        },
        linkVisible() {
            return this.$store.state.isTeammate;
        },
        allRoles() {
            return this.$store.state.roles;
        },
        memberOrder() {
            return this.$store.state.memberOrder;
        },
        count() {
            return this.data.filter((e) => e.is_valid).length;
        },
        raidMountGroup() {
            const obj = {};
            Object.entries(mount_group).forEach(([key, value]) => {
                this.members.forEach((member) => {
                    if (member.mount && member.is_valid) {
                        if (value.includes(member.mount)) {
                            obj[key] = obj[key] || [];
                            obj[key].push(member);
                        }
                    }
                });
            });

            return obj;
        },
    },
    methods: {
        dragKey: ensureDragKey,
        showMountIcon,
        showMountName,
        showSchoolIcon,
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
        // 删除
        remove(member, i) {
            // 如果当前是一个虚拟节点，则只是重置所有值为默认
            if (member.is_virtual && !member?.id) {
                this.$notify({
                    title: "操作成功",
                    message: `删除成功`,
                    type: "success",
                });
                this.members.splice(i, 1, cloneDeep(item_demo));
                return;
            }
            // 如果当前是一个非虚拟节点，则发起删除请求并用一个虚拟节点替代
            removeMember(this.raid_id, member?.id).then(() => {
                this.$notify({
                    title: "操作成功",
                    message: `删除成功`,
                    type: "success",
                });
                this.members.splice(i, 1, cloneDeep(item_demo)); //应同时添加一个虚拟节点
            });
        },
        // 设为替补
        pending: function (member, i) {
            if (member.is_virtual) {
                return;
            }
            this.$bus.$emit("pending", member);
            covertNormal2Sub(this.raid_id, member.id).then(() => {
                this.members.splice(i, 1, cloneDeep(item_demo));
            });
        },

        // 列表
        // ===============================
        // 添加队员
        handleAdd() {
            this.members.push(cloneDeep(item_demo));
        },
        // 弹窗添加队员
        handleButtonAdd(action) {
            this.title = "新增队员";
            this.action = action;
            this.selectedMember = null;
            this.visible = true;
            // this.members.push(cloneDeep(item_demo));
        },
        // 排序
        async handleSort() {
            try {
                await sortMember(this.raid_id, this.order);
            } catch (e) {
                console.log(e);
            }
        },

        // UI表现杂项
        // ===============================
        // 是否为队长
        isLeader(val) {
            return this.leader && this.leader === val.name;
        },
        // 是否为阵眼
        isCore(member) {
            return member.is_core;
        },
        // 角色职能
        roleFunc(val) {
            switch (val) {
                case "内攻":
                    return "内";
                case "外攻":
                    return "外";
                case "坦克":
                    return "坦";
                case "治疗":
                    return "奶";
                default:
                    return "";
            }
        },
        isGroupStart: function (i, row) {
            if ((i + row) % row == 0) {
                return (i + row) / row;
            } else {
                0;
            }
        },
        showMemberName: function (name) {
            if (this.linkVisible || !name) {
                return name;
            } else {
                return name.slice(0, 1) + "******";
            }
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
                            label: "替补",
                            customClass: "item",
                            onClick: () => this.pending(this.selectedMember, this.selectedIndex),
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
        // 设为阵眼
        setCore() {
            this.selectedMember.is_core = !this.selectedMember.is_core;
            this.members[this.selectedIndex] = this.selectedMember;
            this.selectedMember = null;
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
                this.members[this.selectedIndex] = this.selectedMember;
                this.handleTransform(this.selectedMember, this.selectedIndex, "remark");
                this.selectedMember = null;
            });
        },

        // 快速设置单项
        // ===============================
        // 设置心法
        changeMemberXf(member, targetXf) {
            member.mount = String(targetXf);
        },
        // 设置名字
        handleChangeName(member, i) {
            if (!this.canManage) return;
            this.tempMember = cloneDeep(member);
            this.selectedIndex = i;
            this.editing[i] = true;
        },
        handleChangeNameBlur(i) {
            this.editing[i] = false;
            this.roles = cloneDeep(this.allRoles);
        },
        // 下拉选择
        handleMemberChange(val) {
            if (!this.tempMember.name) return;
            this.tempMember.role_id = 0;
            const [member] = this.roles ? this.roles.filter((role) => role.ID === val) : [];

            if (member) {
                this.tempMember.name = member.name;
                this.tempMember.role_id = member.ID;
                this.tempMember.mount = String(school_mount[member.mount][0]);
            }

            this.members[this.selectedIndex] = this.tempMember;

            this.$nextTick(() => {
                this.tempMember = item_demo;
                this.$refs[`name${this.selectedIndex}`][0].blur();
                this.editing[this.selectedIndex] = false;
                this.selectedIndex = undefined;
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
                this.roles = cloneDeep(this.allRoles);
            }
        },
        spanBlur() {
            this.editing = {};
        },

        // 发布|保存
        // ===============================
        handleSave(member) {
            const action = this.action;
            if (action === "add") {
                const index = this.members.findIndex((item) => item.is_virtual);
                if (index > -1) {
                    this.members[index] = member;
                } else {
                    const validIndex = this.members.findIndex((item) => item.is_valid === 0);
                    if (validIndex) {
                        this.members[validIndex] = member;
                    }
                }
            }
            if (!action) {
                this.members[this.selectedIndex] = member;
            }
            this.$emit("update");
            this.selectedMember = null;
            this.visible = false;
        },
    },
    model: {
        prop: "data",
        event: "updateMembers",
    },
    watch: {
        data: {
            immediate: true,
            deep: true,
            handler(val) {
                if (val) {
                    const _members = Array.from({ length: this.col * this.row }, (v, i) => {
                        return {
                            ...item_demo,
                            order: i + 1,
                        };
                    }).map((item, index) => {
                        const member = val[index];
                        return member ? member : item;
                    });
                    this.members = _members;
                }
            },
        },
        members: {
            immediate: true,
            deep: true,
            handler(val) {
                if (val && val.length) {
                    const _members = val
                        .map((item, index) => {
                            return {
                                ...item,
                                order: index + 1,
                            };
                        })
                        .filter((item) => item.id)
                        .map((item) => {
                            return {
                                id: item.id,
                                order: item.order,
                            };
                        });
                    this.order = _members;
                }
            },
        },
        order: {
            deep: true,
            handler() {
                // 与初始排序不同则进行排序提交
                if (!isEqual(this.order, this.memberOrder) && this.canManage) {
                    this.handleSort();
                }
            },
        },
        col: function () {
            this.$forceUpdate();
        },
        allRoles: {
            deep: true,
            handler(val) {
                if (val) {
                    this.roles = cloneDeep(val);
                }
            },
        },
    },
};
</script>
