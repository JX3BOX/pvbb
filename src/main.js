try {
    let [subtype, id] = location.hash.slice(2)?.split("/");
    const oldSubtypes = ["collection", "emotion", "joke"];
    if (oldSubtypes.includes(subtype)) {
        location.href = location.origin + "/" + subtype + "/" + id;
    }
} catch (e) {
    console.log("旧地址匹配异常", e);
}

// 1.Create APP
import { createApp } from "vue";
import App from "./App.vue";
const app = createApp(App);

// 将 filters 合并到 methods，兼容 Vue3 模板中直接调用
app.mixin({
    beforeCreate() {
        const filters = this.$options.filters;
        if (filters) {
            this.$options.methods = {
                ...(this.$options.methods || {}),
                ...filters,
            };
        }
    },
});

// 2.Router & Store
import router from "./router";
import store from "./store";
app.use(router);
app.use(store);

// 3.i18n (JX3BOX UI)
import { Jx3boxUiI18n, getJx3boxUiAvailableLocales } from "@jx3box/jx3box-ui";
const __langKey = (localStorage.getItem("lang") || "zh-cn").toLowerCase();
const __langMap = {
    "zh-cn": "zh-CN",
    "en-us": "en-US",
    "zh-tw": "zh-TW",
    vi: "vi",
};
const __preferredI18nLocale = __langMap[__langKey] || "zh-CN";
const __supportedI18nLocales = getJx3boxUiAvailableLocales();
const __i18nLocale = __supportedI18nLocales.includes(__preferredI18nLocale) ? __preferredI18nLocale : "zh-CN";
app.use(Jx3boxUiI18n, {
    locale: __i18nLocale,
});

// 4.UI
import "@jx3box/jx3box-common/css/normalize.css";
import "@jx3box/jx3box-common/css/font.css";
import "@/assets/css/tailwind.css";

import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import zhTw from "element-plus/es/locale/lang/zh-tw";
import vi from "element-plus/es/locale/lang/vi";
import "element-plus/dist/index.css";
import "@/assets/css/element-plus-theme.scss";
import "@jx3box/jx3box-common/css/element-fonticon.css";

import VueSvgInlinePlugin from "vue-svg-inline-plugin";

// use Vue plugin without options
app.use(VueSvgInlinePlugin);

// use Vue plugin with options
app.use(VueSvgInlinePlugin, {
    attributes: {
        data: ["src"],
        remove: ["alt"],
    },
});

const __elementLocaleMap = {
    "zh-CN": zhCn,
    "en-US": en,
    "zh-TW": zhTw,
    vi,
};
const __elementLocale = __elementLocaleMap[__i18nLocale] || zhCn;
app.use(ElementPlus, {
    locale: __elementLocale,
});

import * as ElementPlusIconsVue from "@element-plus/icons-vue";
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}

import { install } from "@jx3box/jx3box-ui";
install(app);

// reporter
import reporter from "@jx3box/jx3box-common/js/reporter";
reporter.installVue3(app);

// 5.Mount DOM
app.mount("#app");
