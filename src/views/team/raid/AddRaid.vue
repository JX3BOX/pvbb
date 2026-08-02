<template>
    <div class="v-raid-build" v-loading="loading">
        <h1 class="m-title">
            <i class="el-icon-s-flag"></i>
            <span class="u-txt">{{ $t("team.raid.common.create") }}</span>
            <div class="u-op">
                <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">{{ $t("team.raid.common.back") }}</el-button>
                <!-- <el-button
                    slot="reference"
                    class="u-template"
                    type="success"
                    size="small"
                    icon="el-icon-document-copy"
                    @click="openTemplates"
                >使用模板</el-button> -->
            </div>
        </h1>
        <el-alert v-if="!teams.length" :title="$t('team.raid.legacy.noPermission')" type="warning" show-icon></el-alert>
        <!-- 排表表单 -->
        <div class="m-raid-form" v-else>
            <el-form ref="form" :model="form" label-width="100px" :label-position="position">
                <el-form-item :label="$t('team.raid.form.team')">
                    <el-select
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
                </el-form-item>
                <el-form-item :label="$t('team.raid.form.name')">
                    <el-input
                        v-model="form.name"
                        :placeholder="$t('team.raid.legacy.contentPlaceholder')"
                        v-if="isCustomEvent"
                        :minlength="2"
                        :maxlength="20"
                        style="width: 217px"
                    ></el-input>
                    <el-select
                        v-model="preset"
                        :placeholder="$t('team.raid.form.selectActivity')"
                        @change="handleNameChange"
                        filterable
                        value-key="name"
                        v-else
                    >
                        <el-option
                            v-for="item in presets"
                            :key="item.map_id"
                            :label="item.name"
                            :value="item"
                        ></el-option>
                    </el-select>
                    <span class="u-tip" v-if="!isCustomEvent">
                        <el-button link @click="defineEvent" icon="Edit">{{ $t("team.raid.form.custom") }}</el-button>
                    </span>
                    <span class="u-tip" v-else>
                        <el-button link @click="isCustomEvent = false" icon="Close">{{ $t("team.raid.common.cancel") }}</el-button>
                    </span>
                </el-form-item>
                <el-form-item :label="$t('team.raid.form.size')" v-if="isCustomEvent">
                    <div class="m-raid-form-size">
                        <el-select
                            class="u-demo"
                            v-model="sample"
                            :placeholder="$t('team.raid.legacy.selectSize')"
                            @change="changeDefaultSize"
                            value-key="label"
                        >
                            <el-option
                                v-for="(item, key) in samples"
                                :key="key"
                                :value="item"
                                :label="item['label']"
                            ></el-option>
                        </el-select>
                        <span class="u-custom-form" v-show="isCustomSize">
                            <el-tooltip class="item" effect="dark" :content="$t('team.raid.legacy.perGroup')" placement="top">
                                <el-input-number
                                    class="u-custom-item u-custom-row"
                                    v-model.number="form.row"
                                    :placeholder="$t('team.raid.legacy.rows')"
                                    :min="0"
                                    :max="5"
                                ></el-input-number>
                            </el-tooltip>
                            <el-tooltip class="item" effect="dark" :content="$t('team.raid.legacy.groupCount')" placement="top">
                                <el-input-number
                                    class="u-custom-item u-custom-col"
                                    v-model.number="form.col"
                                    :placeholder="$t('team.raid.legacy.columns')"
                                    :min="0"
                                    :max="5"
                                ></el-input-number>
                            </el-tooltip>
                            <span class="u-custom-item u-custom-count">{{ $t("team.raid.legacy.capacity", { count: form.row * form.col }) }}</span>
                        </span>
                    </div>
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
                <el-form-item :label="$t('team.raid.form.notesPlaceholder')">
                    <el-input
                        v-model="form.desc"
                        :placeholder="$t('team.raid.form.notesHint')"
                        show-word-limit
                        :maxlength="300"
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
                <el-form-item>
                    <template #label>
                        <el-tooltip :content="$t('team.raid.legacy.autoConflict')"
                            ><span>{{ $t("team.raid.legacy.advanced") }} <i class="el-icon-info"></i></span
                        ></el-tooltip>
                    </template>
                    <el-checkbox
                        v-model.number="form.force_match"
                        :disabled="!!form.auto_accept"
                        :true-value="1"
                        :false-value="0"
                        >{{ $t("team.raid.legacy.forceMatch") }}</el-checkbox
                    >
                    <el-checkbox
                        v-model.number="form.auto_accept"
                        :disabled="!isVerified"
                        :true-value="1"
                        :false-value="0"
                        >{{ $t("team.raid.legacy.autoApprove") }}</el-checkbox
                    >
                </el-form-item>
                <el-form-item :label="$t('team.raid.form.time')">
                    <el-date-picker
                        v-model="form.start_time"
                        type="datetime"
                        :placeholder="$t('team.raid.legacy.selectStart')"
                        default-time="19:00:00"
                        :picker-options="{ firstDayOfWeek: 1 }"
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

                <el-form-item>
                    <el-button class="u-btn" type="primary" @click="submit()" :disabled="processing">{{ $t("team.raid.common.create") }}</el-button>
                    <!-- <el-button class="u-btn" @click="saveAsTemplate" :disabled="processing">另存为模板</el-button> -->
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
// Modules
import TemplateList from "@/components/team/raid/TemplateList.vue";

// Service
import { getTeam, getMyPowerTeams } from "@/service/team/team.js";
import { addRaid, updateRaid, addRaidTemplate, getRaidTemplate, getRaidPresets } from "@/service/team/raid.js";
import { checkMyAuthority } from "@/service/team/member.js";

// JSON
import samples from "@/assets/data/team/team_templates.json";
import server_map from "@jx3box/jx3box-data/data/server/server_map.json";

import cloneDeep from "lodash/cloneDeep";
import pick from "lodash/pick";
import localforage from "localforage";

export default {
    name: "AddRaid",
    props: [],
    data: function () {
        return {
            // 表单
            form: {
                team_id: "",
                server: "",
                team_name: "",
                name: "",
                title: "",
                desc: "",
                auth: 0,
                start_time: "",
                leader: "",
                is_public: 0,
                auto_accept: 0,
                force_match: 1, // 强制匹配
                //content: [], //v2新版将不再提交该字段
                row: 5,
                col: 5,
                count: 25,
            },

            // 队伍
            team: "",
            teams: [],
            teamClient: "",
            auth_map: {},

            // 预设活动
            preset: "",
            presets: [],
            isCustomEvent: false,

            // 自定义规格
            sample: samples[0],
            samples,

            // misc杂项
            position: window.innerWidth < 768 ? "top" : "left",
            processing: false,
            loading: false,

            // template相关
            template_dialog_visible: false,
            // 定时器
            timer: null,
        };
    },
    computed: {
        teamId: function () {
            return this.form.team_id || "";
        },
        isVerified: function () {
            return this.team && this.team.status;
        },
        client: function () {
            return this.$store.state.client;
        },
        isCustomSize: function () {
            return this.sample.key == "custom";
        },

        // count: function() {
        //     return this.form.row * this.form.col;
        // },
        // 真正有效名单长度
        // count_normal: function() {
        //     return this.form.content.filter((item) => {
        //         return item.name;
        //     }).length;
        // },
    },
    watch: {
        "form.team_id": function (team_id) {
            const curTeam = this.teams.find((team) => team.ID === team_id);
            this.teamClient = server_map[curTeam.server]?.client;
            this.loadTeam();
        },
        // 更改活动
        preset: {
            immediate: true,
            handler: function (item) {
                this.form.name = item.name;
                this.form.count = item.count;
                this.form.col = item.col;
                this.form.row = item.row;
            },
        },
        "form.auto_accept": function (val) {
            if (val) this.form.force_match = 0;
        },
    },
    methods: {
        // 加载数据
        // ===========================
        // 加载一批团队并设置初始值
        loadTeams: function () {
            getMyPowerTeams("r_raid").then(async (res) => {
                this.teams = res.data.data.list;
                const value = await localforage.getItem("currentTeam");

                if (value) {
                    this.form.team_id = value["ID"];
                    this.form.team_name = value["name"];
                    this.form.server = value["server"];

                    if (value["status"]) {
                        this.form.is_public = 1;
                    }
                } else {
                    this.form.team_id = this.teams[0]["ID"];
                    this.form.team_name = this.teams[0]["name"];
                    this.form.server = this.teams[0]["server"];

                    if (this.teams[0]["status"]) {
                        this.form.is_public = 1;
                    }
                }
            });
        },
        // 变更团队（下拉选择/使用模板）
        loadTeam: function () {
            getTeam(this.teamId).then((res) => {
                if (res.data.data) {
                    this.team = res.data.data;
                    this.form.team_name = res.data.data.name;
                    this.form.server = res.data.data.server;
                }
                this.getAuthority();
            });
        },
        // 获取队伍权限
        getAuthority: function () {
            return checkMyAuthority(this.teamId).then((res) => {
                this.auth_map = res.data.data;
                this.$store.commit("setManageStatus", this.auth_map.r_raid === 1 || this.auth_map.authority === 99);
                this.$store.commit("setIsTeammate", this.auth_map.authority >= 2);
            });
        },
        // 获取活动名称
        loadRaidPresets: function () {
            getRaidPresets(this.client).then((res) => {
                this.presets = res?.data?.data || [];
                this.preset = this.presets[0] || "";
            });
        },

        // 排表相关
        // ===========================
        // 选择活动名称，自动更改规格
        handleNameChange: function () {
            this.form.row = this.preset["row"];
            this.form.col = this.preset["col"];
            this.form.count = this.preset["count"];
        },
        defineEvent: function () {
            this.isCustomEvent = true;
        },
        // 选择自定义规格
        changeDefaultSize: function (schema) {
            this.sample = schema;
            // this.form.content = samples[schema]["data"];
            if (!this.isCustomSize) {
                this.form.row = schema["row"];
                this.form.col = schema["col"];
                this.form.count = schema["count"];
            }
        },

        // 发布与更新
        // ===========================
        validForm: function () {
            if (!this.form.title) this.form.title = `【${this.form.team_name}】${this.form.name}`;
            if (!this.form.start_time) this.form.start_time = new Date();
            // 如果已经人满不要再发布在招募上
            // if(this.count_normal == this.count){
            //     this.form.is_public = 0
            // }

            // 人数变更
            if (this.isCustomSize) {
                this.form.count = ~~this.form.row * ~~this.form.col; //规格总数
            }
        },
        submit: function (isAuto = false) {
            // 自动补填字段
            this.validForm();

            this.processing = true;

            const data = pick({ ...this.form, client: this.teamClient || this.client }, [
                "team_id",
                "server",
                "client",
                "team_name",
                "name",
                "title",
                "desc",
                "leader",
                "auth",
                "start_time",
                "is_public",
                "auto_accept",
                "force_match",
                "count",
                "row",
                "col",
            ]);

            addRaid(data)
                .then((res) => {
                    this.$message({
                        message: this.$t("team.raid.legacy.created"),
                        type: "success",
                    });
                    // if (isAuto) {
                    this.$router.push(`/raid/${res?.data?.data?.id}`);
                    // } else {
                    // this.$router.push("/raid/manage");
                    // }
                })
                .finally(() => {
                    this.isAuto = false;
                    this.processing = false;
                });
        },

        // 其它
        // ===========================
        goBack: function () {
            this.$router.push("/raid/manage");
        },

        // 初始化
        // ===========================
        init: function () {
            this.loadTeams();
            this.loadRaidPresets();
        },
    },
    mounted: function () {
        this.init();
    },
    components: {
        // Raid,
        // TemplateList,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/build_raid.less";
</style>
