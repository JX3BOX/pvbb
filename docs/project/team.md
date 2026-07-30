# 团队平台业务与代码结构

> 项目：`frontend/pvbb`
>
> 应用地址：`/team/`
>
> 整理日期：2026-07-31
>
> 文档性质：当前代码盘点与后续重构边界，不代表所有历史页面都已完成产品化

## 1. 业务定义

团队平台可以按以下 8 个核心业务域理解：

1. **档案**：创建团队，以及团队资料、认证、权限、公开范围、移交和删除等 CRUD。
2. **主页**：团队对外公开主页，聚合团队介绍、招募、荣誉、成员、DKP、视频、留言等子模块。
3. **角色与成员**：用户管理自己的游戏角色和入团关系；团队管理员审核申请、管理正式成员及其角色。
4. **视频**：团队战斗视频的新增、编辑、删除和公开展示。
5. **战绩**：团队或个人的百强战绩，并可关联具体战斗数据。
6. **快照**：记录某一时刻游戏内团队成员及相关数据，可用于对比和同步 DKP。
7. **DKP**：团队 DKP 初始化、同步、调整、日志、规则和个人 DKP 查询。
8. **排表**：创建 RAID 活动、安排正式/替补/候选成员、处理报名、排序及模板。

这套划分与当前代码大体一致，但当前实现不是 8 个完全隔离的应用模块：

- `/my/org/:id` 是当前统一的团队工作台，已经把档案、成员、视频、战绩、快照、DKP、排表按权限组合成页签。
- `/org/:id` 是团队对外主页，负责公开信息的聚合展示。
- `battle` 才是“战绩”；`raid` 才是当前真正的“排表/开团报名”。
- `plan` 名为“活动规划”，但目前主要是静态示例，不能视为已经可用的排表模块。
- `role` 管“我的游戏角色”；`member` 管“角色与团队的关系以及团队成员”，二者共同组成角色与成员业务。

## 2. 应用骨架

| 层级 | 文件 | 职责 |
| --- | --- | --- |
| 多页面构建入口 | `vue.config.js` | 将 `team` 构建为 `team/index.html` |
| Vue 入口 | `src/pages/team/index.js` | 安装 Router、Vuex、i18n、JX3BOX UI、Element Plus |
| 路由 | `src/pages/team/router.js` | 使用 `createWebHistory('/team')`，定义团队平台全部页面 |
| 应用外壳 | `src/pages/team/App.vue` | 公共头尾、登录拦截、旧版侧栏与现代团队工作台布局 |
| 状态 | `src/pages/team/store.js` | 客户端类型、当前团队、待审核数、DKP 编辑状态、RAID 成员状态 |
| 统一接口目录 | `src/service/team/` | `$team`、`$cms`、`$next` 三类服务调用 |
| 统一样式入口 | `src/assets/css/team/app.less` | 团队应用布局及现代工作台外壳 |
| 设计令牌 | `src/assets/css/team/design-system/_tokens.less` | 团队模块颜色、间距、圆角、阴影、动效 |

应用外壳把 `index`、`view_my_org`、`add_org` 视为现代工作区；其它历史路由仍使用面包屑和 `Nav2.vue` 旧侧栏。

## 3. 核心入口与两种视图

### 3.1 团队广场

- 路由：`/team/`、`/team/org/list`
- 页面：`src/views/team/org/ListOrg.vue`
- 列表组件：`src/components/team/org/team_list.vue`
- 个人工作区侧栏：`src/components/team/org/team_home_sidebar.vue`
- 接口：`GET /api/team/public`

负责公开团队搜索、服务器/标签/认证筛选和创建团队入口。左侧导航分为两组：发现区包含“团队广场 / 团队活动”；个人工作区包含“团队管理 / 我的团队 / 我的角色”。登录后分别加载可管理团队和已加入团队，“我的角色”外跳角色中心。

### 3.2 团队工作台

- 路由：`/team/my/org/:id?`
- 页面：`src/views/team/org/ViewMyOrg.vue`
- 身份参数：`mode=manage|member`
- 页签参数：`tab=...`
- 档案子区域：`section=basic|verify|permission|advanced`

管理视图按权限显示：

| 页签 | 权限字段 | 主要组件 |
| --- | --- | --- |
| 成员管理 | `r_member` 或团长 | `member/ListMember.vue` |
| 战绩管理 | `r_race` 或团长 | `battle/index.vue` |
| 视频管理 | `r_video` 或团长 | `org/ManageVideo.vue` |
| 快照管理 | `r_snapshot` 或团长 | `snapshot/ListSnapshot.vue` |
| DKP 管理 | `r_dkp` 或团长 | `dkp/ManageDkp.vue` |
| RAID 管理 | `r_raid` 或团长 | `raid/ManageRaid.vue` |
| 团队档案 | 仅团长 | 档案表单、认证、权限、高级设置 |

成员视图显示：我的角色、我的战绩、我的 DKP、参与的 RAID。

团队信息来自 `GET /api/team/info/:id`，管理权限来自 `GET /api/team/my-team/:id/manage/power-list`。团长通过 `team.super == 当前 uid` 获得完整管理能力。

### 3.3 团队公开主页

- 路由：`/team/org/:id`
- 页面：`src/views/team/org/ViewOrg.vue`

当前公开主页页签：

- 团队概况：简介、招募、勋章、团队成绩。
- 团队成员：受 `v_member` 公开级别与访问者权限控制。
- DKP 记录：受 `v_dkp` 控制。
- 通关视频。
- 留言板：受 `v_comment` 控制。

“团队快照”页签代码仍在，但目前已注释，不对外展示。

## 4. 八个业务模块复盘

### 4.1 档案

#### 职责

团队创建、基础资料、招募信息、联系方式、直播信息、内容公开范围、认证、管理员权限、高级设置、命名空间、移交和删除。

#### 路由

| 路由 | 页面 | 当前作用 |
| --- | --- | --- |
| `/org/add` | `org/AddOrg.vue` | 创建团队；普通账号默认限制 1 支，专业版可继续创建 |
| `/org/manage` | `org/ManageOrg.vue` | 历史团队管理列表 |
| `/org/edit/:id` | `org/EditOrg.vue` | 历史独立设置页 |
| `/org/verify/:id` | `org/VerifyOrg.vue` | 历史独立认证页 |
| `/my/org/:id?mode=manage&tab=setting` | `org/ViewMyOrg.vue` | 当前统一档案入口 |

#### 主要文件

- `components/team/org/teamform.vue`：创建和编辑共用的基础表单。
- `components/team/org/team_advanced_setting.vue`：高级功能组合。
- `views/team/org/EditOrgConfig.vue`：可见范围、快照密码、DKP 规则等配置。
- `views/team/org/EditPermission.vue`：管理员及权限分配。
- `views/team/org/EditNamespace.vue`：团队命名空间。
- `views/team/org/VerifyOrg.vue`：团队认证申请。
- `components/team/org/team_verify.vue`、`team_verify_logs.vue`：认证表单及记录。

#### 主要接口

- `POST /api/team/my-team`：创建。
- `PUT /api/team/my-team/:id`、`PATCH /api/team/my-team/:id`：更新。
- `DELETE /api/team/info/:id`：删除。
- `PUT /api/team/my-team/:id/transfer/to/user/:uid`：移交。
- `/api/team/my-team/:id/manage/admin...`：管理员 CRUD。
- `/api/cms/team/:id/verify`：认证申请与记录。
- `/api/cms/namespace/team`：团队命名空间。

#### 当前判断

业务能力较完整，但存在“统一工作台入口”和“历史独立设置路由”两套界面。后续优化应先以 `ViewMyOrg.vue` 的团队档案页签为主入口，再判断历史路由是保留兼容还是逐步收口。

### 4.2 主页

#### 职责

向访客展示一个团队的公开形象和可公开业务信息，不承担管理员 CRUD 主流程。

#### 主要文件

- `views/team/org/ViewOrg.vue`：公开主页容器。
- `components/team/org/team_info.vue`：Logo、名称、服务器、团长等头部信息。
- `components/team/org/team_intro.vue`：团队简介。
- `components/team/org/team_recruit.vue`：招募和标签。
- `components/team/org/team_medals.vue`：勋章。
- `components/team/org/team_trophy.vue`：成绩/荣誉。
- `views/team/member/ViewMember.vue`：公开成员视图。
- `views/team/dkp/ViewDkp.vue`：公开 DKP。
- `views/team/org/ViewVideo.vue`：公开视频。
- `views/team/org/ViewComment.vue`：留言板。

#### 当前判断

主页本质是模块聚合器。以后增加子模块时，应分别定义“是否公开、谁可见、数据为空时如何展示”，避免把管理功能直接塞进公开主页。

### 4.3 角色与成员

该业务需要区分三个对象：

1. **账号**：JX3BOX 用户。
2. **角色**：账号绑定或自建的游戏角色。
3. **团队成员关系**：某个角色申请/加入某个团队形成的关系。

#### 用户侧角色管理

| 路由 | 页面 | 功能 |
| --- | --- | --- |
| `/role/manage` | `role/ListRole.vue` | 角色列表、搜索、备注、星标、解绑、删除 |
| `/role/bind` | `role/BindRole.vue` | 获取绑定 Token、绑定角色 |
| `/role/add` | `role/AddRole.vue` | 创建自定义角色 |
| `/role/edit/:id` | `role/EditRole.vue` | 编辑自定义角色 |
| `/role/:id` | `role/ViewRole.vue` | 查看角色及其所属团队 |
| `/role/group` | `role/GroupRole.vue` | 按团队查看角色、设置公开、退出团队 |

角色接口集中在 `service/team/role.js`；角色入团关系集中在 `service/team/member.js`。

#### 团队管理员侧成员管理

- 当前入口：`/my/org/:id?mode=manage&tab=manage-member`。
- 容器：`views/team/member/ListMember.vue`。
- 正式团员：`UserList.vue` + `MemberItem.vue`，按账号查看并管理其角色。
- 加入申请：`PendingList.vue`，支持批准与拒绝。
- 权限：`r_member` 或团长。

关键接口包括：

- `GET /api/team/relation/:teamId/manage/user`：正式成员账号。
- `GET /api/team/relation/:teamId/manage/need-review-roles`：待审核角色。
- `PUT /api/team/relation/:teamId/manage/role/:roleId/review`：批准。
- `DELETE /api/team/relation/:teamId/manage/role/:roleId`：拒绝或移除角色。
- `DELETE /api/team/relation/:teamId/manage/user/:uid`：移除账号及其角色。
- `PUT .../remark`、`PUT .../star`：成员角色备注与星标。

#### 当前判断

你的理解准确，但建议模块名使用“角色与成员”，避免只叫“角色”后把管理员审核、成员账号和角色关系混在一起。当前全局“角色中心”链接已经指向 `/dashboard/role`，而仓库内仍保留一整套 `/role/*` 历史页面，后续需要确认两者的产品归属。

### 4.4 视频

#### 入口与文件

- 管理入口：工作台 `tab=video`，组件 `views/team/org/ManageVideo.vue`。
- 公开入口：团队主页“通关视频”，组件 `views/team/org/ViewVideo.vue`。

#### 接口

- `GET /api/team/video/team/:id`：公开视频列表。
- `GET /api/team/video/team/:id/all`：管理列表。
- `POST /api/team/video`：新增。
- `PUT /api/team/video/:id`：编辑。
- `DELETE /api/team/video/:id`：删除。

管理权限为 `r_video` 或团长。当前没有单独的视频顶层路由，管理和展示都嵌在团队上下文中，这与业务归属是合理的。

### 4.5 战绩

#### 入口与文件

- 团队战绩管理：工作台 `tab=manage-battle`，`views/team/battle/index.vue`。
- 我的战绩：工作台 `tab=history`，`views/team/battle/myBattle.vue`。
- 战绩项：`battleItem.vue`、`teamItem.vue`。
- 关联战斗数据：`relevance.vue`。
- 历史独立路由：`/battle`、`/myBattle`。

#### 接口

- `GET /api/team/my-team/race-rank/records`：我管理团队的百强战绩。
- `GET /api/team/my-race-rank/records`：个人百强战绩。
- `GET /api/team/battle/my-list`：可关联的战斗/JCL 数据。
- `POST /api/team/my-race-rank/records/item/:id/bind-battle`：绑定战斗数据。
- `GET /api/cms/team/boss_aid`：首领配置。

管理权限为 `r_race` 或团长。这里的“战绩”与公开主页中的 `team_trophy.vue` 有展示层关联，但不是 `raid` 排表。

### 4.6 快照

#### 入口与文件

- 管理入口：工作台 `tab=manage-snapshot`。
- 历史路由：`/snapshot/list`、`/snapshot/add`、`/snapshot/edit/:id`。
- 页面：`snapshot/ListSnapshot.vue`、`AddSnapshot.vue`。
- 组件：`snapshotList.vue`、`snapshotItem.vue`、`snapshotDetail.vue`、`snapshotBody.vue`、`snapshotRole.vue`、`snapshotStat.vue`、`snapshotChart.vue`。
- 高级设置：`snapshot/EditPassword.vue`。

#### 接口

- `GET /api/team/snapshot/team/:teamId`：快照列表。
- `POST /api/team/snapshot/team/:teamId`：新增。
- `GET /api/team/snapshot/record/:id`：详情。
- `PUT /api/team/snapshot/record/:id`：编辑。
- `DELETE /api/team/snapshot/record/:id`：删除。
- `GET /api/team/snapshot/team/:teamId/more`：按时间查看更多/统计。
- `POST /api/team/snapshot/record/:id/dkp`：将快照同步到 DKP。

管理权限为 `r_snapshot` 或团长。公开主页的快照页签目前已注释，因此当前可确认的是“管理能力存在”，不能说“访客可在主页查看快照”。

### 4.7 DKP

#### 入口与文件

- 团队管理：工作台 `tab=manage-dkp`，`views/team/dkp/ManageDkp.vue`。
- 个人查询：工作台 `tab=my-dkp`，`views/team/dkp/MyDkp.vue`。
- 公开查看：团队主页 `views/team/dkp/ViewDkp.vue`。
- 历史路由：`/dkp/manage`、`/dkp/my`。
- 核心组件：`dkp_list.vue`、`dkp_logs.vue`、`dkp_dialog.vue`、`Character.vue`、`drop_item.vue`。
- 规则：`views/team/dkp/EditDkpRule.vue`。

#### 能力

- 初始化与同步团队 DKP。
- 批量或单项增减分、编辑与删除记录。
- 查询团队总表、日志、个人分数和排名。
- 重置 DKP、配置 DKP 规则。
- 从快照同步成员/DKP 数据。

DKP 同时使用 Team API 和 CMS API；管理权限为 `r_dkp` 或团长，公开查看还受团队 `v_dkp` 设置控制。

### 4.8 排表（RAID）

#### 业务含义

当前代码中的 `raid` 是实际可用的团队排表和报名系统，覆盖活动 CRUD、模板、角色报名、正式/替补/候选名单、成员调整与排序。

#### 路由

| 路由 | 页面 | 功能 |
| --- | --- | --- |
| `/raid/add` | `raid/AddRaid.vue` | 创建排表 |
| `/raid/edit/:id` | `raid/EditRaid.vue` | 编辑排表 |
| `/raid/manage` | `raid/ManageRaid.vue` | 管理团队排表 |
| `/raid/my` | `raid/MyTeamRaid.vue` | 我报名的近期排表 |
| `/raid/list` | `raid/ListRaid.vue` | 公开活动大厅 |
| `/raid/:id` | `raid/ViewRaid.vue` | 排表详情与报名 |

工作台中同样嵌入：管理视图 `tab=manage-raid`，成员视图 `tab=my-raid`。

#### 主要组件

- `Raid.vue`、`RaidNormal_v1.vue`、`RaidNormal_v2.vue`：排表主体及版本布局。
- `RaidMemberSetting.vue`：成员安排。
- `RaidTobe.vue`、`RaidSub.vue`：候选和替补。
- `JoinPop.vue`、`MemberPop.vue`：报名和成员弹窗。
- `TemplateList.vue`：排表模板。
- `RaidItem.vue`、`RaidList.vue`、`ActivityItem.vue`：列表展示。

#### 接口边界

RAID 主数据位于 CMS：`/api/cms/team/raid...`；角色搜索来自 Team API。接口支持活动 CRUD、模板 CRUD、公开搜索、我的报名、置顶、退出，以及正式/替补/候选成员的新增、转换、拒绝、移除和排序。

管理权限为 `r_raid` 或团长。

#### 与 plan 的区别

`src/views/team/plan/` 当前包含 `/plan/add`、`/plan/edit/:id`、`/plan/list`、`/plan/:id/all` 等路由，但没有对应的 `service/team/plan.js`：

- `ListPlan.vue` 和 `AllPlan.vue` 中存在硬编码示例内容。
- `AddPlan.vue` 主要是本地表单结构，尚未形成完整持久化闭环。
- `ViewPlan.vue` 仍有 TODO。

因此当前产品语义应以 **RAID = 排表** 为准；`plan` 暂记为未完成的“活动规划”原型，不应与 RAID 并列宣传为已完成能力。

## 5. 辅助与历史模块

以下代码存在，但不属于上述 8 个核心域：

- `views/team/apply/`、`service/team/apply.js`：团队福利/活动申请，不是成员入团申请。
- `service/team/verify.js`：团队认证。
- `service/team/admin.js`：管理员和成员移除。
- `service/team/namespace.js`：团队命名空间。
- `service/team/qqbot.js`：QQ群机器人对团队活动的读取与修改。
- `service/team/server.js`：用户资料、公告、团队事件和 Banner 等辅助数据。
- `views/team/Index.vue`：旧团队首页/聚合页，当前 `/team/` 路由没有使用它。
- `components/team/Wrapper.vue`、`components/team/widget/Nav.vue`：历史外壳/导航，当前主外壳使用 `App.vue` 和 `Nav2.vue`。

这些文件不能仅凭“当前主入口未引用”就直接删除；删除前还要检查动态组件、其它多页面入口和线上旧链接。

## 6. 权限模型

当前权限不是简单的“团长/团员”二元判断：

- **访客**：浏览团队广场、公开团队主页、活动大厅和公开 RAID 详情。
- **登录用户/团员**：查看自己在团队中的角色、战绩、DKP 和已参与 RAID。
- **管理员**：由团队权限列表获得一个或多个业务权限。
- **团长**：`team.super == uid`，拥有全部管理页签，并独占团队档案设置。

主要权限字段：

| 字段 | 业务域 |
| --- | --- |
| `r_member` | 成员管理 |
| `r_race` | 战绩管理 |
| `r_video` | 视频管理 |
| `r_snapshot` | 快照管理 |
| `r_dkp` | DKP 管理 |
| `r_raid` | RAID/排表管理 |
| `r_plan` | 历史活动规划权限，当前统一工作台未使用 |
| `r_audit`、`r_drop` | 仍存在于数据结构，需结合服务端业务进一步确认 |

路由的 `meta.isPublic` 只负责第一层登录拦截；团队内具体操作还依赖接口权限和组件内判断，不能仅根据路由公开性推断业务授权。

## 7. 当前文件索引

```text
src/pages/team/
├── index.js                 # 应用入口
├── App.vue                  # 页面外壳、登录拦截、工作台布局
├── router.js                # 路由真值
└── store.js                 # 跨模块状态

src/views/team/
├── org/                     # 档案、公开主页、团队工作台、视频、留言
├── role/                    # 用户自己的游戏角色
├── member/                  # 团队成员关系、审核和管理
├── battle/                  # 团队/个人战绩
├── snapshot/                # 团队快照
├── dkp/                     # DKP
├── raid/                    # 排表、报名和活动大厅
├── plan/                    # 未完成的活动规划原型
└── apply/                   # 团队福利/活动申请

src/components/team/
├── org/                     # 团队资料与主页展示组件
├── member/                  # 入团弹窗等成员组件
├── role/                    # 角色表单
├── snapshot/                # 快照详情、统计与图表
├── dkp/                     # DKP 表格、日志和编辑弹窗
├── raid/                    # 排表主体、名单、模板和报名
├── plan/                    # 活动规划条目
└── widget/                  # 导航、头像、上传、物品等通用组件

src/service/team/
├── team.js                  # 团队资料、视频、权限入口
├── role.js                  # 用户角色 CRUD/绑定
├── member.js                # 入团关系与成员管理
├── admin.js                 # 管理员与强制移除
├── battle.js                # 战绩与战斗关联
├── snapshot.js              # 快照 CRUD
├── dkp.js                   # DKP
├── raid.js                  # RAID/排表
├── verify.js                # 团队认证
├── namespace.js             # 团队命名空间
├── apply.js                 # 福利活动申请
├── qqbot.js                 # QQ 机器人活动桥接
├── server.js                # 辅助 CMS 数据
└── item.js                  # 物品展示工具
```

## 8. 后续优化建议边界

1. 以“团队广场 → 团队公开主页 → 我的团队工作台”作为一级信息架构。
2. 工作台内部再按“成员视图 / 管理视图”区分身份，不为每个能力重复造一套团队选择页。
3. 档案只承担团队本体和权限设置；成员审核归角色与成员；各业务模块保留自己的数据 CRUD。
4. 对外主页只组合允许公开的模块；所有公开级别都以真实字段和接口合同为准。
5. 战绩统一使用 `battle` 术语，排表统一使用 `raid` 术语；产品文案可显示中文，但代码映射必须明确。
6. 在确认并迁移旧链接前，保留 `/org/manage`、`/org/edit/:id`、独立 `/battle`、`/dkp/*`、`/snapshot/*`、`/raid/*` 等历史路由。
7. `plan` 在补齐产品定义、接口和 CRUD 闭环前，标记为原型，不纳入核心可用功能。
8. 后续每次优化一个模块时，应同步核对：路由入口、工作台嵌入方式、服务接口、权限字段、公开主页展示和历史入口兼容。

## 9. 现有验证文件

- `tests/team-home.test.mjs`：团队首页、统一工作台、档案及 DKP 等结构约束。
- `tests/team-member-management.test.mjs`：正式成员和加入申请管理。
- `tests/team-battle-management.test.mjs`：战绩管理。
- `docs/design/TEAM_HOMEPAGE_DESIGN_GUIDE.md`：已落地的团队首页视觉与交互基线。

本文档是业务结构盘点。具体接口响应字段、服务端权限判定和线上兼容情况，在对应模块进入改造前仍需结合真实请求逐项验证。
