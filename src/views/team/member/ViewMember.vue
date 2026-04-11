<template>
    <div class="v-member-view">
        <el-divider content-position="left"> <i class="el-icon-star-off"></i> 团队管理 </el-divider>
        <div class="m-member-leaders">
            <div class="u-list" v-if="leaders && leaders.length">
                <div class="u-item-wrapper" v-for="(item, i) in leaders" :key="i">
                    <a class="u-item" target="_blank" :href="authorLink(item.uid)">
                        <el-tooltip class="item" effect="dark" :content="item.display_name" placement="top">
                            <div>
                                <img class="u-item-avatar" :src="showUserAvatar(item.user_avatar)" />
                                <span class="u-item-name">{{ item.display_name.slice(0, 6) }}</span>
                            </div>
                        </el-tooltip>
                    </a>
                </div>
            </div>
        </div>

        <el-divider content-position="left"> <i class="el-icon-present"></i> 今日寿星 </el-divider>
        <div class="m-member-leaders">
            <template v-if="hasRight">
                <div class="u-list" v-if="births && births.length">
                    <div class="u-item-wrapper" v-for="item in births" :key="item.id">
                        <a class="u-item" target="_blank" :href="authorLink(item.id)">
                            <el-tooltip class="item" effect="dark" :content="item.displayName" placement="top">
                                <div>
                                    <img class="u-item-avatar" :src="showUserAvatar(item.avatar)" />
                                    <span class="u-item-name">{{ item.displayName.slice(0, 6) }}</span>
                                </div>
                            </el-tooltip>
                        </a>
                    </div>
                </div>
                <div class="u-lock" v-else><i class="el-icon-warning-outline"></i>今日无寿星</div>
            </template>
            <template v-else>
                <el-alert class="u-tip" title="没有查看权限" type="warning" show-icon></el-alert>
            </template>
        </div>

        <el-divider content-position="left"> <i class="el-icon-user"></i> 团队成员 </el-divider>
        <div class="m-member-teammates" v-loading="loading">
            <template v-if="hasRight">
                <div class="u-list" v-if="data && data.length">
                    <div class="u-item-wrapper" v-for="(item, i) in data" :key="i">
                        <router-link class="u-item" target="_blank" :to="'/role/' + item.roles.ID">
                            <el-tooltip class="item" effect="dark" :content="item.roles.name" placement="top">
                                <div>
                                    <el-avatar
                                        class="u-item-avatar"
                                        :src="showRoleAvatar(item.roles.mount, item.roles.body_type)"
                                    ></el-avatar>
                                    <span class="u-item-name">{{
                                        item.roles.name && item.roles.name.slice(0, 6)
                                    }}</span>
                                </div>
                            </el-tooltip>
                        </router-link>
                    </div>
                </div>
                <el-pagination
                    class="m-team-member-pages"
                    background
                    :page-size="per"
                    :hide-on-single-page="true"
                    v-model:current-page="page"
                    layout="total, prev, pager, next, jumper"
                    :total="total"
                ></el-pagination>
            </template>
            <template v-else>
                <el-alert class="u-tip" title="没有查看权限" type="warning" show-icon></el-alert>
            </template>
        </div>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
import { authorLink, showAvatar } from "@jx3box/jx3box-common/js/utils";
import { getLeaders } from "@/service/team/admin.js";
import { getTeamMembers, getTeamBirthDay } from "@/service/team/member.js";
export default {
    name: "ViewMember",
    props: ["v", "super", "authority"],
    data: function () {
        return {
            data: [],
            leaders: [],
            page: 1,
            total: 1,
            per: 100,
            loading: false,
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
            getLeaders(this.team_id).then((res) => {
                this.leaders = res.data.data.list;
            });
        },
        loadMembers: function () {
            this.loading = true;
            getTeamMembers(this.team_id, this.params)
                .then((res) => {
                    this.data = res.data.data.list;
                    this.total = res.data.data.page.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        loadBirth: function () {
            getTeamBirthDay(this.team_id).then((res) => {
                this.births = res?.data?.data?.list || [];
            });
        },
        init: function () {
            this.loadLeaders();
            if (this.hasRight) {
                this.loadMembers();
                this.loadBirth();
            }
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
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/member/view_member.less";
</style>
