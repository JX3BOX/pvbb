<template>
    <div class="v-snapshot-view">
        <el-divider content-position="left">
            <i class="el-icon-camera"></i> 快照记录
        </el-divider>
        <div class="m-dkp-overview">
            <template v-if="hasRight">
                <snapshot-list :org="org" :readOnly="true"/>
            </template>
            <template v-else>
                <el-alert class="u-tip" title="没有查看权限" type="warning" show-icon></el-alert>
            </template>
        </div>
    </div>
</template>

<script>
import snapshot_list from '@/components/team/snapshot/snapshotList.vue'
export default {
    name: "ViewSnapshot",
    props: ["v", "super", "authority"],
    data: function () {
        return {
            org : 0
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        hasRight: function () {
            return !this.v || ~~this.authority.authority >= ~~this.v;
        },
    },
    methods: {
        init() {
            if (this.hasRight && this.id) {
                this.org = this.id
            }
        },
    },
    watch: {
        id: {
            deep: true,
            handler: function () {
                this.init();
            },
        },
    },
    mounted: function () {
        this.init();
    },
    components: {
        'snapshot-list':snapshot_list,
    },
};
</script>

<style scoped lang="less">
.m-snapshot-list{
    padding:0;
    margin:0;
}
</style>
