<template>
    <div class="m-snapshot-box" v-loading="loading">
        <div class="m-snapshot-search">
            <el-input placeholder="输入关键词.." v-model="search" size="large">
                <template #prepend><i class="el-icon-search"></i> 搜索</template>
                <template #append>
                    <el-button icon="Position"></el-button>
                </template>
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
    </div>
</template>

<script>
import snapshotItem from "@/components/team/snapshot/snapshotItem.vue";
import { getSnapshots } from "@/service/team/snapshot.js";

export default {
    name: "snapshot_list",
    props: ["org", "readOnly", "supportDkpSync"],
    components: {
        "snapshot-item": snapshotItem,
    },
    data: function () {
        return {
            list: [],
            page: 1,
            per: 10,
            total: 1,
            loading: false,
            search: "",
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
        changePage: function () {
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
