(function (global) {
  'use strict';

  var KEY = 'juan365_admin_v4';
  var SESSION = 'juan365_admin_session_v1';

  var ROLES = {
    super: { id: 'super', label: '超级管理员', allow: '*' },
    cs: { id: 'cs', label: '客服', allow: ['dashboard', 'members', 'memberDetail', 'groups', 'bills', 'kyc', 'selfLimit', 'sms', 'loginLogs', 'behaviorLogs', 'wdAccounts', 'memberIdQuery', 'userLayer', 'tiers', 'bets', 'electronicRecords', 'videoRecords', 'sportsRecords', 'userBetStatistics', 'basicData', 'activityBetWhitelist', 'gameRecords', 'bonus'] },
    finance: { id: 'finance', label: '财务', allow: ['dashboard', 'members', 'memberDetail', 'bills', 'wdAccounts', 'deposits', 'withdraws', 'depChannels', 'wdChannels', 'userOvertimeWithdraw', 'financialConfig', 'payChannel', 'stationDepositWithdrawal', 'abnormalFunds', 'manualIn', 'topScoresLog', 'manualOut', 'bonusTemplate', 'bonusConfig', 'IllegalFundManagement', 'ledger', 'reclaim'] },
    ops: { id: 'ops', label: '运营', allow: ['dashboard', 'games', 'vendors', 'gameTypes', 'gamePlatforms', 'maintain', 'layer', 'layerReport', 'tasks', 'rainReport', 'memberReport', 'codes', 'activity', 'ops', 'memberStat', 'promo', 'promoDetail', 'bonusReport', 'moneyRainReport', 'turntableReport', 'dailyLossReport', 'weekLossReport', 'rakeBackLog', 'activityClaimedStat', 'treasureBoxReport', 'returnPlayerGifts', 'playedVideo', 'qrph', 'userLayer'] }
  };

  var ACCOUNTS = [
    { user: 'admin', pass: '123456', role: 'super', name: 'admin' }
  ];

  var PLATFORMS = [
    'B体育', 'FB体育', 'EL真人', 'FB体育[旧]', 'DB体育', 'B体育[旧]',
    'FG电子', '瓦力真人', 'KS捕鱼', 'FC电子', 'RiCH88电子', 'MG电子',
    'HB电子', 'FTG电子', 'TP电子', 'PS电子', 'BTI体育', 'RSG电子',
    'FC电子(one)', '印度彩票', 'Turbo电子', 'YellowBat电子', 'FB真人', 'QM棋牌'
  ];

  var CURRENCIES = ['CNY', 'VND', 'MYR', 'USDT', 'THB', 'JPY', 'USD', 'BRL'];

  var DAILY_GAME_TYPES = [
    { id: '54', name: '赌场' },
    { id: '51', name: '投币口' },
    { id: '52', name: '佩里亚' },
    { id: '53', name: '运动的' },
    { id: '57', name: '钓鱼' },
    { id: '55', name: '宾果' },
    { id: '56', name: '棋牌' },
    { id: '58', name: '卡片' },
    { id: '59', name: '数字' }
  ];

  function defaultDailyTasks() {
    return [
      { _id: 'dt1', id: '570001', name: '钓鱼投注100', show_name: '钓鱼投注100', game_type_id: '57', game_type: '钓鱼', condition_type: 1, status: 1, target_value: 100, active_point: 20, amount: 15, water_rate: 1, desc: '当日钓鱼投注满100即可领取' },
      { _id: 'dt2', id: '540002', name: '赌场投注100', show_name: '赌场投注100', game_type_id: '54', game_type: '赌场', condition_type: 1, status: 1, target_value: 100, active_point: 20, amount: 15, water_rate: 1, desc: '当日赌场投注满100即可领取' },
      { _id: 'dt3', id: '510003', name: '投币口投注100', show_name: '投币口投注100', game_type_id: '51', game_type: '投币口', condition_type: 1, status: 1, target_value: 100, active_point: 20, amount: 15, water_rate: 1, desc: '当日投币口投注满100即可领取' },
      { _id: 'dt4', id: '550004', name: '宾果投注100', show_name: '宾果投注100', game_type_id: '55', game_type: '宾果', condition_type: 1, status: 1, target_value: 100, active_point: 20, amount: 15, water_rate: 1, desc: '当日宾果投注满100即可领取' }
    ];
  }

  function defaultDailyTaskBase() {
    return {
      reset_time: '00:00:00',
      water_rate: 1,
      config: [
        { active_name: '初级活跃', active_point: 20, amount: 5 },
        { active_name: '中级活跃', active_point: 50, amount: 15 },
        { active_name: '高级活跃', active_point: 100, amount: 40 }
      ]
    };
  }

  function defaultCodeRules() {
    return {
      receive_day_money: { money: '', status: 0 },
      total_recharge: { money: 1, status: 1 },
      bet_money: { money: 1, status: 1, game_types: [] },
      maximum_users_per_IP: { num: '', status: 0 }
    };
  }

  function defaultCodes() {
    return [
      { id: 120004, create_time: '2026-08-11 23:17:17', end_time: '2026-08-12 23:17:17', type: 2, redemption_code: 'VED36WVM', num: -1, min: 1, max: 1, flow_multiple: 0, valid_days: 0, status: 2, remarks: '', user_num: 0, money: 0, effective_user_rules: defaultCodeRules() },
      { id: 90004, create_time: '2026-08-11 21:48:45', end_time: '2026-08-12 21:48:45', type: 2, redemption_code: '9XHFA6TZ', num: -1, min: 1, max: 10, flow_multiple: 0, valid_days: 0, status: 2, remarks: '', user_num: 2, money: 11.00, effective_user_rules: defaultCodeRules() },
      { id: 60007, create_time: '2026-08-12 10:22:08', end_time: '2026-08-18 23:59:59', type: 2, redemption_code: 'K8P2QM1A', num: -1, min: 5, max: 5, flow_multiple: 1, valid_days: 0, status: 2, remarks: '', user_num: 1, money: 5.00, effective_user_rules: defaultCodeRules() },
      { id: 60008, create_time: '2026-08-13 14:05:33', end_time: '2026-08-20 23:59:59', type: 1, redemption_code: 'BONUS88X', num: 100, min: 8, max: 18, flow_multiple: 2, valid_days: 7, status: 1, remarks: '周末彩金码', user_num: 12, money: 156.00, effective_user_rules: defaultCodeRules() },
      { id: 60009, create_time: '2026-08-14 09:11:02', end_time: '2026-08-21 23:59:59', type: 2, redemption_code: 'GOLD2026', num: 50, min: 10, max: 50, flow_multiple: 1, valid_days: 0, status: 1, remarks: '', user_num: 6, money: 88.00, effective_user_rules: defaultCodeRules() },
      { id: 60010, create_time: '2026-08-15 16:40:19', end_time: '2026-08-16 00:00:00', type: 1, redemption_code: 'RAIN16HH', num: -1, min: 2, max: 8, flow_multiple: 0, valid_days: 3, status: 4, remarks: '', user_num: 4, money: 22.00, effective_user_rules: defaultCodeRules() },
      { id: 60011, create_time: '2026-08-10 11:00:00', end_time: '2026-08-11 11:00:00', type: 2, redemption_code: 'OLDCODE1', num: 20, min: 1, max: 3, flow_multiple: 0, valid_days: 0, status: 3, remarks: '', user_num: 20, money: 40.00, effective_user_rules: defaultCodeRules() }
    ];
  }

  var LAYER_VENUES = [
    { id: 'Slot', name: 'Slot' },
    { id: 'Live', name: 'Live' },
    { id: 'Sports', name: 'Sports' },
    { id: 'Fishing', name: 'Fishing' },
    { id: 'Bingo', name: 'Bingo' }
  ];

  function defaultLayerThresholds() {
    return [
      { threshold_ratio: 90, is_warning: 0, warning_url: '', action_type: 1, alert_text: '您的亏损已达提醒线，建议调整投注节奏。', bonus_amount: 0, bonus_ratio: 0, wager_multiple: 1, target_deposit_amount: 0 },
      { threshold_ratio: 80, is_warning: 0, warning_url: '', action_type: 2, alert_text: '限时奖金已发放，请在倒计时内领取。', bonus_amount: 20, bonus_ratio: 0, wager_multiple: 1, target_deposit_amount: 0 },
      { threshold_ratio: 70, is_warning: 0, warning_url: '', action_type: 3, alert_text: '完成限时充值即可获得额外奖金。', bonus_amount: 0, bonus_ratio: 20, wager_multiple: 1, target_deposit_amount: 100 }
    ];
  }

  function defaultLayerReports() {
    return [
      { id: 'lr1', trigger_time: '2026-08-16 14:15:03', username: 'Zipper123', hierarchy_name: 'Day2用户', task_type: 3, bonus_amount: 250.00, bonus_ratio: 50, wager_multiple: 3, status: 1, complete_time: '2026-08-16 19:01:40', last_deposit_amount: 2000.00, net_negative_profit_and_loss: -124.00, user_balance: 72.50, deposit_recharge: 1000.00 },
      { id: 'lr2', trigger_time: '2026-08-16 12:08:21', username: 'maria_ph', hierarchy_name: 'Day2用户', task_type: 2, bonus_amount: 50.00, bonus_ratio: 0, wager_multiple: 5, status: 1, complete_time: '2026-08-16 18:22:11', last_deposit_amount: 1550.00, net_negative_profit_and_loss: -86.40, user_balance: 48.20, deposit_recharge: 0 },
      { id: 'lr3', trigger_time: '2026-08-15 20:11:08', username: 'wjfytn329022', hierarchy_name: 'Day3用户', task_type: 2, bonus_amount: 50.00, bonus_ratio: 0, wager_multiple: 5, status: 0, complete_time: '', last_deposit_amount: 2710.00, net_negative_profit_and_loss: -38.20, user_balance: 156.00, deposit_recharge: 0 },
      { id: 'lr4', trigger_time: '2026-08-15 16:40:19', username: 'Zipper133', hierarchy_name: 'Day4用户', task_type: 3, bonus_amount: 0, bonus_ratio: 50, wager_multiple: 3, status: 0, complete_time: '', last_deposit_amount: 300.00, net_negative_profit_and_loss: -62.80, user_balance: 41.10, deposit_recharge: 0 },
      { id: 'lr5', trigger_time: '2026-08-14 09:22:44', username: 'juanok01', hierarchy_name: 'Day3用户', task_type: 2, bonus_amount: 20.00, bonus_ratio: 0, wager_multiple: 1, status: 1, complete_time: '2026-08-14 11:08:00', last_deposit_amount: 300.00, net_negative_profit_and_loss: -18.00, user_balance: 22.40, deposit_recharge: 0 },
      { id: 'lr6', trigger_time: '2026-08-13 11:05:33', username: 'maria_ph', hierarchy_name: 'Day2用户', task_type: 3, bonus_amount: 100.00, bonus_ratio: 20, wager_multiple: 1, status: 1, complete_time: '2026-08-13 15:40:12', last_deposit_amount: 1550.00, net_negative_profit_and_loss: -210.50, user_balance: 95.00, deposit_recharge: 500.00 },
      { id: 'lr7', trigger_time: '2026-08-12 18:30:07', username: 'Zipper123', hierarchy_name: 'VIP高价值', task_type: 2, bonus_amount: 20.00, bonus_ratio: 0, wager_multiple: 1, status: 1, complete_time: '2026-08-12 22:11:09', last_deposit_amount: 2000.00, net_negative_profit_and_loss: -95.30, user_balance: 63.80, deposit_recharge: 0 },
      { id: 'lr8', trigger_time: '2026-08-10 10:00:00', username: 'risk_user', hierarchy_name: '观察', task_type: 2, bonus_amount: 20.00, bonus_ratio: 0, wager_multiple: 1, status: 0, complete_time: '', last_deposit_amount: 150.00, net_negative_profit_and_loss: -12.00, user_balance: 8.60, deposit_recharge: 0 }
    ];
  }

  function defaultLayerConfig() {
    return {
      rules: [
        {
          rule_id: 'R1',
          user_groups: ['Day2用户', 'Day3用户', 'Day4用户'],
          venues: ['Slot'],
          strategy_type: 1,
          trigger_freq_hours: 0,
          trigger_freq_count: 0,
          thresholds: defaultLayerThresholds()
        },
        {
          rule_id: 'R2',
          user_groups: ['VIP高价值'],
          venues: ['Slot'],
          strategy_type: 2,
          trigger_freq_hours: 1,
          trigger_freq_count: 1,
          thresholds: defaultLayerThresholds()
        }
      ]
    };
  }

  function defaultMoneyRainReports() {
    var mems = ['wjfytn329022', 'Zipper123', 'Zipper133', 'maria_ph', 'juanok01', 'risk_user'];
    function kids(date, start, amounts) {
      return amounts.map(function (amt, i) {
        var sec = 8 + i * 7;
        return {
          account: mems[i % mems.length],
          amount: amt,
          at: date + ' ' + start.slice(0, 6) + (sec < 10 ? '0' + sec : sec)
        };
      });
    }
    return [
      { _id: 'mr1', date: '2026-08-16', task_times: '12:00:00 - 12:05:00', user_num: 26, total_money: 188.60, children: kids('2026-08-16', '12:00:00', [18.80, 32.50, 12.00, 28.40, 8.80, 22.10]) },
      { _id: 'mr2', date: '2026-08-16', task_times: '14:00:00 - 14:05:00', user_num: 31, total_money: 246.40, children: kids('2026-08-16', '14:00:00', [36.20, 21.80, 15.50, 42.00, 18.80, 28.60]) },
      { _id: 'mr3', date: '2026-08-16', task_times: '16:00:00 - 16:05:00', user_num: 19, total_money: 132.80, children: kids('2026-08-16', '16:00:00', [12.80, 24.00, 8.80, 31.20, 16.50, 18.80]) },
      { _id: 'mr4', date: '2026-08-16', task_times: '18:00:00 - 18:05:00', user_num: 42, total_money: 368.50, children: kids('2026-08-16', '18:00:00', [48.00, 36.80, 22.10, 58.40, 18.80, 42.50]) },
      { _id: 'mr5', date: '2026-08-16', task_times: '20:00:00 - 20:05:00', user_num: 38, total_money: 312.20, children: kids('2026-08-16', '20:00:00', [28.80, 52.00, 18.80, 41.20, 22.00, 36.40]) },
      { _id: 'mr6', date: '2026-08-16', task_times: '21:00:00 - 21:05:00', user_num: 24, total_money: 176.00, children: kids('2026-08-16', '21:00:00', [16.80, 28.40, 12.00, 38.80, 18.80, 24.20]) },
      { _id: 'mr7', date: '2026-08-16', task_times: '22:00:00 - 22:05:00', user_num: 15, total_money: 98.40, children: kids('2026-08-16', '22:00:00', [8.80, 18.80, 12.40, 22.00, 16.50, 8.80]) },
      { _id: 'mr8', date: '2026-08-15', task_times: '20:00:00 - 20:05:00', user_num: 28, total_money: 210.60, children: kids('2026-08-15', '20:00:00', [18.80, 36.20, 22.10, 41.50, 12.80, 28.40]) }
    ];
  }

  function defaultDailyTaskReports() {
    return [
      { _id: 'dtr1', period: '20260816', task_name: '钓鱼投注100', game_type_id: '57', game_type: '钓鱼', task_type: 1, claim_num: 18, total_amount: 270.00, claim_time: '2026-08-16 00:05:12', active_point: 20, amount: 15 },
      { _id: 'dtr2', period: '20260816', task_name: '赌场投注100', game_type_id: '54', game_type: '赌场', task_type: 1, claim_num: 24, total_amount: 360.00, claim_time: '2026-08-16 00:06:40', active_point: 20, amount: 15 },
      { _id: 'dtr3', period: '20260816', task_name: '投币口投注100', game_type_id: '51', game_type: '投币口', task_type: 1, claim_num: 11, total_amount: 165.00, claim_time: '2026-08-16 00:08:03', active_point: 20, amount: 15 },
      { _id: 'dtr4', period: '20260816', task_name: '宾果投注100', game_type_id: '55', game_type: '宾果', task_type: 1, claim_num: 9, total_amount: 135.00, claim_time: '2026-08-16 00:09:21', active_point: 20, amount: 15 },
      { _id: 'dtr5', period: '20260816', task_name: '初级活跃', game_type_id: '', game_type: '—', task_type: 2, claim_num: 7, total_amount: 35.00, claim_time: '2026-08-16 00:10:00', active_point: 20, amount: 5 },
      { _id: 'dtr6', period: '20260815', task_name: '中级活跃', game_type_id: '', game_type: '—', task_type: 2, claim_num: 4, total_amount: 60.00, claim_time: '2026-08-15 00:10:00', active_point: 50, amount: 15 }
    ];
  }

  var ACT_TYPES = [
    { id: 'first', label: '当日首存活动' },
    { id: 'weekLoss', label: '周亏损返现' },
    { id: 'dayLoss', label: '日亏损返现' },
    { id: 'rain', label: '金钱如雨' },
    { id: 'turntable', label: '转盘奖励' },
    { id: 'ad', label: '广告活动' },
    { id: 'customAct', label: '自定义活动' },
    { id: 'regBonus', label: '注册免费送' },
    { id: 'rebate', label: '投注返水' },
    { id: 'lottery', label: '抽奖活动' },
    { id: 'video', label: '视频完播奖励' },
    { id: 'returnPlayer', label: '回归玩家福利赠送' },
    { id: 'prizeOnPrize', label: '奖上奖' },
    { id: 'box', label: '宝箱裂变活动' },
    { id: 'slotDaily', label: 'slot日返利' },
    { id: 'weekInvite', label: '周邀请活动' },
    { id: 'vip', label: 'vip' },
    { id: 'checkin', label: '每日签到' },
    { id: 'dailyEgg', label: '天天砸金蛋' },
    { id: 'rescue', label: '次日救援金' },
    { id: 'weekGift', label: '礼金周周送' },
    { id: 'dailyLucky', label: '天天好运金' },
    { id: 'monthGift', label: '月存好礼' }
  ];

  var ACT_NO_FLOAT = {
    rescue: 1, checkin: 1, first: 1, rebate: 1, weekLoss: 1, dayLoss: 1,
    regBonus: 1, video: 1, returnPlayer: 1, prizeOnPrize: 1, slotDaily: 1,
    weekInvite: 1, vip: 1, dailyEgg: 1, weekGift: 1, dailyLucky: 1, monthGift: 1
  };

  var ACT_TYPE_FIELDS = {
    first: [
      { key: 'first_real_times', label: '当日首存返真金次数', kind: 'step', min: 1, max: 999, def: 30 },
      { key: 'first_bonus_times', label: '当日首存返彩金次数', kind: 'step', min: 1, max: 999, def: 30 },
      { key: 'first_keep_mult', label: '当日首存保留彩金任务需打真金流水倍数', kind: 'step', min: 1, max: 999, def: 1 },
      { key: 'reload_keep_mult', label: '当日续存保留彩金任务需打真金流水倍数', kind: 'step', min: 1, max: 999, def: 1 }
    ],
    weekLoss: [],
    dayLoss: [],
    rain: [],
    turntable: [],
    ad: [
      { key: 'jump_url', label: '外部网址', kind: 'text', def: '', ph: 'https://' }
    ],
    customAct: [
      { key: 'jump_url', label: '外部网址', kind: 'text', def: '', ph: 'https://' }
    ],
    regBonus: [
      { key: 'amount', label: '奖励金额', kind: 'step', min: 1, max: 999999, def: 18 },
      { key: 'wager', label: '流水倍数', kind: 'step', min: 1, max: 999, def: 1 }
    ],
    rebate: [
      { key: 'rebate_rate', label: '返水比例（%）', kind: 'step', min: 0, max: 100, def: 1 },
      { key: 'max_rebate', label: '最高返水', kind: 'step', min: 0, max: 999999, def: 0 }
    ],
    lottery: [],
    video: [
      { key: 'watch_sec', label: '观看时长', kind: 'step', min: 1, max: 9999, def: 30 },
      { key: 'amount', label: '奖励金额', kind: 'step', min: 1, max: 999999, def: 8 }
    ],
    returnPlayer: [
      { key: 'amount', label: '奖励金额', kind: 'step', min: 1, max: 999999, def: 38 },
      { key: 'wager', label: '流水倍数', kind: 'step', min: 1, max: 999, def: 1 }
    ],
    prizeOnPrize: [
      { key: 'popup_min', label: '奖上奖弹窗显示  奖励金额>=', kind: 'step', min: 0, max: 999999, def: 10 }
    ],
    box: [
      { key: 'stop_on_parent', label: '上级获得宝箱时停止累计', kind: 'switch', def: 0 }
    ],
    slotDaily: [
      { key: 'vip0_rate', label: 'VIP0返水比例(%)', kind: 'step', min: 0, max: 100, def: 1 },
      { key: 'vip15_rate', label: 'VIP1-5返水比例(%)', kind: 'step', min: 0, max: 100, def: 2 }
    ],
    weekInvite: [
      { key: 'ip_max', label: '同IP最多邀请几人', kind: 'step', min: 1, max: 99, def: 5 }
    ],
    vip: [
      { key: 'vip_ratio', label: 'VIP返现比例', kind: 'step', min: 0, max: 100, def: 5 }
    ],
    checkin: [
      { key: 'checkin_amount', label: '签到金额', kind: 'step', min: 1, max: 999999, def: 8 },
      { key: 'checkin_days', label: '签到天数', kind: 'step', min: 1, max: 31, def: 7 }
    ],
    dailyEgg: [
      { key: 'daily_times', label: '每日次数', kind: 'step', min: 1, max: 99, def: 3 },
      { key: 'amount', label: '奖励金额', kind: 'step', min: 1, max: 999999, def: 18 }
    ],
    rescue: [
      { key: 'rescue_on', label: '救援金开关', kind: 'switch', def: 1 },
      { key: 'cashback_ratio', label: '返现比例', kind: 'step', min: 0, max: 100, def: 10 }
    ],
    weekGift: [
      { key: 'weekly_bonus', label: '每周礼金', kind: 'step', min: 1, max: 999999, def: 38 },
      { key: 'wager', label: '流水倍数', kind: 'step', min: 1, max: 999, def: 1 }
    ],
    dailyLucky: [
      { key: 'daily_bonus', label: '每日礼金', kind: 'step', min: 1, max: 999999, def: 8 },
      { key: 'wager', label: '流水倍数', kind: 'step', min: 1, max: 999, def: 1 }
    ],
    monthGift: [
      { key: 'monthly_bonus', label: '每月礼金', kind: 'step', min: 1, max: 999999, def: 88 },
      { key: 'acc_deposit', label: '累计充值', kind: 'step', min: 1, max: 999999, def: 500 }
    ]
  };

  var ACT_VIP_LEVELS = ['vip0', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5'];
  var ACT_RAIN_VIP = ['VIP0', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5'];
  var ACT_RAIN_DATES = ['2026-08-16', '2026-08-17', '2026-08-22', '2026-08-23', '2026-08-29', '2026-08-30'];
  var ACT_RAIN_CYCLES = [
    { id: 'once', label: '仅当天' },
    { id: 'weekly', label: '每周重复' },
    { id: 'monthly', label: '每月重复' }
  ];
  var ACT_WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  var ACT_GAME_OPTS = [
    { id: 'slot', name: '电子' },
    { id: 'live', name: '真人' },
    { id: 'sports', name: '体育' },
    { id: 'chess', name: '棋牌' },
    { id: 'lottery', name: '彩票' },
    { id: 'fish', name: '捕鱼' }
  ];
  var ACT_TT_GAMES = [
    { id: 'Slot', name: 'Slot' },
    { id: 'Casino', name: 'Casino' },
    { id: 'Arcade', name: 'Arcade' },
    { id: 'Perya', name: 'Perya' },
    { id: 'Sports', name: 'Sports' },
    { id: 'Card', name: 'Card' },
    { id: 'Fishing', name: 'Fishing' },
    { id: 'Bingo', name: 'Bingo' },
    { id: 'Numeric', name: 'Numeric' }
  ];
  var ACT_LT_CONDS = ['分享至FB并@好友', '累计充值', '累计有效流水', '充值次数', '登录天数', '完成指定游戏局数'];
  var ACT_LT_PRIZE_TYPES = ['真金', '实物'];
  var ACT_TT_GAME_DETAIL = {
    Slot: ['Fortune Gems', 'Super Ace', 'Money Coming'],
    Casino: ['Baccarat A', 'Dragon Tiger'],
    Arcade: ['Coin Pusher'],
    Perya: ['Color Game'],
    Sports: ['NBA', 'Football'],
    Card: ['Tongits'],
    Fishing: ['Mega Fishing'],
    Bingo: ['Bingo Rush'],
    Numeric: ['3D Lotto']
  };

  function defaultWeekLossCfg() {
    return {
      mobileIcon: 0,
      pcIcon: 0,
      max_reward: 0,
      wager: '',
      games: [],
      vip_ratio: [0, 0, 0, 0, 0, 0],
      extra_on: 1,
      extra_ratio: [1, 1, 1, 1, 1, 1],
      extra_days: [1, 1, 1, 1, 1, 1, 1],
      total_loss_on: 0
    };
  }

  function defaultDayLossCfg() {
    return {
      mobileIcon: 0,
      pcIcon: 0,
      max_reward: 0,
      wager: '',
      games: [],
      vip_ratio: [0, 0, 0, 0, 0, 0],
      total_loss_on: 0,
      rescue_on: 0
    };
  }

  function emptyRainVip() {
    return { total: '', min: '', max: '' };
  }

  function defaultRainCfg() {
    return {
      mobileIcon: 0,
      pcIcon: 0,
      join_recharge: 0,
      session_reward: 0,
      max_amount: 0,
      wager: '',
      daily_copy: '',
      daily_slots: [],
      extra_date: '',
      extra_copy: '',
      extra_cycle: '',
      extra_cycle_copy: '',
      extra_slots: [],
      rain_total: '',
      vip_rain: [emptyRainVip(), emptyRainVip(), emptyRainVip(), emptyRainVip(), emptyRainVip(), emptyRainVip()]
    };
  }

  function demoRainCfg() {
    var cfg = defaultRainCfg();
    cfg.mobileIcon = 1;
    cfg.pcIcon = 1;
    cfg.join_recharge = 100;
    cfg.session_reward = 888;
    cfg.max_amount = 1888;
    cfg.wager = '1';
    cfg.daily_copy = '每日整点红包雨，先到先得';
    cfg.daily_slots = [
      { start: '12:00:00', end: '12:05:00' },
      { start: '14:00:00', end: '14:05:00' },
      { start: '16:00:00', end: '16:05:00' },
      { start: '18:00:00', end: '18:05:00' },
      { start: '20:00:00', end: '20:05:00' },
      { start: '21:00:00', end: '21:05:00' },
      { start: '22:00:00', end: '22:05:00' }
    ];
    cfg.extra_date = '2026-08-16';
    cfg.extra_copy = '周末加场红包雨';
    cfg.extra_cycle = 'weekly';
    cfg.extra_cycle_copy = '每周六日加场一场';
    cfg.extra_slots = [{ start: '19:00:00', end: '19:10:00' }];
    cfg.rain_total = 10000;
    cfg.vip_rain = [
      { total: 800, min: 1, max: 8 },
      { total: 1200, min: 2, max: 12 },
      { total: 1500, min: 3, max: 18 },
      { total: 1800, min: 5, max: 28 },
      { total: 2200, min: 8, max: 38 },
      { total: 2500, min: 10, max: 58 }
    ];
    return cfg;
  }

  function defaultTurntableCfg() {
    return {
      mobileIcon: 0,
      pcIcon: 0,
      reward_amount: 0,
      init_min: 0,
      init_max: 0,
      cycle_days: 3,
      rand_min_pct: '',
      rand_max_pct: '',
      rand_max_times: '',
      task1_loss: '',
      task1_pct: '',
      task1_games: [],
      task1_detail: [],
      task2_invite: '',
      task2_third: '',
      task2_pct: '',
      sms_tpl: ''
    };
  }

  function demoTurntableCfg() {
    var cfg = defaultTurntableCfg();
    cfg.mobileIcon = 1;
    cfg.pcIcon = 1;
    cfg.reward_amount = 888;
    cfg.init_min = 18;
    cfg.init_max = 88;
    cfg.cycle_days = 3;
    cfg.rand_min_pct = 5;
    cfg.rand_max_pct = 15;
    cfg.rand_max_times = 5;
    cfg.task1_loss = 500;
    cfg.task1_pct = 30;
    cfg.task1_games = ['Slot', 'Casino'];
    cfg.task1_detail = ['Fortune Gems', 'Super Ace', 'Baccarat A'];
    cfg.task2_invite = 3;
    cfg.task2_third = 1;
    cfg.task2_pct = 50;
    cfg.sms_tpl = '来转盘领奖，分享链接以代替';
    return cfg;
  }

  function emptyLotteryVip() {
    return [0, 1, 2, 3, 4, 5].map(function (lv) { return { lv: lv, min: '', max: '' }; });
  }

  function defaultLotteryCfg() {
    return {
      mobileIcon: 0,
      pcIcon: 0,
      startAt: '',
      cycle_days: '',
      share_text: '分享至FB并@5个好友',
      share_on: 1,
      share_sort: 1,
      promo: [{ en: 0, fil: 0 }],
      video_en: 0,
      video_fil: 0,
      games: [],
      tasks: [],
      rain_wager: '',
      rain_mode: 'all',
      rain_slots: [],
      rain_total_amt: 0,
      rain_count: 0,
      rain_vip: emptyLotteryVip(),
      ranks: [{ from: 1, to: 10, desc: '' }],
      prizes: [],
      guarantee: '',
      guarantee_img: 0,
      share_url: '',
      official: ''
    };
  }

  function lotteryRankLabel(row) {
    return 'top ' + Number(row.from || 0) + ' ~ ' + Number(row.to || 0);
  }

  function demoLotteryCfg() {
    var cfg = defaultLotteryCfg();
    cfg.mobileIcon = 1;
    cfg.pcIcon = 1;
    cfg.startAt = '2026-08-01 00:00:00';
    cfg.cycle_days = 7;
    cfg.promo = [{ en: 1, fil: 1 }];
    cfg.video_en = 1;
    cfg.video_fil = 1;
    cfg.games = ['slot', 'live'];
    cfg.tasks = [
      { sort: 2, cond: '累计充值', value: '1111' },
      { sort: 3, cond: '累计有效流水', value: '1111' },
      { sort: 4, cond: '充值次数', value: '1' }
    ];
    cfg.rain_wager = '1';
    cfg.rain_total_amt = 8888;
    cfg.rain_count = 100;
    cfg.rain_vip = [
      { lv: 0, min: '1', max: '5' },
      { lv: 1, min: '3', max: '10' },
      { lv: 2, min: '8', max: '20' },
      { lv: 3, min: '15', max: '40' },
      { lv: 4, min: '30', max: '80' },
      { lv: 5, min: '50', max: '200' }
    ];
    cfg.ranks = [
      { from: 1, to: 3, desc: '冠军榜' },
      { from: 4, to: 10, desc: '优胜榜' },
      { from: 11, to: 50, desc: '参与榜' }
    ];
    cfg.prizes = [
      { sort: 1, qty: 1, type: '真金', name: '真金 8888', rank: 'top 1 ~ 3', value: '8888', img: 1 },
      { sort: 2, qty: 1, type: '实物', name: 'iPhone 17 Pro Max', rank: 'top 1 ~ 3', value: '49999', img: 1 },
      { sort: 5, qty: 3, type: '实物', name: 'Xiaomi', rank: 'top 4 ~ 10', value: '8999', img: 1 },
      { sort: 3, qty: 7, type: '真金', name: '真金 888', rank: 'top 4 ~ 10', value: '888', img: 1 },
      { sort: 4, qty: 40, type: '真金', name: '真金 88', rank: 'top 11 ~ 50', value: '88', img: 1 }
    ];
    cfg.guarantee = '8';
    cfg.guarantee_img = 1;
    cfg.share_url = 'https://www.facebook.com/juan365';
    cfg.official = '@Juan365Official';
    return cfg;
  }

  function defaultActCfg(type) {
    if (type === 'weekLoss') return defaultWeekLossCfg();
    if (type === 'dayLoss') return defaultDayLossCfg();
    if (type === 'rain') return defaultRainCfg();
    if (type === 'turntable') return defaultTurntableCfg();
    if (type === 'lottery') return defaultLotteryCfg();
    var out = {};
    (ACT_TYPE_FIELDS[type] || []).forEach(function (f) { out[f.key] = f.def; });
    return out;
  }

  function defaultActivityTags() {
    return [
      { id: 'tg3', name: 'New' },
      { id: 'tg2', name: 'GO活动' },
      { id: 'tg4', name: '广告活动' },
      { id: 'tg5', name: '亏损返现活动' },
      { id: 'tg6', name: '返水活动' },
      { id: 'tg1', name: '活动平台活动' }
    ];
  }

  function defaultActivities() {
    return [
      { id: '1500275', title: '次日救援金', type: 'rescue', tag: '活动平台活动', sort: 1003, status: 0, floatOn: null, startAt: '2026-05-01 00:00:00', endAt: '', createdAt: '2026-04-28 10:12:08' },
      { id: '1500270', title: '每日签到', type: 'checkin', tag: 'GO活动', sort: 1002, status: 1, floatOn: null, startAt: '2026-05-01 00:00:00', endAt: '', createdAt: '2026-04-26 09:30:00' },
      { id: '1350272', title: '宝箱裂变0501', type: 'box', tag: 'GO活动', sort: 1001, status: 1, floatOn: 1, startAt: '2026-05-01 00:00:00', endAt: '2026-12-31 23:59:59', createdAt: '2026-04-20 11:20:00' },
      { id: '720263', title: '测试自定义跳转', type: 'customAct', tag: 'New', sort: 1000, status: 1, floatOn: null, startAt: '2026-04-16 00:00:00', endAt: '', createdAt: '2026-04-16 14:08:22' },
      { id: '1500265', title: 'Lucky Draw 本期', type: 'lottery', tag: '活动平台活动', sort: 998, status: 1, floatOn: 1, startAt: '2026-08-01 00:00:00', endAt: '2026-08-31 23:59:59', createdAt: '2026-07-20 10:00:00', cfg: demoLotteryCfg() },
      { id: '1500262', title: '金钱如雨周末场', type: 'rain', tag: 'GO活动', sort: 996, status: 1, floatOn: 1, startAt: '2026-08-01 00:00:00', endAt: '2026-08-31 23:59:59', createdAt: '2026-07-21 10:00:00', cfg: demoRainCfg() },
      { id: '1500248', title: '转盘奖励', type: 'turntable', tag: 'New', sort: 994, status: 1, floatOn: 1, startAt: '2026-08-01 00:00:00', endAt: '2026-08-31 23:59:59', createdAt: '2026-07-25 15:30:00', cfg: demoTurntableCfg() },
      { id: '1500258', title: '周末亏损返现', type: 'weekLoss', tag: '活动平台活动', sort: 990, status: 0, floatOn: null, startAt: '2026-08-08 00:00:00', endAt: '2026-08-10 23:59:59', createdAt: '2026-08-05 12:00:00', cfg: defaultWeekLossCfg() },
      { id: '1500255', title: '日亏损返现', type: 'dayLoss', tag: '亏损返现活动', sort: 988, status: 1, floatOn: null, startAt: '2026-08-01 00:00:00', endAt: '', createdAt: '2026-07-30 11:20:00', cfg: defaultDayLossCfg() },
      { id: '1500251', title: '返水活动', type: 'rebate', tag: 'New', sort: 980, status: 1, floatOn: null, startAt: '2026-08-01 00:00:00', endAt: '2026-12-31 23:59:59', createdAt: '2026-07-22 10:00:00' }
    ];
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function fmt(d) {
    if (!(d instanceof Date)) d = new Date(d);
    if (isNaN(d.getTime())) return '--';
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  function money(n) {
    var x = Number(n || 0);
    return x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function emptyWallets() {
    var w = {};
    CURRENCIES.forEach(function (c) {
      var plats = {};
      PLATFORMS.forEach(function (p) { plats[p] = 0; });
      w[c] = { main: 0, frozen: 0, platforms: plats };
    });
    return w;
  }

  function seed() {
    var now = Date.now();
    var members = [
      {
        id: 'wjfytn329022', account: 'wjfytn329022', nick: 'wjfytn329022', vip: 1, level: 'Lv.1',
        phone: '134****4423', phoneRaw: '13488884423', tier: 'lalalal', agent: 'nekousdt2026 (中国)',
        inviter: '-', regAt: '2026-06-10 17:32:09', status: 1, lastLogin: '2026-08-15 21:04:11',
        ip: '124.83.12.44'
      },
      { id: 'Zipper123', account: 'Zipper123', nick: 'Zipper', vip: 3, level: 'Lv.3', phone: '917****2201', phoneRaw: '9175552201', tier: 'VIP高价值', agent: 'nekousdt2026 (中国)', inviter: 'ref_88', regAt: '2026-03-02 11:20:00', status: 1, lastLogin: '2026-08-16 01:12:08', ip: '49.145.8.19' },
      { id: 'Zipper133', account: 'Zipper133', nick: 'Zip', vip: 2, level: 'Lv.2', phone: '918****0091', phoneRaw: '9183330091', tier: '普通', agent: '-', inviter: '-', regAt: '2026-04-18 09:01:22', status: 1, lastLogin: '2026-08-14 18:40:00', ip: '112.200.11.8' },
      { id: 'maria_ph', account: 'maria_ph', nick: 'Maria', vip: 4, level: 'Lv.4', phone: '919****4410', phoneRaw: '9192224410', tier: 'VIP高价值', agent: 'agent_manila', inviter: 'ref_12', regAt: '2025-12-01 08:00:00', status: 1, lastLogin: '2026-08-16 03:22:41', ip: '180.190.22.7' },
      { id: 'juanok01', account: 'juanok01', nick: 'Juan', vip: 0, level: 'Lv.0', phone: '920****1188', phoneRaw: '9201111188', tier: '新客', agent: '-', inviter: '-', regAt: '2026-08-10 14:11:09', status: 1, lastLogin: '2026-08-10 14:12:00', ip: '49.145.1.2' },
      { id: 'risk_user', account: 'risk_user', nick: 'Risk', vip: 1, level: 'Lv.1', phone: '921****0000', phoneRaw: '9210000000', tier: '观察', agent: '-', inviter: '-', regAt: '2026-07-01 00:00:00', status: 2, lastLogin: '2026-07-22 19:00:00', ip: '103.10.10.10' }
    ];
    members.forEach(function (m) {
      m.wallets = emptyWallets();
      m.wallets.CNY.main = m.id === 'wjfytn329022' ? 2710 : (m.vip * 880 + 120);
      m.wallets.CNY.frozen = m.id === 'maria_ph' ? 500 : 0;
      if (m.id === 'Zipper123') {
        m.wallets.CNY.platforms['B体育'] = 12364.23;
        m.wallets.CNY.platforms['FB体育'] = 800;
      }
      if (m.id === 'maria_ph') {
        m.wallets.USDT.main = 420.5;
        m.wallets.USDT.platforms['EL真人'] = 88;
      }
      m.email = m.account + '@mail.ph';
      m.realName = m.nick;
      m.birthday = '1995-01-01';
      m.inviteCode = m.inviter === '-' ? '' : m.inviter;
      m.inviteVisits = m.vip * 3;
      m.bonusMoney = m.vip * 20;
      m.hasTask = m.id === 'Zipper123' ? 1 : 0;
      m.online = m.id === 'maria_ph' || m.id === 'Zipper123' ? 1 : 0;
      m.demo = 0;
      m.test = m.id === 'risk_user' ? 1 : 0;
      m.site = m.agent && m.agent !== '-' ? 'Manila-01' : '官网';
      m.siteType = m.site === '官网' ? '1' : '2';
      m.remark = '';
      m.box = 0;
      m.regFace = 'A';
      m.userLabel = m.tier;
    });

    var tiers = [
      { id: 't0', name: '新客', min: 0, max: 999, rebate: 0, remark: '注册默认' },
      { id: 't1', name: '普通', min: 1000, max: 9999, rebate: 0.5, remark: '' },
      { id: 't2', name: 'lalalal', min: 0, max: 0, rebate: 0, remark: '演示层级名，与线上截图一致' },
      { id: 't3', name: 'VIP高价值', min: 10000, max: 999999, rebate: 1.2, remark: '人工打标' },
      { id: 't4', name: '观察', min: 0, max: 0, rebate: 0, remark: '风控观察，不自动升降' }
    ];

    var loginLogs = [
      { id: 'l1', account: 'wjfytn329022', ip: '124.83.12.44', device: 'Chrome / macOS', result: '成功', at: '2026-08-15 21:04:11' },
      { id: 'l2', account: 'Zipper123', ip: '49.145.8.19', device: 'Safari / iOS', result: '成功', at: '2026-08-16 01:12:08' },
      { id: 'l3', account: 'risk_user', ip: '103.10.10.10', device: 'Unknown', result: '失败', at: '2026-07-22 19:00:00' },
      { id: 'l4', account: 'maria_ph', ip: '180.190.22.7', device: 'Chrome / Android', result: '成功', at: '2026-08-16 03:22:41' }
    ];

    var bets = [
      { id: 'b1', account: 'Zipper123', vendor: 'B体育', game: 'NBA', amount: 500, valid: 500, win: -500, at: '2026-08-15 20:11:00', status: '已结算' },
      { id: 'b2', account: 'maria_ph', vendor: 'EL真人', game: 'Baccarat', amount: 200, valid: 200, win: 190, at: '2026-08-16 02:01:22', status: '已结算' },
      { id: 'b3', account: 'wjfytn329022', vendor: 'FG电子', game: 'Fortune Ox', amount: 20, valid: 20, win: 0, at: '2026-08-14 12:00:00', status: '已结算' },
      { id: 'b4', account: 'Zipper133', vendor: 'QM棋牌', game: 'Tongits', amount: 50, valid: 0, win: 0, at: '2026-08-16 04:00:00', status: '未结算' }
    ];

    var gameRecords = [
      { id: 'g1', account: 'maria_ph', vendor: 'EL真人', game: 'Baccarat A', rounds: 12, at: '2026-08-16 02:10:00' },
      { id: 'g2', account: 'Zipper123', vendor: 'B体育', game: 'NBA', rounds: 1, at: '2026-08-15 20:11:00' }
    ];

    var bonus = [
      { id: 'bo1', account: 'juanok01', type: '注册礼', amount: 28, status: '已发放', at: '2026-08-10 14:12:30', operator: 'admin' },
      { id: 'bo2', account: 'Zipper123', type: '抽奖现金', amount: 88, status: '已发放', at: '2026-08-12 09:00:00', operator: 'system' },
      { id: 'bo3', account: 'maria_ph', type: 'QRPH返利', amount: 15.5, status: '已发放', at: '2026-08-15 18:22:00', operator: 'system' }
    ];

    var deposits = [
      { id: 'D20260816001', account: 'maria_ph', channel: 'QRPH', amount: 1550, fee: 0, actual: 1550, status: '已通过', at: '2026-08-15 18:20:11', operator: 'caiwu01', remark: '' },
      { id: 'D20260816002', account: 'Zipper123', channel: 'GCash', amount: 2000, fee: 0, actual: 2000, status: '待审核', at: '2026-08-16 04:01:00', operator: '-', remark: '' },
      { id: 'D20260816003', account: 'juanok01', channel: 'Maya', amount: 300, fee: 0, actual: 300, status: '已拒绝', at: '2026-08-11 10:00:00', operator: 'caiwu01', remark: '姓名不符' }
    ];

    var withdraws = [
      { id: 'W20260816001', account: 'maria_ph', channel: 'GCash', amount: 500, fee: 0, actual: 500, status: '待审核', at: '2026-08-16 03:40:00', operator: '-', remark: '', turnoverOk: true },
      { id: 'W20260816002', account: 'Zipper123', channel: 'Bank', amount: 8000, fee: 20, actual: 7980, status: '处理中', at: '2026-08-15 22:00:00', operator: 'caiwu01', remark: '', turnoverOk: true },
      { id: 'W20260816003', account: 'risk_user', channel: 'GCash', amount: 100, fee: 0, actual: 100, status: '已拒绝', at: '2026-07-20 12:00:00', operator: 'admin', remark: '账号冻结', turnoverOk: false }
    ];

    var depChannels = [
      { id: 'c1', name: 'QRPH', type: '电子钱包', min: 100, max: 50000, fee: 0, status: 1, sort: 1, extra: '充值成功发 1% 真金返利（见优惠活动）' },
      { id: 'c2', name: 'GCash', type: '电子钱包', min: 100, max: 30000, fee: 0, status: 1, sort: 2, extra: '' },
      { id: 'c3', name: 'Maya', type: '电子钱包', min: 100, max: 20000, fee: 0, status: 1, sort: 3, extra: '' },
      { id: 'c4', name: 'Bank Transfer', type: '银行', min: 500, max: 100000, fee: 0, status: 0, sort: 4, extra: '维护中' }
    ];

    var wdChannels = [
      { id: 'w1', name: 'GCash', type: '电子钱包', min: 200, max: 50000, fee: 0, status: 1, sort: 1, extra: '' },
      { id: 'w2', name: 'Bank', type: '银行', min: 500, max: 200000, fee: 20, status: 1, sort: 2, extra: '固定手续费 20' }
    ];

    var ledger = [
      { id: 'ld1', account: 'maria_ph', type: '充值', amount: 1550, before: 0, after: 1550, at: '2026-08-15 18:20:12', operator: 'system', remark: 'QRPH' },
      { id: 'ld2', account: 'maria_ph', type: 'QRPH返利', amount: 15.5, before: 1550, after: 1565.5, at: '2026-08-15 18:22:00', operator: 'system', remark: '1%' },
      { id: 'ld3', account: 'wjfytn329022', type: '人工存入', amount: 2710, before: 0, after: 2710, at: '2026-06-11 10:00:00', operator: 'admin', remark: '演示开户' }
    ];

    var reclaim = [
      { id: 'r1', account: 'Zipper123', startAt: '2026-06-04 10:10:10', endAt: '2026-06-04 10:10:10', amount: 12364.23, before: 12364.23, after: 0, channel: 'B体育', status: '成功', operator: 'admin' },
      { id: 'r2', account: 'Zipper123', startAt: '2026-06-04 10:10:10', endAt: '2026-06-04 10:10:10', amount: 12364.23, before: 12364.23, after: '', channel: 'B体育', status: '失败', operator: 'admin' },
      { id: 'r3', account: 'Zipper133', startAt: '2026-06-04 10:10:10', endAt: '', amount: 12364.23, before: 12364.23, after: '', channel: 'FB体育', status: '处理中', operator: 'admin' }
    ];

    var games = [
      { id: 'gm1', vendor: 'B体育', name: 'NBA', cate: '体育', status: 1, hot: 1 },
      { id: 'gm2', vendor: 'EL真人', name: 'Baccarat', cate: '真人', status: 1, hot: 1 },
      { id: 'gm3', vendor: 'FG电子', name: 'Fortune Ox', cate: '电子', status: 1, hot: 0 },
      { id: 'gm4', vendor: 'QM棋牌', name: 'Tongits', cate: '棋牌', status: 1, hot: 1 },
      { id: 'gm5', vendor: '印度彩票', name: '4D', cate: '彩票', status: 0, hot: 0 }
    ];

    var vendors = [
      { id: 'v1', name: 'B体育', cate: '体育', status: 1, maintain: 0 },
      { id: 'v2', name: 'EL真人', cate: '真人', status: 1, maintain: 0 },
      { id: 'v3', name: 'FG电子', cate: '电子', status: 1, maintain: 0 },
      { id: 'v4', name: 'QM棋牌', cate: '棋牌', status: 1, maintain: 0 },
      { id: 'v5', name: '印度彩票', cate: '彩票', status: 1, maintain: 1 }
    ];

    var activities = defaultActivities();
    var activityTags = defaultActivityTags();

    var codes = defaultCodes();

    var tasks = [
      { account: 'Zipper123', vip: 3, period: '2026-08-11 ~ 2026-08-17', done: '分享任务', valid: 12800, rank: '区间B', qualify: '有', draws: 1 },
      { account: 'maria_ph', vip: 4, period: '2026-08-11 ~ 2026-08-17', done: '任选任务2', valid: 2200, rank: '区间A', qualify: '有', draws: 0 },
      { account: 'juanok01', vip: 0, period: '2026-08-11 ~ 2026-08-17', done: '-', valid: 0, rank: '-', qualify: '无', draws: 0 }
    ];

    var rain = [
      { account: 'Zipper123', vip: 3, slot: '20:00', amount: 8.8, at: '2026-08-15 20:00:12' },
      { account: 'maria_ph', vip: 4, slot: '20:00', amount: 18.8, at: '2026-08-15 20:00:09' }
    ];

    var memberReport = [
      { account: 'Zipper123', draws: 3, winCash: 88, winPhy: 0, rain: 8.8 },
      { account: 'maria_ph', draws: 1, winCash: 0, winPhy: 1, rain: 18.8 }
    ];

    return {
      members: members,
      tiers: tiers,
      loginLogs: loginLogs,
      bets: bets,
      gameRecords: gameRecords,
      bonus: bonus,
      deposits: deposits,
      withdraws: withdraws,
      depChannels: depChannels,
      wdChannels: wdChannels,
      ledger: ledger,
      reclaim: reclaim,
      games: games,
      vendors: vendors,
      activities: activities,
      activityTags: activityTags,
      codes: codes,
      tasks: tasks,
      rain: rain,
      memberReport: memberReport,
      groups: [
        { id: 'g1', name: 'lalalal', count: 1, remark: '演示分组' },
        { id: 'g2', name: 'VIP高价值', count: 2, remark: '高价值' },
        { id: 'g3', name: '普通', count: 1, remark: '' },
        { id: 'g4', name: '新客', count: 1, remark: '新注册' },
        { id: 'g5', name: '观察', count: 1, remark: '风控观察' },
        { id: 'g6', name: 'Day2用户', count: 2, remark: '注册次日分层' },
        { id: 'g7', name: 'Day3用户', count: 1, remark: '注册第3日分层' },
        { id: 'g8', name: 'Day4用户', count: 1, remark: '注册第4日分层' }
      ],
      bills: [
        { id: 'bi1', account: 'maria_ph', type: '充值', amount: 1550, at: '2026-08-15 18:20:11', remark: 'QRPH' },
        { id: 'bi2', account: 'wjfytn329022', type: '人工存入', amount: 2710, at: '2026-06-11 10:00:00', remark: '演示开户' }
      ],
      kyc: [
        { id: 'k1', account: 'Zipper123', name: 'Juan Dela Cruz', idType: 'PhilID', status: '待审核', at: '2026-08-14 10:00:00' },
        { id: 'k2', account: 'maria_ph', name: 'Maria Santos', idType: 'Passport', status: '已通过', at: '2026-01-03 09:00:00' }
      ],
      selfLimits: [
        { id: 's1', account: 'risk_user', type: '冷却期', days: 7, status: '生效中', at: '2026-07-22 19:00:00' }
      ],
      sms: [
        { id: 'sm1', phone: '917****2201', account: 'Zipper123', content: '登录验证码', status: '成功', at: '2026-08-16 01:12:00' }
      ],
      behaviorLogs: [
        { id: 'bh1', account: 'maria_ph', action: '进入游戏 EL真人', ip: '180.190.22.7', at: '2026-08-16 02:00:00' },
        { id: 'bh2', account: 'Zipper123', action: '申请提款', ip: '49.145.8.19', at: '2026-08-16 03:40:00' }
      ],
      wdAccounts: [
        { id: 'wa1', account: 'maria_ph', channel: 'GCash', no: '09****4410', status: '已绑定', at: '2026-01-02 08:00:00' },
        { id: 'wa2', account: 'Zipper123', channel: 'Bank', no: '****8891', status: '已绑定', at: '2026-03-02 11:30:00' }
      ],
      dashSnap: { firstRechargeTotal: 500101, agentTotal: 22, bigRTotal: 2822945 },
      tags: [{ id: 'hot', name: '热门' }, { id: 'dep', name: '充值' }],
      qrph: { enabled: true, rate: 1, minDeposit: 100, maxRebate: '', turnover: 1 },
      dailyTasks: defaultDailyTasks(),
      dailyTaskBase: defaultDailyTaskBase(),
      dailyTaskReports: defaultDailyTaskReports(),
      moneyRainReports: defaultMoneyRainReports(),
      codeEntry: 1,
      codeLimit: {
        once: 1,
        groups: [
          { codes: '43H35QG5,BSX3SJM7' },
          { codes: 'HZEN63JN,Z2XZRUW4' },
          { codes: '5C8MTV2M,H9P8PPGV' }
        ]
      },
      layerConfig: defaultLayerConfig(),
      layerReports: defaultLayerReports(),
      demo: { failApi: false, empty: false },
      catalog: {},
      catalogVer: 23,
      seq: 100
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var data = JSON.parse(raw);
        if (data && data.members) {
          if (!data.dailyTasks || !data.moneyRainReports || !data.codes || !data.codes[0] || !data.codes[0].redemption_code || !data.layerConfig || !data.layerConfig.rules || !data.codeLimit || !data.codeLimit.groups || !data.layerReports || !data.activityTags || data.catalogVer < 23) {
            if (!data.dailyTasks) {
              data.dailyTasks = defaultDailyTasks();
              data.dailyTaskBase = defaultDailyTaskBase();
              data.dailyTaskReports = defaultDailyTaskReports();
            }
            if (!data.moneyRainReports) data.moneyRainReports = defaultMoneyRainReports();
            data.codes = defaultCodes();
            data.codeEntry = data.codeEntry == null ? 1 : data.codeEntry;
            if (!data.codeLimit || !data.codeLimit.groups) {
              data.codeLimit = {
                once: 1,
                groups: [
                  { codes: '43H35QG5,BSX3SJM7' },
                  { codes: 'HZEN63JN,Z2XZRUW4' },
                  { codes: '5C8MTV2M,H9P8PPGV' }
                ]
              };
            }
            if (!data.layerReports || data.catalogVer < 14) data.layerReports = defaultLayerReports();
            if (!data.layerConfig || !data.layerConfig.rules || data.catalogVer < 15) {
              data.layerConfig = defaultLayerConfig();
            }
            if (!data.activityTags || data.catalogVer < 16) {
              data.activities = defaultActivities();
              data.activityTags = defaultActivityTags();
            } else if (data.catalogVer < 17) {
              data.activityTags = defaultActivityTags();
            }
            if (data.catalogVer < 23) {
              data.activities = defaultActivities();
            }
            if (!data.groups || !data.groups.some(function (g) { return g.name === 'Day2用户'; })) {
              data.groups = (data.groups || []).concat([
                { id: 'g6', name: 'Day2用户', count: 2, remark: '注册次日分层' },
                { id: 'g7', name: 'Day3用户', count: 1, remark: '注册第3日分层' },
                { id: 'g8', name: 'Day4用户', count: 1, remark: '注册第4日分层' }
              ]);
            }
            data.catalogVer = 23;
            if (data.catalog) {
              delete data.catalog.taskDailyTask;
              delete data.catalog.moneyRainReport;
              delete data.catalog.codes;
            }
            save(data);
          }
          return data;
        }
      }
    } catch (e) {}
    var s = seed();
    save(s);
    return s;
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function reset() {
    var s = seed();
    save(s);
    return s;
  }

  function nextId(prefix, data) {
    var persist = !data;
    if (!data) data = load();
    data.seq = (data.seq || 100) + 1;
    if (persist) save(data);
    return prefix + data.seq;
  }

  function demoSession() {
    return { user: 'admin', name: 'admin', role: 'super', at: Date.now() };
  }

  function getSession() {
    try {
      var raw = sessionStorage.getItem(SESSION);
      var s = raw ? JSON.parse(raw) : null;
      if (s && s.role === 'super') return s;
    } catch (e) {}
    return ensureDemoSession();
  }

  function setSession(s) {
    if (!s) sessionStorage.removeItem(SESSION);
    else sessionStorage.setItem(SESSION, JSON.stringify(s));
  }

  function ensureDemoSession() {
    var s = demoSession();
    setSession(s);
    return s;
  }

  function login(user, pass) {
    var s = ensureDemoSession();
    return { ok: true, session: s };
  }

  function can(route) {
    var s = getSession();
    if (!s) return true;
    var r = ROLES[s.role];
    if (!r) return false;
    if (r.allow === '*') return true;
    return r.allow.indexOf(route) >= 0;
  }

  function pushLog(d, row) {
    d.ledger.unshift(row);
  }

  function findMember(d, account) {
    return d.members.filter(function (m) { return m.account === account || m.id === account; })[0];
  }

  var DEMO = {
    accounts: ['wjfytn329022', 'Zipper123', 'Zipper133', 'maria_ph', 'juanok01', 'risk_user', 'nekousdt2026', 'agent_manila'],
    nicks: ['wjfytn329022', 'Zipper', 'Zip', 'Maria Santos', 'Juan', 'Risk', 'Neko', 'Manila Agent'],
    phones: ['134****4423', '917****2201', '918****0091', '919****4410', '920****1188', '921****0000', '922****3310', '923****7741'],
    emails: ['wjfytn329022@mail.ph', 'zipper123@gmail.com', 'zip133@yahoo.com', 'maria.ph@mail.ph', 'juanok01@mail.ph', 'risk@mail.ph', 'neko@mail.ph', 'agent@mail.ph'],
    ips: ['124.83.12.44', '49.145.8.19', '112.200.11.8', '180.190.22.7', '49.145.1.2', '103.10.10.10', '124.83.9.18', '49.145.22.6'],
    times: ['2026-08-16 10:12:08', '2026-08-16 03:22:41', '2026-08-15 21:04:11', '2026-08-15 18:20:11', '2026-08-14 18:40:00', '2026-08-14 12:00:00', '2026-08-12 09:00:00', '2026-08-10 14:12:00'],
    dates: ['2026-08-16', '2026-08-15', '2026-08-14', '2026-08-13', '2026-08-12', '2026-08-11', '2026-08-10', '2026-08-09'],
    games: ['Fortune Ox', 'Baccarat A', 'NBA', 'Tongits', 'Sweet Bonanza', 'Andar Bahar', 'Color Game', 'Mega Wheel'],
    gameTypes: ['电子', '视讯', '体育', '棋牌', '捕鱼', '彩票', '电子', '视讯'],
    channels: ['QRPH', 'GCash', 'Maya', 'Bank Transfer', 'USDT-TRC20', 'GrabPay', 'PayMaya', 'UnionBank'],
    promos: ['周末亏损返现', '当日首存', '金钱如雨', '兑换码活动', '次日救援金', '押金返水', '广告活动', '宝箱裂变'],
    layers: ['Day2用户', 'Day3用户', 'Day4用户', '新客', '普通', 'VIP高价值', 'lalalal', '观察'],
    sites: ['官网', 'Manila-01', 'Cebu-02', '官网', 'Manila-01', '官网', 'Davao-01', '官网'],
    devices: ['Chrome / macOS', 'Safari / iOS', 'Chrome / Android', 'Chrome / Windows', 'Safari / iOS', 'Unknown', 'Edge / Windows', 'Chrome / Android'],
    places: ['菲律宾 · 马尼拉', '菲律宾 · 宿务', '菲律宾 · 达沃', '中国 · 广东', '菲律宾 · 马尼拉', '—', '菲律宾 · 宿务', '菲律宾 · 马尼拉'],
    remarks: ['—', '客服已核验', '系统自动', '人工复核', '—', '风控观察', '首存赠送', '—'],
    notices: ['系统维护通知', '充值到账提醒', '活动即将开始', '提款审核通过', 'VIP升级通知', '安全登录提醒', '红包雨预告', '渠道更新说明']
  };

  function pick(arr, i) {
    return arr[i % arr.length];
  }

  function demoStatus(title, i) {
    var t = String(title || '');
    if (/审核|充值|提款|KYC|出款/.test(t)) return pick(['待审核', '已通过', '已拒绝', '已通过'], i);
    if (/领取|奖励|返现|返水|彩金/.test(t)) return pick(['已领取', '未领取', '已过期', '已领取'], i);
    if (/投注|注单|结算|记录/.test(t) && !/白名单|登录/.test(t)) return pick(['已结算', '已结算', '未结算', '已结算'], i);
    if (/短信|发送/.test(t)) return pick(['成功', '成功', '失败', '成功'], i);
    if (/登录/.test(t)) return pick(['成功', '成功', '失败', '成功'], i);
    if (/绑定|账户/.test(t)) return pick(['已绑定', '已绑定', '已解绑', '已绑定'], i);
    return i % 5 === 4 ? '关闭' : '开启';
  }

  function demoName(spec, i) {
    var t = (spec && spec.title) || '';
    if (/活动|优惠|促销/.test(t)) return pick(DEMO.promos, i);
    if (/渠道|通道|金流/.test(t)) return pick(DEMO.channels, i);
    if (/游戏/.test(t) && !/厂商|类型/.test(t)) return pick(DEMO.games, i);
    if (/厂商|平台/.test(t)) return pick(PLATFORMS, i);
    if (/公告|消息|站内信|新闻/.test(t)) return pick(DEMO.notices, i);
    if (/分层|分组|层级/.test(t)) return pick(DEMO.layers, i);
    if (/任务/.test(t)) return pick(['电子满额礼', '视讯局数礼', '体育投注礼', '每日登录礼', '充值达标礼', '棋牌对局礼', '亏损救援礼', '连续登录礼'], i);
    if (/模板/.test(t)) return pick(['首存彩金', '救援金', '周返现', '生日礼'], i);
    var short = t.replace(/管理|配置|列表|报表|统计|明细|记录/g, '') || t;
    return short + (i + 1);
  }

  function demoValue(label, field, i, spec) {
    var h = String(label || '') + ' ' + String(field || '');
    var title = (spec && spec.title) || '';
    if (/会员账户|用户账户|会员账号|username|game_user|user_name|accountName/i.test(h) && !/数量|人数|数/.test(h)) return pick(DEMO.accounts, i);
    if (/真实姓名|real_name|nick|收款人/.test(h)) return pick(DEMO.nicks, i);
    if (/手机/.test(h)) return pick(DEMO.phones, i);
    if (/邮箱|email/.test(h)) return pick(DEMO.emails, i);
    if (/\bIP\b|ip_|\.ip|loginIp|betIP|投注IP|登录IP|注册IP|操作IP/i.test(h)) return pick(DEMO.ips, i);
    if (/母单|子单|订单|注单|流水号|sn\b|order/i.test(h) && !/金额|人数/.test(h)) return 'SN260816' + (10086 + i);
    if (/推荐码|invite/.test(h)) return pick(['ref_88', 'ref_12', '—', 'ref_03'], i);
    if (/金额|余额|奖金|彩金|盈亏|下注|提现|充值|手续费|money|amount|profit|fee|bet(?!ting)/i.test(h) && !/率|比例|人数|次数|笔数/.test(h)) {
      return money(80 + (i % 8) * 188.25 + (i * 17) % 40);
    }
    if (/比例|费率|赔率|倍率|rate|odds|%/i.test(h)) return (0.8 + (i % 6) * 0.35).toFixed(2);
    if (/人数|人次|次数|笔数|数量|局数|count|num|user_cnt|round/i.test(h)) return String(2 + (i * 7) % 48);
    if (/状态|status|progress/.test(h)) return demoStatus(title + h, i);
    if (/时间|日期|date|time|_at$|_time$/.test(h)) {
      if (/日期|date/.test(h) && !/时间/.test(h)) return pick(DEMO.dates, i);
      return pick(DEMO.times, i);
    }
    if (/游戏名称|game_name/.test(h)) return pick(DEMO.games, i);
    if (/游戏类型|game_type|下注类型/.test(h)) return pick(DEMO.gameTypes, i);
    if (/游戏平台|游戏厂商|所属平台|platform|vendor|company/.test(h)) return pick(PLATFORMS, i);
    if (/通道|渠道|channel|三方/.test(h)) return pick(DEMO.channels, i);
    if (/分组|层级|VIP|tier|user_group/.test(h) && !/人数/.test(h)) return pick(DEMO.layers, i);
    if (/投注站|site_name|site/.test(h) && !/类型/.test(h)) return pick(DEMO.sites, i);
    if (/设备|os|driver/.test(h)) return pick(DEMO.devices, i);
    if (/地点|归属|location/.test(h)) return pick(DEMO.places, i);
    if (/备注|说明|remark|desc|content|详情信息/.test(h)) return pick(DEMO.remarks, i);
    if (/操作人|operator|发放人/.test(h)) return pick(['admin', 'caiwu01', 'system', 'admin'], i);
    if (/货币|币种|currency/.test(h)) return pick(CURRENCIES, i);
    if (/是否|试玩|热门|维护|测试|在线/.test(h)) return i % 3 === 0 ? '是' : '否';
    if (/任务ID|taskId|task_id/i.test(h)) return 'DT' + (1001 + i);
    if (/完成条件|completionConditions|condition_type/i.test(h)) {
      return pick(['当日电子有效投注 ≥ 500', '视讯局数 ≥ 8', '体育有效投注 ≥ 200', '当日登录 1 次', '当日充值 ≥ 100', '棋牌对局 ≥ 5', '当日亏损 ≥ 50', '连续登录 3 天'], i);
    }
    if (/任务说明|taskDescription/.test(h)) return pick(['完成指定投注即可领取', '完成局数后自动派发', '登录即可领取', '充值达标后领取'], i);
    if (/客户端展示名|clientDisplayName|show_name/.test(h)) {
      return pick(['电子满额礼', '视讯局数礼', '体育投注礼', '每日登录礼', '充值达标礼', '棋牌对局礼', '亏损救援礼', '连续登录礼'], i);
    }
    if (/活动奖励|activityReward|active_point/.test(h) && !/金额/.test(h)) return String(10 + i * 5);
    if (/名称|标题|name|title/.test(h)) return demoName(spec, i);
    if (/规则|rule/.test(h)) return pick(['充值天数 0–2 天', '充值天数 3–14 天', '充值天数 ≥ 15 天', '人工分层'], i);
    if (/排序|sort|权重|weight/.test(h)) return String(i + 1);
    if (/代码|code/.test(h) && !/邀请/.test(h)) return pick(['FG_OX', 'EL_BAC', 'B_NBA', 'QM_TON'], i);
    return demoName(spec, i);
  }

  global.AdminStore = {
    KEY: KEY,
    ROLES: ROLES,
    ACCOUNTS: ACCOUNTS,
    PLATFORMS: PLATFORMS,
    CURRENCIES: CURRENCIES,
    ACT_TYPES: ACT_TYPES,
    ACT_NO_FLOAT: ACT_NO_FLOAT,
    ACT_TYPE_FIELDS: ACT_TYPE_FIELDS,
    defaultActCfg: defaultActCfg,
    defaultWeekLossCfg: defaultWeekLossCfg,
    defaultDayLossCfg: defaultDayLossCfg,
    defaultRainCfg: defaultRainCfg,
    demoRainCfg: demoRainCfg,
    defaultTurntableCfg: defaultTurntableCfg,
    demoTurntableCfg: demoTurntableCfg,
    defaultLotteryCfg: defaultLotteryCfg,
    demoLotteryCfg: demoLotteryCfg,
    lotteryRankLabel: lotteryRankLabel,
    ACT_LT_CONDS: ACT_LT_CONDS,
    ACT_LT_PRIZE_TYPES: ACT_LT_PRIZE_TYPES,
    ACT_VIP_LEVELS: ACT_VIP_LEVELS,
    ACT_TT_GAMES: ACT_TT_GAMES,
    ACT_TT_GAME_DETAIL: ACT_TT_GAME_DETAIL,
    ACT_RAIN_VIP: ACT_RAIN_VIP,
    ACT_RAIN_DATES: ACT_RAIN_DATES,
    ACT_RAIN_CYCLES: ACT_RAIN_CYCLES,
    ACT_WEEK_DAYS: ACT_WEEK_DAYS,
    ACT_GAME_OPTS: ACT_GAME_OPTS,
    fmt: fmt,
    money: money,
    clone: clone,
    load: load,
    save: save,
    reset: reset,
    nextId: nextId,
    getSession: getSession,
    setSession: setSession,
    ensureDemoSession: ensureDemoSession,
    login: login,
    can: can,
    pushLog: pushLog,
    findMember: findMember,
    now: function () { return fmt(new Date()); },
    DEMO: DEMO,
    DAILY_GAME_TYPES: DAILY_GAME_TYPES,
    LAYER_VENUES: LAYER_VENUES,
    CATALOG_SEED_VER: 20,
    defaultLayerThresholds: defaultLayerThresholds,
    defaultLayerConfig: defaultLayerConfig,
    demoValue: demoValue,
    catalogRows: function (id) {
      var d = load();
      d.catalog = d.catalog || {};
      return d.catalog[id] || null;
    },
    setCatalogRows: function (id, rows) {
      var d = load();
      d.catalog = d.catalog || {};
      d.catalog[id] = rows;
      save(d);
      return d.catalog[id];
    }
  };
})(window);
