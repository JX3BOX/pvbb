/*
 * @Author: iRuxu
 * @Date: 2022-07-17 01:25:16
 * @LastEditTime: 2022-07-17 20:06:34
 * @Description:
 */
import { createRouter, createWebHistory } from "vue-router";

const Namespace = () => import("../views/Namespace.vue");
const Joke = () => import("../views/Joke/Joke.vue");

const Emotion = () => import("../views/emotion/Emotion.vue");
const Collection = () => import("../views/Collection.vue");
const CollectionSingle = () => import("@/components/collection/collection_single.vue");

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
    {
        path: "/community_topic/:id",
        redirect: (to) => ({ name: "community-single", params: { id: to.params.id }, query: to.query, hash: to.hash }),
    },
    {
        path: "/community/topic/:id",
        redirect: (to) => ({ name: "community-single", params: { id: to.params.id }, query: to.query, hash: to.hash }),
    },
    {
        name: "community-single",
        path: "/community/:id",
        component: () => import("@/views/community/CommunitySingle.vue"),
        meta: {
            preserveDynamicTitle: true,
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
        component: Namespace,
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
        component: Joke,
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
        component: Emotion,
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
        component: CollectionSingle,
        meta: {
            i18n: {
                title: "pages.collection.title",
                keywords: "pages.collection.keywords",
                description: "pages.collection.description",
            },
        },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
