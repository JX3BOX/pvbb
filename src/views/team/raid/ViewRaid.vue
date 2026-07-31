<template>
    <div class="v-raid-view" v-loading="loading">
        <div ref="teamImage" class="m-raid-view-page" :class="{ 'm-teamImage': hideBtn }" :style="boxsize">
            <header class="m-raid-view-hero">
                <div class="u-heading">
                    <span class="u-eyebrow"><i class="el-icon-data-board"></i> RAID 排表</span>
                    <h1>{{ data.name || "活动详情" }}</h1>
                    <p>
                        <span>{{ data.team_name || "团队活动" }}</span>
                        <i></i>
                        <span>{{ showTime(data.start_time) || "时间待定" }}</span>
                    </p>
                </div>
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
            </header>

            <el-alert
                v-if="loadError"
                class="m-raid-view-error"
                title="活动详情加载失败，请稍后重试"
                type="error"
                show-icon
                :closable="false"
            />

            <div v-if="info && !loadError" class="m-raid-view-header">
                <team-info :info="info" :isRaid="true" :team_id="team_id" />
            </div>

            <template v-if="data && !loadError">
                <section class="m-raid-view-section m-raid-view-overview">
                    <div class="m-raid-section-heading">
                        <div>
                            <span class="u-section-icon"><i class="el-icon-tickets"></i></span>
                            <div>
                                <h2>活动信息</h2>
                                <p>开团安排与报名说明</p>
                            </div>
                        </div>
                        <span class="u-auth" :class="{ 'is-disabled': !canJoin }">
                            <i :class="canJoin ? 'el-icon-unlock' : 'el-icon-lock'"></i>
                            {{ showAuth(data.auth) }}
                        </span>
                    </div>

                    <el-alert
                        v-if="isOldVersion"
                        title="这是旧版排表，仅支持查看。"
                        type="warning"
                        show-icon
                        :closable="false"
                    />

                    <div class="m-raid-view-meta">
                        <div class="u-meta-item">
                            <span class="u-icon"><i class="el-icon-date"></i></span>
                            <div>
                                <em>开团时间</em>
                                <strong>{{ showTime(data.start_time) || "待定" }}</strong>
                            </div>
                        </div>
                        <div class="u-meta-item">
                            <span class="u-icon"><i class="el-icon-microphone"></i></span>
                            <div>
                                <em>队长指挥</em>
                                <strong>{{ data.leader || "暂未填写" }}</strong>
                            </div>
                        </div>
                        <div class="u-meta-item">
                            <span class="u-icon"><i class="el-icon-user"></i></span>
                            <div>
                                <em>活动规模</em>
                                <strong>{{ data.count ? `${data.count} 人` : "按排表安排" }}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="m-raid-view-info">
                        <h3>{{ data.title || data.name || "团队活动" }}</h3>
                        <p>{{ data.desc || "暂无补充说明" }}</p>
                    </div>

                    <div class="m-raid-lackmount" v-if="lackMounts.length">
                        <h3><i class="el-icon-circle-check"></i> 以下职业无冲突</h3>
                        <ul class="u-list">
                            <li class="u-item" v-for="mount in lackMounts" :key="mount.id">
                                <img class="u-icon" :src="showMountIcon(mount.id)" :alt="mount.name" />
                                <span>{{ mount.name }}</span>
                            </li>
                        </ul>
                    </div>
                </section>

                <template v-if="flag">
                    <div class="m-raid-view-join" v-if="!isOldVersion">
                        <div class="u-copy">
                            <span class="u-icon"><i class="el-icon-s-promotion"></i></span>
                            <div>
                                <h3>{{ canJoin ? "报名通道已开放" : "当前暂不可报名" }}</h3>
                                <p>{{ showAuth(data.auth) }}</p>
                            </div>
                        </div>
                        <div class="u-actions">
                            <el-button icon="FullScreen" :disabled="!canJoin" @click="showMiniprogramCode">
                                微信小程序
                            </el-button>
                            <el-button type="primary" icon="Right" @click="handleShowDialog" :disabled="!canJoin">
                                预约报名
                            </el-button>
                        </div>
                    </div>

                    <section class="m-raid-view-section m-raid-view-board">
                        <div class="m-raid-section-heading">
                            <div>
                                <span class="u-section-icon"><i class="el-icon-user"></i></span>
                                <div>
                                    <h2>活动排表</h2>
                                    <p>正式队员、替补队员与候选名单</p>
                                </div>
                            </div>
                        </div>
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
                    </section>

                    <join-pop
                        title="预约报名"
                        v-model="joinShow"
                        :auth="data.auth"
                        :client="client"
                        @confirm="handleConfrim"
                    />
                </template>
            </template>

            <el-dialog class="m-wx-dialog" v-model="miniprogramCode" width="255px" center top="30vh">
                <el-image :src="miniprogramCodeUrl" class="wx-code"></el-image>
            </el-dialog>
        </div>
        <div v-if="hideBtn" :style="boxsize"></div>
        <RaidFormDialog
            v-model="formVisible"
            :raid-id="id"
            :teams="editTeams"
            :default-team-id="team_id"
            @saved="handleRaidSaved"
        />
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
import RaidFormDialog from "@/components/team/raid/RaidFormDialog.vue";
import xf from "@jx3box/jx3box-data/data/xf/xf.json";
import xfid from "@jx3box/jx3box-data/data/xf/xfid.json";
import originServer from "@jx3box/jx3box-data/data/server/server_origin.json";
import cloneDeep from "lodash/cloneDeep";
import { showTime, showMountIcon } from "@/utils/filters";
import bus from "@/utils/bus";
export default {
    name: "ViewRaid",
    props: [],
    components: {
        "team-info": team_info,
        Raid,
        JoinPop,
        RaidFormDialog,
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
            formVisible: false,

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

            loading: true,
            loadError: false,
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
        editTeams: function () {
            return this.info ? [this.info] : [];
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
            if (!Array.isArray(this.data?.content)) return [];
            const totalMounts = this.data.content.map((member) => Number(member.mount));
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
                this.$store.commit("SET_TEAM", this.info);
            });
        },
        getAuthority: function () {
            if (!User.isLogin()) return Promise.resolve();
            return checkMyAuthority(this.team_id).then((res) => {
                this.authority = res.data.data.authority;
                this.auth_map = res.data.data;
                this.$store.commit("setManageStatus", this.auth_map.r_raid === 1 || this.auth_map.authority === 99);
                this.$store.commit("setIsTeammate", this.authority >= 2);
            });
        },
        init: async function () {
            this.loading = true;
            this.loadError = false;
            this.authority = 0;
            this.auth_map = { r_raid: 0 };
            this.$store.commit("setManageStatus", false);
            this.$store.commit("setIsTeammate", false);
            try {
                await this.getRaid();
                await Promise.allSettled([this.getTeam(), this.getAuthority()]);
                this.flag = true;
            } catch (e) {
                this.loadError = true;
            } finally {
                this.loading = false;
            }
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
                bus.emit("updateTobe", res.data.data);
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
            this.formVisible = true;
        },
        handleRaidSaved: async function () {
            this.flag = false;
            await this.getRaid();
            this.flag = true;
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
