<template>
    <div class="m-team-teamform" :class="{ 'is-archive': isArchive }">
        <el-form
            ref="form"
            :model="form"
            :label-width="isArchive ? 'auto' : '90px'"
            size="large"
            :label-position="isArchive ? 'top' : position"
        >
            <header v-if="isArchive" class="m-team-form-section">
                <h2>{{ $t("team.settings.identity") }}</h2>
            </header>

            <el-form-item :label="$t('team.settings.logo')" class="m-team-field is-logo">
                <UploadLogo v-model="form.logo" />
            </el-form-item>
            <el-form-item :label="$t('team.settings.name')" class="m-team-field is-name">
                <el-input
                    v-model="form.name"
                    :placeholder="$t('team.settings.namePlaceholder')"
                    show-word-limit
                    :minlength="2"
                    :maxlength="12"
                    @input="checkTeamName"
                ></el-input>
                <div class="u-warning" v-if="isExist">
                    <i class="el-icon-warning-outline"></i>
                    {{ $t("team.settings.duplicateName") }}
                </div>
                <div class="u-warning" v-if="isNumber">
                    <i class="el-icon-warning-outline"></i>
                    {{ $t("team.settings.numericName") }}
                </div>
            </el-form-item>
            <el-form-item :label="$t('team.settings.server')" class="m-team-field m-team-server is-server">
                <el-select
                    :placeholder="$t('team.settings.selectClient')"
                    v-model="form.client"
                    style="margin-right: 10px"
                    @change="changeClient"
                >
                    <el-option v-for="(label, value) in clients" :key="value" :value="value" :label="label"></el-option>
                </el-select>
                <el-select v-model="form.server" :placeholder="$t('team.settings.selectServer')" @change="checkTeamName">
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
            <el-form-item :label="$t('team.settings.type')" class="m-team-field is-tags">
                <el-select class="u-select-tags" v-model="form.tags" multiple :placeholder="$t('team.settings.multiSelect')">
                    <el-option v-for="tag in tags" :key="tag" :label="tag" :value="tag"> </el-option>
                </el-select>
            </el-form-item>
            <header v-if="isArchive" class="m-team-form-section">
                <h2>{{ $t("team.settings.publicDisplay") }}</h2>
            </header>

            <el-form-item :label="$t('team.settings.intro')" class="m-team-field is-description">
                <el-input
                    v-model="form.desc"
                    type="textarea"
                    :placeholder="$t('team.settings.introPlaceholder')"
                    show-word-limit
                    :maxlength="200"
                    :rows="5"
                ></el-input>
            </el-form-item>
            <el-form-item :label="$t('team.settings.recruit')" class="m-team-field is-recruit">
                <el-input
                    v-model="form.recruit"
                    type="textarea"
                    :placeholder="$t('team.settings.recruitPlaceholder')"
                    show-word-limit
                    :maxlength="200"
                    :rows="5"
                ></el-input>
            </el-form-item>
            <header v-if="isArchive" class="m-team-form-section">
                <h2>{{ $t("team.settings.contact") }}</h2>
            </header>

            <el-form-item :label="$t('team.settings.yy')" class="m-team-field is-contact">
                <el-input v-model="form.yy_channel" :placeholder="$t('team.settings.yyPlaceholder')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('team.settings.qq')" class="m-team-field is-contact">
                <el-input v-model="form.qq_group" :placeholder="$t('team.settings.qqPlaceholder')"></el-input>
            </el-form-item>
            <el-form-item :label="$t('team.settings.live')" class="m-team-field is-tv">
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
                                    :title="$t('team.settings.showOnHome')"
                                />
                                <el-select
                                    class="u-tv_type"
                                    v-model="item.tv_type"
                                    :placeholder="$t('team.settings.livePlatform')"
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
                                <el-input class="u-tv" v-model="item.tv" :placeholder="$t('team.settings.room')"></el-input>
                                <el-input v-model="item.role_name" :placeholder="$t('team.settings.roleName')"></el-input>
                                <el-button
                                    type="info"
                                    icon="Delete"
                                    circle
                                    plain
                                    :title="$t('team.settings.remove')"
                                    size="small"
                                    @click="removeTv(index)"
                                    :disabled="tv_list && tv_list.length == 1"
                                ></el-button>
                            </div>
                        </el-col>
                    </el-row>
                    <el-button type="primary" class="u-add" @click="addTv" icon="Plus">{{ $t("team.settings.addLive") }}</el-button>
                </div>
            </el-form-item>
            <header v-if="isArchive" class="m-team-form-section">
                <h2>{{ $t("team.settings.visibility") }}</h2>
            </header>

            <el-form-item :label="$t('team.settings.members')" class="m-team-field is-visibility">
                <el-select v-model.number="form.v_member" :placeholder="$t('team.settings.select')">
                    <el-option
                        v-for="item in vismap"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('team.settings.activities')" class="m-team-field is-visibility">
                <el-select v-model.number="form.v_activity" :placeholder="$t('team.settings.select')">
                    <el-option
                        v-for="item in vismap"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('team.settings.comments')" class="m-team-field is-visibility">
                <el-select v-model.number="form.v_comment" :placeholder="$t('team.settings.select')">
                    <el-option
                        v-for="item in vismap"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item class="m-team-form-actions">
                <el-button
                    class="u-btn"
                    type="primary"
                    :loading="building"
                    :disabled="building || !ready"
                    @click="submit"
                    >{{ btn_txt }}</el-button
                >
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
    props: ["data", "btn_txt", "processing", "variant"],
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
                v_dkp: 2,
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
        isArchive: function () {
            return this.variant === "archive";
        },
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
                this.$alert(this.$t("team.settings.required"), this.$t("team.settings.reminder"), {
                    confirmButtonText: this.$t("team.settings.confirm"),
                });
                return;
            }

            this.form.v_dkp = 2;
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
        submitTv: function (teamId = this.id) {
            const data = this.tv_list.map((item) => {
                return {
                    ..._.omit(item, ["main"]),
                    team_id: ~~teamId,
                    weight: item.main ? 1 : 0,
                };
            });
            return createTeamLiveList(teamId, data);
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
