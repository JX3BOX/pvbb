<template>
    <section class="m-team-dkp-rule" :class="{ 'is-archive': variant === 'archive' }" v-loading="loading">
        <div v-if="variant === 'archive'" class="m-archive-field-label">{{ $t("team.settingSections.dkpRule") }}</div>
        <el-divider v-else content-position="left">
            <i class="el-icon-document"></i> {{ $t("team.raid.misc.dkpRule") }}
        </el-divider>
        <el-input
            type="textarea"
            :rows="variant === 'archive' ? 6 : 8"
            :placeholder="variant === 'archive' ? $t('team.settingSections.rulePlaceholder') : $t('team.settingSections.contentPlaceholder')"
            v-model="data"
        ></el-input>
        <div v-if="variant === 'archive'" class="m-dkp-rule__footer">
            <span>{{ $t("team.settingSections.ruleHint") }}</span>
            <el-button class="u-btn" type="primary" @click="handleSubmitDkpRule">{{ $t("team.settingSections.saveRule") }}</el-button>
        </div>
        <el-button v-else class="u-btn" type="primary" @click="handleSubmitDkpRule">{{ $t("team.settingSections.submit") }}</el-button>
    </section>
</template>

<script>
import { getDkpRule, updateDkpRule } from "@/service/team/dkp.js";
export default {
    name: "dkpRule",
    props: {
        variant: {
            type: String,
            default: "default",
        },
    },
    data: function () {
        return {
            data: "",
            loading: false,
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
    },
    methods: {
        init() {
            this.getDkpRule(this.id);
        },
        handleSubmitDkpRule() {
            if (this.data.replace(/[\ \n]/g, "") === "") {
                this.$message({
                    message: this.$t("team.settingSections.ruleRequired"),
                    type: "warning",
                });
                return false;
            }
            this.loading = true;
            return updateDkpRule(this.id, this.data)
                .then((res) => {
                    this.$message({
                        message: this.$t("team.settingSections.ruleUpdated"),
                        type: "success",
                    });
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        getDkpRule(team_id) {
            this.loading = true;
            return getDkpRule(team_id)
                .then((res) => {
                    this.data = res.data.data ? res.data.data.rule : "";
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
    filters: {},
    created: function () {},
    mounted: function () {
        this.init();
    },
};
</script>

<style scoped lang="less">
@import (reference) "@/assets/css/team/design-system/_tokens.less";

.u-btn {
    .mt(20px);
    .w(120px);
}

.m-team-dkp-rule.is-archive {
    min-width: 0;

    :deep(.el-textarea__inner) {
        min-height: 132px !important;
        padding: @team-space-2;
        border-radius: 12px;
        color: @team-text-regular;
        line-height: 1.7;
    }

    .m-dkp-rule__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: @team-space-3;
        gap: @team-space-3;

        span {
            color: @team-text-muted;
            font-size: 12px;
            line-height: 18px;
        }

        .u-btn {
            width: auto;
            min-width: 112px;
            min-height: 40px;
            margin-top: 0;
            border-radius: 10px;
            font-weight: 600;
        }
    }
}

@media screen and (max-width: 520px) {
    .m-team-dkp-rule.is-archive {
        .m-dkp-rule__footer {
            align-items: stretch;
            flex-direction: column;

            .u-btn {
                width: 100%;
            }
        }
    }
}
</style>
