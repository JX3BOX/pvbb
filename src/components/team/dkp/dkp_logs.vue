<template>
    <div class="m-dkp-logs" v-loading="loading">
        <div class="m-dkp-logs-filters">
            <el-form :form="form" inline>
                <el-form-item label="人员" v-if="!user_id">
                    <el-select placeholder="选择人员进行筛选" v-model="form.user_id" size="small" clearable>
                        <el-option
                            v-for="(item, index) in teamMembers"
                            :key="index"
                            :label="item.user_info && item.user_info.display_name"
                            :value="item.uid"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="角色" v-if="!user_id">
                    <el-select
                        placeholder="请选择或输入团员名"
                        v-model="form.role_id"
                        filterable
                        remote
                        clearable
                        :remote-method="remoteMethod"
                        :loading="loading"
                        @clear="handleClear"
                        @blur="handleClear"
                        size="small"
                    >
                        <el-option v-for="(role, index) in roles" :key="index" :label="role.name" :value="role.ID">
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
                </el-form-item>
                <el-form-item label="角色" v-else>
                    <el-select placeholder="过滤角色" v-model="form.role_id" filterable clearable size="small">
                        <el-option
                            v-for="(role, index) in myRolesInThisTeam"
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
                </el-form-item>
                <el-form-item label="分数变动">
                    <el-radio-group v-model="form.action" size="small">
                        <el-radio-button label="all">全部</el-radio-button>
                        <el-radio-button label="plus">只看加分</el-radio-button>
                        <el-radio-button label="minus">只看扣分</el-radio-button>
                    </el-radio-group>
                </el-form-item>
            </el-form>
        </div>
        <div class="m-dkp-logs-container">
            <el-table class="m-dkp-logs-table" :data="logs" size="small">
                <el-table-column label="人员" v-if="!user_id">
                    <template #default="scope">
                        <a :href="authorLink(scope.row.user_id)" target="_blank">
                            <img
                                :src="showAvatar(scope.row.user_info && scope.row.user_info.avatar)"
                                class="u-user-avatar"
                            />
                            <span class="u-user-name">{{
                                scope.row.user_info && scope.row.user_info.display_name
                            }}</span>
                        </a>
                    </template>
                </el-table-column>
                <el-table-column label="角色">
                    <template #default="scope">
                        <router-link
                            v-if="scope.row.role_id && scope.row.role_info"
                            :to="'/role/' + scope.row.role_id"
                            target="_blank"
                            class="u-role"
                        >
                            <img class="u-character-logo" :src="showSchoolIcon(scope.row.role_info.mount)" />
                            <span>{{ scope.row.role_info.name }}</span>
                        </router-link>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column prop="drop" label="关联物品">
                    <template #default="scope" v-if="scope.row.drop_item_id">
                        <drop-item
                            :id="scope.row.drop_item_id"
                            :icon="scope.row.drop_item_icon"
                            :name="scope.row.drop_item_name"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="分数变动">
                    <template #default="scope">
                        <span
                            class="u-table-score"
                            :class="{ isNegative: scope.row.action, isUp: !scope.row.action && scope.row.score }"
                            >{{ scope.row.action ? "-" : "+" }}{{ scope.row.score }}</span
                        >
                    </template>
                </el-table-column>
                <el-table-column label="备注" prop="remark"></el-table-column>
                <el-table-column prop="created_at" label="时间">
                    <template #default="scope">{{ showTime(scope.row.created_at) }}</template>
                </el-table-column>
            </el-table>
        </div>
        <el-pagination
            class="m-dkp-logs-pagination"
            :page-size="pagination.per"
            background
            :hide-on-single-page="true"
            @current-change="changePage"
            v-model:current-page="pagination.page"
            layout="total, prev, pager, next, jumper"
            :total="pagination.total"
        ></el-pagination>
    </div>
</template>

<script>
import { getTeamDkpLogs } from "@/service/team/dkp.js";
import { getRoles } from "@/service/team/raid.js";
import { showTime } from "@jx3box/jx3box-common/js/moment";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import cloneDeep from "lodash/cloneDeep";
import DropItem from "./drop_item.vue";
import { showSchoolIcon, authorLink } from "@/utils/filters";
export default {
    name: "dkpLogs",
    components: {
        "drop-item": DropItem,
    },
    props: {
        org: {
            type: Number,
            default: 0,
        },
        user_id: {
            type: Number,
            default: 0,
        },
        myRoles: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            logs: [],
            form: {
                user_id: "",
                role_id: "",
                action: "all",
            },
            pagination: {
                page: 1,
                per: 20,
                total: 0,
            },
            loading: false,
            roles: [],
        };
    },
    mounted() {
        if (this.org) {
            this.loadTeamDkpLogs();
            this.$store.dispatch("loadAllRoles", { teamId: this.org });
            this.roles = this.allRoles;
        }
    },
    computed: {
        params() {
            return {
                user_id: this.form.user_id || this.user_id || "",
                role_id: this.form.role_id,
                action: this.form.action,
                page: this.pagination.page,
            };
        },
        teamMembers() {
            return this.$store.state.teamMembers;
        },
        allRoles() {
            return this.$store.state.roles;
        },
        myRolesInThisTeam: function () {
            let matched = this.myRoles.filter((item) => {
                return item.team_info.ID == this.org;
            });
            let list = matched[0]?.roles.map((item) => {
                return item.info;
            });
            return list;
        },
    },
    watch: {
        params: {
            deep: true,
            handler() {
                this.loadTeamDkpLogs();
            },
        },
        org: function (val) {
            this.pagination.page = 1;
            val && this.loadTeamDkpLogs();
        },
    },
    methods: {
        showTime,
        showAvatar,
        showSchoolIcon,
        authorLink,
        loadTeamDkpLogs: function () {
            this.loading = true;
            getTeamDkpLogs(this.org, this.params)
                .then((res) => {
                    this.logs = res.data.data.list.filter((item) => item.user_id);
                    this.pagination.page = res.data.data.page;
                    this.pagination.per = res.data.data.per;
                    this.pagination.total = res.data.data.total;

                    this.logs.forEach((log) => {
                        const member = this.teamMembers.find((item) => item.uid === log.user_id);

                        log.user_info = member?.user_info;
                        log.roles = member?.roles;
                    });
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        remoteMethod(query) {
            if (query !== "") {
                this.loading = true;
                getRoles(this.org, query).then((res) => {
                    this.roles = res.data.data.list;
                    this.loading = false;
                });
            } else {
                this.roles = cloneDeep(this.allRoles);
            }
        },
        // 清空选择
        handleClear() {
            this.roles = cloneDeep(this.allRoles);
        },
        changePage: function (val) {
            this.pagination.page = val;
            window.scrollTo(0, 0);
        },
    },
};
</script>
<style lang="less">
@import "@/assets/css/team/dkp/dkp_logs.less";
</style>
