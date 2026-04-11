<template>
    <div class="v-role-add">
        <h1 class="m-title">
            <i class="el-icon-setting"></i> 编辑角色
            <div class="u-op">
                <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">返回列表</el-button>
            </div>
        </h1>
        <roleform :data="form" @submit="submit" btn_txt="更新" :processing="processing" />
    </div>
</template>

<script>
import roleform from "@/components/team/role/roleform.vue";
import User from "@jx3box/jx3box-common/js/user";
import { getRole, updateRole } from "@/service/team/role.js";
export default {
    name: "",
    props: [],
    data: function () {
        return {
            form: {
                ID: "",
                name: "",
                server: "",
                mount: "",
                body_type: "",
                note: "",
                custom: 1,
                uid: "",
            },
            processing: false,
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
    },
    methods: {
        loadData: function () {
            getRole(this.id).then((res) => {
                let hasRight = res.data.data.uid == User.getInfo().uid || User.isSuperAdmin();
                if (!hasRight) {
                    this.$message.error("没有操作权限");
                    return;
                } else {
                    this.form = res.data.data;
                }
            });
        },
        submit: function () {
            // 如果是绑定的角色不能改
            if (!this.form.custom) {
                this.$message.error("绑定角色不允许篡改");
                return;
            }
            this.processing = true;
            updateRole(this.id, this.form)
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
    mounted: function () {
        this.loadData();
    },
    components: {
        roleform,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/role/add_role.less";
</style>
