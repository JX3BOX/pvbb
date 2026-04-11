<template>
    <div class="m-snapshot-detail">
        <el-dialog title="快照详情" v-model="visible">
            <el-table :data="data.data" size="small">
                <el-table-column label="时间">
                    <template #default="scope">
                        <span>{{ showTime(scope.row.created_at) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="快照名称">
                    <template #default="scope">
                        <span>{{ autoname(scope.row) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-popover popper-class="m-snapshot-preview">
                            <snapshot-body
                                :data="formatTeammate(scope.row.teammate)"
                                :class="'row-' + computedGroups(scope.row.teammate)"
                            ></snapshot-body>
                            <template #reference>
                                <el-button link size="small">团队详情</el-button>
                            </template>
                        </el-popover>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
import { showTime } from "@jx3box/jx3box-common/js/moment";

import snapshotBody from "./snapshotBody.vue";
export default {
    name: "snapshotDetail",
    props: ["value", "data"],
    components: {
        snapshotBody,
    },
    data() {
        return {
            visible: false,
        };
    },
    watch: {
        visible(val) {
            this.$emit("input", val);
        },
        value(val) {
            this.visible = val;
        },
    },
    methods: {
        showTime(val) {
            return showTime(val);
        },
        autoname(row) {
            return (
                row.title || showTime(row.created_at) + "@" + (row.user_data?.display_name || "未知") + " 游戏内上传"
            );
        },
        formatTeammate(teammate) {
            return teammate.split(";").map((item) => {
                const [name, , , mount] = item.split(",");

                return {
                    name,
                    mount,
                };
            });
        },
        computedGroups(teammate) {
            const list = teammate.split(";");
            return ~~Math.ceil(list.length / 5);
        },
    },
};
</script>

<style scoped lang="less">
.m-snapshot-body {
    border-top: 2px solid #e6f0fb;
}
</style>
