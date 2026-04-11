<template>
    <div class="m-team-teamverify">
        <h3>【认证团队信息】</h3>

        <el-form
            ref="form"
            :model="form"
            label-width="100px"
            :label-position="position"
        >
            <el-form-item label="团队ID">
                <el-input
                    v-model="form.team_id"
                    placeholder="团队ID"
                    disabled
                ></el-input>
            </el-form-item>
            <el-form-item label="团队名称">
                <el-input
                    v-model="form.name"
                    placeholder="团队名加载中...."
                    disabled
                >
                    <!-- <i
                        slot="prefix"
                        v-if="!isVerified"
                        class="el-input__icon el-icon-loading"
                    ></i> -->
                </el-input>
            </el-form-item>
            <el-form-item label="服务器">
                <el-input
                    v-model="form.server"
                    placeholder="服务器名加载中...."
                    disabled
                >
                    <!-- <i
                        slot="prefix"
                        v-if="!isVerified"
                        class="el-input__icon el-icon-loading"
                    ></i> -->
                </el-input>
            </el-form-item>
            <el-form-item label="QQ号">
                <el-input
                    v-model="form.proposer"
                    placeholder="请填写您的QQ号"
                    :disabled="!canApply"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button
                    class="u-btn"
                    type="primary"
                    @click="submit"
                    :disabled="!canApply"
                    >{{ btn_txt }}</el-button
                >
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    props: ["data", "btn_txt","done", "hasApplied"],
    data: function() {
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
        data: function(newval) {
            this.form = newval;
            this.form.team_id = newval.ID
        },
        "form.proposer": function(val) {
            if (!val) return;
            this.form.proposer = val.replace(/\D/g, "");
        },
    },
    computed: {
        isVerified: function() {
            return this.form.status
        },
        canApply() {
            return !this.isVerified && !this.done && !this.hasApplied
        }
    },
    methods: {
        submit: function() {
            if (!this.form.proposer) {
                this.$alert("QQ号不能为空", "提醒", {
                    confirmButtonText: "确定",
                });
                return;
            }
            this.$emit("submit");
        },
    },
    mounted: function() {},
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_verify.less";
</style>
