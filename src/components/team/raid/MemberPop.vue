<template>
    <div class="u-member-pop">
        <a class="u-member-user" :href="showMemberLink(member)" target="_blank">
            <img class="u-member-avatar" :src="showMemberAvatar(member)" alt="" />
            <span class="u-member-username">{{ showMemberUsername(member) }}</span>
            <i class="el-icon-top-right u-member-link-icon"></i>
        </a>
        <div class="u-member-time">
            <span class="u-member-time-icon"><i class="el-icon-time"></i></span>
            <span class="u-member-time-copy">
                <small>{{ $t("team.raid.member.applyTime") }}</small>
                <strong>{{ formatApplyTime(member) }}</strong>
            </span>
        </div>
        <div class="u-member-desc" v-if="member['remark']">{{ member["remark"] }}</div>
    </div>
</template>

<script>
import { showAvatar, authorLink } from "@jx3box/jx3box-common/js/utils";
import { showTime } from "@/utils/filters";
export default {
    name: "MemberPop",
    props: ["member"],
    components: {},
    data: function () {
        return {};
    },
    computed: {},
    watch: {},
    methods: {
        formatApplyTime(member) {
            return showTime(member?.created_at);
        },
        showMemberUsername(member) {
            return member?.raid_member_info?.display_name || this.$t("team.raid.member.anonymous");
        },
        showMemberAvatar(member) {
            return showAvatar(member?.raid_member_info?.user_avatar);
        },
        showMemberLink(member) {
            return authorLink(member?.user_id);
        },
    },
    created: function () {},
    mounted: function () {},
};
</script>

<style scoped lang="less">
@import (reference) "@/assets/css/team/design-system/_tokens.less";

.u-member-pop {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .u-member-user {
        display: flex;
        min-width: 0;
        align-items: center;
        color: @team-text-primary;
        gap: 10px;

        &:hover {
            color: @team-primary;
        }
    }

    .u-member-avatar {
        display: block;
        width: 38px;
        height: 38px;
        flex: none;
        border: 1px solid @team-border-light;
        border-radius: 12px;
        object-fit: cover;
    }

    .u-member-username {
        min-width: 0;
        overflow: hidden;
        flex: 1;
        font-size: 14px;
        font-weight: 700;
        line-height: 20px;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .u-member-link-icon {
        flex: none;
        color: @team-text-muted;
        font-size: 12px;
    }

    .u-member-time {
        display: flex;
        min-width: 0;
        align-items: center;
        padding: 9px 10px;
        border-radius: 10px;
        background: @team-surface-muted;
        gap: 9px;
    }

    .u-member-time-icon {
        display: inline-flex;
        width: 30px;
        height: 30px;
        align-items: center;
        justify-content: center;
        flex: none;
        border-radius: 9px;
        background: @team-primary-soft;
        color: @team-primary;
    }

    .u-member-time-copy {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 1px;

        small {
            color: @team-text-muted;
            font-size: 11px;
            line-height: 16px;
        }

        strong {
            overflow: hidden;
            color: @team-text-regular;
            font-size: 12px;
            font-weight: 600;
            line-height: 18px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .u-member-desc {
        padding: 8px 10px;
        border-left: 3px solid @team-primary;
        border-radius: 0 8px 8px 0;
        background: @team-primary-soft;
        color: @team-text-regular;
        font-size: 12px;
        line-height: 18px;
        word-break: break-word;
    }
}
</style>
