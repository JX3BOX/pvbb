<template>
    <div class="m-team-videos">
        <el-divider v-if="isMaster" content-position="left"><i class="el-icon-video-camera"></i> 赛季视频 </el-divider>
        <div class="u-list" v-if="list && list.length">
            <div class="u-video" v-for="(item, i) in list" :key="i">
                <a :href="item.url" target="_blank">
                    <img :src="showVideoCover(item.aid)" />
                    <span class="u-title">{{ item.title }}</span>
                </a>
                <template v-if="data.isMaster">
                    <span class="u-status" v-if="item.status !== 1" @click.stop="toEmit({ item })">
                        <b class="u-audit" v-if="item.status == '0'">视频审核中</b>
                        <b class="u-reject" v-if="item.status == '2'">视频驳回，请修改</b>
                    </span>
                    <span class="u-del" v-if="isMine" @click.stop="toEmit({ del: item.ID })"
                        ><i class="el-icon-delete"></i
                    ></span>
                    <span class="u-edit" v-if="isMine" @click.stop="toEmit({ item })"
                        ><i class="el-icon-edit"></i>编辑</span
                    >
                </template>
            </div>
        </div>
        <el-alert v-else center="" title="暂无赛季视频" type="info" show-icon> </el-alert>
        <el-pagination
            class="m-archive-pages justify-center!"
            background
            layout="total, prev, pager, next,jumper"
            :hide-on-single-page="true"
            :page-size="per"
            :total="total"
            v-model:current-page="page"
        >
        </el-pagination>
    </div>
</template>

<script>
import { __imgPath } from "@/utils/config";
export default {
    name: "team_videos",
    props: ["data", "isMine"],
    data: function () {
        return {
            page: this.data.page,
        };
    },
    computed: {
        id() {
            return this.$route.params.id;
        },
        list() {
            return this.data.list;
        },
        per() {
            return this.data.per;
        },
        total() {
            return this.data.total;
        },
        isMaster() {
            return this.data.isMaster;
        },
    },
    watch: {
        page(val) {
            this.toEmit({ page: val });
        },
    },
    methods: {
        toEmit(data) {
            this.$emit("toEmit", data);
        },
        showVideoCover(aid) {
            return __imgPath + "image/rank/videos/" + aid + ".png";
        },
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_videos.less";
</style>
