<template>
    <div class="m-snapshot-item" :class="{ isOpen: collapse }">
        <div class="m-snapshot-item-header">
            <h4 class="u-title" @click="foldItem">
                <span class="u-toggle" aria-hidden="true">
                    <i class="el-icon-camera"></i>
                </span>
                <span class="u-title-text">{{ data.title || autoname }}</span>
                <span class="u-dkp-status" v-if="supportDkpSync && data.dkp">
                    <i class="el-icon-check" aria-hidden="true"></i>
                    <span>DKP 已同步</span>
                </span>
            </h4>
            <div class="u-meta">
                <time class="u-meta-item u-time">
                    <i class="el-icon-date"></i>
                    {{ showTime(data.created_at) }}
                </time>
                <span class="u-meta-item u-reporter">
                    <i class="el-icon-user"></i>
                    <a v-if="data.user_data?.display_name" :href="authorLink(data.user_id)" target="_blank">
                        {{ data.user_data.display_name }}
                    </a>
                    <span v-else>未知</span>
                </span>
                <div class="u-meta-item u-desc">
                    <i class="el-icon-tickets"></i>
                    {{ data.desc || "无" }}
                </div>
            </div>
        </div>

        <div class="m-snapshot-item-content" :class="{ isOpen: collapse }">
            <div class="m-snapshot-flags" v-if="groups == 5">
                <i v-for="group of 5" :key="group">{{ group }} 队</i>
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
                        <el-button type="primary" :loading="syncingDkp" :disabled="syncingDkp" @click="syncDkp(data)">
                            {{ syncingDkp ? "提交中" : "提交" }}
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <div class="m-snapshot-item-op">
            <el-button class="u-fold" size="small" plain :icon="collapse ? 'ArrowUp' : 'ArrowDown'" @click="foldItem">
                {{ collapse ? "折叠" : "展开" }}
            </el-button>
            <el-dropdown v-if="!readOnly" trigger="click" @command="handleCommand">
                <el-button class="u-more" size="small" plain icon="MoreFilled">更多</el-button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="edit">
                            <i class="el-icon-edit"></i>
                            编辑
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" divided>
                            <i class="el-icon-delete"></i>
                            删除
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
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
            syncingDkp: false,
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
        handleCommand(command) {
            if (command === "edit") this.edit(this.data.id);
            if (command === "delete") this.del(this.data.id);
        },
        edit(id) {
            this.$emit("editSnapshot", id);
        },
        del(id) {
            this.$confirm("确定删除这条记录吗？", "消息", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                confirmButtonClass: "el-button--danger",
            })
                .then(() => {
                    return delSnapshot(id).then(() => {
                        this.$message({
                            type: "success",
                            message: `删除成功`,
                        });
                        this.$emit("dropSnapshot");
                    });
                })
                .catch((action) => {
                    if (action !== "cancel" && action !== "close") throw action;
                });
        },
        foldItem: function () {
            this.collapse = !this.collapse;
        },
        syncDkp: function (data) {
            if (this.syncingDkp) return;

            const score = Number(this.dkpForm.score);
            if (!Number.isInteger(score)) {
                this.$message.warning("请输入整数分值");
                return;
            }

            this.syncingDkp = true;
            syncSnapshotDkp(this.team_id, data.id, {
                score,
                remark: String(this.dkpForm.remark || "").trim(),
            })
                .then((res) => {
                    const result = res.data.data || {};
                    const matched = Number(result.matched || 0);
                    const skipped = Number(result.skipped || 0);
                    let message = `已为 ${matched} 名团员添加考勤DKP`;
                    let type = "success";
                    if (skipped) message += `，跳过 ${skipped} 条未匹配数据`;
                    if (!matched) {
                        message = `未匹配到团队成员，已跳过 ${skipped} 条数据`;
                        type = "warning";
                    }
                    this.$message({
                        message,
                        type,
                    });
                    // eslint-disable-next-line vue/no-mutating-props
                    this.data.dkp = 1;
                })
                .catch((error) => {
                    const message =
                        error?.response?.data?.msg ||
                        error?.response?.data?.message ||
                        error?.data?.msg ||
                        error?.data?.message ||
                        error?.msg ||
                        error?.message ||
                        "提交失败，请稍后重试";
                    this.$message.error(String(message));
                })
                .finally(() => {
                    this.syncingDkp = false;
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
