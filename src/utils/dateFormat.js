import dayjs from "dayjs";
const relativeTime = require("dayjs/plugin/relativeTime");
require("dayjs/locale/zh-cn");
require("dayjs/locale/zh-tw");
require("dayjs/locale/vi");
dayjs.extend(relativeTime);

const localeMap = {
    "zh-cn": "zh-cn",
    "zh-tw": "zh-tw",
    "en-us": "en",
    vi: "vi",
};

function getLocale() {
    const lang = (typeof localStorage !== "undefined" && localStorage.getItem("lang")
        ? localStorage.getItem("lang")
        : "zh-cn"
    ).toLowerCase();
    return localeMap[lang] || "zh-cn";
}

function translate(t, key, fallback) {
    return typeof t === "function" ? t(key) : fallback;
}
// 日期距离今日
function getRelativeTime(dt) {
    const locale = getLocale();
    return dayjs().locale(locale).from(dayjs(dt).locale(locale));
}

/**
 * 简单的日期格式化
 *
 * @param {*} dt Date实例
 * @param {object} opt polished:是否补齐两位,separator:连接分隔符
 */
function dateFormat(dt, separator = "-", polished = true) {
    let year = dt.getFullYear();
    let month = dt.getMonth() + 1;
    let date = dt.getDate();
    let str = polished
        ? `${year}${separator}${polish(month)}${separator}${polish(date)}`
        : `${year}${separator}${month}${separator}${date}`;
    return str;
}

function polish(val) {
    return val < 10 ? "0" + val : val;
}

function getTimeAgo(dateString, t) {
    // 使用dayjs解析传入的日期字符串
    const date = dayjs(dateString);
    const now = dayjs();

    // 计算当前时间与给定日期之间的差异
    const diff = now.diff(date, "day");
    if (diff === 0) {
        if (now.diff(date, "minute") <= 60) {
            return { text: translate(t, "pages.community.time.justNow", "刚刚"), icon: "el-icon-loading" };
        } else if (now.diff(date, "minute") <= 120) {
            return {
                text: translate(t, "pages.community.time.withinTwoHours", "2小时内"),
                icon: "el-icon-time",
            };
        } else {
            return { text: date.format("HH:mm"), icon: "el-icon-time" };
        }
    } else if (diff === 1) {
        return { text: translate(t, "pages.community.time.yesterday", "昨天"), icon: "el-icon-time" };
    } else if (diff >= 2 && diff <= 365) {
        return { text: date.format("MM-DD"), icon: "el-icon-date" };
    } else {
        // 如果时间差超过1年
        return { text: date.format("YYYY-MM-DD"), icon: "el-icon-date" };
    }
}

export { dateFormat, getRelativeTime, getTimeAgo };
