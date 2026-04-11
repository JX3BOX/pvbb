<template>
    <div class="v-raid-build" v-loading="loading">
        <h1 class="m-title">
            <i class="el-icon-s-flag"></i>
            <span class="u-txt">{{ id ? "编辑" : "创建" }}活动</span>
            <div class="u-op">
                <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">返回列表</el-button>
                <el-button v-if="id" class="u-delete" type="danger" size="small" icon="Delete" @click="deleteRaid"
                    >删除活动</el-button
                >
                <el-button
                    v-else
                    class="u-template"
                    type="success"
                    size="small"
                    icon="DocumentCopy"
                    @click="openTemplates"
                    >使用模板</el-button
                >
            </div>
        </h1>
        <el-alert v-if="!id && !teams.length" title="没有任何团队的排表权限" type="warning" show-icon></el-alert>
        <!-- 排表表单 -->
        <div class="m-raid-form" v-else>
            <el-form ref="form" :model="form" label-width="100px" :label-position="position">
                <el-form-item label="所属团队">
                    <el-select
                        v-if="!id"
                        class="m-select-org"
                        v-model.number="form.team_id"
                        placeholder="请选择团队"
                        size="medium"
                        filterable
                        popper-class="m-select-org-options"
                    >
                        <el-option v-for="(item, i) in teams" :key="i" :label="item.name" :value="item.ID">
                            <img class="u-org-logo" :src="item.logo" v-if="item.logo" />
                            <img class="u-org-logo" src="@/assets/img/team/null.png" v-else />
                            <span class="u-org-name">{{ item.name }}</span>
                        </el-option>
                    </el-select>
                    <el-input v-model="form.team_name" :disabled="true" v-else></el-input>
                </el-form-item>
                <el-form-item label="活动名称">
                    <el-select v-model="form.name" placeholder="请选择活动" filterable allow-create>
                        <el-option
                            v-for="item in raids"
                            :key="item.label"
                            :label="item.label"
                            :value="item.label"
                        ></el-option>
                    </el-select>
                    <span class="u-tip">(可自定义)</span>
                </el-form-item>
                <el-form-item label="活动标题">
                    <el-input
                        v-model="form.title"
                        placeholder="请输入内容"
                        show-word-limit
                        :maxlength="50"
                        :minlength="5"
                    ></el-input>
                </el-form-item>
                <el-form-item label="活动说明">
                    <el-input
                        v-model="form.desc"
                        placeholder="可对活动的拍卖价格和补贴规则等作补充说明"
                        show-word-limit
                        :maxlength="100"
                        type="textarea"
                    ></el-input>
                </el-form-item>
                <el-form-item label="报名条件" class="u-auth">
                    <el-radio-group v-model.number="form.auth">
                        <el-radio :value="0">所有人可报名</el-radio>
                        <el-radio :value="1">
                            <el-tooltip class="item" effect="dark" content="可查看角色信息与装备" placement="top">
                                <span>仅认证角色</span>
                            </el-tooltip>
                        </el-radio>
                        <el-radio :value="2">仅团员可报名</el-radio>
                        <el-radio :value="3">仅管理员指定</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="活动时间">
                    <el-date-picker
                        v-model="form.start_time"
                        type="datetime"
                        placeholder="选择开团时间"
                        default-time="19:00:00"
                    ></el-date-picker>
                </el-form-item>
                <el-form-item label="开组角色">
                    <span slot="label">
                        <el-tooltip class="item" effect="dark" content="用于游戏内插件点击指定角色进组" placement="top">
                            <span>
                                开组角色
                                <i class="el-icon-info"></i>
                            </span>
                        </el-tooltip>
                    </span>
                    <el-input
                        class="u-leader"
                        v-model="form.leader"
                        placeholder="请填写队长角色名称"
                        show-word-limit
                        :maxlength="12"
                        :minlength="2"
                    ></el-input>
                </el-form-item>
                <el-form-item label="是否广播">
                    <span slot="label">
                        <el-tooltip
                            class="item"
                            effect="dark"
                            content="仅认证团队可广播，禁止工作室广告，违者永久禁言"
                            placement="top"
                        >
                            <span>
                                是否广播
                                <i class="el-icon-info"></i>
                            </span>
                        </el-tooltip>
                    </span>
                    <el-checkbox
                        v-model.number="form.is_public"
                        :disabled="!isVerified"
                        :true-value="1"
                        :false-value="0"
                        >显示在活动大厅</el-checkbox
                    >
                </el-form-item>
                <el-form-item label="团队排表">
                    <div class="m-raid-form-size">
                        <!-- 仅在新建时推荐规格 -->
                        <el-select
                            class="u-demo"
                            v-model="preset"
                            placeholder="请选择团队规格"
                            @change="changeDefaultSize"
                            v-if="!id"
                        >
                            <el-option
                                v-for="(item, key) in samples"
                                :key="key"
                                :value="key"
                                :label="item['label']"
                            ></el-option>
                        </el-select>
                        <span class="u-custom-form" v-show="(!id && isCustom) || id">
                            <el-tooltip class="item" effect="dark" content="每小队人数" placement="top">
                                <el-input-number
                                    class="u-custom-item u-custom-row"
                                    v-model.number="form.row"
                                    placeholder="行"
                                    :min="0"
                                    :max="10"
                                ></el-input-number>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" content="小队总数" placement="top">
                                <el-input-number
                                    class="u-custom-item u-custom-col"
                                    v-model.number="form.col"
                                    placeholder="列"
                                    :min="0"
                                ></el-input-number>
                            </el-tooltip>
                            <span class="u-custom-item u-custom-count"></span>
                        </span>
                    </div>
                    <Raid
                        @updateMembers="updateContent"
                        @updateCount="updateCount"
                        :preset="preset"
                        :count="count"
                        :team-id="teamId"
                        :leader="form.leader"
                        :template-id="form.id"
                        :content="form.content"
                        :row="form.row"
                        :col="form.col"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button class="u-btn" type="primary" @click="submit" :disabled="processing">{{
                        id ? "更新" : "创建"
                    }}</el-button>
                    <el-button class="u-btn" @click="saveAsTemplate" :disabled="processing">另存为模板</el-button>
                </el-form-item>
            </el-form>
        </div>
        <!-- 模板相关 -->
        <el-dialog title="模板列表" v-model="template_dialog_visible" destory-on-close>
            <template-list :team-id="teamId" @close="handleTemplateClose" @apply="handleApply"></template-list>
        </el-dialog>
    </div>
</template>

<script>
// Modules
import User from "@jx3box/jx3box-common/js/user.js";
import Raid from "@/components/team/raid/Raid.vue";
import TemplateList from "@/components/team/raid/TemplateList.vue";

// Service
import { getTeam, getMyPowerTeams } from "@/service/team/team.js";
import {
    addRaid,
    updateRaid,
    getRaid,
    deleteRaid,
    // addRaidTemplate,
    // getRaidTemplate,
} from "@/service/team/raid.js";

// JSON
import raids from "@/assets/data/raids.json";
import samples from "@/assets/data/team/team_templates.json";
import sample from "@/assets/data/team/team_template_item.json";

import cloneDeep from "lodash/cloneDeep";

const form_default = {
    team_id: "",
    server: "",
    team_name: "",
    name: raids[0]["label"],
    title: "",
    desc: "",
    auth: 0,
    start_time: "",
    leader: "队长名字",
    is_public: 0,
    content: [],

    // 自动缓存
    count_total: 0,
    count_normal: 0,
    count_sub: 0,
    count_tobe: 0,
};
export default {
    name: "BuildRaid",
    props: [],
    data: function () {
        return {
            // 表单
            form: {
                team_id: "",
                server: "",
                team_name: "",
                name: raids[0]["label"],
                title: "",
                desc: "",
                auth: 0,
                start_time: "",
                leader: "队长名字",
                is_public: 0,
                content: [],
                row: 5,
                col: 5,

                // 自动缓存
                count_total: 0,
                count_normal: 0,
                count_sub: 0,
                count_tobe: 0,
            },

            // options项
            teams: [],
            raids,
            team: "",

            // misc杂项
            position: window.innerWidth < 768 ? "top" : "left",
            processing: false,
            loading_leader: false,

            // template相关
            template_dialog_visible: false,
            samples,
            loading: false,

            // 排表核心模块
            preset: "25std",
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
        teamId: function () {
            return this.form.team_id || "";
        },
        isCustom: function () {
            return this.preset == "custom";
        },
        selectdTeam: function () {
            let team_id = this.form.team_id;
            for (let team of this.teams) {
                if (team.ID == team_id) {
                    return team;
                }
            }
            return "";
        },
        isVerified: function () {
            if (!this.id) {
                return (this.selectdTeam && this.selectdTeam["status"]) || false;
            } else {
                return (this.team && this.team.status) || false;
            }
        },
        teamName: function () {
            return this.form.team_name;
        },
        teamServer: function () {
            return this.form.server;
        },
        count: function () {
            return this.form.row * this.form.col;
        },
    },
    watch: {
        "form.team_id": function (val) {
            // 仅新建模式
            if (!this.id) {
                this.form.server = this.team.server;
                this.form.team_name = this.team.name;
                this.team = this.selectdTeam;
            }
        },
        count: function (val) {
            let current_length = this.form.content.length;
            let diff = val - current_length;
            // 有新增,推入新空白项
            if (diff > 0) {
                for (let i = 0; i < val - current_length; i++) {
                    this.form.content.push(cloneDeep(sample));
                }
                // 有减少则从后往前删除
            } else if (diff < 0) {
                this.form.content.splice(current_length + diff, Math.abs(diff));
            }
        },
    },
    methods: {
        // 发布与更新
        submit: function () {
            // 自动补填字段
            this.validForm();

            this.processing = true;
            // 新建
            if (!this.id) {
                addRaid(this.form)
                    .then((res) => {
                        this.$message({
                            message: "创建成功",
                            type: "success",
                        });
                        this.$router.push("/raid/manage");
                    })
                    .finally(() => {
                        this.processing = false;
                    });
                // 编辑
            } else {
                updateRaid(this.id, this.form)
                    .then((res) => {
                        this.$message({
                            message: "更新成功",
                            type: "success",
                        });
                    })
                    .finally(() => {
                        this.processing = false;
                    });
            }
        },
        validForm: function () {
            if (!this.form.title) this.form.title = `【${this.team.team_name}】${this.form.name}`;
            if (!this.form.start_time) this.form.start_time = new Date();

            // 人数变更
            this.form.count_total = this.form.row * this.form.col; //规格总数
            this.form.count_normal = this.form.content.length; //当前数
        },

        // 删除
        deleteRaid: function () {
            this.$alert("确定删除团队活动吗？", "消息", {
                confirmButtonText: "确定",
                callback: (action) => {
                    if (action == "confirm") {
                        deleteRaid(this.teamId, this.id).then((res) => {
                            this.$notify({
                                title: "删除成功",
                                message: "活动删除成功",
                                type: "success",
                            });
                            this.$router.push("/raid/manage");
                        });
                    }
                },
            });
        },

        // 模板相关
        /* openTemplates: function () {
            this.template_dialog_visible = true;
        },
        saveAsTemplate: function () {
            this.$prompt("请输入模板名称", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputValidator: (val) => {
                    if (!val) return "请输入模板名称";
                    if (val.length < 2) return "模板名称长度不能小于2个字符";
                    if (val.length > 30) return "模板名称长度不能超过30个字符";
                },
                beforeClose: (action, instance, done) => {
                    if (action === "cancel") {
                        done();
                    }
                    if (action === "confirm") {
                        const templte = cloneDeep(this.form);
                        templte.template_name = instance.inputValue;
                        addRaidTemplate(templte)
                            .then((res) => {
                                this.$message({
                                    type: "success",
                                    message: "模板保存成功",
                                });
                                done();
                            })
                            .catch((error) => {
                                this.$message({
                                    type: "error",
                                    message: error,
                                });
                            });
                    }
                },
            });
        },
        handleTemplateClose() {
            this.template_dialog_visible = false;
        },
        handleApply(row) {
            this.loading = true;
            getRaidTemplate(row.id)
                .then((res) => {
                    this.form = res.data.data;
                    this.template_dialog_visible = false;
                })
                .then(() => {
                    this.loadTeam();
                })
                .finally(() => {
                    this.loading = false;
                });
        }, */

        // 排表相关
        changeDefaultSize: function (schema) {
            this.preset = schema;
            this.form.content = [];
            this.form.row = samples[schema]["row"];
            this.form.col = samples[schema]["col"];
        },
        updateContent: function (data) {
            this.form.content = data;
        },
        updateCount: function (data) {
            this.form.count_sub = data["count_sub"];
            this.form.count_tobe = data["count_tobe"];
        },

        // 创建时加载一批团队并设置初始值
        loadTeams: function () {
            getMyPowerTeams("r_raid").then((res) => {
                this.teams = res.data.data.list;
                this.form.team_id = this.teams[0]["ID"];
                this.form.team_name = this.teams[0]["name"];
                this.form.server = this.teams[0]["server"];
            });
        },
        // 编辑时加载一个团队
        loadTeam: function () {
            getTeam(this.teamId).then((res) => {
                if (res.data.data) {
                    this.team = res.data.data;
                    this.form.team_name = res.data.data.name;
                    this.form.server = res.data.data.server;
                }
            });
        },
        loadRaid: function () {
            this.loading = true;
            getRaid(this.id)
                .then((res) => {
                    let data = res.data.data;
                    if (data) this.form = res.data.data;
                })
                .then(() => {
                    this.loadTeam();
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        init: function () {
            // 新建
            if (!this.id) {
                this.loadTeams();
                // 编辑
            } else {
                this.loadRaid();
            }
        },
        goBack: function () {
            this.$router.push("/raid/manage");
        },
    },
    mounted: function () {
        this.init();
    },
    components: {
        Raid,
        TemplateList,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/build_raid.less";
</style>
