<template>
    <div class="v-org-add p-team-create">
        <section class="m-team-create__hero" aria-labelledby="team-create-title">
            <header class="m-team-create__header">
                <div class="m-team-create__intro">
                    <span class="u-team-create-icon" aria-hidden="true">
                        <el-icon><OfficeBuilding /></el-icon>
                    </span>
                    <div class="m-team-create__heading">
                        <h1 id="team-create-title">创建团队</h1>
                        <p>建立团队身份，邀请伙伴一起记录战绩、活动、DKP 与 RAID</p>
                    </div>
                </div>
                <button class="u-team-create-back" type="button" @click="goBack">
                    <el-icon><ArrowLeft /></el-icon>
                    <span>返回团队广场</span>
                </button>
            </header>
        </section>

        <section v-if="checkingLimit" class="m-team-create__workspace is-checking" aria-live="polite">
            <span class="u-team-create-loading" aria-hidden="true"></span>
            <strong>正在检查创建权限</strong>
            <p>马上为你准备团队资料表单。</p>
        </section>

        <section v-else-if="status" class="m-team-create__workspace" aria-labelledby="team-create-form-title">
            <header class="m-team-create__form-heading">
                <div>
                    <h2 id="team-create-form-title">填写团队资料</h2>
                    <p>先完成基础资料，创建后仍可在团队档案中继续修改。</p>
                </div>
            </header>
            <teamform
                :data="form"
                variant="archive"
                btn_txt="创建团队"
                :processing="processing"
                @submit="submit"
            />
        </section>

        <section v-else class="m-team-create__limit" aria-labelledby="team-create-limit-title">
            <span class="u-team-create-limit-icon" aria-hidden="true">
                <el-icon><Lock /></el-icon>
            </span>
            <h2 id="team-create-limit-title">当前账号已达到创建上限</h2>
            <p>普通账号默认可创建 1 支团队，升级专业版后可继续创建和管理更多团队。</p>
            <div class="m-team-create__limit-actions">
                <a class="u-team-create-upgrade" href="/vip/premium?from=team_create" target="_blank">
                    <el-icon><ShoppingCart /></el-icon>
                    <span>了解专业版</span>
                </a>
                <button class="u-team-create-secondary" type="button" @click="goBack">返回团队广场</button>
            </div>
        </section>
    </div>
</template>

<script>
import { createTeam, getMyTeams } from "@/service/team/team.js";
import teamform from "@/components/team/org/teamform.vue";
import User from "@jx3box/jx3box-common/js/user.js";
import { ArrowLeft, Lock, OfficeBuilding, ShoppingCart } from "@element-plus/icons-vue";

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
                v_member: 0,
                v_dkp: 0,
                v_activity: 0,
                v_comment: 0,
                yy_channel: "",
                qq_group: "",
                tags: [],
                wiki: "",
            },
            status: false,
            total: 0,
            processing: false,
            checkingLimit: true,
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
                    const teamId = res.data?.data?.ID || res.data?.data?.id;
                    if (teamId) {
                        this.$router.push({
                            name: "view_my_org",
                            params: { id: teamId },
                            query: {
                                mode: "manage",
                                tab: "manage-member",
                            },
                        });
                    } else {
                        this.$router.push("/");
                    }
                })
                .finally(() => {
                    this.processing = false;
                });
        },
        goBack: function () {
            this.$router.push("/");
        },
    },
    mounted: function () {
        getMyTeams()
            .then((res) => {
                this.total = res.data.data.page.total;

                // 非专业会员仅能创建1支队伍
                if (this.total) {
                    return User.isPRO().then((data) => {
                        this.status = data;
                    });
                }
                this.status = true;
            })
            .finally(() => {
                this.checkingLimit = false;
            });
        this.form.client = this.client;
    },
    components: {
        ArrowLeft,
        Lock,
        OfficeBuilding,
        ShoppingCart,
        teamform,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/add_org.less";
</style>
