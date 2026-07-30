<template>
    <div class="p-team">
        <CommonHeader></CommonHeader>
        <Breadcrumb
            name="团队平台"
            slug="team"
            root="/team"
            :publishEnable="false"
            :adminEnable="false"
            :feedbackEnable="true"
            :crumbEnable="true"
            v-if="!isCreateTeam && !isModernWorkspace"
        >
            <template #logo>
                <img :src="logo" />
            </template>
        </Breadcrumb>
        <LeftSidebar v-if="!isCreateTeam && !isModernWorkspace">
            <Nav />
        </LeftSidebar>
        <Main
            :withoutRight="true"
            :withoutLeft="isModernWorkspace"
            :withoutBread="isModernWorkspace"
            :class="{ 'is-team-modern-main': isModernWorkspace }"
            v-if="!isCreateTeam"
        >
            <div
                class="m-main"
                :class="{ 'is-team-modern-content': isModernWorkspace }"
                :style="{ minHeight: keepHeight }"
            >
                <div v-if="isModernWorkspace" class="m-team-modern-shell">
                    <div class="m-team-modern-shell__sidebar p-team-home">
                        <TeamHomeSidebar />
                    </div>
                    <div class="m-team-modern-shell__content">
                        <router-view v-if="isPublic || isLogin" />
                        <section v-else class="m-team-login-state" aria-labelledby="team-login-title">
                            <span class="u-team-login-icon" aria-hidden="true">
                                <el-icon><Lock /></el-icon>
                            </span>
                            <h1 id="team-login-title">登录后管理我的团队</h1>
                            <p>查看已加入的团队与关联角色，并管理角色在团队主页的展示状态。</p>
                            <div class="m-team-login-actions">
                                <a class="u-team-login-primary" :href="loginUrl">
                                    <span>登录后查看</span>
                                    <el-icon><ArrowRight /></el-icon>
                                </a>
                                <router-link class="u-team-login-secondary" to="/">先逛团队广场</router-link>
                            </div>
                        </section>
                    </div>
                </div>
                <router-view v-else-if="isPublic || isLogin" />
                <el-alert v-else title="请先登录" type="warning" description="使用本功能请先登录" show-icon />
            </div>
            <CommonFooter></CommonFooter>
        </Main>
        <template v-if="isCreateTeam">
            <div class="m-create-team">
                <router-view v-if="isPublic || isLogin" />
                <el-alert v-else title="请先登录" type="warning" description="使用本功能请先登录" show-icon> </el-alert>
            </div>
        </template>
    </div>
</template>

<script>
// import Nav from "@/components/widget/Nav.vue";
import Nav from "@/components/team/widget/Nav2.vue";
import TeamHomeSidebar from "@/components/team/org/team_home_sidebar.vue";
import User from "@jx3box/jx3box-common/js/user";
import { __Root, __cdn } from "@/utils/config";
import { ArrowRight, Lock } from "@element-plus/icons-vue";
export default {
    name: "wrapper",
    data: function () {
        return {
            isLogin: User.isLogin(),
            keepHeight: window.innerHeight - 220 + "px",
            logo: __cdn + "logo/logo-light/team.svg",
        };
    },
    computed: {
        isPublic: function () {
            return this.$route.meta.isPublic;
        },
        isCreateTeam: function () {
            return this.$route.meta.isCreateTeam;
        },
        isModernWorkspace: function () {
            return ["index", "list_raid", "view_raid", "view_my_org", "manage_my_org", "add_org"].includes(
                this.$route.name
            );
        },
        loginUrl: function () {
            return `/account/login?redirect=${encodeURIComponent(window.location.href)}`;
        },
    },
    methods: {},
    mounted: function () {
        let oldhash = "#/org/view/";
        let old_id = location.hash.slice(oldhash.length, location.hash.length);
        if (location.hash.includes(oldhash)) {
            location.href = __Root + "team/org/" + old_id;
        }
    },
    components: {
        ArrowRight,
        Lock,
        Nav,
        TeamHomeSidebar,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/app.less";
@import "@/assets/css/team/modules/home-theme.less";
@import "@/assets/css/team/miniprogram.less";
</style>
