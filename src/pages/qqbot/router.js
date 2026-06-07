import { createRouter, createWebHistory } from "vue-router";

function queryValues(value) {
    if (Array.isArray(value)) return value.map(String);
    return value ? [String(value)] : [];
}

function shouldRedirectHorseHarnessToItem(query) {
    const types = queryValues(query.type);
    return types.includes("horse") && types.includes("2");
}

const routes = [
    {
        path: "/",
        redirect: "/help",
    },
    // QQ机器人
    {
        name: "help",
        path: "/help",
        component: () => import("@/views/qqbot/Help.vue"),
        meta: { title: "指令手册" },
    },
    {
        name: "qqbot-pve",
        path: "/pve",
        component: () => import("@/views/qqbot/Pve.vue"),
        meta: { title: "PVE" },
    },
    {
        name: "qqbot-pvp",
        path: "/pvp",
        component: () => import("@/views/qqbot/Pvp.vue"),
        meta: { title: "PVP" },
    },
    {
        name: "qqbot-pvx",
        path: "/pvx",
        component: () => import("@/views/qqbot/Pvx.vue"),
        meta: { title: "PVX" },
        beforeEnter(to) {
            if (!shouldRedirectHorseHarnessToItem(to.query)) return true;
            return {
                name: "qqbot-wiki",
                query: {
                    ...to.query,
                    type: "item",
                },
                replace: true,
            };
        },
    },
    {
        name: "qqbot-wiki",
        path: "/wiki",
        component: () => import("@/views/qqbot/Wiki.vue"),
        meta: { title: "百科" },
    },
    {
        name: "bind",
        path: "/bind",
        component: () => import("@/views/qqbot/Bind.vue"),
        meta: { title: "绑定账号" },
    },
    {
        name: "team",
        path: "/team",
        component: () => import("@/views/qqbot/Team.vue"),
        meta: { title: "开团管理" },
        redirect: {
            name: "raid-list",
        },
        children: [
            {
                name: "raid-list",
                path: "/team/raid-list",
                component: () => import("@/views/qqbot/components/RaidList.vue"),
                meta: { title: "开团列表" },
            },
            {
                name: "raid-detail",
                path: "/team/raid-detail",
                component: () => import("@/views/qqbot/components/RaidDetail.vue"),
                meta: { title: "开团详情" },
            },
        ],
    },
    {
        name: "raid-detail-noauth",
        path: "/team/raid-detail-noauth",
        component: () => import("@/views/qqbot/components/RaidDetailNoAuth.vue"),
        meta: { title: "开团详情" },
    },
];

const router = createRouter({
    history: createWebHistory("/qqbot"),
    routes,
});

export default router;
