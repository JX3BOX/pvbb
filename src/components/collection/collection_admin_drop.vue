<template>
    <div class="c-admin-drop">
        <el-dropdown trigger="click" @command="handleCommand">
            <el-button type="primary" class="c-admin-button c-admin-drop__button" :size="buttonSize"
                ><i class="el-icon-setting"></i> 管理<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="hasPermission('update_post')" command="toggleAdminPanel" icon="el-icon-setting">
                    <span>设置</span>
                </el-dropdown-item>
                <el-dropdown-item
                    v-if="hasPermission('create_system_message')"
                    command="directMessage"
                    icon="el-icon-message"
                >
                    <span>私信</span>
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-upload" command="designTask" v-if="hasPermission('push_banner')">
                    <span>推送</span>
                </el-dropdown-item>
            </el-dropdown-menu>
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
            this.$prompt("请输入私信内容", "管理私信", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                inputPlaceholder: "请输入私信内容",
                inputValidator: (value) => {
                    if (!value) {
                        return "请输入私信内容";
                    }
                },
                beforeClose: (action, instance, done) => {
                    if (action === "confirm") {
                        const data = {
                            source_id: String(this.sourceId),
                            source_type: this.sourceType,
                            user_id: this.userId,
                            content: "运营通知：" + instance.inputValue,
                            type: "system",
                            subtype: "admin_message",
                        };
                        sendMessage(data).then(() => {
                            this.$message.success("私信成功");
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
