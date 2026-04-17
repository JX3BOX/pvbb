/*
 * @Author: iRuxu
 * @Date: 2022-07-17 01:25:16
 * @LastEditTime: 2022-07-17 20:06:34
 * @Description:
 */
import { createRouter, createWebHistory } from "vue-router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const Namespace = () => import("../views/Namespace.vue");
const NamespaceMobile = () => import("../views/Namespace-mobile.vue");
const Joke = () => import("../views/Joke/Joke.vue");
const JokeMobile = () => import("../views/Joke/Joke-mobile.vue");

const Emotion = () => import("../views/emotion/Emotion.vue");
const EmotionMobile = () => import("../views/emotion/Emotion-mobile.vue");
const Collection = () => import("../views/Collection.vue");
const CollectionSingle = () => import("@/components/collection/collection_single.vue");
const CollectionMiniSingle = () => import("@/components/collection/collection_mini_single.vue");

const routes = [
    { name: "index", path: "/", redirect: { name: "community" } },

    // 论坛旧茶馆兼容
    { name: "bbs", path: "/bbs", redirect: { name: "community" } },
    {
        name: "single",
        path: "/bbs/:id",
        component: () => import("@/views/Single.vue"),
        meta: {
            i18n: {
                title: "pages.community.title",
                keywords: "pages.community.keywords",
                description: "pages.community.description",
            },
        },
    },

    // 论坛
    {
        name: "community",
        path: "/community",
        component: () => import("@/views/community/Community.vue"),
        meta: {
            i18n: {
                title: "pages.community.title",
                keywords: "pages.community.keywords",
                description: "pages.community.description",
            },
        },
    },
    { path: "/community_topic/:id", redirect: "/community/:id" },
    { path: "/community/topic/:id", redirect: "/community/:id" },
    {
        name: "community-single",
        path: "/community/:id",
        component: () => import("@/views/community/CommunitySingle.vue"),
        meta: {
            i18n: {
                title: "pages.community.single.title",
                keywords: "pages.community.single.keywords",
                description: "pages.community.single.description",
            },
        },
    },

    // 铭牌
    {
        name: "namespace",
        path: "/namespace",
        component: isMiniProgram() || isApp() ? NamespaceMobile : Namespace,
        meta: {
            i18n: {
                title: "pages.namespace.title",
                keywords: "pages.namespace.keywords",
                description: "pages.namespace.description",
            },
        },
    },
    {
        name: "namespace-single",
        path: "/namespace/:id",
        component: () => import("@/components/namespace/namespace_single.vue"),
        meta: {
            i18n: {
                title: "pages.namespace.title",
                keywords: "pages.namespace.keywords",
                description: "pages.namespace.description",
            },
        },
    },

    // 骚话
    {
        name: "joke",
        path: "/joke/:id?",
        component: isMiniProgram() || isApp() ? JokeMobile : Joke,
        meta: {
            i18n: {
                title: "pages.joke.title",
                keywords: "pages.joke.keywords",
                description: "pages.joke.description",
            },
        },
    },

    // 趣图
    {
        name: "emotion",
        path: "/emotion/:id?",
        component: isMiniProgram() || isApp() ? EmotionMobile : Emotion,
        meta: {
            i18n: {
                title: "pages.emotion.title",
                keywords: "pages.emotion.keywords",
                description: "pages.emotion.description",
            },
        },
    },

    // 小册
    {
        name: "collection",
        path: "/collection",
        component: Collection,
        meta: {
            i18n: {
                title: "pages.collection.title",
                keywords: "pages.collection.keywords",
                description: "pages.collection.description",
            },
        },
    },
    {
        name: "collection-single",
        path: "/collection/:id",
        component: isMiniProgram() || isApp() ? CollectionMiniSingle : CollectionSingle,
        meta: {
            i18n: {
                title: "pages.collection.title",
                keywords: "pages.collection.keywords",
                description: "pages.collection.description",
            },
        },
    },

    // QQ机器人
    {
        name: "help",
        path: "/qqbot/help",
        component: () => import("@/views/qqbot/Help.vue"),
        meta: { title: "指令手册" },
    },
    {
        name: "qqbot-pve",
        path: "/qqbot/pve",
        component: () => import("@/views/qqbot/Pve.vue"),
        meta: { title: "PVE" },
    },
    {
        name: "qqbot-pvp",
        path: "/qqbot/pvp",
        component: () => import("@/views/qqbot/Pvp.vue"),
        meta: { title: "PVP" },
    },
    {
        name: "qqbot-pvx",
        path: "/qqbot/pvx",
        component: () => import("@/views/qqbot/Pvx.vue"),
        meta: { title: "PVX" },
    },
    {
        name: "qqbot-wiki",
        path: "/qqbot/wiki",
        component: () => import("@/views/qqbot/Wiki.vue"),
        meta: { title: "百科" },
    },
    {
        name: "bind",
        path: "/qqbot/bind",
        component: () => import("@/views/qqbot/Bind.vue"),
        meta: { title: "绑定账号" },
    },
    {
        name: "team",
        path: "/qqbot/team",
        component: () => import("@/views/qqbot/Team.vue"),
        meta: { title: "开团管理" },
        redirect: {
            name: "raid-list",
        },
        children: [
            {
                name: "raid-list",
                path: "/qqbot/team/raid-list",
                component: () => import("@/views/qqbot/components/RaidList.vue"),
                meta: { title: "开团列表" },
            },
            {
                name: "raid-detail",
                path: "/qqbot/team/raid-detail",
                component: () => import("@/views/qqbot/components/RaidDetail.vue"),
                meta: { title: "开团详情" },
            },
        ],
    },
    {
        name: "raid-detail-noauth",
        path: "/qqbot/team/raid-detail-noauth",
        component: () => import("@/views/qqbot/components/RaidDetailNoAuth.vue"),
        meta: { title: "开团详情" },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
