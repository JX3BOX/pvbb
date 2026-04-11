<template>
    <div id="app">
        <CommonHeader></CommonHeader>
        <Breadcrumb
            name="团队平台"
            slug="team"
            root="/team"
            :publishEnable="false"
            :adminEnable="false"
            :feedbackEnable="true"
            :crumbEnable="true"
        >
            <img slot="logo" svg-inline :src="logo" />
        </Breadcrumb>
        <LeftSidebar>
            <Nav />
        </LeftSidebar>
        <Main :withoutRight="true">
            <div class="m-main" :style="{ minHeight: keepHeight }">
                <div v-if="isPublic || isLogin">
                    <slot></slot>
                </div>
                <el-alert v-else title="请先登录" type="warning" description="使用本功能请先登录" show-icon> </el-alert>
            </div>
            <Footer></Footer>
        </Main>
    </div>
</template>

<script>
import Nav from "@/components/Nav.vue";
import User from "@jx3box/jx3box-common/js/user";
import { __cdn } from "@/utils/config";
import CommonHeader from "../macro/common-header.vue";
import CommonFooter from "@jx3box/jx3box-ui/src/CommonFooter.vue";
export default {
    name: "wrapper",
    props: ["isPublic"],
    data: function () {
        return {
            isLogin: User.isLogin(),
            keepHeight: window.innerHeight - 220 + "px",
            logo: __cdn + "logo/logo-light/team.svg",
        };
    },
    methods: {},
    mounted: function () {},
    components: {
        Nav,
    },
};
</script>
