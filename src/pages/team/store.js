import { createStore } from "vuex";

import { getRoles } from "@/service/team/raid.js";
import { getRoleMountPreferences } from "@/service/team/role_mount_preference";
import { mergeRoleMountPreferences } from "@/utils/team-role-mounts";

let store = {
    state: {
        client: location.href.includes("origin") ? "origin" : "std",

        team_status: false,
        team: "",

        // DKP
        inFreeEditMode: false,
        selectedDkpList: [],
        teamMembers: [],

        // view_raid
        canManage: false,
        isTeammate: false,
        roles: [],

        // member list
        pendingList: [],

        // member order
        memberOrder: [],
        normalMembers: [], // 正式成员
        subMembers: [], // 替补成员
        tobeMembers: [], // 申请名单
    },
    mutations: {
        setManageStatus(state, manage) {
            state.canManage = manage;
        },
        setIsTeammate(state, isTeammate) {
            state.isTeammate = isTeammate;
        },
        SET_ROLES(state, data) {
            state.roles = data;
        },
        SET_TEAM_MEMBERS(state, data) {
            state.teamMembers = data;
        },
        SET_PENDING_LIST(state, data) {
            state.pendingList = data;
        },
        SET_MEMBER_ORDER(state, data) {
            state.memberOrder = data;
        },
        SET_NORMAL_MEMBERS(state, data) {
            state.normalMembers = data;
        },
        SET_SUB_MEMBERS(state, data) {
            state.subMembers = data;
        },
        SET_TOBE_MEMBERS(state, data) {
            state.tobeMembers = data;
        },
        SET_TEAM: (state, team) => {
            state.team = team;
        },
    },
    getters: {},
    actions: {
        async loadAllRoles({ commit }, { teamId }) {
            const res = await getRoles(teamId, "");
            const roles = res.data.data.list || [];
            try {
                const preferenceResponse = await getRoleMountPreferences(teamId);
                commit("SET_ROLES", mergeRoleMountPreferences(roles, preferenceResponse.data.data || []));
            } catch {
                // 偏好接口不可用时保留旧门派推导逻辑，不阻断排表加载。
                commit("SET_ROLES", roles);
            }
        },
    },
    modules: {},
};

export default createStore(store);
