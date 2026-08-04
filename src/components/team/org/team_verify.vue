<template>
    <div class="m-team-teamverify" :class="{ 'is-archive': isArchive }">
        <template v-if="isArchive">
            <dl class="m-team-verify-summary">
                <div>
                    <dt>{{ $t("team.verification.teamId") }}</dt>
                    <dd>{{ form.team_id || "-" }}</dd>
                </div>
                <div>
                    <dt>{{ $t("team.verification.teamName") }}</dt>
                    <dd>{{ form.name || "-" }}</dd>
                </div>
                <div>
                    <dt>{{ $t("team.verification.server") }}</dt>
                    <dd>{{ form.server || "-" }}</dd>
                </div>
            </dl>

            <el-form
                ref="form"
                :model="form"
                label-position="top"
                class="m-team-verify-contact"
                :class="{ 'is-editable': canApply, 'is-disabled': !canApply }"
            >
                <el-form-item :label="$t('team.verification.contactQq')">
                    <el-input
                        v-model="form.proposer"
                        class="u-contact-input"
                        :placeholder="$t('team.verification.contactPlaceholder')"
                        :disabled="!canApply"
                    ></el-input>
                </el-form-item>
                <el-form-item class="is-action">
                    <el-button class="u-btn" type="primary" @click="submit" :disabled="!canApply">
                        {{ btn_txt }}
                    </el-button>
                </el-form-item>
            </el-form>
        </template>

        <template v-else>
            <h3>{{ $t("team.verification.application") }}</h3>

            <el-form ref="form" :model="form" label-width="100px" :label-position="position">
                <el-form-item :label="$t('team.verification.teamId')">
                    <el-input v-model="form.team_id" :placeholder="$t('team.verification.teamId')" disabled></el-input>
                </el-form-item>
                <el-form-item :label="$t('team.verification.teamName')">
                    <el-input v-model="form.name" :placeholder="$t('team.sidebar.loading')" disabled>
                        <!-- <i
                        slot="prefix"
                        v-if="!isVerified"
                        class="el-input__icon el-icon-loading"
                    ></i> -->
                    </el-input>
                </el-form-item>
                <el-form-item :label="$t('team.verification.server')">
                    <el-input v-model="form.server" :placeholder="$t('team.sidebar.loading')" disabled>
                        <!-- <i
                        slot="prefix"
                        v-if="!isVerified"
                        class="el-input__icon el-icon-loading"
                    ></i> -->
                    </el-input>
                </el-form-item>
                <el-form-item :label="$t('team.verification.contactQq')">
                    <el-input v-model="form.proposer" :placeholder="$t('team.verification.contactPlaceholder')" :disabled="!canApply"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button class="u-btn" type="primary" @click="submit" :disabled="!canApply">{{
                        btn_txt
                    }}</el-button>
                </el-form-item>
            </el-form>
        </template>
    </div>
</template>

<script>
export default {
    props: ["data", "btn_txt", "done", "hasApplied", "variant"],
    data: function () {
        return {
            position: window.innerWidth < 768 ? "top" : "left",
            form: {
                name: "",
                server: "",
                team_id: "",
                proposer: "",
            },
        };
    },
    model: {
        prop: "data",
        event: "update",
    },
    watch: {
        data: {
            immediate: true,
            handler: function (newval) {
                if (!newval) return;
                this.form = newval;
                this.form.team_id = newval.ID || newval.team_id;
            },
        },
        "form.proposer": function (val) {
            if (!val) return;
            this.form.proposer = val.replace(/\D/g, "");
        },
    },
    computed: {
        isArchive: function () {
            return this.variant === "archive";
        },
        isVerified: function () {
            return this.form.status;
        },
        canApply() {
            return !this.isVerified && !this.done && !this.hasApplied;
        },
    },
    methods: {
        submit: function () {
            if (!this.form.proposer) {
                this.$alert(this.$t("team.verification.qqRequired"), this.$t("team.verification.reminder"), {
                    confirmButtonText: this.$t("team.verification.confirm"),
                });
                return;
            }
            this.$emit("submit");
        },
    },
    mounted: function () {},
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_verify.less";
</style>
