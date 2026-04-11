<template>
    <div class="m-member-roles" v-loading="loading">
        <el-input class="m-member-role-search" placeholder="请输入角色名或备注" v-model="search">
            <template #prepend><i class="el-icon-search"></i> 搜索</template>
            <template #append><el-button icon="Position"></el-button></template>
        </el-input>
        <div class="m-member-list-roles m-team-rolelist" v-if="data && data.length">
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
                        <span class="u-note" v-if="item.relation.role_remark">({{ item.relation.role_remark }})</span>
                        <span class="u-addnote" @click="noteRole(item)">
                            <el-tooltip class="item" effect="dark" content="设置备注" placement="top">
                                <i class="el-icon-edit-outline"></i>
                            </el-tooltip>
                        </span>
                        <el-rate
                            class="u-star"
                            v-model.number="item.relation.star"
                            @change="starRole(item.relation.team_id, item.relation.role_id, item.relation.star)"
                        ></el-rate>
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
                            <i class="el-icon-user"></i>
                            所属用户 :
                            <a class="u-user-name" target="_blank" :href="authorLink(item.relation.uid)">{{
                                item.user.display_name
                            }}</a>
                        </span>
                        <span class="u-time">
                            <i class="el-icon-time"></i>
                            加入时间 :
                            {{ showTime(item.relation.created_at) }}
                        </span>
                    </div>
                    <div class="u-op">
                        <el-button
                            class="u-btn u-reject"
                            type="info"
                            size="small"
                            plain
                            @click="removeRole(item.relation.team_id, item.relation.role_id, i)"
                            icon="Delete"
                            >移除</el-button
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
        <el-dialog title="设置备注" v-model="noteVisible" width="30%" class="m-team-note-dialog">
            <div>
                <el-input v-model="note" placeholder="请输入内容" :maxlength="20" :show-word-limit="true"></el-input>
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="noteVisible = false">取 消</el-button>
                    <el-button type="primary" @click="confirmNote">确 定</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script>
import { authorLink } from "@jx3box/jx3box-common/js/utils";
import RoleAvatar from "@/components/team/widget/RoleAvatar.vue";
import { getMyTeamRoles, deleteRole, remarkRole, starRole } from "@/service/team/member.js";
import { showBodyType, showSchoolIcon, showSchoolName, showTime } from "@/utils/filters";
export default {
    name: "RoleList",
    props: ["id"],
    components: {},
    data: function () {
        return {
            data: [],
            per: 10,
            page: 1,
            total: 1,
            loading: false,
            search: "",

            // 备注
            noteVisible: false,
            currentItem: "",
            note: "",
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
                search: this.search,
            };
        },
    },
    methods: {
        loadData: function () {
            this.loading = true;
            getMyTeamRoles(this.team_id, this.params)
                .then((res) => {
                    this.data = res.data.data.list || [];
                    this.total = res.data.data.page.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        removeRole: function (team_id, role_id, i) {
            // 移除角色
            this.$alert("确定移除该团员吗？", "消息", {
                confirmButtonText: "确定",
                callback: (action) => {
                    if (action == "confirm") {
                        deleteRole(team_id, role_id).then((res) => {
                            this.$notify({
                                title: "删除成功",
                                message: "角色删除成功",
                                type: "success",
                            });
                            this.data.splice(i, 1);
                        });
                    }
                },
            });
        },
        noteRole: function (item) {
            // 给角色添加备注
            this.noteVisible = true;
            this.currentItem = item;
        },
        confirmNote: function () {
            remarkRole(this.currentItem.relation.team_id, this.currentItem.relation.role_id, this.note).then(() => {
                this.noteVisible = false;
                this.currentItem.relation.role_remark = this.note;
                this.note = "";
                this.$notify({
                    title: "备注成功",
                    message: "角色备注添加成功",
                    type: "success",
                });
            });
        },
        starRole: function (team_id, role_id, star) {
            starRole(team_id, role_id, star).then((res) => {
                this.$notify({
                    title: "标星成功",
                    message: "角色标星添加成功",
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
        authorLink,
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
    mounted: function () {},
    components: {
        RoleAvatar,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/member/list_member.less";
</style>
