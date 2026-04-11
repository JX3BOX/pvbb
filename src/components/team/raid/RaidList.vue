<template>
    <div class="m-raid-list" :class="{ isIndex }">
        <!-- <table>
            <thead>
                <th width="200px">活动</th>
                <th width="160px">团队</th>
                <th width="80px">服务器</th>
                <th :width="time == '全部' ? '200px' : '60px'">时间</th>
                <th width="300px">标题</th>
                <th width="160px">队长</th>
                <th width="60px">状态</th>
                <th width="80px">操作</th>
            </thead>
            <tbody>
                <tr class="u-item" v-for="(item,i) in data" :key="i">
                    <td class="u-name u-sp">
                        <em class="u-placeholder">活动</em>
                        <span>{{item.name}}</span>
                        <span class="u-today" v-if="isToday(item.start_time)">★ 今天</span>
                    </td>
                    <td class="u-team">
                        <em class="u-placeholder">团队</em>
                        <router-link :to="'/org/' + item.team_id" target="_blank">
                            <img :src="getTeamLogo(item.team_logo)">
                            {{item.team_name}}
                        </router-link>
                    </td>
                    <td class="u-server">
                        <em class="u-placeholder">服务器</em>
                        <span>{{item.server}}</span>
                    </td>
                    <td class="u-t">
                        <em class="u-placeholder">时间</em>
                        <span
                            class="u-date u-blue"
                            v-if="time == '全部'"
                        >{{item.start_time | showRaidFullDate}}</span>
                        <span
                            class="u-time u-green"
                            style="margin-left:10px;"
                        >{{item.start_time | showRaidTime}}</span>
                    </td>
                    <td>
                        <em class="u-placeholder">招募</em>
                        <router-link
                            class="u-title"
                            :to="'/raid/' + item.id"
                            target="_blank"
                        >{{item.title}}</router-link>
                    </td>
                    <td class="u-leader">
                        <em class="u-placeholder">队长</em>
                        {{item.leader || '未知'}}
                    </td>
                    <td class="u-count">
                        <em class="u-placeholder">状态</em>
                        <span>
                            <b
                                :class="showCountColor(item.count_normal,item.count_total)"
                            >{{item.count_normal}}</b>
                            / {{item.count_total}}
                        </span>
                    </td>
                    <td class="u-op">
                        <span>
                            <el-button
                                type="primary"
                                @click="subscribe(item.id)"
                                size="small"
                                icon="el-icon-s-flag"
                            >预约</el-button>
                        </span>
                    </td>
                </tr>
            </tbody>
        </table> -->
        <template v-for="item in data" :key="item.id">
            <activity-item :activity="item"></activity-item>
        </template>
    </div>
</template>

<script>
import { moment } from "@jx3box/jx3box-common/js/moment";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import ActivityItem from "./ActivityItem.vue";
export default {
    name: "RaidList",
    props: ["data", "time", "isIndex"],
    components: {
        ActivityItem,
    },
    data: function () {
        return {};
    },
    methods: {
        subscribe: function (id) {
            this.$router.push("/raid/" + id);
        },
        showCountColor: function (current, total) {
            if (current == total) {
                return "full";
            } else if (current < total * 0.3) {
                return "rich";
            } else if (current >= total * 0.8) {
                return "warning";
            }
            return "";
        },
        isToday: function (d) {
            return moment(d).format("MM-DD") == moment(new Date()).format("MM-DD");
        },
        getTeamLogo: function (val) {
            return showAvatar(val, 24);
        },
    },
    filters: {
        showRaidTime: function (d) {
            return moment(d).format("HH:mm");
        },
        showRaidFullDate: function (d) {
            return moment(d).format("MM") + "月" + moment(d).format("DD") + "日" + ` (${moment(d).format("dddd")})`;
        },
    },
    created: function () {},
    mounted: function () {},
};
</script>
