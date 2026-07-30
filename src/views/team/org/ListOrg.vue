<template>
    <div class="v-org-list" :class="{ 'p-team-home': isTeamHome }">
        <template v-if="isTeamHome">
            <section class="m-team-home__hero" aria-labelledby="team-home-title">
                <header class="m-team-home__header">
                    <div class="m-team-home__intro">
                        <span class="u-team-home-icon" aria-hidden="true">
                            <img :src="teamLogo" alt="" />
                        </span>
                        <div class="m-team-home__heading">
                            <h1 id="team-home-title">团队平台</h1>
                            <p>查找团队、管理角色，与志同道合的伙伴并肩江湖</p>
                        </div>
                    </div>
                    <div
                        class="m-team-home__summary"
                        :class="{ 'is-loading': teamTotal === null }"
                        :aria-busy="teamTotal === null"
                        aria-live="polite"
                    >
                        <span>团队广场</span>
                        <strong>{{ teamTotal === null ? "—" : formattedTeamTotal }}</strong>
                        <small>支团队可供浏览</small>
                    </div>
                    <nav class="m-team-home__actions" aria-label="团队快捷入口">
                        <a class="u-team-home-action" href="/tool/21789" target="_blank" rel="noopener noreferrer">
                            <el-icon><QuestionFilled /></el-icon>
                            <span>使用指南</span>
                        </a>
                        <router-link class="u-team-home-action is-primary" to="/org/add">
                            <el-icon><Plus /></el-icon>
                            <span>创建团队</span>
                        </router-link>
                    </nav>
                </header>
            </section>
            <team-list :home-mode="true" @changePage="changePage" @total-change="updateTeamTotal" />
        </template>
        <team-list v-else @changePage="changePage" />
    </div>
</template>

<script>
import TeamList from "@/components/team/org/team_list.vue";
import { __cdn } from "@/utils/config";
import { Plus, QuestionFilled } from "@element-plus/icons-vue";
export default {
    name: "ListOrg",
    props: [],
    components: {
        "team-list": TeamList,
        Plus,
        QuestionFilled,
    },
    data: function () {
        return {
            teamTotal: null,
            teamLogo: __cdn + "logo/logo-light/team.svg",
        };
    },
    computed: {
        isTeamHome: function () {
            return this.$route.name === "index";
        },
        formattedTeamTotal: function () {
            return Number(this.teamTotal || 0).toLocaleString("zh-CN");
        },
    },
    methods: {
        goBack: function () {
            this.$router.push("/");
        },
        changePage: function () {
            window.scrollTo(0, 0);
        },
        updateTeamTotal: function (total) {
            this.teamTotal = total;
        },
    },
    filters: {},
    created: function () {},
    mounted: function () {},
};
</script>
