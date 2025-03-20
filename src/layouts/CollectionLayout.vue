<template>
    <div class="m-collection-layout">
        <Header></Header>
        <Breadcrumb
            name="剑三小册"
            slug="collection"
            root="/collection"
            :publishEnable="true"
            :adminEnable="false"
            :feedbackEnable="true"
            :crumbEnable="true"
        >
            <template #op-prepend>
                <!-- <el-button
                    class="c-admin-button u-admin"
                    type="primary"
                    icon="el-icon-setting"
                    @click="onAdminClick"
                    v-if="isEditor"
                >管理</el-button> -->
                <AdminDrop v-if="isTeammate" :post="finalPost" :user-id="user_id" />
            </template>
        </Breadcrumb>
        <LeftSidebar :uid="user_id">
            <Nav :id="id" class="m-nav" />
        </LeftSidebar>
        <Main :withoutRight="!hasRight">
            <slot></slot>
            <RightSidebar>
                <Side :id="id" class="m-extend" />
            </RightSidebar>
            <Footer></Footer>
        </Main>
    </div>
</template>

<script>
import Nav from "@/components/single/single_nav.vue";
import Side from "@/components/single/single_side.vue";
import { getAppIcon, getAppID } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import AdminDrop from "@/components/collection/collection_admin_drop.vue";

export default {
    name: "CollectionLayout",
    components: {
        Nav,
        Side,
        AdminDrop,
    },
    props: {
        hasRight: {
            type: Boolean,
            default: true,
        },
        post: {
            type: Object,
            default: () => {},
        },
    },
    data: function () {
        return {
            id: getAppID(),

            showDrawer: false,
        };
    },
    computed: {
        user_id: function () {
            return this.$store.state.user_id;
        },
        isEditor: function () {
            return User.isEditor();
        },
        finalPost() {
            return {
                ...this.post,
                post_title: this.post.title,
                ID: this.post.id,
                post_type: "collection"
            };
        },
        isTeammate() {
            return User.isTeammate();
        },
    },
    methods: {
        onAdminClick() {
            this.showDrawer = true;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/list.less";

.m-collection-layout {
    .c-sidebar-left {
        padding: 15px;
    }
}
</style>
