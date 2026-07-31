<template>
    <div class="v-member-view">
        <section class="m-public-member-section is-leaders" aria-labelledby="team-leaders-title" v-loading="leadersLoading">
            <header class="m-public-member-heading">
                <span class="u-section-icon is-leader" aria-hidden="true">
                    <el-icon><UserFilled /></el-icon>
                </span>
                <h2 id="team-leaders-title">团队管理员</h2>
                <span class="u-section-count">{{ leaders.length }} 人</span>
            </header>

            <div v-if="leaders.length" class="m-public-member-grid is-user-grid">
                <a
                    v-for="(item, i) in leaders"
                    :key="item.uid || i"
                    class="u-public-member-card is-user"
                    target="_blank"
                    rel="noopener noreferrer"
                    :href="authorLink(item.uid)"
                    :title="leaderName(item)"
                >
                    <img
                        class="u-public-member-avatar"
                        :src="showUserAvatar(item.user_avatar)"
                        :alt="leaderName(item)"
                        loading="lazy"
                    />
                    <span class="u-public-member-name">{{ leaderName(item) }}</span>
                </a>
            </div>
            <div v-else-if="leadersError" class="m-public-member-state is-error">
                <el-icon><WarningFilled /></el-icon>
                <span>团队管理成员加载失败</span>
            </div>
            <div v-else-if="!leadersLoading" class="m-public-member-state">
                <el-icon><UserFilled /></el-icon>
                <span>暂无公开的管理成员</span>
            </div>
        </section>

        <section class="m-public-member-section is-birthday" aria-labelledby="team-birthday-title" v-loading="birthLoading">
            <header class="m-public-member-heading">
                <span class="u-section-icon is-birthday" aria-hidden="true">
                    <el-icon><Present /></el-icon>
                </span>
                <h2 id="team-birthday-title">今日寿星</h2>
                <span v-if="hasRight" class="u-section-count">{{ births.length }} 人</span>
            </header>

            <template v-if="hasRight">
                <div v-if="births.length" class="m-public-member-grid is-user-grid">
                    <a
                        v-for="item in births"
                        :key="item.id"
                        class="u-public-member-card is-user is-birthday"
                        target="_blank"
                        rel="noopener noreferrer"
                        :href="authorLink(item.id)"
                        :title="birthdayName(item)"
                    >
                        <img
                            class="u-public-member-avatar"
                            :src="showUserAvatar(item.avatar)"
                            :alt="birthdayName(item)"
                            loading="lazy"
                        />
                        <span class="u-public-member-name">{{ birthdayName(item) }}</span>
                        <el-icon class="u-birthday-mark" aria-hidden="true"><Present /></el-icon>
                    </a>
                </div>
                <div v-else-if="birthError" class="m-public-member-state is-error">
                    <el-icon><WarningFilled /></el-icon>
                    <span>寿星信息加载失败</span>
                </div>
                <div v-else-if="!birthLoading" class="m-public-member-state is-birthday-empty">
                    <el-icon><Present /></el-icon>
                    <span>今天暂无寿星，祝大家江湖顺意</span>
                </div>
            </template>
            <div v-else class="m-public-member-state is-locked">
                <el-icon><Lock /></el-icon>
                <span>当前没有查看权限</span>
            </div>
        </section>

        <section class="m-public-member-section is-members" aria-labelledby="team-members-title" v-loading="loading">
            <header class="m-public-member-heading">
                <span class="u-section-icon is-member" aria-hidden="true">
                    <el-icon><User /></el-icon>
                </span>
                <h2 id="team-members-title">团队成员</h2>
                <span v-if="hasRight" class="u-section-count">{{ total }} 个角色</span>
            </header>

            <template v-if="hasRight">
                <div v-if="data.length" class="m-public-member-grid is-role-grid">
                    <router-link
                        v-for="(item, i) in data"
                        :key="item.roles?.ID || i"
                        class="u-public-member-card is-role"
                        target="_blank"
                        :to="'/role/' + item.roles.ID"
                        :title="roleName(item)"
                    >
                        <el-avatar
                            class="u-public-member-avatar"
                            shape="square"
                            :src="showRoleAvatar(item.roles.mount, item.roles.body_type)"
                        />
                        <span class="u-public-member-name">{{ roleName(item) }}</span>
                    </router-link>
                </div>
                <div v-else-if="memberError" class="m-public-member-state is-error">
                    <el-icon><WarningFilled /></el-icon>
                    <span>团队成员加载失败</span>
                </div>
                <div v-else-if="!loading" class="m-public-member-state">
                    <el-icon><User /></el-icon>
                    <span>暂无公开的团队成员</span>
                </div>
                <el-pagination
                    class="m-team-member-pages"
                    background
                    :page-size="per"
                    :hide-on-single-page="true"
                    v-model:current-page="page"
                    layout="total, prev, pager, next, jumper"
                    :total="total"
                />
            </template>
            <div v-else class="m-public-member-state is-locked">
                <el-icon><Lock /></el-icon>
                <span>当前没有查看权限</span>
            </div>
        </section>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { authorLink, showAvatar } from "@jx3box/jx3box-common/js/utils";
import { getLeaders } from "@/service/team/admin.js";
import { getTeamMembers, getTeamBirthDay } from "@/service/team/member.js";
import { Lock, Present, User, UserFilled, WarningFilled } from "@element-plus/icons-vue";

export default {
    name: "ViewMember",
    props: ["v", "super", "authority"],
    data: function () {
        return {
            data: [],
            leaders: [],
            page: 1,
            total: 0,
            per: 100,
            loading: false,
            leadersLoading: false,
            birthLoading: false,
            memberError: false,
            leadersError: false,
            birthError: false,
            births: [],
        };
    },
    computed: {
        team_id: function () {
            return ~~this.$route.params.id;
        },
        params: function () {
            return {
                pageSize: this.per,
                pageIndex: this.page,
            };
        },
        hasRight: function () {
            return !this.v || ~~this.authority.authority >= ~~this.v;
        },
    },
    methods: {
        showRoleAvatar: function (mount, body_type) {
            return __imgPath + "image/roles/" + mount + "-" + body_type + ".png";
        },
        loadLeaders: function () {
            this.leadersLoading = true;
            this.leadersError = false;
            return getLeaders(this.team_id)
                .then((res) => {
                    this.leaders = res?.data?.data?.list || [];
                })
                .catch(() => {
                    this.leadersError = true;
                })
                .finally(() => {
                    this.leadersLoading = false;
                });
        },
        loadMembers: function () {
            this.loading = true;
            this.memberError = false;
            return getTeamMembers(this.team_id, this.params)
                .then((res) => {
                    this.data = res?.data?.data?.list || [];
                    this.total = res?.data?.data?.page?.total || 0;
                })
                .catch(() => {
                    this.memberError = true;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadBirth: function () {
            this.birthLoading = true;
            this.birthError = false;
            return getTeamBirthDay(this.team_id)
                .then((res) => {
                    this.births = res?.data?.data?.list || [];
                })
                .catch(() => {
                    this.birthError = true;
                })
                .finally(() => {
                    this.birthLoading = false;
                });
        },
        init: function () {
            this.loadLeaders();
            if (this.hasRight) {
                this.loadMembers();
                this.loadBirth();
            }
        },
        leaderName: function (item) {
            return item?.display_name || "未知用户";
        },
        birthdayName: function (item) {
            return item?.displayName || "未知用户";
        },
        roleName: function (item) {
            return item?.roles?.name || "未知角色";
        },
        authorLink,
        showUserAvatar: function (val) {
            return showAvatar(val, 240);
        },
    },
    watch: {
        params: {
            deep: true,
            handler: function () {
                this.hasRight && this.loadMembers();
            },
        },
    },
    mounted: function () {
        this.init();
    },
    components: {
        Lock,
        Present,
        User,
        UserFilled,
        WarningFilled,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/member/view_member.less";
</style>
