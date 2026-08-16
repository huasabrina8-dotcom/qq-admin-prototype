(function (global) {
  'use strict';

  var NAV = [
    { id: "member", label: "会员管理", children: [
      { id: "members", href: "#/members", label: "会员中心" },
      { id: "groups", href: "#/groups", label: "会员分组" },
      { id: "bills", href: "#/bills", label: "会员账单" },
      { id: "kyc", href: "#/kyc", label: "KYC审核管理" },
      { id: "selfLimit", href: "#/selfLimit", label: "自我限制" },
      { id: "sms", href: "#/sms", label: "短信查询" },
      { id: "loginLogs", href: "#/loginLogs", label: "登录日志" },
      { id: "behaviorLogs", href: "#/behaviorLogs", label: "用户行为日志" },
      { id: "wdAccounts", href: "#/wdAccounts", label: "提款账户管理" },
      { id: "memberIdQuery", href: "#/memberIdQuery", label: "会员ID查询" },
      { id: "userLayer", href: "#/userLayer", label: "用户分层" },
    ]},
    { id: "record", label: "投注记录", children: [
      { id: "bets", href: "#/bets", label: "会员投注" },
      { id: "electronicRecords", href: "#/electronicRecords", label: "电子投注记录" },
      { id: "videoRecords", href: "#/videoRecords", label: "视讯投注记录" },
      { id: "sportsRecords", href: "#/sportsRecords", label: "体育投注记录" },
      { id: "userBetStatistics", href: "#/userBetStatistics", label: "投注统计" },
      { id: "basicData", href: "#/basicData", label: "基础数据" },
      { id: "activityBetWhitelist", href: "#/activityBetWhitelist", label: "活动注单白名单" },
    ]},
    { id: "pay", label: "充值提款", children: [
      { id: "depChannels", href: "#/depChannels", label: "充值策略" },
      { id: "wdChannels", href: "#/wdChannels", label: "提款策略" },
      { id: "deposits", href: "#/deposits", label: "审核会员充值" },
      { id: "withdraws", href: "#/withdraws", label: "审核会员提款" },
      { id: "userOvertimeWithdraw", href: "#/userOvertimeWithdraw", label: "超时审查表" },
      { id: "financialConfig", href: "#/financialConfig", label: "财务配置" },
      { id: "payChannel", href: "#/payChannel", label: "金流渠道管理" },
    ]},
    { id: "fund", label: "资金操作", children: [
      { id: "stationDepositWithdrawal", href: "#/stationDepositWithdrawal", label: "投注站出入款" },
      { id: "abnormalFunds", href: "#/abnormalFunds", label: "异常资金处理" },
      { id: "manualIn", href: "#/manualIn", label: "系统入款" },
      { id: "topScoresLog", href: "#/topScoresLog", label: "系统入款记录" },
      { id: "manualOut", href: "#/manualOut", label: "系统打款" },
      { id: "bonusTemplate", href: "#/bonusTemplate", label: "彩金模板" },
      { id: "bonusConfig", href: "#/bonusConfig", label: "彩金配置" },
      { id: "IllegalFundManagement", href: "#/IllegalFundManagement", label: "违规资金管理" },
    ]},
    { id: "game", label: "平台游戏", children: [
      { id: "vendors", href: "#/vendors", label: "游戏厂商" },
      { id: "gameTypes", href: "#/gameTypes", label: "游戏类型" },
      { id: "gamePlatforms", href: "#/gamePlatforms", label: "游戏平台" },
      { id: "games", href: "#/games", label: "游戏管理" },
    ]},
    { id: "promo", label: "优惠活动", children: [
      { id: "layer", href: "#/layer", label: "用户分层活动配置" },
      { id: "layerReport", href: "#/layerReport", label: "用户分层活动报表" },
      { id: "tasks", href: "#/tasks", label: "抽奖活动任务列表" },
      { id: "rainReport", href: "#/rainReport", label: "抽奖红包雨报表" },
      { id: "memberReport", href: "#/memberReport", label: "抽奖会员报表" },
      { id: "codes", href: "#/codes", label: "兑换码配置" },
      { id: "activity", href: "#/activity", label: "活动管理" },
      { id: "ops", href: "#/ops", label: "活动运营报表" },
      { id: "memberStat", href: "#/memberStat", label: "会员统计报表" },
      { id: "promoDetail", href: "#/promoDetail", label: "优惠明细" },
      { id: "bonusReport", href: "#/bonusReport", label: "奖金报表" },
      { id: "moneyRainReport", href: "#/moneyRainReport", label: "金钱如雨报表" },
      { id: "turntableReport", href: "#/turntableReport", label: "免费获得报表" },
      { id: "dailyLossReport", href: "#/dailyLossReport", label: "日亏损返现明细表" },
      { id: "weekLossReport", href: "#/weekLossReport", label: "周亏损返现明细表" },
      { id: "rakeBackLog", href: "#/rakeBackLog", label: "返水活动详情" },
      { id: "activityClaimedStat", href: "#/activityClaimedStat", label: "活动领取统计" },
      { id: "treasureBoxReport", href: "#/treasureBoxReport", label: "宝箱裂变报表" },
      { id: "returnPlayerGifts", href: "#/returnPlayerGifts", label: "回归玩家福利赠送表" },
      { id: "playedVideo", href: "#/playedVideo", label: "视频完播报表" },
    ]},
    { id: "report", label: "报表管理", children: [
      { id: "newRegisterRetain", href: "#/newRegisterRetain", label: "新增付费留存" },
      { id: "rechargeWithdrawReport", href: "#/rechargeWithdrawReport", label: "充值提现报表" },
      { id: "rechargeConvert", href: "#/rechargeConvert", label: "留存率" },
      { id: "playerChurnStatistics", href: "#/playerChurnStatistics", label: "玩家流失统计报表" },
      { id: "firstRechargeConvert", href: "#/firstRechargeConvert", label: "渠道首充留存率" },
      { id: "activityRechargeConvert", href: "#/activityRechargeConvert", label: "活动留存率" },
      { id: "rechargeAndRegRetain", href: "#/rechargeAndRegRetain", label: "新增充值复充留存" },
      { id: "userWinLoseReport", href: "#/userWinLoseReport", label: "用户输赢报表" },
      { id: "userGameCount", href: "#/userGameCount", label: "会员游戏报表" },
      { id: "ltvData", href: "#/ltvData", label: "LTV记录" },
      { id: "ltvRechargeWithdrawList", href: "#/ltvRechargeWithdrawList", label: "首充复充记录" },
      { id: "ltvFirstCharge", href: "#/ltvFirstCharge", label: "首充记录" },
      { id: "ltvReserveRecharge", href: "#/ltvReserveRecharge", label: "复充率" },
      { id: "userLoginReport", href: "#/userLoginReport", label: "掉线统计报表" },
      { id: "successRate", href: "#/successRate", label: "支付成功率" },
      { id: "analysisReport", href: "#/analysisReport", label: "玩家行为分析" },
      { id: "gameProfitReport", href: "#/gameProfitReport", label: "游戏盈利报表" },
      { id: "platformProfitAnalysis", href: "#/platformProfitAnalysis", label: "平台盈利分析" },
      { id: "paybackPeriod", href: "#/paybackPeriod", label: "回本周期报表" },
      { id: "playerDataReport", href: "#/playerDataReport", label: "玩家数据报告" },
      { id: "financeTaxationMgt", href: "#/financeTaxationMgt", label: "财务与税收管理" },
    ]},
    { id: "task", label: "任务系统", children: [
      { id: "taskDailyTask", href: "#/taskDailyTask", label: "每日任务配置" },
      { id: "taskDailyTaskReport", href: "#/taskDailyTaskReport", label: "每日任务报表" },
    ]},
    { id: "agent", label: "联盟管理", children: [
      { id: "agent", href: "#/agent", label: "全民推广" },
      { id: "commission", href: "#/commission", label: "会员返佣" },
      { id: "agentStat", href: "#/agentStat", label: "联盟报表(每天)" },
      { id: "agentTotal", href: "#/agentTotal", label: "联盟报表(总计)" },
      { id: "reportPromotionTeam", href: "#/reportPromotionTeam", label: "推广团队报表" },
      { id: "agentstatistics", href: "#/agentstatistics", label: "代理统计" },
    ]},
    { id: "overview", label: "综合报告", children: [
      { id: "financeReport", href: "#/financeReport", label: "综合财务报告" },
      { id: "ageRangeDataStat", href: "#/ageRangeDataStat", label: "年龄区间数据统计" },
      { id: "giftsReport", href: "#/giftsReport", label: "礼物赠送报告" },
      { id: "playerInformationReport", href: "#/playerInformationReport", label: "玩家信息报告" },
      { id: "betRecordReport", href: "#/betRecordReport", label: "投注记录" },
      { id: "riskAndComplianceReport", href: "#/riskAndComplianceReport", label: "风险与合规报告" },
      { id: "illgalSurrenderReport", href: "#/illgalSurrenderReport", label: "NDRP违规资金上缴报告" },
      { id: "playersReport", href: "#/playersReport", label: "玩家数据报告" },
      { id: "transactionflow", href: "#/transactionflow", label: "交易流水与支付" },
      { id: "ggr", href: "#/ggr", label: "GGR结算报告" },
    ]},
    { id: "channel", label: "渠道管理", children: [
      { id: "promoter", href: "#/promoter", label: "推广商设置" },
      { id: "channel", href: "#/channel", label: "渠道列表" },
      { id: "channelNew", href: "#/channelNew", label: "自定义渠道" },
      { id: "channelCount", href: "#/channelCount", label: "渠道统计" },
      { id: "channelBetCount", href: "#/channelBetCount", label: "渠道游戏统计" },
      { id: "channelCountNew", href: "#/channelCountNew", label: "广告投放报表" },
    ]},
    { id: "info", label: "信息配置", children: [
      { id: "internalMessage", href: "#/internalMessage", label: "站内信" },
      { id: "pageAdv", href: "#/pageAdv", label: "广告管理" },
      { id: "homeConfig", href: "#/homeConfig", label: "首页配置" },
      { id: "contactInfo", href: "#/contactInfo", label: "联系信息" },
      { id: "partners", href: "#/partners", label: "合作伙伴" },
      { id: "pageNotice", href: "#/pageNotice", label: "系统公告" },
      { id: "pageMaterial", href: "#/pageMaterial", label: "宣传资料" },
      { id: "newsConfig", href: "#/newsConfig", label: "首页-品牌&新闻配置" },
    ]},
    { id: "plat", label: "平台配置", children: [
      { id: "baseSetting", href: "#/baseSetting", label: "基本配置" },
      { id: "safeSetting", href: "#/safeSetting", label: "安全配置" },
      { id: "settingLangCurrency", href: "#/settingLangCurrency", label: "语言货币配置" },
      { id: "smsChannel", href: "#/smsChannel", label: "短信通道配置" },
      { id: "analogData", href: "#/analogData", label: "模拟数据" },
      { id: "telegramSet", href: "#/telegramSet", label: "消息推送Telegram设置" },
      { id: "emailConfig", href: "#/emailConfig", label: "系统邮箱配置" },
      { id: "appDistribution", href: "#/appDistribution", label: "APP分发管理" },
      { id: "domainManager", href: "#/domainManager", label: "防封禁域名管理" },
      { id: "bankConfigMgt", href: "#/bankConfigMgt", label: "银行配置管理" },
      { id: "supportManagement", href: "#/supportManagement", label: "客服管理" },
      { id: "topNavSetting", href: "#/topNavSetting", label: "顶部导航配置" },
      { id: "sideMenuSetting", href: "#/sideMenuSetting", label: "侧边栏配置" },
    ]},
    { id: "rg", label: "负责任博彩管理", children: [
      { id: "ndrpList", href: "#/ndrpList", label: "NDRP名单" },
    ]},
    { id: "station", label: "投注站管理", children: [
      { id: "betStationList", href: "#/betStationList", label: "投注站列表" },
    ]},
    { id: "risk", label: "风控管理", children: [
      { id: "securityLockMgt", href: "#/securityLockMgt", label: "安全锁定管理" },
      { id: "memberExclusionMgt", href: "#/memberExclusionMgt", label: "会员排除管理" },
      { id: "eventConfig", href: "#/eventConfig", label: "风险事件设置" },
      { id: "windControlList", href: "#/windControlList", label: "风控名单" },
      { id: "riskActivityLog", href: "#/riskActivityLog", label: "风险行为日志" },
      { id: "cashFlowAbnormalList", href: "#/cashFlowAbnormalList", label: "流水异常清零用户名单" },
    ]},
    { id: "ploss", label: "盈亏异常用户名单", children: [
      { id: "profitLossAbnormalUser", href: "#/profitLossAbnormalUser", label: "盈亏异常用户名单" },
    ]},
    { id: "ground", label: "地推管理", children: [
      { id: "userRetention", href: "#/userRetention", label: "地推用户留存" },
      { id: "groundPromotion", href: "#/groundPromotion", label: "物料管理" },
      { id: "distributionRecord", href: "#/distributionRecord", label: "发放记录" },
    ]},
    { id: "system", label: "系统设置", children: [
      { id: "sysUsers", href: "#/sysUsers", label: "用户管理" },
      { id: "sysRoles", href: "#/sysRoles", label: "角色管理" },
      { id: "sysMenus", href: "#/sysMenus", label: "菜单管理" },
      { id: "sysDict", href: "#/sysDict", label: "数据字典" },
      { id: "sysOperLog", href: "#/sysOperLog", label: "操作日志" },
      { id: "sysLoginLogs", href: "#/sysLoginLogs", label: "登录日志" },
    ]},
  ];

  var TITLES = {};
  NAV.forEach(function (g) {
    g.children.forEach(function (c) { TITLES[c.id] = c.label; });
  });
  TITLES.memberDetail = '会员详情';
  TITLES.dashboard = '仪表盘';
  TITLES.tiers = '会员层级';

  function zh(s) {
    if (s == null || s === '') return '';
    var raw = String(s);
    if (/^[\u4e00-\u9fff0-9\s：:（）()%\-_/]+$/.test(raw)) return raw;
    var map = {
      'Basic Data': '基础数据', createAt: '创建时间', triggerTime: '触发时间',
      hierarchicalUsers: '分层用户', codingMultiple: '打码倍数', consumeStatus: '领取状态',
      rewardConsumeTime: '奖励消耗时间', lastDepositAmount: '最后存款金额',
      userNetProfitAtTrigger: '触发时净盈亏', userBalanceAtTrigger: '触发时余额',
      uploadTime: '上传时间', uploadLink: '上传链接', redeemCode: '兑换码',
      expireTime: '过期时间', limitCount: '限领次数', amountRange: '金额区间',
      taskValidDays: '任务有效天数', claimCondition: '领取条件', claimedUserCount: '已领人数',
      claimAmount: '领取金额', systemId: '系统ID', stationsType: '投注站类型',
      bettingStationType: '投注站类型', promoter: '推广员',
      '1DayRecharge': '1日充值', '2DaysRetention': '2日留存', '3DaysRetention': '3日留存',
      '4DaysRetention': '4日留存', '5DaysRetention': '5日留存', '6DaysRetention': '6日留存',
      '7DaysRetention': '7日留存', '1DayRetention': '1日留存',
      firstRechargeFisrtRechargeTotalAmount: '首充总金额',
      '2dayNumberOfActivePeople': '2日活跃人数', '2dayRetentionRate': '2日留存率', '2dayChurnRate': '2日流失率',
      '3dayNumberOfActivePeople': '3日活跃人数', '3dayRetentionRate': '3日留存率', '3dayChurnRate': '3日流失率',
      '4dayNumberOfActivePeople': '4日活跃人数', '4dayRetentionRate': '4日留存率', '4dayChurnRate': '4日流失率',
      '5dayNumberOfActivePeople': '5日活跃人数', '5dayRetentionRate': '5日留存率', '5dayChurnRate': '5日流失率',
      '6dayNumberOfActivePeople': '6日活跃人数', '6dayRetentionRate': '6日留存率', '6dayChurnRate': '6日流失率',
      '2ndLTV': '2日LTV', '3dayLTV': '3日LTV', '4dayLTV': '4日LTV', '5dayLTV': '5日LTV',
      '6thLTV': '6日LTV', '7dayLTV': '7日LTV', '15thLTV': '15日LTV', '30DayLTV': '30日LTV',
      '60DayLTV': '60日LTV', '90DayLTV': '90日LTV', '180DayLTV': '180日LTV', '1yearLTV': '1年LTV',
      '2DaysPerCapita': '2日人均', '3DaysPerCapita': '3日人均',
      '0Oclock': '0点', '1Hour': '1点', '2Oclock': '2点', '3Oclock': '3点', '4Oclock': '4点',
      '5Oclock': '5点', '6Oclock': '6点', '7Oclock': '7点', '8Oclock': '8点', '9Oclock': '9点',
      '10Oclock': '10点', '11Oclock': '11点', '12Oclock': '12点', '13Oclock': '13点', '14Oclock': '14点',
      userNum: '用户数', gameBetMoney: '投注金额', gameValidBet: '有效投注', gameWinMoney: '派彩金额',
      gameReturnRate: '返还率', gameProfitRate: '盈利率', gameGgrMoney: 'GGR', gameBetRate: '投注占比',
      category: '分类', totalEffectiveBets: '总有效投注', platformProfitability: '平台盈利', profitRate: '盈利率',
      over30Day: '超过30天', copySuccess: '复制成功', affiliatedBettingStation: '所属投注站',
      taskId: '任务ID', taskName: '任务名称', clientDisplayName: '客户展示名称',
      gameGenre: '游戏类型', completionConditions: '完成条件', bettingAmount: '投注金额',
      activityReward: '活跃度奖励', trueGoldReward: '真金奖励', taskDescription: '任务说明',
      addDailyTask: '新增每日任务', activityConfiguration: '活跃度配置',
      dailyResetTimeOfActivity: '活跃度每日重置时间', allGameCategories: '所有游戏分类',
      dailyTaskRewardConfig: '每日任务奖励配置', qualifiedActivityLevel: '达标活跃度',
      numberOfRecipients: '赠送人数', totalAmountReceived: '总领取金额',
      activityLevel: '活跃度', timePeriod: '时间段',
      numberOfParticipants: '参加人数', totalGrabAmount: '总抢金额',
      systemId: '系统编号', rewardType: '奖励类型', limitCount: '数量限制',
      amountRange: '金额范围', redeemCodeEntry: '兑换码入口', fuzzySearch: '模糊搜索',
      inProgress: '进行中', closed: '已关闭', finished: '已结束', expired: '已过期',
      unlimited: '不限', custom: '自设', rolloverMultiple: '流水倍数',
      taskValidDays: '彩金任务有效时间(天)', claimCondition: '有效用户判定',
      triggerTime: '触发时间', hierarchicalUsers: '分层用户', codingMultiple: '打码倍数',
      consumeStatus: '领取状态', rewardConsumeTime: '奖励消耗时间',
      lastDepositAmount: '最后存款金额', userNetProfitAtTrigger: '触发时净盈亏',
      userBalanceAtTrigger: '触发时余额', uploadTime: '上传时间', uploadLink: '上传链接',
      redeemCode: '兑换码', expireTime: '过期时间', limitCount: '限领次数',
      amountRange: '金额区间', taskValidDays: '任务有效天数', claimCondition: '领取条件',
      claimedUserCount: '已领人数', claimAmount: '领取金额', systemId: '系统ID',
      stationsType: '投注站类型', bettingStationType: '投注站类型', promoter: '推广员',
      loginUser: '登录用户', loginStatus: '登录状态', operatingSystem: '操作系统',
      browser: '浏览器', characterName: '角色名称', roleID: '角色ID',
      menuName: '菜单名称', menuLogo: '菜单标识', menuType: '菜单类型',
      routingAddress: '路由地址', viewComponent: '视图组件', hide: '隐藏', routing: '请求路由',
      dictionaryName: '字典名称', dictionaryID: '字典ID',
      newsTitle: '新闻标题', newsID: '新闻ID', newsPublishTime: '新闻发布时间', newsCover: '新闻封面',
      channelCodeChannelMark: '渠道标识', allType: '全部类型',
      deposits: '充值金额', withdrawals: '提现金额', bets: '投注金额',
      effectiveBetting: '有效投注', profitLoss: '盈亏', currentAccountBalance: '当前账户余额',
      activeAccounts: '活跃账号', activeDuration: '活跃时长',
      totalAmountPaidIn: '已缴总额', totalConfiscatedAmount: '罚没总额', jackpotTax: '奖池税',
      settlementTaxRate: '结算税率', legacyTaxCharges: '历史税负', turnIn: '上缴',
      BetAmount: '投注金额', TurnoverValue: '流水', PayoutValue: '派彩', winOrLoss: '输赢',
      grossIncome: '毛收入', Jackpot: '奖池',
      completedKycPeopleCount: '已完成KYC人数', activeNumber: '活跃人数',
      bettingRealMoneyUserCount: '真金投注人数',
      electronicECasinoGamesBettingNumber: '电子娱乐场投注人数',
      specialtyGamesBettingNumber: '特色游戏投注人数',
      electronicBingoGamesBettingNumber: '电子宾果投注人数',
      sportsBettingGamesBettingNumber: '体育投注人数',
      numericGamesBettingNumber: '数字游戏投注人数', ageRange: '年龄区间',
      emailDesensitization: '邮箱（脱敏）',
      kycCount: 'KYC人数', hightRiskTrading: '高风险交易',
      moneyLaunderingTransaction: '疑似洗钱交易', ndrpCount: 'NDRP人数',
      selfExcludePlayers: '自我排除玩家', selfDeletePlayers: '自我删除玩家',
      NumberOfForfeitedAccounts: '罚没账户数',
      AmountOfForfeitedFundsCashBalance: '罚没真金余额',
      AmountOfForfeitedFundsBonusCredit: '罚没彩金余额',
      GovernmentMoney: '上缴政府金额', IncludedInNDRP: '纳入NDRP',
      IneligiblePlayer: '不合格玩家', 'ViolationOnTermsOfUse(TOU)': '违反使用条款',
      OtherReason: '其他原因', newPlayerCount: '新增玩家', activePlayer: '活跃玩家',
      betPlayer: '投注玩家', kycPlayerCount: 'KYC玩家数',
      totalDepositAmount: '总充值金额', largeTransactionCount: '大额交易笔数',
      receivedBonusType: '已领彩金类型', receivedBonusAmount: '已领彩金金额',
      remainingWaterAmount: '剩余流水', abnormalType: '异常类型', cumulativeCount: '累计次数',
      bankId: '银行ID', bankFullName: '银行全称', bankSatus: '银行状态',
      createAt: '创建时间', userNum: '用户数',
      gameBetMoney: '投注金额', gameValidBet: '有效投注', gameWinMoney: '派彩金额',
      gameReturnRate: '返还率', gameProfitRate: '盈利率', gameGgrMoney: 'GGR', gameBetRate: '投注占比',
      category: '分类', totalEffectiveBets: '总有效投注',
      platformProfitability: '平台盈利', profitRate: '盈利率',
      titleMaxlengthTips: '标题', btnNamePlaceholder: '按钮名称',
      btnNameMaxlengthTips: '按钮名称', contentMaxlengthTips: '正文',
      acceptingMembersPlaceholder: '接收会员', importExcelPlaceholder: '导入Excel',
      selectSendTimePlaceholder: '发送时间', coverPlaceholder: '封面',
      'thirdGame:manage:image': '任务截图'
    };
    if (map[raw]) return map[raw];
    var spaced = raw.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
    if (map[spaced]) return map[spaced];
    return raw;
  }

  function ico(name) {
    var p = ' fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"';
    var inner = {
      member: '<circle cx="12" cy="8" r="3"' + p + '/><path d="M5 19c1.4-3 3.8-5 7-5s5.6 2 7 5"' + p + '/>',
      record: '<rect x="5" y="4" width="14" height="16" rx="2"' + p + '/><path d="M8 9h8M8 13h6"' + p + '/>',
      pay: '<rect x="4" y="7" width="16" height="11" rx="2"' + p + '/><path d="M4 11h16"' + p + '/>',
      fund: '<path d="M7 7l-3 3 3 3M17 17l3-3-3-3M8 10h11M5 14h11"' + p + '/>',
      game: '<rect x="4" y="8" width="16" height="10" rx="2"' + p + '/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/>',
      promo: '<path d="M4 12l8-8h7v7l-8 8z"' + p + '/><circle cx="16" cy="8" r="1.2" fill="currentColor"/>',
      report: '<path d="M5 19V9M10 19V5M15 19v-7M20 19V8"' + p + '/>',
      task: '<rect x="5" y="5" width="14" height="14" rx="2"' + p + '/><path d="M8 12l3 3 5-6"' + p + '/>',
      agent: '<circle cx="8" cy="9" r="2.4"' + p + '/><circle cx="16" cy="9" r="2.4"' + p + '/><path d="M4 18c.8-2 2.4-3 4-3s3.2 1 4 3M12 18c.8-2 2.4-3 4-3s3.2 1 4 3"' + p + '/>',
      overview: '<circle cx="12" cy="12" r="8"' + p + '/><path d="M12 8v4l3 2"' + p + '/>',
      channel: '<path d="M4 7h16M4 12h16M4 17h10"' + p + '/>',
      info: '<circle cx="12" cy="12" r="8"' + p + '/><path d="M12 11v5M12 8h.01"' + p + '/>',
      platform: '<rect x="4" y="5" width="16" height="14" rx="2"' + p + '/><path d="M4 10h16"' + p + '/>',
      rg: '<path d="M12 4l7 4v6c0 4-3 6-7 8-4-2-7-4-7-8V8z"' + p + '/>',
      station: '<path d="M4 19V9l8-5 8 5v10"' + p + '/><path d="M10 19v-6h4v6"' + p + '/>',
      risk: '<path d="M12 4l9 16H3z"' + p + '/><path d="M12 10v4M12 16h.01"' + p + '/>',
      ploss: '<path d="M5 16l5-5 3 3 6-7"' + p + '/>',
      ground: '<path d="M4 18h16M7 18V8l5-3 5 3v10"' + p + '/>',
      system: '<circle cx="12" cy="12" r="3"' + p + '/><path d="M12 3v2M12 19v2M4.9 6.5l1.5 1.5M17.6 16l1.5 1.5M3 12h2M19 12h2M4.9 17.5l1.5-1.5M17.6 8l1.5-1.5"' + p + '/>'
    };
    return '<svg class="side-svg" viewBox="0 0 24 24" width="16" height="16">' + (inner[name] || inner.system) + '</svg>';
  }

  function toast(msg, kind) {
    var el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    el.classList.toggle('err', kind === 'err');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  function renderSidebar(active) {
    var el = document.getElementById('sidebar');
    if (!el) return;
    var html = '<a class="logo" href="#/dashboard">' +
      '<i class="logo-mark" aria-hidden="true"></i>JUAN</a>';
    NAV.forEach(function (g) {
      var children = g.children.filter(function (c) {
        return !global.AdminStore || AdminStore.can(c.id);
      });
      if (!children.length) return;
      var open = children.some(function (c) { return c.id === active; }) ||
        (active === 'memberDetail' && g.id === 'member') ||
        (active === 'dashboard' && g.id === 'member');
      html += '<div class="side-group' + (open ? ' open' : '') + '" data-group="' + g.id + '">' +
        '<div class="side-item' + (open ? ' open' : '') + '">' + ico(g.id) + '<span class="side-txt">' + g.label + '</span><span class="caret">▾</span></div>' +
        '<div class="side-sub">' + children.map(function (c) {
          return '<a class="' + (c.id === active ? 'on' : '') + '" href="' + c.href + '">' + zh(c.label) + '</a>';
        }).join('') + '</div></div>';
    });
    el.innerHTML = html + '<button class="side-fold" type="button" id="sideFold" title="折叠菜单">‹</button>';
    el.querySelectorAll('.side-item').forEach(function (item) {
      item.onclick = function () {
        item.parentElement.classList.toggle('open');
        item.classList.toggle('open');
      };
    });
    var fold = document.getElementById('sideFold');
    if (fold) fold.onclick = function (e) {
      e.stopPropagation();
      document.querySelector('.layout').classList.toggle('collapsed');
    };
  }

  function renderHeader(active) {
    var el = document.getElementById('header');
    if (!el) return;
    var title = TITLES[active] || '仪表盘';
    if (active === 'memberDetail') {
      var m = /[?&]id=([^&]+)/.exec(location.hash);
      title = m ? ('会员-' + decodeURIComponent(m[1])) : '会员详情';
    }
    el.innerHTML =
      '<div class="th-left"><button class="th-icon" type="button" id="btnCollapse" title="折叠">☰</button>' +
      '<span class="th-title">' + title + '</span></div>' +
      '<div class="th-right">' +
      '<button class="th-icon" type="button" data-h="search" title="搜索"><svg viewBox="0 0 24 24" width="16" height="16"><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 16l5 5" stroke="currentColor" stroke-width="2" fill="none"/></svg></button>' +
      '<button class="th-icon" type="button" data-h="full" title="全屏"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>' +
      '<button class="th-icon" type="button" data-h="bell" title="通知"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 16h12l-1-3V10a5 5 0 00-10 0v3zM10 18a2 2 0 004 0" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>' +
      '<button class="th-icon" type="button" data-h="set" title="设置"><svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3v2M12 19v2M4.9 6.5l1.5 1.5M17.6 16l1.5 1.5M3 12h2M19 12h2M4.9 17.5l1.5-1.5M17.6 8l1.5-1.5" stroke="currentColor" stroke-width="2"/></svg></button>' +
      '<button class="th-avatar" type="button" id="btnAvatar" title="管理员"></button>' +
      '<div class="th-drop" id="userDrop">' +
      '<div class="th-drop-name">管理员</div>' +
      '<button type="button" id="btnLogout">退出登录</button></div></div>';
    document.getElementById('btnCollapse').onclick = function () {
      document.querySelector('.layout').classList.toggle('collapsed');
    };
    el.querySelector('[data-h="search"]').onclick = function () { toast('搜索（演示）'); };
    el.querySelector('[data-h="full"]').onclick = function () {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () { toast('当前浏览器无法全屏'); });
      else document.exitFullscreen();
    };
    el.querySelector('[data-h="bell"]').onclick = function () { toast('暂无新通知'); };
    el.querySelector('[data-h="set"]').onclick = function () { toast('站点设置见后续截图'); };
    var drop = document.getElementById('userDrop');
    document.getElementById('btnAvatar').onclick = function (e) {
      e.stopPropagation();
      drop.classList.toggle('open');
    };
    document.getElementById('btnLogout').onclick = function () {
      toast('演示环境直接打开后台，无需登录');
    };
  }

  var tabs = [{ id: 'dashboard', title: '仪表盘', closable: false }];

  function openTab(id, title) {
    title = title || TITLES[id] || id;
    var found = tabs.filter(function (t) { return t.id === id; })[0];
    if (!found) tabs.push({ id: id, title: title, closable: id !== 'dashboard' });
    renderTabs(id);
  }

  function closeTab(id) {
    if (id === 'dashboard') return;
    tabs = tabs.filter(function (t) { return t.id !== id; });
    var last = tabs[tabs.length - 1];
    location.hash = '#/' + (last ? last.id : 'dashboard');
  }

  function renderTabs(active) {
    var el = document.getElementById('tabs');
    if (!el) return;
    el.innerHTML = tabs.map(function (t) {
      return '<span class="crumb-tab' + (t.id === active ? ' on' : '') + '" data-id="' + t.id + '">' +
        t.title + (t.closable ? ' <i data-close="' + t.id + '">×</i>' : '') + '</span>';
    }).join('');
    el.querySelectorAll('.crumb-tab').forEach(function (n) {
      n.onclick = function (e) {
        var close = e.target.getAttribute('data-close');
        if (close) { e.stopPropagation(); closeTab(close); return; }
        location.hash = '#/' + n.getAttribute('data-id');
      };
    });
  }

  function pagerHtml(page, size, total) {
    var pages = Math.max(1, Math.ceil(total / size) || 1);
    var btns = '<button class="pg" data-pg="' + Math.max(1, page - 1) + '" type="button" ' + (page <= 1 ? 'disabled' : '') + '>‹</button>';
    var start = Math.max(1, page - 2);
    var end = Math.min(pages, start + 4);
    for (var i = start; i <= end; i++) {
      btns += '<button class="pg' + (i === page ? ' on' : '') + '" data-pg="' + i + '" type="button">' + i + '</button>';
    }
    btns += '<button class="pg" data-pg="' + Math.min(pages, page + 1) + '" type="button" ' + (page >= pages ? 'disabled' : '') + '>›</button>';
    return '<div class="ant-pager" data-pager>' +
      '<span>共 ' + total + ' 条</span>' +
      btns +
      '<select data-size>' +
      '<option value="10"' + (size === 10 ? ' selected' : '') + '>10条/页</option>' +
      '<option value="20"' + (size === 20 ? ' selected' : '') + '>20条/页</option>' +
      '<option value="30"' + (size === 30 ? ' selected' : '') + '>30条/页</option>' +
      '<option value="50"' + (size === 50 ? ' selected' : '') + '>50条/页</option></select>' +
      '<span class="pg-jump">前往 <input data-jump type="text" value="' + page + '"> 页</span>' +
      '</div>';
  }

  function bindPager(root, state, rerender) {
    var box = root.querySelector('[data-pager]');
    if (!box) return;
    box.querySelectorAll('[data-pg]').forEach(function (b) {
      b.onclick = function () {
        if (b.disabled) return;
        state.page = Number(b.getAttribute('data-pg'));
        rerender();
      };
    });
    var sel = box.querySelector('[data-size]');
    if (sel) sel.onchange = function () { state.size = Number(sel.value); state.page = 1; rerender(); };
    var jump = box.querySelector('[data-jump]');
    if (jump) {
      jump.onchange = function () {
        var n = parseInt(jump.value, 10);
        if (!n || n < 1) n = 1;
        state.page = n;
        rerender();
      };
    }
  }

  function slicePage(rows, state) {
    var start = (state.page - 1) * state.size;
    return rows.slice(start, start + state.size);
  }

  function confirm(text, okText) {
    return new Promise(function (resolve) {
      var wrap = document.getElementById('confirmModal');
      document.getElementById('confirmText').textContent = text;
      var ok = document.getElementById('confirmOk');
      ok.textContent = okText || '确定';
      wrap.classList.add('open');
      function done(v) {
        wrap.classList.remove('open');
        ok.onclick = null;
        wrap.querySelector('[data-close]').onclick = null;
        resolve(v);
      }
      ok.onclick = function () { done(true); };
      wrap.querySelector('[data-close]').onclick = function () { done(false); };
    });
  }

  function openDrawer(title, bodyHtml, onOk, opt) {
    opt = opt || {};
    var overlay = document.getElementById('overlay');
    var panel = overlay.querySelector('.drawer');
    var ok = document.getElementById('btnOk');
    var cancel = document.getElementById('btnCancel');
    document.getElementById('drawerTitle').textContent = title;
    document.getElementById('drawerBody').innerHTML = bodyHtml;
    overlay.classList.add('open');
    overlay.classList.toggle('as-modal', opt.mode === 'modal');
    overlay.classList.remove('tag-modal', 'act-form');
    if (opt.cls) overlay.classList.add(opt.cls);
    if (panel) {
      panel.classList.toggle('wide', !!opt.wide);
      panel.classList.toggle('form-w', !opt.wide && opt.mode !== 'modal');
    }
    ok.textContent = opt.okText || '确定';
    ok.style.display = opt.hideOk ? 'none' : '';
    if (cancel) cancel.style.display = opt.hideCancel ? 'none' : '';
    document.getElementById('btnClose').onclick = closeDrawer;
    document.getElementById('btnCancel').onclick = closeDrawer;
    ok.onclick = function () {
      if (onOk) onOk();
    };
  }

  function closeDrawer() {
    var overlay = document.getElementById('overlay');
    overlay.classList.remove('open', 'as-modal', 'tag-modal', 'act-form');
    var panel = overlay.querySelector('.drawer');
    if (panel) panel.classList.remove('wide', 'form-w');
    var ok = document.getElementById('btnOk');
    var cancel = document.getElementById('btnCancel');
    ok.textContent = '确定';
    ok.style.display = '';
    if (cancel) cancel.style.display = '';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function badgeStatus(v) {
    if (v === 1 || v === '开启' || v === '已通过' || v === '成功' || v === '已发放' || v === '已结算' || v === '已领取' || v === '已消费') {
      return '<span class="badge on">' + escapeHtml(v === 1 ? '开启' : v) + '</span>';
    }
    if (v === 0 || v === 2 || v === '关闭' || v === '已拒绝' || v === '失败' || v === '冻结') {
      return '<span class="badge">' + escapeHtml(v === 0 || v === 2 ? '冻结' : v) + '</span>';
    }
    if (v === '待审核' || v === '处理中' || v === '未结算' || v === '未完善' || v === '排除中' || v === '未领取' || v === '未消费' || v === '已过期') {
      return '<span class="badge wait">' + escapeHtml(v) + '</span>';
    }
    return '<span class="badge">' + escapeHtml(v) + '</span>';
  }

  function switchBtn(on, key) {
    return '<button class="switch' + (on ? ' on' : '') + '" type="button" data-sw="' + key + '"><i></i></button>';
  }

  global.AdminShell = {
    NAV: NAV,
    TITLES: TITLES,
    toast: toast,
    renderSidebar: renderSidebar,
    renderHeader: renderHeader,
    openTab: openTab,
    closeTab: closeTab,
    renderTabs: renderTabs,
    pagerHtml: pagerHtml,
    bindPager: bindPager,
    slicePage: slicePage,
    confirm: confirm,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    escapeHtml: escapeHtml,
    badgeStatus: badgeStatus,
    switchBtn: switchBtn,
    zh: zh
  };
})(window);
