<template>
    <QQBotLayout>
        <div class="m-team-content">
            <template v-if="!isLogin">
                <TipBox desc="该功能需要登录才能使用" click-text="前往登录" :click-function="toLogin"></TipBox>
            </template>
            <template v-else>
                <template v-if="!hasBind">
                    <TipBox
                        desc="该功能需要绑定QQ机器人才能使用"
                        click-text="前往绑定"
                        :click-function="toBind"
                    ></TipBox>
                </template>
                <template v-else>
                    <router-view />
                </template>
            </template>
        </div>
    </QQBotLayout>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import { checkOAuth } from "@/service/qqbot";
import TipBox from "@/components/qqbot/TipBox.vue";
import QQBotLayout from "@/layouts/QQBotLayout.vue";
export default {
    name: "Team",
    components: {
        TipBox,
        QQBotLayout,
    },
    data() {
        return {
            hasBind: true,
        };
    },
    computed: {
        isLogin() {
            return User.isLogin();
        },
    },
    mounted() {
        this.check();
    },
    methods: {
        toBind() {
            this.$router.push({
                name: "bind",
            });
        },
        toLogin() {
            User.toLogin();
        },
        check() {
            checkOAuth()
                .then((res) => {
                    this.hasBind = !!res.data.data?.qqbot;
                })
                .catch(() => {
                    this.hasBind = false;
                });
        },
    },
};
</script>

<style lang="less" scoped>
.m-team-content {
    width: 1296px;
    height: 100%;
}
</style>
