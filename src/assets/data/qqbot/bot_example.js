export const example_list = [
    {
        category: "资历百科（PVX）",
        name: "",
        detail: {
            title: "一图流指令",
            contents: [
                {
                    zhiling: "",
                    params: ["科举 <题目关键字词>"],
                },
                {
                    zhiling: "",
                    params: ["成就 <成就名称>", "任务 <任务名称>"],
                },
                {
                    zhiling: "",
                    params: ["物品 <物品名称>", "宠物 <宠物名称>", "坐骑 <坐骑名称>", "书籍 <书籍名称>"],
                },
                {
                    zhiling: "",
                    params: ["奇遇 <奇遇名称>", "声望 <声望名称>"],
                },
            ],
            content: {
            },
            example: "直接使用【类别 + 名称】触发，支持模糊匹配",
            tips: [],
            simple: {
                title: "示例指令",
                contents: [{
                    zhiling: "",
                    params: ["成就 唐门之危", "成就 [唐门之危]"],
                }],
                example: "例：科举 马嵬驿",
                tips: [
                    "可直接游戏内alt+点击快速获取名称，会自动处理[]",
                    "在线参与万人百科维护 游戏内（含无界）亦可快速获取攻略帮助",
                    "QQ交流群：614370825",
                ],
            },
        },
    },
    {
        category: "团队",
        name: "PVE指令",
        detail: {
            title: "触发指令",
            contents: [
                {
                    zhiling: "#开团",
                    params: ["<车次名称>"],
                },
                {
                    zhiling: "#进组",
                    params: ["<角色代称>", "<补充信息>"],
                },
                {
                    zhiling: "#退组",
                    params: ["<活动编号>"],
                }
            ],
            example: "活动只面向当前群；不填写补充信息时，活动名称默认为当前日期+活动编号",
            tips: [
                "#开团 也可以写作 #开组",
                "#进组 未指定活动时，默认加入今日最后一个创建的活动",
                "#退组 必须指定活动ID",
                "在QQ界面也可以通过快速点击 /开团 等命令，达到 #开团 一样的效果"
            ],
            simple: {
                title: "示例指令",
                contents: [
                    {
                        zhiling: "#开团",
                        params: [],
                    },
                    {
                        zhiling: "#开团",
                        params: ["白帝江关第8车"],
                    },
                    {
                        zhiling: "#进组",
                        params: ["冰心"],
                    },
                    {
                        zhiling: "#进组|1",
                        params: ["大侠号", "老板号,躺尸的"],
                    },
                    {
                        zhiling: "#退组",
                        params: ["1"],
                    },
                ],
                example: "例：#进组 毒经 老板号躺尸",
                tips: ["进组时默认进入最后一个活动，但退组时必须指定活动ID"],
            },
        },
    },
    {
        category: "赛事",
        name: "",
        detail: {
            title: "百强/天梯查询",
            contents: [
                {
                    zhiling: "",
                    params: ["<首领名称>百强", "<首领名称>百强#<服务器>"],
                },
                {
                    zhiling: "",
                    params: ["<首领名称>天梯", "<首领名称>天梯#<心法>"],
                }
            ],
            example: "直接使用【首领名称+榜单】触发，如需要查询特定服务器或心法添加后缀",
            tips: [],
            simple: {
                title: "示例指令",
                contents: [{
                    zhiling: "",
                    params: ["芭德百强", "池清川百强#梦江南", "李倓天梯", "李倓天梯#冰心诀"],
                }],
                example: "例：李倓百强、李倓百强#梦江南、池清川天梯、李倓天梯#冰心诀",
                tips: [
                    "默认只返回前10的成绩",
                    `完整榜单请前往 <a href="https://www.jx3box.com/rank" target="_blank">排行榜</a>`,
                ],
            },
        },
    },
    {
        category: "宏",
        name: "宏库指令",
        detail: {
            title: "推荐宏指令",
            contents: [{
                zhiling: "",
                params: ["<心法名称>宏", "<门派名称>宏"],
            }],
            example: "直接使用【心法名称或门派名称 + 宏】触发",
            tips: [],
            simple: {
                title: "示例指令",
                contents: [{
                    zhiling: "",
                    params: ["冰心宏", "冰心诀宏", "七秀宏", "7x宏"],
                }],
                example: "例：冰心宏、冰心诀宏、七秀宏",
                tips: [
                    "心法和门派名称可以是别名",
                    "默认推荐的宏为一键宏",
                    "可自行在宏作者Q群（297985102）联系小编自荐",
                ],
            },
        },
    },
    {
        category: "门派攻略（PVE）",
        name: "",
        detail: {
            title: "推荐攻略传送门",
            contents: [{
                zhiling: "",
                params: ["<心法名称>攻略", "<门派名称>攻略"],
            }],
            example: "直接使用【心法名称或门派名称 + 攻略】触发",
            tips: [],
            simple: {
                title: "示例指令",
                contents: [{
                    zhiling: "",
                    params: ["奶花攻略", "离经易道攻略", "花间宏"],
                }],
                example: "例：奶花攻略、离经易道攻略、花间攻略",
                tips: [
                    "心法和门派名称可以是别名",
                    "可自行在签约作者Q群（140129951）联系小编自荐（限签约作者）",
                ],
            },
        },
    },
    {
        category: "门派攻略（PVP）",
        name: "",
        detail: {
            title: "一图流指令",
            contents: [{
                zhiling: "",
                params: ["pvp:<攻略ID>"],
            }],
            example: "直接使用【pvp:攻略ID】触发",
            tips: [],
            simple: {
                title: "示例指令",
                contents: [{
                    zhiling: "",
                    params: ["pvp:12345", "吃鸡惊羽", "战场冰心"],
                }],
                example: "例：吃鸡惊羽、奶花竞技场",
                tips: [
                    "我们可能为一些门派或心法有预设一些常用的攻略快捷词（使用正则匹配），如“吃鸡”、“竞技场”等",
                    "可自行在签约作者Q群（140129951）联系小编自荐（限签约作者）",
                ],
            },
        },
    },
    {
        category: "查询",
        name: "",
        detail: {
            title: "综合信息查询",
            contents: [
                {
                    zhiling: "<角色名称>@<服务器>的奇遇",
                    params: ["<风格>", "刷新"],
                },
                {
                    zhiling: "我的奇遇",
                    params: ["<风格>", "刷新"],
                },
                {
                    zhiling: "百战",
                    params: ["<期数>"],
                },
                {
                    zhiling: "开服",
                    params: ["<服务器>"],
                },
                {
                    zhiling: "金价",
                    params: ["<服务器>"],
                },
                {
                    zhiling: "物价",
                    params: ["<物品名称>"],
                },
            ],
            example: ``,
            tips: [
                "奇遇查询 - 查询指定角色的奇遇珍卷，支持指定角色名@服务器，QQ机器人默认返回横版，公众号固定只返回竖版",
                "我的奇遇 - 返回当前用户的奇遇珍卷（用户需先绑定QQ到魔盒，绑定角色到魔盒并设置默认角色，并通过插件同步成就）",
                "百战查询 - 查询当前百战期数的百战信息，默认返回最新一期",
                "开服查询 - 查询当前服务器开服状态",
                "金价查询 - 查询全服或指定服务器的金价信息",
                "物价查询 - 查询指定物品的全服信息",
            ],
            simple: {
                title: "示例指令",
                contents: [
                    {
                        zhiling: "牧野苍梧@梦江南的奇遇",
                        params: ["竖版", "刷新"],
                    },
                    {
                        zhiling: "我的奇遇",
                        params: ["横版", "刷新"],
                    },
                    {
                        zhiling: "百战",
                        params: ["154"],
                    },
                    {
                        zhiling: "开服",
                        params: ["梦江南"],
                    },
                    {
                        zhiling: "金价",
                        params: ["梦江南"],
                    },
                    {
                        zhiling: "物价",
                        params: ["五行石（六级）"],
                    }
                ],
                example: "",
                tips: [
                    `奇遇珍卷默认会有缓存，如需刷新缓存，请增加刷新参数。例如：我的奇遇 刷新，牧野苍梧@梦江南的奇遇 刷新`,
                    "开服 - 可在参数指定查询某个指定服务器状态",
                    "物价 - 必须指定物品名称",
                ],
            },
        },
    },
    {
        category: "其它",
        name: "",
        detail: {
            title: "拓展功能",
            contents: [
                {
                    zhiling: "今日头条",
                    params: [],
                },
                {
                    zhiling: "骚话",
                    params: ["<门派>"],
                },
            ],
            example: "",
            tips: [
                "今日头条 - 查询当前和下一批头条内容，对应魔盒官网与小程序首页推荐",
                "骚话 - 随机生成一句骚话",
            ],
            simple: {
                title: "示例指令",
                contents: [
                    {
                        zhiling: "今日头条",
                        params: [],
                    },
                    {
                        zhiling: "骚话",
                        params: ["万花"],
                    }
                ],
                example: ``,
                tips: [
                    `骚话 - 可以在后面增加门派以指定骚话分组,<a href="https://www.jx3box.com/joke" target="_blank">提交您的骚话</a>`
                ],
            },
        },
    },
];
