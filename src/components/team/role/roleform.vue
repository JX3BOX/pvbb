<template>
    <div class="m-role-form">
        <el-form ref="form" :model="form" label-width="80px" :label-position="position">
            <el-form-item :label="$t('team.role.roleName')">
                <el-input
                    v-model="form.name"
                    :placeholder="$t('team.role.namePlaceholder')"
                    show-word-limit
                    :minlength="2"
                    :maxlength="20"
                ></el-input>
            </el-form-item>
            <el-form-item :label="$t('team.role.server')">
                <el-select v-model="form.server" :placeholder="$t('team.role.selectServer')" filterable @change="setDefaultServer">
                    <el-option v-for="server in servers" :key="server" :label="server" :value="server"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('team.role.school')">
                <el-radio-group v-model="form.mount">
                    <el-radio :value="key" v-for="(label, key) in school_map" :key="key" border>
                        <img class="u-icon-school" :src="showSchoolIcon(key)" />
                        {{ label }}
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('team.role.bodyType')">
                <el-select v-model="form.body_type" :placeholder="$t('team.role.selectBodyType')">
                    <el-option
                        v-for="(label, key) in body_map"
                        :key="key"
                        :label="label.label"
                        :value="key"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$t('team.role.remark')">
                <el-input
                    v-model="form.note"
                    :placeholder="$t('team.role.remarkPlaceholder')"
                    show-word-limit
                    :minlength="2"
                    :maxlength="20"
                ></el-input>
            </el-form-item>
            <el-form-item>
                <el-button class="u-btn" type="primary" @click="submit" :disabled="building">{{ btn_txt }}</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";
import servers from "@jx3box/jx3box-data/data/server/server_list.json";
import school_map from "@jx3box/jx3box-data/data/xf/schoolid.json";
import bodyData from "@jx3box/jx3box-facedat/assets/data/index.json";
const { bodyMap } = bodyData;
import { __imgPath } from "@/utils/config";
export default {
    props: ["data", "btn_txt", "processing"],
    data: function () {
        return {
            position: window.innerWidth < 768 ? "top" : "left",
            form: this.data || {
                name: "",
                server: "",
                mount: "0",
                body_type: "1",
                note: "",
            },
            building: this.processing || false,

            servers,
            body_map: bodyMap,
            school_map,
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
    computed: {},
    methods: {
        showSchoolIcon,
        submit: function () {
            if (!this.form.name) {
                this.$alert(this.$t("team.role.nameRequired"), this.$t("team.role.reminder"), {
                    confirmButtonText: this.$t("team.role.confirm"),
                });
                return;
            }

            this.$emit("submit");
        },
        setDefaultServer: function (val) {
            // 下次新建角色时无需再选择服务器
            localStorage && localStorage.setItem("team_role_default_server", val);
        },
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/role/roleform.less";
</style>
