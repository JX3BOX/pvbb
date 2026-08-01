<template>
    <div class="m-member-users">
        <header class="m-member-panel-header">
            <div>
                <h2>{{ $t("team.member.officialMembers") }}</h2>
            </div>
            <el-skeleton-item
                v-if="loading"
                variant="text"
                class="u-member-total-skeleton"
                aria-hidden="true"
            />
            <span v-else class="u-member-total">{{ $t("team.member.memberCount", { count: total }) }}</span>
        </header>

        <div v-if="loading" class="m-member-card-grid m-member-skeleton-grid" aria-hidden="true">
            <el-skeleton v-for="index in per" :key="index" animated class="m-member-skeleton-card">
                <template #template>
                    <div class="u-member-skeleton">
                        <el-skeleton-item variant="circle" class="u-skeleton-avatar" />
                        <div class="u-skeleton-copy">
                            <el-skeleton-item variant="text" class="u-skeleton-name" />
                            <el-skeleton-item variant="text" class="u-skeleton-uid" />
                        </div>
                        <el-skeleton-item variant="text" class="u-skeleton-role" />
                        <el-skeleton-item variant="circle" class="u-skeleton-action" />
                    </div>
                </template>
            </el-skeleton>
        </div>
        <div class="m-member-list-users" v-else-if="data && data.length">
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
        <div v-else class="m-member-empty">
            <span class="u-empty-icon" aria-hidden="true">
                <el-icon><UserFilled /></el-icon>
            </span>
            <h3>{{ $t("team.member.noMembers") }}</h3>
            <p>{{ $t("team.member.noMembersHint") }}</p>
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
