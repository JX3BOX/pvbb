<template>
    <div class="m-permission-panel" :class="{ 'is-archive': isArchive }">
        <div class="m-permission-box" v-if="status">
            <div class="m-permission-header">
                <div class="m-permission-heading" v-if="isArchive">
                    <span class="u-heading-mark" aria-hidden="true"></span>
                    <h2>{{ $t("team.permissions.title") }}</h2>
                    <span class="u-admin-count">{{ len }} / {{ limit }}</span>
                </div>
                <el-button class="u-btn-add" type="primary" icon="Plus" @click="openDialog" :disabled="len >= limit"
                    >{{ $t("team.permissions.add") }}
                    <span class="u-limit" :class="{ limit: len >= limit }">({{ len }}/{{ limit }})</span></el-button
                >
            </div>
            <div class="m-permission-box m-permission-table">
                <div class="m-permission-list">
                    <el-row :gutter="10" class="m-permission-list-header" type="flex">
                        <el-col :span="2" class="u-leader">{{ $t("team.permissions.user") }}</el-col>
                        <el-col :span="1">{{ $t("team.permissions.basic") }}</el-col>
                        <el-col :span="1">{{ $t("team.permissions.permission") }}</el-col>
                        <el-col :span="1">{{ $t("team.permissions.race") }}</el-col>
                        <el-col :span="1">{{ $t("team.permissions.member") }}</el-col>
                        <!-- <el-col :span="1">活动规划</el-col> -->
                        <el-col :span="1">{{ $t("team.permissions.snapshot") }}</el-col>
                        <el-col :span="1">{{ $t("team.permissions.video") }}</el-col>
                        <el-col :span="1">{{ $t("team.permissions.battle") }}</el-col>
                        <el-col :span="1">{{ $t("team.permissions.dkp") }}</el-col>
                        <el-col :span="1">{{ $t("team.permissions.ledger") }}</el-col>
                        <el-col :span="1">{{ $t("team.permissions.activity") }}</el-col>
                        <el-col :span="1">{{ $t("team.permissions.operation") }}</el-col>
                    </el-row>
                    <el-row
                        :gutter="10"
                        class="u-super"
                        :class="{ 'is-founder': item.level == 99 }"
                        type="flex"
                        v-for="(item, i) in data"
                        :key="i"
                    >
                        <template v-if="item.level == 99">
                            <el-col :span="2" class="u-leader">
                                <a class="u-leader-link" :href="authorLink(item.user_id)" target="_blank"
                                    ><img class="u-leader-img" :src="showAvatar(item.user_avatar)" /><span
                                        class="u-leader-name"
                                        >{{ item.display_name }}</span
                                    ><em v-if="isArchive" class="u-leader-role">{{ $t("team.permissions.creator") }}</em></a
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
                                        ><em v-if="isArchive" class="u-leader-role">{{ $t("team.permissions.administrator") }}</em></a
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
                                    @change="updateLeader('r_dkp', item)"
                                ></el-checkbox
                            ></el-col>
                            <el-col :span="1"
                                ><el-checkbox
                                    v-model="item.r_drop"
                                    :true-value="1"
                                    :false-value="0"
                                    @change="updateLeader('r_drop', item)"
                                ></el-checkbox
                            ></el-col>
                            <el-col :span="1"
                                ><el-checkbox
                                    v-model="item.r_raid"
                                    :true-value="1"
                                    :false-value="0"
                                    @change="updateLeader('r_raid', item)"
                                ></el-checkbox
                            ></el-col>
                            <el-col :span="1"
                                ><el-button
                                    class="u-delete"
                                    type="info"
                                    icon="Delete"
                                    size="small"
                                    plain
                                    @click="removeLeader(item)"
                                    >{{ $t("team.permissions.remove") }}</el-button
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
                {{ $t("team.permissions.insufficient") }}
            </p>
            <div>
                {{ $t("team.permissions.premiumHint") }}
            </div>
            <a class="u-buy el-button el-button--primary" href="/vip/premium?from=team_permission" target="_blank"
                ><i class="el-icon-shopping-cart-2"></i> {{ $t("team.permissions.upgrade") }}</a
            >
        </div>
        <userpop
            :title="$t('team.permissions.addTitle')"
            :data="leader"
            :variant="variant"
            class="m-team-leader-dialog"
            v-model="user_pop_status"
            @confirm="addLeader"
            ><i class="el-icon-warning-outline"></i> {{ $t("team.permissions.uidHint") }}</userpop
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
    props: ["variant", "teamId"],
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
            return ~~(this.teamId || this.$route.params.id);
        },
        isArchive: function () {
            return this.variant === "archive";
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
                        title: this.$t("team.permissions.success"),
                        message: this.$t("team.permissions.added"),
                        type: "success",
                    });
                    location.reload();
                });
            } else {
                this.$alert(this.$t("team.permissions.exists"), this.$t("team.permissions.reminder"), {
                    confirmButtonText: this.$t("team.permissions.confirm"),
                });
            }
        },
        removeLeader: function (item) {
            this.$confirm(this.$t("team.permissions.removeConfirm", { name: item.display_name }), this.$t("team.permissions.removeTitle"), {
                confirmButtonText: this.$t("team.permissions.confirmRemove"),
                cancelButtonText: this.$t("team.permissions.cancel"),
                type: "warning",
            })
                .then(() => delAdmin(this.id, item.user_id))
                .then((res) => {
                    this.$notify({
                        title: this.$t("team.permissions.success"),
                        message: res.data.msg,
                        type: "success",
                    });
                    location.reload();
                })
                .catch((reason) => {
                    if (reason === "cancel" || reason === "close") return;
                    this.$notify({
                        title: this.$t("team.permissions.removeFailed"),
                        message: reason?.response?.data?.msg || this.$t("team.permissions.retry"),
                        type: "error",
                    });
                });
        },
        updateLeader: function (type, item) {
            let value = item[type];
            updateAdmin(this.id, item.user_id, {
                [type]: value,
            }).then(() => {
                this.$notify({
                    title: this.$t("team.permissions.updated"),
                    message: value ? this.$t("team.permissions.authorized") : this.$t("team.permissions.revoked"),
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
