<template>
    <div class="m-snapshot-box" v-loading="loading">
        <div v-if="supportDkpSync" class="m-snapshot-dkp-guide">
            <span class="u-guide-icon" aria-hidden="true"><i class="el-icon-connection"></i></span>
            <div class="u-guide-content">
                <h3>{{ $t("team.snapshotGuide.title") }}</h3>
                <p>{{ $t("team.snapshotGuide.description") }}</p>
                <ol class="u-guide-steps" :aria-label="$t('team.snapshotGuide.aria')">
                    <li><b>1</b> {{ $t("team.snapshotGuide.step1") }}</li>
                    <li><b>2</b> {{ $t("team.snapshotGuide.step2") }}</li>
                    <li><b>3</b> {{ $t("team.snapshotGuide.step3") }}</li>
                </ol>
            </div>
        </div>
        <div class="m-snapshot-search">
            <el-button v-if="!readOnly" class="u-manual-add" type="primary" icon="Plus" @click="openCreateDialog">
                {{ $t("team.snapshot.manualAdd") }}
            </el-button>
            <el-input
                :placeholder="$t('team.snapshot.search')"
                :aria-label="$t('team.snapshot.searchAria')"
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
                {{ $t("team.snapshot.empty") }}
                <a href="/tool/23783" target="_blank">{{ $t("team.snapshot.help") }}</a>
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
