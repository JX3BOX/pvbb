<template>
    <div class="m-qqbot-nav">
        <div class="u-title">魔盒QQ机器人</div>
        <router-link class="help-option optin" :class="{ active: routeName === 'help' }" :to="{ name: 'help' }">
            <p>指令手册</p>
            <img class="icon" src="@/assets/img/qqbot/help.svg" svg-inline alt="" />
        </router-link>
        <router-link class="bind-option optin" :class="{ active: routeName === 'bind' }" :to="{ name: 'bind' }">
            <p>绑定账号</p>
            <img class="icon" src="@/assets/img/qqbot/robot.svg" svg-inline alt="" />
        </router-link>
        <router-link
            class="team-option optin"
            :class="{ active: routeName === 'raid-list' || routeName === 'raid-detail' }"
            :to="{ name: 'team' }"
        >
            <p>开团管理</p>
            <img class="icon" src="@/assets/img/qqbot/team.svg" svg-inline alt="" />
        </router-link>
    </div>
</template>

<script>
export default {
    name: "QQbotNav",
    data() {
        return {
            selected: this.$route.query.id ? "team" : "help",
        };
    },
    computed: {
        routeName() {
            return this.$route.name;
        },
    },
    methods: {
        selectItem(item) {
            this.selectedItem = item;
        },
    },
};
</script>

<style lang="less">
.m-qqbot-nav {
    width: 200px;
    .u-title {
        margin: 24px 0;
        font-size: 36px;
        font-weight: 400;
        letter-spacing: 0px;
        line-height: 43.2px;
        color: rgba(255, 255, 255, 1);
        text-align: center;
        font-family: "Smiley Sans";
    }
    .optin {
        border-radius: 12px;
        cursor: pointer;
        width: 200px;
        height: 83px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        font-weight: 400;
        letter-spacing: 0px;
        color: rgba(255, 255, 255, 1);
        .icon {
            width: 24px;
            height: 24px;
            margin-left: 10px;
        }
    }
    .team-option.active {
        background: linear-gradient(270deg, rgba(255, 141, 26, 0) 0%, rgba(255, 141, 26, 1) 100%);
    }
    .help-option.active {
        background: linear-gradient(270deg, rgba(64, 128, 255, 0) 0%, rgba(64, 128, 255, 1) 100%);
    }
    .bind-option.active {
        background: linear-gradient(270deg, rgba(255, 64, 134, 0) 0%, rgba(255, 64, 134, 1) 100%);
    }
}
</style>
