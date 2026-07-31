<template>
    <article class="m-raid-item">
        <div class="m-raid-item-header">
            <div class="u-main">
                <div class="u-title-row">
                    <button
                        type="button"
                        class="u-sticky-button"
                        :class="{ 'is-sticky': data.sticky }"
                        :title="data.sticky ? '取消置顶' : '置顶活动'"
                        @click.stop="setSticky"
                    >
                        <i class="el-icon-top"></i>
                    </button>
                    <router-link
                        class="u-title"
                        :to="{ name: 'view_raid', params: { id: data.id } }"
                        target="_blank"
                    >
                        <span class="u-name">{{ data.name }}</span>
                        <span v-if="data.is_public" class="u-public"><i class="el-icon-position"></i> 活动大厅</span>
                    </router-link>
                </div>
                <p class="u-recruit" :title="data.title">{{ data.title || "暂未填写活动标题" }}</p>
                <div class="u-meta">
                    <time><i class="el-icon-date"></i>{{ showTime(data.start_time) }} · {{ showRaidWeek(data.start_time) }}</time>
                    <span><i :class="data.auth ? 'el-icon-lock' : 'el-icon-unlock'"></i>{{ showAuth(data.auth) }}</span>
                    <span><i class="el-icon-user"></i>{{ getUserName(data.raid_creator_info) }}</span>
                    <span v-if="data.count_total"><i class="el-icon-s-custom"></i>{{ data.count_normal || 0 }}/{{ data.count_total }} 人</span>
                </div>
            </div>
            <div class="u-op">
                <el-button class="u-view" size="small" @click="viewRaidDetail">查看排表</el-button>
                <el-button class="u-edit" type="primary" size="small" plain icon="Edit" @click="edit(data.id)">编辑</el-button>
                <el-dropdown trigger="click" @command="handleCommand">
                    <el-button class="u-more" size="small" aria-label="更多操作"><i class="el-icon-more"></i></el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="delete"><i class="el-icon-delete"></i>删除活动</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </article>
</template>

<script>
import raidAuthMap from "@/assets/data/team/raid_auth.json";
import { deleteRaid, setRaidSticky } from "@/service/team/raid.js";
import { moment } from "@jx3box/jx3box-common/js/moment";
import { showRaidWeek, showTime } from "@/utils/filters";
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
            this.$emit("edit", id);
        },
        handleCommand(command) {
            if (command === "delete") this.del(this.data);
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
            const { href } = this.$router.resolve({
                name: "view_raid",
                params: { id: this.data.id },
            });
            window.open(href, "_blank");
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
