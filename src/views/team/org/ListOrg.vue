<template>
    <div class="v-org-list" :class="{ 'p-team-home': isTeamHome }">
        <section v-if="isTeamHome" class="m-team-home__hero" aria-labelledby="team-home-title">
            <header class="m-team-home__header">
                <div class="m-team-home__intro">
                    <span class="u-team-home-icon" aria-hidden="true">
                        <el-icon><UserFilled /></el-icon>
                    </span>
                    <div class="m-team-home__heading">
                        <h1 id="team-home-title">团队平台</h1>
                        <p>查找团队、管理角色，与志同道合的伙伴并肩江湖</p>
                    </div>
                </div>
                <nav class="m-team-home__actions" aria-label="团队快捷入口">
                    <router-link class="u-team-home-action" to="/role/manage">
                        <el-icon><User /></el-icon>
                        <span>我的角色</span>
                    </router-link>
                    <router-link class="u-team-home-action" to="/role/group">
                        <el-icon><OfficeBuilding /></el-icon>
                        <span>我的团队</span>
                    </router-link>
                </nav>
            </header>
        </section>
        <team-list :home-mode="isTeamHome" @changePage="changePage" />
    </div>
</template>

<script>
import TeamList from "@/components/team/org/team_list.vue";
import { OfficeBuilding, User, UserFilled } from "@element-plus/icons-vue";
export default {
    name: "ListOrg",
    props: [],
    components: {
        "team-list": TeamList,
        OfficeBuilding,
        User,
        UserFilled,
    },
    data: function () {
        return {};
    },
    computed: {
        isTeamHome: function () {
            return this.$route.name === "index";
        },
    },
    methods: {
        goBack: function () {
            this.$router.push("/");
        },
        changePage: function () {
            window.scrollTo(0, 0);
        },
    },
    filters: {},
    created: function () {},
    mounted: function () {},
};
</script>

<style lang="less">
@import "@/assets/css/team/modules/home-theme.less";
</style>
