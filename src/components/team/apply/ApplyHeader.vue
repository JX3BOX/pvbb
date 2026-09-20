<template>
    <section class="m-team-home__hero">
        <header class="m-team-home__header">
            <div class="m-team-home__intro">
                <span class="u-team-home-icon" aria-hidden="true"><el-icon :size="30"><Present /></el-icon></span>
                <div class="m-team-home__heading">
                    <span>{{ $t("team.common.platform") }}</span>
                    <h1>{{ title || $t("team.legacyNav.welfareApplications") }}</h1>
                    <p>{{ $t("team.apply.available") }}</p>
                </div>
            </div>
            <router-link v-if="back" class="u-team-home-action" :to="{ name: 'apply_list' }">
                <el-icon><ArrowLeft /></el-icon>
                <span>{{ $t("team.apply.back") }}</span>
            </router-link>
        </header>
    </section>
</template>
<script>
import { ArrowLeft, Present } from "@element-plus/icons-vue";
export default {
    name: "ApplyHeader",
    components: { ArrowLeft, Present },
    props: { title: { type: String, default: "" }, back: Boolean },
};
</script>
