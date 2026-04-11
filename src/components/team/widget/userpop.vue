<template>
    <el-dialog
        class="m-team-userpop"
        :title="title"
        v-model="visible"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
    >
        <div class="u-tip">
            <slot></slot>
        </div>
        <div class="u-input">
            <el-input v-model.number="uid" placeholder="请输入UID（数字）"></el-input>
        </div>
        <div class="u-preview">
            <img class="u-avatar" :src="showAvatar(userdata.user_avatar)" />
            <span class="u-name">{{ userdata.display_name || "-" }}</span>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="visible = false">取 消</el-button>
                <el-button type="primary" @click="confirm">确 定</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script>
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import { getUserInfo } from "@/service/team/server.js";
export default {
    name: "userpop",
    props: ["title", "data", "show"],
    data: function () {
        return {
            visible: false,
            uid: "",
            userdata: {
                name: "",
                avatar: "",
            },
            status: false,
        };
    },
    model: {
        prop: "show",
        event: "switchUserPop",
    },
    watch: {
        data: function (newval) {
            this.uid = newval;
        },
        uid: function (newval) {
            getUserInfo(newval).then((res) => {
                if (res.data.data) {
                    this.status = true;
                    this.userdata = res.data.data;
                } else {
                    this.status = false;
                    this.userdata = {
                        name: "",
                        avatar: "",
                    };
                }
            });
        },
        show: function (newval) {
            this.visible = newval;
        },
        visible: function (newval) {
            this.$emit("switchUserPop", newval);
        },
    },
    methods: {
        showAvatar: function (val) {
            return showAvatar(val, "l");
        },
        confirm: function () {
            if (this.status) {
                this.visible = false;
                this.$emit("confirm", this.uid);
            } else {
                this.$alert("用户不存在 或 UID不正确", "提醒", {
                    confirmButtonText: "确定",
                });
            }
        },
    },
    mounted: function () {},
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/widget/userpop.less";
</style>
