<template>
    <div class="v-raid-build" v-loading="loading">
        <h1 class="m-title">
            <i class="el-icon-s-flag"></i>
            <span class="u-txt">编辑活动</span>
            <router-link :to="'/raid/' + id" class="u-homepage" v-if="id">
                <i class="el-icon-s-home"></i>
                <span>活动主页</span>
            </router-link>
            <div class="u-op">
                <el-button class="u-delete" type="danger" size="small" icon="Delete" @click="deleteRaid"
                    >删除活动</el-button
                >
                <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">返回列表</el-button>
            </div>
        </h1>
        <!-- 排表表单 -->
        <div class="m-raid-form">
            <el-form ref="form" :model="form" label-width="100px" :label-position="position">
                <el-form-item label="所属团队">
                    <el-input v-model="form.team_name" :disabled="true"></el-input>
                </el-form-item>
                <el-form-item label="活动名称">
                    <el-input v-model="form.name" disabled></el-input>
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
                        :maxlength="300"
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
                <el-form-item>
                    <template #label>
                        <el-tooltip content="开启自动审批时不能强制匹配心法"
                            ><span>扩展设置 <i class="el-icon-info"></i></span
                        ></el-tooltip>
                    </template>
                    <el-checkbox
                        v-model.number="form.force_match"
                        :disabled="!!form.auto_accept"
                        :true-value="1"
                        :false-value="0"
                        >审批时强制匹配心法</el-checkbox
                    >
                    <el-checkbox
                        v-model.number="form.auto_accept"
                        :disabled="!isVerified"
                        :true-value="1"
                        :false-value="0"
                        >自动批准入队申请</el-checkbox
                    >
                </el-form-item>
                <el-form-item label="活动时间">
                    <el-date-picker
                        v-model="form.start_time"
                        type="datetime"
                        placeholder="选择开团时间"
                        default-time="19:00:00"
                        :picker-options="{ firstDayOfWeek: 1 }"
                    ></el-date-picker>
                </el-form-item>
                <el-form-item label="开组角色">
                    <template #label>
                        <el-tooltip class="item" effect="dark" content="用于游戏内插件点击指定角色进组" placement="top">
                            <span>
                                开组角色
                                <i class="el-icon-info"></i>
                            </span>
                        </el-tooltip>
                    </template>
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
                    <template #label>
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
                    </template>
                    <el-checkbox
                        v-model.number="form.is_public"
                        :disabled="!isVerified"
                        :true-value="1"
                        :false-value="0"
                        >显示在活动大厅</el-checkbox
                    >
                </el-form-item>
                <el-form-item>
                    <el-button class="u-btn" type="primary" @click="submit" :disabled="processing">更新</el-button>
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
                leader: "队长名字",
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
                        message: "更新成功",
                        type: "success",
                    });
                    this.$router.push(`/raid/${this.id}`);
                })
                .finally(() => {
                    this.processing = false;
                });
        },
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
