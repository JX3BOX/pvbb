<template>
    <div class="l-community-layout">
        <CommonHeader></CommonHeader>
        <Breadcrumb
            name="竹林茶馆"
            slug="community"
            :publishEnable="false"
            :topicEnable="false"
            :adminEnable="false"
            :feedbackEnable="true"
            :crumbEnable="true"
        >
            <Info />
            <template #op-append>
                <publish-gate />
            </template>
        </Breadcrumb>
        <LeftSidebar>
            <Nav />
        </LeftSidebar>
        <Main :withoutRight="false">
            <div class="m-main">
                <slot></slot>
            </div>
            <RightSidebar class="m-bbs-right-side" :show-toggle="true">
                <ListSide class="m-extend" />
            </RightSidebar>
            <CommonFooter></CommonFooter>
        </Main>
    </div>
</template>

<script>
import Info from "@/components/Info.vue";
import Nav from "@/components/nav/Nav.vue";
import ListSide from "@/components/bbs/list_side.vue";
import publishGate from "@/components/common/PublishGate.vue";
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
        ListSide,
    },
};
</script>

<style lang="less">
.l-community-layout {
    .c-header {
        z-index: 9999;
    }
    background: #fafbfc;
    .m-main {
        padding: 0;
    }
    .c-main {
        padding: 0;
    }
}
.m-bbs-right-side {
    .c-sidebar-right-inner {
        background: #fff;
    }
}
</style>
