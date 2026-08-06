# 移动宿主页面规则

本文记录 PVBB 对普通移动网页、小程序 WebView 和 App WebView 的长期维护约束。

## 核心规则

公共头可能向页面添加 `.v-miniprogram`、`.wechat-miniprogram` 或后续同类宿主标识。PVBB 项目本地不根据这些 class：

- 切换到单独的 Vue 页面；
- 隐藏或替换业务功能；
- 修改公共头、面包屑、主内容或侧栏的定位；
- 修改登录、发布、跳转等业务链接。

普通移动网页、小程序和 App WebView 应使用同一套路由组件与业务结构。移动端差异通过响应式断点解决；确有业务差异时，应使用明确的业务路由或组件属性，不使用宿主 class。

## 历史文件

以下文件属于旧小程序 UI，当前保留但不应重新接入普通路由：

- `src/views/Namespace-mobile.vue`
- `src/views/Joke/Joke-mobile.vue`
- `src/views/emotion/Emotion-mobile.vue`
- `src/components/collection/collection_mini_list.vue`
- `src/components/collection/collection_mini_single.vue`
- `src/assets/css/miniprogram.less`
- `src/assets/css/team/miniprogram.less`

保留文件不代表允许继续引用。后续排查包体时，应确认这些文件没有被静态 import、动态 import 或入口 Less 引用。

## 移动分页

茶馆、骚话、趣图、小册和铭牌的列表分页共用 `src/mixins/responsive-pagination.js`：

- 移动断点为 `max-width: 560px`；
- 移动端 `pager-count` 为 `5`；
- 桌面端 `pager-count` 为 `7`；
- 移动端不展示总数、跳页和每页数量选择；
- 分页保持居中，不以横向滚动作为默认降级方案。

新增同类列表时优先复用该 mixin 和现有视觉尺寸，避免在页面中重新注册 `matchMedia` 监听。

## 排查清单

修改路由或公共布局后至少检查：

1. 全项目是否重新出现 `isMiniProgram()`、`isApp()` 页面分流。
2. 入口是否重新导入 `miniprogram.less`。
3. 是否新增 `.v-miniprogram`、`.wechat-miniprogram` 专用规则。
4. 旧移动 Vue 是否重新进入构建依赖图。
5. 400px 左右视口下顶部固定区域和分页是否被遮挡。

