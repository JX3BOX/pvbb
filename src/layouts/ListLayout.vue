<template>
    <div id="app">
        <Header></Header>
        <Breadcrumb
            name="竹林茶馆"
            slug="bbs"
            :publishEnable="false"
            :topicEnable="false"
            :adminEnable="false"
            :feedbackEnable="true"
            :crumbEnable="true"
        >
        <template #logo>
                <img svg-inline :src="logo" />
            </template>
            <Info />
            <publish-gate slot="op-append" />
        </Breadcrumb>
        <LeftSidebar>
            <Nav />
        </LeftSidebar>
        <Main :withoutRight="false">
            <div class="m-main">
                <slot></slot>
            </div>
            <RightSidebar class="m-bbs-right-side" :show-toggle="true">
                <Side class="m-extend" />
            </RightSidebar>
            <Footer></Footer>
        </Main>
    </div>
</template>

<script>
import Info from "@/components/Info.vue";
import Nav from "@/components/nav/Nav.vue";
import Side from "@/components/bbs/list_side.vue";
import publishGate from "@/components/publish_gate.vue";
import { getAppIcon } from "@jx3box/jx3box-common/js/utils";
import { __cdn } from "@/utils/config";
export default {
    name: "ListLayout",
    props: [],
    data: function () {
        return {
            logo: __cdn + "logo/logo-light/community.svg",
        };
    },
    computed: {
        slug: function () {
            return this.$route.name;
        },
    },
    methods: {
        getAppIcon,
    },
    components: {
        Nav,
        "publish-gate": publishGate,
        Info,
        Side,
    },
    // created: function () {
    //     const regex = /\/bbs\/?#\/?(\w+?)\/(\d+)/
    //     location.pathname.match(regex) && (location.href = location.pathname.replace(regex, '/$1/$2'))
    // },
};
</script>

<style lang="less">
.m-bbs-right-side {
    //&.c-sidebar-right.is-close {
    //transform: translateX(0) !important;
    //}
    .c-sidebar-right-inner {
        background: #fff;
    }
}
</style>
