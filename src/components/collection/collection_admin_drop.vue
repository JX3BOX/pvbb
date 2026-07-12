<template>
    <div class="c-admin-drop">
        <el-dropdown trigger="click" @command="handleCommand">
            <el-button type="primary" class="c-admin-button c-admin-drop__button" :size="buttonSize"
                ><i class="el-icon-setting"></i> {{ $t("pages.collection.admin.manage") }}<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item v-if="hasPermission('update_post')" command="toggleAdminPanel" icon="Setting">
                        <span>{{ $t("pages.collection.admin.settings") }}</span>
                    </el-dropdown-item>
                    <el-dropdown-item
                        v-if="hasPermission('create_system_message')"
                        command="directMessage"
                        icon="Message"
                    >
                        <span>{{ $t("pages.collection.admin.message") }}</span>
                    </el-dropdown-item>
                    <el-dropdown-item icon="Upload" command="designTask" v-if="hasPermission('push_banner')">
                        <span>{{ $t("pages.collection.admin.push") }}</span>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>

        <design-task v-model="showDesignTask" :post="post"></design-task>
        <CollectionAdmin v-model="showDrawer" />
    </div>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import { sendMessage } from "@/service/collection";
import { editLink } from "@jx3box/jx3box-common/js/utils";
import CollectionAdmin from "@/components/collection/collection_admin.vue";
import DesignTask from "@/components/collection/collection_design_task.vue";
export default {
    name: "AdminDrop",
    components: {
        CollectionAdmin,
        DesignTask,
    },
    props: {
        buttonSize: {
            type: String,
            default: "medium",
        },
        post: {
            type: Object,
            default: () => {},
        },
        userId: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            showDesignTask: false,
            showDrawer: false,
        };
    },
    computed: {
        isEditor() {
            return User.isEditor();
        },
        sourceId() {
            if (this.isCommunity) {
                return this.post?.id;
            } else {
                return this.post?.ID;
            }
        },
        sourceType() {
            if (this.isCommunity) {
                return "community";
            } else {
                return this.post?.post_type;
            }
        },
    },
    methods: {
        handleCommand(command) {
            this[command]();
        },
        toggleAdminPanel() {
            this.showDrawer = true;
        },
        directMessage() {
            this.$prompt(this.$t("pages.collection.admin.messagePlaceholder"), this.$t("pages.collection.admin.messageTitle"), {
                confirmButtonText: this.$t("pages.common.confirm"),
                cancelButtonText: this.$t("pages.common.cancel"),
                inputPlaceholder: this.$t("pages.collection.admin.messagePlaceholder"),
                inputValidator: (value) => {
                    if (!value) {
                        return this.$t("pages.collection.admin.messagePlaceholder");
                    }
                },
                beforeClose: (action, instance, done) => {
                    if (action === "confirm") {
                        const data = {
                            source_id: String(this.sourceId),
                            source_type: this.sourceType,
                            user_id: this.userId,
                            content: this.$t("pages.collection.admin.notificationPrefix") + instance.inputValue,
                            type: "system",
                            subtype: "admin_message",
                        };
                        sendMessage(data).then(() => {
                            this.$message.success(this.$t("pages.collection.admin.messageSent"));
                            done();
                        });
                    } else {
                        done();
                    }
                },
            }).catch(() => {});
        },
        designTask() {
            this.showDesignTask = true;
        },
        hasPermission(permission) {
            return User.hasPermission(permission);
        },
    },
};
</script>

<style lang="less">
.c-admin-drop {
    float: right;
    margin-top: -2px;
    margin-right: 10px;
}
.c-admin-drop__button {
    padding: 8px 18px !important;
}
</style>
