<template>
    <div class="m-team-namespace">
        <el-divider content-position="left"> <i class="el-icon-postcard"></i> 绑定铭牌 </el-divider>
        <el-alert v-if="!isVerified" type="warning" show-icon class="u-warning"
            ><template #title>
                注册命名空间请先进行<router-link :to="'/org/verify/' + team_id">团队认证</router-link>
            </template></el-alert
        >
        <el-alert
            v-if="action"
            class="u-alert"
            title="因接口缓存原因，提交后需要等待10分钟后才会更新铭牌和对应状态，请耐心等待，并非提交失败。"
            type="warning"
            effect="dark"
        >
        </el-alert>
        <div class="m-team-other-block" :class="{ disabled: !isVerified }">
            <div class="u-desc">团队主页的中文快捷链接，请尽量与团队名称保持一致</div>
            <div class="u-input">
                <el-input
                    placeholder="请输入唯一名称"
                    size="large"
                    v-model="form.key"
                    clearable
                    :disabled="!isVerified"
                >
                    <template #prepend>剑网3.com/</template>
                </el-input>
                <el-button type="primary" @click="submit" size="large" :disabled="!ready">提交</el-button>
            </div>
            <div class="u-validate" v-show="!available"><i class="el-icon-warning-outline"></i> 当前名称已被使用</div>
            <div class="u-result">
                <span class="u-status" :class="'u-status-' + status" v-if="!first">
                    <span v-if="status == 0"> <i class="el-icon-remove"></i> 审核中 </span>
                    <span v-else-if="status == 1"> <i class="el-icon-success"></i> 正常 </span>
                    <span v-else-if="status == 2"> <i class="el-icon-error"></i> 未通过审核 </span>
                </span>
                <span class="u-url">
                    <em>绑定网址</em>
                    <a :href="'https://剑网3.com/' + form.key" target="_blank">https://剑网3.com/{{ form.key }}</a>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
import { sterilizer } from "sterilizer/index.js";
import { postNamespace, getNamespaceByKey, getNamespaceTeam, updateNamespace } from "@/service/team/namespace";
import { getLink } from "@jx3box/jx3box-common/js/utils";
import { pick, cloneDeep } from "lodash";

const default_form = {
    ID: "",
    key: "",
    link: "",
    desc: "",
    source_id: "",
};

export default {
    name: "EditNamespace",
    props: [],
    data: function () {
        return {
            form: cloneDeep(default_form),
            available: true,
            first: true,
            action: "",
        };
    },
    computed: {
        isVerified: function () {
            return this.$store.state.team.status;
        },
        key: function () {
            return this.form.key || "";
        },
        ready: function () {
            return this.form.key && this.available;
        },
        mode: function () {
            return this.form.ID ? "update" : "create";
        },
        status: function () {
            return this.form.status;
        },
        params: function () {
            return {
                ...this.form,
            };
        },
        team: function () {
            return this.$store.state.team;
        },
        team_id: function () {
            return this.$route.params.id;
        },
        team_desc: function () {
            return this.team && this.team.name + "@" + this.team.server;
        },
    },
    methods: {
        checkAvailable: function () {
            // 移除所有符号
            this.form.key = sterilizer(this.form.key).safe().removeSpace().toString();
            // 判断重名
            if (this.key) {
                getNamespaceByKey(this.key).then((res) => {
                    if (res.data?.data?.key && res.data.data.source_id !== this.team_id) {
                        this.available = false;
                    }
                });
            } else {
                this.available = true;
            }
        },
        submit: function () {
            this.fullfilTeamInfo();
            const params = pick(this.params, ["key", "link", "desc"]);
            params.desc = this.team_desc;
            let fn =
                this.mode == "create"
                    ? postNamespace({ ...params, source_id: this.team_id })
                    : updateNamespace(this.form.ID, params);
            fn.then((res) => {
                this.getData();
                this.$alert(
                    "因接口缓存原因，提交后需要等待10分钟后才会更新铭牌和对应状态，请耐心等待，并非提交失败。",
                    "提示",
                    {
                        confirmButtonText: "确定",
                        callback: (action) => {
                            this.action = action;
                            this.$message({
                                type: "success",
                                message: "提交成功，请等待审核",
                            });
                        },
                    }
                );
            });
        },
        getData: function () {
            const params = {
                source_id: this.team_id,
            };

            // 获取当前团队的命名空间
            this.team_id &&
                getNamespaceTeam(params).then((res) => {
                    let result = res.data.data.list[0];
                    if (result) {
                        this.first = false;
                        this.form = result || cloneDeep(default_form);
                    }
                });
        },
        fullfilTeamInfo: function () {
            this.form.source_id = this.team_id;
            this.form.link = getLink("org", this.team_id);
        },
    },
    watch: {
        "form.key": function () {
            this.checkAvailable();
        },
    },
    mounted: function () {
        this.getData();
    },
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/org/edit_namespace.less";
</style>

<style lang="less" scope>
.u-alert {
    .mb(20px);
}
</style>
