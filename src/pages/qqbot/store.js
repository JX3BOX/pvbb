import { createStore } from "vuex";

let store = {
    state: {
        // client
        client: location.href.includes("origin") ? "origin" : "std",
        subtype: "",
    },
    mutations: {},
    getters: {},
    actions: {},
    modules: {},
};

export default createStore(store);
