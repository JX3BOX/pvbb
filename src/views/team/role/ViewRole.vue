<template>
    <div class="v-role-view">
        <header class="m-role-header">
            <h1>{{ $t("team.role.info") }}</h1>
            <el-button class="u-back" icon="ArrowLeft" @click="goBack">{{ $t("team.role.back") }}</el-button>
        </header>

        <div v-if="loading" class="m-role-state" aria-live="polite">
            <el-skeleton :rows="5" animated />
        </div>

        <template v-else-if="data">
            <section class="m-role-profile-card">
                <div class="m-role-identity">
                    <div class="u-role-avatar-wrap">
                        <RoleAvatar class="u-avatar" :mount="data.mount" :body_type="data.body_type" />
                    </div>
                    <div class="u-role-primary">
                        <div class="u-role-name">
                            <h2>{{ data.name }}</h2>
                            <span v-if="!~~data.custom" class="u-verified">
                                <img svg-inline src="@/assets/img/team/verify.svg" />
                                {{ $t("team.role.verified") }}
                            </span>
                        </div>
                        <span class="u-role-server">{{ data.server }}</span>
                        <span class="u-author">
                            <span class="u-author-label">{{ $t("team.raid.roleDialog.owner") }}</span>
                            <img
                                class="u-author-avatar"
                                width="24"
                                height="24"
                                :src="showAvatar(data.user_avatar)"
                                alt=""
                            />
                            <a
                                class="u-author-name"
                                :href="authorLink(data.uid)"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {{ data.display_name }}
                            </a>
                        </span>
                    </div>
                </div>
                <dl class="m-role-facts">
                    <div>
                        <dt>{{ $t("team.role.server") }}</dt>
                        <dd>{{ data.server || "-" }}</dd>
                    </div>
                    <div>
                        <dt>{{ $t("team.role.school") }}</dt>
                        <dd><img :src="showSchoolIcon(data.mount)" />{{ showSchoolName(data.mount) }}</dd>
                    </div>
                    <div>
                        <dt>{{ $t("team.role.bodyType") }}</dt>
                        <dd>{{ showBodyType(data.body_type) }}</dd>
                    </div>
                </dl>
            </section>

            <section v-if="hasRight" class="m-role-belongs" aria-labelledby="role-team-title">
                <header class="m-role-section-header">
                    <div>
                        <span class="u-section-icon"><el-icon><CollectionTag /></el-icon></span>
                        <div>
                            <h2 id="role-team-title">{{ $t("team.role.joinTeam") }}</h2>
                            <p>{{ $t("team.role.teamsPrivate") }}</p>
                        </div>
                    </div>
                    <span v-if="teams.length" class="u-team-count">{{ teams.length }}</span>
                </header>
                <template v-if="teams && teams.length">
                    <div class="u-teams">
                        <router-link class="u-team" :to="'/org/' + item.team_id" v-for="item in teams" :key="item.team_id">
                            <img class="u-team-logo" v-if="item.team_logo" :src="showTeamLogo(item.team_logo)" />
                            <img class="u-team-logo" v-else src="@/assets/img/team/null.png" />
                            <span class="u-team-name">{{ item.team_name }}</span>
                            <el-icon><ArrowRight /></el-icon>
                        </router-link>
                    </div>
                </template>
                <template v-else>
                    <div class="u-empty-team"><el-icon><CollectionTag /></el-icon><span>{{ $t("team.role.noTeam") }}</span></div>
                </template>
            </section>
        </template>

        <div class="m-role-null m-team-limit" v-else-if="warning_visible">
            <p class="u-title">
                <img class="u-icon" svg-inline src="@/assets/img/team/icons/warning.svg" />
                Not Found
            </p>
            {{ $t("team.role.missing") }}
        </div>
    </div>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import { getRole, deleteRole } from "@/service/team/role.js";
import { getRoleBelongTeams } from "@/service/team/member.js";
import RoleAvatar from "@/components/team/widget/RoleAvatar.vue";
import { getThumbnail, authorLink, showAvatar } from "@jx3box/jx3box-common/js/utils";
import { showBodyType, showSchoolIcon, showSchoolName } from "@/utils/filters";
import { ArrowRight, CollectionTag } from "@element-plus/icons-vue";
export default {
    name: "ViewRole",
    props: [],
    data: function () {
        return {
            data: "",
            warning_visible: false,
            loading: true,
            teams: [],
            isLogin: User.isLogin(),
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        hasRight: function () {
            return this.data && (this.data.uid == User.getInfo().uid || User.isSuperAdmin());
        },
        isCustom: function () {
            return this.data && this.data.custom;
        },
        playerId: function () {
            return this.data.player_id;
        },
        server: function () {
            return this.data.server;
        },
    },
    methods: {
        delRole: function () {
            this.$alert(this.$t("team.role.deleteConfirm"), this.$t("team.raid.item.message"), {
                confirmButtonText: this.$t("team.role.confirm"),
                callback: (action) => {
                    if (action == "confirm") {
                        deleteRole(this.id).then((res) => {
                            this.$notify({
                                title: this.$t("team.role.deleted"),
                                message: this.$t("team.role.deletedMessage"),
                                type: "success",
                            });
                            this.goBack();
                        });
                    }
                },
            });
        },
        loadData: function () {
            this.loading = true;
            this.warning_visible = false;
            getRole(this.id)
                .then((res) => {
                    this.data = res.data.data;
                    if (this.hasRight) {
                        return getRoleBelongTeams(this.id)
                            .then((res) => {
                                this.teams = res.data.data || [];
                            })
                            .catch(() => {
                                this.teams = [];
                            });
                    }
                })
                .catch(() => {
                    this.data = "";
                    this.warning_visible = true;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        goBack: function () {
            window.location.href = "/dashboard/role";
        },
        showTeamLogo: function (val) {
            return getThumbnail(val, 256);
        },
        authorLink,
        showAvatar,
        showBodyType,
        showSchoolIcon,
        showSchoolName,
    },
    mounted: function () {
        this.loadData();
    },
    components: {
        ArrowRight,
        CollectionTag,
        RoleAvatar,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/role/view_role.less";
</style>
