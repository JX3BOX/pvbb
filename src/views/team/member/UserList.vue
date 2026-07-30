<template>
    <div class="m-member-users" v-loading="loading">
        <header class="m-member-panel-header">
            <div>
                <h2>正式团员</h2>
            </div>
            <span class="u-member-total">{{ total }} 名成员</span>
        </header>

        <div class="m-member-list-users" v-if="data && data.length">
            <div class="m-member-card-grid">
                <div class="u-list-item" v-for="(item, index) in data" :key="item.uid || index">
                    <MemberItem :item="item" :id="id" @remove="onRemoveAccount" />
                </div>
            </div>
            <el-pagination
                class="m-archive-pages"
                background
                layout="prev, pager, next, jumper"
                :hide-on-single-page="true"
                :page-size="per"
                :total="total"
                v-model:current-page="page"
                @current-change="changePage"
            ></el-pagination>
        </div>
        <div v-else-if="!loading" class="m-member-empty">
            <span class="u-empty-icon" aria-hidden="true">
                <el-icon><UserFilled /></el-icon>
            </span>
            <h3>暂无正式团员</h3>
            <p>通过加入申请的成员会显示在这里。</p>
        </div>
    </div>
</template>

<script>
import { getMyTeamUsers } from "@/service/team/member.js";
import { UserFilled } from "@element-plus/icons-vue";
import MemberItem from "./MemberItem.vue";
export default {
    name: "UserList",
    props: ["id"],
    components: {
        MemberItem,
        UserFilled,
    },
    data: function () {
        return {
            data: [],
            per: 20,
            page: 1,
            total: 0,
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
        changePage: function () {
            window.scrollTo(0, 0);
        },
        init: function () {
            this.loadData();
        },
        onRemoveAccount: function (uid) {
            this.data = this.data.filter((item) => item.uid != uid);
            this.total = Math.max(0, this.total - 1);
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
    created: function () {
        this.init();
    },
};
</script>
