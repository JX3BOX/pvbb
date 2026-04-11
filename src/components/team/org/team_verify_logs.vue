<template>
    <div class="m-verify-logs">
        <h5 class="u-title">近期认证记录</h5>
        <table class="u-list">
            <thead>
                <tr>
                    <th>状态</th>
                    <th>提交时间</th>
                </tr>
            </thead>
            <tr v-for="(item, i) in data" :key="i">
                <td>{{ statusLabel(item.status) }}</td>
                <td>{{ showTime(item.created_at) }}</td>
            </tr>
        </table>
    </div>
</template>

<script>
const status_map = ["待审核", "认证通过", "认证失败"];
import { getVerifyLogs } from "@/service/team/verify.js";
import { showTime } from "@/utils/filters.js";
export default {
    name: "",
    props: [],
    data: function () {
        return {
            data: [],
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
    },
    methods: {
        init: function () {
            getVerifyLogs(this.id).then((res) => {
                this.data = res.data.data.list;

                // 根据最新一条记录判断是否已经认证
                let last = this.data[0];
                this.$emit("update:status", last.status);
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
