// 웹 푸시 알림 — 전달사항(공지)이 있을 때 신자분들 휴대폰으로 알림을 보내는 기능
(function () {
  const btn = document.getElementById('pushAppBtn');
  const label = document.getElementById('pushAppBtnLabel');
  const modal = document.getElementById('pushModal');
  if (!btn || !modal) return;

  const STORAGE_KEY = 'seohakdong-push-subscribed';

  const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey !== 'REPLACE_ME'
    && window.FIREBASE_VAPID_KEY && window.FIREBASE_VAPID_KEY !== 'REPLACE_ME';
  if (!supported) { btn.remove(); return; }

  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isInApp = /kakaotalk|naver\(|instagram|fban|fbav|everytimeapp|band\//i.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function openModal(which) {
    ['pushGuideIOS', 'pushGuideDenied', 'pushGuideInApp'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.hidden = id !== which;
    });
    modal.classList.add('open');
  }
  function closeModal() { modal.classList.remove('open'); }
  const closeBtn = document.getElementById('pushModalClose');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  const defaultLabel = label.textContent;
  function setLabel(text, temporary) {
    label.textContent = text;
    if (temporary) setTimeout(() => { label.textContent = subscribedNow() ? '알림 받는 중 ✓' : defaultLabel; }, 2200);
  }
  function subscribedNow() { return localStorage.getItem(STORAGE_KEY) === '1'; }
  function reflectState() {
    btn.classList.toggle('is-subscribed', subscribedNow());
    label.textContent = subscribedNow() ? '알림 받는 중 ✓' : defaultLabel;
  }
  reflectState();

  let firebaseApp = null;
  function getFirebaseApp() {
    if (!firebaseApp) firebaseApp = firebase.initializeApp(window.FIREBASE_CONFIG);
    return firebaseApp;
  }

  // 브라우저 탭이 열려 화면에 떠 있는 상태(포그라운드)에서 알림이 오면
  // 서비스워커의 백그라운드 처리기가 아니라 이 리스너로 전달되므로,
  // 여기서도 똑같이 실제 알림창을 띄워줘야 놓치지 않는다.
  let listeningForMessages = false;
  function listenForForegroundMessages(messaging) {
    if (listeningForMessages) return;
    listeningForMessages = true;
    messaging.onMessage((payload) => {
      const title = (payload.notification && payload.notification.title) || '서학동성당';
      const body = (payload.notification && payload.notification.body) || '';
      const id = payload.data && payload.data.announcementId;
      navigator.serviceWorker.getRegistration('service-worker.js').then((reg) => {
        if (reg) reg.showNotification(title, { body, icon: 'assets/img/icons/icon-192.png', tag: id, data: { id } });
      });
      setLabel(`🔔 ${title}`, true);
    });
  }

  // 이미 구독 중인 상태로 페이지를 새로고침한 경우에도 포그라운드 알림을 받을 수 있도록 준비해두고,
  // 서비스워커가 갱신되면서 예전 토큰이 만료되는 경우가 있어 매번 토큰을 다시 확인해 저장해둔다
  if (subscribedNow() && Notification.permission === 'granted') {
    navigator.serviceWorker.register('service-worker.js').then(async (reg) => {
      getFirebaseApp();
      const messaging = firebase.messaging();
      listenForForegroundMessages(messaging);
      try {
        // getToken()은 기존 구독이 남아있으면 캐시된(어쩌면 이미 만료된) 토큰을 그대로 돌려주므로,
        // 먼저 지워서 매번 진짜 새 토큰을 강제로 발급받는다
        await messaging.deleteToken().catch(() => {});
        const token = await messaging.getToken({ vapidKey: window.FIREBASE_VAPID_KEY, serviceWorkerRegistration: reg });
        if (token) {
          await firebase.firestore().collection('push_tokens').doc(token).set({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            ua: navigator.userAgent
          });
        }
      } catch (err) {
        console.error('토큰 갱신 실패', err);
      }
    }).catch(() => {});
  }

  async function subscribe() {
    if (isInApp) { openModal('pushGuideInApp'); return; }
    if (isIOS && !isStandalone) { openModal('pushGuideIOS'); return; }
    if (Notification.permission === 'denied') { openModal('pushGuideDenied'); return; }

    setLabel('알림 켜는 중…');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { reflectState(); return; }

      const reg = await navigator.serviceWorker.register('service-worker.js');
      await navigator.serviceWorker.ready;

      getFirebaseApp();
      const messaging = firebase.messaging();
      const token = await messaging.getToken({
        vapidKey: window.FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: reg
      });
      if (!token) throw new Error('토큰 발급 실패');

      const db = firebase.firestore();
      await db.collection('push_tokens').doc(token).set({
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        ua: navigator.userAgent
      });

      localStorage.setItem(STORAGE_KEY, '1');
      setLabel('알림 받는 중 ✓', true);
      btn.classList.add('is-subscribed');

      listenForForegroundMessages(messaging);
    } catch (err) {
      console.error(err);
      setLabel('알림 켜기 실패, 다시 눌러주세요', true);
    }
  }

  async function unsubscribe() {
    try {
      getFirebaseApp();
      const messaging = firebase.messaging();
      const reg = await navigator.serviceWorker.getRegistration('service-worker.js');
      const token = await messaging.getToken({ vapidKey: window.FIREBASE_VAPID_KEY, serviceWorkerRegistration: reg }).catch(() => null);
      if (token) {
        await firebase.firestore().collection('push_tokens').doc(token).delete().catch(() => {});
        await messaging.deleteToken().catch(() => {});
      }
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      btn.classList.remove('is-subscribed');
      setLabel('🔕 알림 꺼짐', true);
    }
  }

  btn.addEventListener('click', () => {
    if (subscribedNow()) unsubscribe();
    else subscribe();
  });
})();
