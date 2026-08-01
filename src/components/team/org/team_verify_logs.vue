<template>
    <div class="m-verify-logs">
        <header class="m-verify-section-title">
            <h2>{{ $t("team.verification.recent") }}</h2>
        </header>
        <table v-if="data.length" class="u-list">
            <thead>
                <tr>
                    <th>{{ $t("team.verification.status") }}</th>
                    <th>{{ $t("team.verification.submittedAt") }}</th>
                </tr>
            </thead>
            <tr v-for="(item, i) in data" :key="i">
                <td>
                    <span class="u-status" :class="`is-${item.status}`">{{ statusLabel(item.status) }}</span>
                </td>
                <td>{{ showTime(item.created_at) }}</td>
            </tr>
        </table>
        <el-empty v-else :description="$t('team.verification.noRecords')" :image-size="72" />
    </div>
</template>

<script>
import { getVerifyLogs } from "@/service/team/verify.js";
import { showTime } from "@/utils/filters.js";
export default {
    name: "",
    props: ["teamId"],
    data: function () {
        return {
            data: [],
        };
    },
    computed: {
        id: function () {
            return this.teamId || this.$route.params.id;
        },
    },
    methods: {
        init: function () {
            getVerifyLogs(this.id).then((res) => {
                this.data = res.data.data.list || [];

                // 根据最新一条记录判断是否已经认证
                const last = this.data[0];
                this.$emit("update:status", last?.status);
            });
        },
        statusLabel: function (val) {
            return [this.$t("team.verification.pending"), this.$t("team.verification.approved"), this.$t("team.verification.failed")][~~val];
        },
        showTime,
    },
    mounted: function () {
        this.init();
    },
    components: {},
};
</script>
