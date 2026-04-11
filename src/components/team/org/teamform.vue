<template>
    <div class="m-team-teamform">
        <el-form ref="form" :model="form" label-width="90px" size="large" :label-position="position">
            <el-form-item label="队徽">
                <UploadLogo v-model="form.logo" />
            </el-form-item>
            <el-form-item label="团队名称">
                <el-input
                    v-model="form.name"
                    placeholder="请输入团队名称,不能为纯数字"
                    show-word-limit
                    :minlength="2"
                    :maxlength="12"
                    @input="checkTeamName"
                ></el-input>
                <div class="u-warning" v-if="isExist">
                    <i class="el-icon-warning-outline"></i>
                    本服已有同名团队，请更换名称
                </div>
                <div class="u-warning" v-if="isNumber">
                    <i class="el-icon-warning-outline"></i>
                    团队名称不能为纯数字
                </div>
            </el-form-item>
            <el-form-item label="服务器" class="m-team-server">
                <el-select
                    placeholder="选择客户端"
                    v-model="form.client"
                    style="margin-right: 10px"
                    @change="changeClient"
                >
                    <el-option v-for="(label, value) in clients" :key="value" :value="value" :label="label"></el-option>
                </el-select>
                <el-select v-model="form.server" placeholder="请选择服务器" @change="checkTeamName">
                    <el-option
                        v-for="(server, i) in servers"
                        :key="i"
                        :label="server"
                        :value="server"
                        allow-create
                        filterable
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="团队类型">
                <el-select class="u-select-tags" v-model="form.tags" multiple placeholder="请选择（可多选）">
                    <el-option v-for="tag in tags" :key="tag" :label="tag" :value="tag"> </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="团队简介">
                <el-input
                    v-model="form.desc"
                    type="textarea"
                    placeholder="可填写团队介绍、福利、平时活动时间等"
                    show-word-limit
                    :maxlength="200"
                    :rows="5"
                ></el-input>
            </el-form-item>
            <el-form-item label="招募信息">
                <el-input
                    v-model="form.recruit"
                    type="textarea"
                    placeholder="可填写团队当前需要招募的职业和联系方式等"
                    show-word-limit
                    :maxlength="200"
                    :rows="5"
                ></el-input>
            </el-form-item>
            <el-form-item label="YY频道">
                <el-input v-model="form.yy_channel" placeholder="YY频道（非必填）"></el-input>
            </el-form-item>
            <el-form-item label="QQ群号">
                <el-input v-model="form.qq_group" placeholder="QQ群号（非必填）"></el-input>
            </el-form-item>
            <el-form-item label="直播间">
                <div class="m-tv-list">
                    <el-row class="m-tv-item" v-for="(item, index) in tv_list" :key="index + ''">
                        <el-col :span="6"
                            ><div class="u-type-select">
                                <el-button
                                    class="u-main"
                                    :type="item.main ? 'warning' : ''"
                                    icon="Star"
                                    circle
                                    :plain="item.main ? false : true"
                                    @click="setMain(item)"
                                    size="small"
                                    title="在主页显示"
                                />
                                <el-select
                                    class="u-tv_type"
                                    v-model="item.tv_type"
                                    placeholder="请选择直播平台"
                                    popper-append-to-body
                                    style="width: 200px"
                                >
                                    <el-option
                                        v-for="(label, value) in tv_types"
                                        :key="value"
                                        :label="label"
                                        :value="value"
                                    >
                                    </el-option>
                                </el-select></div
                        ></el-col>
                        <el-col :span="18">
                            <div class="u-desc">
                                <el-input class="u-tv" v-model="item.tv" placeholder="房间号"></el-input>
                                <el-input v-model="item.role_name" placeholder="角色名"></el-input>
                                <el-button
                                    type="info"
                                    icon="Delete"
                                    circle
                                    plain
                                    title="移除"
                                    size="small"
                                    @click="removeTv(index)"
                                    :disabled="tv_list && tv_list.length == 1"
                                ></el-button>
                            </div>
                        </el-col>
                    </el-row>
                    <el-button type="primary" class="u-add" @click="addTv" icon="Plus">添加直播间</el-button>
                </div>
            </el-form-item>
            <el-form-item label="团队成员">
                <el-select v-model.number="form.v_member" placeholder="请选择">
                    <el-option
                        v-for="item in vismap"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="团队活动">
                <el-select v-model.number="form.v_activity" placeholder="请选择">
                    <el-option
                        v-for="item in vismap"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="团队DKP">
                <el-select v-model.number="form.v_dkp" placeholder="请选择">
                    <el-option
                        v-for="item in vismap"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="留言板">
                <el-select v-model.number="form.v_comment" placeholder="请选择">
                    <el-option
                        v-for="item in vismap"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-button class="u-btn" type="primary" @click="submit" :disabled="building || !ready">{{
                    btn_txt
                }}</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import UploadLogo from "@/components/team/widget/UploadLogo.vue";
import server_std from "@jx3box/jx3box-data/data/server/server_std.json";
import server_origin from "@jx3box/jx3box-data/data/server/server_origin.json";
import { __clients } from "@/utils/config";
import tvmap from "@/assets/data/team/tv.json";
import vismap from "@/assets/data/team/vis.json";
import tags from "@/assets/data/team/tags.json";
import { sterilizer } from "sterilizer/index.js";
import { hasTeam, createTeamLiveList, getTeamLiveList } from "@/service/team/team.js";
import _ from "lodash";

const default_tv = {
    describe: "",
    team_id: 0,
    tv: "",
    tv_type: "",
    weight: 0,
    main: true,
    role_name: "",
};

export default {
    props: ["data", "btn_txt", "processing"],
    data: function () {
        return {
            position: window.innerWidth < 768 ? "top" : "left",
            vismap,
            tags,
            tv_types: tvmap,
            form: this.data || {
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
                // wiki: "",
            },
            building: this.processing || false,
            clients: {},

            // 重名问题
            isExist: false,
            isNumber: false,

            tv_list: [
                {
                    ...default_tv,
                    team_id: ~~this.$route.params.id,
                },
            ],
        };
    },
    model: {
        prop: "data",
        event: "update",
    },
    watch: {
        data: function (newval) {
            this.form = newval;
        },
        form: {
            deep: true,
            handler: function (newval) {
                this.$emit("update", newval);
            },
        },
        processing: function (val) {
            this.building = val;
        },
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
        ready: function () {
            return !this.isExist && !this.isNumber;
        },
        servers: function () {
            return this.form.client === "origin" ? server_origin : server_std;
        },
    },
    methods: {
        submit: function () {
            if (!this.form.name || !this.form.server) {
                this.$alert("团队名和服务器不能为空", "提醒", {
                    confirmButtonText: "确定",
                });
                return;
            }

            this.$emit("submit");
        },
        checkTeamName: function () {
            // 移除特殊符号
            this.form.name = sterilizer(this.form.name).kill().removeSpace().toString();

            // 不能为纯数字
            this.isNumber = !isNaN(Number(this.form.name));

            // 同服是否已存在同名团队
            if (this.form.name && this.form.server) {
                // 新建时
                if (!this.id) {
                    this.requestTeamExist();
                }
            }
        },
        requestTeamExist: function () {
            hasTeam(this.form.server, this.form.name).then((res) => {
                this.isExist = res.data.data.exist;
            });
        },
        changeClient: function () {
            this.form.server = "";
        },
        buildClients: function () {
            let clients = {};
            for (let key in __clients) {
                if (key != "all") {
                    clients[key] = __clients[key];
                }
            }
            this.clients = clients;
        },
        addTv: function () {
            this.tv_list.push({
                ...default_tv,
                team_id: ~~this.id,
                main: false,
            });
        },
        removeTv: function (index) {
            if (this.tv_list.length == 1) return;
            this.tv_list.splice(index, 1);
            // weight最高的条目的main设置为true
            const max = _.maxBy(this.tv_list, "weight");
            if (max) {
                this.setMain(max);
            }
        },
        submitTv: function () {
            const data = this.tv_list.map((item) => {
                if (item.main) item.weight = 1;
                else item.weight = 0;
                return _.omit(item, ["main"]);
            });
            createTeamLiveList(this.id, data).catch((e) => {
                console.log(e);
            });
        },
        loadTv: function () {
            if (!this.id) return;
            getTeamLiveList(this.id).then((res) => {
                this.tv_list = res.data?.data || [
                    {
                        ...default_tv,
                        team_id: ~~this.id,
                    },
                ];

                // weight最高的条目的main设置为true
                const max = _.maxBy(this.tv_list, "weight");
                if (max) {
                    this.setMain(max);
                }
            });
        },
        setMain(tv) {
            this.tv_list.forEach((item) => {
                item["main"] = false;

                if (item.tv == tv.tv) {
                    item["main"] = true;
                }
            });
        },
    },
    mounted: function () {
        this.buildClients();
        this.loadTv();
    },
    components: {
        UploadLogo,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/teamform.less";
</style>
