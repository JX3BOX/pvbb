<template>
    <div class="v-raid-view">
        <div ref="teamImage" :class="hideBtn ? 'm-teamImage' : ''" :style="boxsize">
            <h1 class="m-title">
                <i class="el-icon-s-flag"></i>
                <span class="u-txt">【{{ data.team_name }}】{{ data.name }}</span>
                <div class="u-op">
                    <el-button
                        class="u-edit"
                        size="small"
                        type="warning"
                        icon="Edit"
                        @click="editRaid"
                        v-if="isAdmin || canManage"
                        :disabled="isOldVersion"
                        >编辑活动</el-button
                    >

                    <el-button class="u-back" size="small" icon="ArrowLeft" @click="goBack">返回列表</el-button>
                </div>
            </h1>
            <div class="m-raid-view-header">
                <team-info :info="info" :isRaid="true" :team_id="team_id" />
            </div>

            <el-divider content-position="left"> <i class="el-icon-data-board"></i> 活动详情 </el-divider>
            <el-alert
                v-if="isOldVersion"
                title="2022年4月28日起，v1旧版排表仅可读。"
                type="warning"
                show-icon
                :closable="false"
                center
            >
            </el-alert>
            <div class="m-raid-view-meta">
                <ul>
                    <li>
                        <em>开团时间</em>
                        <span class="u-time">{{ showTime(data.start_time) }}</span>
                    </li>
                    <li>
                        <em>队长指挥</em>
                        <span class="u-leader">{{ data.leader }}</span>
                    </li>
                </ul>
            </div>
            <div class="m-raid-view-info">
                <h2 class="u-title">
                    <i class="el-icon-s-flag"></i>
                    {{ data.title }}
                </h2>
                <p class="u-desc">
                    <i class="el-icon-collection-tag"></i>
                    {{ data.desc || "无任何补充说明" }}
                </p>
            </div>
            <div class="m-raid-lackmount" v-if="lackMounts.length">
                <h2 class="u-title"><i class="el-icon-success"></i> 以下职业无冲突</h2>
                <div class="u-list">
                    <li class="u-item" v-for="mount in lackMounts" :key="mount.id">
                        <img class="u-icon" :src="showMountIcon(mount.id)" :alt="mount.name" />
                        <span>{{ mount.name }}</span>
                        <span>✔️</span>
                    </li>
                </div>
            </div>

            <template v-if="flag">
                <div class="m-raid-view-join" v-if="!isOldVersion">
                    <el-button type="primary" icon="Right" @click="handleShowDialog" :disabled="!canJoin"
                        >预约报名</el-button
                    >
                    <el-button type="primary" icon="FullScreen" :disabled="!canJoin" @click="showMiniprogramCode"
                        >微信小程序</el-button
                    >

                    <div class="u-tip" :class="{ isError: !canJoin }">
                        <i class="el-icon-s-check"></i>
                        {{ showAuth(data.auth) }}
                    </div>
                </div>

                <el-divider content-position="left"> <i class="el-icon-user"></i> 活动排表 </el-divider>
                <Raid
                    :count="data.count"
                    :team-id="team_id"
                    :leader="data.leader"
                    :content="data.content"
                    :row="data.row"
                    :col="data.col"
                    :is-public="data.is_public"
                    :isForceMatch="data.force_match"
                    @updateMembers="handleUpdate"
                />

                <join-pop
                    title="预约报名"
                    v-model="joinShow"
                    :auth="data.auth"
                    :client="client"
                    @confirm="handleConfrim"
                />
            </template>

            <el-dialog class="m-wx-dialog" v-model="miniprogramCode" width="255px" center top="30vh">
                <el-image :src="miniprogramCodeUrl" class="wx-code"></el-image>
            </el-dialog>
        </div>
        <div v-if="hideBtn" :style="boxsize"></div>
    </div>
</template>

<script>
import html2canvas from "html2canvas";
import raid_auth from "@/assets/data/team/raid_auth.json";
import { getTeam } from "@/service/team/team.js";
import User from "@jx3box/jx3box-common/js/user";
import { getRaid, updateRaid, removeRaid, addTobeMember, getWxacode } from "@/service/team/raid.js";
import { checkMyAuthority } from "@/service/team/member.js";
import { __ossMirror } from "@/utils/config";
// components
import Raid from "@/components/team/raid/Raid.vue";
import team_info from "@/components/team/org/team_info.vue";
import JoinPop from "@/components/team/raid/JoinPop.vue";
import xf from "@jx3box/jx3box-data/data/xf/xf.json";
import xfid from "@jx3box/jx3box-data/data/xf/xfid.json";
import originServer from "@jx3box/jx3box-data/data/server/server_origin.json";
import cloneDeep from "lodash/cloneDeep";
import { showTime, showMountIcon } from "@/utils/filters";
export default {
    name: "ViewRaid",
    props: [],
    components: {
        "team-info": team_info,
        Raid,
        JoinPop,
    },
    data: function () {
        return {
            info: "",
            data: "",

            raid_auth,
            authority: 0,
            auth_map: {
                r_raid: 0,
            },
            joinShow: false,

            formData: {},
            flag: false,

            isAdmin: User.isAdmin(),
            visible: false,

            imgUrl: "",
            showImage: false,
            hideBtn: false,
            boxsize: {},

            // 小程序码
            miniprogramCodeUrl: "",
            miniprogramCode: false,
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
        client: function () {
            if (this.info) {
                return originServer.includes(this.info?.server) ? "origin" : "std";
            }
            return this.$store.state.client;
        },
        team_id: function () {
            return this.data?.team_id;
        },
        canJoin: function () {
            if (this.data.auth == 3) {
                return false;
            } else if (this.data.auth == 2) {
                return this.authority >= 2;
            } else if (this.data.auth == 1) {
                return this.authority >= 1;
            }
            return true;
        },
        canManage: function () {
            return this.$store.state.canManage;
        },
        isOldVersion: function () {
            return !!this.data?.content;
        },
        chosenRole: function ({ formData }) {
            const data = {
                name: formData.name,
                mount: ~~formData.mount,
                order: 0,
                remark: formData.remark,
            };
            formData.role_id && (data.role_id = formData.role_id);
            return {
                /* role_id : 1,    //如果是自定义的角色,无此字段，如果是选择的角色自动获取
                name : 'test-name',  //如果是选择的角色自动获取，否则手动填写
                mount : '10081',    //必须要指定一个心法，即使选择了七秀，需要指定是用冰心还是用云裳报名
                server : 'test-server',    //如果是自定义的角色，无此字段，如果是选择的角色自动获取 */
                ...data,
            };
        },
        routerName() {
            return this.$route.name;
        },
        lackMounts: function () {
            const totalMounts = this.data?.content?.map((member) => Number(member.mount));
            const _mounts = new Set(totalMounts);
            const _lackMount = Object.keys(xfid)
                .filter((x) => !_mounts.has(Number(x)))
                .map((item) => Number(item));

            const xfWithClient = Object.values(xf).filter((item) => item.client.includes(this.client));

            return xfWithClient.filter((_xf) => _xf.id && _lackMount?.includes(_xf.id));
        },
    },
    watch: {
        data: {
            deep: true,
            handler() {
                if (this.routerName === "view_raid" && this.flag) {
                    const count_normal = this.data.content.filter((item) => item.name).length;
                    const _data = cloneDeep(this.data);
                    _data.count_normal = count_normal;
                    updateRaid(this.id, _data).then(() => {
                        this.$message({
                            message: "更新成功",
                            type: "success",
                        });
                    });
                }
            },
        },
        showImage: {
            deep: true,
            handler(val) {
                if (val == false) {
                    this.hideBtn = false;
                }
            },
        },
    },
    methods: {
        //页面截图
        // =================================
        toCanvas: function () {
            var img = this.$refs.teamImage;
            this.boxsize.width = img.offsetWidth + "px";
            this.boxsize.height = img.offsetHeight + "px";

            this.hideBtn = true;
            setTimeout(() => {
                html2canvas(img).then(async (canvas) => {
                    let dataURL = canvas.toDataURL("image/png");
                    this.imgUrl = dataURL;
                    if (this.imgUrl !== "") {
                        this.showImage = true;
                        const data = await fetch(this.imgUrl);
                        const blob = await data.blob();
                        await navigator.clipboard.write([
                            new ClipboardItem({
                                [blob.type]: blob,
                            }),
                        ]);
                    }
                });
            }, 500);
        },
        // 数据加载
        // ==================================
        getRaid: function () {
            return getRaid(this.id).then((res) => {
                this.data = res.data.data;
            });
        },
        getTeam: function () {
            return getTeam(this.team_id).then((res) => {
                this.info = res.data.data;
            });
        },
        getAuthority: function () {
            if (!User.isLogin()) return;
            return checkMyAuthority(this.team_id).then((res) => {
                this.authority = res.data.data.authority;
                this.auth_map = res.data.data;
                this.$store.commit("setManageStatus", this.auth_map.r_raid === 1 || this.auth_map.authority === 99);
                this.$store.commit("setIsTeammate", this.authority >= 2);
            });
        },
        init: function () {
            this.getRaid().then(() => {
                this.getTeam();
                this.getAuthority().then(() => {
                    this.flag = true;
                });
            });
        },

        // 报名逻辑
        // ==================================
        handleShowDialog: function () {
            this.joinShow = true;
        },
        // 预约报名确认
        handleConfrim: function (data) {
            this.formData = data;
            this.Join();
        },
        Join: function () {
            // 提交到报名接口
            addTobeMember(this.id, this.chosenRole).then((res) => {
                this.$message({
                    message: "申请成功,请等待团长审核",
                    type: "success",
                });
                this.joinShow = false;
                this.$bus.$emit("updateTobe", res.data.data);
            });
        },

        // 其它
        // ===========================
        goBack: function () {
            if (document.referrer?.includes("manage")) {
                this.$router.push("/raid/manage");
            } else {
                this.$router.push("/raid/list");
            }
        },
        editRaid: function () {
            this.$router.push(`/raid/edit/${this.id}`);
        },
        rmRaid: function () {
            removeRaid(this.id).then((res) => {
                this.$message({
                    message: "删除成功",
                    type: "success",
                });
                this.visible = false;
                this.$router.push("/raid/list");
            });
        },

        // 前台排表
        // ==================================
        // 保存队员
        handleUpdate(members) {
            // this.data.content = members;
        },

        // 小程序码
        // ===================================
        showMiniprogramCode: function () {
            this.miniprogramCode = true;
            if (this.miniprogramCodeUrl) return;
            getWxacode(this.id).then((res) => {
                this.miniprogramCodeUrl = __ossMirror + res.data.data.meta_val;
            });
        },
        showAuth: function (val) {
            return raid_auth[val];
        },
        showTime,
        showMountIcon,
    },
    created: function () {
        this.init();
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/raid/view_raid.less";
.m-teamImage-dialog {
    .el-dialog__body {
        border-top: 1px solid #999;
        .x;
        .u-img {
            width: 100%;
        }
    }
}
.v-raid-view {
    .pr;
    .m-teamImage {
        .pa;
        .lt(-20px, -10px);
        padding: 10px 20px;
    }
}
.m-wx-dialog {
    .el-dialog__header {
        padding: 0;
    }
    .el-dialog__body {
        padding: 20px;
    }
    .wx-code {
        img {
            width: 215px;
        }
    }
}

@media screen and (max-width: @phone) {
    .m-wx-dialog .el-dialog {
        .size(100%) !important;
        min-width: 0;
        margin: 0 !important;
        display: flex;
        padding: 0;
        justify-content: center;
        height: 100%;
        align-items: center;
    }
}
</style>
