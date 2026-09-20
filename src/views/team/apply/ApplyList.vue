<template>
    <div class="m-events p-team-home p-team-welfare">
        <ApplyHeader />
        <div class="m-events-box" v-if="list && list.length">
            <router-link :to="{ name: 'apply_single', params: { id: item.id } }" class="u-item" v-for="item in list" :key="item.id">
                <img :src="resolveImagePath(item.banner) || img" :alt="item.name" />
                <div class="u-info">
                    <div class="u-txt">
                        <span class="u-title">{{ item.name }}</span>
                        <span class="u-time"><el-icon><Calendar /></el-icon> {{ $t("team.apply.time", { time: showTime(item.start_at || item.created_at) }) }} ~
                            {{ showTime(item.end_at || item.created_at) }}</span>
                        <span class="u-desc" v-html="item.desc"></span>
                    </div>
                    <div class="u-status">
                        <el-tag :type="item.status ? 'success' : 'info'" round>{{ $t(item.status ? "team.apply.ongoing" : "team.apply.ended") }}</el-tag>
                    </div>
                </div>
            </router-link>
        </div>

        <div class="m-events-null" v-else>
            <el-empty :description="$t('team.apply.empty')" />
        </div>
    </div>
</template>
<script>
import { Calendar } from "@element-plus/icons-vue";
import ApplyHeader from "@/components/team/apply/ApplyHeader.vue";
import { getEvents } from "@/service/team/apply.js";
import { showDate } from "@/utils/filters";
import { __imgPath } from "@/utils/config";
import {resolveImagePath} from '@jx3box/jx3box-common/js/utils'

export default {
    name: "eventsList",
    components: { ApplyHeader, Calendar },
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
        resolveImagePath,
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
