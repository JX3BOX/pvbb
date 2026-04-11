<template>
    <div class="v-org-add">
        <h1 class="m-title">
            <i class="el-icon-circle-plus-outline"></i><span class="u-txt">创建团队</span>
            <div class="u-op">
                <el-button class="u-back" icon="ArrowLeft" @click="goBack">返回列表</el-button>
            </div>
        </h1>
        <div class="m-team-form" v-if="status">
            <teamform :data="form" @submit="submit" btn_txt="创建" :processing="processing" />
        </div>
        <div class="m-team-limit" v-else>
            <p class="u-title">
                <img class="u-icon" svg-inline src="@/assets/img/team/icons/warning.svg" />
                权限不足
            </p>
            <div>
                默认可创建1支团队，<a href="/vip/premium?from=team_create" target="_blank">专业版</a>账号无此限制。
            </div>
            <a class="u-buy el-button el-button--primary" href="/vip/premium?from=team_create" target="_blank"
                ><i class="el-icon-shopping-cart-2"></i> 升级专业版账号</a
            >
        </div>
    </div>
</template>

<script>
import { createTeam, getMyTeams } from "@/service/team/team.js";
import teamform from "@/components/team/org/teamform.vue";
import User from "@jx3box/jx3box-common/js/user.js";
export default {
    name: "AddOrg",
    props: [],
    data() {
        return {
            form: {
                name: "",
                client: this.$store.state.client,
                server: "",
                logo: "",
                desc: "",
                recruit: "",
                tv_type: "",
                tv: "",
                v_member: 99,
                v_dkp: 99,
                v_activity: 99,
                v_comment: 99,
                yy_channel: "",
                qq_group: "",
                tags: [],
                wiki: "",
            },
            // done: false,
            status: true,
            total: 0,
            processing: false,
        };
    },
    methods: {
        submit: function () {
            this.processing = true;
            createTeam(this.form)
                .then((res) => {
                    this.$message({
                        message: "创建成功",
                        type: "success",
                    });
                    this.$router.push("/org/manage");
                    // this.done = true;
                })
                .finally(() => {
                    this.processing = false;
                });
        },
        goBack: function () {
            this.$router.push("/org/manage");
        },
    },
    mounted: function () {
        getMyTeams().then((res) => {
            this.total = res.data.data.page.total;

            // 非专业会员仅能创建1支队伍
            if (this.total) {
                User.isPRO().then((data) => {
                    this.status = data;
                });
            }
        });
        this.form.client = this.client;
    },
    components: {
        teamform,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/add_org.less";
</style>
