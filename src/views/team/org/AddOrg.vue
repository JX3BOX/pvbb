<template>
    <div class="v-org-add p-team-create">
        <section class="m-team-create__hero" aria-labelledby="team-create-title">
            <header class="m-team-create__header">
                <div class="m-team-create__intro">
                    <span class="u-team-create-icon" aria-hidden="true">
                        <img :src="teamLogo" alt="" />
                    </span>
                    <div class="m-team-create__heading">
                        <h1 id="team-create-title">{{ $t("team.orgLegacy.create") }}</h1>
                        <p>{{ $t("team.orgLegacy.createDescription") }}</p>
                    </div>
                </div>
                <button class="u-team-create-back" type="button" @click="goBack">
                    <el-icon><ArrowLeft /></el-icon>
                    <span>{{ $t("team.orgLegacy.backPlaza") }}</span>
                </button>
            </header>
        </section>

        <section v-if="checkingLimit" class="m-team-create__workspace is-checking" aria-live="polite">
            <span class="u-team-create-loading" aria-hidden="true"></span>
            <strong>{{ $t("team.orgLegacy.checking") }}</strong>
            <p>{{ $t("team.orgLegacy.checkingHint") }}</p>
        </section>

        <section v-else-if="status" class="m-team-create__workspace" aria-labelledby="team-create-form-title">
            <header class="m-team-create__form-heading">
                <div>
                    <h2 id="team-create-form-title">{{ $t("team.orgLegacy.fill") }}</h2>
                    <p>{{ $t("team.orgLegacy.fillHint") }}</p>
                </div>
            </header>
            <teamform
                :data="form"
                variant="archive"
                :btn_txt="$t('team.orgLegacy.create')"
                :processing="processing"
                @submit="submit"
            />
        </section>

        <section v-else class="m-team-create__limit" aria-labelledby="team-create-limit-title">
            <span class="u-team-create-limit-icon" aria-hidden="true">
                <el-icon><Lock /></el-icon>
            </span>
            <h2 id="team-create-limit-title">{{ $t("team.orgLegacy.limit") }}</h2>
            <p>{{ $t("team.orgLegacy.limitHint") }}</p>
            <div class="m-team-create__limit-actions">
                <a class="u-team-create-upgrade" href="/vip/premium?from=team_create" target="_blank">
                    <el-icon><ShoppingCart /></el-icon>
                    <span>{{ $t("team.orgLegacy.premium") }}</span>
                </a>
                <button class="u-team-create-secondary" type="button" @click="goBack">{{ $t("team.orgLegacy.backPlaza") }}</button>
            </div>
        </section>
    </div>
</template>

<script>
import { createTeam, getMyTeams } from "@/service/team/team.js";
import teamform from "@/components/team/org/teamform.vue";
import User from "@jx3box/jx3box-common/js/user.js";
import { __cdn } from "@/utils/config";
import { ArrowLeft, Lock, ShoppingCart } from "@element-plus/icons-vue";

export default {
    name: "AddOrg",
    props: [],
    data() {
        return {
            teamLogo: __cdn + "logo/logo-light/team.svg",
            form: {
                name: "",
                client: this.$store.state.client,
                server: "",
                logo: "",
                desc: "",
                recruit: "",
                tv_type: "",
                tv: "",
                v_member: 0,
                v_dkp: 2,
                v_activity: 0,
                v_comment: 0,
                yy_channel: "",
                qq_group: "",
                tags: [],
                wiki: "",
            },
            status: false,
            total: 0,
            processing: false,
            checkingLimit: true,
        };
    },
    methods: {
        submit: function () {
            this.processing = true;
            createTeam(this.form)
                .then((res) => {
                    this.$message({
                        message: this.$t("team.orgLegacy.created"),
                        type: "success",
                    });
                    const teamId = res.data?.data?.ID || res.data?.data?.id;
                    if (teamId) {
                        this.$router.push({
                            name: "manage_my_org",
                            params: { id: teamId },
                        });
                    } else {
                        this.$router.push("/");
                    }
                })
                .finally(() => {
                    this.processing = false;
                });
        },
        goBack: function () {
            this.$router.push("/");
        },
    },
    mounted: function () {
        getMyTeams()
            .then((res) => {
                this.total = res.data.data.page.total;

                // 非专业会员仅能创建1支队伍
                if (this.total) {
                    return User.isPRO().then((data) => {
                        this.status = data;
                    });
                }
                this.status = true;
            })
            .finally(() => {
                this.checkingLimit = false;
            });
        this.form.client = this.client;
    },
    components: {
        ArrowLeft,
        Lock,
        ShoppingCart,
        teamform,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/add_org.less";
</style>
