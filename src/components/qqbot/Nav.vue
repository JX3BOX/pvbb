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
    padding: 12px;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    background: rgba(8, 12, 20, 0.58);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(12px);
    .u-title {
        margin: 8px 0 18px;
        font-size: 30px;
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
        width: 176px;
        height: 68px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 21px;
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

@media screen and (max-width: 1279px) {
    .m-qqbot-nav {
        width: 176px;

        .u-title {
            font-size: 30px;
        }

        .optin {
            width: 152px;
        }
    }
}

@media screen and (max-width: 900px) {
    .m-qqbot-nav {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        padding: 12px 0 16px;
        border: 0;
        background: transparent;
        box-shadow: none;
        backdrop-filter: none;

        .u-title {
            grid-column: 1 / -1;
            margin: 0 0 8px;
            font-size: 28px;
            line-height: 1.4;
            text-align: left;
        }

        .optin {
            width: 100%;
            height: 56px;
            border-radius: 10px;
            font-size: 17px;

            .icon {
                width: 20px;
                height: 20px;
                margin-left: 6px;
            }
        }
    }
}
</style>
