<template>
    <div class="m-snapshot-box" v-loading="loading">
        <div v-if="supportDkpSync" class="m-snapshot-dkp-guide">
            <span class="u-guide-icon" aria-hidden="true"><i class="el-icon-connection"></i></span>
            <div class="u-guide-content">
                <h3>按快照批量记录考勤 DKP</h3>
                <p>选择一次活动快照，可为快照名单中的所有成员快速增加相同的考勤分值。</p>
                <ol class="u-guide-steps" aria-label="快照关联操作步骤">
                    <li><b>1</b> 找到对应快照</li>
                    <li><b>2</b> 展开确认名单</li>
                    <li><b>3</b> 填写分值与备注后提交</li>
                </ol>
            </div>
        </div>
        <div class="m-snapshot-search">
            <el-button v-if="!readOnly" class="u-manual-add" type="primary" icon="Plus" @click="openCreateDialog">
                手动补录
            </el-button>
            <el-input
                placeholder="搜索快照标题、上传人员或备注"
                aria-label="搜索快照"
                v-model="search"
                clearable
            >
                <template #prefix><i class="el-icon-search"></i></template>
            </el-input>
        </div>
        <div class="m-snapshot-list" v-if="list && list.length">
            <snapshot-item
                v-for="(item, i) in list"
                :data="item"
                :key="item.id"
                :team_id="org"
                @dropSnapshot="dropSnapshot(i)"
                :readOnly="readOnly"
                :supportDkpSync="supportDkpSync"
                @editSnapshot="openEditDialog"
            />
            <el-pagination
                class="m-snapshot-pages"
                background
                layout="total, prev, pager, next,jumper"
                :hide-on-single-page="true"
                :page-size="per"
                :total="total"
                :current-page="page"
                @current-change="changePage"
            ></el-pagination>
        </div>
        <el-alert class="m-snapshot-null" type="info" show-icon v-else>
            <template #title>
                暂无任何记录，点击查看
                <a href="/tool/23783" target="_blank">帮助文档</a>
            </template>
        </el-alert>
        <EditSnapshotDialog
            v-model="editVisible"
            :snapshot-id="editingId"
            :target-team-id="org"
            @saved="loadSnapshots"
        />
    </div>
</template>

<script>
import snapshotItem from "@/components/team/snapshot/snapshotItem.vue";
import { getSnapshots } from "@/service/team/snapshot.js";
import EditSnapshotDialog from "@/components/team/snapshot/EditSnapshotDialog.vue";

export default {
    name: "snapshot_list",
    props: ["org", "readOnly", "supportDkpSync"],
    components: {
        "snapshot-item": snapshotItem,
        EditSnapshotDialog,
    },
    data: function () {
        return {
            list: [],
            page: 1,
            per: 10,
            total: 1,
            loading: false,
            search: "",
            editingId: null,
            editVisible: false,
        };
    },
    computed: {
        params: function () {
            return {
                pageIndex: this.page,
                pageSize: this.per,
                search: this.search,
            };
        },
    },
    watch: {
        params: {
            deep: true,
            handler: function () {
                this.org && this.loadSnapshots();
            },
        },
        org: {
            immediate: true,
            handler: function (val) {
                val && this.loadSnapshots();
            },
        },
    },
    methods: {
        openCreateDialog() {
            this.editingId = null;
            this.editVisible = true;
        },
        openEditDialog(id) {
            this.editingId = id;
            this.editVisible = true;
        },
        dropSnapshot: function (i) {
            this.list.splice(i, 1);
        },
        loadSnapshots() {
            this.loading = true;
            return getSnapshots(this.org, this.params)
                .then((res) => {
                    this.list = res.data.data.list || [];
                    this.total = res.data.data.page.total;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        changePage: function (page) {
            this.page = page;
            window.scrollTo(0, 0);
        },
    },
    filters: {},
    created: function () {},
    mounted: function () {},
};
</script>

<style scoped lang="less">
@import "@/assets/css/team/snapshot/list.less";
</style>
