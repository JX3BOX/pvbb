# QQBot Screenshot Ready

QQBot 页面会被服务器以无头浏览器访问并截图。截图服务以页面全局变量为信号：

- `window.__DATA_READY__`: 当前页面的数据请求流程已经结束。
- `window.__READY__`: 当前页面已经可以截图。

## 状态流程

所有 QQBot 截图页应使用 `src/utils/qqbot-ready.js` 维护状态，不要在组件里直接写全局变量。

```js
import { markQQBotReady, resetQQBotReady, setQQBotDataReady } from "@/utils/qqbot-ready";
```

推荐流程：

1. 请求开始前调用 `resetQQBotReady()`。
   - 设置 `window.__READY__ = false`
   - 设置 `window.__DATA_READY__ = false`
   - 递增内部 `readyTicket`
2. 数据请求流程结束后调用 `setQQBotDataReady(true)`。
   - 成功、失败、无数据都应视为“数据流程结束”，避免截图服务长期等待。
3. DOM、图片、CSS 背景图、字体和渲染帧稳定后调用 `markQQBotReady({ root })`。
   - 由工具函数等待资源后设置 `window.__READY__ = true`

`__DATA_READY__` 表示数据阶段完成，`__READY__` 表示截图阶段完成。截图服务当前主要等待 `__READY__`，但保留 `__DATA_READY__` 可以用于排查或扩展服务端等待逻辑。

## 奇遇珍券

奇遇珍券有卷轴动画，因此两个状态分开处理：

- `setQQBotDataReady(true)`: `getTreasureData()` 返回并完成数据写入后设置。
- `markQQBotReady()`: 卷轴动画结束，并等待图片、CSS 背景图、字体和渲染帧稳定后设置。

这样服务端不会在数据未完成时截图，也不会在卷轴和资源未稳定时提前截图。

## readyTicket

`readyTicket` 是工具内部的异步防串标记，不会暴露给服务器。

每次 `resetQQBotReady()` 都会递增 ticket。`markQQBotReady()` 开始等待资源时会记录当前 ticket，等待结束后再比较：

- 如果 ticket 没变，说明仍然是同一轮页面数据，可以设置 `__READY__ = true`。
- 如果 ticket 已变化，说明期间发生了新一轮请求、路由参数变化或组件重新加载，旧异步流程会被丢弃，不能再把当前页面误标为 ready。

这个机制用于避免旧页面的图片加载、定时器或异步回调晚到后，把新页面错误地触发截图。

## 开发日志

开发环境默认打印 `[QQBot Ready]` 日志：

- `reset`
- `data ready changed`
- `skipped stale ready state`
- `__READY__ = true`

可以通过环境变量覆盖：

```bash
VUE_APP_QQBOT_READY_LOG=true
VUE_APP_QQBOT_READY_LOG=false
```

生产环境默认不打印日志。

## 资源等待

`markQQBotReady()` 会等待：

- Vue 更新后的渲染帧
- `root` 下的 `img`
- `background-image`、`border-image-source`、`list-style-image` 中的 CSS 图片
- `document.fonts.ready`
- 最后的渲染帧稳定

默认最长等待 8 秒，避免单个资源异常导致截图服务永久挂起。

## 奇遇详情富文本

`/qqbot/pvx?type=adventure` 的前置条件、触发方式、流程和奖励来自百科富文本，并通过 `v-html` 注入 `AdventureSingle.vue` 的深色机器人卡片。

富文本可能携带编辑器写入的浅色内联背景，例如 `background-color: #fafbfc`。奇遇组件同时会将正文文字统一为白色，因此必须在 `.m-qqbot-pvx-adventure` 范围内清除这些富文本节点的内联背景，避免截图出现白底白字。

约束如下：

- 背景清理只能限定在 `.m-qqbot-pvx-adventure`。
- 只清理奖励区和正文区中带 `background` 内联样式的节点。
- 不修改接口返回或百科原始 HTML。
- 不使用全局 `p`、`div`、`.c-article` 等宽泛选择器。
- 其他 QQBot 类型必须保留各自的富文本展示规则。
