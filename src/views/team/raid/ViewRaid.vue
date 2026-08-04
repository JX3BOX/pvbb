<template>
    <div class="v-raid-view" v-loading="loading">
        <div ref="teamImage" class="m-raid-view-page" :class="{ 'm-teamImage': hideBtn }" :style="boxsize">
            <header class="m-raid-view-hero">
                <div class="u-heading">
                    <span class="u-eyebrow">
                        <i class="el-icon-data-board"></i>
                        {{ data.name || $t("team.raid.view.eyebrow") }}
                    </span>
                    <h1>{{ data.title || data.name || $t("team.raid.view.detail") }}</h1>
                    <p>
                        <span>{{ data.team_name || $t("team.raid.view.teamActivity") }}</span>
                        <template v-if="info.server">
                            <i></i>
                            <span>{{ info.server }}</span>
                        </template>
                        <i></i>
                        <span>{{ showTime(data.start_time) || $t("team.raid.view.timePending") }}</span>
                    </p>
                </div>
                <div class="u-op">
                    <el-button
                        class="u-edit"
                        size="small"
                        type="warning"
                        icon="Edit"
                        @click="editRaid"
                        v-if="canManage"
                        :disabled="isOldVersion"
                        >{{ $t("team.raid.common.edit") }}</el-button
                    >
                    <el-button
                        v-if="flag && !isOldVersion"
                        type="primary"
                        icon="Right"
                        @click="handleShowDialog"
                        :disabled="!canJoin"
                    >
                        {{ $t("team.raid.view.reserve") }}
                    </el-button>
                </div>
            </header>

            <el-alert
                v-if="loadError"
                class="m-raid-view-error"
                :title="$t('team.raid.view.loadFailed')"
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
                            <div>
                                <h2>{{ $t("team.raid.view.info") }}</h2>
                                <p>{{ $t("team.raid.view.infoHint") }}</p>
                            </div>
                        </div>
                    </div>

                    <el-alert
                        v-if="isOldVersion"
                        :title="$t('team.raid.view.legacy')"
                        type="warning"
                        show-icon
                        :closable="false"
                    />

                    <div class="m-raid-view-meta">
                        <div class="u-meta-item">
                            <span class="u-icon"><i class="el-icon-date"></i></span>
                            <div>
                                <em>{{ $t("team.raid.view.startTime") }}</em>
                                <strong>{{ showTime(data.start_time) || $t("team.raid.common.pending") }}</strong>
                            </div>
                        </div>
                        <div class="u-meta-item">
                            <span class="u-icon"><i class="el-icon-microphone"></i></span>
                            <div>
                                <em>{{ $t("team.raid.view.leader") }}</em>
                                <strong>{{ data.leader || $t("team.raid.view.leaderPending") }}</strong>
                            </div>
                        </div>
                        <div class="u-meta-item">
                            <span class="u-icon"><i :class="canJoin ? 'el-icon-unlock' : 'el-icon-lock'"></i></span>
                            <div>
                                <em>{{ $t("team.raid.form.condition") }}</em>
                                <strong>{{ showAuth(data.auth) }}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="m-raid-view-info">
                        <span class="u-label">{{ $t("team.raid.view.description") }}</span>
                        <p>{{ data.desc || $t("team.raid.view.noDescription") }}</p>
                    </div>

                    <div class="m-raid-lackmount" v-if="lackMounts.length">
                        <h3><i class="el-icon-circle-check"></i> {{ $t("team.raid.view.noConflict") }}</h3>
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
                                <h3>{{ $t(canJoin ? "team.raid.view.joinOpen" : "team.raid.view.joinClosed") }}</h3>
                                <p>{{ showAuth(data.auth) }}</p>
                            </div>
                        </div>
                        <div class="u-actions">
                            <el-button type="primary" icon="Right" @click="handleShowDialog" :disabled="!canJoin">
                                {{ $t("team.raid.view.reserve") }}
                            </el-button>
                        </div>
                    </div>

                    <section class="m-raid-view-section m-raid-view-board">
                        <div class="m-raid-section-heading">
                            <div>
                                <span class="u-section-icon"><i class="el-icon-user"></i></span>
                                <div>
                                    <h2>{{ $t("team.raid.view.board") }}</h2>
                                    <p>{{ $t("team.raid.view.boardHint") }}</p>
                                </div>
                            </div>
                        </div>
                        <Raid
                            :count="data.count"
                            :team-id="team_id"
                            :leader="data.leader"
                            :content="data.content"
                            :row="displayRow"
                            :col="displayCol"
                            :is-public="data.is_public"
                            :isForceMatch="data.force_match"
                            @updateMembers="handleUpdate"
                        />
                    </section>

                    <join-pop
                        :title="$t('team.raid.view.reserve')"
                        v-model="joinShow"
                        :auth="data.auth"
                        :client="client"
                        @confirm="handleConfrim"
                    />
                </template>
            </template>

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
import { getTeam } from "@/service/team/team.js";
import User from "@jx3box/jx3box-common/js/user";
import { getRaid, updateRaid, removeRaid, addTobeMember } from "@/service/team/raid.js";
import { checkMyAuthority } from "@/service/team/member.js";
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

            authority: 0,
            auth_map: {
                r_raid: 0,
            },
            joinShow: false,
            formVisible: false,

            formData: {},
            flag: false,

            visible: false,

            imgUrl: "",
            showImage: false,
            hideBtn: false,
            boxsize: {},

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
        displayRow: function () {
            return Number(this.data?.count) === 10 ? 5 : this.data?.row;
        },
        displayCol: function () {
            return Number(this.data?.count) === 10 ? 5 : this.data?.col;
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
                            message: this.$t("team.raid.view.updateSuccess"),
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
                    message: this.$t("team.raid.view.applySuccess"),
                    type: "success",
                });
                this.joinShow = false;
                bus.emit("updateTobe", res.data.data);
            });
        },

        // 其它
        // ===========================
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
                    message: this.$t("team.raid.common.deleted"),
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

        showAuth: function (val) {
            return this.$t(`team.raid.auth.${val}`);
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
</style>
