<template>
    <div class="m-team-medals">
        <el-divider content-position="left"> <i class="el-icon-medal"></i> 团队勋章 </el-divider>
        <div class="u-list" v-if="data && data.length">
            <Medal :medals="data" :showIcon="showTeamMedal"></Medal>
        </div>
        <div class="u-null" v-else><i class="el-icon-warning-outline"></i> 还没有相关记录</div>
    </div>
</template>

<script>
import { __cdn } from "@/utils/config";
import medal_map from "@jx3box/jx3box-common/data/medals.json";
import Medal from "@/components/team/medal.vue";
export default {
    name: "team_medal",
    props: ["medals"],
    data: function () {
        return {
            medal_map: medal_map["team"],
        };
    },
    computed: {
        data: function () {
            return (
                (this.medals &&
                    this.medals.map((item) => {
                        return {
                            ...item,
                            medal_desc: item.name,
                            medal: item.icon,
                        };
                    })) ||
                []
            );
        },
    },
    methods: {
        showTeamMedal: function (val) {
            return __cdn + "design/medals/team/" + val + "-200.png";
        },
    },
    components: {
        Medal,
    },
};
</script>

<style lang="less">
@import "@/assets/css/team/org/team_medals.less";
</style>
