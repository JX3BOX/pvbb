<template>
    <section class="m-team-namespace" :class="{ 'is-archive': variant === 'archive' }">
        <template v-if="variant === 'archive'">
            <header class="m-team-form-section">
                <h2>{{ $t("team.namespace.title") }}</h2>
            </header>
            <div class="m-archive-field-label">{{ $t("team.namespace.shortcut") }}</div>
        </template>
        <el-divider v-else content-position="left"> <i class="el-icon-postcard"></i> {{ $t("team.namespace.bind") }} </el-divider>
        <el-alert v-if="!isVerified" type="warning" show-icon class="u-warning"
            ><template #title>
                <template v-if="variant === 'archive'">
                    {{ $t("team.namespace.verifyFirst") }}<router-link :to="verifyLink">{{ $t("team.namespace.verification") }}</router-link>
                </template>
                <template v-else>
                    {{ $t("team.namespace.verifyFirst") }}<router-link :to="verifyLink">{{ $t("team.namespace.verification") }}</router-link>
                </template>
            </template></el-alert
        >
        <el-alert
            v-if="action"
            class="u-alert"
            :title="$t('team.namespace.cacheNotice')"
            type="warning"
            effect="dark"
        >
        </el-alert>
        <div class="m-team-other-block" :class="{ disabled: !isVerified }">
            <div v-if="variant !== 'archive'" class="u-desc">
                {{ $t("team.namespace.description") }}
            </div>
            <div class="u-input">
                <el-input
                    :placeholder="$t('team.namespace.placeholder')"
                    size="large"
                    v-model="form.key"
                    clearable
                    :disabled="!isVerified"
                >
                    <template #prepend>{{ $t("team.namespaceLink.domain") }}/</template>
                </el-input>
                <el-button type="primary" @click="submit" size="large" :disabled="!ready">{{ $t("team.namespace.submit") }}</el-button>
            </div>
            <div class="u-validate" v-show="!available"><i class="el-icon-warning-outline"></i> {{ $t("team.namespace.used") }}</div>
            <div class="u-result">
                <span class="u-status" :class="'u-status-' + status" v-if="!first">
                    <span v-if="status == 0"> <i class="el-icon-remove"></i> {{ $t("team.namespace.reviewing") }} </span>
                    <span v-else-if="status == 1"> <i class="el-icon-success"></i> {{ $t("team.namespace.normal") }} </span>
                    <span v-else-if="status == 2"> <i class="el-icon-error"></i> {{ $t("team.namespace.rejected") }} </span>
                </span>
                <span class="u-url">
                    <em>{{ $t("team.namespace.boundUrl") }}</em>
                    <a :href="$t('team.namespaceLink.base') + form.key" target="_blank">{{ $t("team.namespaceLink.base") }}{{ form.key }}</a>
                </span>
            </div>
        </div>
    </section>
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
    props: {
        variant: {
            type: String,
            default: "default",
        },
    },
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
        verifyLink: function () {
            if (this.variant === "archive") {
                return {
                    name: "manage_my_org",
                    params: { id: this.team_id },
                    query: { tab: "setting", subtab: "verify" },
                };
            }
            return "/org/verify/" + this.team_id;
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
                    this.$t("team.namespace.cacheNotice"),
                    this.$t("team.namespace.prompt"),
                    {
                        confirmButtonText: this.$t("team.namespace.confirm"),
                        callback: (action) => {
                            this.action = action;
                            this.$message({
                                type: "success",
                                message: this.$t("team.namespace.submitted"),
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
