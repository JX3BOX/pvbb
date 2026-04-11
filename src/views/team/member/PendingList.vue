<template>
    <div class="v-member-pending" v-loading="loading">
        <div class="m-team-rolelist" v-if="data && data.length">
            <ul class="u-list">
                <li class="u-item" v-for="(item, i) in data" :key="i">
                    <span class="u-pic">
                        <RoleAvatar :mount="item.role.mount" :body_type="item.role.body_type" />
                    </span>
                    <span class="u-title">
                        <router-link class="u-rolename" :to="'/role/' + item.role.ID" target="_blank">{{
                            item.role.name
                        }}</router-link>
                        <i class="u-status" v-if="!item.role.custom" title="已认证">
                            <img svg-inline src="@/assets/img/team/verify.svg" />
                        </i>
                    </span>
                    <span class="u-meta">
                        <span class="u-server">
                            <em>服务器</em>
                            {{ item.role.server }}
                        </span>
                        <span class="u-mount">
                            <em>门派</em>
                            <img class="u-icon" :src="showSchoolIcon(item.role.mount)" />
                            {{ showSchoolName(item.role.mount) }}
                        </span>
                        <span class="u-body">
                            <em>体型</em>
                            {{ showBodyType(item.role.body_type) }}
                        </span>
                    </span>
                    <div class="u-meta u-misc">
                        <span class="u-team">
                            <i class="el-icon-collection-tag"></i> 加入团队 :
                            <router-link class="u-team-name" target="_blank" :to="'/org/' + item.relation.team_id">
                                {{ item.team.name || "未知" }}
                            </router-link>
                        </span>
                        <span class="u-time">
                            <i class="el-icon-time"></i>
                            申请时间 : {{ showTime(item.relation.created_at) }}
                        </span>
                    </div>
                    <div class="u-op">
                        <el-button
                            class="u-btn u-pass"
                            type="success"
                            @click="checkRole(item.relation.team_id, item.relation.role_id, i)"
                            icon="Check"
                            >通过</el-button
                        >
                        <el-button
                            class="u-btn u-reject"
                            type="info"
                            plain
                            @click="rejectRole(item.relation.team_id, item.relation.role_id, i)"
                            icon="Close"
                            >拒绝</el-button
                        >
                    </div>
                </li>
            </ul>
            <el-pagination
                class="m-archive-pages justify-center!"
                background
                layout="total, prev, pager, next,jumper"
                :hide-on-single-page="true"
                :page-size="per"
                :total="total"
                v-model:current-page="page"
                @current-change="changePage"
            ></el-pagination>
        </div>
        <el-alert v-else class="m-archive-null" title="没有找到相关条目" type="info" center show-icon></el-alert>
    </div>
</template>

<script>
import { getThumbnail, authorLink } from "@jx3box/jx3box-common/js/utils";
import { getTeamPendingMembers, checkRole, deleteRole } from "@/service/team/member.js";
import RoleAvatar from "@/components/team/widget/RoleAvatar.vue";
import { showBodyType, showSchoolIcon, showSchoolName, showTime } from "@/utils/filters";
export default {
    name: "ListMemberPending",
    props: ["id"],
    data: function () {
        return {
            data: [],
            per: 10,
            page: 1,
            total: 1,
            loading: false,
        };
    },
    computed: {
        team_id: function () {
            return this.id;
        },
        params: function () {
            return {
                pageIndex: this.page,
                pageSize: this.per,
            };
        },
    },
    filters: {
        authorLink,
    },
    methods: {
        loadData: function () {
            this.loading = true;
            getTeamPendingMembers(this.team_id, this.params)
                .then((res) => {
                    this.data = res.data.data.list || [];
                    this.total = res.data.data.page.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        checkRole(team_id, role_id, i) {
            checkRole(team_id, role_id).then(() => {
                this.data.splice(i, 1);
                this.$notify({
                    title: "操作成功",
                    message: "批准该成员加入",
                    type: "success",
                });
            });
        },
        rejectRole(team_id, role_id, i) {
            deleteRole(team_id, role_id).then(() => {
                this.data.splice(i, 1);
                this.$notify({
                    title: "操作成功",
                    message: "拒绝该成员加入",
                    type: "success",
                });
            });
        },
        changePage: function () {
            window.scrollTo(0, 0);
        },
        init: function () {
            this.loadData();
        },
        showBodyType,
        showSchoolIcon,
        showSchoolName,
        showTime,
    },
    watch: {
        team_id: function () {
            this.loadData();
        },
        params: {
            deep: true,
            handler: function () {
                this.loadData();
            },
        },
    },
    created: function () {
        this.init();
    },
    components: {
        RoleAvatar,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/role/list_role.less";
</style>
