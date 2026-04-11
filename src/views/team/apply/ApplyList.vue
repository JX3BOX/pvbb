<template>
    <div class="m-events">
        <h3><i class="el-icon-present"></i>可申请福利</h3>
        <div class="m-events-box" v-if="list && list.length">
            <div @click="gotoApply(item)" class="u-item" v-for="(item, index) in list" :key="index">
                <img :src="resolveImagePath(item.banner) || img" :alt="item.name" />
                <div class="u-info">
                    <div class="u-txt">
                        <span class="u-title">{{ item.name }}</span>
                        <span class="u-time"><i class="el-icon-date"></i> 时间：{{ showTime(item.start_at || item.created_at) }} ~
                            {{ showTime(item.end_at || item.created_at) }}</span>
                        <span class="u-desc" v-html="item.desc"></span>
                    </div>
                    <div class="u-status">
                        <el-button :disabled="!item.status" size="small" :type="item.status ? 'success' : 'info'">{{ item.status ? '进行中' : '已结束' }}<i class="el-icon-arrow-right" v-if="item.status"></i></el-button>
                    </div>
                </div>
            </div>
        </div>

        <div class="m-events-null" v-else>
            <el-alert title="暂无活动" type="info" show-icon> </el-alert>
        </div>
    </div>
</template>
<script>
import { getEvents } from "@/service/team/apply.js";
import { showDate } from "@/utils/filters";
import { __imgPath } from "@/utils/config";
import {resolveImagePath} from '@jx3box/jx3box-common/js/utils'

export default {
    name: "eventsList",
    data: function () {
        return {
            list: [],
            key: "",
            title: "",
        };
    },
    computed: {
        img() {
            return __imgPath + "image/other/apply.png";
        },
    },
    methods: {
        showTime: showDate,
        gotoApply({ id }) {
            this.$router.push({
                name: "apply_single",
                params: { id },
            });
        },resolveImagePath
    },
    created() {
        getEvents().then((res) => {
            this.list = res.data.data.list;
        });
    },
};
</script>
<style lang="less">
@import "@/assets/css/team/events/list.less";
</style>
