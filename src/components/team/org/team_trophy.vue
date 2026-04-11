<template>
    <div class="m-team-trophy">
        <el-divider content-position="left">
            <i class="el-icon-trophy"></i> 团队成绩
        </el-divider>
        <ul class="u-list" v-if="data && data.length">
            <li class="u-trophy" v-for="(item, i) in data" :key="i">
                <i class="el-icon-trophy"></i>
                <span class="u-year">{{ item.year }}</span>
                <span class="u-div">|</span>
                <a
                    class="u-honor"
                    :href="showEventLink(item.event_id, item.achieve_id)"
                    target="_blank"
                >{{ item.honor || showHonor(item) }}</a>
            </li>
        </ul>
        <div class="u-null" v-else>
            <i class="el-icon-warning-outline"></i> 还没有相关记录
        </div>
    </div>
</template>

<script>
import { getLink } from "@jx3box/jx3box-common/js/utils";
import {getEventAid, getEvent} from "@/service/team/server.js";
import {getTeamHonors} from '@/service/team/team.js'
export default {
    name: "team_trophy",
    props: ["id"],
    data: function () {
        return {
            data : [],
            events: {},
            aidmap: {}
        };
    },
    methods: {
        showEventLink: function (event_id, achieve_id) {
            return getLink("rank", event_id, achieve_id);
        },
        showHonor : function (item){
            return this.events[item.event_id] + '·' + this.aidmap[item.achieve_id] + '第' + item.ranking + '名'
        },
        loadConfig: async function(){
            await getEvent().then((res) => {
                let data = res.data?.data;
                data.forEach((item) => {
                    this.events[item.ID] = item.name
                })
            })
            await getEventAid().then((res) => {
                let data = res.data?.data;
                data.forEach((item) => {
                    this.aidmap[item.achievement_id] = item.name
                })
            })
        }
    },
    mounted: async  function () {
        await this.loadConfig()
        getTeamHonors(this.id).then((res) => {
            this.data = res.data?.data?.list || []
        });
    },
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_trophy.less";
</style>
