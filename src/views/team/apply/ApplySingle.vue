<template>
    <div class="m-apply-event" v-loading="loading">
        <el-button class="u-goback" icon="ArrowLeft" @click="goBack">{{ $t("team.apply.back") }}</el-button>
        <h3><i class="el-icon-present"></i>{{ data.name }}</h3>
        <div class="m-apply-info">
            <h4>{{ $t("team.apply.conditions") }}</h4>
            <div v-html="data.desc"></div>
        </div>

        <div class="m-apply-info m-apply-form">
            <h4>{{ $t("team.apply.steps") }}</h4>
            <p>① {{ $t("team.apply.step1") }}</p>
            <p>
                ②
                {{ $t("team.apply.step2") }}
            </p>
            <p>③ {{ $t("team.apply.step3") }}</p>
            <p>④ {{ $t("team.apply.step4") }}</p>

            <div class="u-box" v-if="data.status">
                <el-alert v-if="team_id && alert_info" :title="alert_info" type="warning" show-icon> </el-alert>
                <div class="u-team">
                    <span class="u-label">{{ $t("team.apply.selectTeam") }}</span>
                    <el-select v-model="team_id" :placeholder="$t('team.apply.selectTeamPlaceholder')">
                        <el-option v-for="(item, index) in team_list" :key="index" :label="item.name" :value="item.ID">
                        </el-option>
                    </el-select>
                </div>
                <component :is="template" @isEmit="applyEmit" ref="template"></component>
                <div class="u-submit">
                    <el-button type="primary" @click="toSubmit" :loading="submitLoading" :disabled="!canSubmit"
                        >{{ $t("team.apply.submit") }}</el-button
                    >
                </div>
            </div>

            <el-alert :title="$t('team.apply.unavailable')" type="info" :closable="false" show-icon v-else></el-alert>
        </div>
        <div class="m-apply-logs" v-if="logs.length">
            <h4>{{ $t("team.apply.records") }}</h4>
            <div class="m-apply-logs-table">
            <el-table :data="logs" style="width: 100%">
                <el-table-column :label="$t('team.apply.date')" width="180">
                    <template #default="scope">
                        {{ showTime(scope.row.created_at) }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('team.apply.status')" width="120">
                    <template #default="scope">
                        <span :class="`u-status${scope.row.status}`">{{ logStatus(scope.row.status) }}</span>
                    </template>
                </el-table-column>
                <el-table-column :label="$t('team.apply.team')" width="120">
                    <template #default="scope">
                        {{ logTeam(scope.row.team_id) }}
                    </template>
                </el-table-column>
                <el-table-column :label="$t('team.apply.details')">
                    <template #default="scope">
                        <extend :data="scope.row.extend" v-if="scope.row.extend" />
                    </template>
                </el-table-column>
            </el-table>
            </div>
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
                        title: this.$t("team.apply.submitted"),
                        message: this.$t("team.apply.wait"),
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
                this.alert_info = this.$t("team.apply.fillDetails");
            }
        },

        // 申请记录返回状态
        logStatus(status) {
            return [this.$t("team.apply.rejected"), this.$t("team.apply.reviewing"), this.$t("team.apply.approved")][status + 1];
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
