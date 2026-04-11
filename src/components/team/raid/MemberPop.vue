<template>
    <div class="u-member-pop">
        <a class="u-member-user" :href="showMemberLink(member)" target="_blank"
            ><img class="u-member-avatar" :src="showMemberAvatar(member)" /><span class="u-member-username">{{
                showMemberUsername(member)
            }}</span></a
        >
        <div class="u-member-time">
            <i class="el-icon-time"></i><span class="u-member-time-label">申请时间</span>{{ formatApplyTime(member) }}
        </div>
        <div class="u-member-desc">{{ member["remark"] }}</div>
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
            return member?.raid_member_info?.display_name || "匿名";
        },
        showMemberAvatar(member) {
            return showAvatar(member?.raid_member_info?.user_avatar);
        },
        showMemberLink(member) {
            return authorLink(member?.user_id);
        },
    },
    filters: {},
    created: function () {},
    mounted: function () {},
};
</script>

<style scoped lang="less">
.u-member-pop {
    .u-member-time {
        .fz(12px, 2);
        color: #999;
        .db;

        .u-member-time-label {
            margin: 0 3px;
            padding: 2px 5px;
            background-color: @bg-gray;
        }
    }

    .u-member-user {
        display: flex;
        align-items: center;
    }
    .u-member-avatar {
        .size(28px);
        .mr(6px);
    }
}
</style>
