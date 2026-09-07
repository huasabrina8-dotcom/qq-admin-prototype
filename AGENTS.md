# Agent instructions — 管理后台

This folder is the **Juan365 管理后台** clickable prototype. It is **not** 萌宠乐园, **not** 抽奖需求, **not** QRPH 返利.

**需求文档规范：** 本项目需求文档一律按 [`/Users/Admin/Projects/docs/产品文档规范要求.md`](/Users/Admin/Projects/docs/产品文档规范要求.md) 的六段结构编写（背景目标 / 功能 / 流程 / 异常 / 验收 / 风险）。完整 PRD：[`docs/管理后台-开发测试宣讲需求.md`](./docs/管理后台-开发测试宣讲需求.md)。

- Do **not** add this into `qq-pet-vip-prototype` / `qq-lottery-prototype` / `qq-qrph-rebate-prototype`.
- Visual: dark sidebar + white Ant-like forms, **Chinese**.
- Data: `localStorage` key `juan365_admin_v4`（`catalogVer=5` 重刷目录占位行）。Demo only — **no real money, no real APIs**.
- 列表必须用真实感虚拟数据（`AdminStore.demoValue`），禁止「字段 A/B/C」。新页面同样自动填。
- Prototype **skips login**: open `admin/index.html` to see the full admin. `login.html` only redirects. Role matrix in the PRD is the formal permission spec.
- Push to GitHub **only** when the user says **定稿**.

## Where to edit

| Surface | Path |
|---------|------|
| 登录 | `admin/login.html` |
| 后台 SPA | `admin/index.html` + `admin/js/*.js` |
| 样式 | `admin/css/admin.css` |
| 演示数据 / 权限 | `admin/js/store.js` |
| 页面渲染 | `admin/js/pages.js` |

Serve from **project root**: `python3 -m http.server 8769`.

## Hard rules

1. 对照 Juan365 线上后台。用户提供的截图优先于本仓库占位子菜单。
2. 一级菜单截图锁定（不得删原文）：会员管理、更多记录、充值提款、资金操作、平台游戏、优惠活动、报表管理。点 Logo「JUAN」进仪表盘。会员管理子菜单锁定 11 项（会员中心 … 用户分层）。**2026-08-16 UAT getInfo 校正：** 截图「更多记录」= 线上「投注记录」；超管另可见任务系统、联盟管理、综合报告、渠道管理、信息配置、平台配置、负责任博彩、投注站、风控、盈亏异常、地推、系统设置。列字段以 PRD **2.21**（UAT 页面源码）为准，截图到达后再 1:1。
3. 资金类操作必须二次确认；演示环境 Toast 标明「演示，不产生真实资金」。
4. 抽奖活动的**规则**以抽奖需求已定稿为准（循环重置、分享任务开关默认打开无需添加、开则前台展示/关则本期无需完成分享即可抽奖、任务1关闭走红包雨、奖品挂所属排名 top、保底、时间段下雨表）。日常改动在 `qq-lottery-phase2-prototype`；用户说 **定稿** 时把抽奖配置同步进本仓库 `#/activity` 抽奖模版，不要另写第二套发奖公式。其它活动类型不要被抽奖瘦身覆盖。前台抽奖页在 `qq-lottery-prototype/c-end/lottery.html`（定稿时一并更新）。
4a. **用户分层活动配置**（`#/layer`）以 Axure [用户分层活动配置](https://85cnzd.axshare.com/?g=14&id=kow2b6&p=%E3%80%90%E8%8F%B2%E7%9B%98-backend%E3%80%91%E7%94%A8%E6%88%B7%E5%88%86%E5%B1%82%E6%B4%BB%E5%8A%A8%E9%85%8D%E7%BD%AE&sc=3) 为准：下拉多选（默认无 / Slot）、预警填 URL、每层固定 3 策略、取消恢复进入时状态。不要改回芯片多选或 Telegram 机器人下拉。细则见 PRD **2.19.2**。
4b. **活动管理**（`#/activity`）以 UAT 截图为准：筛类型/状态/悬浮开关/创建时间；工具栏 +新增、删除、标签管理、同步；列含双端图标、选择标签、排序 −/+、状态开关、悬浮或 `--`、行编辑+删除。点标签管理弹出 **新增/管理** 芯片弹层。点「同步」二次确认后写入活动中心配置。点 +新增/编辑打开 **编辑活动** 宽抽屉。活动类型 23 项按截图顺序；当日首存四个步进器；周亏损返现按三张截图（图标、最高返现、**周亏损打码量倍数**、选游戏、VIP 比例表、额外周亏损开关/比例/星期、用户总输；额外周亏损打开后比例表上方为 **周亏损额外奖励打码倍数**）；日亏损返现按两张截图（同上但无额外周亏损，多救援金开关，总输 ? 为日输）；金钱如雨按三张截图（图标、参与充值/每场奖励/最高获得、打码倍数、每日/额外 Tab、时段表、下雨 VIP 表与均分奖金）；转盘奖励按两张截图（图标、奖励金额、初始金额 P~P、周期天、随机比例/次数、任务1输额+游戏+展开明细、任务2邀请/三方、简讯模板）；抽奖活动按八张截图 + 抽奖项目定稿规则（开始时间、循环周期、分享任务、**分享任务开关在任务排序上方**、英文/菲语图视频、可选任务、红包雨、VIP、流水排名 top、奖品、保底、分享链接/官方账号）。不要用同一套表单冒充全类型。细则见 PRD **2.16 Locked**。
5. 会员详情平台余额、一键回收、转入/转出以既有《会员详情—平台余额》规则为准。
6. 余额回收记录以既有《余额回收记录》规则为准。

## Naming

- **项目名称：管理后台**
- 站内产品名：Juan365 Admin
