// 알림함 — 성당에서 보낸 알림을 홈페이지 안에도 목록으로 남겨서,
// 푸시 알림을 못 받는 분(아이폰 등)도 볼 수 있고, 각자 필요 없는 건 지울 수 있게 한다.
// 목록은 서버(D1)에서 받아오며, 알림함을 열 때·화면으로 돌아올 때·새 알림이 올 때 다시 받아온다.
(function () {
  const I18N = window.I18N || { lang: 'ko', locale: 'ko-KR', t: (key, ko) => ko };
  const bellBtns = document.querySelectorAll('.notif-bell');
  const panel = document.getElementById('notifPanel');
  const listEl = document.getElementById('notifList');
  const emptyEl = document.getElementById('notifEmpty');
  if (!bellBtns.length || !panel || !listEl) return;

  const DISMISSED_KEY = 'seohakdong-dismissed-notifs';

  function getDismissed() {
    try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')); }
    catch (e) { return new Set(); }
  }
  function addDismissed(id) {
    const set = getDismissed();
    set.add(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
  }

  function formatDate(iso) {
    const date = iso ? new Date(iso) : null;
    if (!date || Number.isNaN(date.getTime())) return '';
    return date.toLocaleString(I18N.locale, { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  let items = [];

  function renderList() {
    const dismissed = getDismissed();
    const visible = items.filter((it) => !dismissed.has(it.id));
    listEl.innerHTML = '';
    emptyEl.hidden = visible.length > 0;
    visible.forEach((it) => {
      const li = document.createElement('li');
      li.className = 'notif-item';
      const body = document.createElement('div');
      body.className = 'notif-item-body';
      body.innerHTML = '<strong class="notif-item-title"></strong><p class="notif-item-text"></p><span class="notif-item-date"></span>';
      body.querySelector('.notif-item-title').textContent = it.title;
      body.querySelector('.notif-item-text').textContent = it.body;
      body.querySelector('.notif-item-date').textContent = formatDate(it.createdAt);
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'notif-item-del';
      delBtn.setAttribute('aria-label', I18N.t('notif_delete', '이 알림 지우기'));
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => {
        addDismissed(it.id);
        renderList();
        updateBadge();
        // 홈페이지 알림함에서 지우면 휴대폰 알림함(시스템 알림)에 남아있는 실제 알림도 같이 닫아서,
        // 홈 화면 아이콘 배지 숫자도 같이 줄어들게 한다
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration('service-worker.js').then((reg) => {
            if (reg && reg.active) reg.active.postMessage({ type: 'CLOSE_NOTIFICATION', id: it.id });
          }).catch(() => {});
        }
      });
      li.appendChild(body);
      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  }

  // 배지 숫자 = 지우지 않고 알림함에 남아있는 알림 개수 (읽었는지 여부와 무관)
  function updateBadge() {
    const dismissed = getDismissed();
    const remaining = items.filter((it) => !dismissed.has(it.id)).length;
    bellBtns.forEach((b) => {
      const badge = b.querySelector('.notif-bell-badge');
      if (!badge) return;
      badge.textContent = remaining > 9 ? '9+' : String(remaining);
      badge.hidden = remaining === 0;
    });
    // 홈 화면에 추가한 경우, 앱 아이콘에도 카톡처럼 숫자 배지를 띄운다 (지원하는 브라우저에서만)
    if (navigator.setAppBadge) {
      try {
        if (remaining > 0) navigator.setAppBadge(remaining);
        else navigator.clearAppBadge();
      } catch (e) { /* 지원 안 하는 환경은 조용히 무시 */ }
    }
  }

  let loading = null;
  function load() {
    if (loading) return loading;
    loading = fetch('/api/announcements', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        items = data.items || [];
        updateBadge();
        if (panel.classList.contains('open')) renderList();
      })
      .catch((err) => console.error('알림함 불러오기 실패', err))
      .finally(() => { loading = null; });
    return loading;
  }

  function openPanel() {
    renderList();
    panel.classList.add('open');
    load();
  }
  function closePanel() { panel.classList.remove('open'); }

  bellBtns.forEach((b) => b.addEventListener('click', openPanel));
  const closeBtn = document.getElementById('notifPanelClose');
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });

  // 다른 앱을 보다가 돌아왔을 때, 그리고 화면을 보는 중에 새 알림(푸시)이 왔을 때 다시 받아온다
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') load(); });
  window.addEventListener('seohakdong:notification', load);

  load();
})();
