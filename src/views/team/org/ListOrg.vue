<template>
    <div class="v-org-list">
        <!-- <h1 class="m-title">
            <span class="u-title">
                <img class="u-logo" :src="getAppIcon('team')" />
                <span class="u-txt">查找团队</span>
            </span>
            <div class="u-op">
                <router-link to="/org/add" class="el-button el-button--primary el-button--mini"
                    ><i class="el-icon-circle-plus-outline"></i>&nbsp; 创建团队</router-link
                >
            </div>
        </h1> -->
        <team-list @changePage="changePage" />
    </div>
</template>

<script>
import TeamList from "@/components/team/org/team_list.vue";
import { getAppIcon } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "ListOrg",
    props: [],
    components: {
        "team-list": TeamList,
    },
    data: function () {
        return {};
    },
    computed: {},
    methods: {
        goBack: function () {
            this.$router.push("/");
        },
        changePage: function () {
            window.scrollTo(0, 0);
        },
        getAppIcon,
    },
    filters: {},
    created: function () {},
    mounted: function () {},
};
</script>

<style lang="less">
.v-org-list {
    .m-title {
        .u-title {
            .flex;
            align-items: center;
        }
        .u-logo {
            .size(32px);
        }
    }
}
// @media screen and (max-width: @phone) {
//     .v-org-list {
//         .m-team-list-header {
//             border-bottom: 1px dashed @border-hr;
//             .u-title {
//                 .none;
//             }
//         }

//     }
// }
</style>
