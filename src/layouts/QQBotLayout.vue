<template>
    <div class="p-qqbot" :class="{ onlyTable }">
        <CommonHeader></CommonHeader>
        <Main :class="className" :withoutRight="true" :withoutLeft="true">
            <div class="m-create-team">
                <Nav></Nav>
                <div class="m-content">
                    <slot></slot>
                </div>
                <img class="u-girl" :src="url + 'girl.png'" alt="" />
            </div>
        </Main>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
import Nav from "@/components/qqbot/Nav.vue";
export default {
    name: "AppLayout",
    components: {
        Nav,
    },
    props: {
        slug: {
            type: String,
            default: "",
        },
        icon: {
            type: String,
            default: "",
        },
        className: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            url: "https://cdn.jx3box.com/design/pve/team/",
        };
    },
    computed: {
        onlyTable() {
            const query = this.$route.query || {};
            if (!Object.prototype.hasOwnProperty.call(query, "onlyTable")) return false;
            const value = Array.isArray(query.onlyTable) ? query.onlyTable[0] : query.onlyTable;
            return !["0", "false"].includes(String(value).toLowerCase());
        },
    },
};
</script>

<style lang="less">
.p-qqbot {
    min-width: 0;
    .pr;
    .c-main {
        margin-top: 59px;
        height: calc(100vh - 64px);
        padding: 0;
    }
}
@url: "https://cdn.jx3box.com/design/pve/team/";
@font-face {
    font-family: "Smiley Sans";
    src: url("@{url}SmileySans-Oblique.ttf.woff2") format("woff2");
}
.m-create-team {
    background: linear-gradient(180deg, rgba(6, 6, 6, 1) 50.15%, rgba(39, 63, 102, 1) 100%);
    min-height: 100%;
    display: flex;
    justify-content: center;
    overflow: hidden;
    position: relative;
    padding: 0 252px 48px 280px;
    box-sizing: border-box;

    .u-girl {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 20rem;
        pointer-events: none;
        z-index: 1;
    }
    .m-content {
        width: min(1280px, 100%);
        min-width: 0;
    }

    .m-qqbot-nav {
        position: fixed;
        top: 80px;
        left: 40px;
        z-index: 2;
    }
}

@media screen and (max-width: 1680px) {
    .m-create-team {
        padding-right: 32px;
        padding-left: 236px;

        .u-girl {
            .none;
        }

        .m-qqbot-nav {
            left: 20px;
        }
    }
}

@media screen and (max-width: 1279px) {
    .m-create-team {
        padding: 0 20px 32px 216px;

        .m-content {
            width: 100%;
        }
    }
}

@media screen and (max-width: 900px) {
    .p-qqbot .c-main {
        height: auto;
        min-height: calc(100vh - 59px);
    }

    .m-create-team {
        display: block;
        padding: 0 16px 32px;

        .m-qqbot-nav {
            position: static;
        }

        .m-content {
            width: 100%;
        }
    }
}

.p-qqbot.onlyTable {
    .u-girl,
    .c-header,
    .c-footer,
    .m-qqbot-nav,
    .m-raid-detail .m-raid-detail__toolbar {
        .none;
    }
    .m-create-team {
        height: 100vh;
        padding: 0;

        .m-content {
            width: auto;
        }
    }
    .c-main {
        margin: 0;
        height: 100%;
    }
}
</style>
