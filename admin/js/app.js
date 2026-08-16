(function () {
  'use strict';

  function parseHash() {
    var raw = (location.hash || '#/dashboard').replace(/^#\/?/, '');
    var parts = raw.split('?');
    var id = parts[0] || 'dashboard';
    var q = {};
    if (parts[1]) {
      parts[1].split('&').forEach(function (p) {
        var kv = p.split('=');
        q[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      });
    }
    return { id: id, q: q };
  }

  function renderDemo() {
    var bar = document.getElementById('demoBar');
    if (!bar) return;
    var d = AdminStore.load();
    bar.innerHTML =
      '<span>演示</span>' +
      '<button type="button" id="btnFail"' + (d.demo.failApi ? ' class="on"' : '') + '>接口失败</button>' +
      '<button type="button" id="btnEmpty"' + (d.demo.empty ? ' class="on"' : '') + '>空数据</button>' +
      '<button type="button" id="btnReset">重置数据</button>';
    document.getElementById('btnFail').onclick = function () {
      var data = AdminStore.load();
      data.demo.failApi = !data.demo.failApi;
      AdminStore.save(data);
      render();
    };
    document.getElementById('btnEmpty').onclick = function () {
      var data = AdminStore.load();
      data.demo.empty = !data.demo.empty;
      AdminStore.save(data);
      render();
    };
    document.getElementById('btnReset').onclick = function () {
      AdminStore.reset();
      AdminShell.toast('演示数据已重置');
      render();
    };
  }

  document.addEventListener('click', function () {
    var drop = document.getElementById('userDrop');
    if (drop) drop.classList.remove('open');
  });

  function render() {
    var sess = AdminStore.ensureDemoSession();
    var route = parseHash();
    var id = AdminPages[route.id] ? route.id : 'dashboard';
    AdminShell.renderSidebar(id);
    AdminShell.renderHeader(id);
    renderDemo();
    var page = document.getElementById('page');
    if (!AdminStore.can(id)) {
      page.innerHTML = '<div class="deny"><b>无权限</b>当前角色「' + AdminStore.ROLES[sess.role].label + '」不能访问本页。</div>';
      return;
    }
    AdminPages[id](page, route.q);
  }

  window.addEventListener('hashchange', render);
  if (!location.hash) location.hash = '#/dashboard';
  else render();
})();
