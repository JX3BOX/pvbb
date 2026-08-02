<template>
    <div class="m-raid-tobebox">
        <h5 class="u-title">
            <span>
                <i class="el-icon-news"></i>
                {{ header || $t("team.raid.board.candidates") }}
                <span class="u-count">({{ count }})</span>
            </span>
        </h5>
        <div class="m-raid-corebox" v-if="data && data.length">
            <ul class="m-raid-members">
                <div
                    class="u-member"
                    v-for="(member, i) in data"
                    :key="i"
                    @contextmenu.prevent="(event) => handleContextMenuOpen(event, { member, i })"
                >
                    <!-- <el-tooltip class="item" effect="dark" :content="" placement="top-start"> -->
                    <el-popover
                        placement="top-start"
                        width="200"
                        trigger="hover"
                        popper-class="m-raid-members__tobe-item"
                    >
                        <!-- POP -->
                        <member-pop :member="member" />

                        <!-- 格子 -->
                        <template #reference>
                            <span class="u-member-primary">
                                <img
                                    v-if="member['mount']"
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
                                    <span v-else
                                        class="u-member-name"
                                        @click="handleCopy(showMemberName(member['name']))"
                                        >{{ showMemberName(member["name"]) }}</span
                                    >
                                </span>
                                <span class="u-member-remark" v-if="member['remark']">[{{ member["remark"] }}]</span>
                            </span>
                        </template>
                        <!-- </el-tooltip> -->
                    </el-popover>
                    <span class="u-member-op" v-if="canManage">
                        <el-tooltip class="item" effect="dark" :content="$t('team.raid.member.toNormal')" placement="top-start">
                            <span>
                                <el-popconfirm :title="$t('team.raid.member.toNormalConfirm')" @confirm="pass(member, i)">
                                    <template #reference>
                                        <i class="u-member-reset el-icon-check"></i>
                                    </template>
                                </el-popconfirm>
                            </span>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" :content="$t('team.raid.member.toSubstitute')" placement="top-start">
                            <span>
                                <el-popconfirm :title="$t('team.raid.member.toSubstituteConfirm')" @confirm="pending(member, i)">
                                    <template #reference>
                                        <i class="u-member-reset el-icon-first-aid-kit"></i>
                                    </template>
                                </el-popconfirm>
                            </span>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" :content="$t('team.raid.member.reject')" placement="top-start">
                            <span>
                                <el-popconfirm :title="$t('team.member.rejectConfirm')" @confirm="reject(member, i)">
                                    <template #reference>
                                        <i class="u-member-delete el-icon-close"></i>
                                    </template>
                                </el-popconfirm>
                            </span>
                        </el-tooltip>
                    </span>
                </div>
            </ul>
        </div>
        <div class="m-raid-null" v-else><i class="el-icon-warning-outline"></i> {{ $t("team.raid.board.empty") }}</div>
        <raid-role-dialog
            v-model="roleDialogVisible"
            :role-id="roleDialogMember && roleDialogMember.role_id"
            :member="roleDialogMember || {}"
        />
    </div>
</template>

<script>
import { rejectMember, covertTobe2Sub, covertTobe2Normal } from "@/service/team/raid.js";
import xf_map from "@jx3box/jx3box-data/data/xf/xf.json";
import ContextMenu from "@imengyu/vue3-context-menu";
import MemberPop from "./MemberPop.vue";
import RaidRoleDialog from "@/components/team/raid/RaidRoleDialog.vue";
import { showMountIcon, showMountName } from "@/utils/filters";
import bus from "@/utils/bus";
export default {
    name: "RaidTobe",
    props: ["id", "teamId", "isForceMatch", "canAdd", "canReplace"],
    emits: ["pass", "pending"],
    components: {
        RaidRoleDialog,
        "member-pop": MemberPop,
    },
    data() {
        return {
            // 数据列表
            data: [],

            // 右键菜单
            selectedMember: null,
            selectedIndex: undefined,
            roleDialogVisible: false,
            roleDialogMember: null,

            // 预设、杂项
            xf_map,
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
        count() {
            return this.data?.length;
        },
        members() {
            return this.$store.state.tobeMembers;
        },
        normalMembers() {
            return this.$store.state.normalMembers;
        },
    },
    watch: {
        members: {
            deep: true,
            immediate: true,
            handler(val) {
                this.data = val;
            },
        },
    },
    mounted() {
        bus.on("updateTobe", this.handleUpdateTobe);
    },
    beforeUnmount() {
        bus.off("updateTobe", this.handleUpdateTobe);
    },
    methods: {
        openRoleDialog(member) {
            this.roleDialogMember = member;
            this.roleDialogVisible = true;
        },
        handleUpdateTobe(data) {
            this.data = [...this.data, data];
        },
        // 操作
        // ===============================
        // 转为正式队员
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
                            await covertTobe2Normal(this.raid_id, apply_id, replaceId);
                            this.data.splice(i, 1);
                            this.$emit("pass", { member, from: "tobe", isReplace: true });
                        } else {
                            await covertTobe2Normal(this.raid_id, apply_id);
                            this.data.splice(i, 1);
                            this.$emit("pass", { member, from: "tobe", isReplace: false });
                        }
                    } else {
                        await covertTobe2Normal(this.raid_id, apply_id);
                        this.data.splice(i, 1);
                        this.$emit("pass", { member, from: "tobe" });
                    }
                } else {
                    this.$notify({
                        type: "warning",
                        title: this.$t("team.raid.common.tip"),
                        message: this.$t("team.raid.member.teamFull"),
                    });
                }
            } catch (e) {
                console.log("covertTobe2Normal", e);
            }
        },
        // 设为替补
        pending(member, i) {
            covertTobe2Sub(this.raid_id, member?.id).then(() => {
                this.$emit("pending", member);
                this.data.splice(i, 1);
            });
        },
        // 删除候选（拒绝申请）
        reject(member, i) {
            rejectMember(this.raid_id, member?.id).then(() => {
                this.$notify({
                    title: this.$t("team.raid.member.operationSuccess"),
                    message: this.$t("team.raid.member.rejected", { name: member?.name || "" }),
                    type: "success",
                });
                this.data.splice(i, 1);
            });
        },
        // 复制昵称
        handleCopy(text) {
            this.$copyText(text)
                .then(() => {
                    this.onCopy(text);
                })
                .catch(() => {
                    this.onError();
                });
        },
        onCopy(text) {
            this.$notify({
                title: this.$t("team.raid.member.copied"),
                message: this.$t("team.raid.member.copiedText", { text }),
                type: "success",
            });
        },
        onError() {
            this.$notify.error({
                title: this.$t("team.raid.member.copyFailed"),
                message: this.$t("team.raid.member.copyManually"),
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
                            label: this.$t("team.raid.member.approve"),
                            customClass: "item",
                            onClick: () => this.pass(this.selectedMember, this.selectedIndex),
                        },
                        {
                            label: this.$t("team.raid.common.pending"),
                            customClass: "item",
                            onClick: () => this.pending(this.selectedMember, this.selectedIndex),
                        },
                        {
                            label: this.$t("team.raid.member.reject"),
                            customClass: "item",
                            onClick: () => this.reject(this.selectedMember, this.selectedIndex),
                        },
                    ],
                });
            }
        },

        // 过滤设置
        // ===============================
        showMemberName(name) {
            if (this.linkVisible) {
                return name;
            } else {
                return name.slice(0, 1) + "******";
            }
        },
        showMountIcon,
        showMountName,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/tobe.less";
</style>
