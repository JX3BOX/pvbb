<template>
    <div class="v-snapshot-add">
        <h1 class="m-title">
            <i :class="id ? 'el-icon-edit' : 'el-icon-circle-plus-outline'"></i>
            <span class="u-txt">{{ id ? "修改" : "创建" }}快照</span>
            <div class="u-op">
                <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">返回列表</el-button>
            </div>
        </h1>
        <div class="m-snapshot-form" v-loading="loading">
            <el-form ref="form" :model="form" label-width="80px">
                <el-form-item label="快照标题">
                    <el-input v-model="form.title" placeholder="请输入标题"></el-input>
                </el-form-item>
                <el-form-item label="所属团队">
                    <el-select
                        class="m-select-org"
                        v-model.number="org"
                        placeholder="请选择团队"
                        size="medium"
                        popper-class="m-select-org-options"
                        :disabled="!!id"
                    >
                        <el-option v-for="item in orgs" :key="item.ID" :label="item.name" :value="item.ID">
                            <img class="u-org-logo" :src="showTeamLogo(item.logo)" v-if="item.logo" />
                            <img class="u-org-logo" src="@/assets/img/team/null.png" v-else />
                            <span class="u-org-name">{{ item.name }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注信息">
                    <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="form.desc"></el-input>
                </el-form-item>
                <el-form-item label="参与人员">
                    <el-divider content-position="left">快照名单</el-divider>
                    <VueDraggable class="m-user-list" v-model="list">
                        <div v-for="(item, index) in list" :key="dragKey(item, 'snapshot-role')" class="u-user">
                            <div class="u-user-inner">
                                <i class="el-icon-circle-close" @click="delRole(index)"></i>
                                <img class="u-icon" :src="showMountIcon(item[3])" />
                                <span class="u-name">{{ item[0] }}</span>
                            </div>
                        </div>
                    </VueDraggable>
                </el-form-item>
                <el-form-item>
                    <snapshot-role @change="addRole"></snapshot-role>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" class="u-btn u-submit" @click="submit" :disabled="processing"
                        >提交</el-button
                    >
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
import snapshotRole from "@/components/team/snapshot/snapshotRole.vue";
import { __imgPath } from "@/utils/config";
import { editSnapshot, addSnapshot, getSnapshot } from "@/service/team/snapshot.js";
import { getMyPowerTeams } from "@/service/team/team.js";
import { getThumbnail } from "@jx3box/jx3box-common/js/utils";
import lodash from "lodash";
import { VueDraggable } from "vue-draggable-plus";
import { ensureDragKey } from "@/utils/draggable";
import { showMountIcon } from "@/utils/filters";
export default {
    name: "AddSnapshot",
    props: [],
    data: function () {
        return {
            org: "",
            orgs: [],
            list: [],
            form: {
                desc: "",
                title: "",
            },
            processing: false,
            loading: false,
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
        teammate: function () {
            let _list = lodash.cloneDeep(this.list);
            _list.forEach((item) => {
                item = item.join(",");
            });
            _list = _list.join(";");
            return _list;
        },
    },
    methods: {
        dragKey: ensureDragKey,
        showMountIcon,
        showTeamLogo(val) {
            return getThumbnail(val, 84);
        },
        loadTeams() {
            return getMyPowerTeams("r_snapshot").then((res) => {
                this.orgs = res.data.data.list || [];
                this.org = this.orgs.length && this.orgs[0]["ID"];
            });
        },
        loadSnapshot() {
            this.loading = true;
            getSnapshot(this.id)
                .then((data) => {
                    this.form = data;
                    this.org = data.team_id;
                    this.formatList();
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        formatList: function () {
            let list = this.form.teammate.split(";");
            let _list = [];
            list.forEach((item, i) => {
                let _item = item.split(",");
                _list.push(_item);
            });
            this.list = _list;
        },
        delRole(i) {
            this.list.splice(i, 1);
        },
        addRole(role) {
            this.list.push([role["name"], 0, 0, role["xf"]]);
        },
        init: function () {
            this.loadTeams();
            this.id && this.loadSnapshot();
        },
        submit() {
            this.processing = true;
            this.form.teammate = this.teammate;
            if (this.id) {
                editSnapshot(this.id, this.form)
                    .then((res) => {
                        this.skip();
                    })
                    .finally(() => {
                        this.processing = false;
                    });
            } else {
                this.form.team_id = this.org;
                addSnapshot(this.org, this.form)
                    .then((res) => {
                        this.skip();
                    })
                    .finally(() => {
                        this.processing = false;
                    });
            }
        },
        skip: function () {
            this.$message({
                message: "快照更新成功",
                type: "success",
            });
            this.$router.push("/snapshot/list");
        },
        goBack: function () {
            this.$router.push("/snapshot/list");
        },
    },
    created() {
        this.init();
    },
    components: {
        "snapshot-role": snapshotRole,
        VueDraggable,
    },
};
</script>
<style scoped lang="less">
@import "@/assets/css/team/snapshot/add.less";
</style>
