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
                title: "pages.namespace.single.title",
                keywords: "pages.namespace.single.keywords",
                description: "pages.namespace.single.description",
            },
        },
    },
    {
        name: "joke",
        path: "/joke/:id?",
        component: isMiniProgram() || isApp() ? JokeMobile : Joke,
        meta: {
            i18n: {
                title: "pages.joke.single.title",
                keywords: "pages.joke.single.keywords",
                description: "pages.joke.single.description",
            },
        },
    },
    {
        name: "emotion",
        path: "/emotion/:id?",
        component: isMiniProgram() || isApp() ? EmotionMobile : Emotion,
        meta: {
            i18n: {
                title: "pages.emotion.single.title",
                keywords: "pages.emotion.single.keywords",
                description: "pages.emotion.single.description",
            },
        },
    },
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
                title: "pages.collection.single.title",
                keywords: "pages.collection.single.keywords",
                description: "pages.collection.single.description",
            },
        },
    },

    // ====== qqbot ======
    {
        name: "qqbot",
        path: "/qqbot",
        component: () => import("@/views/QQBot.vue"),
        meta: {
            i18n: {
                title: "pages.qqbot.title",
                keywords: "pages.qqbot.keywords",
                description: "pages.qqbot.description",
            },
        },
    },
    {
        name: "help",
        path: "/qqbot/help",
        component: () => import("@/views/qqbot/Help.vue"),
        meta: { title: "指令手册" },
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
