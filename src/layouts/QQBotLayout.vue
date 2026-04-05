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
import { __imgPath, __cdn } from "@/utils/config";
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
        }
    },
    computed: {
        onlyTable() {
            return this.$route.query?.onlyTable;
        },
    },
};
</script>

<style lang="less">
.p-qqbot {
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
    .flex;
    gap: 100px;

    .u-girl {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 558px;
        height: 581px;
        pointer-events: none;
    }
    @media screen and (max-width: 1440px) {
        .girl {
            .none;
        }
    }
    .m-content {
        .w(1048px);
    }
}

.p-qqbot.onlyTable {
    .girl,
    .c-header,
    .m-qqbot-nav,
    .m-raid-detail .m-raid-detail__toolbar {
        .none;
    }
    .create-team {
        height: 100vh;
        .content {
            width: auto;
        }
    }
    .c-main {
        margin: 0;
        height: 100%;
    }
}
</style>
