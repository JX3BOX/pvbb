<template>
    <div class="v-org-verify">
        <!-- <h1 class="m-title"><i class="el-icon-postcard"></i> 团队认证</h1> -->
        <RightSideMsg class="m-org-verify-ac">
            <div class="m-org-verify-info">
                <h3>【声明与特权】</h3>
                <p>① 工作室的团队认证申请将不予受理，提交此申请默认代表您已承诺您的团队的真实性合法性。</p>
                <p>
                    ② 经过团队认证的团队将可以享受部分团队平台的特殊功能，网站的赛事及特定活动均只有认证团队可以参与。
                </p>
                <p>③ 团队认证审核结果的最终解释权由魔盒公证团队所有。</p>
            </div>
        </RightSideMsg>
        <RightSideMsg>
            <div class="m-org-verify-info">
                <h3>【认证步骤】</h3>
                <p>① 在本页面提交申请，等待公证团队审核。</p>
                <p>② 一旦修改团队名称或队徽，将需要重新提交认证。</p>
                <p>
                    ③ 请务必加入【认证团长群】（QQ群：
                    <a
                        href="https://qm.qq.com/q/O3fXaqtAwS"
                        class="el-button el-button--primary el-button--small is-plain"
                        target="_blank"
                        >915477780</a
                    >），此群禁止聊天，只用于发送重要活动通知，请勿屏蔽。
                </p>
                <p>
                    ④ 可选择加入【团长群】（QQ群：<a
                        href="https://jq.qq.com/?_wv=1027&k=MglORFXo"
                        class="el-button el-button--primary el-button--small is-plain"
                        target="_blank"
                        >「正式服」785597424</a
                    >、<a
                        href="https://jq.qq.com/?_wv=1027&k=MXEj10bv"
                        class="el-button el-button--primary el-button--small is-plain"
                        target="_blank"
                        >「怀旧服」528707506</a
                    >），此群可邀请团队内的其它管理一起加入，用于团长之间沟通。
                </p>
                <div class="m-org-verify-alert">
                    <el-alert v-if="done" type="success" show-icon class="u-warning">
                        <router-link to="/org/manage" arget="_blank" class="u-org-verify-alert-a"
                            >提交成功，请等待审核</router-link
                        >
                    </el-alert>
                </div>

                <team-verify-form
                    :data="form"
                    @submit="submit"
                    :done="done"
                    :has-applied="hasApplied"
                    btn_txt="提交认证"
                />
            </div>
        </RightSideMsg>
        <team-verify-logs @update:status="updateStatus" ref="logs" />
    </div>
</template>

<script>
import { auditTeam, verifyTeam } from "@/service/team/verify.js";
import { getTeam } from "@/service/team/team.js";
import team_verify from "@/components/team/org/team_verify.vue";
import team_verify_logs from "@/components/team/org/team_verify_logs.vue";
export default {
    name: "VerifyOrg",
    props: [],
    data: function () {
        return {
            form: {
                name: "",
                server: "",
                team_id: "",
                proposer: "",
            },
            done: false,
            hasApplied: false,
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
        data: function () {
            return {
                proposer: this.form.proposer,
            };
        },
    },
    methods: {
        init: function () {
            getTeam(this.id).then((res) => {
                this.form = res.data.data;
            });
            this.$nextTick(() => {
                this.$refs.logs.init();
            });
        },
        submit: function () {
            auditTeam(this.form.name).then((res) => {
                let result = res.data.data.is_exist;
                if (result) {
                    this.$alert("存在同名工作室名称无法认证", "消息", {
                        confirmButtonText: "确定",
                    });
                } else {
                    verifyTeam(this.id, this.data).then((res) => {
                        this.done = true;
                    });
                }
                this.init();
            });
        },
        updateStatus: function (val) {
            this.hasApplied = val == 0;
        },
    },
    mounted: function () {
        this.init();
    },
    components: {
        "team-verify-form": team_verify,
        "team-verify-logs": team_verify_logs,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/verify_org.less";
</style>
