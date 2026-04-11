<template>
    <div class="m-team-dkp-rule" v-loading="loading">
        <el-divider content-position="left">
            <i class="el-icon-document"></i> DKP制度
        </el-divider>
        <el-input type="textarea" :rows="8" placeholder="请输入内容" v-model="data"></el-input>
        <el-button class="u-btn" type="primary" @click="handleSubmitDkpRule">提交</el-button>
    </div>
</template>

<script>
import { getDkpRule, updateDkpRule } from "@/service/team/dkp.js";
export default {
    name: "dkpRule",
    props: [],
    components: {},
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
                    message: "DKP制度不能为空",
                    type: "warning",
                });
                return false;
            }
            this.loading = true;
            return updateDkpRule(this.id, this.data)
                .then((res) => {
                    this.$message({
                        message: 'DKP制度更新成功',
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
.u-btn {
    .mt(20px);
    .w(120px);
}
</style>
