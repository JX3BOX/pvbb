# 奇遇珍卷布局数据规则

## 背景

QQBot 奇遇珍卷的绝世奇遇布局来自 `@jx3box/jx3box-data/data/serendipity/treasure_perfect.json`，运行时默认会请求：

`https://data.jx3box.com/data/serendipity/treasure_perfect.json`


## 当前规则

- 远程布局有效且包含本地包内所有绝世奇遇 id 时，以远程 `items` 顺序为准。
- 远程布局缺少本地包内的 id 时，视为远程可能落后或缓存未刷新，以本地包内 `items` 顺序补齐缺失项。
- 补齐时，同 id 的远程配置会覆盖本地配置，避免远程已有样式更新被本地旧配置挡住。
- 远程存在本地没有的额外 id 时会保留；远程完整时按远程顺序展示，远程缺本地项时额外 id 追加在补齐列表末尾。

## 层级规则

绝世奇遇图片层级不再读取 JSON 内的 `zIndex`。页面渲染时使用 `items` 数组索引生成 `z-index`，因此调整遮挡关系应调整 `treasure_perfect.json` 中 `perfect.items` 的顺序。

## 维护建议

布局源文件位于 `jx3box-data/data/serendipity/treasure_perfect.json`，随数据仓库同步至线上。

- 后续调整奇遇珍卷逻辑时，请先阅读本文件和项目根目录的 `AGENTS.md`（如果存在）。
