<template>
    <div class="m-dkp-list" v-loading="loading">
        <!-- <el-button size="small" icon="el-icon-s-operation" type="primary" class="u-batch-btn">批量调整</el-button> -->
        <el-table
            :data="members"
            tooltip-effect="dark"
            class="m-dkp-table"
            size="small"
            ref="dkpTable"
            :default-sort="defaultSort"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" width="70" v-if="!readOnly"> </el-table-column>
            <el-table-column label="人员">
                <template #default="scope">
                    <a :href="authorLink(scope.row.uid)" target="_blank">
                        <img :src="renderAvatar(scope.row.user_info)" class="u-user-avatar" />
                        <span class="u-user-name">
                            {{ scope.row.user_info && scope.row.user_info.display_name }}
                        </span>
                    </a>
                </template>
            </el-table-column>
            <el-table-column label="角色">
                <template #default="scope">
                    <el-popover v-if="scope.row.roles.length" placement="right" width="200" trigger="hover">
                        <character
                            v-for="(role, roleIndex) of scope.row.roles"
                            :key="roleIndex"
                            :xf="role.roleInfo.mount"
                            :name="role.roleInfo.name"
                        ></character>
                        <template #reference>
                            <span class="u-role-list">
                                <router-link
                                    v-for="(role, roleIndex) of scope.row.roles"
                                    :to="'/role/' + role.relation.role_id"
                                    target="_blank"
                                    :key="roleIndex"
                                    :title="role.roleInfo.name"
                                >
                                    <img class="u-character-logo" :src="showSchoolIcon(role.roleInfo.mount)" />
                                </router-link>
                            </span>
                        </template>
                    </el-popover>
                    <span v-else>没有绑定角色</span>
                </template>
            </el-table-column>
            <el-table-column prop="total" label="历史累计" sortable> </el-table-column>
            <el-table-column prop="score" label="当前分值" sortable sort-by="score"> </el-table-column>
            <el-table-column label="操作" v-if="!readOnly">
                <template #default="scope">
                    <el-button size="small" @click="handleEdit(scope.row)" type="primary" icon="Sort">调整</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- <div class="m-dkp-list-footer" v-if="!readOnly">
            <el-button size="small" icon="el-icon-s-operation" type="primary" class="u-batch-btn" v-if="members && members.length">批量调整</el-button>
        </div> -->
        <dkp-dialog v-model="showDialog" :rows="selectedRows" :org="org" v-if="!readOnly" @updateRows="updateRows" />
    </div>
</template>

<script>
import { getTeamDkpList } from "@/service/team/dkp.js";
import character from "@/components/team/dkp/Character.vue";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import dkp_dialog from "@/components/team/dkp/dkp_dialog.vue";
import { showSchoolIcon, authorLink } from "@/utils/filters";
export default {
    name: "dkpList",
    components: {
        character,
        "dkp-dialog": dkp_dialog,
    },
    props: {
        org: {
            type: Number,
            default: 0,
        },
        readOnly: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        list: [],
        defaultSort: {
            prop: "score",
            order: "descending",
        },
        loading: false,
        showDialog: false,

        selectedRows: [],
    }),
    computed: {
        teamMembers() {
            return this.$store.state.teamMembers;
        },
        members() {
            const _teamMembers = this.teamMembers?.filter((member) => member.uid) || [];
            _teamMembers.forEach((item) => {
                const member = this.list.find((user) => user.user_id === item.uid);

                item.score = member?.score || 0;
                item.total = member?.total || 0;
            });
            return _teamMembers;
        },
    },
    mounted() {
        this.init();
        this.$bus.$on("resetAllDkp", this.handleRestAllDkp);
    },
    beforeUnmount() {
        this.$bus.$off("resetAllDkp");
    },
    methods: {
        showBodyType,
        showSchoolIcon,
        authorLink,
        // ===================数据获取=====================
        // 加载当前团队的DKP成绩
        loadDkpList: function () {
            this.loading = true;
            getTeamDkpList(this.org)
                .then((res) => {
                    this.list = res.data.data;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        init: function () {
            this.loadDkpList();
        },

        // 头像渲染
        renderAvatar: function (userinfo) {
            return showAvatar(userinfo?.user_avatar || userinfo?.avatar);
        },

        // 调整弹窗
        handleEdit: function (row) {
            if (this.selectedRows.length < 2) {
                this.selectedRows = [row];
            }
            this.showDialog = true;
        },
        handleSelectionChange: function (selection) {
            this.selectedRows = selection;
        },

        // 更新rows
        updateRows: function ({ action, score }) {
            const rowIds = this.selectedRows.map((row) => row.uid);
            this.list.forEach((row) => {
                if (rowIds.includes(row.user_id)) {
                    const _score = action ? Number(row.score) - score : Number(row.score) + score;
                    const _total = action ? Number(row.total) : Number(row.total) + score;
                    row["score"] = _score;
                    row["total"] = _total;
                }
            });
            this.selectedRows = [];
            this.$refs.dkpTable.clearSelection();
        },
        // 重置所有dkp
        handleRestAllDkp: function () {
            this.list.forEach((item) => {
                item["score"] = 0;
                item["total"] = 0;
            });
        },
    },
    watch: {
        org(val) {
            if (val) {
                this.init();
            }
        },
    },
};
</script>

<style scoped lang="less">
@import "@/assets/css/team/dkp/dkp_list.less";
</style>
