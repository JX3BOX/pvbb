<template>
    <div class="m-verify-logs">
        <header class="m-verify-section-title">
            <h2>近期认证记录</h2>
        </header>
        <table v-if="data.length" class="u-list">
            <thead>
                <tr>
                    <th>状态</th>
                    <th>提交时间</th>
                </tr>
            </thead>
            <tr v-for="(item, i) in data" :key="i">
                <td>
                    <span class="u-status" :class="`is-${item.status}`">{{ statusLabel(item.status) }}</span>
                </td>
                <td>{{ showTime(item.created_at) }}</td>
            </tr>
        </table>
        <el-empty v-else description="暂无认证记录" :image-size="72" />
    </div>
</template>

<script>
const status_map = ["待审核", "认证通过", "认证失败"];
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
            return status_map[~~val];
        },
        showTime,
    },
    mounted: function () {
        this.init();
    },
    components: {},
};
</script>
