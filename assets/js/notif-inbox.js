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
  const SYNC_CODE_KEY = 'seohakdong-sync-code';

  function getFirebaseApp() {
    return firebase.apps.length ? firebase.apps[0] : firebase.initializeApp(window.FIREBASE_CONFIG);
  }

  // 지운 알림 목록: 코드로 다른 기기와 연결 안 했으면 이 기기(localStorage)에만,
  // 연결했으면 Firestore의 공유 문서(sync_dismissed/코드)로 관리해 여러 기기에 실시간 반영한다
  let dismissedIds = new Set();
  let syncCode = localStorage.getItem(SYNC_CODE_KEY) || null;
  let syncUnsub = null;

  function loadLocalDismissed() {
    try { return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]')); }
    catch (e) { return new Set(); }
  }
  function saveLocalDismissed(set) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
  }

  function addDismissed(id) {
    dismissedIds.add(id);
    if (syncCode) {
      getFirebaseApp();
      firebase.firestore().collection('sync_dismissed').doc(syncCode)
        .set({ ids: firebase.firestore.FieldValue.arrayUnion(id) }, { merge: true })
        .catch((err) => console.error('동기화 저장 실패', err));
    } else {
      saveLocalDismissed(dismissedIds);
    }
  }

  function startSync(code) {
    getFirebaseApp();
    if (syncUnsub) syncUnsub();
    syncUnsub = firebase.firestore().collection('sync_dismissed').doc(code)
      .onSnapshot((doc) => {
        dismissedIds = new Set((doc.exists && doc.data().ids) || []);
        renderList();
        updateBadge();
      }, (err) => console.error('동기화 감지 실패', err));
  }
  function stopSync() {
    if (syncUnsub) syncUnsub();
    syncUnsub = null;
  }

  const syncStatusEl = document.getElementById('notifSyncStatus');
  const syncBtn = document.getElementById('notifSyncBtn');
  function refreshSyncUI() {
    if (!syncStatusEl || !syncBtn) return;
    syncStatusEl.textContent = syncCode
      ? `다른 기기와 연결됨 (코드: ${syncCode})`
      : '이 기기에서만 지운 알림이 반영돼요.';
    syncBtn.textContent = syncCode ? '연결 해제' : '다른 기기와 연결';
  }
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      if (syncCode) {
        if (!confirm(`다른 기기와의 연결을 해제할까요? (코드: ${syncCode})`)) return;
        stopSync();
        syncCode = null;
        localStorage.removeItem(SYNC_CODE_KEY);
        dismissedIds = loadLocalDismissed();
        renderList();
        updateBadge();
        refreshSyncUI();
        return;
      }
      const input = prompt('다른 기기와 연결할 코드를 입력하세요.\n처음이면 아무 숫자나 4자리 이상 만들어서, 다른 기기에도 똑같이 입력해주세요.', '');
      const code = input && input.trim();
      if (!code) return;
      syncCode = code;
      localStorage.setItem(SYNC_CODE_KEY, code);
      getFirebaseApp();
      const ref = firebase.firestore().collection('sync_dismissed').doc(code);
      const existing = [...dismissedIds];
      ref.set({ ids: existing.length ? firebase.firestore.FieldValue.arrayUnion(...existing) : [] }, { merge: true })
        .catch((err) => console.error('동기화 시작 실패', err));
      startSync(code);
      refreshSyncUI();
    });
  }

  function formatDate(date) {
    if (!date) return '';
    return date.toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  let items = [];

  function renderList() {
    const visible = items.filter((it) => !dismissedIds.has(it.id));
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
    const remaining = items.filter((it) => !dismissedIds.has(it.id)).length;
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

  // 새로고침 안 하고 홈페이지를 보고 있는 중에도 새 알림이 오면 바로 배지에 반영되도록,
  // 한 번만 읽어오는 get() 대신 실시간으로 계속 지켜보는 onSnapshot()을 쓴다
  function watchAnnouncements() {
    getFirebaseApp();
    firebase.firestore().collection('announcements')
      .orderBy('createdAt', 'desc')
      .limit(30)
      .onSnapshot((snap) => {
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
        if (panel.classList.contains('open')) renderList();
      }, (err) => console.error('알림함 실시간 감지 실패', err));
  }

  function openPanel() {
    renderList();
    panel.classList.add('open');
  }
  function closePanel() { panel.classList.remove('open'); }

  bellBtns.forEach((b) => b.addEventListener('click', openPanel));
  const closeBtn = document.getElementById('notifPanelClose');
  if (closeBtn) closeBtn.addEventListener('click', closePanel);
  panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });

  dismissedIds = loadLocalDismissed();
  refreshSyncUI();
  if (syncCode) startSync(syncCode);
  watchAnnouncements();
})();
