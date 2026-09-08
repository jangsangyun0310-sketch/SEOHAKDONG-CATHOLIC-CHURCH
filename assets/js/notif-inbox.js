// 알림함 — 성당에서 보낸 알림을 홈페이지 안에도 목록으로 남겨서,
// 푸시 알림을 못 받는 분(아이폰 등)도 볼 수 있고, 각자 필요 없는 건 지울 수 있게 한다.
(function () {
  const bellBtns = document.querySelectorAll('.notif-bell');
  const panel = document.getElementById('notifPanel');
  const listEl = document.getElementById('notifList');
  const emptyEl = document.getElementById('notifEmpty');
  if (!bellBtns.length || !panel || !listEl) return;

  const supported = window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey !== 'REPLACE_ME';
  if (!supported) { bellBtns.forEach((b) => b.remove()); return; }

  const DISMISSED_KEY = 'seohakdong-dismissed-notifs';
  const LAST_VIEWED_KEY = 'seohakdong-notif-last-viewed';

  function getDismissed() {
    try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')); }
    catch (e) { return new Set(); }
  }
  function addDismissed(id) {
    const set = getDismissed();
    set.add(id);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
  }
  function getLastViewed() {
    return Number(localStorage.getItem(LAST_VIEWED_KEY) || 0);
  }

  function getFirebaseApp() {
    return firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(window.FIREBASE_CONFIG);
  }

  function formatDate(date) {
    if (!date) return '';
    return date.toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
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
      body.innerHTML = `<strong class="notif-item-title"></strong><p class="notif-item-text"></p><span class="notif-item-date"></span>`;
      body.querySelector('.notif-item-title').textContent = it.title;
      body.querySelector('.notif-item-text').textContent = it.body;
      body.querySelector('.notif-item-date').textContent = formatDate(it.createdAt);
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'notif-item-del';
      delBtn.setAttribute('aria-label', '이 알림 지우기');
      delBtn.textContent = '✕';
      delBtn.addEventListener('click', () => {
        addDismissed(it.id);
        renderList();
      });
      li.appendChild(body);
      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  }

  function updateBadge() {
    const dismissed = getDismissed();
    const lastViewed = getLastViewed();
    const hasUnread = items.some((it) => !dismissed.has(it.id) && it.createdAt && it.createdAt.getTime() > lastViewed);
    bellBtns.forEach((b) => {
      const badge = b.querySelector('.notif-bell-badge');
      if (badge) badge.hidden = !hasUnread;
    });
  }

  function loadAnnouncements() {
    getFirebaseApp();
    return firebase.firestore().collection('announcements')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .get()
      .then((snap) => {
        items = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title || '서학동성당',
            body: d.body || '',
            createdAt: d.createdAt && d.createdAt.toDate ? d.createdAt.toDate() : null
          };
        });
        updateBadge();
      })
      .catch((err) => console.error('알림함 불러오기 실패', err));
  }

  function openPanel() {
    renderList();
    panel.classList.add('open');
    localStorage.setItem(LAST_VIEWED_KEY, String(Date.now()));
    bellBtns.forEach((b) => {
      const badge = b.querySelector('.notif-bell-badge');
      if (badge) badge.hidden = true;
    });
  }
  function closePanel() { panel.classList.remove('open'); }

  bellBtns.forEach((b) => b.addEventListener('click', openPanel));
  const closeBtn = document.getElementById('notifPanelClose');
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });

  loadAnnouncements();
})();
