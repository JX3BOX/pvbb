<template>
    <div class="v-raid-build" v-loading="loading">
        <h1 class="m-title">
            <i class="el-icon-s-flag"></i>
            <span class="u-txt">{{ $t("team.raid.common.edit") }}</span>
            <router-link :to="'/raid/' + id" class="u-homepage" v-if="id">
                <i class="el-icon-s-home"></i>
                <span>{{ $t("team.raid.legacy.homepage") }}</span>
            </router-link>
            <div class="u-op">
                <el-button class="u-delete" type="danger" size="small" icon="Delete" @click="deleteRaid"
                    >{{ $t("team.raid.common.delete") }}</el-button
                >
                <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">{{ $t("team.raid.common.back") }}</el-button>
            </div>
        </h1>
        <!-- 排表表单 -->
        <div class="m-raid-form">
            <el-form ref="form" :model="form" label-width="100px" :label-position="position">
                <el-form-item :label="$t('team.raid.form.team')">
                    <el-input v-model="form.team_name" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item :label="$t('team.raid.form.name')">
                    <el-input v-model="form.name" disabled></el-input>
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
                    <el-button class="u-btn" type="primary" @click="submit" :disabled="processing">{{ $t("team.raid.legacy.update") }}</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
// Modules
import User from "@jx3box/jx3box-common/js/user.js";

// Service
import { getTeam } from "@/service/team/team.js";
import { checkMyAuthority } from "@/service/team/member.js";
import { updateRaid, getRaid, deleteRaid, addRaidTemplate } from "@/service/team/raid.js";

// JSON
import samples from "@/assets/data/team/team_templates.json";

import cloneDeep from "lodash/cloneDeep";
import pick from "lodash/pick";

export default {
    name: "EditRaid",
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
                force_match: 1,
                content: [],
                row: 5,
                col: 5,

                // 自动缓存
                count_total: 0,
                count_normal: 0,
                count_sub: 0,
                count_tobe: 0,
            },
            team: "",

            // options项
            teams: [],

            // template相关
            template_dialog_visible: false,
            samples,

            // misc杂项
            position: window.innerWidth < 768 ? "top" : "left",
            processing: false,
            loading: false,

            timer: null, // 定时器
            auth_map: {},
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        teamId: function () {
            return this.form.team_id || "";
        },
        isVerified: function () {
            return this.team && this.team.status;
        },
    },
    watch: {
        "form.team_id": function (team_id) {
            this.loadTeam();
        },
        "form.auto_accept": function (val) {
            if (val) this.form.force_match = 0;
        },
    },
    methods: {
        // 加载数据
        // ===========================
        // 加载团队（获取额外认证信息等）
        getAuthority: function () {
            return checkMyAuthority(this.teamId).then((res) => {
                this.auth_map = res.data.data;
                this.$store.commit("setManageStatus", this.auth_map.r_raid === 1 || this.auth_map.authority === 99);
                this.$store.commit("setIsTeammate", this.auth_map.authority >= 2);
            });
        },
        loadTeam: function () {
            getTeam(this.teamId).then((res) => {
                if (res.data.data) {
                    this.team = res.data.data;
                }
                this.getAuthority();
            });
        },
        // 排表信息加载（默认加载）
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

        // 模板相关
        // ===========================
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

        // 发布与更新
        // ===========================
        validForm: function () {
            if (!this.form.title) this.form.title = `【${this.form.team_name}】${this.form.name}`;
            if (!this.form.start_time) this.form.start_time = new Date();

            // 人数变更
            // this.form.count_total = ~~this.form.row * ~~this.form.col; //规格总数
            // this.form.count_normal = this.count_normal; //当前数
            // 如果已经人满不要再发布在招募上
            // if(this.form.count_normal == this.form.count_total){
            //     this.form.is_public = false
            // }
        },
        submit: function (isAuto = false) {
            // 自动补填字段
            this.validForm();

            this.processing = true;

            const data = pick(this.form, [
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

            updateRaid(this.id, data)
                .then((res) => {
                    this.$message({
                        message: this.$t("team.raid.legacy.updated"),
                        type: "success",
                    });
                    this.$router.push(`/raid/${this.id}`);
                })
                .finally(() => {
                    this.processing = false;
                });
        },
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

        // 其它
        // ===========================
        goBack: function () {
            this.$router.push("/raid/manage");
        },

        // 初始化
        // ===========================
        init: function () {
            this.loadRaid();
        },
    },
    mounted: function () {
        this.init();
        // this.timer = setInterval(() => {
        //     let isAuto = true;
        //     this.submit(isAuto)
        // }, 300000)
    },
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/build_raid.less";
</style>
