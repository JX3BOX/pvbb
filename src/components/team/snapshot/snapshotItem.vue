<template>
    <div class="m-snapshot-item" :class="{ isOpen: collapse }">
        <div class="m-snapshot-item-header">
            <h4 class="u-title" @click="foldItem">
                <i :class="collapse ? 'el-icon-caret-top' : 'el-icon-caret-right'"></i>
                {{ data.title || autoname }}
            </h4>
            <div class="u-meta">
                <time class="u-meta-item u-time">
                    <i class="el-icon-date"></i>
                    <em>上传日期</em>
                    {{ showTime(data.created_at) }}
                </time>
                <span class="u-meta-item u-reporter">
                    <i class="el-icon-user"></i>
                    <em>上传人员</em>
                    <a :href="authorLink(data.user_id)" target="_blank">{{
                        data.user_data ? data.user_data.display_name : "未知"
                    }}</a>
                </span>
                <div class="u-meta-item u-desc">
                    <i class="el-icon-tickets"></i>
                    <em>备注说明</em>
                    {{ data.desc || "无" }}
                </div>
            </div>
        </div>

        <div class="m-snapshot-item-content" :class="{ isOpen: collapse }">
            <div class="m-snapshot-flags" v-if="groups == 5">
                <i v-for="group of groups" :key="group">{{ group }}</i>
            </div>
            <snapshot-body :data="list" :class="'row-' + groups"></snapshot-body>
            <div class="m-snapshot-dkp" v-if="supportDkpSync">
                <el-form :inline="true" :model="dkpForm">
                    <el-form-item label="分值">
                        <el-input v-model.number="dkpForm.score" placeholder="批量加分值" :min="0"></el-input>
                    </el-form-item>
                    <el-form-item label="备注">
                        <el-input v-model="dkpForm.remark" placeholder="批量备注"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="syncDkp(data)">提交</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <div class="m-snapshot-item-op">
            <span class="u-dkp-status" v-if="supportDkpSync">{{ data.dkp ? "✔️DKP已同步" : "" }}</span>
            <template v-if="!readOnly">
                <el-button type="primary" size="small" plain icon="Edit" @click="edit(data.id)">编辑</el-button>
                <el-button type="info" plain size="small" icon="Delete" @click="del(data.id)">删除</el-button>
            </template>
        </div>
    </div>
</template>
<script>
import { __imgPath } from "@/utils/config";
import xfmap from "@jx3box/jx3box-data/data/xf/xf.json";
import { delSnapshot } from "@/service/team/snapshot.js";
import { syncSnapshotDkp } from "@/service/team/dkp.js";
import { showTime } from "@jx3box/jx3box-common/js/moment";
import snapshotBody from "./snapshotBody.vue";
import { authorLink } from "@/utils/filters";
export default {
    name: "snapshotItem",
    props: ["data", "team_id", "readOnly", "supportDkpSync"],
    data: function () {
        return {
            xfmap,
            collapse: false,

            dkpForm: {
                score: 0,
                remark: "",
            },
        };
    },
    computed: {
        list: function () {
            let list = this.data.teammate.split(";");
            let _list = [];
            list.forEach((item, i) => {
                item = item.split(",");
                let _item = {
                    name: item[0],
                    id: item[1],
                    jx3id: item[2],
                    mount: item[3],
                };
                _list.push(_item);
            });
            return _list;
        },
        autoname() {
            return showTime(this.data.created_at) + "@" + (this.data.user_data?.display_name || "未知") + " 游戏内上传";
        },
        groups: function () {
            return ~~Math.ceil(this.list.length / 5);
        },
    },
    methods: {
        edit(id) {
            this.$router.push("/snapshot/edit/" + id);
        },
        del(id) {
            this.$alert("确定删除这条记录吗？", "消息", {
                confirmButtonText: "确定",
                callback: (action) => {
                    if (action == "confirm") {
                        delSnapshot(id).then((res) => {
                            this.$message({
                                type: "success",
                                message: `删除成功`,
                            });
                            this.$emit("dropSnapshot");
                        });
                    }
                },
            });
        },
        foldItem: function () {
            this.collapse = !this.collapse;
        },
        syncDkp: function (data) {
            syncSnapshotDkp(data.id, this.dkpForm).then((res) => {
                this.$message({
                    message: "批量DKP处理成功",
                    type: "success",
                });
                // eslint-disable-next-line vue/no-mutating-props
                this.data.dkp = 1;
            });
        },
        showTime,
        authorLink,
    },
    mounted() {},
    components: {
        snapshotBody,
    },
};
</script>
<style lang="less">
@import "@/assets/css/team/snapshot/item.less";
</style>
