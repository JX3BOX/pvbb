<template>
    <div class="v-org-view p-team-public" v-if="id" v-loading="loading">
        <section v-if="loadError" class="m-public-org__error" aria-labelledby="public-team-error-title">
            <span class="u-public-team-error-icon" aria-hidden="true">
                <el-icon><WarningFilled /></el-icon>
            </span>
            <h1 id="public-team-error-title">团队信息加载失败</h1>
            <p>该团队可能已被移除，或当前网络暂时不可用。</p>
            <el-button type="primary" @click="loadData">
                <el-icon><Refresh /></el-icon>
                <span>重新加载</span>
            </el-button>
        </section>

        <template v-else>
            <section
                class="m-public-org__hero"
                :class="{ 'has-banner': publicBanner }"
                :style="publicBanner ? { '--team-banner-image': `url('${publicBanner}')` } : null"
                aria-label="团队信息"
            >
                <team-info
                    v-if="done"
                    :key="`public-team-info-${id}`"
                    :info="data"
                    :team_id="id"
                    :show-manage-action="false"
                    :always-show-join-action="true"
                />
            </section>

            <section class="m-public-org__workspace" aria-label="团队公开内容">
                <el-tabs :key="`public-team-tabs-${id}`" v-model="tab" class="m-team-view m-public-org__tabs">
                    <el-tab-pane label="团队概况" name="overview">
                        <template #label>
                            <el-icon><DataBoard /></el-icon>
                            <span>团队概况</span>
                        </template>
                        <div class="m-public-org__overview">
                            <team-intro :intro="data" />
                            <team-recruit :recruit="data.recruit" :tags="data.tags" />
                            <team-medals :medals="data.medals" />
                            <team-trophy :id="id" />
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="团队成员" name="member" lazy>
                        <template #label>
                            <el-icon><User /></el-icon>
                            <span>团队成员</span>
                        </template>
                        <div class="m-public-org__pane">
                            <ViewMember
                                v-if="done"
                                :v="data.v_member"
                                :super="data.super"
                                :authority="authority"
                            />
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="团队活动" name="raid" lazy>
                        <template #label>
                            <el-icon><Calendar /></el-icon>
                            <span>团队活动</span>
                        </template>
                        <div class="m-public-org__pane">
                            <TeamRaid
                                v-if="done"
                                :v="data.v_activity"
                                :super="data.super"
                                :authority="authority"
                                :is-home-page="true"
                            />
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="通关视频" name="video" lazy>
                        <template #label>
                            <el-icon><VideoPlay /></el-icon>
                            <span>通关视频</span>
                        </template>
                        <div class="m-public-org__pane">
                            <ViewVideo v-if="done" />
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="留言板" name="comment" lazy class="m-team-notes">
                        <template #label>
                            <el-icon><ChatLineSquare /></el-icon>
                            <span>留言板</span>
                        </template>
                        <div class="m-public-org__pane">
                            <ViewComment
                                v-if="done"
                                :v="data.v_comment"
                                :super="data.super"
                                :authority="authority"
                            />
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </section>
        </template>
    </div>
</template>

<script>
import team_info from "@/components/team/org/team_info.vue";
import team_intro from "@/components/team/org/team_intro.vue";
import team_medals from "@/components/team/org/team_medals.vue";
import team_trophy from "@/components/team/org/team_trophy.vue";
import team_recruit from "@/components/team/org/team_recruit.vue";

import ViewMember from "@/views/team/member/ViewMember.vue";
import ViewComment from "@/views/team/org/ViewComment.vue";
import ViewVideo from "@/views/team/org/ViewVideo.vue";
import TeamRaid from "@/views/team/raid/TeamRaid.vue";

import User from "@jx3box/jx3box-common/js/user.js";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import { resolveImagePath } from "@jx3box/jx3box-common/js/utils";
import { getTeam } from "@/service/team/team.js";
import { checkMyAuthority } from "@/service/team/member.js";
import { Calendar, ChatLineSquare, DataBoard, Refresh, User as UserIcon, VideoPlay, WarningFilled } from "@element-plus/icons-vue";

const PUBLIC_TABS = ["overview", "member", "raid", "video", "comment"];

function createDefaultTeam() {
    return {
        status: 0,
        name: "团队名称",
        server: "服务器名称",
        logo: "",
        desc: "团队介绍",
        uid: 0,
        recruit: "",
        honors: [],
        medals: [],
        tags: ["可教学", "固定团"],
        v_member: 0,
        v_activity: 0,
        v_dkp: 0,
        v_comment: 0,
        banner: "",
    };
}

function createDefaultAuthority() {
    return {
        authority: 0,
        r_dkp: 0,
        r_member: 0,
        r_audit: 0,
        r_plan: 0,
        r_snapshot: 0,
        r_drop: 0,
        r_raid: 0,
    };
}

export default {
    name: "ViewOrg",
    props: [],
    data: function () {
        return {
            tab: "overview",
            data: createDefaultTeam(),
            loading: false,
            loadError: false,
            loadVersion: 0,
            authority: createDefaultAuthority(),
            done: false,
            syncingTab: false,
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        query: function () {
            return this.$route.query.tab;
        },
        publicBanner: function () {
            return this.data.banner ? resolveImagePath(this.data.banner) : "";
        },
    },
    methods: {
        normalizeTab: function (tab) {
            return PUBLIC_TABS.includes(tab) ? tab : "overview";
        },
        syncTabFromRoute: function (value) {
            const nextTab = this.normalizeTab(value);
            this.syncingTab = true;
            this.tab = nextTab;
            this.$nextTick(() => {
                this.syncingTab = false;
            });

            if (value && value !== nextTab) this.updateTabRoute(nextTab, true);
        },
        updateTabRoute: function (tab, replace = false) {
            const nextTab = this.normalizeTab(tab);
            const currentTab = this.$route.query.tab || "overview";
            if (currentTab === nextTab && (nextTab !== "overview" || !("tab" in this.$route.query))) return;

            const query = { ...this.$route.query };
            if (nextTab === "overview") delete query.tab;
            else query.tab = nextTab;

            const method = replace ? "replace" : "push";
            this.$router[method]({
                name: "view_org",
                params: { id: this.id },
                query,
            }).catch(() => {});
        },
        loadTeamInfo: function (id) {
            return getTeam(id).then((res) => res.data.data);
        },
        loadAuthority: function (id) {
            if (!User.isLogin()) return Promise.resolve(createDefaultAuthority());
            return checkMyAuthority(id)
                .then((res) => res.data.data || createDefaultAuthority())
                .catch(() => createDefaultAuthority());
        },
        loadData: function () {
            const id = this.id;
            if (!id) return;

            const version = ++this.loadVersion;
            this.loading = true;
            this.loadError = false;
            this.done = false;
            this.data = createDefaultTeam();
            this.authority = createDefaultAuthority();

            Promise.all([this.loadTeamInfo(id), this.loadAuthority(id)])
                .then(([team, authority]) => {
                    if (version !== this.loadVersion || id !== this.id) return;

                    this.data = team;
                    this.authority = authority;
                    this.done = true;
                    document.title = this.data.name + this.$t("pages.common.appendTitle");
                    postStat("team", id).catch(() => {});
                })
                .catch(() => {
                    if (version === this.loadVersion && id === this.id) this.loadError = true;
                })
                .finally(() => {
                    if (version === this.loadVersion && id === this.id) this.loading = false;
                });
        },
    },
    watch: {
        id: {
            immediate: true,
            handler: function (val) {
                val && this.loadData();
            },
        },
        query: {
            immediate: true,
            handler: function (val) {
                this.syncTabFromRoute(val);
            },
        },
        tab: function (val) {
            if (!this.syncingTab) this.updateTabRoute(val);
        },
    },
    components: {
        "team-info": team_info,
        "team-intro": team_intro,
        "team-medals": team_medals,
        "team-trophy": team_trophy,
        "team-recruit": team_recruit,
        Calendar,
        ChatLineSquare,
        DataBoard,
        Refresh,
        User: UserIcon,
        ViewMember,
        TeamRaid,
        ViewComment,
        ViewVideo,
        VideoPlay,
        WarningFilled,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/view_org.less";
</style>
