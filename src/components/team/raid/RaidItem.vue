<template>
    <div class="m-raid-item">
        <div class="m-raid-item-header">
            <h4 class="u-title">
                <img
                    class="u-icon"
                    v-if="data.is_public"
                    src="@/assets/img/team/raid/broadcast.png"
                    alt="活动大厅广播"
                />
                <i
                    class="u-top el-icon-top u-normal"
                    :class="{ 'u-sticky': data.sticky }"
                    :title="data.sticky ? '取消置顶' : '置顶'"
                    @click.stop="setSticky"
                ></i>
                <router-link :to="'/raid/' + data.id" target="_blank">
                    <span class="u-team">【{{ data.team_name }}】</span>
                    <span class="u-name">{{ data.name }}</span>
                </router-link>
            </h4>
            <div class="u-meta u-meta-hover">
                <time class="u-time">
                    <i class="el-icon-date"></i>
                    <em>开团时间</em>
                    <b>{{ showTime(data.start_time) }}（{{ showRaidWeek(data.start_time) }}）</b>
                </time>
                <span class="u-auth">
                    <i :class="data.auth ? 'el-icon-lock' : 'el-icon-unlock'"></i>
                    <em>报名权限</em>
                    {{ showAuth(data.auth) }}
                </span>
                <div class="u-desc">
                    <i class="el-icon-data-analysis"></i>
                    <em>活动标题</em>
                    <b class="u-recruit">{{ data.title || "无" }}</b>
                </div>
                <div class="u-desc u-remark" v-if="data.remark">
                    <i class="el-icon-tickets"></i>
                    <em>备注说明</em>
                    {{ data.remark || "无" }}
                </div>
                <div class="u-desc u-misc">
                    <span class="u-misc-item">
                        <i class="el-icon-user"></i>
                        <em>创建人 :</em>
                        <a @click.stop :href="toAuthPage(data.user_id)" target="_blank">
                            <img class="u-user-avatar" :src="getUserAvatar(data.raid_creator_info)" />
                            <span class="u-user-name">{{ getUserName(data.raid_creator_info) }}</span>
                        </a>
                    </span>

                    <span class="u-misc-item" v-if="data.last_edit">
                        <i class="el-icon-edit"></i>
                        <em>最后修改 :</em>
                        <a @click.stop :href="toAuthPage(data.user_id)" target="_blank">
                            <img class="u-user-avatar" :src="getUserAvatar(data.raid_editor_info)" />
                            <span class="u-user-name">{{ getUserName(data.raid_editor_info) }}</span>
                        </a>
                    </span>
                </div>
            </div>
            <div class="u-op">
                <el-button type="primary" size="small" plain icon="Edit" @click="edit(data.id)">编辑</el-button>
                <el-button type="info" plain size="small" icon="Delete" @click="del(data)">删除</el-button>
            </div>
        </div>
    </div>
</template>

<script>
import raidAuthMap from "@/assets/data/team/raid_auth.json";
import { deleteRaid, setRaidSticky } from "@/service/team/raid.js";
import { moment } from "@jx3box/jx3box-common/js/moment";
import { authorLink, showRaidWeek, showTime } from "@/utils/filters";
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "RaidItem",
    props: ["team_id", "data"],
    components: {},
    data: function () {
        return {
            raidAuthMap,
        };
    },
    computed: {
        isFull: function () {
            return ~~this.data.count_normal == ~~this.data.count_total;
        },
    },
    methods: {
        edit: function (id) {
            this.$router.push("/raid/edit/" + id);
        },
        del: function (data) {
            this.$alert("确定删除这条记录吗？", "消息", {
                confirmButtonText: "确定",
                callback: (action) => {
                    if (action == "confirm") {
                        deleteRaid(data.team_id, data.id).then((res) => {
                            this.$message({
                                type: "success",
                                message: `删除成功`,
                            });
                            this.$emit("dropItem");
                        });
                    }
                },
            });
        },
        // 跳转至 raid 详情
        viewRaidDetail() {
            window.open(`/raid/${this.data.id}`, "_blank");
            // this.$router.push(`/raid/${this.data.id}`);
        },
        /**
         * 跳转至用户页面
         */
        toAuthPage(id) {
            return authorLink(id);
        },
        getUserAvatar(user) {
            return showAvatar(user?.user_avatar);
        },
        getUserName(user) {
            return user?.display_name || "未知";
        },
        // 置顶
        setSticky() {
            const data = {
                sticky: this.data.sticky ? 0 : 1,
            };
            setRaidSticky(this.data.id, data).then((res) => {
                this.$message({
                    type: "success",
                    message: `${data.sticky ? "置顶" : "取消置顶"}成功`,
                });
                this.$emit("sticky");
            });
        },
        showAuth: function (val) {
            return raidAuthMap[val] || "未知";
        },
        showRaidWeek: function (d) {
            return moment(d).format("dddd");
        },
        showTime,
    },
};
</script>
