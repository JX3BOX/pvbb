import { createStore } from "vuex";

import { getRoles } from "@/service/team/raid.js";

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
        loadAllRoles({ commit }, { teamId }) {
            getRoles(teamId, "").then((res) => {
                commit("SET_ROLES", res.data.data.list);
            });
        },
    },
    modules: {},
};

export default createStore(store);
