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
            <el-input v-model.number="uid" :placeholder="$t('team.raid.misc.uidPlaceholder')"></el-input>
        </div>
        <div class="u-preview" :class="{ 'is-ready': status }">
            <img class="u-avatar" :src="showAvatar(userdata.user_avatar)" />
            <div class="u-preview-info" v-if="isArchive">
                <span class="u-name">{{ userdata.display_name || $t("team.raid.misc.waitingUser") }}</span>
                <span class="u-user-id">{{ status ? `UID ${uid}` : $t("team.raid.misc.uidHint") }}</span>
            </div>
            <span class="u-name" v-else>{{ userdata.display_name || "-" }}</span>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="visible = false">{{ $t("team.raid.common.cancel") }}</el-button>
                <el-button type="primary" @click="confirm">{{ confirmText || (isArchive ? $t("team.raid.misc.addUser") : $t("team.raid.common.confirm")) }}</el-button>
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
                this.$alert(this.$t("team.raid.misc.userNotFound"), this.$t("team.raid.misc.reminder"), {
                    confirmButtonText: this.$t("team.raid.common.confirm"),
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
