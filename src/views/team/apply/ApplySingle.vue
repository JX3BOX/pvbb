<template>
    <div class="m-apply-event" v-loading="loading">
        <el-button class="u-goback" icon="ArrowLeft" @click="goBack">返回</el-button>
        <h3><i class="el-icon-present"></i>{{ data.name }}</h3>
        <div class="m-apply-info">
            <h4>【申请条件】</h4>
            <div v-html="data.desc"></div>
        </div>

        <div class="m-apply-info m-apply-form">
            <h4>【申请步骤】</h4>
            <p>① 一旦提交后不可再次更改信息，请务确认信息准确，由用户填写错误所带来的后果由用户自行承担。</p>
            <p>
                ②
                实物类奖品不会寄送至海外或港澳台地区，请填写国内快递可达地址，由于国家管控造成的物流问题，由用户自行承担。
            </p>
            <p>③ 申请提交后，会在7个工作日内进行处理，审核驳回后需重新填写正确的信息并提交进行审核。</p>
            <p>④ 其它问题或异常请联系认证团长群（Q群：1048059072）管理人员。</p>

            <div class="u-box" v-if="data.status">
                <el-alert v-if="team_id && alert_info" :title="alert_info" type="warning" show-icon> </el-alert>
                <div class="u-team">
                    <span class="u-label">选择团队</span>
                    <el-select v-model="team_id" placeholder="选择申请的团队">
                        <el-option v-for="(item, index) in team_list" :key="index" :label="item.name" :value="item.ID">
                        </el-option>
                    </el-select>
                </div>
                <component :is="template" @isEmit="applyEmit" ref="template"></component>
                <div class="u-submit">
                    <el-button type="primary" @click="toSubmit" :loading="submitLoading" :disabled="!canSubmit"
                        >提交</el-button
                    >
                </div>
            </div>

            <el-alert :title="`活动未开启或已结束`" type="info" :closable="false" show-icon v-else></el-alert>
        </div>
        <div class="m-apply-logs" v-if="logs.length">
            <h4>申请记录</h4>
            <el-table :data="logs" style="width: 100%">
                <el-table-column label="申请日期" width="180">
                    <template #default="scope">
                        {{ showTime(scope.row.created_at) }}
                    </template>
                </el-table-column>
                <el-table-column label="申请状态" width="120">
                    <template #default="scope">
                        <span :class="`u-status${scope.row.status}`">{{ logStatus(scope.row.status) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="申请团队" width="120">
                    <template #default="scope">
                        {{ logTeam(scope.row.team_id) }}
                    </template>
                </el-table-column>
                <el-table-column label="申请详情">
                    <template #default="scope">
                        <extend :data="scope.row.extend" v-if="scope.row.extend" />
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
import { getMyManageTeams } from "@/service/team/team.js";
import { getApply, getApplyRecord, postApplyRecord, checkApply } from "@/service/team/apply.js";
import { showTime } from "@/utils/filters";
import User from "@jx3box/jx3box-common/js/user";
import author from "@/components/team/apply/author.vue";
import express from "@/components/team/apply/express.vue";
import extend from "@/components/team/apply/extend.vue";
import tifu from "@/components/team/apply/tifu.vue";
export default {
    name: "eventsApply",
    data: function () {
        return {
            loading: false,
            submitLoading: false,
            data: "",
            teams: {},
            team_list: [],

            team_id: "",
            count: 0,
            logs: [],
            alert_info: "",

            extend: "",
        };
    },
    components: { author, express, extend, tifu },
    computed: {
        event_id() {
            return ~~this.$route.params.id;
        },
        canSubmit() {
            return this.data.status && !this.alert_info && this.team_id;
        },
        template() {
            return this.data.template || "express";
        },
    },
    watch: {
        team_id(id) {
            id && this.checkApply();
        },
    },
    methods: {
        showTime,

        // 提交
        toSubmit() {
            // 字段校验
            this.checkExtend();
            if (this.alert_info) return;
            this.submitLoading = true;
            let _params = {
                team_id: this.team_id,
                key: this.data.key,
                event_id: this.event_id,
                extend: this.extend,
            };
            postApplyRecord(_params)
                .then(() => {
                    this.$notify({
                        title: "提交成功",
                        message: "请耐心等待审核",
                        type: "success",
                    });
                    this.loadLogs();
                    this.$refs?.template.reset();
                })
                .finally(() => {
                    this.submitLoading = false;
                });
        },
        // 资格检查
        checkApply() {
            this.loadLogs();
            checkApply({
                team_id: this.team_id,
                event_id: this.event_id,
            })
                .then(() => {
                    this.alert_info = "";
                })
                .catch((e) => {
                    this.alert_info = e?.data?.msg;
                });
        },
        checkExtend() {
            if (this.extend) {
                this.alert_info = "";
            } else {
                this.alert_info = "请填写申请详情";
            }
        },

        // 申请记录返回状态
        logStatus(status) {
            return ["申请驳回", "审核中", "申请通过"][status + 1];
        },
        // 申请记录团队名
        logTeam(team_id) {
            return this.team_list.find((item) => item.ID == team_id).name || team_id;
        },
        // 返回
        goBack() {
            this.$router.push({ name: "apply_list" });
        },
        // 表单返回值 extend
        applyEmit(data) {
            this.extend = data;
            this.checkExtend();
        },
        // 获取数据
        loadEventData() {
            this.loading = true;
            // 获取活动数据
            getApply(this.event_id)
                .then((res) => {
                    this.data = res.data.data || {};
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 获取团队申请记录
        loadLogs() {
            getApplyRecord({ event_id: this.event_id, team_id: this.team_id }).then((res) => {
                this.logs = res.data.data.list || [];
            });
        },
    },
    mounted() {
        getMyManageTeams().then((res) => {
            let list = res.data.data.list;
            this.team_list = list.filter((item) => item.super == User.getInfo().uid);
        });
        this.loadEventData();
    },
};
</script>
<style lang="less">
@import "@/assets/css/team/events/apply.less";
</style>
