/*
 * @Author: iRuxu
 * @Date: 2022-07-17 01:25:16
 * @LastEditTime: 2022-07-17 20:06:34
 * @Description:
 */
import Vue from "vue";
import VueRouter from "vue-router";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";

// 解决重复点击路由报错的BUG
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch((err) => err);
};

const Namespace = () => import("../views/Namespace.vue");
const Joke = () => import("../views/Joke/Joke.vue");
const JokeMobile = () => import("../views/Joke/Joke-mobile.vue");

const Emotion = () => import("../views/Emotion.vue");
const Collection = () => import("../views/Collection.vue");
const Community = () => import("../views/Community.vue");
const CommunitySingle = () => import("../views/CommunitySingle.vue");
const Single = () => import("../views/Single.vue");

Vue.use(VueRouter);

const routes = [
    { name: "index", path: "/", redirect: { name: "community" } },
    { name: "bbs", path: "/bbs", redirect: { name: "community" } },
    { name: "single", path: "/bbs/:id", component: Single },
    { name: "community", path: "/community", component: Community },
    { path: "/community_topic/:id", redirect: "/community/:id" },
    { path: "/community/topic/:id", redirect: "/community/:id" },
    { name: "community-single", path: "/community/:id", component: CommunitySingle },
    { name: "namespace", path: "/namespace", component: Namespace },
    {
        name: "namespace-single",
        path: "/namespace/:id",
        component: () => import("@/components/namespace/namespace_single.vue"),
    },
    { name: "joke", path: "/joke/:id?", component: isMiniProgram() ? JokeMobile : Joke },

    { name: "emotion", path: "/emotion/:id?", component: Emotion },
    { name: "collection", path: "/collection", component: Collection },
    {
        name: "collection-single",
        path: "/collection/:id",
        component: () => import("@/components/collection/collection_single.vue"),
    },
];

const router = new VueRouter({
    routes,
    mode: "history",
});

export default router;
