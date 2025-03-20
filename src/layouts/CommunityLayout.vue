<template>
    <div id="app" class="m-community-layout">
        <Header></Header>
        <Breadcrumb
            name="魔盒论坛"
            slug="community"
            :publishEnable="false"
            :topicEnable="false"
            :adminEnable="false"
            :feedbackEnable="true"
            :crumbEnable="true"
        >
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
export default {
    name: "CommunityLayout",
    props: [],
    data: function () {
        return {};
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
};
</script>

<style lang="less">
.m-community-layout {
    .c-header {
        z-index: 9999;
    }
    background: #fafbfc;
    .m-main {
        padding: 0;
    }
}
.m-bbs-right-side {
    .c-sidebar-right-inner {
        background: #fff;
    }
}
</style>
