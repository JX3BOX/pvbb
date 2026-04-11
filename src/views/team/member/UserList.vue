<template>
    <div class="m-member-users" v-loading="loading">
        <el-alert class="u-admin-pop" type="info" show-icon v-if="!isPRO">
            <slot name="title"
                >管理员设置仅<a href="/vip/premium/?from=team_member" target="_blank">专业版账号</a
                >可用，最多只能添加20名管理员</slot
            >
        </el-alert>
        <div class="m-member-list-users m-team-rolelist" v-if="data && data.length">
            <div class="u-list">
                <div class="u-list-item" v-for="(item, i) in data" :key="i">
                    <MemberItem :item="item" :id="id" @remove="onRemoveAccount" />
                </div>
            </div>
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
import { authorLink, showAvatar } from "@jx3box/jx3box-common/js/utils";
import { getMyTeamUsers } from "@/service/team/member.js";
import { addAdmin } from "@/service/team/admin.js";
import User from "@jx3box/jx3box-common/js/user.js";
import MemberItem from "./MemberItem.vue";
export default {
    name: "UserList",
    props: ["id"],
    components: {
        MemberItem,
    },
    data: function () {
        return {
            data: [],
            per: 20,
            page: 1,
            total: 1,
            loading: false,
            isPRO: false,
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
    methods: {
        loadData: function () {
            this.loading = true;
            getMyTeamUsers(this.team_id, this.params)
                .then((res) => {
                    this.data = res.data.data.list || [];
                    this.total = res.data.data.page.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        checkIsPro: function () {
            User.isPRO().then((data) => {
                this.isPRO = data;
            });
        },
        setAdmin: function (team_id, user_id, item) {
            addAdmin(team_id, user_id).then((res) => {
                this.$notify({
                    title: "添加成功",
                    message: "请在权限管理中添加相应权限",
                    type: "success",
                });
                item.isAdmin = true;
            });
        },
        changePage: function () {
            window.scrollTo(0, 0);
        },
        init: function () {
            this.loadData();
            this.checkIsPro();
        },
        onRemoveAccount: function (uid) {
            this.data = this.data.filter((item) => item.uid != uid);
        },
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
    filters: {
        showAvatar: function (val) {
            return showAvatar(val, 68);
        },
        authorLink,
    },
    created: function () {
        this.init();
    },
    mounted: function () {},
};
</script>

<style lang="less">
@import "@/assets/css/team/member/list_member.less";
</style>
