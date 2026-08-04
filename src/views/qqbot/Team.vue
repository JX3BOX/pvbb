<template>
    <QQBotLayout>
        <div class="m-team-content">
            <template v-if="!isLogin">
                <TipBox desc="该功能需要登录才能使用" click-text="前往登录" :click-function="toLogin"></TipBox>
            </template>
            <template v-else-if="checking">
                <div class="m-team-loading" v-loading="true"></div>
            </template>
            <template v-else>
                <template v-if="hasBind === false">
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
        <Pin />
    </QQBotLayout>
</template>

<script>
import User from "@jx3box/jx3box-common/js/user";
import { checkOAuth } from "@/service/qqbot";
import TipBox from "@/components/qqbot/TipBox.vue";
import QQBotLayout from "@/layouts/QQBotLayout.vue";
import Pin from "@/views/qqbot/components/Pin.vue";
export default {
    name: "Team",
    components: {
        TipBox,
        QQBotLayout,
        Pin,
    },
    data() {
        return {
            checking: User.isLogin(),
            hasBind: null,
        };
    },
    computed: {
        isLogin() {
            return User.isLogin();
        },
    },
    mounted() {
        if (this.isLogin) this.check();
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
            if (!this.isLogin) return;
            this.checking = true;
            return checkOAuth()
                .then((res) => {
                    this.hasBind = !!res.data.data?.qqbot;
                })
                .catch(() => {
                    this.hasBind = false;
                })
                .finally(() => {
                    this.checking = false;
                });
        },
    },
};
</script>

<style lang="less" scoped>
.m-team-content {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    scrollbar-width: thin;
}

.m-team-loading {
    width: 100%;
    height: 420px;
    margin-top: 32px;
    border-radius: 16px;
    background: linear-gradient(145deg, rgba(42, 44, 51, 0.96), rgba(18, 20, 25, 0.98));
}
</style>
