(function (global) {
  'use strict';

  var S = AdminStore;
  var U = AdminShell;

  function $(root, sel) { return root.querySelector(sel); }
  function $$(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }

  function failBlock(retry) {
    return '<div class="deny"><b>页面加载失败</b>接口超时或不可用（演示开关已打开）。<div style="margin-top:12px"><button class="btn btn-black" type="button" data-retry>重试</button></div></div>';
  }

  function emptyRow(cols) {
    return '<tr><td class="empty" colspan="' + cols + '"><span class="ico">▢</span>暂无数据</td></tr>';
  }

  function filterCard(fields, extraBtn) {
    var grid = fields.map(function (f) {
      var label = U.zh(f.label);
      var ph = f.placeholder;
      if (!ph || ph.indexOf('请') !== 0) {
        ph = (f.type === 'select' || f.type === 'daterange') ? ('请选择' + label) : ('请输入' + label);
      }
      var ctrl = '';
      if (f.type === 'select') {
        ctrl = '<select data-f="' + f.key + '"><option value="">' + U.escapeHtml(ph) + '</option>' +
          (f.options || []).map(function (o) {
            var v = typeof o === 'string' ? o : o.id;
            var l = typeof o === 'string' ? o : o.label;
            return '<option value="' + U.escapeHtml(String(v)) + '">' + U.escapeHtml(U.zh(l)) + '</option>';
          }).join('') + '</select>';
      } else if (f.type === 'daterange') {
        ctrl = '<div class="date-range"><input type="date" data-f="' + f.key + 'From" placeholder="开始日期"><span class="dash">-</span><input type="date" data-f="' + f.key + 'To" placeholder="结束日期"></div>';
      } else {
        ctrl = '<input type="text" data-f="' + f.key + '" placeholder="' + U.escapeHtml(ph) + '">';
      }
      return '<label class="fg' + (f.wide ? ' fg-wide' : '') + '"><span>' + U.escapeHtml(label) + '</span>' + ctrl + '</label>';
    }).join('');
    return '<div class="filter-card"><div class="filter-grid">' + grid + '</div>' +
      '<div class="filter-actions"><button class="btn btn-primary" type="button" data-search>搜索</button>' +
      '<button class="btn btn-secondary" type="button" data-reset>重置</button>' +
      (extraBtn || '') + '</div></div>';
  }

  function readFilters(root) {
    var q = {};
    $$ (root, '[data-f]').forEach(function (el) { q[el.getAttribute('data-f')] = el.value; });
    return q;
  }

  function setFilters(root, q) {
    Object.keys(q || {}).forEach(function (k) {
      var el = root.querySelector('[data-f="' + k + '"]');
      if (el) el.value = q[k];
    });
  }

  function tableWrap(head, body, min, foot) {
    var n = head.length;
    var w = min || Math.max(960, n * 112);
    return '<div class="table-wrap"><table class="list-table" style="min-width:' + w + 'px"><thead><tr>' +
      head.map(function (h, i) {
        var cls = '';
        if (i === 0 && String(h).indexOf('checkbox') >= 0) cls = ' class="col-check sticky-l"';
        else if (i === n - 1 && (String(h).indexOf('操作') >= 0 || String(h) === '操作')) cls = ' class="col-ops sticky-r"';
        return '<th' + cls + '>' + (String(h).indexOf('<') === 0 ? h : U.escapeHtml(U.zh(h))) + '</th>';
      }).join('') +
      '</tr></thead><tbody>' + body + '</tbody>' +
      (foot ? '<tfoot>' + foot + '</tfoot>' : '') +
      '</table></div>';
  }

  function pageShell(title, inner, keepTitle) {
    var head = keepTitle
      ? '<div class="page-head"><h1>' + title + '</h1></div>'
      : '';
    return '<div class="list-page">' + head + inner + '</div>';
  }

  function delayed(fn) {
    var d = S.load();
    if (d.demo.failApi) {
      fn(new Error('fail'));
      return;
    }
    setTimeout(function () { fn(null); }, 80);
  }

  function mountList(root, cfg) {
    var state = { page: 1, size: cfg.size || 20, q: cfg.initQ ? JSON.parse(JSON.stringify(cfg.initQ)) : {} };
    function draw() {
      delayed(function (err) {
        if (err) {
          root.innerHTML = pageShell(cfg.title, failBlock());
          var btn = root.querySelector('[data-retry]');
          if (btn) btn.onclick = draw;
          return;
        }
        var d = S.load();
        var rows = cfg.rows(d, state.q);
        if (d.demo.empty) rows = [];
        var pageRows = U.slicePage(rows, state);
        var body = pageRows.length ? pageRows.map(cfg.rowHtml).join('') : emptyRow(cfg.head.length);
        var bar = cfg.toolbar ? '<div class="toolbar table-bar"><div class="toolbar-left">' + cfg.toolbar + '</div></div>' : '';
        root.innerHTML = pageShell(cfg.title,
          (cfg.tip ? '<p class="page-tip">' + cfg.tip + '</p>' : '') +
          (cfg.filters ? filterCard(cfg.filters, cfg.extraBtn) : '') +
          '<div class="table-card">' + bar +
          tableWrap(cfg.head, body) + U.pagerHtml(state.page, state.size, rows.length) +
          '</div>'
        );
        setFilters(root, state.q);
        var search = root.querySelector('[data-search]');
        if (search) search.onclick = function () {
          var q = readFilters(root);
          if (cfg.validateQ) {
            var err = cfg.validateQ(q);
            if (err) { U.toast(err, 'err'); return; }
          }
          state.q = q;
          state.page = 1;
          draw();
        };
        var reset = root.querySelector('[data-reset]');
        if (reset) reset.onclick = function () {
          state.q = cfg.initQ ? JSON.parse(JSON.stringify(cfg.initQ)) : {};
          state.page = 1;
          draw();
        };
        $$ (root, '.filter-card input, .filter-card select').forEach(function (el) {
          el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); if (search) search.click(); }
          });
        });
        U.bindPager(root, state, draw);
        if (cfg.bind) cfg.bind(root, d, draw);
      });
    }
    draw();
  }

  function typeLabel(id) {
    var t = S.ACT_TYPES.filter(function (x) { return x.id === id; })[0];
    return t ? t.label : id;
  }

  function memberStatusText(m) {
    if (m.status === 1) return '正常';
    if (m.status === 2 || m.status === 0) return '冻结';
    if (m.status === 3) return '排除中';
    return '未完善';
  }

  function arcoFields(items) {
    return '<div class="arco-form">' + (items || []).map(function (it) {
      var ctrl = it.html || ('<input type="' + (it.type || 'text') + '" id="' + it.id + '" data-cf="' +
        U.escapeHtml(it.key || it.id || '') + '" value="' + U.escapeHtml(it.value == null ? '' : it.value) +
        '" placeholder="' + U.escapeHtml(it.ph || ('请输入' + it.label)) + '"' + (it.ro ? ' readonly disabled' : '') + '>');
      return '<div class="form-item"><label class="' + (it.req ? 'req' : '') + '">' + U.escapeHtml(it.label) +
        '</label><div class="ctrl">' + ctrl + (it.extra ? '<div class="extra">' + it.extra + '</div>' : '') + '</div></div>';
    }).join('') + '</div>';
  }

  function arcoDesc(pairs) {
    return '<div class="arco-desc">' + (pairs || []).map(function (p) {
      return '<div class="cell' + (p.span2 ? ' span2' : '') + '"><span>' + U.escapeHtml(p.label) +
        '</span><b>' + (p.html || U.escapeHtml(p.value == null || p.value === '' ? '—' : p.value)) + '</b></div>';
    }).join('') + '</div>';
  }

  function memberMiniTable(list) {
    if (!list || !list.length) {
      return '<div class="table-wrap"><table class="list-table"><tbody>' + emptyRow(6) + '</tbody></table></div>';
    }
    return '<div class="table-wrap"><table class="list-table"><thead><tr>' +
      '<th>会员账户</th><th>手机号</th><th>真实姓名</th><th>账号状态</th><th>会员分组</th><th>最后登录</th></tr></thead><tbody>' +
      list.map(function (m) {
        var acc = U.escapeHtml(m.account);
        return '<tr><td><button class="op-link acc-link" type="button" data-go-member="' + acc + '">' + acc + '</button></td>' +
          '<td>' + U.escapeHtml(m.phone || '—') + '</td><td>' + U.escapeHtml(m.realName || m.nick || '—') + '</td>' +
          '<td>' + U.badgeStatus(memberStatusText(m)) + '</td>' +
          '<td>' + U.escapeHtml(m.tier || '—') + '</td><td>' + U.escapeHtml(m.lastLogin || '—') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function bindDrawerMemberLinks() {
    $$ (document.getElementById('drawerBody'), '[data-go-member]').forEach(function (b) {
      b.onclick = function () {
        U.closeDrawer();
        location.hash = '#/memberDetail?id=' + encodeURIComponent(b.getAttribute('data-go-member'));
      };
    });
  }

  var Pages = {};

  Pages.dashboard = function (root) {
    var d = S.load();
    var today = S.now().slice(0, 10);
    var newToday = d.members.filter(function (m) { return (m.regAt || '').slice(0, 10) === today; }).length;
    var depToday = d.deposits.filter(function (x) { return (x.at || '').slice(0, 10) === today && x.status === '已通过'; });
    var wdToday = d.withdraws.filter(function (x) { return (x.at || '').slice(0, 10) === today && (x.status === '已通过' || x.status === '处理中'); });
    var depAmt = depToday.reduce(function (s, x) { return s + x.amount; }, 0);
    var wdAmt = wdToday.reduce(function (s, x) { return s + x.amount; }, 0);
    var betsToday = d.bets.filter(function (x) { return (x.at || '').slice(0, 10) === today; });
    var betAmt = betsToday.reduce(function (s, x) { return s + x.amount; }, 0);
    var bonusToday = d.bonus.filter(function (x) { return (x.at || '').slice(0, 10) === today; });
    var bonusAmt = bonusToday.reduce(function (s, x) { return s + x.amount; }, 0);
    var snap = d.dashSnap || { firstRechargeTotal: 500101, agentTotal: 22, bigRTotal: 2822945 };
    function card(cls, title, main, rows, icon, pctHtml) {
      return '<div class="dcard ' + cls + '"><div class="dcard-top"><span>' + title + '</span>' + pctHtml + '</div>' +
        '<div class="dcard-num">' + main + '</div>' +
        '<div class="dcard-rows">' + rows + '</div>' +
        '<span class="dcard-ico">' + icon + '</span></div>';
    }
    var icoUser = '<svg viewBox="0 0 24 24" width="28" height="28"><circle cx="12" cy="8" r="3.5" fill="currentColor"/><path d="M5 19c1.5-3 4-5 7-5s5.5 2 7 5" fill="currentColor"/></svg>';
    var icoUsers = '<svg viewBox="0 0 24 24" width="28" height="28"><circle cx="9" cy="8" r="3" fill="currentColor"/><circle cx="16" cy="9" r="2.4" fill="currentColor"/><path d="M3 19c1.2-3 3.2-4.5 6-4.5S14.8 16 16 19M14 19c.4-1.5 1.5-2.5 3.2-2.5 1.6 0 2.8 1 3.3 2.5" fill="currentColor"/></svg>';
    var icoPay = '<svg viewBox="0 0 24 24" width="28" height="28"><rect x="5" y="4" width="14" height="16" rx="2" fill="currentColor"/></svg>';
    var icoBet = '<svg viewBox="0 0 24 24" width="28" height="28"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>';
    var icoPl = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M5 6h14v12H5z" fill="currentColor"/></svg>';
    var icoTag = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M3 12l9-9h8v8l-9 9z" fill="currentColor"/></svg>';

    root.innerHTML = '<div class="dash">' +
      '<div class="dash-hero">' +
      '<div class="dash-admin"><span class="cat-av"></span><div>' +
      '<div class="dash-hi">管理员, 反馈!</div>' +
      '<div class="dash-meta">平台币种: PHP<span class="gap"></span>平台语言: 菲律宾语</div></div></div>' +
      '<div class="dash-clock"><b id="dashClock">--:--:--</b><span id="dashDate">----/--/--</span></div></div>' +
      '<div class="dcard-grid">' +
      card('c-orange', '今日新增', String(newToday), '今日首充 0<span>今日代理 0</span><span>今日大R 0</span>', icoUser, newToday ? '<em class="pct flat">0%</em>' : '<em class="pct down">-100%</em>') +
      card('c-blue', '会员总数', String(d.members.length), '总首充 ' + S.money(snap.firstRechargeTotal).replace(/\.00$/, '') + '<span>总代理 ' + snap.agentTotal + '</span><span>总大R ' + S.money(snap.bigRTotal).replace(/\.00$/, '') + '</span>', icoUsers, '<em class="pct flat">0%</em>') +
      card('c-pink', '充提差额', S.money(depAmt - wdAmt).replace(/\.00$/, ''), '今日充值 ' + S.money(depAmt).replace(/\.00$/, '') + '（' + depToday.length + '人）<span>今日提现 ' + S.money(wdAmt).replace(/\.00$/, '') + '（' + wdToday.length + '人）</span>', icoPay, (depAmt || wdAmt) ? '<em class="pct flat">0%</em>' : '<em class="pct down">-100%</em>') +
      card('c-navy', '今日投注', S.money(betAmt), '今日注单 ' + betsToday.length + '<span>今日杀率 0%</span>', icoBet, betAmt ? '<em class="pct flat">0%</em>' : '<em class="pct down">-100%</em>') +
      card('c-green', '今日损益', '0', '今日盈利 0<span>今日库存 0</span><span>会员余额 0</span>', icoPl, '<em class="pct down">-100%</em>') +
      card('c-purple', '今日优惠', S.money(bonusAmt).replace(/\.00$/, ''), '参与人数 ' + bonusToday.length + '<span>任务 ' + d.tasks.length + '</span><span>活动 ' + d.activities.length + '</span>', icoTag, bonusAmt ? '<em class="pct flat">0%</em>' : '<em class="pct down">-100%</em>') +
      '</div>' +
      '<div class="panel dash-chart"><h3>今日注册</h3>' +
      '<div class="line-wrap">' +
      '<svg class="line-svg" viewBox="0 0 720 220" preserveAspectRatio="none">' +
      '<line x1="40" y1="20" x2="700" y2="20" stroke="#eef0f3"/>' +
      '<line x1="40" y1="56" x2="700" y2="56" stroke="#eef0f3"/>' +
      '<line x1="40" y1="92" x2="700" y2="92" stroke="#eef0f3"/>' +
      '<line x1="40" y1="128" x2="700" y2="128" stroke="#eef0f3"/>' +
      '<line x1="40" y1="164" x2="700" y2="164" stroke="#eef0f3"/>' +
      '<line x1="40" y1="200" x2="700" y2="200" stroke="#d0d5dd"/>' +
      '<text x="8" y="24" fill="#98a2b3" font-size="10">1</text>' +
      '<text x="4" y="60" fill="#98a2b3" font-size="10">0.8</text>' +
      '<text x="4" y="96" fill="#98a2b3" font-size="10">0.6</text>' +
      '<text x="4" y="132" fill="#98a2b3" font-size="10">0.4</text>' +
      '<text x="4" y="168" fill="#98a2b3" font-size="10">0.2</text>' +
      '<text x="12" y="204" fill="#98a2b3" font-size="10">0</text>' +
      '<polyline fill="none" stroke="#1677ff" stroke-width="2" points="' + (function () {
        var pts = [];
        for (var h = 0; h <= 23; h++) pts.push((40 + h * (660 / 23)).toFixed(1) + ',200');
        return pts.join(' ');
      }()) + '"/>' +
      (function () {
        var d = '';
        for (var h = 0; h <= 23; h++) {
          var x = (40 + h * (660 / 23)).toFixed(1);
          d += '<circle cx="' + x + '" cy="200" r="3" fill="#1677ff"/>';
        }
        return d;
      }()) +
      '</svg></div>' +
      '<div class="line-x"><span>00:00:00</span><span>04:00:00</span><span>08:00:00</span><span>12:00:00</span><span>16:00:00</span><span>20:00:00</span><span>23:00:00</span></div>' +
      '</div></div>';

    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function tick() {
      var c = document.getElementById('dashClock');
      var dt = document.getElementById('dashDate');
      if (!c) { clearInterval(Pages._clock); return; }
      var n = new Date();
      c.textContent = pad(n.getHours()) + ':' + pad(n.getMinutes()) + ':' + pad(n.getSeconds());
      dt.textContent = n.getFullYear() + '/' + pad(n.getMonth() + 1) + '/' + pad(n.getDate());
    }
    tick();
    clearInterval(Pages._clock);
    Pages._clock = setInterval(tick, 1000);
  };

  Pages.members = function (root) {
    var groupOpts = (function () {
      var d = S.load();
      var names = {};
      (d.groups || []).forEach(function (g) { names[g.name] = 1; });
      (d.members || []).forEach(function (m) { if (m.tier) names[m.tier] = 1; });
      return Object.keys(names).map(function (n) { return { id: n, label: n }; });
    }());
    var yesNo12 = [{ id: '1', label: '是' }, { id: '2', label: '否' }];
    var yesNo10 = [{ id: '1', label: '是' }, { id: '0', label: '否' }];
    mountList(root, {
      title: '会员中心',
      filters: [
        { key: 'kw', label: '会员账户' },
        { key: 'invite', label: '推荐码' },
        { key: 'tenant', label: '所属平台', type: 'select', options: [{ id: 'PHP', label: 'PHP' }] },
        { key: 'email', label: '邮箱账号' },
        { key: 'mobile', label: '手机号' },
        { key: 'tier', label: '会员分组', type: 'select', options: groupOpts },
        { key: 'parent', label: '上级账户' },
        { key: 'hasTask', label: '是否有正在进行任务', type: 'select', options: yesNo12 },
        { key: 'regAt', label: '注册时间', type: 'daterange' },
        { key: 'lastLogin', label: '最后登录时间', type: 'daterange' },
        { key: 'status', label: '账号状态', type: 'select', options: [{ id: '1', label: '正常' }, { id: '2', label: '冻结' }, { id: '3', label: '排除中' }, { id: '-1', label: '未完善' }] },
        { key: 'demo', label: '是否试玩', type: 'select', options: yesNo10 },
        { key: 'loginIp', label: '最后登录IP' },
        { key: 'ip', label: '注册IP' },
        { key: 'site', label: '所属投注站', type: 'select', options: [{ id: 'Manila-01', label: 'Manila-01' }, { id: '官网', label: '官网' }] },
        { key: 'siteType', label: '投注站类型', type: 'select', options: [{ id: '1', label: '自营' }, { id: '2', label: '加盟' }] },
        { key: 'test', label: '是否测试账户', type: 'select', options: yesNo10 }
      ],
      toolbar: '<button class="btn btn-primary" type="button" data-add>新增</button><button class="btn btn-secondary" type="button" data-batch>批量冻结</button><button class="btn btn-secondary" type="button" data-excl>批量排除</button>',
      extraBtn: '',
      head: ['<input type="checkbox" data-all title="全选">', '会员账户', '会员分组', '所属平台', '真实姓名', '出生日期', '推荐码', '推荐码访问次数', '邮箱账号', '手机号', '上级账户', '余额', '彩金余额', '是否有正在进行任务', '彩金转真金总金额', '在线状态', '注册时间', '账号状态', '是否试玩', '最后登录时间', '注册IP', '所属投注站', '是否测试账户', '操作'],
      rows: function (d, q) {
        return d.members.filter(function (m) {
          if (q.kw && !(m.account.indexOf(q.kw) >= 0 || m.phone.indexOf(q.kw) >= 0 || String(m.id).indexOf(q.kw) >= 0)) return false;
          if (q.status !== '' && q.status != null) {
            var stv = String(m.status);
            if (q.status === '2') { if (stv !== '2' && stv !== '0') return false; }
            else if (stv !== q.status) return false;
          }
          if (q.tier && m.tier !== q.tier && m.userLabel !== q.tier) return false;
          if (q.tenant && q.tenant !== 'PHP') return false;
          if (q.test !== '' && q.test != null && String(m.test || 0) !== q.test) return false;
          if (q.demo !== '' && q.demo != null && String(m.demo || 0) !== q.demo) return false;
          if (q.hasTask === '1' && !m.hasTask) return false;
          if (q.hasTask === '2' && m.hasTask) return false;
          if (q.invite && String(m.inviteCode || '').indexOf(q.invite) < 0) return false;
          if (q.email && String(m.email || '').indexOf(q.email) < 0) return false;
          if (q.mobile && String(m.phone || '').indexOf(q.mobile) < 0 && String(m.phoneRaw || '').indexOf(q.mobile) < 0) return false;
          if (q.parent && String(m.agent || '').indexOf(q.parent) < 0) return false;
          if (q.ip && String(m.ip || '').indexOf(q.ip) < 0) return false;
          if (q.loginIp && String(m.ip || '').indexOf(q.loginIp) < 0) return false;
          if (q.site && String(m.site || '') !== q.site) return false;
          if (q.siteType && String(m.siteType || '1') !== q.siteType) return false;
          return true;
        });
      },
      rowHtml: function (m) {
        var st = m.status === 1 ? '正常' : (m.status === 3 ? '排除中' : (m.status === -1 ? '未完善' : '冻结'));
        var money = m.wallets && m.wallets.CNY ? m.wallets.CNY.main : 0;
        return '<tr><td class="col-check sticky-l"><input type="checkbox" data-id="' + U.escapeHtml(m.account) + '"></td><td class="td-acc sticky-l2"><button class="op-link acc-link" data-view="' + m.account + '">' + U.escapeHtml(m.account) + '</button></td><td>' + U.escapeHtml(m.tier) + '</td><td>PHP</td><td>' + U.escapeHtml(m.realName || m.nick) +
          '</td><td>' + U.escapeHtml(m.birthday || '-') + '</td><td>' + U.escapeHtml(m.inviteCode || '-') + '</td><td>' + (m.inviteVisits || 0) +
          '</td><td>' + U.escapeHtml(m.email || '-') + '</td><td>' + U.escapeHtml(m.phone) +
          '</td><td>' + U.escapeHtml(m.agent) + '</td><td class="amt-right">' + S.money(money) +
          '</td><td class="amt-right">' + S.money(m.bonusMoney || 0) + '</td><td>' + (m.hasTask ? '是' : '否') +
          '</td><td class="amt-right">' + S.money(m.bonusToMoney || 0) + '</td>' +
          '<td>' + (m.online ? '<span class="badge on">在线</span>' : '<span class="badge">离线</span>') +
          '</td><td>' + m.regAt + '</td><td>' + U.badgeStatus(st) + '</td><td>' + (m.demo ? '是' : '否') +
          '</td><td>' + m.lastLogin + '</td><td>' + U.escapeHtml(m.ip) +
          '</td><td>' + U.escapeHtml(m.site || '-') + '</td><td>' + (m.test ? '是' : '否') +
          '</td><td class="col-ops sticky-r">' +
          '<button class="op-link" data-view="' + m.account + '">查看详情</button>' +
          '<button class="op-link" data-freeze="' + m.account + '">' + (m.status === 1 ? '冻结' : '解冻') + '</button></td></tr>';
      },
      bind: function (root, d, redraw) {
        $$ (root, '[data-view]').forEach(function (b) {
          b.onclick = function () { location.hash = '#/memberDetail?id=' + encodeURIComponent(b.getAttribute('data-view')); };
        });
        $$ (root, '[data-freeze]').forEach(function (b) {
          b.onclick = function () {
            var acc = b.getAttribute('data-freeze');
            var data = S.load();
            var m = S.findMember(data, acc);
            var next = m.status === 1 ? 2 : 1;
            U.confirm(next === 2 ? '确认冻结该会员？冻结后无法登录前台。' : '确认解冻该会员？').then(function (ok) {
              if (!ok) return;
              m.status = next;
              S.save(data);
              U.toast(next === 2 ? '已冻结（演示）' : '已解冻（演示）');
              redraw();
            });
          };
        });
        var add = root.querySelector('[data-add]');
        if (add) add.onclick = function () {
          U.openDrawer('新增',
            arcoFields([
              { id: 'nAcc', label: '会员账户', req: true, ph: '请输入会员账户' },
              { id: 'nTier', label: '会员分组', html: '<select id="nTier">' + d.tiers.map(function (t) { return '<option>' + t.name + '</option>'; }).join('') + '</select>' },
              { id: 'nVip', label: 'VIP', type: 'number', value: 0 }
            ]),
            function () {
              var acc = document.getElementById('nAcc').value.trim();
              if (!acc) { U.toast('请输入账号', 'err'); return; }
              var data = S.load();
              if (S.findMember(data, acc)) { U.toast('账号已存在', 'err'); return; }
              var w = {};
              S.CURRENCIES.forEach(function (c) {
                var plats = {};
                S.PLATFORMS.forEach(function (p) { plats[p] = 0; });
                w[c] = { main: 0, frozen: 0, platforms: plats };
              });
              data.members.unshift({
                id: acc, account: acc, nick: acc, vip: Number(document.getElementById('nVip').value) || 0,
                level: 'Lv.' + (document.getElementById('nVip').value || 0), phone: '-', phoneRaw: '',
                tier: document.getElementById('nTier').value, agent: '-', inviter: '-',
                regAt: S.now(), status: 1, lastLogin: '-', ip: '-', wallets: w
              });
              S.save(data);
              U.closeDrawer();
              U.toast('已新增（演示，非正式开户）');
              redraw();
            });
        };
        var batch = root.querySelector('[data-batch]');
        if (batch) batch.onclick = function () {
          var ids = selected();
          if (!ids.length) { U.toast('请先勾选会员'); return; }
          U.confirm('确认冻结所选 ' + ids.length + ' 名会员？冻结后无法登录前台。').then(function (ok) {
            if (!ok) return;
            var data = S.load();
            ids.forEach(function (acc) {
              var m = S.findMember(data, acc);
              if (m) m.status = 2;
            });
            S.save(data);
            U.toast('已冻结 ' + ids.length + ' 名（演示）');
            redraw();
          });
        };
        var excl = root.querySelector('[data-excl]');
        if (excl) excl.onclick = function () {
          var ids = selected();
          if (!ids.length) { U.toast('请先勾选会员'); return; }
          U.confirm('确认将所选 ' + ids.length + ' 名会员设为排除中？').then(function (ok) {
            if (!ok) return;
            var data = S.load();
            ids.forEach(function (acc) {
              var m = S.findMember(data, acc);
              if (m) m.status = 3;
            });
            S.save(data);
            U.toast('已排除 ' + ids.length + ' 名（演示）');
            redraw();
          });
        };
        var all = root.querySelector('[data-all]');
        if (all) all.onclick = function () {
          $$ (root, 'tbody [data-id]').forEach(function (c) { c.checked = all.checked; });
        };
        var ex = root.querySelector('[data-export]');
        if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示）'); };
        function selected() {
          return $$ (root, 'tbody [data-id]:checked').map(function (c) { return c.getAttribute('data-id'); });
        }
      }
    });
  };

  Pages.memberDetail = function (root, q) {
    var id = (q && q.id) || '';
    var d = S.load();
    var m = S.findMember(d, id);
    if (!m) {
      root.innerHTML = '<div class="deny"><b>会员不存在或已注销</b><div style="margin-top:12px"><a class="btn btn-black" href="#/members">返回会员中心</a></div></div>';
      return;
    }
    var cur = 'CNY';
    function draw() {
      d = S.load();
      m = S.findMember(d, id);
      var w = m.wallets[cur];
      var sess = S.getSession();
      var canFund = sess && (sess.role === 'super' || sess.role === 'finance');
      var maint = {};
      d.vendors.forEach(function (v) { if (v.maintain) maint[v.name] = true; });
      var plats = S.PLATFORMS.map(function (p) {
        var bal = w.platforms[p] || 0;
        var ok = canFund && !maint[p];
        return '<div class="plat-item"><span class="nm">' + p + (maint[p] ? '（维护）' : '') + '</span><span class="bo">' + S.money(bal) + '</span>' +
          '<button class="link-btn" data-in="' + p + '"' + (ok ? '' : ' disabled') + '>转入</button>' +
          '<button class="link-btn" data-out="' + p + '"' + (ok ? '' : ' disabled') + '>转出</button></div>';
      }).join('');
      root.innerHTML = '<div class="list-page"><div class="page-head page-head-back"><a class="btn btn-ghost" href="#/members">返回</a></div><div class="md-wrap">' +
        '<aside class="md-side"><div class="md-avatar">' + m.account.slice(0, 2).toUpperCase() + '</div>' +
        '<div class="acc">' + U.escapeHtml(m.account) + '</div><div class="lv">' + (m.online ? '在线' : '离线') + ' · VIP' + m.vip + '</div>' +
        [
          ['会员账户', m.account], ['会员昵称', m.nick], ['会员推荐码', m.inviteCode || '-'],
          ['会员状态', m.status === 1 ? '正常' : '冻结'], ['是否在线', m.online ? '在线' : '离线'],
          ['VIP等级', 'VIP' + m.vip], ['邮箱地址', m.email || '-'], ['手机号', m.phone],
          ['注册时间', m.regAt], ['注册IP', m.ip], ['最后登录时间', m.lastLogin], ['上级代理', m.agent]
        ].map(function (r) {
          return '<div class="md-row"><span>' + r[0] + '</span><b>' + U.escapeHtml(r[1]) + '</b></div>';
        }).join('') + '</aside><section class="md-main">' +
        '<div class="cur-tabs">' + S.CURRENCIES.map(function (c) {
          return '<button type="button" class="' + (c === cur ? 'on' : '') + '" data-cur="' + c + '">' + c + '</button>';
        }).join('') + '</div>' +
        '<div class="md-head"><strong>平台余额</strong><button class="ico-btn" type="button" id="btnRefresh" title="刷新">↻</button></div>' +
        '<div class="bal-line"><span>主账户余额</span><span class="amt">' + S.money(w.main) + '</span>' +
        (canFund ? '<button class="link-btn" id="btnReclaim">一键回收</button>' : '') +
        '<span>提现冻结金额 ' + S.money(w.frozen) + '</span></div>' +
        '<div class="plat-grid">' + plats + '</div></section></div></div>';

      $$ (root, '[data-cur]').forEach(function (b) {
        b.onclick = function () { cur = b.getAttribute('data-cur'); draw(); };
      });
      var rf = document.getElementById('btnRefresh');
      if (rf) rf.onclick = function () {
        rf.classList.add('spin');
        setTimeout(function () { rf.classList.remove('spin'); U.toast('已刷新 ' + cur + ' 余额（演示）'); draw(); }, 500);
      };
      var rc = document.getElementById('btnReclaim');
      if (rc) rc.onclick = function () {
        var sum = 0;
        S.PLATFORMS.forEach(function (p) { sum += Number(w.platforms[p] || 0); });
        if (sum <= 0) { U.toast('无需回收'); return; }
        U.confirm('确认将所有子平台余额回收到主账户？当前币种 ' + cur + '，合计 ' + S.money(sum)).then(function (ok) {
          if (!ok) return;
          var data = S.load();
          var mm = S.findMember(data, id);
          var ww = mm.wallets[cur];
          var got = 0;
          S.PLATFORMS.forEach(function (p) { got += Number(ww.platforms[p] || 0); ww.platforms[p] = 0; });
          ww.main = Number((ww.main + got).toFixed(2));
          data.reclaim.unshift({
            id: S.nextId('R', data), account: mm.account, startAt: S.now(), endAt: S.now(),
            amount: got, before: got, after: 0, channel: '全部子平台', status: '成功', operator: S.getSession().name
          });
          S.pushLog(data, { id: S.nextId('LD', data), account: mm.account, type: '一键回收', amount: got, before: ww.main - got, after: ww.main, at: S.now(), operator: S.getSession().name, remark: cur });
          S.save(data);
          U.toast('回收成功（演示，不产生真实资金）');
          draw();
        });
      };
      function transfer(dir, plat) {
        var data = S.load();
        var mm = S.findMember(data, id);
        var ww = mm.wallets[cur];
        var max = dir === 'in' ? ww.main : (ww.platforms[plat] || 0);
        U.openDrawer(dir === 'in' ? '转入' : '转出',
          arcoFields([
            { label: '平台', html: '<input value="' + U.escapeHtml(plat) + '" disabled>' },
            { label: '币种', html: '<input value="' + U.escapeHtml(cur) + '" disabled>' },
            { label: dir === 'in' ? '主账户可用' : '平台可用', html: '<input value="' + S.money(max) + '" disabled>' },
            { id: 'trAmt', label: '金额', type: 'number', req: true, ph: '请输入金额' }
          ]),
          function () {
            var amt = Number(document.getElementById('trAmt').value);
            if (!(amt > 0)) { U.toast('金额须大于 0', 'err'); return; }
            if (amt > max) { U.toast('超过可用余额', 'err'); return; }
            var data2 = S.load();
            var m2 = S.findMember(data2, id);
            var w2 = m2.wallets[cur];
            if (dir === 'in') {
              w2.main = Number((w2.main - amt).toFixed(2));
              w2.platforms[plat] = Number(((w2.platforms[plat] || 0) + amt).toFixed(2));
            } else {
              w2.platforms[plat] = Number(((w2.platforms[plat] || 0) - amt).toFixed(2));
              w2.main = Number((w2.main + amt).toFixed(2));
            }
            S.pushLog(data2, { id: S.nextId('LD', data2), account: m2.account, type: dir === 'in' ? '转入子平台' : '转出子平台', amount: amt, before: 0, after: w2.main, at: S.now(), operator: S.getSession().name, remark: cur + ' / ' + plat });
            S.save(data2);
            U.closeDrawer();
            U.toast('划转成功（演示，不产生真实资金）');
            draw();
          });
      }
      $$ (root, '[data-in]').forEach(function (b) { b.onclick = function () { transfer('in', b.getAttribute('data-in')); }; });
      $$ (root, '[data-out]').forEach(function (b) { b.onclick = function () { transfer('out', b.getAttribute('data-out')); }; });
    }
    draw();
  };

  Pages.tiers = function (root) {
    mountList(root, {
      title: '会员层级',
      toolbar: '<button class="btn btn-black" type="button" data-add>+ 新增层级</button>',
      head: ['层级名称', '存款下限', '存款上限', '返水%', '备注', '操作'],
      rows: function (d) { return d.tiers; },
      rowHtml: function (t) {
        return '<tr><td>' + U.escapeHtml(t.name) + '</td><td>' + t.min + '</td><td>' + t.max + '</td><td>' + t.rebate +
          '</td><td>' + U.escapeHtml(t.remark || '-') + '</td><td><button class="op-link" data-ed="' + t.id + '">编辑</button></td></tr>';
      },
      bind: function (root, d, redraw) {
        function form(row) {
          U.openDrawer(row ? '编辑' : '新增',
            arcoFields([
              { id: 'tName', label: '层级名称', req: true, value: row ? row.name : '' },
              { id: 'tMin', label: '存款下限', type: 'number', value: row ? row.min : 0 },
              { id: 'tMax', label: '存款上限', type: 'number', value: row ? row.max : 0 },
              { id: 'tReb', label: '返水%', type: 'number', value: row ? row.rebate : 0 },
              { id: 'tRm', label: '备注', value: row ? row.remark : '' }
            ]),
            function () {
              var data = S.load();
              var name = document.getElementById('tName').value.trim();
              if (!name) { U.toast('请输入名称', 'err'); return; }
              if (row) {
                var t = data.tiers.filter(function (x) { return x.id === row.id; })[0];
                t.name = name; t.min = Number(document.getElementById('tMin').value); t.max = Number(document.getElementById('tMax').value);
                t.rebate = Number(document.getElementById('tReb').value); t.remark = document.getElementById('tRm').value;
              } else {
                data.tiers.push({ id: S.nextId('T', data), name: name, min: Number(document.getElementById('tMin').value), max: Number(document.getElementById('tMax').value), rebate: Number(document.getElementById('tReb').value), remark: document.getElementById('tRm').value });
              }
              S.save(data); U.closeDrawer(); U.toast('已保存'); redraw();
            });
        }
        var add = root.querySelector('[data-add]');
        if (add) add.onclick = function () { form(null); };
        $$ (root, '[data-ed]').forEach(function (b) {
          b.onclick = function () { form(d.tiers.filter(function (t) { return t.id === b.getAttribute('data-ed'); })[0]); };
        });
      }
    });
  };

  Pages.loginLogs = function (root) {
    mountList(root, {
      title: '登录日志',
      filters: [{ key: 'kw', label: '会员账号', placeholder: '会员账号' }, { key: 'result', label: '结果', type: 'select', options: ['成功', '失败'] }],
      head: ['会员账号', 'IP', '设备', '结果', '时间'],
      rows: function (d, q) {
        return d.loginLogs.filter(function (r) {
          if (q.kw && r.account.indexOf(q.kw) < 0) return false;
          if (q.result && r.result !== q.result) return false;
          return true;
        });
      },
      rowHtml: function (r) {
        return '<tr><td>' + r.account + '</td><td>' + r.ip + '</td><td>' + r.device + '</td><td>' + U.badgeStatus(r.result) + '</td><td>' + r.at + '</td></tr>';
      }
    });
  };

  Pages.bets = function (root) {
    mountList(root, {
      title: '会员投注',
      filters: [{ key: 'kw', label: '会员账号' }, { key: 'vendor', label: '厂商', type: 'select', options: S.PLATFORMS.slice(0, 8) }, { key: 'status', label: '状态', type: 'select', options: ['已结算', '未结算'] }],
      extraBtn: '<button class="btn btn-ghost" type="button" data-export>导出</button>',
      head: ['注单号', '会员账号', '厂商', '游戏', '投注额', '有效流水', '输赢', '状态', '时间'],
      rows: function (d, q) {
        return d.bets.filter(function (r) {
          if (q.kw && r.account.indexOf(q.kw) < 0) return false;
          if (q.vendor && r.vendor !== q.vendor) return false;
          if (q.status && r.status !== q.status) return false;
          return true;
        });
      },
      rowHtml: function (r) {
        return '<tr><td>' + r.id + '</td><td>' + r.account + '</td><td>' + r.vendor + '</td><td>' + r.game + '</td><td class="amt-right">' + S.money(r.amount) + '</td><td class="amt-right">' + S.money(r.valid) + '</td><td class="amt-right">' + S.money(r.win) + '</td><td>' + U.badgeStatus(r.status) + '</td><td>' + r.at + '</td></tr>';
      },
      bind: function (root) {
        var ex = root.querySelector('[data-export]');
        if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示 CSV，不落真实文件）'); };
      }
    });
  };

  Pages.gameRecords = function (root) {
    mountList(root, {
      title: '游戏记录',
      filters: [{ key: 'kw', label: '会员账号' }],
      head: ['记录ID', '会员账号', '厂商', '游戏', '局数', '时间'],
      rows: function (d, q) { return d.gameRecords.filter(function (r) { return !q.kw || r.account.indexOf(q.kw) >= 0; }); },
      rowHtml: function (r) {
        return '<tr><td>' + r.id + '</td><td>' + r.account + '</td><td>' + r.vendor + '</td><td>' + r.game + '</td><td>' + r.rounds + '</td><td>' + r.at + '</td></tr>';
      }
    });
  };

  Pages.bonus = function (root) {
    mountList(root, {
      title: '红利记录',
      filters: [{ key: 'kw', label: '会员账号' }, { key: 'type', label: '类型', type: 'select', options: ['注册礼', '抽奖现金', 'QRPH返利'] }],
      head: ['ID', '会员账号', '类型', '金额', '状态', '时间', '操作人'],
      rows: function (d, q) {
        return d.bonus.filter(function (r) {
          if (q.kw && r.account.indexOf(q.kw) < 0) return false;
          if (q.type && r.type !== q.type) return false;
          return true;
        });
      },
      rowHtml: function (r) {
        return '<tr><td>' + r.id + '</td><td>' + r.account + '</td><td>' + r.type + '</td><td class="amt-right">' + S.money(r.amount) + '</td><td>' + U.badgeStatus(r.status) + '</td><td>' + r.at + '</td><td>' + r.operator + '</td></tr>';
      }
    });
  };

  function auditPage(kind) {
    return function (root) {
      var title = kind === 'deposits' ? '审核会员充值' : '审核会员提款';
      var depHead = ['订单编号', '会员账户', '所属平台', '申请时间', '处理时间', '会员组', '订单金额', '实际支付金额', '状态', '支付通道', '通道订单号', '充值类型', '赠送金额', '备注', '操作人', '客户端IP', '操作'];
      var wdHead = ['订单编号', '会员账户', '所属平台', '审核时间', '出款时间', '会员组', '货币', '三方渠道', '总手续费', '提现金额', '提现时余额', '实际支付金额', '状态', '操作'];
      mountList(root, {
        title: title,
        filters: [
          { key: 'kw', label: '会员账户' },
          { key: 'status', label: '状态', type: 'select', options: ['待审核', '已通过', '已拒绝', '处理中'] },
          { key: 'channel', label: '通道', placeholder: '通道名' }
        ],
        extraBtn: '<button class="btn btn-ghost" type="button" data-export>导出</button>',
        head: kind === 'deposits' ? depHead : wdHead,
        rows: function (d, q) {
          return d[kind].filter(function (r) {
            if (q.kw && r.account.indexOf(q.kw) < 0) return false;
            if (q.status && r.status !== q.status) return false;
            if (q.channel && r.channel.indexOf(q.channel) < 0) return false;
            return true;
          });
        },
        rowHtml: function (r) {
          var ops = r.status === '待审核'
            ? '<button class="op-link" data-ok="' + r.id + '">通过</button><button class="op-link danger" data-no="' + r.id + '">拒绝</button>'
            : '—';
          if (kind === 'deposits') {
            return '<tr><td>' + r.id + '</td><td>' + r.account + '</td><td>PHP</td><td>' + r.at + '</td><td>' + (r.status === '待审核' ? '-' : r.at) +
              '</td><td>' + (r.group || '-') + '</td><td class="amt-right">' + S.money(r.amount) + '</td><td class="amt-right">' + S.money(r.actual) +
              '</td><td>' + U.badgeStatus(r.status) + '</td><td>' + r.channel + '</td><td>' + (r.channelSn || '-') + '</td><td>' + (r.payType || r.channel) +
              '</td><td class="amt-right">' + S.money(r.bonus || 0) + '</td><td>' + U.escapeHtml(r.remark || '-') + '</td><td>' + r.operator +
              '</td><td>' + (r.ip || '-') + '</td><td>' + ops + '</td></tr>';
          }
          return '<tr><td>' + r.id + '</td><td>' + r.account + '</td><td>PHP</td><td>' + (r.checkAt || '-') + '</td><td>' + (r.payAt || '-') +
            '</td><td>' + (r.group || '-') + '</td><td>PHP</td><td>' + r.channel + '</td><td class="amt-right">' + S.money(r.fee) +
            '</td><td class="amt-right">' + S.money(r.amount) + '</td><td class="amt-right">' + S.money(r.balance || 0) +
            '</td><td class="amt-right">' + S.money(r.actual) + '</td><td>' + U.badgeStatus(r.status) + '</td><td>' + ops + '</td></tr>';
        },
        bind: function (root, d, redraw) {
          function act(id, pass) {
            var row = d[kind].filter(function (x) { return x.id === id; })[0];
            if (!row || row.status !== '待审核') return;
            if (kind === 'withdraws' && pass && row.turnoverOk === false) {
              U.toast('流水未达标，不能通过', 'err');
              return;
            }
            var go = function (remark) {
              U.confirm(pass ? '确认通过？演示环境不产生真实资金。' : '确认拒绝该订单？').then(function (ok) {
                if (!ok) return;
                var data = S.load();
                var r = data[kind].filter(function (x) { return x.id === id; })[0];
                r.status = pass ? (kind === 'withdraws' ? '处理中' : '已通过') : '已拒绝';
                r.operator = S.getSession().name;
                r.remark = remark || r.remark;
                if (pass && kind === 'deposits') {
                  var m = S.findMember(data, r.account);
                  if (m) {
                    m.wallets.CNY.main = Number((m.wallets.CNY.main + r.actual).toFixed(2));
                    S.pushLog(data, { id: S.nextId('LD', data), account: r.account, type: '充值', amount: r.actual, before: m.wallets.CNY.main - r.actual, after: m.wallets.CNY.main, at: S.now(), operator: r.operator, remark: r.channel });
                  }
                }
                if (pass && kind === 'withdraws') {
                  var m2 = S.findMember(data, r.account);
                  if (m2) {
                    if (m2.wallets.CNY.main < r.amount) { U.toast('主账户余额不足，无法出款', 'err'); return; }
                    m2.wallets.CNY.main = Number((m2.wallets.CNY.main - r.amount).toFixed(2));
                    m2.wallets.CNY.frozen = Number((m2.wallets.CNY.frozen + r.amount).toFixed(2));
                    S.pushLog(data, { id: S.nextId('LD', data), account: r.account, type: '提款冻结', amount: r.amount, before: m2.wallets.CNY.main + r.amount, after: m2.wallets.CNY.main, at: S.now(), operator: r.operator, remark: r.id });
                  }
                }
                S.save(data);
                U.toast(pass ? '已通过（演示，不产生真实资金）' : '已拒绝');
                redraw();
              });
            };
            if (pass) go('');
            else {
              U.openDrawer('拒绝', arcoFields([{ id: 'rej', label: '原因', req: true, ph: '将展示给会员/客服' }]), function () {
                var remark = document.getElementById('rej').value.trim();
                if (!remark) { U.toast('请填写原因', 'err'); return; }
                U.closeDrawer();
                go(remark);
              });
            }
          }
          $$ (root, '[data-ok]').forEach(function (b) { b.onclick = function () { act(b.getAttribute('data-ok'), true); }; });
          $$ (root, '[data-no]').forEach(function (b) { b.onclick = function () { act(b.getAttribute('data-no'), false); }; });
          var ex = root.querySelector('[data-export]');
          if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示）'); };
        }
      });
    };
  }
  Pages.deposits = auditPage('deposits');
  Pages.withdraws = auditPage('withdraws');

  function channelPage(key, title) {
    return function (root) {
      mountList(root, {
        title: title,
        toolbar: '<button class="btn btn-black" type="button" data-add>+ 新增</button>',
        head: ['名称', '类型', '单笔最小', '单笔最大', '手续费', '状态', '排序', '备注', '操作'],
        rows: function (d) { return d[key]; },
        rowHtml: function (c) {
          return '<tr><td>' + U.escapeHtml(c.name) + '</td><td>' + c.type + '</td><td>' + c.min + '</td><td>' + c.max +
            '</td><td>' + c.fee + '</td><td>' + U.switchBtn(c.status === 1, c.id) + '</td><td>' + c.sort + '</td><td>' +
            U.escapeHtml(c.extra || '-') + '</td><td><button class="op-link" data-ed="' + c.id + '">编辑</button></td></tr>';
        },
        bind: function (root, d, redraw) {
          $$ (root, '[data-sw]').forEach(function (b) {
            b.onclick = function () {
              var data = S.load();
              var row = data[key].filter(function (x) { return x.id === b.getAttribute('data-sw'); })[0];
              row.status = row.status === 1 ? 0 : 1;
              S.save(data);
              U.toast(row.status === 1 ? '通道已开启' : '通道已关闭');
              redraw();
            };
          });
          function form(row) {
            U.openDrawer(row ? '编辑' : '新增',
              arcoFields([
                { id: 'cName', label: '名称', req: true, value: row ? row.name : '' },
                { id: 'cType', label: '类型', value: row ? row.type : '' },
                { id: 'cMin', label: '最小', type: 'number', value: row ? row.min : 100 },
                { id: 'cMax', label: '最大', type: 'number', value: row ? row.max : 50000 },
                { id: 'cFee', label: '手续费', type: 'number', value: row ? row.fee : 0 },
                { id: 'cEx', label: '备注', value: row ? row.extra : '' }
              ]),
              function () {
                var name = document.getElementById('cName').value.trim();
                if (!name) { U.toast('请输入名称', 'err'); return; }
                var data = S.load();
                if (row) {
                  var c = data[key].filter(function (x) { return x.id === row.id; })[0];
                  c.name = name; c.type = document.getElementById('cType').value; c.min = Number(document.getElementById('cMin').value);
                  c.max = Number(document.getElementById('cMax').value); c.fee = Number(document.getElementById('cFee').value); c.extra = document.getElementById('cEx').value;
                } else {
                  data[key].push({ id: S.nextId('C', data), name: name, type: document.getElementById('cType').value, min: Number(document.getElementById('cMin').value), max: Number(document.getElementById('cMax').value), fee: Number(document.getElementById('cFee').value), status: 1, sort: 99, extra: document.getElementById('cEx').value });
                }
                S.save(data); U.closeDrawer(); U.toast('已保存'); redraw();
              });
          }
          var add = root.querySelector('[data-add]');
          if (add) add.onclick = function () { form(null); };
          $$ (root, '[data-ed]').forEach(function (b) {
            b.onclick = function () { form(d[key].filter(function (x) { return x.id === b.getAttribute('data-ed'); })[0]); };
          });
        }
      });
    };
  }
  Pages.depChannels = channelPage('depChannels', '充值策略');
  Pages.wdChannels = channelPage('wdChannels', '提款策略');

  function manualPage(dir) {
    return function (root) {
      root.innerHTML = pageShell(dir === 'in' ? '系统入款' : '系统打款',
        '<div class="filter-card" style="max-width:560px">' +
        '<div class="field"><label class="req">会员账号</label><input id="mAcc" placeholder="精确账号"></div>' +
        '<div class="field"><label class="req">金额</label><input id="mAmt" type="number" min="0.01" step="0.01"></div>' +
        '<div class="field"><label>币种</label><select id="mCur">' + S.CURRENCIES.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select></div>' +
        '<div class="field"><label class="req">原因 / 备注</label><input id="mRm" placeholder="必填，写入资金流水"></div>' +
        '<p class="hint">演示环境会改本地主账户余额并写流水，不产生真实资金。提出金额不得超过主账户可用（不含冻结）。</p>' +
        '<button class="btn btn-black" type="button" id="mGo">' + (dir === 'in' ? '确认入款' : '确认打款') + '</button></div>'
      );
      document.getElementById('mGo').onclick = function () {
        var acc = document.getElementById('mAcc').value.trim();
        var amt = Number(document.getElementById('mAmt').value);
        var cur = document.getElementById('mCur').value;
        var rm = document.getElementById('mRm').value.trim();
        var data = S.load();
        var m = S.findMember(data, acc);
        if (!m) { U.toast('会员不存在', 'err'); return; }
        if (!(amt > 0)) { U.toast('金额须大于 0', 'err'); return; }
        if (!rm) { U.toast('原因必填', 'err'); return; }
        var w = m.wallets[cur];
        if (dir === 'out' && w.main < amt) { U.toast('可用余额不足', 'err'); return; }
        U.confirm((dir === 'in' ? '确认系统入款 ' : '确认系统打款 ') + S.money(amt) + ' ' + cur + ' 到 ' + acc + '？演示不产生真实资金。').then(function (ok) {
          if (!ok) return;
          var btn = document.getElementById('mGo');
          btn.disabled = true;
          var before = w.main;
          w.main = Number((dir === 'in' ? w.main + amt : w.main - amt).toFixed(2));
          S.pushLog(data, { id: S.nextId('LD', data), account: acc, type: dir === 'in' ? '系统入款' : '系统打款', amount: amt, before: before, after: w.main, at: S.now(), operator: S.getSession().name, remark: rm + ' / ' + cur });
          S.save(data);
          U.toast('已完成（演示，不产生真实资金）');
          btn.disabled = false;
          document.getElementById('mAmt').value = '';
        });
      };
    };
  }
  Pages.manualIn = manualPage('in');
  Pages.manualOut = manualPage('out');

  Pages.ledger = function (root) {
    mountList(root, {
      title: '资金流水',
      filters: [{ key: 'kw', label: '会员账号' }, { key: 'type', label: '类型', type: 'select', options: ['充值', '提款冻结', '系统入款', '系统打款', '人工存入', '人工提出', '一键回收', '转入子平台', '转出子平台', 'QRPH返利'] }],
      extraBtn: '<button class="btn btn-ghost" type="button" data-export>导出</button>',
      head: ['流水号', '会员账号', '类型', '金额', '变动前', '变动后', '时间', '操作人', '备注'],
      rows: function (d, q) {
        return d.ledger.filter(function (r) {
          if (q.kw && r.account.indexOf(q.kw) < 0) return false;
          if (q.type && r.type !== q.type) return false;
          return true;
        });
      },
      rowHtml: function (r) {
        return '<tr><td>' + r.id + '</td><td>' + r.account + '</td><td>' + r.type + '</td><td class="amt-right">' + S.money(r.amount) +
          '</td><td class="amt-right">' + S.money(r.before) + '</td><td class="amt-right">' + S.money(r.after) + '</td><td>' + r.at + '</td><td>' + r.operator + '</td><td>' + U.escapeHtml(r.remark) + '</td></tr>';
      },
      bind: function (root) {
        var ex = root.querySelector('[data-export]');
        if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示）'); };
      }
    });
  };

  Pages.reclaim = function (root) {
    var sortKey = 'endAt';
    var sortDir = -1;
    mountList(root, {
      title: '余额回收记录',
      filters: [
        { key: 'time', label: '回收结束时间', type: 'daterange', wide: true },
        { key: 'channel', label: '游戏渠道ID', type: 'select', options: S.PLATFORMS.concat(['全部子平台']) },
        { key: 'status', label: '任务状态', type: 'select', options: ['成功', '失败', '处理中'] }
      ],
      extraBtn: '<button class="btn btn-ghost" type="button" data-export>导出</button>',
      head: ['用户名', '回收开始时间', '回收结束时间', '回收金额', '回收前金额', '回收后金额', '游戏渠道ID', '状态', '操作人', '操作'],
      rows: function (d, q) {
        var rows = d.reclaim.filter(function (r) {
          if (q.channel && r.channel !== q.channel) return false;
          if (q.status && r.status !== q.status) return false;
          return true;
        });
        rows.sort(function (a, b) {
          return (String(a[sortKey] || '') > String(b[sortKey] || '') ? 1 : -1) * sortDir;
        });
        return rows;
      },
      rowHtml: function (r) {
        var op = r.status === '失败' ? '<button class="op-link" data-retry="' + r.id + '">再次回收</button>' : '—';
        var st = r.status === '成功' ? '<span class="status-ok">成功</span>' : r.status === '失败' ? '<span class="status-fail">失败</span>' : '<span class="status-wait">处理中</span>';
        return '<tr><td>' + r.account + '</td><td>' + (r.startAt || '—') + '</td><td>' + (r.endAt || '—') + '</td><td class="amt-right">' + S.money(r.amount) +
          '</td><td class="amt-right">' + S.money(r.before) + '</td><td class="amt-right">' + (r.after === '' || r.after == null ? '—' : S.money(r.after)) +
          '</td><td>' + r.channel + '</td><td>' + st + '</td><td>' + r.operator + '</td><td>' + op + '</td></tr>';
      },
      bind: function (root, d, redraw) {
        $$ (root, '[data-retry]').forEach(function (b) {
          b.onclick = function () {
            var id = b.getAttribute('data-retry');
            var row = d.reclaim.filter(function (x) { return x.id === id; })[0];
            U.confirm('确认再次回收该用户在【' + row.channel + '】的余额？').then(function (ok) {
              if (!ok) return;
              var data = S.load();
              var r = data.reclaim.filter(function (x) { return x.id === id; })[0];
              r.status = '处理中';
              r.endAt = '';
              r.after = '';
              S.save(data);
              U.toast('已重新发起回收（演示）');
              setTimeout(function () {
                var data2 = S.load();
                var r2 = data2.reclaim.filter(function (x) { return x.id === id; })[0];
                if (r2 && r2.status === '处理中') {
                  r2.status = '成功';
                  r2.endAt = S.now();
                  r2.after = 0;
                  S.save(data2);
                }
              }, 1200);
              redraw();
            });
          };
        });
        var ex = root.querySelector('[data-export]');
        if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示）'); };
      }
    });
  };

  Pages.games = function (root) {
    mountList(root, {
      title: '游戏管理',
      filters: [{ key: 'kw', label: '游戏名' }, { key: 'cate', label: '分类', type: 'select', options: ['体育', '真人', '电子', '棋牌', '彩票'] }],
      head: ['厂商', '游戏', '分类', '热门', '状态', '操作'],
      rows: function (d, q) {
        return d.games.filter(function (g) {
          if (q.kw && g.name.indexOf(q.kw) < 0) return false;
          if (q.cate && g.cate !== q.cate) return false;
          return true;
        });
      },
      rowHtml: function (g) {
        return '<tr><td>' + g.vendor + '</td><td>' + g.name + '</td><td>' + g.cate + '</td><td>' + (g.hot ? '是' : '否') +
          '</td><td>' + U.switchBtn(g.status === 1, g.id) + '</td><td><button class="op-link" data-hot="' + g.id + '">切换热门</button></td></tr>';
      },
      bind: function (root, d, redraw) {
        $$ (root, '[data-sw]').forEach(function (b) {
          b.onclick = function () {
            var data = S.load();
            var g = data.games.filter(function (x) { return x.id === b.getAttribute('data-sw'); })[0];
            g.status = g.status === 1 ? 0 : 1;
            S.save(data); U.toast(g.status ? '已上架' : '已下架'); redraw();
          };
        });
        $$ (root, '[data-hot]').forEach(function (b) {
          b.onclick = function () {
            var data = S.load();
            var g = data.games.filter(function (x) { return x.id === b.getAttribute('data-hot'); })[0];
            g.hot = g.hot ? 0 : 1; S.save(data); redraw();
          };
        });
      }
    });
  };

  Pages.vendors = function (root) {
    mountList(root, {
      title: '游戏厂商',
      head: ['厂商', '分类', '启用', '维护', '操作'],
      rows: function (d) { return d.vendors; },
      rowHtml: function (v) {
        return '<tr><td>' + v.name + '</td><td>' + v.cate + '</td><td>' + U.switchBtn(v.status === 1, 's-' + v.id) +
          '</td><td>' + U.switchBtn(v.maintain === 1, 'm-' + v.id) + '</td><td>' + (v.maintain ? '<span class="badge wait">维护中</span>' : '—') + '</td></tr>';
      },
      bind: function (root, d, redraw) {
        $$ (root, '[data-sw]').forEach(function (b) {
          b.onclick = function () {
            var key = b.getAttribute('data-sw');
            var data = S.load();
            var id = key.slice(2);
            var v = data.vendors.filter(function (x) { return x.id === id; })[0];
            if (key.charAt(0) === 's') v.status = v.status === 1 ? 0 : 1;
            else v.maintain = v.maintain === 1 ? 0 : 1;
            S.save(data); redraw();
          };
        });
      }
    });
  };

  Pages.maintain = function (root) {
    var d = S.load();
    root.innerHTML = pageShell('维护开关',
      '<p class="page-tip">厂商维护开启后，会员详情里对应平台「转入 / 转出」应置灰。本页与「厂商管理」共用同一状态。</p>' +
      tableWrap(['厂商', '分类', '维护开关', '前台影响'], d.vendors.map(function (v) {
        return '<tr><td>' + v.name + '</td><td>' + v.cate + '</td><td>' + U.switchBtn(v.maintain === 1, v.id) + '</td><td>' +
          (v.maintain ? '该平台划转禁用，游戏入口可显示维护' : '正常') + '</td></tr>';
      }).join(''))
    );
    $$ (root, '[data-sw]').forEach(function (b) {
      b.onclick = function () {
        var data = S.load();
        var v = data.vendors.filter(function (x) { return x.id === b.getAttribute('data-sw'); })[0];
        v.maintain = v.maintain === 1 ? 0 : 1;
        S.save(data);
        U.toast(v.maintain ? v.name + ' 已进入维护' : v.name + ' 已恢复');
        Pages.maintain(root);
      };
    });
  };

  function actIconHtml(a, kind) {
    var ch = String(a.title || '?').charAt(0);
    var n = Math.abs(Number(a.id) || 0);
    var cls = 't' + ((kind === 'pc' ? n + 3 : n) % 7);
    return '<span class="thumb ph act-ico ' + cls + '" title="' + (kind === 'pc' ? 'PC端图标' : '移动端图标') + '">' +
      U.escapeHtml(ch) + '</span>';
  }

  function actSortHtml(a) {
    return '<div class="stepper list-step"><button type="button" data-sort="' + a.id + '" data-d="-1">−</button>' +
      '<input type="text" readonly value="' + U.escapeHtml(String(a.sort)) + '">' +
      '<button type="button" data-sort="' + a.id + '" data-d="1">+</button></div>';
  }

  function actTagOpts(tags, picked) {
    return '<option value="">请选择标签</option>' + (tags || []).map(function (t) {
      return '<option value="' + U.escapeHtml(t.name) + '"' + (picked === t.name ? ' selected' : '') + '>' +
        U.escapeHtml(t.name) + '</option>';
    }).join('');
  }

  function nextActId(list) {
    var max = 1500275;
    (list || []).forEach(function (a) {
      var n = Number(a.id);
      if (n > max) max = n;
    });
    return String(max + 1);
  }

  function actFloatDefault(type) {
    return S.ACT_NO_FLOAT && S.ACT_NO_FLOAT[type] ? null : 0;
  }

  function actCfgVal(row, field) {
    var cfg = (row && row.cfg) || {};
    return cfg[field.key] != null ? cfg[field.key] : field.def;
  }

  function actStepHtml(field, val) {
    return '<div class="stepper list-step act-cfg-step">' +
      '<button type="button" data-cfg-step="' + field.key + '" data-d="-1">−</button>' +
      '<input data-cfg="' + field.key + '" data-kind="step" data-min="' + field.min + '" data-max="' + field.max +
      '" type="text" placeholder="' + U.escapeHtml(field.ph || '') + '" value="' + U.escapeHtml(String(val)) + '">' +
      '<button type="button" data-cfg-step="' + field.key + '" data-d="1">+</button></div>';
  }

  function actGamePickBtn(id) {
    return '<button class="btn btn-black act-game-btn" type="button" id="' + id + '">' +
      '<svg class="act-game-ico" viewBox="0 0 16 16" aria-hidden="true"><circle cx="2.2" cy="3.5" r="1.15"/><rect x="5.2" y="2.6" width="9.3" height="1.8" rx="0.3"/><circle cx="2.2" cy="8" r="1.15"/><rect x="5.2" y="7.1" width="9.3" height="1.8" rx="0.3"/><circle cx="2.2" cy="12.5" r="1.15"/><rect x="5.2" y="11.6" width="9.3" height="1.8" rx="0.3"/></svg>' +
      '选择游戏</button>';
  }

  function actQ(text) {
    return '<i class="act-q" title="' + U.escapeHtml(text) + '">?</i>';
  }

  function actUploadHtml(id, on) {
    return '<div class="upload' + (on ? ' done' : '') + '" id="' + id + '" data-up="' + id + '"><span class="plus">+</span>本地上传</div>' +
      '<div class="extra">前端活动页面显示用</div>';
  }

  function actPct(n) {
    var x = Number(n);
    if (isNaN(x)) x = 0;
    return x.toFixed(2);
  }

  function weekLossHeadHtml(cfg) {
    return '<div class="arco-form act-cfg-form">' +
      '<div class="form-item"><label class="req">移动端图标</label><div class="ctrl">' + actUploadHtml('aH5', !!cfg.mobileIcon) + '</div></div>' +
      '<div class="form-item"><label class="req">PC端图标</label><div class="ctrl">' + actUploadHtml('aPC', !!cfg.pcIcon) + '</div></div>' +
      '</div>';
  }

  function weekLossVipTable(key, ratios, col2) {
    var levels = S.ACT_VIP_LEVELS || ['vip0', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5'];
    var rows = levels.map(function (lv, i) {
      return '<tr><td>' + lv + '</td><td><span class="act-pct"><input data-vip="' + key + '" data-i="' + i +
        '" type="text" value="' + actPct(ratios[i]) + '"><em>%</em></span></td></tr>';
    }).join('');
    return '<table class="act-vip-table"><thead><tr><th>VIP等级</th><th>' + col2 + '</th></tr></thead><tbody>' +
      rows + '</tbody></table>';
  }

  function weekLossBodyHtml(cfg) {
    var days = S.ACT_WEEK_DAYS || [];
    var dayHtml = days.map(function (d, i) {
      return '<label class="act-day"><input type="checkbox" data-day="' + i + '"' +
        (cfg.extra_days && cfg.extra_days[i] ? ' checked' : '') + '> ' + d + '</label>';
    }).join('');
    return '<div class="arco-form act-cfg-form">' + lossCommonTopHtml(cfg, { wagerLabel: '周亏损打码量倍数' }) +
      '<div class="form-item"><label>额外周亏损返奖开关</label><div class="ctrl">' +
      '<button class="switch' + (cfg.extra_on ? ' on' : '') + '" type="button" data-cfg-sw="extra_on"><i></i></button></div></div>' +
      '<div data-extra-block' + (cfg.extra_on ? '' : ' hidden') + '>' +
      '<div class="form-item"><label class="req">周亏损额外奖励打码倍数 ' + actQ('额外周亏损奖励领取后打码倍数，设置为0时不限流水') +
      '</label><div class="ctrl">' + actStepHtml({ key: 'extra_wager', min: 0, max: 999, ph: '请输入周亏损额外奖励打码倍数' }, cfg.extra_wager === '' || cfg.extra_wager == null ? '' : cfg.extra_wager) +
      '</div></div>' +
      '<div class="act-sec">额外周亏损返奖比例</div>' +
      weekLossVipTable('extra_ratio', cfg.extra_ratio || [1, 1, 1, 1, 1, 1], '返奖比例') +
      '<div class="form-item"><label class="req">额外周亏损返奖时间</label><div class="ctrl act-days">' + dayHtml + '</div></div>' +
      '</div>' +
      '<div class="form-item"><label>用户总输开关 ' + actQ('打开则判断用户在平台的总输，关闭则只判断周输') +
      '</label><div class="ctrl"><button class="switch' + (cfg.total_loss_on ? ' on' : '') +
      '" type="button" data-cfg-sw="total_loss_on"><i></i></button></div></div>' +
      '</div>';
  }

  function lossCommonTopHtml(cfg, opt) {
    opt = opt || {};
    var wagerLabel = opt.wagerLabel || '打码量倍数';
    var wagerPh = '请输入' + wagerLabel;
    var games = cfg.games || [];
    var opts = S.ACT_GAME_OPTS || [];
    var names = opts.filter(function (g) { return games.indexOf(g.id) >= 0; }).map(function (g) { return g.name; });
    var gameBoxes = opts.map(function (g) {
      return '<label class="act-day"><input type="checkbox" data-game="' + g.id + '"' +
        (games.indexOf(g.id) >= 0 ? ' checked' : '') + '> ' + U.escapeHtml(g.name) + '</label>';
    }).join('');
    return '<div class="form-item"><label>最高返现奖励 ' + actQ('请输入最高返现奖励金额，0 为不限制') +
      '</label><div class="ctrl">' + actStepHtml({ key: 'max_reward', min: 0, max: 999999 }, cfg.max_reward) + '</div></div>' +
      '<div class="form-item"><label class="req">' + wagerLabel + ' ' + actQ('活动领取奖金打码量倍数，设置为0时不限流水') +
      '</label><div class="ctrl">' + actStepHtml({ key: 'wager', min: 0, max: 999, ph: wagerPh }, cfg.wager === '' || cfg.wager == null ? '' : cfg.wager) +
      '</div></div>' +
      '<div class="form-item"><label>活动允许游戏 ' + actQ('请选择活动允许游戏') +
      '</label><div class="ctrl">' + actGamePickBtn('aPickGames') +
      '<div class="act-game-hint" id="aGamesHint">' + (names.length ? names.join('、') : '未选择') + '</div>' +
      '<div class="act-game-panel" id="aGamePanel" hidden>' + gameBoxes + '</div></div></div>' +
      '<div class="act-sec">VIP返现比例 ' + actQ('根据会员等级对应的返现比例进行返现。') + '</div>' +
      weekLossVipTable('vip_ratio', cfg.vip_ratio || [0, 0, 0, 0, 0, 0], '返现比例');
  }

  function dayLossBodyHtml(cfg) {
    return '<div class="arco-form act-cfg-form">' + lossCommonTopHtml(cfg) +
      '<div class="form-item"><label>用户总输开关 ' + actQ('打开则判断用户在平台的总输，关闭则只判断日输') +
      '</label><div class="ctrl"><button class="switch' + (cfg.total_loss_on ? ' on' : '') +
      '" type="button" data-cfg-sw="total_loss_on"><i></i></button></div></div>' +
      '<div class="form-item"><label class="req">救援金开关</label><div class="ctrl">' +
      '<button class="switch' + (cfg.rescue_on ? ' on' : '') + '" type="button" data-cfg-sw="rescue_on"><i></i></button></div></div>' +
      '</div>';
  }

  function rainPad(n) { return n < 10 ? '0' + n : String(n); }

  function rainFmtSec(sec) {
    if (sec < 0) sec = 0;
    if (sec > 86399) sec = 86399;
    return rainPad(Math.floor(sec / 3600)) + ':' + rainPad(Math.floor((sec % 3600) / 60)) + ':' + rainPad(sec % 60);
  }

  function rainParseHms(s) {
    var p = String(s || '').split(':');
    if (p.length < 2) return NaN;
    var h = Number(p[0]);
    var m = Number(p[1]);
    var sec = Number(p[2] || 0);
    if (isNaN(h) || isNaN(m) || isNaN(sec)) return NaN;
    return h * 3600 + m * 60 + sec;
  }

  function rainSlotRows(kind, slots) {
    return (slots || []).map(function (s, i) {
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td><input type="text" data-rain-slot="' + kind + '" data-i="' + i + '" data-f="start" placeholder="开始时间" value="' +
        U.escapeHtml(s.start || '') + '"></td>' +
        '<td><input type="text" data-rain-slot="' + kind + '" data-i="' + i + '" data-f="end" placeholder="结束时间" value="' +
        U.escapeHtml(s.end || '') + '"> <button type="button" class="op-link danger" data-rain-del="' + kind +
        '" data-i="' + i + '">删除</button></td></tr>';
    }).join('');
  }

  function rainSlotTable(kind, slots) {
    return '<div class="form-item act-slot-item"><label class="req">时间段配置 ' +
      actQ('已配置时段会被占用，不可再选。修改只能先删除再新增') +
      '</label><div class="ctrl">' +
      '<p class="act-slot-warn">*已配置的时间会被占用，不可再选择。修改时间段只能先删除再新增</p>' +
      '<table class="act-vip-table act-slot-table"><thead><tr><th>流水号</th><th>开始时间</th>' +
      '<th>结束时间 <button type="button" class="btn btn-black act-slot-add" data-rain-add="' + kind +
      '">+</button></th></tr></thead><tbody data-rain-slots="' + kind + '">' +
      rainSlotRows(kind, slots) + '</tbody></table></div></div>';
  }

  function rainCopyInput(key, val) {
    return '<div class="form-item"><label class="req">显示文案 ' + actQ('客户端活动页展示文案，请尽量精简') +
      '</label><div class="ctrl"><input data-cfg="' + key + '" data-kind="text" type="text" placeholder="请输入客户端展示文案（请尽量精简）" value="' +
      U.escapeHtml(val || '') + '"></div></div>';
  }

  function rainVipTable(rows) {
    var levels = S.ACT_RAIN_VIP || ['VIP0', 'VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5'];
    var body = levels.map(function (lv, i) {
      var r = (rows && rows[i]) || {};
      return '<tr><td>' + lv + '</td>' +
        '<td><input data-rain-vip="total" data-i="' + i + '" type="text" placeholder="请输入派奖总额" value="' +
        U.escapeHtml(r.total === 0 || r.total ? String(r.total) : '') + '"></td>' +
        '<td><input data-rain-vip="min" data-i="' + i + '" type="text" placeholder="请输入奖金最低值" value="' +
        U.escapeHtml(r.min === 0 || r.min ? String(r.min) : '') + '"></td>' +
        '<td><input data-rain-vip="max" data-i="' + i + '" type="text" placeholder="请输入奖金最高值" value="' +
        U.escapeHtml(r.max === 0 || r.max ? String(r.max) : '') + '"></td></tr>';
    }).join('');
    return '<table class="act-vip-table act-rain-vip"><thead><tr><th>VIP等级</th><th>派奖总额</th><th>奖金最低值</th><th>奖金最高值</th></tr></thead><tbody>' +
      body + '</tbody></table>';
  }

  function rainBodyHtml(cfg) {
    var dates = S.ACT_RAIN_DATES || [];
    var cycles = S.ACT_RAIN_CYCLES || [];
    var dateOpts = '<option value="">请选择额外活动日期</option>' + dates.map(function (d) {
      return '<option value="' + d + '"' + (cfg.extra_date === d ? ' selected' : '') + '>' + d + '</option>';
    }).join('');
    var cycleOpts = '<option value="">请选择额外活动周期</option>' + cycles.map(function (c) {
      return '<option value="' + c.id + '"' + (cfg.extra_cycle === c.id ? ' selected' : '') + '>' + c.label + '</option>';
    }).join('');
    var rainTotal = cfg.rain_total === 0 || cfg.rain_total ? cfg.rain_total : '';
    return '<div class="arco-form act-cfg-form">' +
      '<div class="form-item"><label class="req">参与充值金额 ' + actQ('用户当日累计充值达到该金额才可参与，0 为不限制') +
      '</label><div class="ctrl">' + actStepHtml({ key: 'join_recharge', min: 0, max: 999999 }, cfg.join_recharge) + '</div></div>' +
      '<div class="form-item"><label class="req">每场活动奖励</label><div class="ctrl">' +
      actStepHtml({ key: 'session_reward', min: 0, max: 999999 }, cfg.session_reward) +
      '<div class="extra">只用于前端用户展示</div></div></div>' +
      '<div class="form-item"><label class="req">最高获得金额</label><div class="ctrl">' +
      actStepHtml({ key: 'max_amount', min: 0, max: 999999 }, cfg.max_amount) +
      '<div class="extra">只用于前端用户展示</div></div></div>' +
      '<div class="form-item"><label class="req">打码量倍数 ' + actQ('活动领取奖金打码量倍数，设置为0时不限流水') +
      '</label><div class="ctrl">' +
      actStepHtml({ key: 'wager', min: 0, max: 999, ph: '请输入打码量倍数' }, cfg.wager === '' || cfg.wager == null ? '' : cfg.wager) +
      '</div></div>' +
      '<div class="act-rain-tabs">' +
      '<button type="button" class="on" data-rain-tab="daily">每日活动</button>' +
      '<button type="button" data-rain-tab="extra">额外活动</button></div>' +
      '<div class="act-rain-pane" data-rain-pane="daily">' +
      rainCopyInput('daily_copy', cfg.daily_copy) +
      rainSlotTable('daily', cfg.daily_slots) +
      '</div>' +
      '<div class="act-rain-pane" data-rain-pane="extra" hidden>' +
      '<div class="form-item"><label>活动日期 ' + actQ('额外活动生效日期') +
      '</label><div class="ctrl"><select data-cfg="extra_date">' + dateOpts + '</select></div></div>' +
      rainCopyInput('extra_copy', cfg.extra_copy) +
      '<div class="form-item"><label>活动周期 ' + actQ('额外活动重复周期') +
      '</label><div class="ctrl"><select data-cfg="extra_cycle">' + cycleOpts + '</select></div></div>' +
      rainCopyInput('extra_cycle_copy', cfg.extra_cycle_copy) +
      rainSlotTable('extra', cfg.extra_slots) +
      '</div>' +
      '<div class="form-item act-rain-head"><label class="req">下雨配置 ' +
      actQ('按 VIP 等级配置派奖总额与单次奖金区间。均分奖金把奖励总额平分到各 VIP 派奖总额') +
      '</label><div class="ctrl act-rain-bar">' +
      actStepHtml({ key: 'rain_total', min: 0, max: 99999999, ph: '奖励总额' }, rainTotal) +
      '<button class="btn btn-black" type="button" id="aRainSplit">均分奖金</button>' +
      '<span class="act-rain-stat">已配置：<b id="aRainOk">0</b>　未配置：<b id="aRainMiss">0</b></span>' +
      '</div></div>' +
      rainVipTable(cfg.vip_rain) +
      '</div>';
  }

  function actUnitHtml(key, val, unit, ph) {
    return '<span class="suffix"><input data-cfg="' + key + '" type="text" placeholder="' +
      U.escapeHtml(ph || '') + '" value="' + U.escapeHtml(val === 0 || val ? String(val) : '') +
      '"><i>' + U.escapeHtml(unit) + '</i></span>';
  }

  function actPlainHtml(key, val, ph) {
    return '<input data-cfg="' + key + '" type="text" placeholder="' + U.escapeHtml(ph || '') +
      '" value="' + U.escapeHtml(val === 0 || val ? String(val) : '') + '">';
  }

  function turntableDetailHtml(cfg) {
    var map = S.ACT_TT_GAME_DETAIL || {};
    var types = S.ACT_TT_GAMES || [];
    var picked = cfg.task1_detail || [];
    return types.map(function (t) {
      var games = map[t.id] || [];
      var boxes = games.map(function (name) {
        return '<label class="act-day"><input type="checkbox" data-tt-detail="' + U.escapeHtml(name) + '"' +
          (picked.indexOf(name) >= 0 ? ' checked' : '') + '> ' + U.escapeHtml(name) + '</label>';
      }).join('');
      return '<div class="act-tt-detail-type" data-tt-type="' + t.id + '"><b>' + U.escapeHtml(t.name) +
        '</b><div class="act-days">' + boxes + '</div></div>';
    }).join('');
  }

  function turntableBodyHtml(cfg) {
    var games = S.ACT_TT_GAMES || [];
    var selected = cfg.task1_games || [];
    var gameBoxes = games.map(function (g) {
      return '<label class="act-day"><input type="checkbox" data-tt-game="' + g.id + '"' +
        (selected.indexOf(g.id) >= 0 ? ' checked' : '') + '> ' + U.escapeHtml(g.name) + '</label>';
    }).join('');
    return '<div class="arco-form act-cfg-form">' +
      '<div class="form-item"><label class="req">奖励金额</label><div class="ctrl">' +
      actPlainHtml('reward_amount', cfg.reward_amount, '') + '</div></div>' +
      '<div class="form-item"><label class="req">初始奖励金额</label><div class="ctrl act-tt-range">' +
      actUnitHtml('init_min', cfg.init_min, 'P') + '<em>~</em>' + actUnitHtml('init_max', cfg.init_max, 'P') +
      '</div></div>' +
      '<div class="form-item"><label class="req">活动周期</label><div class="ctrl act-tt-range">' +
      actUnitHtml('cycle_days', cfg.cycle_days, '天') + '</div></div>' +
      '<div class="form-item"><label class="req">每次随机奖励金额</label><div class="ctrl act-tt-range">' +
      '<span class="act-tt-lead">提款剩余金额的</span>' +
      actUnitHtml('rand_min_pct', cfg.rand_min_pct, '%', '最低百分比') + '<em>~</em>' +
      actUnitHtml('rand_max_pct', cfg.rand_max_pct, '%', '最高百分比') +
      '</div></div>' +
      '<div class="form-item"><label class="req">随机奖励最多次数</label><div class="ctrl">' +
      '<div class="act-tt-range">' + actUnitHtml('rand_max_times', cfg.rand_max_times, '次', '最多次数') + '</div>' +
      '<div class="extra">（不中奖概率随次数递增，到达最高次数时不中奖率为100%）</div></div></div>' +
      '<div class="act-tt-sec">完成任务领取最终奖励金</div>' +
      '<p class="act-tt-note">（以下条件完成，获得最终奖励金，即提款剩余金额）</p>' +
      '<div class="form-item act-tt-task"><label>任务1</label><div class="ctrl">' +
      '<div class="act-tt-line">所邀请的用户累计输额 &gt;= P ' +
      actPlainHtml('task1_loss', cfg.task1_loss, '亏损额') +
      ' ，领取最终奖励金概率为: ' + actUnitHtml('task1_pct', cfg.task1_pct, '%', '概率') +
      '</div>' +
      '<div class="act-tt-game-lab">指定参与的游戏 (全不选则不限制游戏):</div>' +
      '<div class="act-days">' + gameBoxes + '</div>' +
      '<button type="button" class="act-tt-more" id="aTtMore">展开明细</button>' +
      '<div class="act-tt-detail" id="aTtDetail" hidden>' + turntableDetailHtml(cfg) + '</div>' +
      '</div></div>' +
      '<div class="form-item act-tt-task"><label>任务2</label><div class="ctrl">' +
      '<div class="act-tt-line">邀请的用户 &gt;= ' +
      actPlainHtml('task2_invite', cfg.task2_invite, '人数') +
      ' 人 且其中 ' + actPlainHtml('task2_third', cfg.task2_third, '人数') +
      ' 人，通过三方注册，领取最终奖励金概率为: ' +
      actUnitHtml('task2_pct', cfg.task2_pct, '%', '概率') +
      '</div></div></div>' +
      '<div class="form-item act-tt-task"><label class="req">简讯内容模板</label><div class="ctrl">' +
      '<textarea data-cfg="sms_tpl" rows="4" placeholder="请输入短信分享简写内容，分享链接以代替">' +
      U.escapeHtml(cfg.sms_tpl || '') + '</textarea></div></div>' +
      '</div>';
  }

  function ltToLocal(s) {
    if (!s) return '';
    return String(s).replace(' ', 'T').slice(0, 16);
  }

  function ltFromLocal(s) {
    if (!s) return '';
    var t = String(s).replace('T', ' ');
    return t.length === 16 ? t + ':00' : t;
  }

  function ltEmptyRow(cols) {
    return '<tr class="act-empty-row"><td colspan="' + cols + '"><div class="act-empty">暂无数据</div></td></tr>';
  }

  function ltRankLabel(r) {
    return S.lotteryRankLabel ? S.lotteryRankLabel(r) : ('top ' + (r.from || 0) + ' ~ ' + (r.to || 0));
  }

  function lotteryPromoHtml(groups) {
    return (groups || []).map(function (g, i) {
      return '<div class="act-lt-promo" data-promo-i="' + i + '">' +
        '<div class="act-lt-lang"><label class="req">英文</label><div>' +
        '<div class="upload' + (g.en ? ' done' : '') + '" data-up="aLtEn' + i + '"><span class="plus">+</span>本地上传</div>' +
        '<div class="extra">支持格式：jpg.png图片</div><div class="act-lt-group">第' + (i + 1) + '组</div></div></div>' +
        '<div class="act-lt-lang"><label class="req">菲语</label><div>' +
        '<div class="upload' + (g.fil ? ' done' : '') + '" data-up="aLtFil' + i + '"><span class="plus">+</span>本地上传</div>' +
        '<div class="extra">支持格式：jpg.png图片</div><div class="act-lt-group">第' + (i + 1) + '组</div></div></div>' +
        '</div>';
    }).join('');
  }

  function ltIsShareTask(t) {
    return !!(t && (t.kind === 'share' || String(t.cond || '').indexOf('分享') >= 0));
  }

  function ltAddTaskConds() {
    return (S.ACT_LT_CONDS || []).filter(function (c) { return String(c).indexOf('分享') < 0; });
  }

  function lotteryTaskRows(tasks) {
    var opts = (tasks || []).filter(function (t) { return !ltIsShareTask(t); });
    if (!opts.length) return ltEmptyRow(4);
    return opts.map(function (t, i) {
      var cond = t.cond && String(t.cond).indexOf('分享') < 0 ? t.cond : (ltAddTaskConds()[0] || '');
      var condOpts = ltAddTaskConds().map(function (c) {
        return '<option' + (c === cond ? ' selected' : '') + '>' + U.escapeHtml(c) + '</option>';
      }).join('');
      return '<tr class="act-lt-task-line">' +
        '<td><div class="stepper list-step act-lt-task-step">' +
        '<button type="button" data-lt-task-step="-1">−</button>' +
        '<input data-lt-task-sort type="number" min="1" value="' + U.escapeHtml(String(t.sort || i + 1)) + '">' +
        '<button type="button" data-lt-task-step="1">+</button></div></td>' +
        '<td><select class="act-lt-task-cond" data-lt-task-cond>' + condOpts + '</select></td>' +
        '<td><input class="act-lt-task-val" data-lt-task-val type="text" placeholder="' +
        U.escapeHtml('请输入' + cond) + '" value="' + U.escapeHtml(t.value || '') + '"></td>' +
        '<td><button type="button" class="btn btn-danger" data-lt-del-task>删除任务</button></td></tr>';
    }).join('');
  }

  function readLtTasksFromBox(box) {
    if (!box) return [];
    return $$ (box, '#aLtTaskBody tr.act-lt-task-line').map(function (tr) {
      var sortEl = tr.querySelector('[data-lt-task-sort]');
      var condEl = tr.querySelector('[data-lt-task-cond]');
      var valEl = tr.querySelector('[data-lt-task-val]');
      var cond = condEl ? condEl.value : '';
      if (!cond || String(cond).indexOf('分享') >= 0) return null;
      return {
        sort: Number(sortEl && sortEl.value || 1),
        cond: cond,
        value: valEl ? valEl.value.trim() : '',
        enabled: true
      };
    }).filter(Boolean);
  }

  function lotteryPrizeRows(prizes) {
    if (!prizes || !prizes.length) return ltEmptyRow(7);
    return prizes.map(function (p, i) {
      return '<tr><td>' + U.escapeHtml(String(p.sort || '')) + '</td><td>' + U.escapeHtml(String(p.qty || '')) +
        '</td><td>' + U.escapeHtml(p.type || '') + '</td><td>' + U.escapeHtml(p.name || '') +
        '</td><td>' + U.escapeHtml(p.rank || '—') + '</td><td>' + U.escapeHtml(String(p.value || '—')) +
        '</td><td><button type="button" class="op-link danger" data-lt-del-prize="' + i + '">删除</button></td></tr>';
    }).join('');
  }

  function lotteryRankHtml(ranks) {
    var list = ranks && ranks.length ? ranks : [{ from: '', to: '', desc: '' }];
    var body = list.map(function (r, i) {
      var last = i === list.length - 1;
      var ops = last
        ? '<button type="button" class="btn btn-black" data-lt-rank-add>新增</button>' +
          (list.length > 1 ? '<button type="button" class="btn btn-danger" data-lt-rank-del="' + i + '">删除</button>' : '')
        : '';
      return '<tr class="act-lt-rank-row" data-rank-i="' + i + '">' +
        '<td><div class="act-lt-rank-range"><span class="act-tt-lead">top</span>' +
        actStepHtml({ key: 'rank_from_' + i, min: 1, max: 9999, ph: '请输入' }, (r.from === 0 || r.from) ? r.from : '') +
        '<em>~</em>' +
        actStepHtml({ key: 'rank_to_' + i, min: 1, max: 9999, ph: '请输入' }, (r.to === 0 || r.to) ? r.to : '') +
        '</div></td>' +
        '<td><input data-rank-desc="' + i + '" type="text" placeholder="请输入" value="' + U.escapeHtml(r.desc || '') + '"></td>' +
        '<td class="act-lt-rank-ops">' + ops + '</td></tr>';
    }).join('');
    return '<table class="act-vip-table act-rank-table"><thead><tr><th>排名区间</th><th>排名说明</th><th>操作</th></tr></thead><tbody>' +
      body + '</tbody></table>';
  }

  function lotteryVipHtml(rows) {
    var body = [0, 1, 2, 3, 4, 5].map(function (i) {
      var r = (rows && rows[i]) || {};
      return '<tr><td>VIP' + i + '</td>' +
        '<td><input data-lt-vip="min" data-i="' + i + '" type="text" placeholder="请输入奖金最低值" value="' +
        U.escapeHtml(r.min || '') + '"></td>' +
        '<td><input data-lt-vip="max" data-i="' + i + '" type="text" placeholder="请输入奖金最高值" value="' +
        U.escapeHtml(r.max || '') + '"></td></tr>';
    }).join('');
    return '<table class="act-vip-table"><thead><tr><th>VIP等级</th><th>奖金最低值</th><th>奖金最高值</th></tr></thead><tbody>' +
      body + '</tbody></table>';
  }

  function lotteryBodyHtml(cfg) {
    var start = ltToLocal(cfg.startAt);
    var typeOpts = '<option value="">请选择奖品类型</option>' + (S.ACT_LT_PRIZE_TYPES || []).map(function (t) {
      return '<option>' + t + '</option>';
    }).join('');
    var games = cfg.games || [];
    var opts = S.ACT_GAME_OPTS || [];
    var names = opts.filter(function (g) { return games.indexOf(g.id) >= 0; }).map(function (g) { return g.name; });
    var gameBoxes = opts.map(function (g) {
      return '<label class="act-day"><input type="checkbox" data-lt-game="' + g.id + '"' +
        (games.indexOf(g.id) >= 0 ? ' checked' : '') + '> ' + U.escapeHtml(g.name) + '</label>';
    }).join('');
    return '<div class="arco-form act-cfg-form act-lt-form">' +
      '<div class="form-item"><label class="req">活动开始时间</label><div class="ctrl">' +
      '<input data-cfg="startAt" type="datetime-local" placeholder="请选择活动开始时间" value="' + U.escapeHtml(start) + '">' +
      '</div></div>' +
      '<div class="form-item"><label class="req">循环周期</label><div class="ctrl act-tt-range">' +
      actUnitHtml('cycle_days', cfg.cycle_days, '天', '请输入循环周期') +
      '</div></div>' +
      '<div class="act-lt-sec">分享任务配置 <span>分享至FB并@5个好友</span></div>' +
      '<div class="form-item"><label>分享任务开关 ' + actQ('默认打开。打开则前台展示分享任务；关闭则前台不展示，本期无需完成分享即可参与抽奖') +
      '</label><div class="ctrl"><button class="switch' + (cfg.share_on !== 0 && cfg.share_on !== false ? ' on' : '') +
      '" type="button" data-cfg-sw="share_on"><i></i></button></div></div>' +
      '<div class="form-item"><label>任务排序</label><div class="ctrl">' +
      actStepHtml({ key: 'share_sort', min: 1, max: 99 }, cfg.share_sort || 1) + '</div></div>' +
      '<div class="act-lt-sec act-lt-sec-row">上传用户宣传图片 <button type="button" class="btn btn-black act-slot-add" id="aLtPromoAdd">+</button></div>' +
      '<div id="aLtPromo">' + lotteryPromoHtml(cfg.promo) + '</div>' +
      '<div class="act-lt-promo-ops"><button type="button" class="act-lt-trash" id="aLtPromoDel" title="删除">🗑</button></div>' +
      '<div class="act-lt-sec">上传用户宣传视频</div>' +
      '<div class="form-item"><label class="req">英文</label><div class="ctrl">' +
      '<button type="button" class="btn btn-black' + (cfg.video_en ? ' done' : '') + '" data-lt-video="en">点击上传</button>' +
      '<div class="extra">mp4.webm格式视频</div></div></div>' +
      '<div class="form-item"><label class="req">菲语</label><div class="ctrl">' +
      '<button type="button" class="btn btn-black' + (cfg.video_fil ? ' done' : '') + '" data-lt-video="fil">点击上传</button>' +
      '<div class="extra">mp4.webm格式视频</div></div></div>' +
      '<div class="act-lt-sec">可选任务配置</div>' +
      '<p class="act-tt-note">分享任务用上方开关控制，不出现在本表。点「新增任务」直接加一行。</p>' +
      '<div class="form-item"><label>活动允许游戏 ' + actQ('全不选则不限制游戏') + '</label><div class="ctrl">' +
      actGamePickBtn('aLtPickGames') +
      '<div class="act-game-hint" id="aLtGamesHint">' + (names.length ? names.join('、') : '未选择') + '</div>' +
      '<div class="act-game-panel" id="aLtGamePanel" hidden>' + gameBoxes + '</div></div></div>' +
      '<div class="act-lt-table-head"><button type="button" class="btn btn-black" id="aLtAddTask">新增任务</button></div>' +
      '<table class="act-vip-table act-lt-task-table"><thead><tr><th>任务排序</th><th>任务条件</th><th>条件说明或数值</th><th>操作</th></tr></thead>' +
      '<tbody id="aLtTaskBody">' + lotteryTaskRows(cfg.tasks) + '</tbody></table>' +
      '<div class="act-lt-sec">红包雨配置</div>' +
      '<div class="form-item"><label class="req">红包雨打码倍数</label><div class="ctrl">' +
      actPlainHtml('rain_wager', cfg.rain_wager, '请输入红包雨打码倍数') + '</div></div>' +
      '<div class="act-lt-sec">红包雨单期下雨配置</div>' +
      '<div class="form-item"><label></label><div class="ctrl act-lt-radio">' +
      '<label><input type="radio" name="aLtRainMode" value="all"' + (cfg.rain_mode !== 'slot' ? ' checked' : '') + '> 全天下雨</label>' +
      '<label><input type="radio" name="aLtRainMode" value="slot"' + (cfg.rain_mode === 'slot' ? ' checked' : '') + '> 时间段下雨</label>' +
      '</div></div>' +
      '<div id="aLtSlots" ' + (cfg.rain_mode === 'slot' ? '' : 'hidden') + '>' +
      rainSlotTable('lt', cfg.rain_slots) + '</div>' +
      '<div class="act-lt-sec">下雨配置 ' + actQ('金额按 VIP 最低~最高随机，领取后需完成打码倍数') + '</div>' +
      '<div class="act-rain-bar" style="margin-bottom:12px">' +
      '<span>奖励总额</span>' + actStepHtml({ key: 'rain_total_amt', min: 0, max: 99999999 }, cfg.rain_total_amt || 0) +
      '<span>红包雨总数</span>' + actStepHtml({ key: 'rain_count', min: 0, max: 999999 }, cfg.rain_count || 0) +
      '</div>' +
      lotteryVipHtml(cfg.rain_vip) +
      '<div class="act-lt-sec">流水排名配置</div>' +
      '<p class="act-tt-note">* 排名区间配置：以下排名均按照用户有效流水金额进行排名</p>' +
      '<div id="aLtRanks">' + lotteryRankHtml(cfg.ranks) + '</div>' +
      '<div class="act-lt-sec">抽奖配置</div>' +
      '<div class="act-lt-table-head"><span class="req-lab">奖品配置</span>' +
      '<button type="button" class="btn btn-black" id="aLtAddPrize">新增奖品</button></div>' +
      '<table class="act-vip-table"><thead><tr><th>奖品排序</th><th>奖品个数</th><th>奖品类型</th><th>奖品名称</th><th>所属排名</th><th>奖品价值</th><th>操作</th></tr></thead>' +
      '<tbody id="aLtPrizeBody">' + lotteryPrizeRows(cfg.prizes) + '</tbody></table>' +
      '<div class="act-lt-sec">保底配置</div>' +
      '<div class="form-item"><label class="req">未抽中奖品用户保底奖励</label><div class="ctrl">' +
      actPlainHtml('guarantee', cfg.guarantee, '请输入保底金额') + '</div></div>' +
      '<div class="form-item"><label class="req">保底配置图片</label><div class="ctrl">' +
      actUploadHtml('aLtGImg', !!cfg.guarantee_img) + '</div></div>' +
      '<div class="form-item"><label class="req">分享链接配置</label><div class="ctrl">' +
      actPlainHtml('share_url', cfg.share_url, '请输入分享链接配置') + '</div></div>' +
      '<div class="form-item"><label class="req">官方账号</label><div class="ctrl">' +
      actPlainHtml('official', cfg.official, '请输入官方账号') + '</div></div>' +
      '<div class="act-sub" id="aLtPrizeSub" hidden><div class="act-sub-card"><h4>新增奖品</h4>' +
      '<div class="form-item"><label class="req">奖品排序</label><div class="ctrl"><input id="aLtPrizeSort" type="text" value="1"></div></div>' +
      '<div class="form-item"><label class="req">所属排名</label><div class="ctrl"><select id="aLtPrizeRank"></select></div></div>' +
      '<div class="form-item"><label class="req">奖品个数</label><div class="ctrl"><input id="aLtPrizeQty" type="text" placeholder="请输入奖品个数"></div></div>' +
      '<div class="form-item"><label class="req">奖品类型</label><div class="ctrl"><select id="aLtPrizeType">' + typeOpts + '</select></div></div>' +
      '<div class="form-item"><label class="req">奖品名称</label><div class="ctrl"><input id="aLtPrizeName" type="text" placeholder="请输入奖品名称"></div></div>' +
      '<div class="form-item"><label class="req">奖品价值</label><div class="ctrl"><input id="aLtPrizeVal" type="text" placeholder="请输入奖品价值"></div></div>' +
      '<div class="form-item"><label class="req">奖品展示图片</label><div class="ctrl">' + actUploadHtml('aLtPrizeImg', false) + '</div></div>' +
      '<div class="act-sub-ops"><button type="button" class="btn" id="aLtPrizeCancel">取消</button>' +
      '<button type="button" class="btn btn-black" id="aLtPrizeOk">确定</button></div></div></div>' +
      '</div>';
  }

  function actTypeFieldsHtml(type, row) {
    if (type === 'weekLoss') {
      var wcfg = (row && row.cfg) ? row.cfg : (S.defaultWeekLossCfg ? S.defaultWeekLossCfg() : {});
      return weekLossBodyHtml(wcfg);
    }
    if (type === 'dayLoss') {
      var dcfg = (row && row.cfg) ? row.cfg : (S.defaultDayLossCfg ? S.defaultDayLossCfg() : {});
      return dayLossBodyHtml(dcfg);
    }
    if (type === 'rain') {
      var rcfg = (row && row.cfg) ? row.cfg : (S.defaultRainCfg ? S.defaultRainCfg() : {});
      return rainBodyHtml(rcfg);
    }
    if (type === 'turntable') {
      var tcfg = (row && row.cfg) ? row.cfg : (S.defaultTurntableCfg ? S.defaultTurntableCfg() : {});
      return turntableBodyHtml(tcfg);
    }
    if (type === 'lottery') {
      var lcfg = (row && row.cfg) ? row.cfg : (S.defaultLotteryCfg ? S.defaultLotteryCfg() : {});
      if (row && row.startAt && !lcfg.startAt) lcfg.startAt = row.startAt;
      return lotteryBodyHtml(lcfg);
    }
    var fields = (S.ACT_TYPE_FIELDS || {})[type] || [];
    if (!fields.length) return '<div class="act-type-empty">请选择活动类型</div>';
    var tip = '';
    return tip + '<div class="arco-form act-cfg-form">' + fields.map(function (f) {
      var val = actCfgVal(row, f);
      var ctrl = '';
      if (f.kind === 'step') ctrl = actStepHtml(f, val);
      else if (f.kind === 'switch') {
        ctrl = '<button class="switch' + (Number(val) === 1 ? ' on' : '') + '" type="button" data-cfg-sw="' +
          f.key + '"><i></i></button>';
      } else {
        ctrl = '<input data-cfg="' + f.key + '" data-kind="text" type="text" placeholder="' +
          U.escapeHtml(f.ph || ('请输入' + f.label)) + '" value="' + U.escapeHtml(String(val == null ? '' : val)) + '">';
      }
      return '<div class="form-item"><label class="req">' + U.escapeHtml(f.label) +
        '</label><div class="ctrl">' + ctrl + (f.extra ? '<div class="extra">' + U.escapeHtml(f.extra) + '</div>' : '') +
        '</div></div>';
    }).join('') + '</div>';
  }

  function bindActCfg(box) {
    if (!box) return;
    $$ (box, '[data-cfg-step]').forEach(function (b) {
      b.onclick = function () {
        var key = b.getAttribute('data-cfg-step');
        var inp = box.querySelector('[data-cfg="' + key + '"]');
        if (!inp) return;
        var min = Number(inp.getAttribute('data-min'));
        var max = Number(inp.getAttribute('data-max'));
        var n = Number(inp.value);
        if (isNaN(n)) n = min;
        n += Number(b.getAttribute('data-d')) || 0;
        if (n < min) n = min;
        if (n > max) n = max;
        inp.value = String(n);
      };
    });
    $$ (box, '[data-cfg-sw]').forEach(function (b) {
      b.onclick = function () {
        b.classList.toggle('on');
        if (b.getAttribute('data-cfg-sw') === 'extra_on') {
          var extra = box.querySelector('[data-extra-block]');
          if (extra) extra.hidden = !b.classList.contains('on');
        }
      };
    });
    var pick = box.querySelector('#aPickGames');
    var panel = box.querySelector('#aGamePanel');
    var hint = box.querySelector('#aGamesHint');
    if (pick && panel) {
      pick.onclick = function () { panel.hidden = !panel.hidden; };
      $$ (panel, '[data-game]').forEach(function (c) {
        c.onchange = function () {
          var names = $$ (panel, '[data-game]:checked').map(function (x) {
            var opt = (S.ACT_GAME_OPTS || []).filter(function (g) { return g.id === x.getAttribute('data-game'); })[0];
            return opt ? opt.name : x.getAttribute('data-game');
          });
          if (hint) hint.textContent = names.length ? names.join('、') : '未选择';
        };
      });
    }
    bindRainCfg(box);
    bindTurntableCfg(box);
    bindLotteryCfg(box);
  }

  function bindLotteryCfg(box) {
    if (!box || !box.querySelector('.act-lt-form')) return;
    var st = { tasks: [], prizes: [] };
    st.tasks = readLtTasksFromBox(box);
    $$ (box, '#aLtPrizeBody tr').forEach(function (tr) {
      if (tr.classList.contains('act-empty-row')) return;
      var tds = tr.querySelectorAll('td');
      st.prizes.push({
        sort: tds[0].textContent, qty: tds[1].textContent, type: tds[2].textContent,
        name: tds[3].textContent, rank: tds[4].textContent, value: tds[5].textContent, img: 1
      });
    });
    box._lt = st;

    function bindUploads(root) {
      $$ (root, '[data-up]').forEach(function (el) {
        el.onclick = function () { el.classList.toggle('done'); };
      });
    }
    bindUploads(box);

    function readRanks() {
      return $$ (box, '.act-lt-rank-row').map(function (line) {
        var inputs = line.querySelectorAll('[data-kind="step"]');
        var desc = line.querySelector('[data-rank-desc]');
        return {
          from: inputs[0] ? Number(inputs[0].value || 0) : 0,
          to: inputs[1] ? Number(inputs[1].value || 0) : 0,
          desc: desc ? desc.value.trim() : ''
        };
      });
    }

    function renderRanks(ranks) {
      var wrap = box.querySelector('#aLtRanks');
      if (!wrap) return;
      wrap.innerHTML = lotteryRankHtml(ranks);
      bindActCfgSteppers(wrap);
    }

    function renderPromo() {
      var wrap = box.querySelector('#aLtPromo');
      if (!wrap) return;
      var n = $$ (wrap, '.act-lt-promo').length;
      var groups = [];
      for (var i = 0; i < n; i++) {
        var en = wrap.querySelector('[data-up="aLtEn' + i + '"]');
        var fil = wrap.querySelector('[data-up="aLtFil' + i + '"]');
        groups.push({ en: !!(en && en.classList.contains('done')), fil: !!(fil && fil.classList.contains('done')) });
      }
      return groups;
    }

    var addPromo = box.querySelector('#aLtPromoAdd');
    if (addPromo) {
      addPromo.onclick = function () {
        var groups = renderPromo();
        groups.push({ en: 0, fil: 0 });
        box.querySelector('#aLtPromo').innerHTML = lotteryPromoHtml(groups);
        bindUploads(box.querySelector('#aLtPromo'));
      };
    }
    var delPromo = box.querySelector('#aLtPromoDel');
    if (delPromo) {
      delPromo.onclick = function () {
        var groups = renderPromo();
        if (groups.length <= 1) { U.toast('至少保留一组宣传图'); return; }
        groups.pop();
        box.querySelector('#aLtPromo').innerHTML = lotteryPromoHtml(groups);
        bindUploads(box.querySelector('#aLtPromo'));
      };
    }
    $$ (box, '[data-lt-video]').forEach(function (b) {
      b.onclick = function () { b.classList.toggle('done'); b.textContent = b.classList.contains('done') ? '已上传' : '点击上传'; };
    });
    var pick = box.querySelector('#aLtPickGames');
    var panel = box.querySelector('#aLtGamePanel');
    var hint = box.querySelector('#aLtGamesHint');
    if (pick && panel) {
      pick.onclick = function () { panel.hidden = !panel.hidden; };
      $$ (panel, '[data-lt-game]').forEach(function (c) {
        c.onchange = function () {
          var names = $$ (panel, '[data-lt-game]:checked').map(function (x) {
            var opt = (S.ACT_GAME_OPTS || []).filter(function (g) { return g.id === x.getAttribute('data-lt-game'); })[0];
            return opt ? opt.name : x.getAttribute('data-lt-game');
          });
          if (hint) hint.textContent = names.length ? names.join('、') : '未选择';
        };
      });
    }
    $$ (box, 'input[name="aLtRainMode"]').forEach(function (r) {
      r.onchange = function () {
        var slots = box.querySelector('#aLtSlots');
        if (slots) slots.hidden = r.value !== 'slot';
      };
    });
    box.onclick = function (ev) {
      var t = ev.target;
      if (t && t.nodeType !== 1) t = t.parentElement;
      if (!t || !t.closest) return;
      var addS = t.closest('[data-rain-add="lt"]');
      if (addS) {
        var slots = rainReadSlotsFromBox(box, 'lt');
        slots.push({ start: '', end: '' });
        rainRenderSlots(box, 'lt', slots);
        return;
      }
      var delS = t.closest('[data-rain-del]');
      if (delS && delS.getAttribute('data-rain-del') === 'lt') {
        var cur = rainReadSlotsFromBox(box, 'lt');
        cur.splice(Number(delS.getAttribute('data-i')), 1);
        rainRenderSlots(box, 'lt', cur);
        return;
      }
      var addR = t.closest('[data-lt-rank-add]');
      if (addR) {
        var ranks = readRanks();
        ranks.push({ from: '', to: '', desc: '' });
        renderRanks(ranks);
        return;
      }
      var delR = t.closest('[data-lt-rank-del]');
      if (delR) {
        var rs = readRanks();
        rs.splice(Number(delR.getAttribute('data-lt-rank-del')), 1);
        renderRanks(rs);
        return;
      }
      var stepT = t.closest('[data-lt-task-step]');
      if (stepT) {
        var stepInput = stepT.parentElement.querySelector('input');
        if (stepInput) {
          var n = Number(stepInput.value || 1) + Number(stepT.getAttribute('data-lt-task-step'));
          stepInput.value = Math.max(1, n);
          st.tasks = readLtTasksFromBox(box);
        }
        return;
      }
      var delT = t.closest('[data-lt-del-task]');
      if (delT) {
        var taskTr = delT.closest('tr');
        if (taskTr) taskTr.parentNode.removeChild(taskTr);
        st.tasks = readLtTasksFromBox(box);
        box.querySelector('#aLtTaskBody').innerHTML = lotteryTaskRows(st.tasks);
        return;
      }
      var delP = t.closest('[data-lt-del-prize]');
      if (delP) {
        st.prizes.splice(Number(delP.getAttribute('data-lt-del-prize')), 1);
        box.querySelector('#aLtPrizeBody').innerHTML = lotteryPrizeRows(st.prizes);
      }
    };

    var prizeSub = box.querySelector('#aLtPrizeSub');
    var addTask = box.querySelector('#aLtAddTask');
    if (addTask) {
      addTask.onclick = function () {
        st.tasks = readLtTasksFromBox(box);
        var conds = ltAddTaskConds();
        var cond = conds[0] || '当期充值金额';
        var next = 1;
        st.tasks.forEach(function (row) {
          var n = Number(row.sort || 0);
          if (n >= next) next = n + 1;
        });
        st.tasks.push({ sort: next, cond: cond, value: '', enabled: true });
        box.querySelector('#aLtTaskBody').innerHTML = lotteryTaskRows(st.tasks);
      };
    }
    var taskBody = box.querySelector('#aLtTaskBody');
    if (taskBody) {
      taskBody.addEventListener('change', function (e) {
        var sel = e.target.closest('[data-lt-task-cond]');
        if (sel) {
          var input = sel.closest('tr').querySelector('[data-lt-task-val]');
          if (input) input.placeholder = '请输入' + sel.value;
        }
        st.tasks = readLtTasksFromBox(box);
      });
      taskBody.addEventListener('input', function () {
        st.tasks = readLtTasksFromBox(box);
      });
    }
    var addPrize = box.querySelector('#aLtAddPrize');
    if (addPrize) {
      addPrize.onclick = function () {
        var ranks = readRanks();
        var sel = box.querySelector('#aLtPrizeRank');
        sel.innerHTML = '<option value="">请选择所属排名</option>' + ranks.map(function (r) {
          return '<option>' + U.escapeHtml(ltRankLabel(r)) + '</option>';
        }).join('');
        box.querySelector('#aLtPrizeSort').value = String(st.prizes.length + 1);
        box.querySelector('#aLtPrizeQty').value = '';
        box.querySelector('#aLtPrizeType').value = '';
        box.querySelector('#aLtPrizeName').value = '';
        box.querySelector('#aLtPrizeVal').value = '';
        var img = box.querySelector('#aLtPrizeImg');
        if (img) img.classList.remove('done');
        if (prizeSub) prizeSub.hidden = false;
      };
    }
    var prizeCancel = box.querySelector('#aLtPrizeCancel');
    if (prizeCancel) prizeCancel.onclick = function () { if (prizeSub) prizeSub.hidden = true; };
    var prizeOk = box.querySelector('#aLtPrizeOk');
    if (prizeOk) {
      prizeOk.onclick = function () {
        var rank = box.querySelector('#aLtPrizeRank').value;
        var type = box.querySelector('#aLtPrizeType').value;
        var name = box.querySelector('#aLtPrizeName').value.trim();
        var qty = box.querySelector('#aLtPrizeQty').value.trim();
        var img = box.querySelector('#aLtPrizeImg');
        if (!rank) { U.toast('请选择所属排名', 'err'); return; }
        if (!type) { U.toast('请选择奖品类型', 'err'); return; }
        if (!name) { U.toast('请输入奖品名称', 'err'); return; }
        if (!qty) { U.toast('请输入奖品个数', 'err'); return; }
        if (!img || !img.classList.contains('done')) { U.toast('请上传奖品展示图片', 'err'); return; }
        st.prizes.push({
          sort: box.querySelector('#aLtPrizeSort').value || '1',
          qty: qty,
          type: type,
          name: name,
          rank: rank,
          value: box.querySelector('#aLtPrizeVal').value.trim(),
          img: 1
        });
        box.querySelector('#aLtPrizeBody').innerHTML = lotteryPrizeRows(st.prizes);
        if (prizeSub) prizeSub.hidden = true;
      };
    }
  }

  function bindActCfgSteppers(box) {
    if (!box) return;
    $$ (box, '[data-cfg-step]').forEach(function (b) {
      b.onclick = function () {
        var key = b.getAttribute('data-cfg-step');
        var inp = box.querySelector('[data-cfg="' + key + '"]');
        if (!inp) return;
        var min = Number(inp.getAttribute('data-min'));
        var max = Number(inp.getAttribute('data-max'));
        var n = Number(inp.value);
        if (isNaN(n)) n = min;
        n += Number(b.getAttribute('data-d')) || 0;
        if (n < min) n = min;
        if (n > max) n = max;
        inp.value = String(n);
      };
    });
  }

  function bindTurntableCfg(box) {
    if (!box) return;
    var more = box.querySelector('#aTtMore');
    var detail = box.querySelector('#aTtDetail');
    if (!more || !detail) return;
    more.onclick = function () {
      detail.hidden = !detail.hidden;
      more.textContent = detail.hidden ? '展开明细' : '收起明细';
    };
  }

  function rainReadSlotsFromBox(box, kind) {
    return $$ (box, '[data-rain-slots="' + kind + '"] tr').map(function (tr) {
      var start = tr.querySelector('[data-f="start"]');
      var end = tr.querySelector('[data-f="end"]');
      return { start: start ? start.value.trim() : '', end: end ? end.value.trim() : '' };
    });
  }

  function rainSyncCounts(box) {
    var ok = 0;
    $$ (box, '[data-rain-vip="total"]').forEach(function (el) {
      if (String(el.value).trim() !== '') ok += 1;
    });
    var miss = 6 - ok;
    var okEl = box.querySelector('#aRainOk');
    var missEl = box.querySelector('#aRainMiss');
    if (okEl) okEl.textContent = String(ok);
    if (missEl) missEl.textContent = String(miss);
  }

  function rainRenderSlots(box, kind, slots) {
    var tb = box.querySelector('[data-rain-slots="' + kind + '"]');
    if (!tb) return;
    tb.innerHTML = rainSlotRows(kind, slots);
  }

  function bindRainCfg(box) {
    if (!box) return;
    if (!box.querySelector('[data-rain-tab]')) {
      box.onclick = null;
      return;
    }
    $$ (box, '[data-rain-tab]').forEach(function (b) {
      b.onclick = function () {
        var tab = b.getAttribute('data-rain-tab');
        $$ (box, '[data-rain-tab]').forEach(function (x) { x.classList.toggle('on', x === b); });
        $$ (box, '[data-rain-pane]').forEach(function (p) {
          p.hidden = p.getAttribute('data-rain-pane') !== tab;
        });
      };
    });
    box.onclick = function (ev) {
      var t = ev.target;
      if (t && t.nodeType !== 1) t = t.parentElement;
      if (!t || !t.closest) return;
      var add = t.closest('[data-rain-add]');
      if (add) {
        var kind = add.getAttribute('data-rain-add');
        var slots = rainReadSlotsFromBox(box, kind);
        var startSec = 12 * 3600;
        var last = slots[slots.length - 1];
        if (last && last.end) {
          var endSec = rainParseHms(last.end);
          if (!isNaN(endSec)) startSec = endSec + 3600;
        }
        slots.push({ start: rainFmtSec(startSec), end: rainFmtSec(startSec + 300) });
        rainRenderSlots(box, kind, slots);
        return;
      }
      var del = t.closest('[data-rain-del]');
      if (del) {
        var dkind = del.getAttribute('data-rain-del');
        var idx = Number(del.getAttribute('data-i'));
        var cur = rainReadSlotsFromBox(box, dkind);
        cur.splice(idx, 1);
        rainRenderSlots(box, dkind, cur);
      }
    };
    var split = box.querySelector('#aRainSplit');
    if (split) {
      split.onclick = function () {
        var totalEl = box.querySelector('[data-cfg="rain_total"]');
        var total = totalEl ? Number(totalEl.value) : 0;
        if (!totalEl || String(totalEl.value).trim() === '' || isNaN(total) || total <= 0) {
          U.toast('请输入奖励总额', 'err');
          return;
        }
        var n = $$ (box, '[data-rain-vip="total"]').length || 6;
        var each = Math.floor((total * 100) / n) / 100;
        var used = 0;
        $$ (box, '[data-rain-vip="total"]').forEach(function (el, i) {
          var v = i === n - 1 ? Math.round((total - used) * 100) / 100 : each;
          el.value = String(v);
          used = Math.round((used + v) * 100) / 100;
        });
        rainSyncCounts(box);
        U.toast('已按 VIP 均分奖励总额（演示）');
      };
    }
    $$ (box, '[data-rain-vip]').forEach(function (el) {
      el.addEventListener('input', function () { rainSyncCounts(box); });
    });
    rainSyncCounts(box);
  }

  function readWeekLossCfg() {
    var cfg = S.defaultWeekLossCfg ? S.defaultWeekLossCfg() : {};
    var h5 = document.getElementById('aH5');
    var pc = document.getElementById('aPC');
    cfg.mobileIcon = !!(h5 && h5.classList.contains('done'));
    cfg.pcIcon = !!(pc && pc.classList.contains('done'));
    var maxEl = document.querySelector('[data-cfg="max_reward"]');
    var wagerEl = document.querySelector('[data-cfg="wager"]');
    cfg.max_reward = maxEl ? Number(maxEl.value) || 0 : 0;
    cfg.wager = wagerEl ? String(wagerEl.value).trim() : '';
    cfg.games = $$ (document, '[data-game]:checked').map(function (c) { return c.getAttribute('data-game'); });
    cfg.vip_ratio = $$ (document, '[data-vip="vip_ratio"]').map(function (el) { return Number(el.value) || 0; });
    var extraSw = document.querySelector('[data-cfg-sw="extra_on"]');
    cfg.extra_on = extraSw && extraSw.classList.contains('on') ? 1 : 0;
    var extraWagerEl = document.querySelector('[data-cfg="extra_wager"]');
    cfg.extra_wager = extraWagerEl ? String(extraWagerEl.value).trim() : '';
    cfg.extra_ratio = $$ (document, '[data-vip="extra_ratio"]').map(function (el) { return Number(el.value) || 0; });
    cfg.extra_days = $$ (document, '[data-day]').map(function (el) { return el.checked ? 1 : 0; });
    var lossSw = document.querySelector('[data-cfg-sw="total_loss_on"]');
    cfg.total_loss_on = lossSw && lossSw.classList.contains('on') ? 1 : 0;
    return cfg;
  }

  function readDayLossCfg() {
    var cfg = S.defaultDayLossCfg ? S.defaultDayLossCfg() : {};
    var h5 = document.getElementById('aH5');
    var pc = document.getElementById('aPC');
    cfg.mobileIcon = !!(h5 && h5.classList.contains('done'));
    cfg.pcIcon = !!(pc && pc.classList.contains('done'));
    var maxEl = document.querySelector('[data-cfg="max_reward"]');
    var wagerEl = document.querySelector('[data-cfg="wager"]');
    cfg.max_reward = maxEl ? Number(maxEl.value) || 0 : 0;
    cfg.wager = wagerEl ? String(wagerEl.value).trim() : '';
    cfg.games = $$ (document, '[data-game]:checked').map(function (c) { return c.getAttribute('data-game'); });
    cfg.vip_ratio = $$ (document, '[data-vip="vip_ratio"]').map(function (el) { return Number(el.value) || 0; });
    var lossSw = document.querySelector('[data-cfg-sw="total_loss_on"]');
    cfg.total_loss_on = lossSw && lossSw.classList.contains('on') ? 1 : 0;
    var rescueSw = document.querySelector('[data-cfg-sw="rescue_on"]');
    cfg.rescue_on = rescueSw && rescueSw.classList.contains('on') ? 1 : 0;
    return cfg;
  }

  function readRainCfg() {
    var cfg = S.defaultRainCfg ? S.defaultRainCfg() : {};
    var h5 = document.getElementById('aH5');
    var pc = document.getElementById('aPC');
    cfg.mobileIcon = !!(h5 && h5.classList.contains('done'));
    cfg.pcIcon = !!(pc && pc.classList.contains('done'));
    function numCfg(key) {
      var el = document.querySelector('[data-cfg="' + key + '"]');
      if (!el) return 0;
      var n = Number(el.value);
      return isNaN(n) ? 0 : n;
    }
    function txtCfg(key) {
      var el = document.querySelector('[data-cfg="' + key + '"]');
      return el ? String(el.value).trim() : '';
    }
    cfg.join_recharge = numCfg('join_recharge');
    cfg.session_reward = numCfg('session_reward');
    cfg.max_amount = numCfg('max_amount');
    cfg.wager = txtCfg('wager');
    cfg.daily_copy = txtCfg('daily_copy');
    cfg.extra_date = txtCfg('extra_date');
    cfg.extra_copy = txtCfg('extra_copy');
    cfg.extra_cycle = txtCfg('extra_cycle');
    cfg.extra_cycle_copy = txtCfg('extra_cycle_copy');
    var rainTotalEl = document.querySelector('[data-cfg="rain_total"]');
    cfg.rain_total = rainTotalEl ? String(rainTotalEl.value).trim() : '';
    cfg.daily_slots = rainReadSlotsFromBox(document, 'daily').filter(function (s) { return s.start || s.end; });
    cfg.extra_slots = rainReadSlotsFromBox(document, 'extra').filter(function (s) { return s.start || s.end; });
    cfg.vip_rain = [0, 1, 2, 3, 4, 5].map(function (i) {
      var t = document.querySelector('[data-rain-vip="total"][data-i="' + i + '"]');
      var mn = document.querySelector('[data-rain-vip="min"][data-i="' + i + '"]');
      var mx = document.querySelector('[data-rain-vip="max"][data-i="' + i + '"]');
      return {
        total: t ? String(t.value).trim() : '',
        min: mn ? String(mn.value).trim() : '',
        max: mx ? String(mx.value).trim() : ''
      };
    });
    return cfg;
  }

  function readTurntableCfg() {
    var cfg = S.defaultTurntableCfg ? S.defaultTurntableCfg() : {};
    var h5 = document.getElementById('aH5');
    var pc = document.getElementById('aPC');
    cfg.mobileIcon = !!(h5 && h5.classList.contains('done'));
    cfg.pcIcon = !!(pc && pc.classList.contains('done'));
    function txt(key) {
      var el = document.querySelector('[data-cfg="' + key + '"]');
      return el ? String(el.value).trim() : '';
    }
    ['reward_amount', 'init_min', 'init_max', 'cycle_days', 'rand_min_pct', 'rand_max_pct',
      'rand_max_times', 'task1_loss', 'task1_pct', 'task2_invite', 'task2_third', 'task2_pct', 'sms_tpl'
    ].forEach(function (k) { cfg[k] = txt(k); });
    cfg.task1_games = $$ (document, '[data-tt-game]:checked').map(function (c) { return c.getAttribute('data-tt-game'); });
    cfg.task1_detail = $$ (document, '[data-tt-detail]:checked').map(function (c) { return c.getAttribute('data-tt-detail'); });
    return cfg;
  }

  function readLotteryCfg() {
    var cfg = S.defaultLotteryCfg ? S.defaultLotteryCfg() : {};
    var h5 = document.getElementById('aH5');
    var pc = document.getElementById('aPC');
    cfg.mobileIcon = !!(h5 && h5.classList.contains('done'));
    cfg.pcIcon = !!(pc && pc.classList.contains('done'));
    function txt(key) {
      var el = document.querySelector('[data-cfg="' + key + '"]');
      return el ? String(el.value).trim() : '';
    }
    cfg.startAt = ltFromLocal(txt('startAt'));
    cfg.cycle_days = txt('cycle_days');
    cfg.share_sort = txt('share_sort') || '1';
    cfg.share_text = '分享至FB并@5个好友';
    var shareSw = document.querySelector('[data-cfg-sw="share_on"]');
    cfg.share_on = shareSw && shareSw.classList.contains('on') ? 1 : 0;
    cfg.rain_wager = txt('rain_wager');
    cfg.rain_total_amt = Number(txt('rain_total_amt')) || 0;
    cfg.rain_count = Number(txt('rain_count')) || 0;
    cfg.guarantee = txt('guarantee');
    cfg.share_url = txt('share_url');
    cfg.official = txt('official');
    var mode = document.querySelector('input[name="aLtRainMode"]:checked');
    cfg.rain_mode = mode ? mode.value : 'all';
    cfg.rain_slots = rainReadSlotsFromBox(document, 'lt').filter(function (s) { return s.start || s.end; });
    var box = document.getElementById('aTypeBox');
    cfg.promo = [];
    var promoWrap = document.getElementById('aLtPromo');
    if (promoWrap) {
      $$ (promoWrap, '.act-lt-promo').forEach(function (row, i) {
        var en = row.querySelector('[data-up="aLtEn' + i + '"]');
        var fil = row.querySelector('[data-up="aLtFil' + i + '"]');
        cfg.promo.push({ en: !!(en && en.classList.contains('done')), fil: !!(fil && fil.classList.contains('done')) });
      });
    }
    var ven = document.querySelector('[data-lt-video="en"]');
    var vfil = document.querySelector('[data-lt-video="fil"]');
    cfg.video_en = ven && ven.classList.contains('done') ? 1 : 0;
    cfg.video_fil = vfil && vfil.classList.contains('done') ? 1 : 0;
    cfg.games = $$ (document, '[data-lt-game]:checked').map(function (c) { return c.getAttribute('data-lt-game'); });
    cfg.tasks = readLtTasksFromBox(box);
    cfg.prizes = (box && box._lt && box._lt.prizes) ? box._lt.prizes : [];
    cfg.ranks = $$ (document, '.act-lt-rank-row').map(function (line) {
      var inputs = line.querySelectorAll('[data-kind="step"]');
      var desc = line.querySelector('[data-rank-desc]');
      return {
        from: inputs[0] ? Number(inputs[0].value || 0) : 0,
        to: inputs[1] ? Number(inputs[1].value || 0) : 0,
        desc: desc ? desc.value.trim() : ''
      };
    });
    cfg.rain_vip = [0, 1, 2, 3, 4, 5].map(function (i) {
      var mn = document.querySelector('[data-lt-vip="min"][data-i="' + i + '"]');
      var mx = document.querySelector('[data-lt-vip="max"][data-i="' + i + '"]');
      return { lv: i, min: mn ? mn.value.trim() : '', max: mx ? mx.value.trim() : '' };
    });
    var gimg = document.getElementById('aLtGImg');
    cfg.guarantee_img = !!(gimg && gimg.classList.contains('done'));
    return cfg;
  }

  function rainSlotsErr(slots, label) {
    var parsed = [];
    for (var i = 0; i < slots.length; i++) {
      var a = rainParseHms(slots[i].start);
      var b = rainParseHms(slots[i].end);
      if (isNaN(a) || isNaN(b)) return label + '第' + (i + 1) + '条请填写开始/结束时间（HH:mm:ss）';
      if (a >= b) return label + '第' + (i + 1) + '条结束时间须晚于开始时间';
      parsed.push({ a: a, b: b });
    }
    parsed.sort(function (x, y) { return x.a - y.a; });
    for (var j = 1; j < parsed.length; j++) {
      if (parsed[j].a < parsed[j - 1].b) return label + '时间段不可重叠';
    }
    return '';
  }

  function readActCfg(type) {
    if (type === 'weekLoss') return readWeekLossCfg();
    if (type === 'dayLoss') return readDayLossCfg();
    if (type === 'rain') return readRainCfg();
    if (type === 'turntable') return readTurntableCfg();
    if (type === 'lottery') return readLotteryCfg();
    var fields = (S.ACT_TYPE_FIELDS || {})[type] || [];
    var cfg = S.defaultActCfg ? S.defaultActCfg(type) : {};
    fields.forEach(function (f) {
      if (f.kind === 'switch') {
        var sw = document.querySelector('[data-cfg-sw="' + f.key + '"]');
        cfg[f.key] = sw && sw.classList.contains('on') ? 1 : 0;
        return;
      }
      var el = document.querySelector('[data-cfg="' + f.key + '"]');
      if (!el) return;
      if (f.kind === 'step') {
        var n = Number(el.value);
        cfg[f.key] = isNaN(n) ? f.def : n;
      } else cfg[f.key] = el.value.trim();
    });
    return cfg;
  }

  function validActCfg(type, cfg) {
    if (type === 'weekLoss' || type === 'dayLoss') {
      if (cfg.wager === '' || isNaN(Number(cfg.wager))) {
        return type === 'weekLoss' ? '请输入周亏损打码量倍数' : '请输入打码量倍数';
      }
      if (!cfg.games || !cfg.games.length) return '请选择活动允许游戏';
      if (type === 'weekLoss' && cfg.extra_on) {
        if (cfg.extra_wager === '' || isNaN(Number(cfg.extra_wager))) return '请输入周亏损额外奖励打码倍数';
        if (!(cfg.extra_days || []).some(function (d) { return d; })) return '额外周亏损返奖时间不能为空';
      }
      return '';
    }
    if (type === 'rain') {
      if (cfg.wager === '' || isNaN(Number(cfg.wager))) return '请输入打码量倍数';
      if (!cfg.daily_copy) return '请输入每日活动显示文案';
      if (!cfg.daily_slots || !cfg.daily_slots.length) return '请配置每日活动时间段';
      var dailyErr = rainSlotsErr(cfg.daily_slots, '每日活动');
      if (dailyErr) return dailyErr;
      var extraOn = !!(cfg.extra_date || cfg.extra_cycle || cfg.extra_copy || cfg.extra_cycle_copy || (cfg.extra_slots || []).length);
      if (extraOn) {
        if (!cfg.extra_date) return '请选择额外活动日期';
        if (!cfg.extra_copy) return '请输入额外活动显示文案';
        if (!cfg.extra_cycle) return '请选择额外活动周期';
        if (!cfg.extra_cycle_copy) return '请输入额外活动周期显示文案';
        if (!cfg.extra_slots || !cfg.extra_slots.length) return '请配置额外活动时间段';
        var extraErr = rainSlotsErr(cfg.extra_slots, '额外活动');
        if (extraErr) return extraErr;
      }
      var vip = cfg.vip_rain || [];
      for (var i = 0; i < vip.length; i++) {
        var mn = vip[i].min === '' ? NaN : Number(vip[i].min);
        var mx = vip[i].max === '' ? NaN : Number(vip[i].max);
        if (!isNaN(mn) && !isNaN(mx) && mn > mx) return 'VIP' + i + ' 奖金最低值不能大于最高值';
      }
      return '';
    }
    if (type === 'turntable') {
      if (cfg.reward_amount === '' || isNaN(Number(cfg.reward_amount))) return '请输入奖励金额';
      if (cfg.init_min === '' || cfg.init_max === '' || isNaN(Number(cfg.init_min)) || isNaN(Number(cfg.init_max))) {
        return '请输入初始奖励金额';
      }
      if (Number(cfg.init_min) > Number(cfg.init_max)) return '初始奖励金额下限不能大于上限';
      if (cfg.cycle_days === '' || isNaN(Number(cfg.cycle_days)) || Number(cfg.cycle_days) < 1) return '请输入活动周期';
      if (cfg.rand_min_pct === '' || cfg.rand_max_pct === '' || isNaN(Number(cfg.rand_min_pct)) || isNaN(Number(cfg.rand_max_pct))) {
        return '请输入每次随机奖励金额比例';
      }
      if (Number(cfg.rand_min_pct) > Number(cfg.rand_max_pct)) return '随机奖励最低比例不能大于最高比例';
      if (cfg.rand_max_times === '' || isNaN(Number(cfg.rand_max_times)) || Number(cfg.rand_max_times) < 1) {
        return '请输入随机奖励最多次数';
      }
      if (cfg.task1_loss === '' || cfg.task1_pct === '') return '请完善任务1';
      if (cfg.task2_invite === '' || cfg.task2_third === '' || cfg.task2_pct === '') return '请完善任务2';
      if (Number(cfg.task2_third) > Number(cfg.task2_invite)) return '三方注册人数不能大于邀请人数';
      if (!cfg.sms_tpl) return '请输入简讯内容模板';
      return '';
    }
    if (type === 'lottery') {
      if (!cfg.startAt) return '请选择活动开始时间';
      if (cfg.cycle_days === '' || isNaN(Number(cfg.cycle_days)) || Number(cfg.cycle_days) < 1) return '循环周期至少 1 天';
      var shareOn = cfg.share_on !== 0 && cfg.share_on !== false;
      var taskOn = (cfg.tasks || []).some(function (t) { return t && t.enabled !== false; });
      if (!shareOn && !taskOn) return '必须选中一个任务开启';
      if (cfg.rain_wager === '' || isNaN(Number(cfg.rain_wager))) return '请输入红包雨打码倍数';
      if (!cfg.ranks || !cfg.ranks.length) return '至少配置一条流水排名区间';
      for (var ri = 0; ri < cfg.ranks.length; ri++) {
        var a = Number(cfg.ranks[ri].from);
        var b = Number(cfg.ranks[ri].to);
        if (!a || !b || a < 1 || b < 1) return '第 ' + (ri + 1) + ' 条排名起止必须是 ≥1 的整数';
        if (a > b) return '第 ' + (ri + 1) + ' 条排名起点不能大于终点';
      }
      if (!cfg.prizes || !cfg.prizes.length) return '请至少新增一个抽奖奖品';
      var labels = (cfg.ranks || []).map(ltRankLabel);
      for (var pi = 0; pi < cfg.prizes.length; pi++) {
        var p = cfg.prizes[pi];
        if (!p.rank || labels.indexOf(p.rank) < 0) return '奖品「' + (p.name || (pi + 1)) + '」所属排名已失效，请重新选择';
      }
      if (cfg.guarantee === '') return '请填写未中奖保底金额';
      if (!cfg.guarantee_img) return '请上传保底配置图片';
      if (!cfg.share_url) return '请输入分享链接配置';
      if (!cfg.official) return '请输入官方账号';
      if (cfg.rain_mode === 'slot') {
        if (!cfg.rain_slots || !cfg.rain_slots.length) return '时间段下雨至少配置一个时段';
        var slotErr = rainSlotsErr(cfg.rain_slots, '红包雨');
        if (slotErr) return slotErr;
      }
      return '';
    }
    var fields = (S.ACT_TYPE_FIELDS || {})[type] || [];
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.kind === 'step') {
        var n = Number(cfg[f.key]);
        if (isNaN(n) || n < f.min) return f.label + '不能小于' + f.min;
        if (n > f.max) return f.label + '不能大于' + f.max;
      }
      if (f.kind === 'text' && f.key === 'jump_url' && cfg[f.key] && !/^https?:\/\//.test(cfg[f.key])) {
        return '请输入有完整协议的外部链接，例：https://google.com';
      }
    }
    return '';
  }

  Pages.activity = function (root) {
    mountList(root, {
      title: '活动管理',
      size: 30,
      filters: [
        { key: 'type', label: '类型', type: 'select', options: S.ACT_TYPES },
        { key: 'status', label: '状态', type: 'select', options: [{ id: '1', label: '开启' }, { id: '0', label: '关闭' }] },
        { key: 'float', label: '悬浮开关', type: 'select', options: [{ id: '1', label: '开启' }, { id: '0', label: '关闭' }] },
        { key: 'create_time', label: '创建时间', type: 'daterange' }
      ],
      validateQ: function (q) {
        if (q.create_timeFrom && q.create_timeTo && q.create_timeFrom > q.create_timeTo) {
          return '开始时间不能晚于结束时间';
        }
        return '';
      },
      toolbar: '<button class="btn btn-black" type="button" data-add>+ 新增</button>' +
        '<button class="btn btn-danger" type="button" data-del>删除</button>' +
        '<button class="btn btn-black" type="button" data-tags>标签管理</button>' +
        '<button class="btn btn-black" type="button" data-sync-center title="同步活动中心配置">同步</button>',
      head: ['<input type="checkbox" data-all>', '活动ID', '标题', '移动端图标', 'PC端图标', '类型', '选择标签', '排序', '状态', '悬浮开关', '操作'],
      rows: function (d, q) {
        return (d.activities || []).filter(function (a) {
          if (q.type && a.type !== q.type) return false;
          if (q.status !== '' && q.status != null && String(a.status) !== String(q.status)) return false;
          if (q.float !== '' && q.float != null) {
            if (a.floatOn == null || String(a.floatOn) !== String(q.float)) return false;
          }
          var day = String(a.createdAt || '').slice(0, 10);
          if (q.create_timeFrom && day && day < q.create_timeFrom) return false;
          if (q.create_timeTo && day && day > q.create_timeTo) return false;
          return true;
        }).sort(function (a, b) { return (b.sort || 0) - (a.sort || 0); });
      },
      rowHtml: function (a) {
        var tag = a.tag ? '<span class="tag">' + U.escapeHtml(a.tag) + '</span>' : '--';
        var fl = a.floatOn == null ? '<span class="muted">--</span>' : U.switchBtn(a.floatOn === 1, 'fl-' + a.id);
        return '<tr><td><input type="checkbox" data-id="' + a.id + '"></td><td>' + U.escapeHtml(String(a.id)) +
          '</td><td class="td-title">' + U.escapeHtml(a.title) + '</td><td>' + actIconHtml(a, 'h5') +
          '</td><td>' + actIconHtml(a, 'pc') + '</td><td>' + typeLabel(a.type) + '</td><td>' + tag +
          '</td><td>' + actSortHtml(a) + '</td><td>' + U.switchBtn(a.status === 1, 'st-' + a.id) +
          '</td><td>' + fl + '</td><td><button class="op-link" data-ed="' + a.id + '">编辑</button>' +
          '<button class="op-link danger" data-rm="' + a.id + '">删除</button></td></tr>';
      },
      bind: function (root, d, redraw) {
        function form(row) {
          var tags = (S.load().activityTags || []);
          var defaultTag = row ? row.tag : (tags.filter(function (t) { return t.name === 'New'; })[0] ? 'New' : '');
          var typeOpts = '<option value="">请选择活动类型</option>' + S.ACT_TYPES.map(function (t) {
            return '<option value="' + t.id + '"' + (row && row.type === t.id ? ' selected' : '') + '>' + t.label + '</option>';
          }).join('');

          function bindTypeBox() {
            var box = document.getElementById('aTypeBox');
            var typeEl = document.getElementById('aType');
            var head = document.getElementById('aHeadExtra');
            if (!box || !typeEl) return;
            var type = typeEl.value;
            var src = row && row.type === type ? row : null;
            box.classList.toggle('has-type', !!type);
            if (head) {
              if (type === 'weekLoss' || type === 'dayLoss' || type === 'rain' || type === 'turntable' || type === 'lottery') {
                var headCfg = (src && src.cfg) ? src.cfg : (
                  type === 'dayLoss' ? (S.defaultDayLossCfg ? S.defaultDayLossCfg() : {}) :
                  type === 'rain' ? (S.defaultRainCfg ? S.defaultRainCfg() : {}) :
                  type === 'turntable' ? (S.defaultTurntableCfg ? S.defaultTurntableCfg() : {}) :
                  type === 'lottery' ? (S.defaultLotteryCfg ? S.defaultLotteryCfg() : {}) :
                  (S.defaultWeekLossCfg ? S.defaultWeekLossCfg() : {})
                );
                head.innerHTML = weekLossHeadHtml(headCfg);
                $$ (head, '[data-up]').forEach(function (el) {
                  el.onclick = function () { el.classList.toggle('done'); };
                });
              } else head.innerHTML = '';
            }
            box.innerHTML = type ? actTypeFieldsHtml(type, src) : '<div class="act-type-empty">请选择活动类型</div>';
            bindActCfg(box);
            var titleInp = document.getElementById('aTitle');
            var countInp = document.getElementById('aTitleCount');
            if (titleInp) {
              titleInp.maxLength = type === 'lottery' ? 200 : 100;
              if (countInp) countInp.textContent = String(titleInp.value.length) + '/' + titleInp.maxLength;
            }
          }

          U.openDrawer('编辑活动',
            '<div class="act-form-page">' +
            '<div class="act-card">' +
            arcoFields([
              {
                id: 'aTitle', label: '活动标题', req: true,
                html: '<div class="input-count"><input id="aTitle" type="text" maxlength="100" placeholder="请输入活动标题" value="' +
                  U.escapeHtml(row ? row.title : '') + '"><span id="aTitleCount">0/100</span></div>'
              },
              { id: 'aType', label: '活动类型', req: true, html: '<select id="aType">' + typeOpts + '</select>' },
              { id: 'aTag', label: '选择标签', req: true, html: '<select id="aTag">' + actTagOpts(tags, defaultTag) + '</select>' }
            ]) +
            '<div id="aHeadExtra"></div></div>' +
            '<div class="act-card act-type-box" id="aTypeBox"></div></div>',
            function () {
              var title = document.getElementById('aTitle').value.trim();
              var type = document.getElementById('aType').value;
              var tag = document.getElementById('aTag').value;
              if (!title) { U.toast('请输入活动标题', 'err'); return; }
              if (!type) { U.toast('请选择活动类型', 'err'); return; }
              if (!tag) { U.toast('请选择标签', 'err'); return; }
              var cfg = readActCfg(type);
              var cfgErr = validActCfg(type, cfg);
              if (cfgErr) { U.toast(cfgErr, 'err'); return; }
              var data = S.load();
              var payload = {
                title: title,
                type: type,
                tag: tag,
                cfg: cfg,
                sort: row && row.sort != null ? row.sort : 1000,
                startAt: (type === 'lottery' && cfg.startAt) ? cfg.startAt : ((row && row.startAt) || ''),
                endAt: (row && row.endAt) || ''
              };
              if (row) {
                var a = data.activities.filter(function (x) { return x.id === row.id; })[0];
                if (!a) { U.toast('活动不存在', 'err'); return; }
                Object.keys(payload).forEach(function (k) { a[k] = payload[k]; });
                if (S.ACT_NO_FLOAT[type]) a.floatOn = null;
                else if (a.floatOn == null) a.floatOn = 0;
              } else {
                data.activities.unshift({
                  id: nextActId(data.activities),
                  status: 0,
                  floatOn: actFloatDefault(type),
                  createdAt: S.now(),
                  title: payload.title,
                  type: payload.type,
                  tag: payload.tag,
                  cfg: payload.cfg,
                  sort: payload.sort,
                  startAt: payload.startAt,
                  endAt: payload.endAt
                });
              }
              S.save(data);
              U.closeDrawer();
              U.toast('已保存（演示，不改正式数据）');
              redraw();
            },
            { wide: true, okText: '确认', cls: 'act-form' }
          );

          var titleEl = document.getElementById('aTitle');
          var countEl = document.getElementById('aTitleCount');
          function syncCount() {
            if (countEl && titleEl) countEl.textContent = String(titleEl.value.length) + '/' + (titleEl.maxLength || 100);
          }
          if (titleEl) titleEl.addEventListener('input', syncCount);
          syncCount();
          var typeEl = document.getElementById('aType');
          if (typeEl) typeEl.onchange = bindTypeBox;
          bindTypeBox();
        }

        function openTags() {
          var data0 = S.load();
          var draft = S.clone(data0.activityTags || []);
          var editing = '';
          var seq = 0;

          function commitEdit(id, name) {
            var t = draft.filter(function (x) { return x.id === id; })[0];
            if (!t) { editing = ''; return ''; }
            name = String(name || '').trim();
            if (!name) return '请输入标签名称';
            var dup = draft.filter(function (x) { return x.id !== id && x.name === name; })[0];
            if (dup) return '标签名称已存在';
            t.name = name;
            editing = '';
            return '';
          }

          function beginEdit(id) {
            if (editing && editing !== id) {
              var inp = document.querySelector('[data-tag-input]');
              var err = commitEdit(editing, inp ? inp.value : '');
              if (err) { U.toast(err, 'err'); return; }
            }
            editing = id;
            paint();
            var next = document.querySelector('[data-tag-input]');
            if (next) { next.focus(); next.select(); }
          }

          function paint() {
            var body = document.getElementById('drawerBody');
            if (!body) return;
            var chips = draft.map(function (t) {
              if (editing === t.id) {
                return '<label class="tag-pill edit"><input data-tag-input="' + t.id + '" maxlength="20" value="' +
                  U.escapeHtml(t.name) + '" placeholder="请输入标签名称"></label>';
              }
              return '<span class="tag-pill"><button type="button" class="tag-pill-name" data-tag-ed="' + t.id + '">' +
                U.escapeHtml(t.name || '未命名') + '</button>' +
                '<button type="button" class="tag-pill-x" data-tag-rm="' + t.id + '" aria-label="删除">×</button></span>';
            }).join('');
            body.innerHTML = '<div class="tag-mgr"><div class="tag-grid">' + chips + '</div>' +
              '<button type="button" class="tag-add" id="tagAdd">+ 新增</button></div>';
            var add = document.getElementById('tagAdd');
            if (add) add.onclick = function () {
              if (editing) {
                var inp = document.querySelector('[data-tag-input]');
                var err = commitEdit(editing, inp ? inp.value : '');
                if (err) { U.toast(err, 'err'); return; }
              }
              seq += 1;
              var id = 'tg-new-' + seq;
              draft.push({ id: id, name: '' });
              beginEdit(id);
            };
            $$ (body, '[data-tag-ed]').forEach(function (b) {
              b.onclick = function () { beginEdit(b.getAttribute('data-tag-ed')); };
            });
            $$ (body, '[data-tag-rm]').forEach(function (b) {
              b.onclick = function () {
                var id = b.getAttribute('data-tag-rm');
                draft = draft.filter(function (t) { return t.id !== id; });
                if (editing === id) editing = '';
                paint();
              };
            });
            $$ (body, '[data-tag-input]').forEach(function (inp) {
              inp.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  var err = commitEdit(inp.getAttribute('data-tag-input'), inp.value);
                  if (err) { U.toast(err, 'err'); return; }
                  paint();
                }
              });
            });
          }

          U.openDrawer('新增/管理', '<div></div>', function () {
            if (editing) {
              var inp = document.querySelector('[data-tag-input]');
              var err = commitEdit(editing, inp ? inp.value : '');
              if (err) { U.toast(err, 'err'); return; }
            }
            for (var i = 0; i < draft.length; i++) {
              if (!String(draft[i].name || '').trim()) { U.toast('请输入标签名称', 'err'); return; }
            }
            var names = {};
            for (var j = 0; j < draft.length; j++) {
              if (names[draft[j].name]) { U.toast('标签名称已存在', 'err'); return; }
              names[draft[j].name] = 1;
            }
            var cur = S.load();
            var oldById = {};
            (cur.activityTags || []).forEach(function (t) { oldById[t.id] = t.name; });
            var kept = {};
            draft.forEach(function (t) {
              if (String(t.id).indexOf('tg-new-') === 0) t.id = S.nextId('TG', cur);
              kept[t.id] = t.name;
            });
            (cur.activities || []).forEach(function (a) {
              var hit = (cur.activityTags || []).filter(function (t) { return t.name === a.tag; })[0];
              if (hit && kept[hit.id]) a.tag = kept[hit.id];
              else if (hit && !kept[hit.id]) a.tag = '';
            });
            cur.activityTags = draft;
            S.save(cur);
            U.closeDrawer();
            U.toast('已保存（演示，不改正式数据）');
            redraw();
          }, { mode: 'modal', cls: 'tag-modal' });
          paint();
        }

        var add = root.querySelector('[data-add]');
        if (add) add.onclick = function () { form(null); };
        var tagsBtn = root.querySelector('[data-tags]');
        if (tagsBtn) tagsBtn.onclick = openTags;
        var syncBtn = root.querySelector('[data-sync-center]');
        if (syncBtn) {
          syncBtn.onclick = function () {
            if (syncBtn.disabled) return;
            U.confirm('确认同步活动中心配置？').then(function (ok) {
              if (!ok) return;
              var cur = S.load();
              if (cur.demo && cur.demo.failApi) {
                U.toast('同步失败，请重试', 'err');
                return;
              }
              syncBtn.disabled = true;
              syncBtn.textContent = '同步中…';
              setTimeout(function () {
                var data = S.load();
                if (data.demo && data.demo.failApi) {
                  syncBtn.disabled = false;
                  syncBtn.textContent = '同步';
                  U.toast('同步失败，请重试', 'err');
                  return;
                }
                var list = data.activities || [];
                data.activityCenter = {
                  syncedAt: S.now(),
                  operator: (S.getSession() || {}).name || 'admin',
                  count: list.length,
                  items: S.clone(list)
                };
                S.save(data);
                syncBtn.disabled = false;
                syncBtn.textContent = '同步';
                U.toast('已同步活动中心配置');
              }, 480);
            });
          };
        }
        $$ (root, '[data-ed]').forEach(function (b) {
          b.onclick = function () { form(d.activities.filter(function (a) { return a.id === b.getAttribute('data-ed'); })[0]); };
        });
        $$ (root, '[data-rm]').forEach(function (b) {
          b.onclick = function () {
            var id = b.getAttribute('data-rm');
            U.confirm('确认删除该条记录？演示环境不改正式数据。').then(function (ok) {
              if (!ok) return;
              var data = S.load();
              data.activities = data.activities.filter(function (a) { return a.id !== id; });
              S.save(data);
              U.toast('已删除（演示，不改正式数据）');
              redraw();
            });
          };
        });
        $$ (root, '[data-sort]').forEach(function (b) {
          b.onclick = function () {
            var id = b.getAttribute('data-sort');
            var delta = Number(b.getAttribute('data-d')) || 0;
            var data = S.load();
            var a = data.activities.filter(function (x) { return x.id === id; })[0];
            if (!a) return;
            a.sort = Math.max(0, (Number(a.sort) || 0) + delta);
            S.save(data);
            redraw();
          };
        });
        $$ (root, '[data-sw]').forEach(function (b) {
          b.onclick = function () {
            var key = b.getAttribute('data-sw');
            var data = S.load();
            var a = data.activities.filter(function (x) { return x.id === key.slice(3); })[0];
            if (!a) return;
            if (key.indexOf('st-') === 0) a.status = a.status === 1 ? 0 : 1;
            else if (a.floatOn != null) a.floatOn = a.floatOn === 1 ? 0 : 1;
            S.save(data);
            redraw();
          };
        });
        var del = root.querySelector('[data-del]');
        if (del) del.onclick = function () {
          var ids = $$ (root, 'tbody [data-id]:checked').map(function (c) { return c.getAttribute('data-id'); });
          if (!ids.length) { U.toast('请先勾选数据', 'err'); return; }
          U.confirm('确定删除所选活动？演示环境不改正式数据。').then(function (ok) {
            if (!ok) return;
            var data = S.load();
            data.activities = data.activities.filter(function (a) { return ids.indexOf(a.id) < 0; });
            S.save(data);
            U.toast('已删除（演示，不改正式数据）');
            redraw();
          });
        };
        var all = root.querySelector('[data-all]');
        if (all) all.onclick = function () { $$ (root, 'tbody [data-id]').forEach(function (c) { c.checked = all.checked; }); };
      }
    });
  };

  var CODE_STATUS = { 1: '进行中', 2: '已关闭', 3: '已结束', 4: '已过期' };

  function toLocalDT(s) { return String(s || '').replace(' ', 'T'); }
  function fromLocalDT(s) { return String(s || '').replace('T', ' '); }
  function randCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var out = '';
    for (var i = 0; i < 8; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return out;
  }
  function emptyRules() {
    return {
      receive_day_money: { money: '', status: 0 },
      total_recharge: { money: '', status: 0 },
      bet_money: { money: '', status: 0, game_types: [] },
      maximum_users_per_IP: { num: '', status: 0 }
    };
  }

  function codeFormHtml(row) {
    var r = row || {};
    var rules = r.effective_user_rules || emptyRules();
    var type = r.type || 2;
    var numMode = r.num === -1 || r.num == null ? -1 : 2;
    var types = S.DAILY_GAME_TYPES || [];
    var picked = (rules.bet_money && rules.bet_money.game_types) || [];
    var gameOpts = '<option value="">全部</option>' + types.map(function (t) {
      return '<option value="' + t.id + '"' + (picked.indexOf(String(t.id)) >= 0 ? ' selected' : '') + '>' + U.escapeHtml(t.name) + '</option>';
    }).join('');
    return arcoFields([
      { id: 'cdEnd', label: '兑换截止时间', req: true, html: '<input type="datetime-local" step="1" id="cdEnd" value="' + U.escapeHtml(toLocalDT(r.end_time || '')) + '">' },
      {
        id: 'cdType', label: '奖励类型', req: true,
        html: '<div class="radio-line">' +
          '<label><input type="radio" name="cdType" value="1"' + (type === 1 ? ' checked' : '') + '> 彩金</label>' +
          '<label><input type="radio" name="cdType" value="2"' + (type !== 1 ? ' checked' : '') + '> 真金</label></div>'
      },
      {
        id: 'cdCode', label: '兑换码', req: true,
        html: '<div class="inline-row"><input type="text" id="cdCode" maxlength="32" value="' + U.escapeHtml(r.redemption_code || '') + '" placeholder="请输入兑换码">' +
          '<button class="rand-btn" type="button" id="cdRand">随机</button></div>' +
          '<div class="cd-hint">生成后不可再更改，请谨慎设置</div>'
      },
      {
        id: 'cdNum', label: '兑换数量', req: true,
        html: '<div class="radio-line">' +
          '<label><input type="radio" name="cdNumMode" value="-1"' + (numMode === -1 ? ' checked' : '') + '> 不限</label>' +
          '<label><input type="radio" name="cdNumMode" value="2"' + (numMode === 2 ? ' checked' : '') + '> 自设</label></div>' +
          '<input type="number" id="cdNum" min="1" placeholder="请输入兑换数量" value="' + (numMode === 2 ? r.num : '') + '"' + (numMode === -1 ? ' disabled' : '') + ' style="margin-top:8px;width:180px">'
      },
      {
        id: 'cdMin', label: '金额范围', req: true,
        html: '<div class="range-pair"><input type="number" id="cdMin" min="0" step="0.01" value="' + (r.min == null ? '' : r.min) + '" placeholder="最小">' +
          '<span>~</span><input type="number" id="cdMax" min="0" step="0.01" value="' + (r.max == null ? '' : r.max) + '" placeholder="最大"></div>'
      },
      {
        id: 'cdFlow', label: '流水倍数', req: true,
        html: '<div class="inline-row"><div class="num-step"><button type="button" data-step="-">−</button>' +
          '<input type="number" id="cdFlow" min="0" step="1" value="' + (r.flow_multiple == null ? 0 : r.flow_multiple) + '">' +
          '<button type="button" data-step="+">+</button></div>' +
          '<span class="help-dot" title="活动领取奖金打码量倍数，设置为0时不限流水">?</span></div>'
      },
      {
        id: 'cdDays', label: '彩金任务有效时间(天)',
        html: '<input type="number" id="cdDays" min="0" value="' + (r.valid_days == null ? 0 : r.valid_days) + '"' + (type === 1 ? '' : ' disabled') + '>' +
          '<div class="cd-sub">(此时间只在奖励类型为「彩金」时，方可设置)</div>'
      },
      {
        id: 'cdRules', label: '有效用户判定',
        html: '<span class="help-dot" title="请至少勾选一项有效用户判定">?</span>' +
          '<div class="rule-box">' +
          '<label class="rule-row"><input type="checkbox" id="cdR1"' + (rules.receive_day_money && rules.receive_day_money.status === 1 ? ' checked' : '') + '> 领取当天存款 &gt;= ' +
          '<input type="number" id="cdR1v" min="0" step="0.01" placeholder="请输入金额" value="' + U.escapeHtml((rules.receive_day_money && rules.receive_day_money.money) || '') + '"></label>' +
          '<label class="rule-row"><input type="checkbox" id="cdR2"' + (rules.total_recharge && rules.total_recharge.status === 1 ? ' checked' : '') + '> 累计充值金额 &gt;= ' +
          '<input type="number" id="cdR2v" min="0" step="0.01" placeholder="请输入金额" value="' + U.escapeHtml((rules.total_recharge && rules.total_recharge.money) || '') + '"></label>' +
          '<label class="rule-row"><input type="checkbox" id="cdR3"' + (rules.bet_money && rules.bet_money.status === 1 ? ' checked' : '') + '> 领取当天在 ' +
          '<select id="cdR3g">' + gameOpts + '</select> 游戏分类下,</label>' +
          '<div class="rule-row rule-indent">流水（真金）&gt;= <input type="number" id="cdR3v" min="0" step="0.01" placeholder="请输入金额" value="' + U.escapeHtml((rules.bet_money && rules.bet_money.money) || '') + '"></div>' +
          '<label class="rule-row"><input type="checkbox" id="cdR4"' + (rules.maximum_users_per_IP && rules.maximum_users_per_IP.status === 1 ? ' checked' : '') + '> 同IP有效用户上限 ' +
          '<input type="number" id="cdR4v" min="1" placeholder="请输入数量" value="' + U.escapeHtml((rules.maximum_users_per_IP && rules.maximum_users_per_IP.num) || '') + '"></label>' +
          '</div>'
      }
    ]);
  }

  function bindCodeForm() {
    function sync() {
      var type = (document.querySelector('input[name="cdType"]:checked') || {}).value;
      var days = document.getElementById('cdDays');
      if (days) days.disabled = type !== '1';
      var mode = (document.querySelector('input[name="cdNumMode"]:checked') || {}).value;
      var num = document.getElementById('cdNum');
      if (num) num.disabled = mode !== '2';
    }
    $$ (document.getElementById('drawerBody'), 'input[name="cdType"], input[name="cdNumMode"]').forEach(function (el) {
      el.onchange = sync;
    });
    var rand = document.getElementById('cdRand');
    if (rand) rand.onclick = function () { document.getElementById('cdCode').value = randCode(); };
    $$ (document.getElementById('drawerBody'), '[data-step]').forEach(function (b) {
      b.onclick = function () {
        var inp = document.getElementById('cdFlow');
        var n = Number(inp.value || 0);
        inp.value = String(Math.max(0, n + (b.getAttribute('data-step') === '+' ? 1 : -1)));
      };
    });
    sync();
  }

  function readCodeForm() {
    var type = Number((document.querySelector('input[name="cdType"]:checked') || {}).value || 2);
    var mode = (document.querySelector('input[name="cdNumMode"]:checked') || {}).value;
    var g = document.getElementById('cdR3g');
    return {
      end_time: fromLocalDT(document.getElementById('cdEnd').value),
      type: type,
      redemption_code: (document.getElementById('cdCode').value || '').trim().toUpperCase(),
      num: mode === '2' ? Number(document.getElementById('cdNum').value) : -1,
      min: document.getElementById('cdMin').value,
      max: document.getElementById('cdMax').value,
      flow_multiple: Number(document.getElementById('cdFlow').value || 0),
      valid_days: type === 1 ? Number(document.getElementById('cdDays').value || 0) : 0,
      effective_user_rules: {
        receive_day_money: { status: document.getElementById('cdR1').checked ? 1 : 0, money: document.getElementById('cdR1v').value },
        total_recharge: { status: document.getElementById('cdR2').checked ? 1 : 0, money: document.getElementById('cdR2v').value },
        bet_money: {
          status: document.getElementById('cdR3').checked ? 1 : 0,
          money: document.getElementById('cdR3v').value,
          game_types: g && g.value ? [g.value] : []
        },
        maximum_users_per_IP: { status: document.getElementById('cdR4').checked ? 1 : 0, num: document.getElementById('cdR4v').value }
      }
    };
  }

  function validCodeForm(v) {
    if (!v.end_time) return '兑换截止时间不能为空';
    if (!v.redemption_code) return '兑换码不能为空';
    if (!/^[A-Z0-9]{4,32}$/.test(v.redemption_code)) return '兑换码仅支持 4～32 位字母或数字';
    if (v.num !== -1 && (!(v.num >= 1))) return '请输入兑换数量';
    var min = Number(v.min), max = Number(v.max);
    if (v.min === '' || v.max === '' || isNaN(min) || isNaN(max)) return '金额范围不能为空';
    if (min > max) return '金额范围最小值不能大于最大值';
    if (v.flow_multiple < 0 || v.flow_multiple === '' || isNaN(v.flow_multiple)) return '流水倍数不能为空';
    var ru = v.effective_user_rules;
    if (!ru.receive_day_money.status && !ru.total_recharge.status && !ru.bet_money.status && !ru.maximum_users_per_IP.status) {
      return '请至少勾选一项有效用户判定';
    }
    if (ru.receive_day_money.status && ru.receive_day_money.money === '') return '请输入领取当天存款金额';
    if (ru.total_recharge.status && ru.total_recharge.money === '') return '请输入累计充值金额';
    if (ru.bet_money.status && ru.bet_money.money === '') return '请输入流水（真金）';
    if (ru.maximum_users_per_IP.status && !Number(ru.maximum_users_per_IP.num)) return '请输入同IP有效用户上限';
    return '';
  }

  Pages.codes = function (root) {
    var state = { page: 1, size: 20, q: { dateFrom: '2026-08-10', dateTo: '2026-08-16', type: '', redemption_code: '', status: '' } };

    function persist(patch) {
      var d = S.load();
      Object.keys(patch).forEach(function (k) { d[k] = patch[k]; });
      S.save(d);
    }

    function openForm(row) {
      U.openDrawer(row ? '编辑兑换码' : '新增兑换码', codeFormHtml(row), function () {
        var vals = readCodeForm();
        var err = validCodeForm(vals);
        if (err) { U.toast(err, 'err'); return; }
        var d = S.load();
        var list = d.codes || [];
        var dup = list.filter(function (x) {
          return x.redemption_code === vals.redemption_code && (!row || Number(x.id) !== Number(row.id));
        })[0];
        if (dup) { U.toast('兑换码已存在，请重新设置', 'err'); return; }
        vals.min = Number(vals.min);
        vals.max = Number(vals.max);
        if (row) {
          var cur = list.filter(function (x) { return Number(x.id) === Number(row.id); })[0];
          if (cur) {
            Object.keys(vals).forEach(function (k) { cur[k] = vals[k]; });
          }
        } else {
          vals.id = 60000 + (list.length + 12);
          vals.create_time = S.now();
          vals.status = 2;
          vals.remarks = '';
          vals.user_num = 0;
          vals.money = 0;
          list.unshift(vals);
        }
        persist({ codes: list });
        U.closeDrawer();
        U.toast('已保存（演示，不改正式数据）');
        draw();
      }, { mode: 'modal', wide: true });
      bindCodeForm();
    }

    function openLimit() {
      var d = S.load();
      var lim = JSON.parse(JSON.stringify(d.codeLimit && d.codeLimit.groups
        ? d.codeLimit
        : { once: 1, groups: [{ codes: '' }] }));
      function paint() {
        var box = document.getElementById('clBody');
        if (!box) return;
        box.innerHTML = (lim.groups || []).map(function (g, i) {
          return '<tr><td>' + (i + 1) + '</td><td><input data-cg="' + i + '" type="text" placeholder="多个兑换码用英文逗号分隔" value="' +
            U.escapeHtml(g.codes || '') + '"></td><td><button class="op-link danger" type="button" data-cg-del="' + i + '" title="删除">' +
            ico('trash') + '</button></td></tr>';
        }).join('') || '<tr><td class="empty" colspan="3">暂无分组，请新增</td></tr>';
        $$ (box, '[data-cg]').forEach(function (el) {
          el.oninput = function () { lim.groups[Number(el.getAttribute('data-cg'))].codes = el.value; };
        });
        $$ (box, '[data-cg-del]').forEach(function (b) {
          b.onclick = function () {
            lim.groups.splice(Number(b.getAttribute('data-cg-del')), 1);
            paint();
          };
        });
      }
      U.openDrawer('兑换限制设置',
        '<div class="cd-entry"><span>兑换限制</span>' + U.switchBtn(!!lim.once, 'clOnce') + '</div>' +
        '<p class="cd-sub" style="margin:0 0 12px">同一分组下的兑换码，限制用户只能兑换一次</p>' +
        '<table class="lim-table"><thead><tr><th>分组</th><th class="req">兑换码（多个兑换码用英文逗号分隔）</th><th>操作</th></tr></thead>' +
        '<tbody id="clBody"></tbody></table>' +
        '<button class="btn btn-black" type="button" id="clAdd" style="margin-top:10px">新增分组</button>',
        function () {
          var once = document.querySelector('#drawerBody [data-sw="clOnce"]') &&
            document.querySelector('#drawerBody [data-sw="clOnce"]').classList.contains('on') ? 1 : 0;
          var groups = (lim.groups || []).map(function (g) { return { codes: (g.codes || '').trim() }; });
          if (once) {
            if (!groups.length) { U.toast('请至少新增一个分组', 'err'); return; }
            var seen = {};
            for (var i = 0; i < groups.length; i++) {
              var arr = groups[i].codes.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
              if (arr.length < 2) { U.toast('第 ' + (i + 1) + ' 组至少填写 2 个兑换码', 'err'); return; }
              for (var j = 0; j < arr.length; j++) {
                if (seen[arr[j]]) { U.toast('兑换码 ' + arr[j] + ' 重复，请检查', 'err'); return; }
                seen[arr[j]] = 1;
              }
            }
          }
          persist({ codeLimit: { once: once, groups: groups } });
          U.closeDrawer();
          U.toast('已提交兑换限制（演示，不改正式数据）');
        },
        { mode: 'modal', wide: true, okText: '提交' }
      );
      paint();
      var add = document.getElementById('clAdd');
      if (add) add.onclick = function () { lim.groups.push({ codes: '' }); paint(); };
      var sw = document.querySelector('#drawerBody [data-sw="clOnce"]');
      if (sw) sw.onclick = function () {
        lim.once = sw.classList.contains('on') ? 0 : 1;
        sw.classList.toggle('on', !!lim.once);
      };
    }

    function draw() {
      delayed(function (err) {
        if (err) {
          root.innerHTML = pageShell('兑换码配置', failBlock());
          var btn = root.querySelector('[data-retry]');
          if (btn) btn.onclick = draw;
          return;
        }
        var d = S.load();
        var entry = d.codeEntry == null ? 1 : Number(d.codeEntry);
        var rows = (d.demo.empty ? [] : (d.codes || [])).filter(function (r) {
          var day = String(r.create_time || '').slice(0, 10);
          if (state.q.dateFrom && day < state.q.dateFrom) return false;
          if (state.q.dateTo && day > state.q.dateTo) return false;
          if (state.q.type && String(r.type) !== String(state.q.type)) return false;
          if (state.q.redemption_code && String(r.redemption_code).indexOf(state.q.redemption_code.toUpperCase()) < 0) return false;
          if (state.q.status && String(r.status) !== String(state.q.status)) return false;
          return true;
        });
        var pageRows = U.slicePage(rows, state);
        var body = pageRows.length ? pageRows.map(function (r) {
          var ops = '';
          if ([1, 2, 3].indexOf(Number(r.status)) >= 0) {
            ops += '<button class="op-link" type="button" data-ed="' + r.id + '">编辑</button>';
          }
          if (Number(r.status) === 2) ops += '<button class="op-link ok" type="button" data-on="' + r.id + '">开启</button>';
          if (Number(r.status) === 1) ops += '<button class="op-link danger" type="button" data-off="' + r.id + '">关闭</button>';
          return '<tr><td>' + r.id + '</td><td>' + U.escapeHtml(r.create_time) + '</td><td>' + U.escapeHtml(r.end_time) +
            '</td><td>' + (Number(r.type) === 1 ? '彩金' : '真金') + '</td><td>' + U.escapeHtml(r.redemption_code) +
            '</td><td>' + (Number(r.num) === -1 ? '<span class="cd-unlimited">不限</span>' : r.num) +
            '</td><td>' + r.min + ' - ' + r.max + '</td><td class="col-ops sticky-r">' + ops + '</td></tr>';
        }).join('') : emptyRow(8);
        root.innerHTML = pageShell('兑换码配置',
          '<div class="cd-page">' +
          '<div class="cd-entry"><span>兑换码入口</span>' + U.switchBtn(entry === 1, 'entry') + '</div>' +
          '<div class="cd-filter">' +
          '<label class="fg fg-wide"><span>创建时间</span><div class="date-range">' +
          '<input type="date" data-f="dateFrom"><span class="dash">-</span><input type="date" data-f="dateTo"></div></label>' +
          '<label class="fg"><span>奖励类型</span><select data-f="type"><option value="">全部</option>' +
          '<option value="1">彩金</option><option value="2">真金</option></select></label>' +
          '<label class="fg"><span>兑换码</span><input type="text" data-f="redemption_code" placeholder="模糊搜索"></label>' +
          '<label class="fg"><span>状态</span><select data-f="status"><option value="">全部</option>' +
          '<option value="1">进行中</option><option value="2">已关闭</option><option value="3">已结束</option><option value="4">已过期</option></select></label>' +
          '</div>' +
          '<div class="filter-actions"><button class="btn btn-primary" type="button" data-search>' + ico('search') + '搜索</button>' +
          '<button class="btn btn-secondary" type="button" data-reset>' + ico('trash') + '重置</button></div>' +
          '<div class="table-bar"><div class="toolbar-left">' +
          '<button class="btn btn-black" type="button" data-add>' + ico('plus') + '新增</button>' +
          '<button class="btn btn-black" type="button" data-limit>兑换限制设置</button></div>' +
          '<div class="table-tools"><button type="button" data-tool="refresh" title="刷新">' + ico('refresh') + '</button>' +
          '<button type="button" data-tool="search" title="搜索">' + ico('search') + '</button>' +
          '<button type="button" data-tool="print" title="打印">' + ico('print') + '</button>' +
          '<button type="button" data-tool="cols" title="列设置">' + ico('gear') + '</button></div></div>' +
          tableWrap(['系统编号', '创建时间', '兑换截止时间', '奖励类型', '兑换码', '数量限制', '金额范围', '操作'], body, 1100) +
          U.pagerHtml(state.page, state.size, rows.length) +
          '</div>'
        );
        setFilters(root, state.q);
        var search = root.querySelector('[data-search]');
        if (search) search.onclick = function () { state.q = readFilters(root); state.page = 1; draw(); };
        var reset = root.querySelector('[data-reset]');
        if (reset) reset.onclick = function () {
          state.q = { dateFrom: '2026-08-10', dateTo: '2026-08-16', type: '', redemption_code: '', status: '' };
          state.page = 1; draw();
        };
        var sw = root.querySelector('[data-sw="entry"]');
        if (sw) sw.onclick = function () {
          var next = entry === 1 ? 2 : 1;
          persist({ codeEntry: next });
          U.toast(next === 1 ? '已开启兑换码入口（演示）' : '已关闭兑换码入口（演示）');
          draw();
        };
        var add = root.querySelector('[data-add]');
        if (add) add.onclick = function () { openForm(null); };
        var limit = root.querySelector('[data-limit]');
        if (limit) limit.onclick = openLimit;
        $$ (root, '[data-ed]').forEach(function (b) {
          b.onclick = function () {
            var row = (S.load().codes || []).filter(function (x) { return String(x.id) === b.getAttribute('data-ed'); })[0];
            if (row) openForm(row);
          };
        });
        $$ (root, '[data-on]').forEach(function (b) {
          b.onclick = function () {
            U.confirm('确认开启该兑换码？').then(function (ok) {
              if (!ok) return;
              var list = S.load().codes || [];
              var cur = list.filter(function (x) { return String(x.id) === b.getAttribute('data-on'); })[0];
              if (cur) cur.status = 1;
              persist({ codes: list });
              U.toast('状态已变更（演示，不改正式数据）');
              draw();
            });
          };
        });
        $$ (root, '[data-off]').forEach(function (b) {
          b.onclick = function () {
            U.confirm('确认关闭该兑换码？').then(function (ok) {
              if (!ok) return;
              var list = S.load().codes || [];
              var cur = list.filter(function (x) { return String(x.id) === b.getAttribute('data-off'); })[0];
              if (cur) cur.status = 2;
              persist({ codes: list });
              U.toast('状态已变更（演示，不改正式数据）');
              draw();
            });
          };
        });
        $$ (root, '[data-tool]').forEach(function (b) {
          b.onclick = function () {
            var t = b.getAttribute('data-tool');
            if (t === 'refresh') draw();
            else if (t === 'search') { var inp = root.querySelector('[data-f="redemption_code"]'); if (inp) inp.focus(); }
            else U.toast('演示环境不调用正式打印 / 列设置');
          };
        });
        U.bindPager(root, state, draw);
      });
    }
    draw();
  };

  Pages.qrph = function (root) {
    var s = S.load().qrph;
    root.innerHTML = pageShell('QRPH 真金返利',
      '<form class="filter-card" id="qf" style="max-width:520px">' +
      '<div class="field"><label><input type="checkbox" id="qOn"' + (s.enabled ? ' checked' : '') + '> 活动开启</label></div>' +
      '<div class="field"><label>返利比例 %</label><input id="qRate" type="number" step="0.1" value="' + s.rate + '"></div>' +
      '<div class="field"><label>最低充值金额（₱）</label><input id="qMin" type="number" value="' + s.minDeposit + '"></div>' +
      '<div class="field"><label>单笔返利封顶（₱，空=不封顶）</label><input id="qMax" value="' + (s.maxRebate === '' || s.maxRebate == null ? '' : s.maxRebate) + '"></div>' +
      '<div class="field"><label>打码倍数</label><input id="qTurn" type="number" step="0.1" value="' + s.turnover + '"></div>' +
      '<p class="hint">仅 QRPH 成功充值发放；入真金钱包；流水 = 倍数 × (本金 + 返利)。完整前台演示在 qq-qrph-rebate-prototype。</p>' +
      '<button class="btn btn-black" type="submit">保存</button></form>'
    );
    document.getElementById('qf').onsubmit = function (e) {
      e.preventDefault();
      var data = S.load();
      data.qrph.enabled = document.getElementById('qOn').checked;
      data.qrph.rate = Number(document.getElementById('qRate').value);
      data.qrph.minDeposit = Number(document.getElementById('qMin').value);
      var cap = document.getElementById('qMax').value.trim();
      data.qrph.maxRebate = cap === '' ? '' : Number(cap);
      data.qrph.turnover = Number(document.getElementById('qTurn').value);
      S.save(data);
      U.toast('已保存 QRPH 返利配置');
    };
  };

  function reportPage(title, tip, head, rowsFn, rowFn) {
    return function (root) {
      mountList(root, {
        title: title,
        tip: tip,
        filters: [{ key: 'kw', label: '会员账号', placeholder: '会员账号' }],
        extraBtn: '<button class="btn btn-ghost" type="button" data-export>导出</button>',
        head: head,
        rows: function (d, q) {
          return rowsFn(d).filter(function (r) { return !q.kw || String(r.account || r.title || '').indexOf(q.kw) >= 0; });
        },
        rowHtml: rowFn,
        bind: function (root) {
          var ex = root.querySelector('[data-export]');
          if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示）'); };
        }
      });
    };
  }

  Pages.tasks = reportPage('抽奖活动任务列表', '看会员在本期内完成了哪条任选任务 / 分享任务，是否已拿到抽奖资格。数据按活动循环周期切片。',
    ['会员账号', 'VIP', '当前期', '已完成任务', '有效流水', '本期排名', '抽奖资格', '已抽次数'],
    function (d) { return d.tasks; },
    function (r) { return '<tr><td>' + r.account + '</td><td>' + r.vip + '</td><td>' + r.period + '</td><td>' + r.done + '</td><td class="amt-right">' + S.money(r.valid) + '</td><td>' + r.rank + '</td><td>' + r.qualify + '</td><td>' + r.draws + '</td></tr>'; }
  );
  Pages.rainReport = reportPage('抽奖红包雨报表', '按 VIP 区间发放的红包雨到账记录。',
    ['会员账号', 'VIP', '场次', '金额', '时间'],
    function (d) { return d.rain; },
    function (r) { return '<tr><td>' + r.account + '</td><td>' + r.vip + '</td><td>' + r.slot + '</td><td class="amt-right">' + S.money(r.amount) + '</td><td>' + r.at + '</td></tr>'; }
  );
  Pages.memberReport = reportPage('抽奖会员报表', '会员维度汇总抽奖次数、现金奖、实物奖、红包雨。',
    ['会员账号', '抽奖次数', '现金奖', '实物奖', '红包雨'],
    function (d) { return d.memberReport; },
    function (r) { return '<tr><td>' + r.account + '</td><td>' + r.draws + '</td><td class="amt-right">' + S.money(r.winCash) + '</td><td>' + r.winPhy + '</td><td class="amt-right">' + S.money(r.rain) + '</td></tr>'; }
  );
  var LAYER_POPUP_MAX = 100;
  var LAYER_VENUES = S.LAYER_VENUES || [
    { id: 'Slot', name: 'Slot' },
    { id: 'Live', name: 'Live' },
    { id: 'Sports', name: 'Sports' },
    { id: 'Fishing', name: 'Fishing' },
    { id: 'Bingo', name: 'Bingo' }
  ];

  function layerNameList() {
    var names = {};
    ['Day2用户', 'Day3用户', 'Day4用户', '新客', '普通', 'VIP高价值', 'lalalal', '观察'].forEach(function (n) { names[n] = 1; });
    try {
      (S.load().groups || []).forEach(function (g) { if (g && g.name) names[g.name] = 1; });
    } catch (e) {}
    return Object.keys(names);
  }

  function emptyLayerRule(from) {
    var base = from ? JSON.parse(JSON.stringify(from)) : {
      venues: ['Slot'],
      strategy_type: 0,
      trigger_freq_hours: 0,
      trigger_freq_count: 0,
      thresholds: S.defaultLayerThresholds ? S.defaultLayerThresholds() : []
    };
    base.rule_id = 'R' + Date.now();
    base.user_groups = [];
    if (!base.venues || !base.venues.length) base.venues = ['Slot'];
    return base;
  }

  function loadLayerRules() {
    var raw = S.load().layerConfig;
    var rules = [];
    if (raw && raw.rules && raw.rules.length) rules = JSON.parse(JSON.stringify(raw.rules));
    else if (raw && raw.thresholds) {
      rules = [{
        rule_id: 'R1', user_groups: ['VIP高价值'], venues: ['Slot'],
        strategy_type: raw.strategy_type || 2,
        trigger_freq_hours: raw.trigger_freq_hours, trigger_freq_count: raw.trigger_freq_count,
        thresholds: raw.thresholds
      }];
    } else {
      rules = (S.defaultLayerConfig ? S.defaultLayerConfig().rules : [emptyLayerRule()]);
    }
    rules.forEach(function (rule) {
      if (!rule.venues || !rule.venues.length) {
        rule.venues = (rule.game_types && rule.game_types.length) ? ['Slot'] : ['Slot'];
      }
      (rule.thresholds || []).forEach(function (t) {
        if (t.warning_url == null) t.warning_url = t.warning_webhook || '';
      });
    });
    return rules;
  }

  function layerMsText(selected, emptyLabel) {
    if (!selected || !selected.length) return emptyLabel;
    return selected.join(',');
  }

  function layerMsHtml(kind, ri, options, selected, emptyLabel) {
    var sel = selected || [];
    var noneOn = !sel.length;
    var opts = '';
    if (emptyLabel === '无') {
      opts += '<label class="ly-ms-opt' + (noneOn ? ' on' : '') + '"><input type="checkbox" data-ms="' + kind + '" data-r="' + ri + '" value=""' + (noneOn ? ' checked' : '') + '> 无</label>';
    }
    opts += options.map(function (o) {
      var id = typeof o === 'string' ? o : o.id;
      var lab = typeof o === 'string' ? o : o.name;
      var on = sel.map(String).indexOf(String(id)) >= 0;
      return '<label class="ly-ms-opt' + (on ? ' on' : '') + '"><input type="checkbox" data-ms="' + kind + '" data-r="' + ri + '" value="' +
        U.escapeHtml(String(id)) + '"' + (on ? ' checked' : '') + '> ' + U.escapeHtml(lab) + '</label>';
    }).join('');
    return '<div class="ly-ms" data-ms-box="' + kind + '" data-r="' + ri + '">' +
      '<button class="ly-ms-btn" type="button" data-ms-toggle="' + kind + '" data-r="' + ri + '">' +
      '<span class="ly-ms-text">' + U.escapeHtml(layerMsText(sel, emptyLabel)) + '</span></button>' +
      '<div class="ly-ms-panel">' + opts + '</div></div>';
  }

  function formatIntComma(n) {
    var v = String(n == null ? '' : n).replace(/[^\d]/g, '');
    if (!v) return '';
    return String(Number(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function parseIntComma(v) {
    var n = Number(String(v == null ? '' : v).replace(/,/g, ''));
    return isNaN(n) ? '' : n;
  }

  function isHttpUrl(v) {
    return /^https?:\/\/[^\s]+$/i.test(String(v || '').trim());
  }

  function layerThreshHtml(t, ri, i) {
    var act = Number(t.action_type || 0);
    var left = LAYER_POPUP_MAX - String(t.alert_text || '').length;
    var extra = '';
    if (act === 2) {
      extra = '<div class="ly-row"><label class="req">奖金金额</label><input type="text" inputmode="numeric" data-k="bonus_amount" data-r="' + ri + '" data-i="' + i + '" value="' + U.escapeHtml(formatIntComma(t.bonus_amount)) + '" placeholder="请输入奖金金额">' +
        '<label class="req">打码倍数</label><input type="number" data-k="wager_multiple" data-r="' + ri + '" data-i="' + i + '" min="1" max="999" step="1" value="' + (t.wager_multiple || '') + '">' +
        '<span class="ly-hint">奖金额倍数</span></div>';
    } else if (act === 3) {
      extra = '<div class="ly-row"><label class="req">充值金额</label><input type="number" data-k="target_deposit_amount" data-r="' + ri + '" data-i="' + i + '" min="1" step="1" value="' + (t.target_deposit_amount || '') + '" placeholder="请输入充值金额">' +
        '<label class="req">奖金比例</label><span class="suffix"><input type="number" data-k="bonus_ratio" data-r="' + ri + '" data-i="' + i + '" min="0" max="100" step="1" value="' + (t.bonus_ratio == null ? '' : t.bonus_ratio) + '"><i>%</i></span>' +
        '<label class="req">打码倍数</label><input type="number" data-k="wager_multiple" data-r="' + ri + '" data-i="' + i + '" min="1" max="999" step="1" value="' + (t.wager_multiple || '') + '">' +
        '<span class="ly-hint">本金+奖金额倍数</span></div>';
    }
    var textRow = act === 0 ? '' : (
      '<div class="ly-row"><label class="req">弹窗文案</label><input type="text" data-k="alert_text" data-r="' + ri + '" data-i="' + i + '" maxlength="' + LAYER_POPUP_MAX + '" value="' + U.escapeHtml(t.alert_text || '') + '" placeholder="请编辑弹窗文案，不超过' + LAYER_POPUP_MAX + '个字">' +
      '<span class="ly-hint" data-left="' + ri + '-' + i + '">还可输入 ' + left + ' 字</span>' +
      '<button class="btn btn-secondary" type="button" data-preview-pop="' + ri + '-' + i + '">预览C端弹窗</button></div>'
    );
    return '<div class="ly-card"><h3>策略 ' + (i + 1) + '</h3>' +
      '<div class="ly-row"><label class="req">阈值比例</label><span class="suffix"><input type="number" data-k="threshold_ratio" data-r="' + ri + '" data-i="' + i + '" min="0" max="1000" step="1" value="' + (t.threshold_ratio == null ? 0 : t.threshold_ratio) + '"><i>%</i></span>' +
      '<label class="req">是否预警</label><label class="radio-line"><input type="radio" name="warn' + ri + '-' + i + '" value="0"' + (!t.is_warning ? ' checked' : '') + '> 否</label>' +
      '<label class="radio-line"><input type="radio" name="warn' + ri + '-' + i + '" value="1"' + (t.is_warning ? ' checked' : '') + '> 是</label>' +
      '<input type="text" data-k="warning_url" data-r="' + ri + '" data-i="' + i + '" value="' + U.escapeHtml(t.warning_url || t.warning_webhook || '') + '" placeholder="请填入发布预警地址"' + (t.is_warning ? '' : ' disabled') + '></div>' +
      '<div class="ly-row"><label>策略弹窗</label><select data-k="action_type" data-r="' + ri + '" data-i="' + i + '">' +
      '<option value="0"' + (act === 0 ? ' selected' : '') + '>无</option>' +
      '<option value="1"' + (act === 1 ? ' selected' : '') + '>文案弹窗</option>' +
      '<option value="2"' + (act === 2 ? ' selected' : '') + '>奖金弹窗</option>' +
      '<option value="3"' + (act === 3 ? ' selected' : '') + '>充值任务弹窗</option></select></div>' +
      textRow + extra + '</div>';
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function fmtCount(sec) {
    sec = Math.max(0, Number(sec) || 0);
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    return pad2(h) + ':' + pad2(m) + ':' + pad2(s);
  }

  function openLayerCendPreview(rule, thresh) {
    var act = Number(thresh.action_type || 0);
    if (act === 0) {
      U.toast('当前策略为「无」，没有 C 端弹窗', 'err');
      return;
    }
    var hours = Number(rule.trigger_freq_hours) || 1;
    var left = hours * 3600;
    var device = 'h5';
    var stage = 'main';
    var copy = (thresh.alert_text || '').trim() || '后台配置劝导文案';
    var bonus = Number(thresh.bonus_amount) || 20;
    var deposit = Number(thresh.target_deposit_amount) || 100;
    var ratio = Number(thresh.bonus_ratio) || 20;
    var wager = Number(thresh.wager_multiple) || 1;
    var inboxOn = act === 1;
    var titles = { 1: '劝导文案弹窗', 2: '限时奖金弹窗', 3: '限时存款任务弹窗' };
    var wrap = document.getElementById('layerPopupMask');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'layerPopupMask';
      document.body.appendChild(wrap);
    }
    function inboxLine() {
      if (!inboxOn) return '';
      if (act === 2) return '恭喜您！获得限时奖金 P' + bonus.toFixed(2) + '，限时 ' + hours + ' 小时内领取';
      if (act === 3) return '恭喜您！限时存款任务：充值 PHP ' + deposit + ' 可获 ' + ratio + '% 奖金，限时 ' + hours + ' 小时';
      return copy;
    }
    function dialogHtml() {
      if (stage === 'claimed') {
        return '<div class="lp-dlg">' +
          '<button class="lp-x" type="button" data-lp-close>×</button>' +
          '<div class="lp-ico">₱</div>' +
          '<h3>奖金到账</h3>' +
          '<p>已领取限时奖金 <b>P' + bonus.toFixed(2) + '</b>，可在 My Earnings 中查看。</p>' +
          '<button class="lp-btn" type="button" data-lp-close>知道了</button></div>';
      }
      if (stage === 'detail') {
        return '<div class="lp-dlg lp-wide">' +
          '<button class="lp-x" type="button" data-lp-back>×</button>' +
          '<h3>活动详情</h3>' +
          '<p>' + U.escapeHtml(copy) + '</p>' +
          '<ul class="lp-meta"><li>充值金额 PHP ' + deposit.toFixed(2) + '</li><li>奖金比例 ' + ratio + '%</li><li>流水倍数 ' + wager + '</li></ul>' +
          '<button class="lp-btn" type="button" data-lp-back>返回</button></div>';
      }
      if (act === 1) {
        return '<div class="lp-dlg">' +
          '<button class="lp-x" type="button" data-lp-close>×</button>' +
          '<h3>温馨提示</h3>' +
          '<p>' + U.escapeHtml(copy) + '</p>' +
          '<button class="lp-btn" type="button" data-lp-close>知道了</button></div>';
      }
      if (act === 2) {
        return '<div class="lp-dlg">' +
          '<button class="lp-x" type="button" data-lp-close>×</button>' +
          '<div class="lp-ico">₱</div>' +
          '<h3>限时奖金</h3>' +
          '<p>' + U.escapeHtml(copy) + '</p>' +
          '<p class="lp-sub">点击领取，立即获得 <b>P' + bonus.toFixed(2) + '</b> 奖金。可在 My Earnings 中查看</p>' +
          '<div class="lp-count" data-lp-count>' + fmtCount(left) + '</div>' +
          '<div class="lp-acts"><button class="lp-ghost" type="button" data-lp-close>关闭</button>' +
          '<button class="lp-btn" type="button" data-lp-claim>领取</button></div></div>';
      }
      return '<div class="lp-dlg">' +
        '<button class="lp-x" type="button" data-lp-close>×</button>' +
        '<h3>限时存款任务</h3>' +
        '<p>' + U.escapeHtml(copy) + '</p>' +
        '<p class="lp-sub">于倒计时内完成充值 <b>PHP ' + deposit.toFixed(2) + '</b><br>获得 <b>' + ratio + '%</b> 奖金</p>' +
        '<div class="lp-count" data-lp-count>' + fmtCount(left) + '</div>' +
        '<div class="lp-acts"><button class="lp-ghost" type="button" data-lp-close>关闭</button>' +
        '<button class="lp-btn" type="button" data-lp-pay>充值</button></div>' +
        '<button class="lp-link" type="button" data-lp-detail>Detail</button></div>';
    }
    function paint() {
      wrap.className = 'lp-mask open';
      wrap.innerHTML = '<div class="lp-panel">' +
        '<div class="lp-bar"><b>' + titles[act] + ' · ' + (device === 'h5' ? 'H5/APP' : 'PC') + '</b>' +
        '<div><button class="btn btn-secondary" type="button" data-lp-dev="h5">H5/APP</button>' +
        '<button class="btn btn-secondary" type="button" data-lp-dev="pc">PC</button>' +
        '<button class="btn btn-black" type="button" data-lp-close>关闭预览</button></div></div>' +
        '<div class="lp-stage ' + device + '"><div class="lp-frame">' + dialogHtml() + '</div></div>' +
        (inboxOn ? '<div class="lp-inbox">站内信同步：' + U.escapeHtml(inboxLine()) + '</div>' : '<div class="lp-inbox off">站内信已关闭，不发送</div>') +
        '</div>';
      $$ (wrap, '[data-lp-close]').forEach(function (b) {
        b.onclick = function () { wrap.classList.remove('open'); wrap.innerHTML = ''; };
      });
      $$ (wrap, '[data-lp-dev]').forEach(function (b) {
        b.onclick = function () { device = b.getAttribute('data-lp-dev'); paint(); };
      });
      var claim = wrap.querySelector('[data-lp-claim]');
      if (claim) claim.onclick = function () {
        stage = 'claimed';
        paint();
        U.toast('已领取限时奖金（演示，不产生真实资金）');
      };
      var pay = wrap.querySelector('[data-lp-pay]');
      if (pay) pay.onclick = function () { U.toast('演示跳转充值页面（不改正式数据）'); };
      var detail = wrap.querySelector('[data-lp-detail]');
      if (detail) detail.onclick = function () { stage = 'detail'; paint(); };
      var back = wrap.querySelector('[data-lp-back]');
      if (back) back.onclick = function () { stage = 'main'; paint(); };
    }
    paint();
    if (Pages._lpTimer) clearInterval(Pages._lpTimer);
    if (act === 2 || act === 3) {
      Pages._lpTimer = setInterval(function () {
        left = Math.max(0, left - 1);
        var el = wrap.querySelector('[data-lp-count]');
        if (el) el.textContent = fmtCount(left);
        if (left <= 0 && Pages._lpTimer) { clearInterval(Pages._lpTimer); Pages._lpTimer = null; }
      }, 1000);
    }
  }

  function layerRuleHtml(rule, ri, total) {
    return '<div class="ly-rule">' +
      '<div class="ly-rule-head"><div class="ly-rule-title"><b>分层 ' + (ri + 1) + '</b></div>' +
      '<div class="ly-rule-ops">' +
      (total > 1 ? '<button class="btn btn-danger" type="button" data-del-rule="' + ri + '">−</button>' : '') +
      '<button class="btn btn-black" type="button" data-add-rule="' + ri + '">+</button></div></div>' +
      '<div class="ly-row"><label class="req">分层用户</label>' + layerMsHtml('user_groups', ri, layerNameList(), rule.user_groups, '无') + '</div>' +
      '<div class="ly-row ly-top"><label class="req">策略定义</label>' +
      '<select data-rk="strategy_type" data-r="' + ri + '"><option value="0"' + (!Number(rule.strategy_type) ? ' selected' : '') + '>无</option>' +
      '<option value="1"' + (Number(rule.strategy_type) === 1 ? ' selected' : '') + '>用户实时净负盈利 / 用户最近一笔存款金额 ≥ 阈值</option>' +
      '<option value="2"' + (Number(rule.strategy_type) === 2 ? ' selected' : '') + '>用户实时余额 / 用户最近一笔存款金额 ≤ 阈值</option></select></div>' +
      '<div class="ly-row"><label class="req">可触发场馆</label>' + layerMsHtml('venues', ri, LAYER_VENUES, rule.venues, 'Slot') + '</div>' +
      '<div class="ly-row"><label class="req">触发频率</label>' +
      '<input type="number" data-rk="trigger_freq_hours" data-r="' + ri + '" min="0" max="999" step="1" value="' + (rule.trigger_freq_hours == null ? 0 : rule.trigger_freq_hours) + '">' +
      '<span>小时内，只能触发</span>' +
      '<input type="number" data-rk="trigger_freq_count" data-r="' + ri + '" min="0" max="999" step="1" value="' + (rule.trigger_freq_count == null ? 0 : rule.trigger_freq_count) + '">' +
      '<span>次</span></div>' +
      (rule.thresholds || []).map(function (t, i) { return layerThreshHtml(t, ri, i); }).join('') +
      '</div>';
  }

  Pages.layer = function (root) {
    var rules = loadLayerRules();

    function readMs(kind, ri) {
      return $$ (root, '[data-ms="' + kind + '"][data-r="' + ri + '"]:checked').map(function (el) { return el.value; }).filter(Boolean);
    }

    function readDom() {
      rules.forEach(function (rule, ri) {
        $$ (root, '[data-rk][data-r="' + ri + '"]').forEach(function (el) {
          rule[el.getAttribute('data-rk')] = el.type === 'number' ? Number(el.value) : Number(el.value);
        });
        rule.user_groups = readMs('user_groups', ri);
        rule.venues = readMs('venues', ri);
        (rule.thresholds || []).forEach(function (t, i) {
          $$ (root, '[data-r="' + ri + '"][data-i="' + i + '"]').forEach(function (el) {
            var k = el.getAttribute('data-k');
            if (!k) return;
            if (k === 'bonus_amount') t[k] = parseIntComma(el.value);
            else t[k] = el.type === 'number' ? Number(el.value) : el.value;
          });
          var w = root.querySelector('input[name="warn' + ri + '-' + i + '"]:checked');
          if (w) t.is_warning = Number(w.value);
        });
      });
    }

    function validateRule(rule, ri, silent) {
      var head = '分层 ' + (ri + 1);
      function fail(msg) { if (!silent) U.toast(msg, 'err'); return false; }
      if (!(rule.user_groups || []).length) return fail(head + ' 分层用户不能为「无」，必选至少一层');
      if (!Number(rule.strategy_type)) return fail(head + ' 策略定义不能为「无」');
      if (!(rule.venues || []).length) return fail(head + ' 可触发场馆不能为空');
      if (rule.trigger_freq_hours === '' || isNaN(rule.trigger_freq_hours) || rule.trigger_freq_hours < 0 || rule.trigger_freq_hours > 999 || String(rule.trigger_freq_hours).indexOf('.') >= 0) {
        return fail(head + ' 触发频率小时需为 0～999 的整数');
      }
      if (rule.trigger_freq_count === '' || isNaN(rule.trigger_freq_count) || rule.trigger_freq_count < 0 || rule.trigger_freq_count > 999 || String(rule.trigger_freq_count).indexOf('.') >= 0) {
        return fail(head + ' 触发次数需为 0～999 的整数');
      }
      for (var i = 0; i < (rule.thresholds || []).length; i++) {
        var t = rule.thresholds[i];
        var name = head + ' 策略 ' + (i + 1);
        if (t.threshold_ratio === '' || isNaN(t.threshold_ratio) || t.threshold_ratio < 0 || t.threshold_ratio > 1000 || String(t.threshold_ratio).indexOf('.') >= 0) {
          return fail(name + ' 阈值比例需为 0～1000% 的整数');
        }
        if (t.is_warning) {
          if (!String(t.warning_url || '').trim()) return fail(name + ' 预警发布地址不能为空');
          if (!isHttpUrl(t.warning_url)) return fail(name + ' 预警地址需为合法 URL');
        }
        if (Number(t.action_type) === 1 && !String(t.alert_text || '').trim()) return fail(name + ' 弹窗文案不能为空');
        if (Number(t.action_type) === 2) {
          if (!(t.bonus_amount > 0) || String(t.bonus_amount).indexOf('.') >= 0) return fail(name + ' 奖金金额需为正整数');
          if (!(t.wager_multiple >= 1 && t.wager_multiple <= 999) || String(t.wager_multiple).indexOf('.') >= 0) return fail(name + ' 打码倍数需为 1～999 的整数');
        }
        if (Number(t.action_type) === 3) {
          if (!(t.target_deposit_amount > 0) || String(t.target_deposit_amount).indexOf('.') >= 0) return fail(name + ' 充值金额需为正整数');
          if (t.bonus_ratio === '' || isNaN(t.bonus_ratio) || t.bonus_ratio < 0 || t.bonus_ratio > 100 || String(t.bonus_ratio).indexOf('.') >= 0) {
            return fail(name + ' 奖金比例需为 0～100% 的整数');
          }
          if (!(t.wager_multiple >= 1 && t.wager_multiple <= 999) || String(t.wager_multiple).indexOf('.') >= 0) return fail(name + ' 打码倍数需为 1～999 的整数');
        }
      }
      return true;
    }

    function bindCancelOk() {
      $$ (root, '[data-cancel]').forEach(function (cancel) {
        cancel.onclick = function () {
          U.confirm('用户分层策略未执行，确定取消恢复上一次进入时状态？').then(function (ok) {
            if (!ok) return;
            rules = loadLayerRules();
            draw();
            U.toast('已还原未保存修改（演示）');
          });
        };
      });
      $$ (root, '[data-ok]').forEach(function (ok) {
        ok.onclick = function () {
          readDom();
          for (var ri = 0; ri < rules.length; ri++) {
            if (!validateRule(rules[ri], ri)) return;
          }
          var data = S.load();
          data.layerConfig = { rules: rules };
          S.save(data);
          U.toast('保存成功（演示，不改正式数据）');
        };
      });
    }

    function draw() {
      delayed(function (err) {
        if (err) {
          root.innerHTML = pageShell('用户分层活动配置', failBlock());
          var btn = root.querySelector('[data-retry]');
          if (btn) btn.onclick = draw;
          return;
        }
        root.innerHTML = pageShell('用户分层活动配置',
          '<div class="ly-page">' +
          '<div class="ly-toolbar">' +
          '<p class="ly-ax-tip">菜单位置：优惠活动 / 用户分层活动配置。按 <a href="https://85cnzd.axshare.com/?g=14&id=kow2b6&p=%E3%80%90%E8%8F%B2%E7%9B%98-backend%E3%80%91%E7%94%A8%E6%88%B7%E5%88%86%E5%B1%82%E6%B4%BB%E5%8A%A8%E9%85%8D%E7%BD%AE&sc=3" target="_blank" rel="noreferrer">Axure 用户分层活动配置</a> 还原。</p>' +
          '<div class="ly-toolbar-ops">' +
          '<button class="btn btn-secondary" type="button" data-to-report>转到报表</button>' +
          '<button class="btn btn-secondary" type="button" data-cancel>取消</button>' +
          '<button class="btn btn-black" type="button" data-ok>确定</button></div></div>' +
          rules.map(function (r, i) { return layerRuleHtml(r, i, rules.length); }).join('') +
          '<div class="ly-foot"><button class="btn btn-secondary" type="button" data-cancel>取消</button>' +
          '<button class="btn btn-black" type="button" data-ok>确定</button></div></div>'
        );
        $$ (root, '.ly-ms').forEach(function (box) {
          box.onclick = function (e) { e.stopPropagation(); };
        });
        $$ (root, '[data-ms-toggle]').forEach(function (b) {
          b.onclick = function (e) {
            e.stopPropagation();
            var box = b.parentNode;
            var open = box.classList.contains('open');
            $$ (root, '.ly-ms.open').forEach(function (x) { x.classList.remove('open'); });
            box.classList.toggle('open', !open);
          };
        });
        $$ (root, '[data-ms]').forEach(function (el) {
          el.onchange = function () {
            var kind = el.getAttribute('data-ms');
            var ri = el.getAttribute('data-r');
            var box = root.querySelector('[data-ms-box="' + kind + '"][data-r="' + ri + '"]');
            if (el.value === '') {
              $$ (box, '[data-ms]').forEach(function (x) { x.checked = x.value === ''; x.parentNode.classList.toggle('on', x.checked); });
            } else {
              var none = box.querySelector('[data-ms][value=""]');
              if (none) { none.checked = false; none.parentNode.classList.remove('on'); }
              el.parentNode.classList.toggle('on', el.checked);
            }
            var selected = $$ (box, '[data-ms]:checked').map(function (x) { return x.value; }).filter(Boolean);
            var emptyLabel = kind === 'venues' ? 'Slot' : '无';
            box.querySelector('.ly-ms-text').textContent = layerMsText(selected, emptyLabel);
          };
        });
        $$ (root, '[data-k="action_type"], input[name^="warn"]').forEach(function (el) {
          el.onchange = function () { readDom(); draw(); };
        });
        $$ (root, '[data-k="alert_text"]').forEach(function (el) {
          el.oninput = function () {
            var left = LAYER_POPUP_MAX - el.value.length;
            var tip = root.querySelector('[data-left="' + el.getAttribute('data-r') + '-' + el.getAttribute('data-i') + '"]');
            if (tip) tip.textContent = '还可输入 ' + left + ' 字';
          };
        });
        $$ (root, '[data-k="bonus_amount"]').forEach(function (el) {
          el.onblur = function () { el.value = formatIntComma(el.value); };
        });
        var toReport = root.querySelector('[data-to-report]');
        if (toReport) toReport.onclick = function () { location.hash = '#/layerReport'; };
        $$ (root, '[data-preview-pop]').forEach(function (b) {
          b.onclick = function () {
            readDom();
            var parts = String(b.getAttribute('data-preview-pop') || '').split('-');
            var rule = rules[Number(parts[0])];
            var thresh = rule && rule.thresholds ? rule.thresholds[Number(parts[1])] : null;
            if (!rule || !thresh) return;
            openLayerCendPreview(rule, thresh);
          };
        });
        $$ (root, '[data-add-rule]').forEach(function (b) {
          b.onclick = function () {
            readDom();
            var idx = Number(b.getAttribute('data-add-rule'));
            if (!validateRule(rules[idx], idx)) return;
            rules.splice(idx + 1, 0, emptyLayerRule(rules[idx]));
            draw();
          };
        });
        $$ (root, '[data-del-rule]').forEach(function (b) {
          b.onclick = function () {
            if (rules.length <= 1) return;
            U.confirm('删除该分层将同步删除其下全部策略，确定删除？').then(function (ok) {
              if (!ok) return;
              readDom();
              rules.splice(Number(b.getAttribute('data-del-rule')), 1);
              draw();
            });
          };
        });
        bindCancelOk();
      });
    }
    if (!Pages._layerMsClose) {
      Pages._layerMsClose = function () {
        document.querySelectorAll('.ly-ms.open').forEach(function (x) { x.classList.remove('open'); });
      };
      document.addEventListener('click', Pages._layerMsClose);
    }
    draw();
  };

  Pages.layerReport = function (root) {
    var BONUS = { 2: '限时奖金', 3: '限时存款奖金' };
    var HEAD = ['触发时间', '会员账号', '所属分层', '奖励类型', '奖励金额', '打码倍数', '打码金额', '消费状态', '奖励消费时间', '最后一次存款金额', '触发时用户净负盈利', '触发时用户余额'];
    var state = { page: 1, size: 30, q: { trigger_timeFrom: '2026-08-01', trigger_timeTo: '2026-08-31' }, timeKey: 'trigger' };

    function dayOf(v) { return String(v || '').slice(0, 10); }
    function num(v) { return Number(v) || 0; }
    function money(v) { return S.money(num(v)); }
    function consumed(r) { return Number(r.status) === 1; }
    function wagerAmt(r) {
      if (!consumed(r)) return null;
      var w = num(r.wager_multiple);
      if (Number(r.task_type) === 3) return (num(r.deposit_recharge) + num(r.bonus_amount)) * w;
      return num(r.bonus_amount) * w;
    }
    function bonusCell(r) {
      if (Number(r.task_type) === 3) {
        var ratio = (r.bonus_ratio == null ? '' : r.bonus_ratio) + '%';
        return consumed(r) ? (money(r.bonus_amount) + '（' + ratio + '）') : ('（' + ratio + '）');
      }
      return money(r.bonus_amount);
    }
    function statusCell(r) {
      if (!consumed(r)) return '未消费';
      if (Number(r.task_type) === 3) return money(r.deposit_recharge);
      return '已消费';
    }

    function filterRows(list, q, timeKey) {
      return (list || []).filter(function (r) {
        if (Number(r.task_type) !== 2 && Number(r.task_type) !== 3) return false;
        if (timeKey === 'consume') {
          var cday = dayOf(r.complete_time);
          if (q.complete_timeFrom && (!cday || cday < q.complete_timeFrom)) return false;
          if (q.complete_timeTo && (!cday || cday > q.complete_timeTo)) return false;
        } else {
          var day = dayOf(r.trigger_time);
          if (q.trigger_timeFrom && day && day < q.trigger_timeFrom) return false;
          if (q.trigger_timeTo && day && day > q.trigger_timeTo) return false;
        }
        if (q.username && String(r.username).indexOf(q.username) < 0) return false;
        var layers = q.layers || [];
        if (layers.length && layers.indexOf(r.hierarchy_name) < 0) return false;
        if (q.task_type && String(r.task_type) !== String(q.task_type)) return false;
        if (q.status !== '' && q.status != null && String(r.status) !== String(q.status)) return false;
        return true;
      }).sort(function (a, b) { return String(b.trigger_time).localeCompare(String(a.trigger_time)); });
    }

    function statsOf(rows) {
      var s = {
        total_reward_amount: 0, total_reward_time_bonus: 0, total_reward_deposit_bonus: 0,
        total_consume_amount: 0, total_consume_time_bonus: 0, total_consume_deposit_bonus: 0,
        total_consume_deposit_bonus_pop: 0
      };
      (rows || []).forEach(function (r) {
        var amt = num(r.bonus_amount);
        s.total_reward_amount += amt;
        if (Number(r.task_type) === 2) s.total_reward_time_bonus += amt;
        if (Number(r.task_type) === 3) s.total_reward_deposit_bonus += amt;
        if (consumed(r)) {
          s.total_consume_amount += amt;
          if (Number(r.task_type) === 2) s.total_consume_time_bonus += amt;
          if (Number(r.task_type) === 3) s.total_consume_deposit_bonus += amt;
        }
        if (Number(r.task_type) === 3 && consumed(r)) s.total_consume_deposit_bonus_pop += num(r.deposit_recharge);
      });
      return s;
    }

    function statCards(s, titles, empty) {
      function show(v) { return empty ? '-' : money(v); }
      return '<div class="lr-stats">' +
        '<div class="lr-stat"><div class="lr-stat-title">' + titles[0] + '</div><div class="lr-stat-main">' + show(s.total_reward_amount) + '</div>' +
        '<div class="lr-stat-sub"><span>限时奖金</span><b>' + show(s.total_reward_time_bonus) + '</b></div>' +
        '<div class="lr-stat-sub"><span>限时存款奖金</span><b>' + show(s.total_reward_deposit_bonus) + '</b></div></div>' +
        '<div class="lr-stat"><div class="lr-stat-title">' + titles[1] + '</div><div class="lr-stat-main">' + show(s.total_consume_amount) + '</div>' +
        '<div class="lr-stat-sub"><span>限时奖金</span><b>' + show(s.total_consume_time_bonus) + '</b></div>' +
        '<div class="lr-stat-sub"><span>限时存款奖金</span><b>' + show(s.total_consume_deposit_bonus) + '</b></div></div>' +
        '<div class="lr-stat"><div class="lr-stat-title">' + titles[2] + '</div><div class="lr-stat-main">' + show(s.total_consume_deposit_bonus_pop) + '</div></div>' +
        '</div>';
    }

    function sumRow(rows) {
      var bonus = 0, wager = 0, last = 0, net = 0;
      (rows || []).forEach(function (r) {
        if (Number(r.task_type) === 2 || consumed(r)) bonus += num(r.bonus_amount);
        var wa = wagerAmt(r);
        if (wa != null) wager += wa;
        last += num(r.last_deposit_amount);
        net += num(r.net_negative_profit_and_loss);
      });
      return '<tr class="lr-sum"><td>合计</td><td>—</td><td>—</td><td>—</td><td>' + money(bonus) +
        '</td><td>—</td><td>' + money(wager) + '</td><td>—</td><td>—</td><td>' + money(last) +
        '</td><td>' + money(net) + '</td><td>—</td></tr>';
    }

    function draw() {
      delayed(function (err) {
        if (err) {
          root.innerHTML = pageShell('用户分层活动报表', failBlock());
          var btn = root.querySelector('[data-retry]');
          if (btn) btn.onclick = draw;
          return;
        }
        var d = S.load();
        var all = d.demo.empty ? [] : (d.layerReports || []);
        var rows = filterRows(all, state.q, state.timeKey);
        var pageRows = U.slicePage(rows, state);
        var body = pageRows.length ? pageRows.map(function (r) {
          var wa = wagerAmt(r);
          return '<tr><td>' + U.escapeHtml(r.trigger_time) + '</td><td><button class="op-link acc-link" type="button" data-member="' +
            U.escapeHtml(r.username) + '">' + U.escapeHtml(r.username) + '</button></td><td>' + U.escapeHtml(r.hierarchy_name) +
            '</td><td>' + (BONUS[r.task_type] || '—') + '</td><td>' + bonusCell(r) + '</td><td>' +
            (r.wager_multiple == null || r.wager_multiple === '' ? '—' : r.wager_multiple) +
            '</td><td>' + (wa == null ? '—' : money(wa)) + '</td><td>' + statusCell(r) + '</td><td>' +
            (consumed(r) && r.complete_time ? U.escapeHtml(r.complete_time) : '—') + '</td><td>' + money(r.last_deposit_amount) +
            '</td><td>' + money(r.net_negative_profit_and_loss) + '</td><td>' + money(r.user_balance) + '</td></tr>';
        }).join('') : emptyRow(HEAD.length);
        var layerChips = layerNameList().map(function (n) {
          var on = (state.q.layers || []).indexOf(n) >= 0;
          return '<label class="chip' + (on ? ' on' : '') + '"><input type="checkbox" data-layer value="' +
            U.escapeHtml(n) + '"' + (on ? ' checked' : '') + '> ' + U.escapeHtml(n) + '</label>';
        }).join('');
        root.innerHTML = pageShell('用户分层活动报表',
          '<div class="lr-page">' +
          '<div class="ly-toolbar"><div class="lr-sec-title" style="margin:0">用户分层活动后台报表</div>' +
          '<button class="btn btn-secondary" type="button" data-to-cfg>转到配置</button></div>' +
          statCards(statsOf(all), ['奖励总金额', '总消费金额', '限时存款奖金总充值金额'], d.demo.empty) +
          '<div class="lr-sec-title">时间范围查询报表</div>' +
          '<div class="filter-grid">' +
          '<label class="fg"><span>触发时间</span><div class="date-range" data-time="trigger"><input type="date" data-f="trigger_timeFrom"><span class="dash">-</span><input type="date" data-f="trigger_timeTo"></div></label>' +
          '<label class="fg"><span>会员账号</span><input type="text" data-f="username" placeholder="请输入会员账号"></label>' +
          '<label class="fg fg-wide"><span>会员所属分层</span><div class="chip-box">' + layerChips + '</div></label>' +
          '<label class="fg"><span>奖励种类</span><select data-f="task_type"><option value="">请选择奖励种类</option><option value="2">限时奖金</option><option value="3">限时存款奖金</option></select></label>' +
          '<label class="fg"><span>奖励消费时间</span><div class="date-range" data-time="consume"><input type="date" data-f="complete_timeFrom"><span class="dash">-</span><input type="date" data-f="complete_timeTo"></div></label>' +
          '<label class="fg"><span>消费状态</span><select data-f="status"><option value="">请选择奖励消费状态</option><option value="0">未消费</option><option value="1">已消费</option></select></label>' +
          '</div>' +
          '<p class="page-tip">编辑消费时间后优先按消费时间查询；再改触发时间则以最后编辑的时间为准。当前：' +
          (state.timeKey === 'consume' ? '奖励消费时间' : '触发时间') + '。分层不选视为全部。不含纯文案劝导。</p>' +
          '<div class="filter-actions"><button class="btn btn-primary" type="button" data-search>' + ico('search') + '搜索</button>' +
          '<button class="btn btn-secondary" type="button" data-reset">重置</button></div>' +
          statCards(statsOf(rows), ['奖励金额', '消费金额', '限时存款奖金总充值金额'], d.demo.empty) +
          '<div class="table-bar"><div class="toolbar-left"><button class="btn btn-secondary" type="button" data-export">' + ico('export') + '导出</button></div></div>' +
          tableWrap(HEAD, body, 1680, sumRow(rows)) +
          U.pagerHtml(state.page, state.size, rows.length) +
          '</div>'
        );
        setFilters(root, state.q);
        $$ (root, '.chip input').forEach(function (el) {
          el.onchange = function () { el.parentNode.classList.toggle('on', el.checked); };
        });
        $$ (root, '[data-time="trigger"] input').forEach(function (el) {
          el.addEventListener('change', function () { state.timeKey = 'trigger'; });
        });
        $$ (root, '[data-time="consume"] input').forEach(function (el) {
          el.addEventListener('change', function () { state.timeKey = 'consume'; });
        });
        var search = root.querySelector('[data-search]');
        if (search) search.onclick = function () {
          state.q = readFilters(root);
          state.q.layers = $$ (root, '[data-layer]:checked').map(function (el) { return el.value; });
          state.page = 1;
          draw();
        };
        var reset = root.querySelector('[data-reset]');
        if (reset) reset.onclick = function () {
          state.q = { trigger_timeFrom: '2026-08-01', trigger_timeTo: '2026-08-31' };
          state.timeKey = 'trigger';
          state.page = 1;
          draw();
        };
        $$ (root, '.lr-page input, .lr-page select').forEach(function (el) {
          el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); if (search) search.click(); }
          });
        });
        var ex = root.querySelector('[data-export]');
        if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示，不改正式数据）'); };
        var toCfg = root.querySelector('[data-to-cfg]');
        if (toCfg) toCfg.onclick = function () { location.hash = '#/layer'; };
        $$ (root, '[data-member]').forEach(function (b) {
          b.onclick = function () {
            location.hash = '#/memberDetail?id=' + encodeURIComponent(b.getAttribute('data-member'));
          };
        });
        U.bindPager(root, state, draw);
      });
    }
    draw();
  };
  Pages.ops = function (root) {
    var LAYER_TYPE = '用户分层活动';
    function layerAgg(d) {
      var rows = (d.layerReports || []).filter(function (r) { return Number(r.task_type) === 2 || Number(r.task_type) === 3; });
      var users = {};
      var amt = 0;
      rows.forEach(function (r) {
        users[r.username] = 1;
        amt += Number(r.bonus_amount) || 0;
      });
      return { n: Object.keys(users).length, amt: amt, rows: rows.length };
    }
    mountList(root, {
      title: '活动运营报表',
      tip: '看板含用户分层活动。活动类型可筛「用户分层活动」，统计其对应发放与参与（演示，不可对账）。',
      filters: [
        { key: 'type', label: '活动类型', type: 'select', options: [{ id: '', label: '全部' }].concat((S.ACT_TYPES || []).map(function (t) { return { id: t.id, label: t.label }; })).concat([{ id: 'layer', label: LAYER_TYPE }]) }
      ],
      extraBtn: '<button class="btn btn-ghost" type="button" data-export>导出</button>',
      head: ['活动名称', '活动类型', '参与人数', '发放金额', '状态'],
      rows: function (d, q) {
        var layer = layerAgg(d);
        var list = (d.activities || []).map(function (a) {
          var t = (S.ACT_TYPES || []).filter(function (x) { return x.id === a.type; })[0];
          return { title: a.title, type: a.type, typeLabel: t ? t.label : a.type, n: 18 + (a.sort || 1) * 3, amt: 860 + (a.sort || 1) * 140, status: a.status === 1 ? '开启' : '关闭' };
        });
        list.push({ title: LAYER_TYPE, type: 'layer', typeLabel: LAYER_TYPE, n: layer.n, amt: layer.amt, status: '开启' });
        return list.filter(function (r) { return !q.type || r.type === q.type; });
      },
      rowHtml: function (r) {
        return '<tr><td>' + U.escapeHtml(r.title) + '</td><td>' + U.escapeHtml(r.typeLabel) + '</td><td>' + r.n +
          '</td><td class="amt-right">' + S.money(r.amt) + '</td><td>' + U.badgeStatus(r.status) + '</td></tr>';
      },
      bind: function (root, d) {
        var layer = layerAgg(d);
        var bar = root.querySelector('.table-card');
        if (bar) {
          var cards = document.createElement('div');
          cards.className = 'lr-stats';
          cards.style.margin = '0 0 12px';
          cards.innerHTML =
            '<div class="lr-stat"><div class="lr-stat-title">用户分层活动</div><div class="lr-stat-main">' + S.money(layer.amt) + '</div>' +
            '<div class="lr-stat-sub"><span>参与人数</span><b>' + layer.n + '</b></div>' +
            '<div class="lr-stat-sub"><span>触发笔数</span><b>' + layer.rows + '</b></div></div>' +
            '<div class="lr-stat"><div class="lr-stat-title">限时奖金</div><div class="lr-stat-main">' +
            S.money((d.layerReports || []).filter(function (r) { return Number(r.task_type) === 2; }).reduce(function (s, r) { return s + (Number(r.bonus_amount) || 0); }, 0)) +
            '</div></div>' +
            '<div class="lr-stat"><div class="lr-stat-title">限时存款奖金</div><div class="lr-stat-main">' +
            S.money((d.layerReports || []).filter(function (r) { return Number(r.task_type) === 3; }).reduce(function (s, r) { return s + (Number(r.bonus_amount) || 0); }, 0)) +
            '</div></div>';
          bar.parentNode.insertBefore(cards, bar);
        }
        var ex = root.querySelector('[data-export]');
        if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示，不改正式数据）'); };
      }
    });
  };
  Pages.memberStat = reportPage('会员统计报表', '会员新增 / 活跃 / 充提汇总（演示）。',
    ['日期', '新增', '活跃', '充值', '提款'],
    function () { return [{ account: '2026-08-15', n: 4, a: 28, d: 3550, w: 500 }]; },
    function (r) { return '<tr><td>' + r.account + '</td><td>' + r.n + '</td><td>' + r.a + '</td><td class="amt-right">' + S.money(r.d) + '</td><td class="amt-right">' + S.money(r.w) + '</td></tr>'; }
  );
  Pages.promo = reportPage('优惠明细', '会员维度优惠发放明细。',
    ['会员账号', '优惠类型', '金额', '状态', '时间', '操作人'],
    function (d) { return d.bonus; },
    function (r) { return '<tr><td>' + r.account + '</td><td>' + r.type + '</td><td class="amt-right">' + S.money(r.amount) + '</td><td>' + U.badgeStatus(r.status) + '</td><td>' + r.at + '</td><td>' + r.operator + '</td></tr>'; }
  );
  Pages.bonusReport = function (root) {
    var LAYER_TYPE = '用户分层活动';
    function layerRows(d) {
      return (d.layerReports || []).filter(function (r) { return Number(r.task_type) === 2 || Number(r.task_type) === 3; }).map(function (r) {
        var consumed = Number(r.status) === 1;
        var wager = Number(r.wager_multiple) || 1;
        var need = consumed
          ? (Number(r.task_type) === 3 ? (Number(r.deposit_recharge) + Number(r.bonus_amount)) * wager : Number(r.bonus_amount) * wager)
          : 0;
        return {
          id: 'LR-' + r.id,
          username: r.username,
          tenant_name: 'JUAN',
          type: LAYER_TYPE,
          money: Number(r.bonus_amount) || 0,
          game_sn: String(wager),
          nee_bet_money: need,
          money_type: Number(r.task_type) === 3 ? '限时存款奖金' : '限时奖金',
          create_time: r.trigger_time,
          start_time: r.trigger_time,
          expire_time: r.complete_time || '—',
          status: consumed ? '已消费' : '未消费',
          bet_money: consumed ? (need ? need.toFixed(2) : '0.00') : '—'
        };
      });
    }
    function otherRows(d) {
      return (d.bonus || []).map(function (b, i) {
        return {
          id: 'BN-' + (b.id || (i + 1)),
          username: b.account,
          tenant_name: 'JUAN',
          type: b.type,
          money: Number(b.amount) || 0,
          game_sn: '1',
          nee_bet_money: Number(b.amount) || 0,
          money_type: '真金',
          create_time: b.at,
          start_time: b.at,
          expire_time: '—',
          status: b.status || '已发放',
          bet_money: '—'
        };
      });
    }
    mountList(root, {
      title: '奖金报表',
      tip: '任务类型已增加「用户分层活动」，该选项统计分层活动对应奖金（演示，不可对账）。',
      filters: [
        { key: 'username', label: '会员账户' },
        { key: 'type', label: '任务类型', type: 'select', options: [{ id: '', label: '全部' }, { id: LAYER_TYPE, label: LAYER_TYPE }, { id: '注册礼', label: '注册礼' }, { id: '抽奖现金', label: '抽奖现金' }, { id: 'QRPH返利', label: 'QRPH返利' }] }
      ],
      extraBtn: '<button class="btn btn-ghost" type="button" data-export>导出</button>',
      head: ['任务ID', '会员账户', '所属平台', '任务类型', '任务派发奖金', '流水倍数', '总流水要求', '奖励种类', '任务创建时间', '任务状态', '当前进度'],
      rows: function (d, q) {
        return otherRows(d).concat(layerRows(d)).filter(function (r) {
          if (q.username && String(r.username).indexOf(q.username) < 0) return false;
          if (q.type && r.type !== q.type) return false;
          return true;
        });
      },
      rowHtml: function (r) {
        return '<tr><td>' + U.escapeHtml(r.id) + '</td><td><button class="op-link acc-link" type="button" data-member="' +
          U.escapeHtml(r.username) + '">' + U.escapeHtml(r.username) + '</button></td><td>' + U.escapeHtml(r.tenant_name) +
          '</td><td>' + U.escapeHtml(r.type) + '</td><td class="amt-right">' + S.money(r.money) + '</td><td>' +
          U.escapeHtml(r.game_sn) + '</td><td class="amt-right">' + S.money(r.nee_bet_money) + '</td><td>' +
          U.escapeHtml(r.money_type) + '</td><td>' + U.escapeHtml(r.create_time) + '</td><td>' +
          U.badgeStatus(r.status) + '</td><td>' + U.escapeHtml(r.bet_money) + '</td></tr>';
      },
      bind: function (root) {
        var ex = root.querySelector('[data-export]');
        if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示，不改正式数据）'); };
        $$ (root, '[data-member]').forEach(function (b) {
          b.onclick = function () {
            location.hash = '#/memberDetail?id=' + encodeURIComponent(b.getAttribute('data-member'));
          };
        });
      }
    });
  };

  Pages.promoDetail = Pages.promo;
  Pages.promo = Pages.promoDetail;

  Pages.groups = function (root) {
    mountList(root, {
      title: '会员分组',
      toolbar: '<button class="btn btn-black" type="button" data-add>+ 新增</button>',
      head: ['分组名称', '人数', '备注', '操作'],
      rows: function (d) { return d.groups || []; },
      rowHtml: function (g) {
        return '<tr><td>' + U.escapeHtml(g.name) + '</td><td>' + g.count + '</td><td>' + U.escapeHtml(g.remark || '-') + '</td><td><button class="op-link" data-ed="' + g.id + '">编辑</button></td></tr>';
      },
      bind: function (root, d, redraw) {
        function form(row) {
          U.openDrawer(row ? '编辑' : '新增',
            arcoFields([
              { id: 'gName', label: '等级全称', req: true, value: row ? row.name : '' },
              { id: 'gRm', label: '备注', value: row ? row.remark : '' }
            ]),
            function () {
              var name = document.getElementById('gName').value.trim();
              if (!name) { U.toast('请输入名称', 'err'); return; }
              var data = S.load();
              if (row) {
                var g = data.groups.filter(function (x) { return x.id === row.id; })[0];
                g.name = name; g.remark = document.getElementById('gRm').value;
              } else data.groups.push({ id: S.nextId('G', data), name: name, count: 0, remark: document.getElementById('gRm').value });
              S.save(data); U.closeDrawer(); U.toast('已保存'); redraw();
            });
        }
        var add = root.querySelector('[data-add]');
        if (add) add.onclick = function () { form(null); };
        $$ (root, '[data-ed]').forEach(function (b) {
          b.onclick = function () { form(d.groups.filter(function (g) { return g.id === b.getAttribute('data-ed'); })[0]); };
        });
      }
    });
  };

  Pages.bills = function (root) {
    mountList(root, {
      title: '会员账单',
      filters: [{ key: 'kw', label: '会员账号' }],
      extraBtn: '<button class="btn btn-ghost" type="button" data-export>导出</button>',
      head: ['账单号', '会员账号', '类型', '金额', '时间', '备注'],
      rows: function (d, q) { return (d.bills || []).filter(function (r) { return !q.kw || r.account.indexOf(q.kw) >= 0; }); },
      rowHtml: function (r) {
        return '<tr><td>' + r.id + '</td><td>' + r.account + '</td><td>' + r.type + '</td><td class="amt-right">' + S.money(r.amount) + '</td><td>' + r.at + '</td><td>' + U.escapeHtml(r.remark) + '</td></tr>';
      },
      bind: function (root) {
        var ex = root.querySelector('[data-export]');
        if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示）'); };
      }
    });
  };

  Pages.kyc = function (root) {
    mountList(root, {
      title: 'KYC审核管理',
      filters: [{ key: 'kw', label: '会员账号' }, { key: 'status', label: '状态', type: 'select', options: ['待审核', '已通过', '已拒绝'] }],
      head: ['会员账号', '姓名', '证件类型', '状态', '提交时间', '操作'],
      rows: function (d, q) {
        return (d.kyc || []).filter(function (r) {
          if (q.kw && r.account.indexOf(q.kw) < 0) return false;
          if (q.status && r.status !== q.status) return false;
          return true;
        });
      },
      rowHtml: function (r) {
        var ops = r.status === '待审核' ? '<button class="op-link" data-ok="' + r.id + '">通过</button><button class="op-link danger" data-no="' + r.id + '">拒绝</button>' : '—';
        return '<tr><td>' + r.account + '</td><td>' + U.escapeHtml(r.name) + '</td><td>' + r.idType + '</td><td>' + U.badgeStatus(r.status) + '</td><td>' + r.at + '</td><td>' + ops + '</td></tr>';
      },
      bind: function (root, d, redraw) {
        function set(id, status) {
          U.confirm(status === '已通过' ? '确认通过该 KYC？' : '确认拒绝该 KYC？').then(function (ok) {
            if (!ok) return;
            var data = S.load();
            var row = data.kyc.filter(function (x) { return x.id === id; })[0];
            row.status = status;
            S.save(data); U.toast('已更新'); redraw();
          });
        }
        $$ (root, '[data-ok]').forEach(function (b) { b.onclick = function () { set(b.getAttribute('data-ok'), '已通过'); }; });
        $$ (root, '[data-no]').forEach(function (b) { b.onclick = function () { set(b.getAttribute('data-no'), '已拒绝'); }; });
      }
    });
  };

  Pages.selfLimit = function (root) {
    mountList(root, {
      title: '自我限制',
      filters: [{ key: 'kw', label: '会员账号' }],
      head: ['会员账号', '类型', '天数', '状态', '开始时间'],
      rows: function (d, q) { return (d.selfLimits || []).filter(function (r) { return !q.kw || r.account.indexOf(q.kw) >= 0; }); },
      rowHtml: function (r) {
        return '<tr><td>' + r.account + '</td><td>' + r.type + '</td><td>' + r.days + '</td><td>' + U.badgeStatus(r.status) + '</td><td>' + r.at + '</td></tr>';
      }
    });
  };

  Pages.sms = function (root) {
    mountList(root, {
      title: '短信查询',
      filters: [{ key: 'kw', label: '手机 / 账号' }],
      head: ['手机号', '会员账号', '内容', '状态', '时间'],
      rows: function (d, q) {
        return (d.sms || []).filter(function (r) { return !q.kw || r.phone.indexOf(q.kw) >= 0 || r.account.indexOf(q.kw) >= 0; });
      },
      rowHtml: function (r) {
        return '<tr><td>' + r.phone + '</td><td>' + r.account + '</td><td>' + U.escapeHtml(r.content) + '</td><td>' + U.badgeStatus(r.status) + '</td><td>' + r.at + '</td></tr>';
      }
    });
  };

  Pages.behaviorLogs = function (root) {
    mountList(root, {
      title: '用户行为日志',
      filters: [{ key: 'kw', label: '会员账号' }],
      head: ['会员账号', '行为', 'IP', '时间'],
      rows: function (d, q) { return (d.behaviorLogs || []).filter(function (r) { return !q.kw || r.account.indexOf(q.kw) >= 0; }); },
      rowHtml: function (r) {
        return '<tr><td>' + r.account + '</td><td>' + U.escapeHtml(r.action) + '</td><td>' + r.ip + '</td><td>' + r.at + '</td></tr>';
      }
    });
  };

  Pages.wdAccounts = function (root) {
    mountList(root, {
      title: '提款账户管理',
      filters: [{ key: 'kw', label: '会员账号' }],
      head: ['会员账号', '通道', '账号', '状态', '绑定时间'],
      rows: function (d, q) { return (d.wdAccounts || []).filter(function (r) { return !q.kw || r.account.indexOf(q.kw) >= 0; }); },
      rowHtml: function (r) {
        return '<tr><td>' + r.account + '</td><td>' + r.channel + '</td><td>' + r.no + '</td><td>' + U.badgeStatus(r.status) + '</td><td>' + r.at + '</td></tr>';
      }
    });
  };

  Pages.memberIdQuery = function (root) {
    root.innerHTML = pageShell('会员ID查询',
      '<div class="filter-card" style="max-width:520px">' +
      '<div class="field"><label class="req">会员账号 / ID</label><input id="qid" placeholder="精确查询"></div>' +
      '<button class="btn btn-black" type="button" id="qgo">查询</button>' +
      '<div id="qres" style="margin-top:16px"></div></div>'
    );
    document.getElementById('qgo').onclick = function () {
      var id = document.getElementById('qid').value.trim();
      var m = S.findMember(S.load(), id);
      var box = document.getElementById('qres');
      if (!m) { box.innerHTML = '<p class="hint">未找到该会员</p>'; return; }
      box.innerHTML = '<div class="md-row"><span>账号</span><b>' + U.escapeHtml(m.account) + '</b></div>' +
        '<div class="md-row"><span>VIP</span><b>' + m.vip + '</b></div>' +
        '<div class="md-row"><span>层级</span><b>' + U.escapeHtml(m.tier) + '</b></div>' +
        '<div class="md-row"><span>状态</span><b>' + (m.status === 1 ? '正常' : '冻结') + '</b></div>' +
        '<div style="margin-top:10px"><a class="btn btn-black" href="#/memberDetail?id=' + encodeURIComponent(m.account) + '">打开会员详情</a></div>';
    };
  };

  var LAYER_META = {
    'Day2用户': { rule: '注册次日', remark: '分层活动示例' },
    'Day3用户': { rule: '注册第 3 日', remark: '分层活动示例' },
    'Day4用户': { rule: '注册第 4 日', remark: '分层活动示例' },
    '新客': { rule: '充值天数 0–2 天', remark: '注册默认' },
    '普通': { rule: '充值天数 3–14 天', remark: '' },
    'VIP高价值': { rule: '充值天数 ≥ 15 天', remark: '高价值' },
    'lalalal': { rule: '充值天数 ≥ 30 天', remark: '演示分组' },
    '观察': { rule: '人工分层', remark: '风控观察' }
  };

  function userLayerRows(d) {
    var names = {};
    (d.groups || []).forEach(function (g) { names[g.name] = 1; });
    (d.members || []).forEach(function (m) { if (m.tier) names[m.tier] = 1; });
    return Object.keys(names).map(function (name, i) {
      var meta = LAYER_META[name] || { rule: '人工分层', remark: '' };
      var counted = (d.members || []).filter(function (m) {
        return m.tier === name && m.status === 1 && !m.test;
      });
      return {
        id: 'UL' + i,
        name: name,
        rule: meta.rule,
        remark: meta.remark || '',
        count: counted.length
      };
    });
  }

  Pages.userLayer = function (root) {
    mountList(root, {
      title: '用户分层',
      filters: [{ key: 'name', label: '用户分层' }],
      extraBtn: '<button class="btn btn-secondary" type="button" data-export>导出</button>',
      head: ['用户分层', '分层规则', '备注', '会员人数', '操作'],
      rows: function (d, q) {
        return userLayerRows(d).filter(function (r) {
          return !q.name || r.name.indexOf(q.name) >= 0;
        });
      },
      rowHtml: function (r) {
        return '<tr><td>' + U.escapeHtml(r.name) + '</td><td>' + U.escapeHtml(r.rule) + '</td><td>' +
          U.escapeHtml(r.remark || '—') + '</td><td title="统计用户充值天数大于等于当前层级配置天数、小于下一层级配置天数，状态为“正常”，且非测试账户的会员">' +
          r.count + '</td><td class="col-ops sticky-r"><button class="op-link" type="button" data-mem="' +
          U.escapeHtml(r.name) + '">查看会员明细</button></td></tr>';
      },
      bind: function (root, d) {
        var ex = root.querySelector('[data-export]');
        if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示）'); };
        $$ (root, '[data-mem]').forEach(function (b) {
          b.onclick = function () {
            var name = b.getAttribute('data-mem');
            var layer = userLayerRows(d).filter(function (x) { return x.name === name; })[0];
            var mems = (d.members || []).filter(function (m) { return m.tier === name; });
            U.openDrawer('查看会员明细',
              arcoDesc([
                { label: '用户分层', value: name },
                { label: '分层规则', value: layer ? layer.rule : '—' },
                { label: '备注', value: layer && layer.remark ? layer.remark : '—' },
                { label: '会员人数', value: layer ? layer.count : 0 }
              ]) +
              '<div class="arco-search" style="margin-top:16px"><label>会员账户</label>' +
              '<input type="text" id="ulKw" placeholder="请输入会员账户">' +
              '<button class="btn btn-primary" type="button" id="ulSearch">搜索</button>' +
              '<button class="btn btn-secondary" type="button" id="ulReset">重置</button></div>' +
              '<div id="ulTable">' + memberMiniTable(mems) + '</div>',
              function () { U.closeDrawer(); },
              { mode: 'modal', wide: true, okText: '关闭', hideCancel: true }
            );
            function paintUl(kw) {
              var rows = mems.filter(function (m) { return !kw || m.account.indexOf(kw) >= 0; });
              document.getElementById('ulTable').innerHTML = memberMiniTable(rows);
              bindDrawerMemberLinks();
            }
            document.getElementById('ulSearch').onclick = function () {
              paintUl((document.getElementById('ulKw').value || '').trim());
            };
            document.getElementById('ulReset').onclick = function () {
              document.getElementById('ulKw').value = '';
              paintUl('');
            };
            bindDrawerMemberLinks();
          };
        });
      }
    });
  };

  var CATALOG_OPS = {
    activityBetWhitelist: { add: true, check: true, batch: true, row: ['删除'], addMode: 'whitelist' },
    activityClaimedStat: {
      row: ['详情'],
      navMap: {
        LossReversal: 'weekLossReport',
        DailyLossReversal: 'dailyLossReport',
        RakeBack: 'rakeBackLog',
        '周亏损返现': 'weekLossReport',
        '日亏损返现': 'dailyLossReport',
        '投注返水': 'rakeBackLog'
      }
    },
    channel: { add: true, row: ['编辑'] },
    channelNew: { row: ['编辑'] },
    gamePlatforms: { row: ['编辑'] },
    newsConfig: { row: ['编辑'] },
    withdrawPloy: { row: ['编辑'] },
    eventConfig: { row: ['详情', '编辑', '删除'] },
    sideMenuSetting: { add: true, row: ['编辑', '删除'] },
    topNavSetting: { add: true, row: ['编辑', '删除'] },
    behaviorLogs: { row: ['删除'] },
    dailyTask: { row: ['删除'] },
    electronicRecords: { row: ['删除'] },
    videoRecords: { row: ['删除'] },
    ndrpList: { add: true, check: true, batch: true, row: ['删除'] },
    playerChurnStatistics: { row: ['删除'] },
    playerInformationReport: { row: ['删除'] },
    topScores: { row: ['删除', '下载'] },
    lotteryActivityTasksAndRewardReport: { row: ['通过', '拒绝'] },
    lotteryRedEnvelopeRainReport: { row: ['详情'], detail: 'children' },
    moneyIsLikeRainReport: { row: ['详情'], detail: 'children' },
    moneyRainReport: { row: ['详情'], detail: 'children' },
    turntableReport: { row: ['详情'], detail: 'children' },
    riskActivityLog: { row: ['详情'] },
    topScoresLog: { row: ['详情'], detail: 'children' },
    groundPromotion: { add: true, row: ['复制'] },
    material: { add: true, row: ['复制'] },
    userLayer: { row: ['查看会员明细'], detail: 'members' },
    adv: { add: true, row: ['编辑', '删除'] },
    notice: { add: true, row: ['编辑', '删除'] },
    bonusTemplate: { add: true, row: ['编辑', '删除'] },
    tasks: { row: ['通过', '拒绝'] },
    appDistribution: { add: true, row: ['下载'] },
    financialConfig: { add: true, row: ['编辑', '删除'] },
    bonusConfig: { add: true, row: ['编辑', '删除'] },
    layer: { add: true, row: ['编辑', '删除'] },
    IllegalFundManagement: { add: true, row: ['查看', '编辑'] },
    homeConfig: { add: true, row: ['编辑'] },
    contactInfo: { add: true, row: ['编辑', '删除'] },
    partners: { add: true, row: ['编辑', '删除'] },
    baseSetting: { add: true, row: ['编辑'] },
    analogData: { add: true, row: ['编辑', '删除'] },
    telegramSet: { add: true, row: ['编辑'] },
    emailConfig: { add: true, row: ['编辑'] },
    betStationList: { add: true, row: ['编辑', '删除'] },
    securityLockMgt: { row: ['详情'] },
    memberExclusionMgt: { row: ['冻结'] },
    ops: { row: ['详情'] },
    agentstatistics: { row: ['详情'] },
    ggr: { row: ['详情'] }
  };

  var KNOWN_OPS = ['查看', '详情', '查看会员明细', '编辑', '删除', '审核', '通过', '拒绝', '复制', '下载', '冻结', '解冻'];

  function isOpCol(label, field) {
    var h = String(label || '');
    var f = String(field || '');
    return h === '操作' || h === 'operate' || f === 'operate' || f === 'operation';
  }

  function catalogCols(spec) {
    var heads = spec.head && spec.head.length ? spec.head.slice() : ['名称', '状态', '更新时间'];
    var fields = spec.fields && spec.fields.length ? spec.fields.slice() : [];
    var cols = [];
    heads.forEach(function (h, i) {
      if (isOpCol(h, fields[i])) return;
      var field = fields[i];
      if (!field) {
        if (h === '名称') field = 'name';
        else if (h === '状态') field = 'status';
        else if (h === '更新时间') field = 'at';
        else field = 'c' + i;
      }
      cols.push({ label: h, field: field });
    });
    if (!cols.length) {
      cols = [
        { label: '名称', field: 'name' },
        { label: '状态', field: 'status' },
        { label: '更新时间', field: 'at' }
      ];
    }
    return cols;
  }

  function inferCatalogOps(id, spec) {
    if (CATALOG_OPS[id]) return CATALOG_OPS[id];
    var row = [];
    (spec.actions || []).forEach(function (a) {
      var z = U.zh(a);
      if (KNOWN_OPS.indexOf(z) >= 0 && row.indexOf(z) < 0) row.push(z);
    });
    var title = spec.title || '';
    var hasOp = (spec.head || []).some(function (h) { return isOpCol(h); });
    var isReport = /报表|报告|统计|明细|日志|记录/.test(title) && !/白名单|配置|管理/.test(title);
    var isConfig = /配置|管理|策略|模板|白名单|公告|广告|菜单|渠道|分层|名单/.test(title);
    if (!row.length) {
      if (hasOp && isConfig) row = ['编辑', '删除'];
      else if (hasOp && isReport) row = ['详情'];
      else if (hasOp) row = ['查看', '编辑'];
      else row = ['查看'];
    }
    return {
      add: (!isReport && isConfig) || (spec.actions || []).indexOf('新增') >= 0,
      check: row.indexOf('删除') >= 0 && (spec.actions || []).indexOf('批量删除') >= 0,
      batch: (spec.actions || []).indexOf('批量删除') >= 0,
      row: row
    };
  }

  function seedCatalogRows(id, spec) {
    var cols = catalogCols(spec);
    var n = 8;
    return Array.apply(null, { length: n }).map(function (_, i) {
      var r = { _id: id + '_' + (i + 1) };
      cols.forEach(function (c) {
        r[c.field] = S.demoValue(U.zh(c.label), c.field, i, spec);
      });
      if (id === 'activityClaimedStat') {
        var types = ['周亏损返现', '日亏损返现', '投注返水'];
        r.type = types[i % 3];
        r.date = S.DEMO.dates[i % S.DEMO.dates.length];
        r.time_range = r.date + ' ~ ' + r.date;
        r.dispatch_user = String(18 + i * 3);
        r.dispatch_money = (860 + i * 140).toFixed(2);
        r.receive_user = String(11 + i * 2);
        r.receive_money = (520 + i * 90).toFixed(2);
        r.not_receive_user = String(7 - (i % 4));
        r.not_receive_money = (280 + i * 20).toFixed(2);
      }
      if (id === 'taskDailyTask') {
        var seeded = (S.load().dailyTasks || [])[i];
        if (seeded) {
          Object.keys(seeded).forEach(function (k) { r[k] = seeded[k]; });
        }
      }
      if (id === 'taskDailyTaskReport') {
        r.period = '2026W3' + (3 + i % 4);
        r.task_name = ['电子满额礼', '视讯局数礼', '体育投注礼', '每日登录礼'][i % 4];
        r.game_type = S.DEMO.gameTypes[i % S.DEMO.gameTypes.length];
        r.claim_num = String(12 + i * 3);
        r.total_amount = (86 + i * 24).toFixed(2);
        r.claim_time = S.DEMO.times[i % S.DEMO.times.length];
        r.active_point = String(10 + i * 5);
        r.amount = (8 + i * 4).toFixed(2);
      }
      if (id === 'activityBetWhitelist') {
        r.username = S.DEMO.accounts[i % S.DEMO.accounts.length];
        r.mobile = ['13488884423', '9175552201', '9183330091', '9192224410', '9201111188', '9210000000', '9223333310', '9237777741'][i % 8];
        r.real_name = S.DEMO.nicks[i % S.DEMO.nicks.length];
      }
      return r;
    });
  }

  function loadCatalogRows(id, spec, d) {
    d.catalog = d.catalog || {};
    if (d.catalogVer !== S.CATALOG_SEED_VER) {
      d.catalog = {};
      d.catalogVer = S.CATALOG_SEED_VER;
      S.save(d);
    }
    if (!d.catalog[id] || !d.catalog[id].length) {
      d.catalog[id] = seedCatalogRows(id, spec);
      S.save(d);
    }
    return d.catalog[id];
  }

  function catalogDemoToast(spec, msg) {
    var money = /资金|充值|提款|入款|打款/.test((spec.group || '') + (spec.title || ''));
    U.toast(msg + (money ? '（演示，不产生真实资金）' : '（演示，不改正式数据）'));
  }

  function catalogViewHtml(spec, row, extraHtml) {
    var cols = catalogCols(spec);
    return arcoDesc(cols.map(function (c) {
      return { label: U.zh(c.label), value: row && row[c.field] != null ? row[c.field] : '—' };
    })) + (extraHtml || '');
  }

  function catalogFormHtml(spec, row, mode) {
    var cols = catalogCols(spec);
    var ro = mode === 'view';
    return arcoFields(cols.map(function (c) {
      return {
        key: c.field,
        id: 'cf_' + c.field,
        label: U.zh(c.label),
        value: row && row[c.field] != null ? row[c.field] : '',
        ro: ro
      };
    }));
  }

  function readCatalogForm() {
    var out = {};
    $$ (document, '#drawerBody [data-cf]').forEach(function (el) {
      out[el.getAttribute('data-cf')] = el.value;
    });
    return out;
  }

  function findCatalogRow(rows, id) {
    return (rows || []).filter(function (r) { return String(r._id) === String(id); })[0];
  }

  function catalogPage(id) {
    var spec = (global.AdminCatalog || {})[id];
    if (!spec) return null;
    if (spec.kind === 'form') {
      return function (root) {
        var fields = spec.formFields && spec.formFields.length ? spec.formFields : [{ key: 'kw', label: '关键字' }];
        var acts = (spec.actions || []).filter(function (a) { return a.length <= 8; }).slice(0, 4);
        root.innerHTML = pageShell(U.zh(spec.title),
          '<p class="page-tip">对照 UAT「' + spec.title + '」。表单字段来自线上源码；提交仅演示，不产生真实资金。</p>' +
          '<div class="filter-card" style="max-width:640px">' +
          fields.map(function (f, i) {
            return '<div class="field"><label>' + U.escapeHtml(U.zh(f.label)) + '</label><input data-ff="' + i + '" placeholder="' + U.escapeHtml(U.zh(f.label)) + '"></div>';
          }).join('') +
          '<p class="hint">演示环境不会调用正式接口。</p>' +
          '<button class="btn btn-black" type="button" data-submit>提交</button> ' +
          acts.map(function (a) { return '<button class="btn btn-ghost" type="button" data-act>' + U.escapeHtml(U.zh(a)) + '</button>'; }).join(' ') +
          '</div>'
        );
        var sub = root.querySelector('[data-submit]');
        if (sub) sub.onclick = function () { U.confirm('确认提交「' + spec.title + '」？演示不产生真实资金。').then(function (ok) { if (ok) U.toast('已提交（演示，不产生真实资金）'); }); };
        $$ (root, '[data-act]').forEach(function (b) {
          b.onclick = function () {
            var name = b.textContent;
            if (name === '编辑') {
              U.openDrawer('编辑', catalogFormHtml(spec, {}, 'edit'), function () {
                U.closeDrawer();
                catalogDemoToast(spec, '已保存');
              });
              return;
            }
            U.toast(name + '（演示）');
          };
        });
      };
    }
    return function (root) {
      var filters = spec.filters && spec.filters.length ? spec.filters.slice(0, 8) : [{ key: 'kw', label: '关键字' }];
      var cols = catalogCols(spec);
      var ops = inferCatalogOps(id, spec);
      var head = [];
      if (ops.check) head.push('<input type="checkbox" data-check-all>');
      cols.forEach(function (c) { head.push(U.zh(c.label)); });
      head.push('操作');
      var bar = '';
      if (ops.add) bar += '<button class="btn btn-primary" type="button" data-add>新增</button>';
      if (ops.batch) bar += '<button class="btn btn-danger" type="button" data-batch-del>批量删除</button>';
      mountList(root, {
        title: U.zh(spec.title),
        filters: filters.map(function (f) { return { key: f.key, label: U.zh(f.label), type: f.type, placeholder: f.placeholder }; }),
        extraBtn: '<button class="btn btn-secondary" type="button" data-export>导出</button>',
        toolbar: bar,
        head: head,
        rows: function (d, q) {
          if (d.demo.empty) return [];
          var rows = loadCatalogRows(id, spec, d);
          return rows.filter(function (r) {
            return Object.keys(q || {}).every(function (k) {
              if (!q[k]) return true;
              var v = r[k];
              if (v == null) return JSON.stringify(r).indexOf(q[k]) >= 0;
              return String(v).indexOf(q[k]) >= 0;
            });
          });
        },
        rowHtml: function (r) {
          var check = ops.check
            ? '<td class="col-check sticky-l"><input type="checkbox" data-id="' + U.escapeHtml(r._id) + '"></td>'
            : '';
          var cells = cols.map(function (c) {
            var v = r[c.field];
            if (c.label === '状态' || c.field === 'status') return '<td>' + U.badgeStatus(r.status != null ? r.status : v) + '</td>';
            if (c.label === '会员账户' || c.label === '用户账户' || c.field === 'username' || c.field === 'game_user') {
              return '<td><button class="op-link acc-link" type="button" data-member="' + U.escapeHtml(v) + '">' + U.escapeHtml(v) + '</button></td>';
            }
            return '<td>' + U.escapeHtml(v == null ? '' : v) + '</td>';
          }).join('');
          var btns = (ops.row || ['查看']).map(function (op) {
            var danger = op === '删除' || op === '拒绝' ? ' danger' : '';
            return '<button class="op-link' + danger + '" type="button" data-op="' + U.escapeHtml(op) + '" data-id="' + U.escapeHtml(r._id) + '">' + U.escapeHtml(op) + '</button>';
          }).join('');
          return '<tr>' + check + cells + '<td class="col-ops sticky-r">' + btns + '</td></tr>';
        },
        bind: function (root, d, redraw) {
          function persist(rows) {
            var data = S.load();
            data.catalog = data.catalog || {};
            data.catalog[id] = rows;
            S.save(data);
          }
          function allRows() {
            return loadCatalogRows(id, spec, S.load());
          }
          function selectedIds() {
            return $$ (root, 'tbody [data-id]:checked').map(function (el) { return el.getAttribute('data-id'); });
          }
          function relatedMembers(row) {
            var d = S.load();
            var acc = row.username || row.user_name || row.game_user || row.account;
            if (acc) {
              var one = (d.members || []).filter(function (m) { return m.account === acc; });
              if (one.length) return one;
            }
            var name = row.name || row.type;
            if (name) {
              var byTier = (d.members || []).filter(function (m) { return m.tier === name; });
              if (byTier.length) return byTier;
            }
            return (d.members || []).slice(0, 3);
          }
          function openView(row) {
            var extra = '';
            if (ops.detail === 'members' || ops.detail === 'children') {
              extra = '<h4 class="drawer-sub" style="margin-top:16px">明细</h4>' + memberMiniTable(relatedMembers(row));
            }
            var isTable = ops.detail === 'members' || ops.detail === 'children';
            U.openDrawer(isTable ? '查看' : '查看', catalogViewHtml(spec, row, extra), function () { U.closeDrawer(); }, {
              mode: isTable ? 'modal' : 'drawer',
              wide: isTable,
              okText: '关闭',
              hideCancel: true
            });
            bindDrawerMemberLinks();
          }
          function openEdit(row, isAdd) {
            if (ops.addMode === 'whitelist' && isAdd) {
              U.openDrawer('新增',
                arcoFields([
                  { id: 'wlUser', label: '会员账户', ph: '请输入会员账户', extra: '与手机号码必须填一项；多个用英文逗号分隔，最多 20 个。' },
                  { id: 'wlMobile', label: '手机号码', ph: '请输入手机号码' }
                ]),
                function () {
                  var user = (document.getElementById('wlUser').value || '').trim();
                  var mobile = (document.getElementById('wlMobile').value || '').trim();
                  if (!user && !mobile) { U.toast('会员账户与手机号码必须填一项', 'err'); return; }
                  var userN = user ? user.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
                  var mobN = mobile ? mobile.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [];
                  if (userN.length > 20 || mobN.length > 20) { U.toast('单次最多新增 20 条', 'err'); return; }
                  var rows = allRows();
                  var nicks = { wjfytn329022: 'wjfytn329022', Zipper123: 'Zipper', maria_ph: 'Maria' };
                  var items = userN.length ? userN.map(function (u) { return { username: u, mobile: '', real_name: nicks[u] || u }; })
                    : mobN.map(function (m) { return { username: '', mobile: m, real_name: '—' }; });
                  items.forEach(function (it) {
                    rows.unshift({ _id: S.nextId('WL'), username: it.username, mobile: it.mobile, real_name: it.real_name });
                  });
                  persist(rows);
                  U.closeDrawer();
                  catalogDemoToast(spec, '已新增 ' + items.length + ' 条');
                  redraw();
                });
              var uEl = document.getElementById('wlUser');
              var mEl = document.getElementById('wlMobile');
              function syncWl() {
                mEl.disabled = !!uEl.value.trim();
                uEl.disabled = !!mEl.value.trim();
              }
              uEl.oninput = syncWl;
              mEl.oninput = syncWl;
              return;
            }
            U.openDrawer(isAdd ? '新增' : '编辑', catalogFormHtml(spec, row || {}, isAdd ? 'add' : 'edit'), function () {
              var vals = readCatalogForm();
              var rows = allRows();
              if (isAdd) {
                vals._id = S.nextId('C');
                rows.unshift(vals);
                persist(rows);
                U.closeDrawer();
                catalogDemoToast(spec, '已新增');
                redraw();
                return;
              }
              var cur = findCatalogRow(rows, row._id);
              if (cur) Object.keys(vals).forEach(function (k) { cur[k] = vals[k]; });
              persist(rows);
              U.closeDrawer();
              catalogDemoToast(spec, '已保存');
              redraw();
            });
          }
          function removeIds(ids) {
            if (!ids.length) { U.toast('请先勾选数据', 'err'); return; }
            U.confirm(ids.length > 1 ? ('确认删除已选 ' + ids.length + ' 条？演示环境不改正式数据。') : '确认删除该条记录？演示环境不改正式数据。').then(function (ok) {
              if (!ok) return;
              persist(allRows().filter(function (r) { return ids.indexOf(String(r._id)) < 0; }));
              catalogDemoToast(spec, '已删除');
              redraw();
            });
          }
          var ex = root.querySelector('[data-export]');
          if (ex) ex.onclick = function () { U.toast('已按当前筛选生成导出任务（演示）'); };
          var add = root.querySelector('[data-add]');
          if (add) add.onclick = function () { openEdit(null, true); };
          var batch = root.querySelector('[data-batch-del]');
          if (batch) batch.onclick = function () { removeIds(selectedIds()); };
          var all = root.querySelector('[data-check-all]');
          if (all) all.onchange = function () {
            $$ (root, 'tbody [data-id]').forEach(function (el) { el.checked = all.checked; });
          };
          $$ (root, '[data-member]').forEach(function (b) {
            b.onclick = function () {
              location.hash = '#/memberDetail?id=' + encodeURIComponent(b.getAttribute('data-member'));
            };
          });
          $$ (root, '[data-op]').forEach(function (b) {
            b.onclick = function () {
              var op = b.getAttribute('data-op');
              var row = findCatalogRow(allRows(), b.getAttribute('data-id'));
              if (!row) return;
              if (op === '查看' || op === '详情' || op === '审核' || op === '查看会员明细') {
                if (ops.navMap) {
                  var dest = ops.navMap[row.type] || ops.navMap[row.name];
                  if (dest) { location.hash = '#/' + dest; return; }
                }
                openView(row);
                return;
              }
              if (op === '编辑') { openEdit(row, false); return; }
              if (op === '删除') { removeIds([String(row._id)]); return; }
              if (op === '复制') {
                var copy = JSON.parse(JSON.stringify(row));
                copy._id = S.nextId('C');
                var rows = allRows();
                rows.unshift(copy);
                persist(rows);
                catalogDemoToast(spec, '已复制');
                redraw();
                return;
              }
              if (op === '下载') { U.toast('已生成下载任务（演示）'); return; }
              if (op === '通过' || op === '拒绝' || op === '冻结' || op === '解冻') {
                var next = op === '通过' ? '已通过' : (op === '拒绝' ? '已拒绝' : (op === '冻结' ? '冻结' : '开启'));
                U.confirm('确认' + op + '？演示环境不改正式数据。').then(function (ok) {
                  if (!ok) return;
                  var list = allRows();
                  var cur = findCatalogRow(list, row._id);
                  if (cur) cur.status = next;
                  persist(list);
                  catalogDemoToast(spec, '已' + op);
                  redraw();
                });
              }
            };
          });
        }
      });
    };
  }

  function ico(name) {
    if (name === 'export') return '<svg class="ico-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M4 19h16"/></svg>';
    if (name === 'search') return '<svg class="ico-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/></svg>';
    if (name === 'trash') return '<svg class="ico-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M9 7V5h6v2M8 7l1 12h6l1-12"/></svg>';
    if (name === 'edit') return '<svg class="ico-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20h4l10.5-10.5-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>';
    if (name === 'plus') return '<svg class="ico-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>';
    if (name === 'refresh') return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-2.2-5.8"/><path d="M21 4v6h-6"/></svg>';
    if (name === 'print') return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V4h12v5"/><rect x="6" y="13" width="12" height="7"/><path d="M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/></svg>';
    if (name === 'gear') return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
    return '';
  }

  function gameTypeName(id) {
    var t = (S.DAILY_GAME_TYPES || []).filter(function (x) { return String(x.id) === String(id); })[0];
    return t ? t.name : '';
  }

  function dailyTaskFormHtml(row, lockType) {
    var types = S.DAILY_GAME_TYPES || [];
    var typeVal = row ? row.game_type_id : (lockType || '');
    var typeDisabled = !!(row || lockType);
    var st = row ? Number(row.status) : 1;
    return arcoFields([
      { id: 'dtName', key: 'name', label: '任务名称', req: true, value: row ? row.name : '', ph: '请输入任务名称' },
      { id: 'dtShow', key: 'show_name', label: '客户展示名称', req: true, value: row ? row.show_name : '', ph: '请输入客户展示名称' },
      {
        id: 'dtType', key: 'game_type_id', label: '游戏类型', req: true,
        html: '<select id="dtType"' + (typeDisabled ? ' disabled' : '') + '>' +
          '<option value="">请选择游戏类型</option>' +
          types.map(function (t) {
            return '<option value="' + t.id + '"' + (String(typeVal) === String(t.id) ? ' selected' : '') + '>' + U.escapeHtml(t.name) + '</option>';
          }).join('') + '</select>'
      },
      {
        id: 'dtCond', label: '完成条件', req: true,
        html: '<div class="radio-line"><label><input type="radio" name="dtCond" value="1" checked disabled> 押注</label></div>'
      },
      {
        id: 'dtStatus', label: '状态', req: true,
        html: U.switchBtn(st === 1, 'dtStatus') + '<input type="hidden" id="dtStatus" value="' + st + '">'
      }
    ]) +
      '<div class="form-sec">每日任务奖励配置</div>' +
      arcoFields([
        { id: 'dtBet', key: 'target_value', label: '投注金额', req: true, html: '<input type="number" id="dtBet" min="1" max="999999" step="0.01" value="' + (row ? row.target_value : '') + '" placeholder="请输入投注金额">' },
        { id: 'dtPoint', key: 'active_point', label: '活跃度奖励', req: true, html: '<input type="number" id="dtPoint" min="1" max="999999" step="0.01" value="' + (row ? row.active_point : '') + '" placeholder="请输入活跃度奖励">' },
        { id: 'dtAmt', key: 'amount', label: '真金奖励', req: true, html: '<input type="number" id="dtAmt" min="1" max="999999" step="0.01" value="' + (row ? row.amount : '') + '" placeholder="请输入真金奖励">' },
        {
          id: 'dtWater', label: '流水倍数', req: true,
          html: '<div class="num-step"><button type="button" data-step="-">−</button>' +
            '<input type="number" id="dtWater" min="0" step="1" value="' + (row ? row.water_rate : 1) + '">' +
            '<button type="button" data-step="+">+</button></div>'
        },
        { id: 'dtDesc', key: 'desc', label: '任务说明', req: true, html: '<textarea id="dtDesc" maxlength="200" placeholder="请输入任务说明">' + U.escapeHtml(row ? (row.desc || '') : '') + '</textarea>' }
      ]);
  }

  function bindDailyTaskForm() {
    var sw = document.querySelector('#drawerBody [data-sw="dtStatus"]');
    var hid = document.getElementById('dtStatus');
    if (sw && hid) {
      sw.onclick = function () {
        var on = hid.value !== '1';
        hid.value = on ? '1' : '0';
        sw.classList.toggle('on', on);
      };
    }
    $$ (document.getElementById('drawerBody'), '[data-step]').forEach(function (b) {
      b.onclick = function () {
        var inp = document.getElementById('dtWater');
        var n = Number(inp.value || 0);
        inp.value = String(Math.max(0, n + (b.getAttribute('data-step') === '+' ? 1 : -1)));
      };
    });
  }

  function readDailyTaskForm() {
    var typeEl = document.getElementById('dtType');
    var typeId = typeEl ? typeEl.value : '';
    return {
      name: (document.getElementById('dtName').value || '').trim(),
      show_name: (document.getElementById('dtShow').value || '').trim(),
      game_type_id: typeId,
      game_type: gameTypeName(typeId),
      condition_type: 1,
      status: Number(document.getElementById('dtStatus').value || 1),
      target_value: document.getElementById('dtBet').value,
      active_point: document.getElementById('dtPoint').value,
      amount: document.getElementById('dtAmt').value,
      water_rate: document.getElementById('dtWater').value,
      desc: (document.getElementById('dtDesc').value || '').trim()
    };
  }

  function validDailyTask(v) {
    if (!v.name) return '任务名称不能为空';
    if (!v.show_name) return '客户展示名称不能为空';
    if (!v.game_type_id) return '游戏类型不能为空';
    var bet = Number(v.target_value);
    var pt = Number(v.active_point);
    var amt = Number(v.amount);
    var wr = Number(v.water_rate);
    if (!(bet >= 1 && bet <= 999999)) return '请输入 1～999999 的投注金额';
    if (!(pt >= 1 && pt <= 999999)) return '请输入 1～999999 的活跃度奖励';
    if (!(amt >= 1 && amt <= 999999)) return '请输入 1～999999 的真金奖励';
    if (v.water_rate === '' || isNaN(wr) || wr < 0) return '流水倍数不能为空';
    if (!v.desc) return '任务说明不能为空';
    if (v.desc.length > 200) return '任务说明最多 200 字';
    return '';
  }

  function nextDailyTaskId(rows, typeId) {
    var prefix = String(typeId || '50');
    var max = 0;
    (rows || []).forEach(function (r) {
      var s = String(r.id || '');
      if (s.indexOf(prefix) === 0) {
        var n = Number(s.slice(prefix.length));
        if (n > max) max = n;
      }
    });
    return prefix + String(max + 1).padStart(4, '0');
  }

  Pages.taskDailyTask = function (root) {
    var state = { page: 1, size: 30, q: { name: '', status: '-1', game_type_id: '' } };

    function persist(rows, base) {
      var d = S.load();
      if (rows) d.dailyTasks = rows;
      if (base) d.dailyTaskBase = base;
      S.save(d);
    }

    function filtered(d) {
      return (d.dailyTasks || []).filter(function (r) {
        if (state.q.name && String(r.name).indexOf(state.q.name) < 0) return false;
        if (state.q.status !== '' && state.q.status !== '-1' && String(r.status) !== String(state.q.status)) return false;
        if (state.q.game_type_id && String(r.game_type_id) !== String(state.q.game_type_id)) return false;
        return true;
      });
    }

    function openForm(row) {
      U.openDrawer(row ? '编辑' : '新增每日任务', dailyTaskFormHtml(row, row ? '' : state.q.game_type_id), function () {
        var vals = readDailyTaskForm();
        var err = validDailyTask(vals);
        if (err) { U.toast(err, 'err'); return; }
        var d = S.load();
        var rows = d.dailyTasks || [];
        if (row) {
          var cur = rows.filter(function (x) { return x._id === row._id; })[0];
          if (cur) {
            Object.keys(vals).forEach(function (k) { cur[k] = vals[k]; });
            if (vals.target_value) cur.target_value = Number(vals.target_value);
            if (vals.active_point) cur.active_point = Number(vals.active_point);
            if (vals.amount) cur.amount = Number(vals.amount);
            cur.water_rate = Number(vals.water_rate);
          }
          persist(rows);
          U.closeDrawer();
          U.toast('已保存（演示，不改正式数据）');
        } else {
          vals._id = S.nextId('DT');
          vals.id = nextDailyTaskId(rows, vals.game_type_id);
          vals.target_value = Number(vals.target_value);
          vals.active_point = Number(vals.active_point);
          vals.amount = Number(vals.amount);
          vals.water_rate = Number(vals.water_rate);
          rows.unshift(vals);
          persist(rows);
          U.closeDrawer();
          U.toast('已新增（演示，不改正式数据）');
        }
        draw();
      }, { mode: 'modal' });
      bindDailyTaskForm();
    }

    function openActivity() {
      var d = S.load();
      var cfg = JSON.parse(JSON.stringify(d.dailyTaskBase || { reset_time: '00:00:00', water_rate: 1, config: [] }));
      function paintRows() {
        var box = document.getElementById('actCfgBody');
        if (!box) return;
        var seen = {};
        var dups = {};
        (cfg.config || []).forEach(function (c) {
          if (c.active_point == null || c.active_point === '') return;
          var k = String(c.active_point);
          if (seen[k]) dups[k] = 1;
          else seen[k] = 1;
        });
        box.innerHTML = (cfg.config || []).map(function (c, i) {
          return '<tr><td><input data-an="' + i + '" maxlength="200" placeholder="请输入" value="' + U.escapeHtml(c.active_name || '') + '"></td>' +
            '<td><input data-ap="' + i + '" type="number" min="1" max="999999" placeholder="请输入" class="' + (dups[String(c.active_point)] ? 'dup' : '') + '" value="' + (c.active_point == null ? '' : c.active_point) + '"></td>' +
            '<td><input data-am="' + i + '" type="number" min="1" max="999999" placeholder="请输入" value="' + (c.amount == null ? '' : c.amount) + '"></td>' +
            '<td><button class="btn btn-danger" type="button" data-del-cfg="' + i + '">删除</button></td></tr>';
        }).join('') || '<tr><td class="empty" colspan="4">暂无数据，请先新增</td></tr>';
        $$ (box, '[data-an]').forEach(function (el) {
          el.oninput = function () { cfg.config[Number(el.getAttribute('data-an'))].active_name = el.value; };
        });
        $$ (box, '[data-ap]').forEach(function (el) {
          el.oninput = function () { cfg.config[Number(el.getAttribute('data-ap'))].active_point = el.value === '' ? '' : Number(el.value); paintRows(); };
        });
        $$ (box, '[data-am]').forEach(function (el) {
          el.oninput = function () { cfg.config[Number(el.getAttribute('data-am'))].amount = el.value === '' ? '' : Number(el.value); };
        });
        $$ (box, '[data-del-cfg]').forEach(function (b) {
          b.onclick = function () {
            cfg.config.splice(Number(b.getAttribute('data-del-cfg')), 1);
            paintRows();
          };
        });
      }
      U.openDrawer('活跃度配置',
        '<div class="act-cfg-bar"><button class="btn btn-primary" type="button" id="actAdd">' + ico('plus') + '新增</button></div>' +
        '<table class="act-cfg-table"><thead><tr><th>活跃度名称</th><th>达标活跃度</th><th>真金奖励</th><th>操作</th></tr></thead><tbody id="actCfgBody"></tbody></table>' +
        '<div class="form-item" style="display:flex;align-items:center;gap:8px"><label class="req">流水倍数</label>' +
        '<div class="num-step"><button type="button" data-step="-">−</button>' +
        '<input type="number" id="actWater" min="0" step="1" value="' + (cfg.water_rate == null ? 1 : cfg.water_rate) + '">' +
        '<button type="button" data-step="+">+</button></div></div>',
        function () {
          cfg.water_rate = document.getElementById('actWater').value;
          if (!(cfg.config || []).length) { U.toast('活跃度配置不能为空', 'err'); return; }
          var ok = cfg.config.every(function (c) { return c.active_name && c.active_point; });
          if (!ok) { U.toast('活跃度配置参数错误', 'err'); return; }
          var pts = cfg.config.map(function (c) { return String(c.active_point); });
          if (new Set(pts).size !== pts.length) { U.toast('达标活跃度不可重复', 'err'); return; }
          if (cfg.water_rate === '' || cfg.water_rate == null) { U.toast('流水倍数不能为空', 'err'); return; }
          cfg.water_rate = Number(cfg.water_rate);
          var cur = S.load();
          cfg.reset_time = (cur.dailyTaskBase && cur.dailyTaskBase.reset_time) || '00:00:00';
          persist(null, cfg);
          U.closeDrawer();
          U.toast('已保存（演示，不改正式数据）');
          draw();
        },
        { mode: 'modal', wide: true }
      );
      paintRows();
      var add = document.getElementById('actAdd');
      if (add) add.onclick = function () {
        cfg.config.push({ active_name: '', active_point: '', amount: '' });
        paintRows();
      };
      $$ (document.getElementById('drawerBody'), '[data-step]').forEach(function (b) {
        b.onclick = function () {
          var inp = document.getElementById('actWater');
          var n = Number(inp.value || 0);
          inp.value = String(Math.max(0, n + (b.getAttribute('data-step') === '+' ? 1 : -1)));
        };
      });
    }

    function draw() {
      delayed(function (err) {
        if (err) {
          root.innerHTML = pageShell('每日任务配置', failBlock());
          var btn = root.querySelector('[data-retry]');
          if (btn) btn.onclick = draw;
          return;
        }
        var d = S.load();
        var rows = d.demo.empty ? [] : filtered(d);
        var pageRows = U.slicePage(rows, state);
        var base = d.dailyTaskBase || { reset_time: '00:00:00' };
        var genres = (S.DAILY_GAME_TYPES || []).map(function (t) {
          return '<button type="button" data-genre="' + t.id + '"' + (String(state.q.game_type_id) === String(t.id) ? ' class="on"' : '') + '>' + U.escapeHtml(t.name) + '</button>';
        }).join('') +
          '<button type="button" data-genre=""' + (!state.q.game_type_id ? ' class="on"' : '') + '>所有游戏分类</button>';
        var body = pageRows.length ? pageRows.map(function (r) {
          return '<tr><td>' + U.escapeHtml(r.id) + '</td><td>' + U.escapeHtml(r.name) + '</td><td>' + U.escapeHtml(r.show_name) +
            '</td><td>' + U.escapeHtml(r.game_type || gameTypeName(r.game_type_id)) + '</td><td>押注</td><td>' +
            (Number(r.status) === 1 ? '显示' : '隐藏') + '</td><td>' + r.target_value + '</td><td>' + r.active_point +
            '</td><td>' + r.amount + '</td><td class="col-ops sticky-r">' +
            '<button class="op-link" type="button" data-ed="' + r._id + '">' + ico('edit') + '编辑</button>' +
            '<button class="op-link danger" type="button" data-del="' + r._id + '">' + ico('trash') + '删除</button></td></tr>';
        }).join('') : emptyRow(10);
        root.innerHTML = pageShell('每日任务配置',
          '<div class="dt-page">' +
          '<div class="dt-filter"><div class="dt-filter-left">' +
          '<label class="fg"><span>任务名称</span><input type="text" data-f="name" placeholder="请输入任务名称"></label>' +
          '<label class="fg"><span>状态</span><select data-f="status">' +
          '<option value="-1">全部</option><option value="1">显示</option><option value="0">隐藏</option></select></label>' +
          '<div class="dt-acts"><button class="btn btn-primary" type="button" data-search>' + ico('search') + '搜索</button>' +
          '<button class="btn btn-secondary" type="button" data-reset>' + ico('trash') + '重置</button></div></div>' +
          '<div class="dt-filter-right"><button class="btn btn-black" type="button" data-act-cfg>活跃度配置</button>' +
          '<label class="fg"><span>活跃度每日重置时间</span><input type="time" step="1" data-reset-time value="' +
          U.escapeHtml(base.reset_time || '00:00:00') + '"></label></div></div>' +
          '<div class="dt-genres">' + genres + '</div>' +
          '<div class="table-bar"><div class="toolbar-left"><button class="btn btn-black" type="button" data-add">' + ico('plus') + '新增每日任务</button></div>' +
          '<div class="table-tools"><button type="button" data-tool="refresh" title="刷新">' + ico('refresh') + '</button>' +
          '<button type="button" data-tool="search" title="搜索">' + ico('search') + '</button>' +
          '<button type="button" data-tool="print" title="打印">' + ico('print') + '</button>' +
          '<button type="button" data-tool="cols" title="列设置">' + ico('gear') + '</button></div></div>' +
          tableWrap(['任务ID', '任务名称', '客户展示名称', '游戏类型', '完成条件', '状态', '投注金额', '活跃度奖励', '真金奖励', '操作'], body, 1100) +
          U.pagerHtml(state.page, state.size, rows.length) +
          '</div>'
        );
        setFilters(root, state.q);
        var search = root.querySelector('[data-search]');
        if (search) search.onclick = function () {
          state.q.name = (root.querySelector('[data-f="name"]').value || '').trim();
          state.q.status = root.querySelector('[data-f="status"]').value;
          state.page = 1;
          draw();
        };
        var reset = root.querySelector('[data-reset]');
        if (reset) reset.onclick = function () {
          state.q = { name: '', status: '-1', game_type_id: state.q.game_type_id };
          state.page = 1;
          draw();
        };
        $$ (root, '[data-genre]').forEach(function (b) {
          b.onclick = function () {
            state.q.game_type_id = b.getAttribute('data-genre') || '';
            state.page = 1;
            draw();
          };
        });
        var add = root.querySelector('[data-add]');
        if (add) add.onclick = function () { openForm(null); };
        var act = root.querySelector('[data-act-cfg]');
        if (act) act.onclick = openActivity;
        var timeEl = root.querySelector('[data-reset-time]');
        if (timeEl) {
          timeEl.onchange = function () {
            var cur = S.load();
            var base2 = cur.dailyTaskBase || defaultBaseSafe();
            base2.reset_time = timeEl.value || '00:00:00';
            persist(null, base2);
            U.toast('已更新活跃度每日重置时间（演示）');
          };
        }
        $$ (root, '[data-ed]').forEach(function (b) {
          b.onclick = function () {
            var row = (S.load().dailyTasks || []).filter(function (x) { return x._id === b.getAttribute('data-ed'); })[0];
            if (row) openForm(row);
          };
        });
        $$ (root, '[data-del]').forEach(function (b) {
          b.onclick = function () {
            U.confirm('确认删除该条记录？演示环境不改正式数据。').then(function (ok) {
              if (!ok) return;
              persist((S.load().dailyTasks || []).filter(function (x) { return x._id !== b.getAttribute('data-del'); }));
              U.toast('已删除（演示，不改正式数据）');
              draw();
            });
          };
        });
        $$ (root, '[data-tool]').forEach(function (b) {
          b.onclick = function () {
            var t = b.getAttribute('data-tool');
            if (t === 'refresh') draw();
            else if (t === 'search') { var inp = root.querySelector('[data-f="name"]'); if (inp) inp.focus(); }
            else U.toast('演示环境不调用正式打印 / 列设置');
          };
        });
        U.bindPager(root, state, draw);
      });
    }

    function defaultBaseSafe() {
      return { reset_time: '00:00:00', water_rate: 1, config: [] };
    }

    draw();
  };

  Pages.taskDailyTaskReport = function (root) {
    mountList(root, {
      title: '每日任务报表',
      filters: [
        { key: 'date', label: '日期', type: 'daterange' },
        { key: 'game_type_id', label: '游戏类型', type: 'select', options: [{ id: '', label: '全部' }].concat((S.DAILY_GAME_TYPES || []).map(function (t) { return { id: t.id, label: t.name }; })) },
        { key: 'task_type', label: '任务类型', type: 'select', options: [{ id: '', label: '全部' }, { id: '1', label: '任务' }, { id: '2', label: '活跃度' }] }
      ],
      head: ['期数', '名称', '游戏类型', '赠送人数', '总领取金额', '领取时间', '活跃度奖励', '真金奖励'],
      rows: function (d, q) {
        return (d.dailyTaskReports || []).filter(function (r) {
          if (q.dateFrom && String(r.claim_time || '').slice(0, 10) < q.dateFrom) return false;
          if (q.dateTo && String(r.claim_time || '').slice(0, 10) > q.dateTo) return false;
          if (q.game_type_id && String(r.game_type_id) !== String(q.game_type_id)) return false;
          if (q.task_type && String(r.task_type) !== String(q.task_type)) return false;
          return true;
        });
      },
      rowHtml: function (r) {
        return '<tr><td>' + U.escapeHtml(r.period) + '</td><td>' + U.escapeHtml(r.task_name) + '</td><td>' +
          U.escapeHtml(r.game_type || '—') + '</td><td><button class="op-link acc-link" type="button" data-claim="' +
          U.escapeHtml(r._id) + '">' + r.claim_num + '</button></td><td>' + Number(r.total_amount).toFixed(2) +
          '</td><td>' + U.escapeHtml(r.claim_time) + '</td><td>' + r.active_point + '</td><td>' + r.amount + '</td></tr>';
      },
      bind: function (root, d) {
        $$ (root, '[data-claim]').forEach(function (b) {
          b.onclick = function () {
            var row = (d.dailyTaskReports || []).filter(function (x) { return x._id === b.getAttribute('data-claim'); })[0];
            if (!row) return;
            var mems = (d.members || []).slice(0, Math.min(8, Number(row.claim_num) || 3));
            U.openDrawer('领取明细',
              arcoDesc([
                { label: '期数', value: row.period },
                { label: '名称', value: row.task_name },
                { label: '游戏类型', value: row.game_type || '—' },
                { label: '赠送人数', value: row.claim_num },
                { label: '总领取金额', value: Number(row.total_amount).toFixed(2) },
                { label: '领取时间', value: row.claim_time }
              ]) +
              '<h4 class="drawer-sub" style="margin-top:16px">领取会员</h4>' +
              '<div class="table-wrap"><table class="list-table"><thead><tr><th>会员账户</th><th>活跃度奖励</th><th>真金奖励</th><th>领取时间</th></tr></thead><tbody>' +
              mems.map(function (m, i) {
                return '<tr><td><button class="op-link acc-link" type="button" data-go-member="' + U.escapeHtml(m.account) + '">' +
                  U.escapeHtml(m.account) + '</button></td><td>' + row.active_point + '</td><td>' + row.amount +
                  '</td><td>' + row.claim_time.replace(/:\d{2}$/, ':' + (10 + i * 3)) + '</td></tr>';
              }).join('') + '</tbody></table></div>',
              function () { U.closeDrawer(); },
              { mode: 'modal', wide: true, okText: '关闭', hideCancel: true }
            );
            bindDrawerMemberLinks();
          };
        });
      }
    });
  };

  Pages.moneyRainReport = function (root) {
    mountList(root, {
      title: '金钱如雨报表',
      initQ: { dateFrom: '2026-08-16', dateTo: '2026-08-16' },
      filters: [{ key: 'date', label: '日期', type: 'daterange' }],
      head: ['日期', '时间段', '参加人数', '总抢金额', '操作'],
      rows: function (d, q) {
        return (d.moneyRainReports || []).filter(function (r) {
          if (q.dateFrom && r.date < q.dateFrom) return false;
          if (q.dateTo && r.date > q.dateTo) return false;
          return true;
        });
      },
      rowHtml: function (r) {
        return '<tr><td>' + U.escapeHtml(r.date) + '</td><td>' + U.escapeHtml(r.task_times) +
          '</td><td>' + r.user_num + '</td><td>' + Number(r.total_money).toFixed(2) +
          '</td><td class="col-ops sticky-r"><button class="op-link" type="button" data-detail="' +
          U.escapeHtml(r._id) + '">详情</button></td></tr>';
      },
      bind: function (root, d) {
        $$ (root, '[data-detail]').forEach(function (b) {
          b.onclick = function () {
            var row = (d.moneyRainReports || []).filter(function (x) { return x._id === b.getAttribute('data-detail'); })[0];
            if (!row) return;
            var kids = row.children || [];
            U.openDrawer('领取明细',
              arcoDesc([
                { label: '日期', value: row.date },
                { label: '时间段', value: row.task_times },
                { label: '参加人数', value: row.user_num },
                { label: '总抢金额', value: Number(row.total_money).toFixed(2) }
              ]) +
              '<p class="page-tip" style="margin-top:12px">以下为演示抽样会员，完整名单以正式报表为准。</p>' +
              '<div class="table-wrap"><table class="list-table"><thead><tr><th>会员账户</th><th>抢到金额</th><th>领取时间</th></tr></thead><tbody>' +
              (kids.length ? kids.map(function (c) {
                return '<tr><td><button class="op-link acc-link" type="button" data-go-member="' +
                  U.escapeHtml(c.account) + '">' + U.escapeHtml(c.account) + '</button></td><td>' +
                  Number(c.amount).toFixed(2) + '</td><td>' + U.escapeHtml(c.at) + '</td></tr>';
              }).join('') : emptyRow(3)) +
              '</tbody></table></div>',
              function () { U.closeDrawer(); },
              { mode: 'modal', wide: true, okText: '关闭', hideCancel: true }
            );
            bindDrawerMemberLinks();
          };
        });
      }
    });
  };

  var KEEP = {
    dashboard: 1, members: 1, memberDetail: 1, deposits: 1, withdraws: 1,
    manualIn: 1, manualOut: 1, ledger: 1, reclaim: 1, qrph: 1, kyc: 1,
    games: 1, vendors: 1, maintain: 1, activity: 1, codes: 1, groups: 1,
    tiers: 1, depChannels: 1, wdChannels: 1, userLayer: 1,
    taskDailyTask: 1, taskDailyTaskReport: 1, moneyRainReport: 1, layer: 1, layerReport: 1,
    ops: 1, bonusReport: 1
  };
  Object.keys(global.AdminCatalog || {}).forEach(function (id) {
    if (KEEP[id]) return;
    var fn = catalogPage(id);
    if (fn) Pages[id] = fn;
  });

  global.AdminPages = Pages;
})(window);
