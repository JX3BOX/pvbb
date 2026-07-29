<template>
    <div class="v-team-config" :class="{ 'is-archive': variant === 'archive' }">
        <template v-if="variant === 'archive'">
            <header class="m-team-form-section">
                <h2>快照与展示</h2>
            </header>
            <snapshot-password :variant="variant" />
            <team-banner :team-info="teamInfo" :variant="variant" />

            <header class="m-team-form-section">
                <h2>DKP 设置</h2>
            </header>
            <dkp-rule :variant="variant" />
        </template>
        <template v-else>
            <!-- 快照密码 -->
            <snapshot-password :variant="variant" />

            <!-- 团队海报 -->
            <team-banner :team-info="teamInfo" :variant="variant" />

            <!-- DKP制度 -->
            <dkp-rule :variant="variant" />
        </template>
    </div>
</template>

<script>
import DkpRule from "../dkp/EditDkpRule.vue";
import EditPassword from "../snapshot/EditPassword.vue";
import TeamBanner from "@/components/team/org/team_banner.vue";
export default {
    name: "EditOrgConfig",
    props: {
        teamInfo: {
            type: Object,
            default: () => ({}),
        },
        variant: {
            type: String,
            default: "default",
        },
    },
    components: {
        "dkp-rule": DkpRule,
        "snapshot-password": EditPassword,
        "team-banner": TeamBanner,
    },
};
</script>

<style lang="less">
@import (reference) "@/assets/css/team/design-system/_tokens.less";

.v-team-config.is-archive {
    display: block;
    min-width: 0;
}
</style>
