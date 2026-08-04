# 团队战绩模块说明

本文记录 PVBB 团队平台战绩模块当前确认的业务规则、前端入口、接口合同与已知边界。这里的“战绩”专指游戏插件上报的首领击杀赛事记录，不等同于 RAID 活动排表、团队快照或 DKP。

## 1. 业务定义

游戏内一支团队击杀首领并获得对应成就后，插件会自动上报一条赛事记录。赛事上报表是战绩模块的原始数据池，既包含百强赛事关注的指定首领，也可能包含平时击杀的非活动首领。

同一类上报记录按上报者身份和展示目标分为两个视图：

| 视图 | 产品含义 | 数据源 | 目标榜单 |
| --- | --- | --- | --- |
| 我的战绩 | 当前用户作为参战玩家上报的记录 | 由你上报的所有数据，不区分是否担任团长 | 门派天梯榜，展示个人成绩排名 |
| 战绩管理 | 归属当前团队的团队成绩候选记录 | 归属团队的所有团长上报数据 | 秘境百强榜，展示团队成绩排名 |

百强榜和门派天梯榜不是同一排名：

- **秘境百强榜**按团队成绩排名；玩家作为团长上报的记录才能归属为团队数据。
- **门派天梯榜**按个人成绩排名；团长和普通团员都可以作为个人参赛数据，不能用 `is_leader=0` 排除团长本人。

## 2. 入口、权限与文件

### 团员端

- 路由：`/team/my/org/:id?tab=battle`。
- 旧参数：`tab=history` 会被工作台规范化为 `tab=battle`。
- 页面：`src/views/team/org/ViewMyOrg.vue`。
- 列表：`src/views/team/battle/myBattle.vue`。
- 权限：已登录且属于当前团队的成员工作台。

### 管理端

- 路由：`/team/manage/org/:id?tab=manage-battle`。
- 页面：`src/views/team/org/ViewMyOrg.vue`。
- 列表：`src/views/team/battle/index.vue`。
- 权限：团队创始人或拥有 `r_race` 权限的管理员。

### 共享实现

- 战绩卡片：`src/views/team/battle/battleItem.vue`。
- 团队阵容展开项：`src/views/team/battle/teamItem.vue`。
- 关联弹窗：`src/views/team/battle/relevance.vue`。
- 前端服务：`src/service/team/battle.js`。
- 样式：`src/assets/css/team/battle/`。
- 回归测试：`tests/team-battle-management.test.mjs`、`tests/team-home.test.mjs`。

## 3. 数据接口

### 团员战绩

```http
GET /api/team/my-race-rank/records?pageIndex=:page&pageSize=10&team_id=:teamId
```

请求只限定当前团队，不发送 `is_leader=0`。接口应返回当前用户在该团队范围内上报的全部记录，无论用户在记录中是不是团长。

### 团队战绩管理

```http
GET /api/team/my-team/race-rank/records?team_id=:teamId
```

数据语义是归属当前团队的所有团长上报记录，供团队管理者关联战斗数据并进入秘境百强榜。

### 首领活动配置

```http
GET /api/cms/team/boss_aid?aids=:achievementIds&per=100
```

前端按赛事记录的 `achieve_id` 与配置的 `aid` 匹配并补充 `boss_info`，用于显示首领名称、图片、届数和活动类型。

### 可关联数据与提交

```http
GET /api/team/battle/my-list?type=tinymins&title=:title&pageIndex=:page
GET /api/team/battle/my-list?type=jcl&subject=team&title=:title&pageIndex=:page
POST /api/team/my-race-rank/records/item/:recordId/bind-battle
```

提交字段为：

```json
{
  "jx3box_battle_id": 123,
  "jx3box_jcl_id": 456
}
```

绑定的战斗统计和 JCL 用于榜单详情展示；提交成功文案仍表明该操作进入审核流程。

## 4. 活动数据筛选

团员端和管理端都有“只看活动数据”开关，使用同一个本地偏好：

```text
team:my-battle:ranking-only
```

当前前端判断为：

```js
item.boss_info?.is_rank_boss > 0 || Boolean(item.aid_info?.event_id)
```

字段含义：

- `boss_info.is_rank_boss === 0`：非赛事首领。
- `boss_info.is_rank_boss === 1`：正式赛事首领。
- `boss_info.is_rank_boss === 2`：预选赛首领。
- `aid_info.event_id`：历史赛事记录兼容；旧数据可能已无法从当前 CMS 配置补齐 `boss_info`。

因此，普通日常击杀记录会被过滤，当前或历史活动指定首领的记录会保留。

## 5. 榜单链接

### 门派天梯榜

团员端根据当前记录对应的届数以及上报角色的心法 ID 跳转：

```text
/rank/#/:eventId/dps?mount=:xfId
```

届数优先取 `boss_info.rank_id`，兼容 `aid_info.event_id`；心法 ID 从 `team_members` 中按 `item.role` 匹配角色名并读取 `XFId`。

### 秘境百强榜

管理端保持团队排名入口：

```text
/rank/#/:rankId/rank?aid=:aid
```

历史数据兼容 `aid_info.event_id` 与 `aid_info.achievement_id`。

## 6. 页面提示与展示

团员端：

- 主提示：绑定战斗数据，用于展示在门派天梯榜。
- 数据源：由你上报的所有数据。

管理端：

- 主提示：绑定战斗数据，用于展示在秘境百强榜。
- 数据源：归属团队的所有团长上报数据。

两边提示条不可关闭，并使用紧凑提示工具条：主说明、数据源和上报指南集中在左侧，活动筛选开关位于右侧；极窄屏下开关换行后保持左对齐，不居中占用大块纵向空间。战绩卡片统一展示首领、届数、成绩状态、团长、上报时间、上报来源、关联数据与关联操作。

## 7. 分页与后端待修边界

团员端分页使用接口返回的 `page.total`，切换页码后更新 `pageIndex` 并重新请求。前端已修复只滚动页面但未写入新页码的问题。

当前“只看活动数据”仍是对接口返回的当前页记录做前端筛选，因此存在以下边界：

- 分页总数仍是全部上报记录的总数，不是活动记录总数。
- 某一页可能没有活动记录，但后续页仍可能存在。
- 前端不能仅靠当前页过滤得到严格连续、总数准确的活动分页。

后端人员已在处理相关接口问题。服务端修复后，建议由接口提供活动首领筛选和对应的准确分页总数；在真实合同确认前，前端保留现有活动判断，不猜测新的请求参数。

## 8. 验证边界

- `tests/team-battle-management.test.mjs` 覆盖卡片布局、关联弹窗、个人查询参数、榜单链接、活动筛选、本地偏好和管理端筛选。
- `tests/team-home.test.mjs` 覆盖工作台页签命名与成员/管理模式边界。
- 静态测试与 `git diff --check` 不能证明真实 API、登录权限、审核流程或后端分页已经修复。
- 后端修复完成后，应使用登录态浏览器验证第二页请求参数、活动筛选连续性、总数和空页行为。
