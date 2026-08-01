<template>
    <el-dialog
        class="m-team-userpop"
        :class="{ 'is-archive': isArchive }"
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
        <div class="u-preview" :class="{ 'is-ready': status }">
            <img class="u-avatar" :src="showAvatar(userdata.user_avatar)" />
            <div class="u-preview-info" v-if="isArchive">
                <span class="u-name">{{ userdata.display_name || "等待识别用户" }}</span>
                <span class="u-user-id">{{ status ? `UID ${uid}` : "输入 UID 后自动查找" }}</span>
            </div>
            <span class="u-name" v-else>{{ userdata.display_name || "-" }}</span>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="visible = false">{{ isArchive ? "取消" : "取 消" }}</el-button>
                <el-button type="primary" @click="confirm">{{ confirmText || (isArchive ? "确认添加" : "确 定") }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script>
import { showAvatar } from "@jx3box/jx3box-common/js/utils";
import { getUserInfo } from "@/service/team/server.js";
import debounce from "lodash/debounce";
export default {
    name: "userpop",
    props: ["title", "data", "show", "modelValue", "variant", "confirmText"],
    emits: ["update:modelValue", "switchUserPop", "confirm"],
    data: function () {
        return {
            visible: false,
            uid: "",
            userdata: {
                display_name: "",
                user_avatar: "",
            },
            status: false,
            lookupVersion: 0,
            lookupUserDebounced: null,
        };
    },
    watch: {
        data: function (newval) {
            this.uid = newval;
        },
        uid: function (newval) {
            this.cancelUserLookup();
            this.resetUser();

            const uid = String(newval ?? "").trim();
            if (!/^\d+$/.test(uid)) return;

            const version = this.lookupVersion;
            this.lookupUserDebounced(uid, version);
        },
        show: function (newval) {
            this.visible = newval;
        },
        modelValue: function (newval) {
            this.visible = newval;
        },
        visible: function (newval) {
            if (!newval) this.cancelUserLookup();
            this.$emit("update:modelValue", newval);
            this.$emit("switchUserPop", newval);
        },
    },
    computed: {
        isArchive: function () {
            return this.variant === "archive";
        },
    },
    methods: {
        resetUser: function () {
            this.status = false;
            this.userdata = {
                display_name: "",
                user_avatar: "",
            };
        },
        cancelUserLookup: function () {
            this.lookupVersion += 1;
            this.lookupUserDebounced?.cancel();
        },
        lookupUser: function (uid, version) {
            getUserInfo(uid)
                .then((res) => {
                    if (version !== this.lookupVersion) return;

                    if (res.data.data) {
                        this.status = true;
                        this.userdata = res.data.data;
                    } else {
                        this.resetUser();
                    }
                })
                .catch(() => {
                    if (version === this.lookupVersion) this.resetUser();
                });
        },
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
    created: function () {
        this.lookupUserDebounced = debounce(this.lookupUser, 500);
    },
    beforeUnmount: function () {
        this.cancelUserLookup();
    },
    components: {},
};
</script>

<style lang="less">
@import "@/assets/css/team/widget/userpop.less";
</style>
