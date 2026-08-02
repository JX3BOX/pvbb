<template>
    <div class="v-org-verify" :class="{ 'is-archive': isArchive }">
        <template v-if="isArchive">
            <div class="m-verify-overview">
                <section class="m-verify-card">
                    <header class="m-verify-section-title">
                        <h2>{{ $t("team.verification.notice") }}</h2>
                    </header>
                    <ul class="m-verify-points">
                        <li><i></i><span>{{ $t("team.verification.notice1") }}</span></li>
                        <li><i></i><span>{{ $t("team.verification.notice2") }}</span></li>
                        <li><i></i><span>{{ $t("team.verification.notice3") }}</span></li>
                    </ul>
                </section>

                <section class="m-verify-card">
                    <header class="m-verify-section-title">
                        <h2>{{ $t("team.verification.process") }}</h2>
                    </header>
                    <ol class="m-verify-steps">
                        <li><i>1</i><span>{{ $t("team.verification.step1") }}</span></li>
                        <li><i>2</i><span>{{ $t("team.verification.step2") }}</span></li>
                        <li><i>3</i><span>{{ $t("team.verification.step3") }}</span></li>
                    </ol>
                    <div class="m-verify-groups">
                        <span>{{ $t("team.verification.leaderGroup") }}</span>
                        <a href="https://qm.qq.com/q/O3fXaqtAwS" target="_blank">915477780</a>
                        <em>{{ $t("team.verification.required") }}</em>
                    </div>
                    <div class="m-verify-groups is-optional">
                        <span>{{ $t("team.verification.exchangeGroup") }}</span>
                        <a href="https://jq.qq.com/?_wv=1027&k=MglORFXo" target="_blank">{{ $t("team.verification.retail") }}</a>
                        <a href="https://jq.qq.com/?_wv=1027&k=MXEj10bv" target="_blank">{{ $t("team.verification.legacy") }}</a>
                    </div>
                </section>
            </div>

            <section class="m-verify-application">
                <header class="m-verify-section-title">
                    <h2>{{ $t("team.verification.application") }}</h2>
                </header>
                <el-alert
                    v-if="done"
                    :title="$t('team.verification.submitted')"
                    type="success"
                    show-icon
                    :closable="false"
                    class="m-org-verify-alert"
                />
                <team-verify-form
                    variant="archive"
                    :data="form"
                    @submit="submit"
                    :done="done"
                    :has-applied="hasApplied"
                    :btn_txt="$t('team.verification.submit')"
                />
            </section>

            <team-verify-logs :team-id="id" @update:status="updateStatus" ref="logs" />
        </template>

        <template v-else>
            <RightSideMsg class="m-org-verify-ac">
                <div class="m-org-verify-info">
                    <h3>{{ $t("team.verification.notice") }}</h3>
                    <p>① {{ $t("team.verification.notice1") }}</p>
                    <p>② {{ $t("team.verification.notice2") }}</p>
                    <p>③ {{ $t("team.verification.notice3") }}</p>
                </div>
            </RightSideMsg>
            <RightSideMsg>
                <div class="m-org-verify-info">
                    <h3>{{ $t("team.verification.process") }}</h3>
                    <p>① {{ $t("team.verification.step1") }}</p>
                    <p>② {{ $t("team.verification.step2") }}</p>
                    <p>
                        ③ {{ $t("team.verification.leaderGroup") }}：
                        <a
                            href="https://qm.qq.com/q/O3fXaqtAwS"
                            class="el-button el-button--primary el-button--small is-plain"
                            target="_blank"
                            >915477780</a
                        >（{{ $t("team.verification.required") }}）
                    </p>
                    <p>
                        ④ {{ $t("team.verification.exchangeGroup") }}：<a
                            href="https://jq.qq.com/?_wv=1027&k=MglORFXo"
                            class="el-button el-button--primary el-button--small is-plain"
                            target="_blank"
                            >{{ $t("team.verification.retail") }}</a
                        >、<a
                            href="https://jq.qq.com/?_wv=1027&k=MXEj10bv"
                            class="el-button el-button--primary el-button--small is-plain"
                            target="_blank"
                            >{{ $t("team.verification.legacy") }}</a
                        >
                    </p>
                    <div class="m-org-verify-alert">
                        <el-alert v-if="done" type="success" show-icon class="u-warning">
                            <router-link to="/org/manage" arget="_blank" class="u-org-verify-alert-a"
                                >{{ $t("team.verification.submitted") }}</router-link
                            >
                        </el-alert>
                    </div>

                    <team-verify-form
                        :data="form"
                        @submit="submit"
                        :done="done"
                        :has-applied="hasApplied"
                        :btn_txt="$t('team.verification.submit')"
                    />
                </div>
            </RightSideMsg>
            <team-verify-logs :team-id="id" @update:status="updateStatus" ref="logs" />
        </template>
    </div>
</template>

<script>
import { auditTeam, verifyTeam } from "@/service/team/verify.js";
import { getTeam } from "@/service/team/team.js";
import team_verify from "@/components/team/org/team_verify.vue";
import team_verify_logs from "@/components/team/org/team_verify_logs.vue";
export default {
    name: "VerifyOrg",
    props: ["variant", "teamId", "teamData"],
    data: function () {
        const currentTeam = this.teamData || {};
        return {
            form: {
                ...currentTeam,
                name: currentTeam.name || "",
                server: currentTeam.server || "",
                team_id: currentTeam.ID || "",
                proposer: currentTeam.proposer || "",
            },
            done: false,
            hasApplied: false,
        };
    },
    computed: {
        isArchive: function () {
            return this.variant === "archive";
        },
        id: function () {
            return this.teamId || this.$route.params.id;
        },
        data: function () {
            return {
                proposer: this.form.proposer,
            };
        },
    },
    methods: {
        init: function () {
            getTeam(this.id).then((res) => {
                this.form = res.data.data;
            });
            this.$nextTick(() => {
                this.$refs.logs.init();
            });
        },
        submit: function () {
            auditTeam(this.form.name).then((res) => {
                let result = res.data.data.is_exist;
                if (result) {
                    this.$alert(this.$t("team.verification.duplicateStudio"), this.$t("team.verification.message"), {
                        confirmButtonText: this.$t("team.verification.confirm"),
                    });
                } else {
                    verifyTeam(this.id, this.data).then((res) => {
                        this.done = true;
                    });
                }
                this.init();
            });
        },
        updateStatus: function (val) {
            this.hasApplied = val == 0;
        },
    },
    mounted: function () {
        this.init();
    },
    components: {
        "team-verify-form": team_verify,
        "team-verify-logs": team_verify_logs,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/verify_org.less";
</style>
