<template>
    <div class="m-team-banner">
        <el-divider content-position="left"> <i class="el-icon-picture-outline"></i> 团队海报 </el-divider>
        <uploadImage
            v-model="banner"
            info="团队海报推荐尺寸为1125*630，用于微信小程序团队主页与活动等作为主题展示。"
        ></uploadImage>
        <el-button class="u-submit-btn" type="primary" size="small" icon="Upload" @click="submitBanner"
            >提交海报</el-button
        >
    </div>
</template>

<script>
import uploadImage from "@jx3box/jx3box-ui/src/upload/UploadBanner.vue";
import { updateTeamInfo } from "@/service/team/team.js";
export default {
    name: "team_banner",
    components: {
        uploadImage,
    },
    props: {
        teamInfo: {
            type: Object,
            default: () => {
                return {};
            },
        },
    },
    data() {
        return {
            banner: this.data,
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
    },
    watch: {
        teamInfo: {
            deep: true,
            immediate: true,
            handler: function (newval) {
                this.banner = newval.banner;
            },
        },
    },
    methods: {
        submitBanner: function () {
            updateTeamInfo(this.id, {
                banner: this.banner,
            }).then(() => {
                this.$message.success("海报上传成功");
            });
        },
    },
};
</script>

<style lang="less">
.m-team-banner {
    .u-submit-btn {
        margin-top: 10px;
    }
}
</style>
