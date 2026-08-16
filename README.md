# 管理后台

GitHub：https://github.com/huasabrina8-dotcom/qq-admin-prototype

Standalone clickable prototype for **Juan365 Admin**. Dark sidebar + white forms. Chinese. Shared demo state: `localStorage` key `juan365_admin_v4`.

**项目名称：管理后台**（与萌宠乐园、抽奖需求、QRPH 返利分开，不混进其他仓库）。

**Out of scope for this repo:** C-end hall, H5. 抽奖前台仍在 [`qq-lottery-prototype`](../qq-lottery-prototype)；活动管理里的抽奖配置按该项目已定稿规则落地。

## Open / run locally

```bash
cd /Users/Admin/Projects/qq-admin-prototype
python3 -m http.server 8772
```

- 入口：http://localhost:8772/
- 后台（打开即进，无需登录）：http://localhost:8772/admin/index.html#/dashboard
- 活动管理：http://localhost:8772/admin/index.html#/activity

旧登录地址 `admin/login.html` 会跳到仪表盘。客服 / 财务 / 运营仍写在 PRD 权限规格里，原型不校验账号。

## Agent / product handoff

**给开发 / 测试宣讲：** [`docs/管理后台-开发测试宣讲需求.md`](./docs/管理后台-开发测试宣讲需求.md)  
New Cursor agents: see [`AGENTS.md`](./AGENTS.md).

截图到达后按线上 1:1 校正子菜单与字段。一级菜单截图锁定 7 项；UAT getInfo 已把「更多记录」校正为「投注记录」，并补齐超管其余一级。各页列见 `docs/管理后台-开发测试宣讲需求.md` 第 2.21 节。

## Layout

```
qq-admin-prototype/
  admin/          # 登录 + SPA 后台
  docs/           # 六段 PRD
  README.md
  AGENTS.md
```
