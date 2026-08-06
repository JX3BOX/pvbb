# 社区与移动端 2026-08-06 变更记录

本文记录 PVBB 在 2026-08-06 对普通网页、小程序/App WebView 共用页面、列表分页及 QQBot 奇遇展示所做的集中调整。长期宿主兼容规则见 [移动宿主页面规则](../../agents/mobile-host-pages.md)，QQBot 截图状态与富文本约束见 [QQBOT_READY.md](../../design/QQBOT_READY.md)。

## 1. 小程序与 App 页面统一

公共头仍可为页面添加 `.v-miniprogram`、`.wechat-miniprogram` 等宿主标识，PVBB 不修改公共头实现。但项目本地不再根据这些标识切换业务页面、链接或布局。

路由统一加载普通页面：

- `/namespace` 始终加载 `views/Namespace.vue`。
- `/joke/:id?` 始终加载 `views/Joke/Joke.vue`。
- `/emotion/:id?` 始终加载 `views/emotion/Emotion.vue`。
- `/collection/:id` 始终加载普通 `collection_single.vue`。
- 收藏列表不再引入或展示 `collection_mini_list.vue`、`collection_mini_single.vue`。

旧的 `Namespace-mobile.vue`、`Joke-mobile.vue`、`Emotion-mobile.vue`、收藏小程序组件和 `miniprogram.less` 文件继续保留，作为历史实现，不进入当前入口依赖图。

主入口和团队入口不再导入 `.v-miniprogram` 专用 Less。项目内 `.wechat-miniprogram` 专用规则也已移除，包括顶部间距、面包屑定位、侧栏偏移以及按宿主隐藏编辑器、评论或发布区的逻辑。窄屏适配统一由媒体查询和业务页面自身完成。

## 2. 五个列表的移动端分页

茶馆、骚话、趣图、小册和铭牌统一使用 `src/mixins/responsive-pagination.js` 判断 `560px` 移动端断点。

移动端分页合同：

- 页码段使用 Element Plus 允许的最小值 `5`，桌面端保持 `7`。
- 隐藏总数、跳页输入框和每页数量选择，只保留上一页、页码、下一页。
- 使用默认尺寸分页控件；前后翻页和页码最小宽度为 `32px`。
- 分页最大宽度为 `320px`，居中显示，不使用横向滚动承载被裁切内容。
- 茶馆、骚话和趣图的“加载更多”按钮最大宽度同步为 `320px`，移动端高度为 `32px`。
- 小册和铭牌没有“加载更多”，只执行统一分页规则。

桌面端仍显示完整分页信息，不受移动端精简规则影响。

## 3. 骚话列表

- `ListLayout` 在 `joke` 路由下不再渲染公共 `PublishGate`。骚话页面已有快速发布框，避免出现重复发布入口；该判断按业务路由执行，不依赖小程序宿主 class。
- 桌面端批量操作“全选 / 设为精选”与加载按钮保留明确间距，并放在加载按钮同一行靠上位置。
- 桌面端分页主体居中；总数固定在分页行左侧，不参与居中计算。
- 移动端批量编辑区按既有平板断点隐藏，分页使用统一移动规则。

## 4. QQBot 奇遇富文本

`/qqbot/pvx?type=adventure` 会将百科内容通过 `v-html` 放入深色机器人卡片。新版富文本可能在 `p` 等节点中携带 `background-color: #fafbfc`，而组件会将文字强制为白色，从而产生白底白字。

修复只作用于 `.m-qqbot-pvx-adventure`：

- 在奖励和正文容器中查找带有 `background` 内联样式的富文本节点。
- 将其背景强制改为透明，保留组件的白色正文和黄色奖励文字。
- 不修改百科原始内容，不影响其他 QQBot 类型或站内百科正文。

## 5. 验证

- 多次执行 `npm run build:prod` 均构建成功。
- 相关 Vue 文件通过 ESLint，变更通过 `git diff --check`。
- 构建仍有项目既存的 CSS 顺序和包体积警告，本次没有新增构建错误。
- QQBot 奇遇页通过实际 DOM 计算样式验证：带背景内联样式的 10 个节点均计算为透明背景，文字颜色保持白色或黄色。

