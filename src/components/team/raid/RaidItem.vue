<template>
    <article class="m-raid-item">
        <div class="m-raid-item-header">
            <div class="u-main">
                <div class="u-title-row">
                    <button
                        type="button"
                        class="u-sticky-button"
                        :class="{ 'is-sticky': data.sticky }"
                        :title="$t(data.sticky ? 'team.raid.item.unpin' : 'team.raid.item.pin')"
                        @click.stop="setSticky"
                    >
                        <el-icon class="u-sticky-icon"><Download /></el-icon>
                    </button>
                    <router-link
                        class="u-title"
                        :to="{ name: 'view_raid', params: { id: data.id } }"
                        target="_blank"
                    >
                        <span class="u-name">{{ data.title || $t("team.raid.item.noTitle") }}</span>
                        <span v-if="data.is_public" class="u-public"><i class="el-icon-position"></i> {{ $t("team.raid.item.lobby") }}</span>
                    </router-link>
                </div>
                <div class="u-activity-row">
                    <el-tag class="u-activity-tag" size="small" effect="plain" round>{{ data.name }}</el-tag>
                </div>
                <div class="u-meta">
                    <time><i class="el-icon-date"></i>{{ showTime(data.start_time) }} · {{ showRaidWeek(data.start_time) }}</time>
                    <span><i :class="data.auth ? 'el-icon-lock' : 'el-icon-unlock'"></i>{{ showAuth(data.auth) }}</span>
                    <span><i class="el-icon-user"></i>{{ getUserName(data.raid_creator_info) }}</span>
                    <span v-if="data.count_total"><i class="el-icon-s-custom"></i>{{ $t("team.raid.common.people", { count: `${data.count_normal || 0}/${data.count_total}` }) }}</span>
                </div>
            </div>
            <div class="u-op">
                <el-button class="u-view" size="small" plain icon="View" @click="viewRaidDetail">{{ $t("team.raid.item.view") }}</el-button>
                <el-dropdown trigger="click" @command="handleCommand">
                    <el-button class="u-more" size="small" plain icon="MoreFilled">{{ $t("team.raid.item.more") }}</el-button>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="edit">
                                <i class="el-icon-edit"></i>
                                {{ $t("team.raid.item.edit") }}
                            </el-dropdown-item>
                            <el-dropdown-item command="delete" divided>
                                <i class="el-icon-delete"></i>
                                {{ $t("team.raid.item.delete") }}
                            </el-dropdown-item>
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
import { showTime } from "@/utils/filters";
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
            if (command === "edit") this.edit(this.data.id);
            if (command === "delete") this.del(this.data);
        },
        del: function (data) {
            this.$alert(this.$t("team.raid.item.deleteConfirm"), this.$t("team.raid.item.message"), {
                confirmButtonText: this.$t("team.raid.common.confirm"),
                callback: (action) => {
                    if (action == "confirm") {
                        deleteRaid(data.team_id, data.id).then((res) => {
                            this.$message({
                                type: "success",
                                message: this.$t("team.raid.common.deleted"),
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
            return user?.display_name || this.$t("team.raid.common.unknown");
        },
        // 置顶
        setSticky() {
            const data = {
                sticky: this.data.sticky ? 0 : 1,
            };
            setRaidSticky(this.data.id, data).then((res) => {
                this.$message({
                    type: "success",
                    message: this.$t(data.sticky ? "team.raid.item.pinSuccess" : "team.raid.item.unpinSuccess"),
                });
                this.$emit("sticky");
            });
        },
        showAuth: function (val) {
            return this.$t(`team.raid.auth.${val}`);
        },
        showRaidWeek: function (d) {
            return new Intl.DateTimeFormat(this.$i18n?.locale || "zh-CN", {
                weekday: "long",
            }).format(new Date(d));
        },
        showTime,
    },
};
</script>
