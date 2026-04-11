<template>
    <div class="v-role-add">
        <h1 class="m-title">
            <i class="el-icon-circle-plus-outline"></i>
            <span class="u-txt">创建角色</span>
            <div class="u-op">
                <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">返回列表</el-button>
            </div>
        </h1>
        <roleform :data="form" @submit="submit" btn_txt="创建" :processing="processing" />
    </div>
</template>

<script>
import roleform from "@/components/team/role/roleform.vue";
import { createRole } from "@/service/team/role.js";
export default {
    name: "",
    props: [],
    data: function () {
        return {
            form: {
                name: "",
                server: (localStorage && localStorage.getItem("team_role_default_server")) || "",
                mount: "0",
                body_type: "1",
                note: "",
                custom: 1,
            },
            processing: false,
        };
    },
    computed: {},
    methods: {
        submit: function () {
            this.processing = true;
            createRole(this.form)
                .then((res) => {
                    this.$message({
                        message: "更新成功",
                        type: "success",
                    });
                    this.$router.push("/role/manage");
                })
                .finally(() => {
                    this.processing = false;
                });
        },
        goBack: function () {
            this.$router.push("/role/manage");
        },
    },
    mounted: function () {},
    components: {
        roleform,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/role/add_role.less";
</style>
