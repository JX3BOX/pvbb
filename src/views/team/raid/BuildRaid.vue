<template>
    <div class="v-raid-build" v-loading="loading">
        <h1 class="m-title">
            <i class="el-icon-s-flag"></i>
            <span class="u-txt">{{ $t(id ? "team.raid.common.edit" : "team.raid.common.create") }}</span>
            <div class="u-op">
                <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">{{ $t("team.raid.common.back") }}</el-button>
                <el-button v-if="id" class="u-delete" type="danger" size="small" icon="Delete" @click="deleteRaid"
                    >{{ $t("team.raid.common.delete") }}</el-button
                >
                <el-button
                    v-else
                    class="u-template"
                    type="success"
                    size="small"
                    icon="DocumentCopy"
                    @click="openTemplates"
                    >{{ $t("team.raid.legacy.useTemplate") }}</el-button
                >
            </div>
        </h1>
        <el-alert v-if="!id && !teams.length" :title="$t('team.raid.legacy.noPermission')" type="warning" show-icon></el-alert>
        <!-- 排表表单 -->
        <div class="m-raid-form" v-else>
            <el-form ref="form" :model="form" label-width="100px" :label-position="position">
                <el-form-item :label="$t('team.raid.form.team')">
                    <el-select
                        v-if="!id"
                        class="m-select-org"
                        v-model.number="form.team_id"
                        :placeholder="$t('team.raid.form.selectTeam')"
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
                <el-form-item :label="$t('team.raid.form.name')">
                    <el-select v-model="form.name" :placeholder="$t('team.raid.form.selectActivity')" filterable allow-create>
                        <el-option
                            v-for="item in raids"
                            :key="item.label"
                            :label="item.label"
                            :value="item.label"
                        ></el-option>
                    </el-select>
                    <span class="u-tip">{{ $t("team.raid.legacy.customAllowed") }}</span>
                </el-form-item>
                <el-form-item :label="$t('team.raid.form.title')">
                    <el-input
                        v-model="form.title"
                        :placeholder="$t('team.raid.legacy.contentPlaceholder')"
                        show-word-limit
                        :maxlength="50"
                        :minlength="5"
                    ></el-input>
                </el-form-item>
                <el-form-item :label="$t('team.raid.form.notes')">
                    <el-input
                        v-model="form.desc"
                        :placeholder="$t('team.raid.form.notesHint')"
                        show-word-limit
                        :maxlength="100"
                        type="textarea"
                    ></el-input>
                </el-form-item>
                <el-form-item :label="$t('team.raid.form.condition')" class="u-auth">
                    <el-radio-group v-model.number="form.auth">
                        <el-radio :value="0">{{ $t("team.raid.auth.0") }}</el-radio>
                        <el-radio :value="1">
                            <el-tooltip class="item" effect="dark" :content="$t('team.raid.legacy.verifiedHint')" placement="top">
                                <span>{{ $t("team.raid.form.verifiedRole") }}</span>
                            </el-tooltip>
                        </el-radio>
                        <el-radio :value="2">{{ $t("team.raid.auth.2") }}</el-radio>
                        <el-radio :value="3">{{ $t("team.raid.auth.3") }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item :label="$t('team.raid.form.time')">
                    <el-date-picker
                        v-model="form.start_time"
                        type="datetime"
                        :placeholder="$t('team.raid.legacy.selectStart')"
                        default-time="19:00:00"
                    ></el-date-picker>
                </el-form-item>
                <el-form-item :label="$t('team.raid.form.leader')">
                    <template #label>
                        <el-tooltip class="item" effect="dark" :content="$t('team.raid.form.leaderHint')" placement="top">
                            <span>
                                {{ $t("team.raid.form.leader") }}
                                <i class="el-icon-info"></i>
                            </span>
                        </el-tooltip>
                    </template>
                    <el-input
                        class="u-leader"
                        v-model="form.leader"
                        :placeholder="$t('team.raid.legacy.leaderPlaceholder')"
                        show-word-limit
                        :maxlength="12"
                        :minlength="2"
                    ></el-input>
                </el-form-item>
                <el-form-item :label="$t('team.raid.legacy.broadcast')">
                    <template #label>
                        <el-tooltip
                            class="item"
                            effect="dark"
                            :content="$t('team.raid.legacy.broadcastHint')"
                            placement="top"
                        >
                            <span>
                                {{ $t("team.raid.legacy.broadcast") }}
                                <i class="el-icon-info"></i>
                            </span>
                        </el-tooltip>
                    </template>
                    <el-checkbox
                        v-model.number="form.is_public"
                        :disabled="!isVerified"
                        :true-value="1"
                        :false-value="0"
                        >{{ $t("team.raid.legacy.showLobby") }}</el-checkbox
                    >
                </el-form-item>
                <el-form-item :label="$t('team.raid.legacy.roster')">
                    <div class="m-raid-form-size">
                        <!-- 仅在新建时推荐规格 -->
                        <el-select
                            class="u-demo"
                            v-model="preset"
                            :placeholder="$t('team.raid.legacy.selectSize')"
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
                            <el-tooltip class="item" effect="dark" :content="$t('team.raid.legacy.perGroup')" placement="top">
                                <el-input-number
                                    class="u-custom-item u-custom-row"
                                    v-model.number="form.row"
                                    :placeholder="$t('team.raid.legacy.rows')"
                                    :min="0"
                                    :max="10"
                                ></el-input-number>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" :content="$t('team.raid.legacy.groupCount')" placement="top">
                                <el-input-number
                                    class="u-custom-item u-custom-col"
                                    v-model.number="form.col"
                                    :placeholder="$t('team.raid.legacy.columns')"
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
                        $t(id ? "team.raid.legacy.update" : "team.raid.common.create")
                    }}</el-button>
                    <el-button class="u-btn" @click="saveAsTemplate" :disabled="processing">{{ $t("team.raid.legacy.saveTemplate") }}</el-button>
                </el-form-item>
            </el-form>
        </div>
        <!-- 模板相关 -->
        <template-list
            :team-id="teamId"
            v-model:visible="template_dialog_visible"
            @close="handleTemplateClose"
            @apply="handleApply"
        ></template-list>
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
    addRaidTemplate,
    getRaidTemplate,
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
    leader: "",
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
                leader: "",
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
                this.team = this.selectdTeam;
                this.form.server = this.team?.server || "";
                this.form.team_name = this.team?.name || "";
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
                            message: this.$t("team.raid.legacy.created"),
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
                            message: this.$t("team.raid.legacy.updated"),
                            type: "success",
                        });
                    })
                    .finally(() => {
                        this.processing = false;
                    });
            }
        },
        validForm: function () {
            if (!this.form.title) this.form.title = `【${this.form.team_name}】${this.form.name}`;
            if (!this.form.start_time) this.form.start_time = new Date();

            // 人数变更
            this.form.count_total = this.form.row * this.form.col; //规格总数
            this.form.count_normal = this.form.content.length; //当前数
        },

        // 删除
        deleteRaid: function () {
            this.$alert(this.$t("team.raid.legacy.deleteConfirm"), this.$t("team.raid.item.message"), {
                confirmButtonText: this.$t("team.raid.common.confirm"),
                callback: (action) => {
                    if (action == "confirm") {
                        deleteRaid(this.teamId, this.id).then((res) => {
                            this.$notify({
                                title: this.$t("team.raid.common.deleted"),
                                message: this.$t("team.raid.legacy.deleteSuccess"),
                                type: "success",
                            });
                            this.$router.push("/raid/manage");
                        });
                    }
                },
            });
        },

        // 模板相关
        openTemplates: function () {
            this.template_dialog_visible = true;
        },
        saveAsTemplate: function () {
            this.$prompt(this.$t("team.raid.legacy.templatePrompt"), this.$t("team.raid.common.tip"), {
                confirmButtonText: this.$t("team.raid.common.confirm"),
                cancelButtonText: this.$t("team.raid.common.cancel"),
                inputValidator: (val) => {
                    if (!val) return this.$t("team.raid.legacy.templatePrompt");
                    if (val.length < 2) return this.$t("team.raid.legacy.templateMin");
                    if (val.length > 30) return this.$t("team.raid.legacy.templateMax");
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
                                    message: this.$t("team.raid.legacy.templateSaved"),
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
        },

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
                if (!this.teams.length) return;
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
