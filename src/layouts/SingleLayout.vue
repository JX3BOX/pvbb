<template>
    <div id="app" class="p-bbs p-bbs-single">
        <Header></Header>
        <Breadcrumb
            name="竹林茶馆"
            slug="bbs"
            :publishEnable="false"
            :adminEnable="true"
            :feedbackEnable="true"
            :crumbEnable="true"
            :showExtend="true"
            :subtypeMap="subtypeMap"
        >
            <template #logo>
                <img svg-inline :src="logo" />
            </template>
            <publish-gate slot="op-append" />
            <template #op-prepend>
                <!-- <AdminDirectMessage
                    :user-id="user_id"
                    :sourceId="String(post.ID)"
                    :sourceType="post.post_type"
                ></AdminDirectMessage> -->
                <AdminDrop v-if="isTeammate" :post="post" :user-id="user_id" show-move />
            </template>
            <template #title>
                <span>
                    {{ title }}
                </span>
            </template>
        </Breadcrumb>
        <LeftSidebar :uid="user_id">
            <Nav :id="id" />
        </LeftSidebar>
        <Main :withoutRight="false">
            <slot></slot>
            <RightSidebar :show-toggle="true">
                <Side :id="id" class="m-extend" />
            </RightSidebar>
            <Footer></Footer>
        </Main>
    </div>
</template>

<script>
import Nav from "@/components/nav/single_nav.vue";
import Side from "@/components/bbs/single_side.vue";
import publishGate from "@/components/publish_gate.vue";
import { getAppIcon, getAppID } from "@jx3box/jx3box-common/js/utils";
import AdminDrop from "@jx3box/jx3box-common-ui/src/bread/AdminDrop.vue";
import User from "@jx3box/jx3box-common/js/user";
import { __cdn } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
    name: "SingleLayout",
    props: [],
    data: function () {
        return {
            id: getAppID(),
            logo: __cdn + "logo/logo-light/community.svg",

            subtypeMap: {
                1: "攻略心得",
                2: "萌新指南",
                3: "江湖故事",
                4: "煮酒论剑",
            },
        };
    },
    computed: {
        user_id: function () {
            return this.$store.state.user_id;
        },
        post: function () {
            return this.$store.state.post;
        },
        title() {
            return this.post.post_title || document.title;
        },
        isTeammate() {
            return User.isTeammate();
        },
    },
    methods: { getAppIcon },
    components: {
        Nav,
        Side,
        "publish-gate": publishGate,
        // AdminDirectMessage,
        AdminDrop,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
.p-bbs-single {
    // .c-admin-drop {
    //     margin-right: 0;
    // }
}
</style>
