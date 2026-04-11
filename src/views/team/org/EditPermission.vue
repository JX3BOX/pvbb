<template>
    <div class="m-permission-panel">
        <div class="m-permission-box" v-if="status">
            <div class="m-permission-header">
                <el-button class="u-btn-add" type="primary" icon="Plus" @click="openDialog" :disabled="len >= limit"
                    >添加管理员
                    <span class="u-limit" :class="{ limit: len >= limit }">({{ len }}/{{ limit }})</span></el-button
                >
            </div>
            <div class="m-permission-box">
                <div class="m-permission-list">
                    <el-row :gutter="10" class="m-permission-list-header" type="flex">
                        <el-col :span="2" class="u-leader">用户</el-col>
                        <el-col :span="1">基础设置</el-col>
                        <el-col :span="1">权限管理</el-col>
                        <el-col :span="1">赛事报名</el-col>
                        <el-col :span="1">成员管理</el-col>
                        <!-- <el-col :span="1">活动规划</el-col> -->
                        <el-col :span="1">快照管理</el-col>
                        <el-col :span="1">视频管理</el-col>
                        <el-col :span="1">战绩管理</el-col>
                        <el-col :span="1">DKP管理</el-col>
                        <el-col :span="1">金团账目</el-col>
                        <el-col :span="1">团队活动</el-col>
                        <el-col :span="1">操作</el-col>
                    </el-row>
                    <el-row :gutter="10" class="u-super" type="flex" v-for="(item, i) in data" :key="i">
                        <template v-if="item.level == 99">
                            <el-col :span="2" class="u-leader">
                                <a class="u-leader-link" :href="authorLink(item.user_id)" target="_blank"
                                    ><img class="u-leader-img" :src="showAvatar(item.user_avatar)" /><span
                                        class="u-leader-name"
                                        >{{ item.display_name }}</span
                                    ></a
                                >
                            </el-col>
                            <el-col :span="1"><el-checkbox checked disabled></el-checkbox></el-col>
                            <el-col :span="1"><el-checkbox checked disabled></el-checkbox></el-col>
                            <el-col :span="1"><el-checkbox checked disabled></el-checkbox></el-col>
                            <el-col :span="1"><el-checkbox checked disabled></el-checkbox></el-col>
                            <el-col :span="1"><el-checkbox checked disabled></el-checkbox></el-col>
                            <el-col :span="1"><el-checkbox checked disabled></el-checkbox></el-col>
                            <el-col :span="1"><el-checkbox checked disabled></el-checkbox></el-col>
                            <el-col :span="1"><el-checkbox checked disabled></el-checkbox></el-col>
                            <el-col :span="1"><el-checkbox checked disabled></el-checkbox></el-col>
                            <el-col :span="1"></el-col>
                        </template>
                        <template v-else>
                            <el-col :span="2" class="u-leader">
                                <div>
                                    <a class="u-leader-link" :href="authorLink(item.user_id)" target="_blank"
                                        ><img class="u-leader-img" :src="showAvatar(item.user_avatar)" /><span
                                            class="u-leader-name"
                                            >{{ item.display_name }}</span
                                        ></a
                                    >
                                </div>
                            </el-col>
                            <el-col :span="1"></el-col>
                            <el-col :span="1"></el-col>
                            <el-col :span="1"></el-col>
                            <el-col :span="1"
                                ><el-checkbox
                                    v-model="item.r_member"
                                    :true-value="1"
                                    :false-value="0"
                                    @change="updateLeader('r_member', item)"
                                ></el-checkbox
                            ></el-col>

                            <!-- <el-col :span="1"
                                ><el-checkbox
                                    v-model="item.r_plan"
                                    :true-value="1"
                                    :false-value="0"
                                    @change="updateLeader('r_plan', item)"
                                ></el-checkbox
                            ></el-col> -->
                            <el-col :span="1"
                                ><el-checkbox
                                    v-model="item.r_snapshot"
                                    :true-value="1"
                                    :false-value="0"
                                    @change="updateLeader('r_snapshot', item)"
                                ></el-checkbox
                            ></el-col>
                            <el-col :span="1"
                                ><el-checkbox
                                    v-model="item.r_video"
                                    :true-value="1"
                                    :false-value="0"
                                    @change="updateLeader('r_video', item)"
                                ></el-checkbox
                            ></el-col>
                            <el-col :span="1"
                                ><el-checkbox
                                    v-model="item.r_race"
                                    :true-value="1"
                                    :false-value="0"
                                    @change="updateLeader('r_race', item)"
                                ></el-checkbox
                            ></el-col>
                            <el-col :span="1"
                                ><el-checkbox
                                    v-model="item.r_dkp"
                                    :true-value="1"
                                    :false-value="0"
                                    disabled
                                    @change="updateLeader('r_dkp', item)"
                                ></el-checkbox
                            ></el-col>
                            <el-col :span="1"
                                ><el-checkbox
                                    v-model="item.r_drop"
                                    :true-value="1"
                                    :false-value="0"
                                    disabled
                                    @change="updateLeader('r_drop', item)"
                                ></el-checkbox
                            ></el-col>
                            <el-col :span="1"
                                ><el-checkbox
                                    v-model="item.r_raid"
                                    :true-value="1"
                                    :false-value="0"
                                    disabled
                                    @change="updateLeader('r_raid', item)"
                                ></el-checkbox
                            ></el-col>
                            <el-col :span="1"
                                ><el-button type="info" icon="Delete" size="small" plain @click="removeLeader(item)"
                                    >删除</el-button
                                ></el-col
                            >
                        </template>
                    </el-row>
                </div>
            </div>
        </div>
        <div class="m-team-limit" v-else>
            <p class="u-title">
                <img class="u-icon" svg-inline src="@/assets/img/team/icons/warning.svg" />
                权限不足
            </p>
            <div>
                该功能仅对<a href="/vip/premium?from=team_permission" target="_blank">专业版</a
                >账号开放，用于添加团队的管理员及详细权限设置。
            </div>
            <a class="u-buy el-button el-button--primary" href="/vip/premium?from=team_permission" target="_blank"
                ><i class="el-icon-shopping-cart-2"></i> 升级专业版账号</a
            >
        </div>
        <userpop
            title="添加管理员"
            :data="leader"
            class="m-team-leader-dialog"
            v-model="user_pop_status"
            @confirm="addLeader"
            ><i class="el-icon-warning-outline"></i> 用户UID可在用户主页查看</userpop
        >
    </div>
</template>

<script>
import userpop from "@/components/team/widget/userpop.vue";
import { authorLink, getThumbnail, showAvatar } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { getAdmins, addAdmin, delAdmin, updateAdmin } from "@/service/team/admin.js";
export default {
    name: "EditPermission",
    props: [],
    data: function () {
        return {
            status: true,

            leader: "",
            user_pop_status: false,

            data: [],

            founder: {
                user_id: User.getInfo().uid,
                user_avatar: User.getInfo().avatar,
                user_name: User.getInfo().name,
            },

            limit: 20,
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        len: function () {
            return ~~this.data.length;
        },
        leaders: function () {
            let uids = [];
            this.data.forEach((item) => {
                uids.push(item.user_id);
            });
            return uids;
        },
    },
    methods: {
        openDialog: function () {
            this.user_pop_status = true;
        },
        addLeader: function (uid) {
            this.leader = uid;
            if (this.leader && !isNaN(this.leader) && !this.leaders.includes(this.leader)) {
                addAdmin(this.id, uid).then((res) => {
                    this.$notify({
                        title: "成功",
                        message: "管理员添加成功",
                        type: "success",
                    });
                    location.reload();
                });
            } else {
                this.$alert("用户已存在", "提醒", {
                    confirmButtonText: "确定",
                });
            }
        },
        removeLeader: function (item) {
            this.$alert(`确定取消${item.display_name}的管理员身份吗？`, "提醒", {
                confirmButtonText: "确定",
                callback: (action) => {
                    if (action == "confirm") {
                        delAdmin(this.id, item.user_id).then((res) => {
                            this.$notify({
                                title: "成功",
                                message: res.data.msg,
                                type: "success",
                            });
                            location.reload();
                        });
                    }
                },
            });
        },
        updateLeader: function (type, item) {
            let value = item[type];
            updateAdmin(this.id, item.user_id, {
                [type]: value,
            }).then(() => {
                this.$notify({
                    title: "用户权限已更新",
                    message: value ? "授权成功" : "取消授权成功",
                    type: "success",
                });
            });
        },
        loadLeaders: function () {
            if (this.id) {
                getAdmins(this.id).then((res) => {
                    this.data = res.data.data.list || [];
                });
            }
        },
        authorLink,
        showAvatar: function (val) {
            return showAvatar(val, 52);
        },
    },
    filters: {},
    mounted: function () {
        // User.isPRO().then((data) => {
        // this.status = data;
        // if (this.status) {
        this.loadLeaders();
        // }
        // });
    },
    components: {
        userpop,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/edit_permission.less";
</style>
