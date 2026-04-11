<template>
    <div class="m-advanced-setting">
        <div class="m-filter">
            <el-radio-group v-model="active">
                <el-radio-button value="team_info">基本信息</el-radio-button>
                <el-radio-button value="verify">团队认证</el-radio-button>
                <el-radio-button value="permission">权限管理</el-radio-button>
                <el-radio-button value="other">其他</el-radio-button>
            </el-radio-group>
        </div>

        <template v-if="active == 'verify'">
            <VerifyOrg />
        </template>
        <template v-else-if="active == 'team_info'">
            <team-form :data="data" btn_txt="更新" @submit="submit" ref="teamForm"></team-form>
        </template>
        <template v-else-if="active == 'permission'">
            <EditPermission />
        </template>
        <template v-else-if="active == 'other'">
            <el-divider content-position="left"> <i class="el-icon-setting"></i> 团队操作 </el-divider>
            <div class="u-op">
                <el-button class="u-transform" type="warning" icon="Sort" @click="transformTeam">移交团队</el-button>
                <el-button v-if="id" class="u-delete" type="danger" icon="Delete" @click="deleteTeam"
                    >删除团队</el-button
                >
            </div>
            <EditNamespace />
        </template>

        <userpop
            title="移交团队"
            :data="to_uid"
            class="m-team-transform"
            v-model="openTransformDialog"
            @confirm="confirmTransform"
        >
            请输入需要移交的用户UID:
        </userpop>
    </div>
</template>

<script>
import VerifyOrg from "@/views/team/org/VerifyOrg.vue";
import EditPermission from "@/views/team/org/EditPermission.vue";
import EditNamespace from "@/views/team/org/EditNamespace.vue";
import userpop from "@/components/team/widget/userpop.vue";
import team_from from "@/components/team/org/teamform.vue";
import { delTeam, transformTeam, updateTeam } from "@/service/team/team.js";
import User from "@jx3box/jx3box-common/js/user.js";
export default {
    name: "AdvancedSetting",
    props: ["data"],
    components: {
        VerifyOrg,
        EditPermission,
        EditNamespace,
        userpop,
        "team-form": team_from,
    },
    data() {
        return {
            active: "team_info",

            to_uid: "",
            openTransformDialog: false,
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
    },
    methods: {
        deleteTeam: function () {
            this.$alert("确定删除团队的所有数据吗？该操作不可恢复！", "提醒", {
                confirmButtonText: "确定",
                callback: (action) => {
                    if (action == "confirm") {
                        delTeam(this.id).then((res) => {
                            if (res.data.data.effect) {
                                this.$notify({
                                    title: "成功",
                                    message: "删除成功",
                                    type: "success",
                                });
                                // location.reload();
                                this.$router.push("/");
                            } else {
                                this.$notify({
                                    title: "失败",
                                    message: "操作失败",
                                    type: "error",
                                });
                            }
                        });
                    }
                },
            });
        },
        transformTeam: function () {
            this.openTransformDialog = true;
        },
        confirmTransform: function (uid) {
            this.to_uid = uid;
            if (this.to_uid == User.getInfo().uid) {
                this.$notify.error({
                    title: "错误",
                    message: "不能转交给自己",
                });
                return;
            }
            transformTeam(this.id, this.to_uid).then((res) => {
                this.$message({
                    message: "移交成功",
                    type: "success",
                });
            });
        },
        submit: function () {
            this.processing = true;
            this.done = false;
            updateTeam(this.id, this.data)
                .then((res) => {
                    this.$message({
                        message: "更新成功",
                        type: "success",
                    });
                    // eslint-disable-next-line vue/no-mutating-props
                    this.data = res.data.data;
                    this.done = true;
                    this.$refs.teamForm?.submitTv();
                })
                .finally(() => {
                    this.processing = false;
                });
        },
    },
};
</script>

<style lang="less">
.m-advanced-setting {
    .m-filter {
        .x;
    }
}
</style>
