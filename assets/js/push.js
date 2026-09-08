// 웹 푸시 알림 — 전달사항(공지)이 있을 때 신자분들 휴대폰으로 알림을 보내는 기능
(function () {
  const btn = document.getElementById('pushAppBtn');
  const label = document.getElementById('pushAppBtnLabel');
  const modal = document.getElementById('pushModal');
  if (!btn || !modal) return;

  const STORAGE_KEY = 'seohakdong-push-subscribed';

  const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey !== 'REPLACE_ME';
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

      messaging.onMessage((payload) => {
        const title = (payload.notification && payload.notification.title) || '서학동성당';
        const body = (payload.notification && payload.notification.body) || '';
        setLabel(`🔔 ${title}`, true);
        if (body) console.log('[알림]', title, body);
      });
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
