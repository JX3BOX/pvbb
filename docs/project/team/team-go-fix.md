# 团队模块 Go 后端修复汇总

本文档汇总团队模块中已定位并于 2026-08-02 完成代码修复的 Go Team 服务问题，同时保留根因、修复方案和回归证据，供部署验证与后续维护使用。

## 当前状态

| 问题 | 状态 | 后端提交 |
| --- | --- | --- |
| 正式成员漏掉已通过的自定义角色、成员管理 GET 权限和审核参数校验 | 已修复，待部署环境验证 | `195ff1ad` |
| `r_video` 管理员无法管理视频、PUT 可伪造团队归属 | 已修复，待部署环境验证 | `7f31dc67` |

代码已完成定向 Go 测试和 `git diff --check`。本文中的“旧逻辑”“建议修改”用于解释修复前状态；不能据此判断线上已经部署。

- [团队正式成员漏掉已通过自定义角色](#团队正式成员漏掉已通过自定义角色go-后端修复说明)
- [团队视频管理 `r_video` 权限后端修复](#团队视频管理-r_video-权限后端修复说明)

---

# 团队正式成员漏掉已通过自定义角色：Go 后端修复说明

## 结论

这个问题已在 Go 团队后端修复，不是前端列表刷新问题。

- 前端仓库：`/Users/iruxu/Desktop/jx3box/frontend/pvbb`
- 实际后端仓库：`/Users/iruxu/Desktop/jx3box/backend/jx3box-team`
- 不涉及：`/Users/iruxu/Desktop/jx3box/backend/service-cms`
- 后端目标文件：`server/database/model/teamrelation.go`
- 后端目标函数：`GetUserListInTeam`

本说明只处理“审核已经成功，但自定义角色没有出现在正式成员中”的问题。权限中间件等其它团队管理问题建议单独提交。

## 问题现象

管理页面：

```text
http://localhost:12028/team/manage/org/3944
```

测试账号为 UID 8，是团队 3944 的非创始人管理员，并且实时权限数据中 `r_member=1`。

管理员批准角色后：

1. 角色从“加入申请”中消失；
2. 审核关系已经成功更新为正式状态；
3. 但“正式团员”中的账号卡片没有显示这个角色，角色数量也没有增加。

这不是成员接口缓存，也不是前端没有重新请求。前端切换到“正式团员”时会重新创建 `UserList` 并重新请求：

```http
GET /api/team/relation/3944/manage/user?pageIndex=1&pageSize=20
```

## 实时复现数据

本次实际批准的是下面这个角色：

```text
团队 ID：3944
账号 UID：8
relation ID：34158
role ID：8811
角色名：测试
relation.status：1
relation.assessor：8
relation.updated_at：2026-08-01 07:15:39 +08:00
role.custom：1
role.status：0
```

由此可以确认：

- 审核请求确实成功落库；
- 审核关系已经是正式状态 `relation.status=1`；
- 该角色是一个历史自定义角色，状态组合为 `custom=1、status=0`；
- `/manage/role-list` 能返回这个已通过角色；
- `/manage/user` 只返回 UID 8 原有的普通角色，没有返回 role ID 8811。

## 根因

团队系统已有的有效角色规则是：

```sql
team_roles.status = 1 OR team_roles.custom = 1
```

也就是说：

- 正常角色要求 `status=1`；
- 自定义角色只要 `custom=1` 就是团队系统允许使用的角色，即使它是历史数据且 `status=0`。

`GetRolesInTeamWithPager` 和 `SearchRoleInTeam` 已经采用了这个规则，但 `GetUserListInTeam` 的两段查询仍然只判断：

```sql
team_roles.status = 1
```

因此产生了不一致：

1. 自定义角色可以发起加入申请；
2. 管理员可以正常批准；
3. relation 会被更新为 `status=1`；
4. 正式成员接口又因为 `role.status=0` 把它过滤掉。

## 已实施的修改方案

在 `server/database/model/teamrelation.go` 的 `GetUserListInTeam` 中修改两处查询条件。

### 1. 修正正式成员 UID 候选查询

当前查询只接受 `r.status=1`，并且旧版本还可能遗漏 `tre.status=1`。

最终条件应为：

```go
sql := `
    SELECT distinct tre.uid from team_relation tre
        LEFT JOIN team_roles r ON tre.role_id = r.ID
    WHERE tre.team_id = ?
        AND tre.status = 1
        AND tre.has_deleted = 0
        AND tre.uid != 0
        AND (r.status = 1 OR r.custom = 1)
`
```

这里必须同时包含：

- `tre.status = 1`：只有审核通过的关系才能进入正式成员；
- `tre.has_deleted = 0`：排除已删除关系；
- `tre.uid != 0`：账号式成员列表不能把所有未绑定账号角色聚合成同一个 UID 0；
- `(r.status = 1 OR r.custom = 1)`：允许有效普通角色和有效自定义角色。

### 2. 修正成员角色明细查询

找到 `GetUserListInTeam` 中查询 `team_relation` 与 `team_roles` 明细的第二段查询，将：

```go
Where("team_relation.status = 1 and team_relation.team_id = ? and team_relation.has_deleted = 0 and team_roles.status = 1", teamId)
```

修改为：

```go
Where(
    "team_relation.status = 1 and team_relation.team_id = ? and team_relation.has_deleted = 0 and (team_roles.status = 1 or team_roles.custom = 1)",
    teamId,
)
```

两处必须一起修改：

- 第一处决定哪些 UID 能进入分页结果；
- 第二处决定每个 UID 的 `roles[]` 中实际返回哪些角色。

只修改其中一处，仍然可能出现账号存在但角色缺失，或者自定义角色所属账号根本不进入列表。

## 不要采用的修法

### 不要直接删除 `tre.uid != 0`

游戏内加入团队的角色可能没有绑定魔盒账号，此时 `team_relation.uid=0`。

正式成员接口当前按 UID 聚合。如果直接允许 UID 0，多个完全不同的未绑定角色会被错误地聚合成同一个“UID 0 成员”。如果产品以后要求展示未绑定账号角色，应当：

- 单独增加“未绑定账号角色”分组；或
- 使用角色级列表 `/manage/role-list` 单独展示；或
- 修改返回结构，为 UID 0 的每个角色生成独立条目。

这不属于本次修复范围。

### 不要把 `role.status=0` 全部放开

只有 `custom=1` 的自定义角色可以在 `status=0` 时继续被团队系统识别。普通角色仍然必须满足 `status=1`，否则已经解绑或失效的普通角色会重新进入正式名单。

所以必须使用带括号的条件：

```sql
(role.status = 1 OR role.custom = 1)
```

## 部署后的预期结果

本次角色 8811 和原正式角色都属于 UID 8，因此修复后不会新增第二张成员卡片，也不会把正式成员人数从 1 改为 2。

正确结果应为：

```text
正式成员人数：1
成员账号：浮烟（UID 8）
角色数量：由 1 变为 2
成员弹窗：可以看到原角色和刚批准的“测试”角色
```

“正式团员”页面是按网站账号聚合，不是每个游戏角色单独一张卡片。

## 建议回归测试

如果后端测试环境能够提供数据库 fixture，建议至少覆盖以下数据：

1. `relation.status=1、role.status=1、role.custom=0`：应返回；
2. `relation.status=1、role.status=0、role.custom=1`：应返回；
3. `relation.status=0、role.custom=1`：不应进入正式成员；
4. `relation.status=1、role.status=0、role.custom=0`：不应返回；
5. `relation.has_deleted=1`：不应返回；
6. 同一 UID 有一个普通角色和一个自定义角色：成员数为 1，`roles` 长度为 2；
7. `uid=0` 的角色：不应进入当前账号式正式成员列表。

重点回归样例：

```text
team_id=3944
uid=8
normal role: status=1, custom=0
custom role: status=0, custom=1
两条 relation 均为 status=1、has_deleted=0
```

调用 `GetUserListInTeam(3944, pager)` 后，应得到一个 UID 8 成员，并包含两个角色。

## 验证命令

在 Go 后端仓库执行：

```bash
cd /Users/iruxu/Desktop/jx3box/backend/jx3box-team

gofmt -w server/database/model/teamrelation.go

go test ./server ./server/controller/teamrelation ./server/database/model -count=1

git diff --check
```

部署到 dev 团队服务后，再使用 UID 8 登录并验证：

```http
GET /api/team/relation/3944/manage/user?pageIndex=1&pageSize=20
```

预期 UID 8 的 `roles[]` 同时包含：

```text
role_id=8435  原正式角色
role_id=8811  已批准的自定义角色“测试”
```

## 已完成与后续加固项

本次提交已增加审核 action 合法范围和成员星级 0～5 校验，并把成员管理 GET 路由切换为严格权限中间件。以下数据库更新语义仍可后续独立加固：

- 更新时限定旧状态必须是待审核 `status=0`；
- 检查数据库 `RowsAffected`；
- team ID 或 role ID 不匹配、记录不存在、记录已处理时返回明确业务错误；
- 避免更新 0 行仍向前端返回“操作成功”。

这些不是本次 role 8811 漏显的根因；实时数据已经确认它确实被更新为 `status=1`，不要与查询条件修复混为同一个故障。

---

# 团队视频管理 `r_video` 权限后端修复说明

## 1. 结论

这个问题已在 Go 后端修复。

前端已经能正确识别“团队创始人”或拥有 `r_video = 1` 的团队管理员，并展示视频管理、上传、编辑和删除入口；但旧版 Team 后端仍把部分视频管理接口限制为团队创始人，所以普通管理员进入页面后，请求完整视频列表会失败。

实际修改的服务是：

- 仓库：`JX3BOX/jx3box-team`
- 本地常见路径：`/Users/iruxu/Desktop/jx3box/backend/jx3box-team`
- 主要目录：`server/controller/teamvideos`

不要在 `service-cms` 中实现这次修复。`service-cms` 没有 `/api/team/video` 这组 CRUD 路由，前端的 `$team()` 请求实际发往 Team 服务。

这次不需要数据库迁移。`team_admins.r_video`、`schema.AdminPowerVideo` 和现有权限查询能力都已经存在。

## 2. 问题现象

复现场景：

- 页面：`/team/manage/org/3944?tab=video`
- 当前用户是团队 3944 的管理员，但不是创始人。
- 权限接口返回该用户 `r_video = 1`。
- 前端因此展示“视频管理”和“添加通关视频”。
- 前端请求管理列表：

```text
GET /api/team/video/team/3944/all?pageIndex=1&pageSize=16
```

- 旧后端返回 HTTP 200，但业务结果为无权限，例如：

```json
{
  "code": 510,
  "msg": "没有权限操作"
}
```

前端已单独增加 Promise 错误处理，业务错误不会再升级成 webpack 的 `[object Object]` 运行时遮罩；但这只是页面容错，不能替代后端权限修复。

## 3. 期望业务规则

团队视频管理权限应统一为：

1. 团队创始人可以管理本团队视频。
2. 本团队 `r_video = 1` 的管理员可以管理本团队视频。
3. `r_video = 0` 的管理员、普通成员和非本团队用户不能管理视频。
4. 系统管理组 `group >= 128` 与现有写接口策略统一，允许访问完整列表和执行管理操作。
5. 任何人都不能通过伪造请求体中的 `team_id` 修改其它团队的视频。

这里的“管理”包括：

- 查看包含待审核、审核通过、驳回等状态的完整列表；
- 上传视频；
- 编辑视频；
- 删除视频。

公开视频列表不属于管理接口，仍然只返回审核通过的数据，不应扩大其数据范围。

## 4. 相关接口

路由定义位于 `server/app.go` 的 `/api/team/video` 路由组。

| 接口 | 用途 | 应有权限 |
| --- | --- | --- |
| `GET /api/team/video/team/{id}` | 公开列表，只返回已审核视频 | 保持公开，不修改 |
| `GET /api/team/video/team/{id}/all` | 团队完整管理列表 | 创始人、`r_video=1`、系统管理组 |
| `POST /api/team/video` | 上传视频 | 按请求中的目标团队校验管理权限 |
| `PUT /api/team/video/{id}` | 编辑视频 | 必须按数据库中该视频真实所属团队校验 |
| `DELETE /api/team/video/{id}` | 删除视频 | 必须按数据库中该视频真实所属团队校验 |

现有 POST、PUT、DELETE 路由已经使用：

```go
teamvideos.ReadTeamVideoData,
teamvideos.TeamVideoPoliceCheck(128, []teamSchema.AdminPower{
    teamSchema.AdminPowerVideo,
})
```

主要问题在完整列表和 PUT 的额外逻辑。

## 5. 根因一：完整列表只认创始人

文件：`server/controller/teamvideos/curd.go`

旧逻辑在 `fields == "all_by_team"` 时只调用：

```go
common.IsMyTeam(jwt.ID, id)
```

`common.IsMyTeam` 实际比较的是 `team.Super == userId`，所以它表达的是“是否为团队创始人”，不是“是否拥有团队管理权限”。因此 `r_video = 1` 的普通管理员会被拒绝。

### 已实施修改

在 `curd.go` 中引入：

```go
import "github.com/JX3BOX/jx3box-team/server/controller/teamadmin"
```

把完整列表的权限判断改成“系统管理组、创始人、`r_video` 管理员三者任一通过”：

```go
} else if fields == "all_by_team" {
    if jwt.Group < 128 && !common.IsMyTeam(jwt.ID, id) {
        if errMsg := teamadmin.HasPowerInTeamCheck(jwt.ID, id, []schema.AdminPower{
            schema.AdminPowerVideo,
        }); errMsg != nil {
            c.Ok(errMsg)
            return
        }
    }

    status := ctx.URLParamIntDefault("status", -1)
    list, err = model.TeamVideos.GetByTeamIdWithStatus(id, status, pager)
}
```

注意：

- `/all` 路由必须继续保留 `common.MustLogin`。
- 不要把公开的 `GET /team/{id}` 改成返回全部审核状态。
- 不要只判断“是不是管理员”，必须明确检查 `AdminPowerVideo`。

## 6. 根因二：PUT 同时存在错误限制和越权风险

文件：

- `server/controller/teamvideos/police.go`
- `server/controller/teamvideos/curd.go`

旧 PUT 流程存在两个问题：

1. `ReadTeamVideoData` 从请求 JSON 读取 `team_id`，权限中间件会基于这个客户端可控字段鉴权。
2. `Update` 控制器又读取旧视频，并额外调用 `common.IsMyTeam`，只允许创始人更新。

如果只是删除第二层创始人限制，而不处理第一个问题，会产生跨团队越权：攻击者可以把请求体的 `team_id` 写成自己有权限的团队，同时用路径参数指定其它团队的视频 ID。

### 正确修复顺序

PUT 必须先通过路径中的视频 ID 查询数据库，再用持久化记录中的 `team_id` 覆盖请求体字段，然后才进入 `TeamVideoPoliceCheck`。

在 `ReadTeamVideoData` 读取 JSON 后增加：

```go
if ctx.Method() == http.MethodPut {
    id, _ := ctx.Params().GetUint64("id")
    stored, err := model.TeamVideos.Get(id)
    if err != nil {
        log.Println(err)
        ctx.JSON(rcode.CommonDBErrorMsg)
        return
    }
    if stored.ID == 0 {
        ctx.JSON(rcode.CommonNoFoundMsg)
        return
    }

    // 请求体中的 team_id 不可信，权限必须以持久化归属为准。
    data.TeamID = stored.TeamID
}

data.Status = 0
ctx.Values().Set(ContentKey, data)
ctx.Next()
```

也可以抽成一个小函数，方便单测：

```go
func keepStoredVideoTeam(data schema.TeamVideos, stored schema.TeamVideos) schema.TeamVideos {
    data.TeamID = stored.TeamID
    return data
}
```

完成上述处理后，删除 `curd.go` 的 `Update` 中那段只允许创始人的重复判断，让路由已有的 `TeamVideoPoliceCheck` 成为统一权限入口：

```go
func Update(ctx iris.Context) {
    id, _ := ctx.Params().GetUint64("id")
    data := ctx.Values().Get(ContentKey).(schema.TeamVideos)
    data.ID = id

    if err := model.TeamVideos.Update(&data); err != nil {
        log.Println(err)
        ctx.JSON(rcode.CommonDBError)
        return
    }
    ctx.JSON(rcode.Msg{Code: rcode.Success})
}
```

不要反过来先放宽 `Update`、以后再补真实团队归属校验；这两个修改必须作为同一个安全修复提交。

## 7. POST 和 DELETE 的处理

### POST

POST 创建的是新视频，没有持久化归属，因此只能按请求体中的 `team_id` 校验。现有 `TeamVideoPoliceCheck(...AdminPowerVideo)` 可以继续使用。

仍需保证：

- `team_id` 不能为空；
- 当前用户是该团队创始人，或拥有该团队 `r_video = 1`；
- 无权限时不写入数据。

### DELETE

DELETE 当前会先按路径 ID 读取视频，再将持久化视频放入 Context，之后才执行 `TeamVideoPoliceCheck`。这个方向是正确的，应保留。

可以顺带确认不存在“删除前使用请求体 team_id”的旁路。

## 8. 必须覆盖的测试

建议在 `apptest/teamvideo_test.go` 增加完整权限合同测试，并在 `server/controller/teamvideos` 下为纯函数补单测。

至少覆盖以下场景：

### 成功场景

1. 创始人请求 `/team/{id}/all` 成功。
2. `r_video = 1` 管理员请求 `/team/{id}/all` 成功。
3. `r_video = 1` 管理员 POST 上传成功。
4. `r_video = 1` 管理员 PUT 编辑本团队视频成功。
5. PUT 请求体即使传 `team_id = 0`，仍按视频真实团队鉴权并成功更新。
6. `r_video = 1` 管理员 DELETE 本团队视频成功。
7. `group >= 128` 保持可管理。

### 拒绝场景

1. `r_video = 0` 管理员访问完整列表失败。
2. `r_video = 0` 管理员 POST、PUT、DELETE 均失败。
3. 普通成员和非团队用户均失败。
4. 用户拥有团队 A 的 `r_video = 1`，但尝试更新团队 B 的视频：
   - 路径 ID 使用团队 B 的视频；
   - 请求体伪造为 `team_id = 团队A`；
   - 必须拒绝，并且团队 B 的视频不得发生变化。
5. PUT 或 DELETE 不存在的视频 ID，应返回未找到，而不是继续鉴权或更新。

### 公开接口回归

1. `GET /team/{id}` 仍然只返回 `status = 1` 的公开视频。
2. 未登录用户不能访问 `/team/{id}/all`。
3. 无权限用户不能借助 `status` 查询参数读取待审核或驳回视频。

## 9. 验证命令

根据后端仓库当前测试环境执行：

```bash
gofmt -w server/controller/teamvideos/curd.go \
    server/controller/teamvideos/police.go \
    server/controller/teamvideos/police_test.go \
    apptest/teamvideo_test.go

go test ./server/controller/teamvideos
go vet ./server/controller/teamvideos
go test ./apptest
git diff --check
```

如果 `apptest` 依赖本地数据库、`conf/config.dev.yml`、子模块或被 `.gitignore` 忽略的 `apptest/a.log`，不要为了让测试表面通过而提交本地密钥或环境文件。应补齐本地测试环境后执行，或者至少运行 `go test -c ./apptest` 验证编译，并在交付说明中明确哪些集成场景尚未实际运行。

## 10. 部署后验收

后端代码合并并部署到前端 `$team()` 实际指向的开发环境后，用拥有团队 3944 `r_video = 1` 的非创始人账号验证：

```text
GET /api/team/video/team/3944/all?pageIndex=1&pageSize=16
```

预期返回：

```json
{
  "code": 0,
  "data": {
    "list": [],
    "page": {}
  }
}
```

`list` 可以为空，但不能再返回 510/权限拒绝。

随后依次验证：

1. 打开视频管理页能加载完整列表。
2. 上传一条视频后，待审核记录能出现在管理列表中。
3. 管理员可以编辑该视频，更新后状态按既有规则回到待审核。
4. 管理员可以删除该视频。
5. 去掉管理员的 `r_video` 权限后，上述管理接口全部拒绝。
6. 公开团队页仍然看不到待审核或驳回记录。

只有部署包含 `195ff1ad`、`7f31dc67` 的 Team 后端后，前端页面上的 `[510]没有权限操作` 和成员漏显才会真正消失；只重启或重新构建前端不会改变后端结果。

## 11. 可直接交给后端 Codex 的任务描述

```text
请在 JX3BOX/jx3box-team 修复团队视频管理的 r_video 权限合同。
只实现本节的视频权限修复，不要顺带处理本文档前一节的成员角色问题，二者应分开提交。

现状：团队非创始人管理员已有 team_admins.r_video=1，前端会请求
GET /api/team/video/team/{teamId}/all，但旧后端仍返回无权限；PUT 还存在
只允许创始人的重复限制。

要求：
1. GET /video/team/{id}/all 允许 group>=128、团队创始人或本团队
   r_video=1 管理员访问；其它用户拒绝。
2. POST/PUT/DELETE 均允许团队创始人或本团队 r_video=1 管理员。
3. PUT 必须先按路径 video id 读取持久化视频，并使用其真实 team_id 鉴权；
   绝不能信任请求体 team_id，必须防止“有团队A权限、伪造 team_id 修改团队B视频”。
4. 删除 Update 控制器中仅允许创始人的重复判断，但只能在 PUT 已改成按持久化
   team_id 鉴权后删除。
5. 不修改公开 GET /video/team/{id} 的数据范围，不把待审核视频公开。
6. 不需要数据库迁移，复用 schema.AdminPowerVideo 和
   teamadmin.HasPowerInTeamCheck。
7. 增加创始人、r_video=1、r_video=0、非团队用户、group>=128、跨团队伪造
   team_id、未找到视频以及公开列表回归测试。
8. 运行 gofmt、controller 单测、go vet、apptest 和 git diff --check，并明确任何
   因本地配置或数据库而无法运行的集成测试。

实际接口属于 jx3box-team，不要改 service-cms。
```
