export function escapeHtml(str) {
    return str.replace(/[<>"']/g, function (match) {
        switch (match) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            case "'":
                return "&#39;";
        }
    });
}

export function modifyAlpha(rgbaString, newAlpha) {
    // 正则表达式匹配 rgba 中的数字
    const rgbaRegex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/;

    // 使用正则表达式提取 rgba 值
    const matches = rgbaString.match(rgbaRegex);

    // 如果匹配失败，返回原始的 rgba 字符串
    if (!matches) {
        // console.log("如果匹配失败，返回原始的 rgba 字符串：" + rgbaString);
        return rgbaString;
    }

    // 提取 r, g, b 和 a 的值
    const [, r, g, b, a] = matches;

    // 确保新的 alpha 值在 0 到 1 之间
    const alpha = Math.min(1, Math.max(0, parseFloat(newAlpha)));

    // 重新组合 rgba 字符串，并返回
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatCategoryList(categories) {
    return categories.map((item) => {
        let color = item.color ? item.color : "rgba(64, 128, 255, 1)";
        const data = {
            value: item.name,
            name: item.name,
            icon: item.icon || "game",
            hoverColor: modifyAlpha(color, 0.1),
            color: modifyAlpha(color, 1),
            mark: item.mark,
            remark: item.remark,
            mark_enable: item.mark_enable,
        };
        return data;
    });
}
