import dayjs from "dayjs";
const relativeTime = require("dayjs/plugin/relativeTime");
require("dayjs/locale/zh-cn");
dayjs.locale("zh-cn");
dayjs.extend(relativeTime);
// 日期距离今日
function getRelativeTime(dt) {
    return dayjs().from(dayjs(dt));
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

function getTimeAgo(dateString) {
    // 使用dayjs解析传入的日期字符串
    const date = dayjs(dateString);
    const now = dayjs();

    // 计算当前时间与给定日期之间的差异
    const diff = now.diff(date, "day");
    if (diff === 0) {
        if (now.diff(date, "minute") <= 60) {
            return { text: "刚刚", icon: "el-icon-loading" };
        } else if (now.diff(date, "minute") <= 120) {
            return { text: "2小时内", icon: "el-icon-time" };
        } else {
            return { text: date.format("HH:mm"), icon: "el-icon-time" };
        }
    } else if (diff === 1) {
        return { text: "昨天", icon: "el-icon-time" };
    } else if (diff >= 2 && diff <= 365) {
        return { text: date.format("MM-DD"), icon: "el-icon-date" };
    } else {
        // 如果时间差超过1年
        return { text: date.format("YYYY-MM-DD"), icon: "el-icon-date" };
    }
}

export { dateFormat, getRelativeTime, getTimeAgo };
